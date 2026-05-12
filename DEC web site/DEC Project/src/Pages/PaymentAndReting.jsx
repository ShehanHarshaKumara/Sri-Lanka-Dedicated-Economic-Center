import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  BadgePercent,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  Leaf,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  User,
  WalletCards,
  XCircle
} from 'lucide-react';
import CustomerNavbar from '../components/CustomerNavbar';
import { API_BASES } from '../config/api';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=700&fit=crop';
const TAX_RATE = 0.05;
const COD_FEE = 25;

const SHIPPING_OPTIONS = [
  {
    id: 'standard',
    icon: Truck,
    name: 'Standard Delivery',
    price: 50,
    days: '3-5 business days',
    helper: 'Fresh produce delivered on a balanced schedule.'
  },
  {
    id: 'express',
    icon: Sparkles,
    name: 'Express Delivery',
    price: 100,
    days: '1-2 business days',
    helper: 'Priority dispatch for urgent household orders.'
  },
  {
    id: 'free',
    icon: Leaf,
    name: 'Free Delivery',
    price: 0,
    days: '5-7 business days',
    helper: 'A slower route with no delivery charge.'
  }
];

const formatCurrency = (value) =>
  `Rs.${(Number.isFinite(value) ? value : 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const PAYMENT_OPTIONS = [
  {
    id: 'paypal',
    icon: WalletCards,
    name: 'Paypal',
    helper: 'Coming soon',
    badge: 'PayPal',
    disabled: true
  },
  {
    id: 'card',
    icon: CreditCard,
    name: 'Credit card',
    helper: 'Pay securely using Visa, Mastercard, Discover, or American Express.',
    badge: 'Visa MC Amex',
    disabled: false
  },
  {
    id: 'wallet',
    icon: WalletCards,
    name: 'Google Pay',
    helper: 'Coming soon',
    badge: 'G Pay',
    disabled: true
  },
  {
    id: 'cod',
    icon: Banknote,
    name: 'Cash on delivery',
    helper: `Pay when the rider arrives. Includes ${formatCurrency(COD_FEE)} service fee.`,
    badge: 'Cash',
    disabled: false
  }
];

const DISCOUNT_CODES = {
  SAVE10: 0.1,
  WELCOME20: 0.2,
  FRESH15: 0.15
};

const normalizeCardNumber = (value) => value.replace(/\D/g, '').slice(0, 16);

const formatCardNumber = (value) =>
  normalizeCardNumber(value)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value.trim());
const isValidPhone = (value) => /^[0-9+\s-]{9,15}$/.test(value.trim());
const isValidExpiry = (value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
const isValidCvv = (value) => /^\d{3,4}$/.test(value);

const readStoredUser = () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const storedId = Number.parseInt(localStorage.getItem('userId') || '', 10);

    return {
      id: savedUser?.id || savedUser?.userId || (Number.isFinite(storedId) ? storedId : null),
      name:
        savedUser?.name ||
        savedUser?.fullName ||
        savedUser?.username ||
        savedUser?.first_name ||
        '',
      email: savedUser?.email || '',
      phone: savedUser?.phone || '',
      address: savedUser?.address || '',
      city: savedUser?.city || ''
    };
  } catch {
    const storedId = Number.parseInt(localStorage.getItem('userId') || '', 10);

    return {
      id: Number.isFinite(storedId) ? storedId : null,
      name: '',
      email: '',
      phone: '',
      address: '',
      city: ''
    };
  }
};

const createInitialFormState = (storedUser) => ({
  name: storedUser.name || '',
  email: storedUser.email || '',
  phone: storedUser.phone || '',
  address: storedUser.address || '',
  city: storedUser.city || '',
  zipCode: '',
  notes: '',
  cardNumber: '',
  cardName: storedUser.name || '',
  cardExpiry: '',
  cardCVV: ''
});

const buildProduct = (sourceProduct) => {
  const availableQuantity = Math.max(
    0,
    Number.parseInt(
      sourceProduct?.availableQuantity ?? sourceProduct?.stockQuantity ?? sourceProduct?.quantity,
      10
    ) || 0
  );
  const requestedQuantity = Math.max(1, Number.parseInt(sourceProduct?.selectedQuantity, 10) || 1);
  const selectedQuantity =
    availableQuantity > 0 ? Math.min(requestedQuantity, availableQuantity) : requestedQuantity;

  return {
    id: sourceProduct?.id || 1,
    name: sourceProduct?.name || 'Premium Organic Bell Pepper',
    description:
      sourceProduct?.description ||
      'Farm-fresh produce prepared for a faster, clearer, and more modern checkout experience.',
    price: Number.parseFloat(sourceProduct?.price) || 350,
    image:
      sourceProduct?.image_url ||
      sourceProduct?.image ||
      sourceProduct?.images?.[0] ||
      FALLBACK_IMAGE,
    category: sourceProduct?.category || 'Vegetables',
    seller: sourceProduct?.seller || sourceProduct?.farmerName || 'Local Farmer',
    location: sourceProduct?.location || 'Sri Lanka',
    rating: Number.parseFloat(sourceProduct?.rating) || 4.8,
    reviews: Number.parseInt(sourceProduct?.reviews, 10) || 124,
    inStock: sourceProduct?.inStock !== false && availableQuantity !== 0,
    selectedQuantity,
    availableQuantity: sourceProduct ? availableQuantity : 36,
    unit: sourceProduct?.unit || 'unit'
  };
};

const inputClass = (error) =>
  `w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
    error
      ? 'border-rose-300 bg-rose-50 focus:border-rose-500'
      : 'border-[#efd6db] bg-white focus:border-[#c84457] focus:shadow-[0_0_0_4px_rgba(200,68,87,0.10)]'
  }`;

const FormField = ({ label, error, children }) => (
  <div>
    <label className="mb-2 block text-sm font-bold text-slate-800">{label}</label>
    {children}
    {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
  </div>
);

const SummaryRow = ({ label, value, strong = false, muted = false }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className={muted ? 'text-slate-400' : 'text-slate-600'}>{label}</span>
    <span className={strong ? 'text-lg font-black text-slate-950' : 'font-bold text-slate-950'}>
      {value}
    </span>
  </div>
);

const Stepper = ({ isComplete, detailsReady }) => {
  const steps = [
    {
      label: 'Personal details',
      state: detailsReady || isComplete ? 'complete' : 'active'
    },
    {
      label: 'Payment',
      state: isComplete ? 'complete' : 'active'
    },
    {
      label: 'Complete',
      state: isComplete ? 'active' : 'idle'
    }
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
      {steps.map((step, index) => {
        const active = step.state === 'active';
        const complete = step.state === 'complete';

        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                  complete
                    ? 'bg-[#c84457] text-white'
                    : active
                      ? 'border border-[#c84457] bg-white text-[#c84457]'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {complete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={`text-sm font-bold ${
                  active || complete ? 'text-slate-950' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="hidden h-px w-20 bg-[#e7cbd1] sm:block" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const PaymentAndReting = ({
  product: propProduct,
  onBack,
  onNavigateToHome,
  onNavigateToProducts,
  onNavigateToSellers,
  onNavigateToMap,
  onNavigateToMessages
}) => {
  const product = useMemo(() => buildProduct(propProduct), [propProduct]);
  const storedUser = useMemo(() => readStoredUser(), []);
  const initialFormState = useMemo(() => createInitialFormState(storedUser), [storedUser]);

  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [quantity, setQuantity] = useState(product.selectedQuantity);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [discountInput, setDiscountInput] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [inventoryNotice, setInventoryNotice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [placedAt, setPlacedAt] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    setQuantity(product.selectedQuantity);
  }, [product.selectedQuantity]);

  const selectedShipping = useMemo(
    () => SHIPPING_OPTIONS.find((option) => option.id === shippingMethod) || SHIPPING_OPTIONS[0],
    [shippingMethod]
  );

  const outOfStock = !product.inStock || product.availableQuantity <= 0;
  const quantityLimitReached =
    product.availableQuantity > 0 && quantity >= product.availableQuantity;
  const discountRate = DISCOUNT_CODES[appliedDiscountCode] || 0;

  const pricing = useMemo(() => {
    const subtotal = Number.parseFloat((product.price * quantity).toFixed(2));
    const discount = Number.parseFloat((subtotal * discountRate).toFixed(2));
    const shippingCost = Number.parseFloat(selectedShipping.price.toFixed(2));
    const codFee = paymentMethod === 'cod' ? COD_FEE : 0;
    const taxableAmount = Math.max(subtotal - discount, 0);
    const tax = Number.parseFloat((taxableAmount * TAX_RATE).toFixed(2));
    const total = Number.parseFloat((taxableAmount + shippingCost + codFee + tax).toFixed(2));

    return {
      subtotal,
      discount,
      shippingCost,
      codFee,
      tax,
      total
    };
  }, [discountRate, paymentMethod, product.price, quantity, selectedShipping.price]);

  const detailsReady =
    Boolean(formData.name.trim()) &&
    isValidEmail(formData.email) &&
    isValidPhone(formData.phone) &&
    Boolean(formData.address.trim()) &&
    Boolean(formData.city.trim()) &&
    Boolean(formData.zipCode.trim());

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === 'cardNumber') {
      nextValue = formatCardNumber(value);
    }

    if (name === 'cardExpiry') {
      nextValue = formatExpiry(value);
    }

    if (name === 'cardCVV') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleQuantityChange = (delta) => {
    if (outOfStock) {
      setInventoryNotice('This item is currently out of stock.');
      return;
    }

    setQuantity((prev) => {
      const nextValue = Math.max(1, prev + delta);
      const cappedValue = Math.min(nextValue, product.availableQuantity);

      if (cappedValue !== nextValue) {
        setInventoryNotice(
          `Only ${product.availableQuantity} ${product.unit} available for this checkout.`
        );
      } else {
        setInventoryNotice('');
      }

      return cappedValue;
    });
  };

  const handleApplyDiscount = () => {
    const normalizedCode = discountInput.trim().toUpperCase();

    if (!normalizedCode) {
      setAppliedDiscountCode('');
      setDiscountMessage({ type: 'error', text: 'Enter a coupon code before applying.' });
      return;
    }

    if (!DISCOUNT_CODES[normalizedCode]) {
      setAppliedDiscountCode('');
      setDiscountMessage({
        type: 'error',
        text: 'Coupon not found. Try SAVE10, WELCOME20, or FRESH15.'
      });
      return;
    }

    setAppliedDiscountCode(normalizedCode);
    setDiscountMessage({
      type: 'success',
      text: `${normalizedCode} applied. Your discount is in the total.`
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = 'Enter a valid contact number.';
    }

    if (!formData.address.trim()) {
      errors.address = 'Delivery address is required.';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required.';
    }

    if (!formData.zipCode.trim()) {
      errors.zipCode = 'Postal code is required.';
    }

    if (paymentMethod === 'card') {
      if (normalizeCardNumber(formData.cardNumber).length !== 16) {
        errors.cardNumber = 'Enter a valid 16-digit card number.';
      }

      if (!formData.cardName.trim()) {
        errors.cardName = 'Cardholder name is required.';
      }

      if (!isValidExpiry(formData.cardExpiry)) {
        errors.cardExpiry = 'Use MM/YY format.';
      }

      if (!isValidCvv(formData.cardCVV)) {
        errors.cardCVV = 'Enter a valid CVV.';
      }
    }

    if (!termsAccepted) {
      errors.terms = 'Accept the checkout terms before paying.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();

    if (outOfStock) {
      setSubmitError('This product is currently out of stock, so the order cannot be placed yet.');
      return;
    }

    if (quantity > product.availableQuantity) {
      setSubmitError(`Only ${product.availableQuantity} ${product.unit} are available right now.`);
      return;
    }

    if (!validateForm()) {
      setSubmitError('Please complete the highlighted checkout details before placing the order.');
      return;
    }

    setIsProcessing(true);
    setSubmitError('');

    const orderPayload = {
      userId: storedUser.id,
      customer: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        zipCode: formData.zipCode.trim(),
        notes: formData.notes.trim()
      },
      items: [
        {
          productId: product.id,
          quantity,
          price: product.price
        }
      ],
      shippingMethod,
      paymentMethod,
      paymentDetails:
        paymentMethod === 'card'
          ? {
              cardNumber: normalizeCardNumber(formData.cardNumber),
              cardName: formData.cardName.trim(),
              cardExpiry: formData.cardExpiry,
              cardCVV: formData.cardCVV
            }
          : null,
      discountCode: appliedDiscountCode
    };

    try {
      const response = await fetch(`${API_BASES.payments}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Order creation failed.');
      }

      const now = new Intl.DateTimeFormat('en-LK', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date());

      setOrderNumber(data.orderNumber || `ORD-${String(data.orderId || '').padStart(6, '0')}`);
      setPlacedAt(now);
      setPlacedOrder({
        customerName: formData.name.trim(),
        shippingName: selectedShipping.name,
        shippingDays: selectedShipping.days,
        paymentMethod: paymentMethod === 'card' ? 'Card payment' : 'Cash on delivery',
        quantity,
        totals: data.totals || pricing,
        address: `${formData.address.trim()}, ${formData.city.trim()}, ${formData.zipCode.trim()}`
      });
      setPaymentSuccess(true);
    } catch (error) {
      setSubmitError(error.message || 'Order creation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCheckout = () => {
    setFormData(initialFormState);
    setFieldErrors({});
    setQuantity(product.selectedQuantity);
    setShippingMethod('standard');
    setPaymentMethod('card');
    setDiscountInput('');
    setAppliedDiscountCode('');
    setDiscountMessage(null);
    setTermsAccepted(true);
    setSubmitError('');
    setInventoryNotice('');
    setIsProcessing(false);
    setPaymentSuccess(false);
    setOrderNumber('');
    setPlacedAt('');
    setPlacedOrder(null);
  };

  const renderSuccessScreen = () => (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
      <div className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[0_28px_90px_rgba(105,34,49,0.14)] sm:rounded-[2.4rem] sm:p-7 lg:p-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ffe4e9] text-[#c84457]">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.26em] text-[#c84457]">
          Complete
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
          Payment completed and your order is ready for fulfillment.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          Your order <span className="font-black text-slate-950">{orderNumber}</span> was placed
          at {placedAt}. The seller can now prepare the item for delivery.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl bg-[#fff5f6] p-5">
            <User className="h-6 w-6 text-[#c84457]" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Customer
            </p>
            <p className="mt-2 font-bold text-slate-950">{placedOrder.customerName}</p>
          </div>
          <div className="rounded-3xl bg-[#fff5f6] p-5">
            <Truck className="h-6 w-6 text-[#c84457]" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Delivery
            </p>
            <p className="mt-2 font-bold text-slate-950">{placedOrder.shippingName}</p>
          </div>
          <div className="rounded-3xl bg-[#fff5f6] p-5">
            <CreditCard className="h-6 w-6 text-[#c84457]" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Payment
            </p>
            <p className="mt-2 font-bold text-slate-950">{placedOrder.paymentMethod}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onNavigateToProducts || onBack}
            className="rounded-full bg-[#c84457] px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#aa3043]"
          >
            Continue shopping
          </button>
          <button
            type="button"
            onClick={resetCheckout}
            className="rounded-full border border-[#ead0d6] bg-white px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-slate-900 transition hover:border-[#c84457] hover:text-[#c84457]"
          >
            Place another order
          </button>
        </div>
      </div>

      <aside className="rounded-[1.5rem] border border-[#f0d7dd] bg-[linear-gradient(160deg,#fff_0%,#fff4f6_56%,#ffe5eb_100%)] p-5 shadow-[0_22px_70px_rgba(105,34,49,0.12)] sm:rounded-[2.4rem] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
          Order receipt
        </p>
        <h2 className="mt-3 text-2xl font-black text-slate-950">{orderNumber}</h2>
        <div className="mt-6 flex items-center gap-3 rounded-[1.4rem] bg-white p-3 shadow-sm sm:gap-4 sm:rounded-[1.7rem] sm:p-4">
          <img
            src={product.image}
            alt={product.name}
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-black text-slate-950">{product.name}</p>
            <p className="mt-1 text-sm text-slate-500">Qty {placedOrder.quantity}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <SummaryRow label="Subtotal" value={formatCurrency(placedOrder.totals.subtotal)} />
          {placedOrder.totals.discount > 0 && (
            <SummaryRow label="Discount" value={`- ${formatCurrency(placedOrder.totals.discount)}`} />
          )}
          <SummaryRow label="Shipping" value={formatCurrency(placedOrder.totals.shippingCost)} />
          {placedOrder.totals.codFee > 0 && (
            <SummaryRow label="COD fee" value={formatCurrency(placedOrder.totals.codFee)} />
          )}
          <SummaryRow label="Tax" value={formatCurrency(placedOrder.totals.tax)} />
          <div className="border-t border-[#efd6db] pt-4">
            <SummaryRow strong label="Total" value={formatCurrency(placedOrder.totals.total)} />
          </div>
        </div>
      </aside>
    </section>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[linear-gradient(135deg,#e8e5e7_0%,#f9eef1_45%,#f7dadf_100%)] text-slate-900">
      <CustomerNavbar
        isScrolled
        onNavigateToHome={onNavigateToHome || onBack}
        onNavigateToProducts={onNavigateToProducts || onBack}
        onNavigateToSellers={onNavigateToSellers}
        onNavigateToMap={onNavigateToMap}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToAbout={onNavigateToHome || onBack}
      />

      <main className="relative min-h-screen w-full px-0 pb-0 pt-20 sm:pt-24">
        <div className="pointer-events-none absolute left-[-8rem] top-20 h-80 w-80 rounded-full bg-[#ffccd4]/45 blur-3xl" />
        <div className="pointer-events-none absolute right-[-10rem] top-24 h-[28rem] w-[28rem] rounded-full bg-[#d66073]/25 blur-3xl" />

        <div className="relative min-h-[calc(100vh-5rem)] w-full bg-[#f8f8f8]/94 shadow-[0_35px_100px_rgba(77,39,49,0.14)] backdrop-blur-xl sm:min-h-[calc(100vh-6rem)]">
          <header className="flex flex-col gap-4 border-b border-slate-200/80 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-10">
            <button
              type="button"
              onClick={onNavigateToHome || onBack}
              className="flex items-center gap-3 text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#c84457_0%,#ffa5b2_100%)] text-white shadow-lg shadow-rose-200">
                <Leaf className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.24em] text-[#c84457]">
                  DEC
                </span>
                <span className="block text-2xl font-black tracking-tight text-slate-950">
                  market.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="self-start text-sm font-black text-[#b23548] underline decoration-[#e9a9b4] underline-offset-4 transition hover:text-[#8f2637] sm:self-auto"
            >
              Cancel Booking
            </button>
          </header>

          <section className="px-3 py-5 sm:px-6 sm:py-8 lg:px-10 xl:px-14">
            <Stepper isComplete={paymentSuccess} detailsReady={detailsReady} />

            {paymentSuccess && placedOrder ? (
              <div className="mt-6 sm:mt-10">{renderSuccessScreen()}</div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="mt-6 space-y-5 sm:mt-10 sm:space-y-6">
                <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px] xl:gap-6">
                  <div className="space-y-5 sm:space-y-6">
                    <div className="rounded-[1.35rem] border border-white bg-white p-4 shadow-[0_18px_55px_rgba(105,34,49,0.08)] sm:rounded-[1.8rem] sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c84457]">
                            Personal details
                          </p>
                          <h1 className="mt-2 text-2xl font-black text-slate-950">
                            Delivery contact
                          </h1>
                          <p className="mt-1 text-sm text-slate-500">
                            Confirm the customer details before payment.
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                            detailsReady
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-[#fff1f3] text-[#c84457]'
                          }`}
                        >
                          {detailsReady ? <BadgeCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                          {detailsReady ? 'Ready' : 'Needs details'}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <FormField label="Full name" error={fieldErrors.name}>
                          <input
                            name="name"
                            value={formData.name}
                            onChange={handleFieldChange}
                            className={inputClass(Boolean(fieldErrors.name))}
                            placeholder="Customer name"
                          />
                        </FormField>
                        <FormField label="Email" error={fieldErrors.email}>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFieldChange}
                            className={inputClass(Boolean(fieldErrors.email))}
                            placeholder="customer@example.com"
                          />
                        </FormField>
                        <FormField label="Phone" error={fieldErrors.phone}>
                          <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleFieldChange}
                            className={inputClass(Boolean(fieldErrors.phone))}
                            placeholder="+94 77 123 4567"
                          />
                        </FormField>
                        <FormField label="City" error={fieldErrors.city}>
                          <input
                            name="city"
                            value={formData.city}
                            onChange={handleFieldChange}
                            className={inputClass(Boolean(fieldErrors.city))}
                            placeholder="Colombo"
                          />
                        </FormField>
                        <div className="md:col-span-2">
                          <FormField label="Delivery address" error={fieldErrors.address}>
                            <input
                              name="address"
                              value={formData.address}
                              onChange={handleFieldChange}
                              className={inputClass(Boolean(fieldErrors.address))}
                              placeholder="Street address and landmark"
                            />
                          </FormField>
                        </div>
                        <FormField label="Postal code" error={fieldErrors.zipCode}>
                          <input
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleFieldChange}
                            className={inputClass(Boolean(fieldErrors.zipCode))}
                            placeholder="00100"
                          />
                        </FormField>
                        <FormField label="Delivery notes" error={fieldErrors.notes}>
                          <input
                            name="notes"
                            value={formData.notes}
                            onChange={handleFieldChange}
                            className={inputClass(Boolean(fieldErrors.notes))}
                            placeholder="Optional rider instructions"
                          />
                        </FormField>
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white bg-white p-4 shadow-[0_18px_55px_rgba(105,34,49,0.08)] sm:rounded-[1.8rem] sm:p-6">
                      <h2 className="text-2xl font-black text-slate-950">Select Payment Option</h2>
                      <p className="mt-2 text-sm text-slate-500">
                        All transactions are secure and encrypted.
                      </p>

                      <div className="mt-6 space-y-4">
                        {PAYMENT_OPTIONS.map((option) => {
                          const OptionIcon = option.icon;
                          const selected = paymentMethod === option.id;

                          return (
                            <div
                              key={option.id}
                              className={`overflow-hidden rounded-2xl border transition-all ${
                                selected
                                  ? 'border-[#d9596d] bg-[#fff7f8] shadow-[0_16px_45px_rgba(200,68,87,0.12)]'
                                  : option.disabled
                                    ? 'border-slate-200 bg-slate-50 opacity-70'
                                    : 'border-slate-200 bg-white hover:border-[#e5aab4] hover:bg-[#fff9fa]'
                              }`}
                            >
                              <button
                                type="button"
                                disabled={option.disabled}
                                onClick={() => {
                                  setPaymentMethod(option.id);
                                  setFieldErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.cardNumber;
                                    delete next.cardName;
                                    delete next.cardExpiry;
                                    delete next.cardCVV;
                                    return next;
                                  });
                                }}
                                className="w-full p-4 text-left disabled:cursor-not-allowed"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                        selected ? 'border-[#c84457]' : 'border-slate-300'
                                      }`}
                                    >
                                      {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#c84457]" />}
                                    </span>
                                    <div>
                                      <p className="font-bold text-slate-950">{option.name}</p>
                                      <p className="mt-1 text-xs text-slate-500">{option.helper}</p>
                                    </div>
                                  </div>
                                  <span className="inline-flex self-start items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#b53b4f] shadow-sm sm:self-auto">
                                    <OptionIcon className="h-4 w-4" />
                                    {option.badge}
                                  </span>
                                </div>
                              </button>

                              {selected && paymentMethod === 'card' && (
                                <div className="border-t border-slate-200 px-4 pb-4 pt-5">
                                  <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    <span className="rounded-full bg-slate-100 px-3 py-1">Visa</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1">Mastercard</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1">Discover</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1">Amex</span>
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                      <FormField label="Card Number" error={fieldErrors.cardNumber}>
                                        <input
                                          name="cardNumber"
                                          value={formData.cardNumber}
                                          onChange={handleFieldChange}
                                          className={inputClass(Boolean(fieldErrors.cardNumber))}
                                          placeholder="1234 1234 1234 1234"
                                          inputMode="numeric"
                                        />
                                      </FormField>
                                    </div>
                                    <FormField label="Name on card" error={fieldErrors.cardName}>
                                      <input
                                        name="cardName"
                                        value={formData.cardName}
                                        onChange={handleFieldChange}
                                        className={inputClass(Boolean(fieldErrors.cardName))}
                                        placeholder="Card name"
                                      />
                                    </FormField>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      <FormField label="Expire date" error={fieldErrors.cardExpiry}>
                                        <input
                                          name="cardExpiry"
                                          value={formData.cardExpiry}
                                          onChange={handleFieldChange}
                                          className={inputClass(Boolean(fieldErrors.cardExpiry))}
                                          placeholder="MM / YY"
                                          inputMode="numeric"
                                        />
                                      </FormField>
                                      <FormField label="CVV" error={fieldErrors.cardCVV}>
                                        <input
                                          name="cardCVV"
                                          value={formData.cardCVV}
                                          onChange={handleFieldChange}
                                          className={inputClass(Boolean(fieldErrors.cardCVV))}
                                          placeholder="CVV"
                                          inputMode="numeric"
                                        />
                                      </FormField>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing || outOfStock}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#c84457_0%,#ef6b7e_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_35px_rgba(200,68,87,0.24)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          <>
                            {paymentMethod === 'card' ? 'Pay' : 'Place order'} |{' '}
                            {formatCurrency(pricing.total)}
                          </>
                        )}
                      </button>

                      <label className="mt-5 flex items-start justify-center gap-3 text-center text-xs font-medium text-slate-500">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(event) => {
                            setTermsAccepted(event.target.checked);
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.terms;
                              return next;
                            });
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#c84457]"
                        />
                        <span>
                          By clicking this, I agree to DEC Market Terms and Conditions and Privacy
                          Policy.
                        </span>
                      </label>
                      {fieldErrors.terms && (
                        <p className="mt-2 text-center text-xs font-semibold text-rose-600">
                          {fieldErrors.terms}
                        </p>
                      )}
                    </div>
                  </div>

                  <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
                    <div className="overflow-hidden rounded-[1.35rem] border border-[#eebdc6] bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.9),_transparent_35%),linear-gradient(160deg,#fff_0%,#fff4f6_48%,#ffe5eb_100%)] p-4 shadow-[0_18px_60px_rgba(105,34,49,0.11)] sm:rounded-[1.8rem] sm:p-6">
                      <div className="flex items-center justify-between border-b border-[#efd6db] pb-5">
                        <h2 className="text-2xl font-black text-slate-950">Your cart</h2>
                        <span className="rounded-full bg-[#fff0f3] px-3 py-1 text-sm font-black text-[#c84457]">
                          1
                        </span>
                      </div>

                      <div className="mt-5 rounded-[1.5rem] bg-white/82 p-4 shadow-sm">
                        <div className="flex gap-3 sm:gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            onError={(event) => {
                              event.currentTarget.src = FALLBACK_IMAGE;
                            }}
                            className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 font-bold leading-snug text-slate-950">
                              {product.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">{product.category}</p>
                            <p className="mt-3 font-black text-slate-950">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#faf3f5] px-3 py-2">
                          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                            Qty
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(-1)}
                              disabled={quantity <= 1 || outOfStock}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:text-[#c84457] disabled:text-slate-300"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-black text-slate-950">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(1)}
                              disabled={quantityLimitReached || outOfStock}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:text-[#c84457] disabled:text-slate-300"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {inventoryNotice && (
                          <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                            {inventoryNotice}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 rounded-[1.4rem] bg-white/80 p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe6eb] text-[#c84457]">
                              <BadgePercent className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="font-bold text-slate-950">Apply coupon code</p>
                              <p className="text-xs text-slate-500">Try SAVE10 or FRESH15</p>
                            </div>
                          </div>
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                          <input
                            value={discountInput}
                            onChange={(event) => setDiscountInput(event.target.value)}
                            className="min-w-0 flex-1 rounded-xl border border-[#efd6db] bg-white px-4 py-3 text-sm font-bold uppercase text-slate-900 outline-none focus:border-[#c84457]"
                            placeholder="Coupon"
                          />
                          <button
                            type="button"
                            onClick={handleApplyDiscount}
                            className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#c84457]"
                          >
                            Apply
                          </button>
                        </div>
                        {discountMessage && (
                          <p
                            className={`mt-3 text-xs font-semibold ${
                              discountMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {discountMessage.text}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 rounded-[1.4rem] bg-white/82 p-5 shadow-sm">
                        <h3 className="font-black text-slate-950">Delivery method</h3>
                        <div className="mt-4 space-y-3">
                          {SHIPPING_OPTIONS.map((option) => {
                            const ShippingIcon = option.icon;
                            const selected = shippingMethod === option.id;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setShippingMethod(option.id)}
                                className={`w-full rounded-2xl border p-3 text-left transition ${
                                  selected
                                    ? 'border-[#c84457] bg-[#fff5f7]'
                                    : 'border-slate-200 bg-white hover:border-[#e5aab4]'
                                }`}
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe6eb] text-[#c84457]">
                                    <ShippingIcon className="h-5 w-5" />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-950">{option.name}</p>
                                    <p className="text-xs text-slate-500">{option.days}</p>
                                  </div>
                                  <p className="font-black text-slate-950 sm:text-right">
                                    {option.price === 0 ? 'Free' : formatCurrency(option.price)}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-5 rounded-[1.4rem] bg-white/82 p-5 shadow-sm">
                        <h3 className="font-black text-slate-950">Order summary</h3>
                        <div className="mt-5 space-y-4">
                          <SummaryRow label="Subtotal" value={formatCurrency(pricing.subtotal)} />
                          {pricing.discount > 0 && (
                            <SummaryRow label="Discount" value={`- ${formatCurrency(pricing.discount)}`} />
                          )}
                          <SummaryRow
                            label="Shipping"
                            value={pricing.shippingCost === 0 ? 'Free' : formatCurrency(pricing.shippingCost)}
                          />
                          {pricing.codFee > 0 && (
                            <SummaryRow label="COD fee" value={formatCurrency(pricing.codFee)} />
                          )}
                          <SummaryRow label="Tax" value={formatCurrency(pricing.tax)} />
                        </div>
                        <div className="mt-5 border-t border-[#efd6db] pt-5">
                          <SummaryRow strong label="Total" value={formatCurrency(pricing.total)} />
                        </div>
                      </div>
                    </div>
                  </aside>
                </section>

                {submitError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <p>{submitError}</p>
                    </div>
                  </div>
                )}

                <section className="grid gap-5 rounded-[1.35rem] border border-white bg-white p-4 shadow-[0_18px_55px_rgba(105,34,49,0.08)] sm:rounded-[1.8rem] sm:p-6 lg:grid-cols-[1fr_220px] lg:items-center lg:gap-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">Cancellation Policy</h2>
                    <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
                      Plans can change. You can modify or cancel this marketplace order before the
                      seller starts packing. Once packing begins, our team will confirm the best
                      available solution with the farmer and delivery partner.
                    </p>
                    <button
                      type="button"
                      className="mt-4 text-sm font-black text-[#c84457] transition hover:text-[#942538]"
                    >
                      See more details
                    </button>
                  </div>

                  <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[#fff0f3] text-[#c84457]">
                    <div className="absolute h-28 w-24 rounded-3xl border-4 border-white bg-white shadow-lg" />
                    <XCircle className="relative z-10 h-16 w-16" />
                  </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white bg-white/82 p-5 shadow-sm">
                    <ShieldCheck className="h-6 w-6 text-[#c84457]" />
                    <p className="mt-4 font-black text-slate-950">Secure checkout</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Card details are validated and CVV values are not stored.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white bg-white/82 p-5 shadow-sm">
                    <Store className="h-6 w-6 text-[#c84457]" />
                    <p className="mt-4 font-black text-slate-950">{product.seller}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Direct marketplace order from {product.location}.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white bg-white/82 p-5 shadow-sm">
                    <Package className="h-6 w-6 text-[#c84457]" />
                    <p className="mt-4 font-black text-slate-950">Live stock</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {outOfStock
                        ? 'This item is currently unavailable.'
                        : `${product.availableQuantity} ${product.unit} available now.`}
                    </p>
                  </div>
                </section>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default PaymentAndReting;

export const FARMER_ORDER_STAGES = [
  {
    id: 'pending',
    tabId: 'pending-orders',
    label: 'Pending Orders',
    shortLabel: 'Pending',
    description: 'New customer orders waiting for the farmer confirmation call before processing.',
    accent: 'from-amber-500 via-orange-500 to-amber-600',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700'
  },
  {
    id: 'processing',
    tabId: 'processing-orders',
    label: 'Processing Orders',
    shortLabel: 'Processing',
    description: 'Confirmed customer orders that are being checked, sorted, and prepared for packing.',
    accent: 'from-sky-500 via-blue-500 to-cyan-600',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700'
  },
  {
    id: 'packing',
    tabId: 'packing-orders',
    label: 'Packing Orders',
    shortLabel: 'Packing',
    description: 'Orders that are measured, packed, labeled, and made ready for dispatch.',
    accent: 'from-violet-500 via-indigo-500 to-fuchsia-600',
    badgeClass: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  {
    id: 'delivery',
    tabId: 'delivery-orders',
    label: 'Delivery Orders',
    shortLabel: 'Delivery',
    description: 'Packed orders that are on the road and moving to the customer delivery location.',
    accent: 'from-emerald-500 via-green-500 to-teal-600',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  {
    id: 'completed',
    tabId: 'completed-orders',
    label: 'Completed Orders',
    shortLabel: 'Completed',
    description: 'Delivered orders that were received successfully and closed by the customer.',
    accent: 'from-slate-700 via-slate-800 to-slate-900',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700'
  }
];

export const ORDER_UNIT_OPTIONS = ['kg', 'g', 'pieces', 'boxes', 'bags'];

export const createFarmerSampleOrders = () => [
  {
    id: 'ORD-2401',
    customerName: 'Sunil Perera',
    customerPhone: '+94 77 412 5589',
    productName: 'Organic Tomatoes',
    quantity: 60,
    unit: 'kg',
    amount: 13200,
    requestedDate: '2026-04-24',
    deliveryAddress: 'Pettah Market, Colombo 11',
    status: 'pending',
    customerConfirmed: false,
    notes: 'Customer requested a quick confirmation call before loading.',
    createdAt: '2026-04-24T07:45:00',
    updatedAt: '2026-04-24T07:45:00'
  },
  {
    id: 'ORD-2402',
    customerName: 'Nadeesha Fernando',
    customerPhone: '+94 71 225 7634',
    productName: 'Green Chillies',
    quantity: 24,
    unit: 'kg',
    amount: 8400,
    requestedDate: '2026-04-24',
    deliveryAddress: 'Nugegoda Retail Hub',
    status: 'processing',
    customerConfirmed: true,
    notes: 'Customer confirmed by phone for same-day dispatch.',
    createdAt: '2026-04-24T06:20:00',
    updatedAt: '2026-04-24T09:05:00',
    lastContactedAt: '2026-04-24T08:40:00'
  },
  {
    id: 'ORD-2403',
    customerName: 'Kavindi Stores',
    customerPhone: '+94 76 992 1432',
    productName: 'Red Onion',
    quantity: 80,
    unit: 'kg',
    amount: 16800,
    requestedDate: '2026-04-24',
    deliveryAddress: 'Kandy Wholesale Yard',
    status: 'packing',
    customerConfirmed: true,
    notes: 'Label each bag with the store code before moving to delivery.',
    createdAt: '2026-04-23T17:25:00',
    updatedAt: '2026-04-24T10:15:00',
    lastContactedAt: '2026-04-24T07:30:00'
  },
  {
    id: 'ORD-2404',
    customerName: 'Mihiri Traders',
    customerPhone: '+94 70 553 9910',
    productName: 'Coconuts',
    quantity: 150,
    unit: 'pieces',
    amount: 22500,
    requestedDate: '2026-04-24',
    deliveryAddress: 'Negombo City Market',
    status: 'delivery',
    customerConfirmed: true,
    notes: 'Delivery driver already assigned and on route.',
    createdAt: '2026-04-23T15:10:00',
    updatedAt: '2026-04-24T11:30:00',
    lastContactedAt: '2026-04-24T07:05:00'
  },
  {
    id: 'ORD-2405',
    customerName: 'Ravindu Super Center',
    customerPhone: '+94 75 118 3320',
    productName: 'Beans',
    quantity: 45,
    unit: 'kg',
    amount: 9900,
    requestedDate: '2026-04-23',
    deliveryAddress: 'Kurunegala Main Street',
    status: 'completed',
    customerConfirmed: true,
    notes: 'Customer received all crates in good condition.',
    createdAt: '2026-04-23T08:35:00',
    updatedAt: '2026-04-23T16:10:00',
    lastContactedAt: '2026-04-23T09:15:00',
    completedAt: '2026-04-23T16:10:00'
  }
];

export const createEmptyOrderForm = (status = 'pending') => ({
  customerName: '',
  customerPhone: '',
  productName: '',
  quantity: '',
  unit: 'kg',
  amount: '',
  requestedDate: new Date().toISOString().slice(0, 10),
  deliveryAddress: '',
  status,
  customerConfirmed: status !== 'pending',
  notes: ''
});

export const formatOrderCurrency = (amount) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(Number(amount || 0));

export const formatOrderDate = (value) => {
  if (!value) return 'Not set';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export const getOrderStageMeta = (status) =>
  FARMER_ORDER_STAGES.find((stage) => stage.id === status) || FARMER_ORDER_STAGES[0];

export const getOrderStageTabId = (status) => getOrderStageMeta(status).tabId;

export const getNextOrderStage = (status) => {
  const currentIndex = FARMER_ORDER_STAGES.findIndex((stage) => stage.id === status);
  return FARMER_ORDER_STAGES[currentIndex + 1]?.id || null;
};

export const getOrderQuickActionLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Call And Confirm';
    case 'processing':
      return 'Move To Packing';
    case 'packing':
      return 'Move To Delivery';
    case 'delivery':
      return 'Complete Order';
    default:
      return null;
  }
};

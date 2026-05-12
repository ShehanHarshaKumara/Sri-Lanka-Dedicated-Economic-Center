import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Leaf,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  User
} from 'lucide-react';
import CustomerNavbar from '../components/CustomerNavbar';
import { API_BASES } from '../config/api';

const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=450&fit=crop';

const ORDER_STAGES = [
  { id: 'pending', label: 'Order placed', helper: 'Waiting for farmer confirmation' },
  { id: 'processing', label: 'Processing', helper: 'Farmer is preparing your product' },
  { id: 'packing', label: 'Packing', helper: 'Order is being packed for pickup' },
  { id: 'out_for_delivery', label: 'On the way', helper: 'Rider is moving toward your address' },
  { id: 'completed', label: 'Delivered', helper: 'Order has reached the customer' }
];

const STATUS_ALIASES = {
  pending: 0,
  placed: 0,
  confirmed: 1,
  processing: 1,
  packing: 2,
  packed: 2,
  delivery: 3,
  out_for_delivery: 3,
  shipped: 3,
  completed: 4,
  delivered: 4
};

const formatCurrency = (value) =>
  `Rs.${(Number(value) || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const formatDate = (value) => {
  if (!value) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

const getStoredUser = (user) => {
  if (user) {
    return {
      id: user.id || user.userId || null,
      name: user.name || user.fullName || user.username || 'Customer',
      email: user.email || ''
    };
  }

  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const storedId = Number.parseInt(localStorage.getItem('userId') || '', 10);

    return {
      id: savedUser?.id || savedUser?.userId || (Number.isFinite(storedId) ? storedId : null),
      name: savedUser?.name || savedUser?.fullName || savedUser?.username || 'Customer',
      email: savedUser?.email || ''
    };
  } catch {
    return {
      id: null,
      name: 'Customer',
      email: ''
    };
  }
};

const getStageIndex = (status) => {
  const normalized = String(status || 'pending').toLowerCase().replace(/\s+/g, '_');
  return STATUS_ALIASES[normalized] ?? 0;
};

const buildConversations = (orders) =>
  orders.flatMap((order) =>
    (order.items || []).map((item) => ({
      id: `${order.id}-${item.productId || item.id}-${item.farmerId || item.farmerName || 'farmer'}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      farmerId: item.farmerId,
      farmerName: item.farmerName || 'Product farmer',
      productId: item.productId,
      productName: item.productName || 'Ordered product',
      image: item.image || FALLBACK_PRODUCT_IMAGE,
      quantity: item.quantity || 1,
      unit: item.unit || 'unit',
      lastMessage: `Order chat for ${item.productName || 'your product'}`,
      createdAt: order.createdAt
    }))
  );

const CustomerMessagesPage = ({
  user,
  onBack,
  onNavigateToHome,
  onNavigateToProducts,
  onNavigateToSellers,
  onNavigateToMap,
  onNavigateToMessages
}) => {
  const currentUser = useMemo(() => getStoredUser(user), [user]);
  const [activeTab, setActiveTab] = useState('chats');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (currentUser.id) {
        params.set('userId', currentUser.id);
      }
      if (currentUser.email) {
        params.set('email', currentUser.email);
      }

      try {
        const response = await fetch(`${API_BASES.payments}/orders?${params.toString()}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load your orders right now.');
        }

        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load your orders right now.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser.email, currentUser.id]);

  const conversations = useMemo(() => buildConversations(orders), [orders]);

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedConversationId('');
      return;
    }

    setSelectedConversationId((prev) =>
      conversations.some((conversation) => conversation.id === prev) ? prev : conversations[0].id
    );

    setMessagesByConversation((prev) => {
      const next = { ...prev };

      conversations.forEach((conversation) => {
        if (!next[conversation.id]) {
          next[conversation.id] = [
            {
              id: 1,
              sender: conversation.farmerName,
              body: `Hello ${currentUser.name}, thanks for ordering ${conversation.productName}. You can ask me about packing, quality, or delivery timing here.`,
              time: formatDate(conversation.createdAt),
              own: false
            },
            {
              id: 2,
              sender: 'You',
              body: 'Thank you. I will message here if I need an update about this order.',
              time: 'Now',
              own: true
            }
          ];
        }
      });

      return next;
    });
  }, [conversations, currentUser.name]);

  useEffect(() => {
    if (orders.length === 0) {
      setSelectedOrderId(null);
      return;
    }

    setSelectedOrderId((prev) => (orders.some((order) => order.id === prev) ? prev : orders[0].id));
  }, [orders]);

  const filteredConversations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      [
        conversation.farmerName,
        conversation.productName,
        conversation.orderNumber,
        conversation.status
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [conversations, searchTerm]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ||
    conversations[0];
  const selectedMessages = selectedConversation
    ? messagesByConversation[selectedConversation.id] || []
    : [];
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || orders[0];

  const sendMessage = () => {
    if (!selectedConversation || !messageInput.trim()) {
      return;
    }

    const nextMessage = {
      id: Date.now(),
      sender: 'You',
      body: messageInput.trim(),
      time: new Intl.DateTimeFormat('en-LK', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date()),
      own: true
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), nextMessage]
    }));
    setMessageInput('');
  };

  const openChatForItem = (order, item) => {
    const conversation = conversations.find(
      (entry) => entry.orderId === order.id && entry.productId === item.productId
    );

    if (conversation) {
      setSelectedConversationId(conversation.id);
      setActiveTab('chats');
    }
  };

  const renderEmptyState = () => (
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[2rem] border border-dashed border-emerald-200 bg-white/75 p-8 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-slate-950">No orders yet</h2>
      <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
        Once you buy a product, this page will show the farmer chat, order tracking, and full order
        details for that purchase.
      </p>
      <button
        type="button"
        onClick={onNavigateToProducts || onBack}
        className="mt-6 rounded-full bg-[#7ca537] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#6d9431]"
      >
        Shop products
      </button>
    </div>
  );

  const renderTracking = (order) => {
    const activeStage = getStageIndex(order?.status);

    return (
      <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7ca537]">
              Tracking
            </p>
            <h3 className="mt-2 text-xl font-black text-slate-950">
              {order?.orderNumber || 'Order'}
            </h3>
          </div>
          <span className="self-start rounded-full bg-[#eef7de] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#5d7631] sm:self-auto">
            {order?.status || 'pending'}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {ORDER_STAGES.map((stage, index) => {
            const reached = index <= activeStage;
            const current = index === activeStage;

            return (
              <div key={stage.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      reached
                        ? 'border-[#7ca537] bg-[#7ca537] text-white'
                        : 'border-slate-200 bg-white text-slate-300'
                    }`}
                  >
                    {reached ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                  </div>
                  {index < ORDER_STAGES.length - 1 && (
                    <div className={`h-9 w-0.5 ${reached ? 'bg-[#7ca537]' : 'bg-slate-200'}`} />
                  )}
                </div>
                <div className="pb-3">
                  <p className={`font-black ${reached ? 'text-slate-950' : 'text-slate-400'}`}>
                    {stage.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {current ? stage.helper : reached ? 'Completed' : stage.helper}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderChats = () => (
    <section className="grid min-h-[calc(100vh-13rem)] gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-white/70 bg-white/82 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search chats or orders"
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#7ca537]"
          />
        </div>

        <div className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedConversationId(conversation.id)}
              className={`w-full rounded-[1.4rem] border p-3 text-left transition ${
                selectedConversationId === conversation.id
                  ? 'border-[#7ca537] bg-[#f4f9ec]'
                  : 'border-slate-200 bg-white hover:border-[#b9d78a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={conversation.image}
                  alt={conversation.productName}
                  className="h-14 w-14 rounded-2xl object-cover"
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-slate-950">{conversation.farmerName}</p>
                  <p className="truncate text-sm text-slate-500">{conversation.productName}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7ca537]">
                    {conversation.orderNumber}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex min-h-[34rem] flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        {selectedConversation ? (
          <>
            <header className="border-b border-slate-200 bg-[linear-gradient(135deg,#f7fbef_0%,#fff8e9_100%)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConversation.image}
                    alt={selectedConversation.productName}
                    className="h-14 w-14 rounded-2xl object-cover"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                  <div>
                    <p className="font-black text-slate-950">{selectedConversation.farmerName}</p>
                    <p className="text-sm text-slate-600">
                      Chat about {selectedConversation.productName}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7ca537]">
                      {selectedConversation.orderNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-[#7ca537]" />
                  Ordered product chat
                </div>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#fbfaf5] p-4 sm:p-6">
              {selectedMessages.map((message) => (
                <div key={message.id} className={`flex ${message.own ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-[1.35rem] px-4 py-3 shadow-sm sm:max-w-[70%] ${
                      message.own
                        ? 'bg-[#7ca537] text-white'
                        : 'border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <p className={`text-xs font-black ${message.own ? 'text-white/70' : 'text-[#7ca537]'}`}>
                      {message.sender}
                    </p>
                    <p className="mt-1 text-sm leading-6">{message.body}</p>
                    <p className={`mt-2 text-[11px] ${message.own ? 'text-white/70' : 'text-slate-400'}`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-[#fbfaf5] p-2">
                <input
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Message the product farmer..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7ca537] text-white transition hover:bg-[#6d9431] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          renderEmptyState()
        )}
      </div>
    </section>
  );

  const renderOrders = () => (
    <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="space-y-3 rounded-[2rem] border border-white/70 bg-white/82 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        {orders.map((order) => (
          <button
            key={order.id}
            type="button"
            onClick={() => setSelectedOrderId(order.id)}
            className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
              selectedOrderId === order.id
                ? 'border-[#7ca537] bg-[#f4f9ec]'
                : 'border-slate-200 bg-white hover:border-[#b9d78a]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">{order.orderNumber}</p>
                <p className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</p>
              </div>
              <span className="rounded-full bg-[#eef7de] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#5d7631]">
                {order.status}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">{order.items?.length || 0} product item(s)</span>
              <span className="font-black text-slate-950">{formatCurrency(order.totals?.total)}</span>
            </div>
          </button>
        ))}
      </aside>

      {selectedOrder ? (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7ca537]">
                    Order details
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">
                    {selectedOrder.orderNumber}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="rounded-[1.2rem] bg-[#f7f3e8] px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Total
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-950">
                    {formatCurrency(selectedOrder.totals?.total)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] bg-[#fbfaf5] p-4">
                  <User className="h-5 w-5 text-[#7ca537]" />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Delivery address
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {selectedOrder.customer?.address}, {selectedOrder.customer?.city},{' '}
                    {selectedOrder.customer?.zipCode}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf5] p-4">
                  {selectedOrder.paymentMethod === 'card' ? (
                    <CreditCard className="h-5 w-5 text-[#7ca537]" />
                  ) : (
                    <Banknote className="h-5 w-5 text-[#7ca537]" />
                  )}
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Payment
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {selectedOrder.paymentMethod === 'card' ? 'Card payment' : 'Cash on delivery'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{selectedOrder.shippingMethod} delivery</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {(selectedOrder.items || []).map((item) => (
                  <div
                    key={`${selectedOrder.id}-${item.productId}-${item.id}`}
                    className="rounded-[1.5rem] border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <img
                        src={item.image || FALLBACK_PRODUCT_IMAGE}
                        alt={item.productName}
                        className="h-24 w-full rounded-2xl object-cover sm:w-24"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-950">{item.productName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.quantity} {item.unit || 'unit'} x {formatCurrency(item.price)}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#5d7631]">
                          <Store className="h-4 w-4" />
                          {item.farmerName || 'Product farmer'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openChatForItem(selectedOrder, item)}
                        className="rounded-full bg-[#7ca537] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#6d9431]"
                      >
                        Chat farmer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderTracking(selectedOrder)}
          </div>
        </div>
      ) : (
        renderEmptyState()
      )}
    </section>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f7f3e8_0%,#eef7de_42%,#e8f2f7_100%)] text-slate-900">
      <CustomerNavbar
        isScrolled
        onNavigateToHome={onNavigateToHome || onBack}
        onNavigateToProducts={onNavigateToProducts}
        onNavigateToSellers={onNavigateToSellers}
        onNavigateToMap={onNavigateToMap}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToAbout={onNavigateToHome || onBack}
      />

      <main className="px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[1680px]">
          <div className="rounded-[2.4rem] border border-white/70 bg-white/72 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-7 lg:p-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <button
                  type="button"
                  onClick={onBack || onNavigateToHome}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-[#7ca537] hover:text-[#7ca537]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#eef7de] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#5d7631]">
                  <Leaf className="h-4 w-4" />
                  Customer message center
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Chats and order tracking in one calm customer page
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Customers can message the farmer connected to an ordered product, track where the
                  order is, and open full order details from the same place.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                  <MessageSquare className="h-5 w-5 text-[#7ca537]" />
                  <p className="mt-3 text-2xl font-black text-slate-950">{conversations.length}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Farmer chats
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                  <Package className="h-5 w-5 text-[#7ca537]" />
                  <p className="mt-3 text-2xl font-black text-slate-950">{orders.length}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Orders
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                  <Truck className="h-5 w-5 text-[#7ca537]" />
                  <p className="mt-3 text-2xl font-black text-slate-950">
                    {orders.filter((order) => getStageIndex(order.status) >= 3).length}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Moving
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {[
                { id: 'chats', label: 'Chats', icon: MessageSquare },
                { id: 'orders', label: 'Orders', icon: Package }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
                      active
                        ? 'bg-[#7ca537] text-white shadow-lg shadow-emerald-100'
                        : 'bg-white text-slate-700 hover:text-[#7ca537]'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="mt-8 flex min-h-[26rem] items-center justify-center rounded-[2rem] bg-white/75">
                <div className="text-center">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#7ca537]" />
                  <p className="mt-4 font-bold text-slate-600">Loading your order messages...</p>
                </div>
              </div>
            ) : error ? (
              <div className="mt-8 rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-black">Could not load orders</p>
                    <p className="mt-1 text-sm leading-6">{error}</p>
                  </div>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="mt-8">{renderEmptyState()}</div>
            ) : (
              <div className="mt-8">{activeTab === 'chats' ? renderChats() : renderOrders()}</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerMessagesPage;

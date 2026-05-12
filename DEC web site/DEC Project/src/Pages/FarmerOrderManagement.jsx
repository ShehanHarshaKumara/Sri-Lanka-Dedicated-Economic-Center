import { useState } from 'react';
import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaEye,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
  FaTruck
} from 'react-icons/fa';

const ORDER_STAGES = [
  {
    id: 'pending',
    label: 'Pending',
    shortLabel: 'Pending',
    description: 'New customer orders waiting for the farmer call confirmation.',
    accent: 'from-amber-500 to-orange-500',
    badge: 'border-amber-200 bg-amber-50 text-amber-700'
  },
  {
    id: 'processing',
    label: 'Processing',
    shortLabel: 'Processing',
    description: 'Confirmed customer orders being prepared for packing.',
    accent: 'from-sky-500 to-blue-600',
    badge: 'border-sky-200 bg-sky-50 text-sky-700'
  },
  {
    id: 'packing',
    label: 'Packing',
    shortLabel: 'Packing',
    description: 'Orders that are measured, packed, and marked ready to dispatch.',
    accent: 'from-violet-500 to-indigo-600',
    badge: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  {
    id: 'delivery',
    label: 'Delivery',
    shortLabel: 'Delivery',
    description: 'Packed orders that have moved to the delivery page.',
    accent: 'from-emerald-500 to-green-600',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  {
    id: 'completed',
    label: 'Completed',
    shortLabel: 'Completed',
    description: 'Delivered orders that were received successfully by customers.',
    accent: 'from-slate-600 to-slate-800',
    badge: 'border-slate-200 bg-slate-100 text-slate-700'
  }
];

const SAMPLE_ORDERS = [
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

const createEmptyForm = (status = 'pending') => ({
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

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(Number(amount || 0));

const formatDate = (value) => {
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

const getStageMeta = (status) =>
  ORDER_STAGES.find((stage) => stage.id === status) || ORDER_STAGES[0];

const getNextStage = (status) => {
  const currentIndex = ORDER_STAGES.findIndex((stage) => stage.id === status);
  return ORDER_STAGES[currentIndex + 1]?.id || null;
};

const getQuickActionLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Call & Confirm';
    case 'processing':
      return 'Move to Packing';
    case 'packing':
      return 'Move to Delivery';
    case 'delivery':
      return 'Complete Order';
    default:
      return null;
  }
};

const FarmerOrderManagement = () => {
  const [activeStatus, setActiveStatus] = useState('pending');
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerMode, setDrawerMode] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderForm, setOrderForm] = useState(createEmptyForm('pending'));

  const stageCounts = ORDER_STAGES.reduce((accumulator, stage) => {
    accumulator[stage.id] = orders.filter((order) => order.status === stage.id).length;
    return accumulator;
  }, {});

  const visibleOrders = orders.filter((order) => {
    const matchesStatus = order.status === activeStatus;
    const query = searchQuery.trim().toLowerCase();

    if (!query) return matchesStatus;

    const searchText = [
      order.id,
      order.customerName,
      order.productName,
      order.customerPhone,
      order.deliveryAddress
    ]
      .join(' ')
      .toLowerCase();

    return matchesStatus && searchText.includes(query);
  });

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const confirmedOrders = orders.filter((order) => order.customerConfirmed).length;
  const activeStage = getStageMeta(activeStatus);

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelectedOrder(null);
  };

  const openCreateDrawer = () => {
    const defaultStatus = activeStatus === 'completed' ? 'pending' : activeStatus;
    setOrderForm(createEmptyForm(defaultStatus));
    setSelectedOrder(null);
    setDrawerMode('create');
  };

  const openEditDrawer = (order) => {
    setSelectedOrder(order);
    setOrderForm({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      productName: order.productName,
      quantity: String(order.quantity),
      unit: order.unit,
      amount: String(order.amount),
      requestedDate: order.requestedDate,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      customerConfirmed: order.customerConfirmed,
      notes: order.notes || ''
    });
    setDrawerMode('edit');
  };

  const openViewDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerMode('view');
  };

  const updateOrder = (orderId, updates) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : order
      )
    );
  };

  const moveOrderToStage = (order, nextStage) => {
    if (!nextStage || nextStage === order.status) return;

    const updates = {
      status: nextStage,
      customerConfirmed: nextStage !== 'pending',
      completedAt: nextStage === 'completed' ? new Date().toISOString() : null,
      lastContactedAt: nextStage === 'pending' ? null : order.lastContactedAt
    };

    if (order.status === 'pending' || nextStage === 'processing') {
      updates.lastContactedAt = new Date().toISOString();
      updates.notes = order.notes
        ? `${order.notes}\nCustomer confirmed by phone before processing.`
        : 'Customer confirmed by phone before processing.';
    }

    updateOrder(order.id, updates);
  };

  const handleQuickAction = (order) => {
    const nextStage = getNextStage(order.status);
    moveOrderToStage(order, nextStage);
  };

  const handleDeleteOrder = (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    if (window.confirm(`Delete order ${order.id} for ${order.customerName}?`)) {
      setOrders((currentOrders) => currentOrders.filter((item) => item.id !== orderId));
      if (selectedOrder?.id === orderId) {
        closeDrawer();
      }
    }
  };

  const handleSaveOrder = (event) => {
    event.preventDefault();

    const normalizedStatus = orderForm.status || 'pending';
    const payload = {
      customerName: orderForm.customerName.trim(),
      customerPhone: orderForm.customerPhone.trim(),
      productName: orderForm.productName.trim(),
      quantity: Number(orderForm.quantity),
      unit: orderForm.unit.trim(),
      amount: Number(orderForm.amount),
      requestedDate: orderForm.requestedDate,
      deliveryAddress: orderForm.deliveryAddress.trim(),
      status: normalizedStatus,
      customerConfirmed: orderForm.customerConfirmed || normalizedStatus !== 'pending',
      notes: orderForm.notes.trim()
    };

    if (!payload.customerName || !payload.productName || !payload.customerPhone || !payload.deliveryAddress) {
      return;
    }

    if (drawerMode === 'edit' && selectedOrder) {
      updateOrder(selectedOrder.id, {
        ...payload,
        lastContactedAt: payload.customerConfirmed
          ? selectedOrder.lastContactedAt || new Date().toISOString()
          : null,
        completedAt:
          payload.status === 'completed'
            ? selectedOrder.completedAt || new Date().toISOString()
            : null
      });
      setActiveStatus(payload.status);
    } else {
      const timestamp = Date.now();
      const newOrder = {
        id: `ORD-${String(timestamp).slice(-4)}`,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastContactedAt: payload.customerConfirmed ? new Date().toISOString() : null,
        completedAt: payload.status === 'completed' ? new Date().toISOString() : null
      };

      setOrders((currentOrders) => [newOrder, ...currentOrders]);
      setActiveStatus(payload.status);
    }

    closeDrawer();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Customer Order Management</h1>
          <p className="text-gray-600 mt-1">
            Manage customer orders with separate pages for pending, processing, packing, delivery, and completed stages.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <FaPlus className="text-xs" />
            Add Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-white/70">
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{orders.length}</p>
          <p className="mt-2 text-sm text-gray-600">All customer orders across every stage.</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-white/70">
          <p className="text-sm font-medium text-gray-500">Need Confirmation</p>
          <p className="mt-3 text-3xl font-bold text-amber-600">{stageCounts.pending || 0}</p>
          <p className="mt-2 text-sm text-gray-600">Call customers on pending orders, then confirm and move them forward.</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-white/70">
          <p className="text-sm font-medium text-gray-500">Confirmed Orders</p>
          <p className="mt-3 text-3xl font-bold text-sky-600">{confirmedOrders}</p>
          <p className="mt-2 text-sm text-gray-600">Orders already verified by the farmer or customer call.</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-white/70">
          <p className="text-sm font-medium text-gray-500">Total Order Value</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
          <p className="mt-2 text-sm text-gray-600">Running value of all order pages in this management section.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <aside className="rounded-[2rem] bg-white/90 p-4 shadow-sm border border-white/70 backdrop-blur-sm">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-gray-800">Order Status Pages</p>
            <p className="mt-1 text-sm text-gray-500">
              Open a page from the sidebar and manage the orders in that stage.
            </p>
          </div>
          <div className="space-y-2">
            {ORDER_STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStatus(stage.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  activeStatus === stage.id
                    ? 'border-emerald-200 bg-emerald-50 shadow-sm'
                    : 'border-transparent bg-gray-50 hover:border-emerald-100 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{stage.label}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{stage.description}</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-bold text-gray-700 shadow-sm">
                    {stageCounts[stage.id] || 0}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-[2rem] bg-white/90 p-5 shadow-sm border border-white/70 backdrop-blur-sm">
          <div className={`rounded-[1.75rem] bg-gradient-to-r ${activeStage.accent} p-5 text-white shadow-lg`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  {activeStage.label} Page
                </p>
                <h2 className="mt-2 text-2xl font-bold">{activeStage.label} Orders</h2>
                <p className="mt-2 max-w-3xl text-sm text-white/85">{activeStage.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wide text-white/70">Orders</p>
                  <p className="mt-2 text-2xl font-bold">{stageCounts[activeStatus] || 0}</p>
                </div>
                <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wide text-white/70">Next Flow</p>
                  <p className="mt-2 text-sm font-semibold">
                    {getNextStage(activeStatus)
                      ? getStageMeta(getNextStage(activeStatus)).label
                      : 'Closed'}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wide text-white/70">Call Check</p>
                  <p className="mt-2 text-sm font-semibold">
                    {activeStatus === 'pending' ? 'Call before processing' : 'Already confirmed'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`Search ${activeStage.shortLabel.toLowerCase()} orders...`}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              {ORDER_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStatus(stage.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeStatus === stage.id
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-100 hover:text-emerald-700'
                  }`}
                >
                  {stage.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Order
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Customer
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Quantity
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Delivery
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Move To
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {visibleOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-14 text-center">
                        <div className="mx-auto max-w-md">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 text-gray-400">
                            <FaBoxOpen className="text-2xl" />
                          </div>
                          <h3 className="mt-5 text-lg font-semibold text-gray-900">
                            No {activeStage.shortLabel.toLowerCase()} orders yet
                          </h3>
                          <p className="mt-2 text-sm text-gray-500">
                            Add a new order or move an existing order into this page.
                          </p>
                          <button
                            type="button"
                            onClick={openCreateDrawer}
                            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                          >
                            <FaPlus className="text-xs" />
                            Add Order
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {visibleOrders.map((order) => {
                    const orderStage = getStageMeta(order.status);
                    const nextStage = getNextStage(order.status);
                    const quickActionLabel = getQuickActionLabel(order.status);

                    return (
                      <tr key={order.id} className="align-top transition hover:bg-emerald-50/40">
                        <td className="px-5 py-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 font-bold text-gray-700">
                              {order.productName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{order.productName}</p>
                              <p className="mt-1 text-sm text-gray-500">{order.id}</p>
                              <div className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${orderStage.badge}`}>
                                {orderStage.shortLabel}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <p className="font-semibold text-gray-900">{order.customerName}</p>
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <FaPhoneAlt className="text-xs text-emerald-500" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <p className="mt-3 text-xs font-medium text-gray-500">
                            {order.customerConfirmed ? 'Phone confirmation complete' : 'Pending farmer call'}
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <p className="font-semibold text-gray-900">
                            {order.quantity} {order.unit}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">{formatCurrency(order.amount)}</p>
                          <p className="mt-2 text-xs text-gray-500">Requested: {formatDate(order.requestedDate)}</p>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-emerald-500" />
                            <span>{order.deliveryAddress}</span>
                          </div>
                          {order.lastContactedAt && (
                            <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                              <FaClock className="text-[10px]" />
                              Last updated {formatDate(order.lastContactedAt)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-5">
                          <select
                            value={order.status}
                            onChange={(event) => moveOrderToStage(order, event.target.value)}
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                          >
                            {ORDER_STAGES.map((stage) => (
                              <option key={stage.id} value={stage.id}>
                                {stage.label}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-xs text-gray-500">
                            Use this to move the order to another page instantly.
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openViewDrawer(order)}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <FaEye className="text-xs" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditDrawer(order)}
                              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                            >
                              <FaEdit className="text-xs" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              <FaTrash className="text-xs" />
                              Delete
                            </button>
                            {quickActionLabel && nextStage && (
                              <button
                                type="button"
                                onClick={() => handleQuickAction(order)}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                              >
                                {order.status === 'pending' ? <FaPhoneAlt className="text-xs" /> : <FaTruck className="text-xs" />}
                                {quickActionLabel}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {drawerMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeDrawer}
              className="absolute right-5 top-5 rounded-full bg-gray-100 p-3 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
            >
              <FaTimes />
            </button>

            {drawerMode === 'view' && selectedOrder && (
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 pr-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${getStageMeta(selectedOrder.status).badge}`}>
                      {getStageMeta(selectedOrder.status).label}
                    </div>
                    <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                      {selectedOrder.id}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedOrder.productName}</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      View order details, customer confirmation status, and current movement in the workflow.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 py-6 md:grid-cols-2">
                  <div className="rounded-3xl bg-gray-50 p-5">
                    <p className="text-sm font-semibold text-gray-500">Customer</p>
                    <p className="mt-3 text-xl font-bold text-gray-900">{selectedOrder.customerName}</p>
                    <p className="mt-2 text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                    <p className="mt-4 text-sm text-gray-500">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-5">
                    <p className="text-sm font-semibold text-gray-500">Order Summary</p>
                    <p className="mt-3 text-xl font-bold text-gray-900">
                      {selectedOrder.quantity} {selectedOrder.unit}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">{formatCurrency(selectedOrder.amount)}</p>
                    <p className="mt-4 text-sm text-gray-500">
                      Requested date: {formatDate(selectedOrder.requestedDate)}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500" />
                    <h4 className="text-lg font-semibold text-gray-900">Workflow</h4>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
                    {ORDER_STAGES.map((stage, index) => {
                      const currentIndex = ORDER_STAGES.findIndex((item) => item.id === selectedOrder.status);
                      const isDone = index <= currentIndex;

                      return (
                        <div
                          key={stage.id}
                          className={`rounded-2xl border px-4 py-4 text-center ${
                            isDone ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-500'
                          }`}
                        >
                          <p className="text-sm font-semibold">{stage.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 rounded-[1.75rem] bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-500">Notes</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700">
                    {selectedOrder.notes || 'No notes added for this order yet.'}
                  </p>
                </div>
              </div>
            )}

            {(drawerMode === 'create' || drawerMode === 'edit') && (
              <form onSubmit={handleSaveOrder} className="p-6 sm:p-8">
                <div className="border-b border-gray-100 pb-6 pr-10">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    {drawerMode === 'create' ? 'Add Order' : 'Edit Order'}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-gray-900">
                    {drawerMode === 'create'
                      ? 'Create a new customer order'
                      : `Update ${selectedOrder?.id || 'order'} and move it to another page`}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Use the add or edit form to update customer information, status page, and phone confirmation.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Customer name</span>
                    <input
                      required
                      value={orderForm.customerName}
                      onChange={(event) => setOrderForm((current) => ({ ...current, customerName: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Customer phone</span>
                    <input
                      required
                      value={orderForm.customerPhone}
                      onChange={(event) => setOrderForm((current) => ({ ...current, customerPhone: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Product</span>
                    <input
                      required
                      value={orderForm.productName}
                      onChange={(event) => setOrderForm((current) => ({ ...current, productName: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Requested date</span>
                    <input
                      required
                      type="date"
                      value={orderForm.requestedDate}
                      onChange={(event) => setOrderForm((current) => ({ ...current, requestedDate: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Quantity</span>
                    <input
                      required
                      min="1"
                      type="number"
                      value={orderForm.quantity}
                      onChange={(event) => setOrderForm((current) => ({ ...current, quantity: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Unit</span>
                    <select
                      value={orderForm.unit}
                      onChange={(event) => setOrderForm((current) => ({ ...current, unit: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="pieces">pieces</option>
                      <option value="boxes">boxes</option>
                      <option value="bags">bags</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Amount (LKR)</span>
                    <input
                      required
                      min="0"
                      type="number"
                      value={orderForm.amount}
                      onChange={(event) => setOrderForm((current) => ({ ...current, amount: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Status page</span>
                    <select
                      value={orderForm.status}
                      onChange={(event) =>
                        setOrderForm((current) => ({
                          ...current,
                          status: event.target.value,
                          customerConfirmed:
                            current.customerConfirmed || event.target.value !== 'pending'
                        }))
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    >
                      {ORDER_STAGES.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-gray-700">Delivery address</span>
                    <input
                      required
                      value={orderForm.deliveryAddress}
                      onChange={(event) => setOrderForm((current) => ({ ...current, deliveryAddress: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-gray-700">Order notes</span>
                    <textarea
                      rows="4"
                      value={orderForm.notes}
                      onChange={(event) => setOrderForm((current) => ({ ...current, notes: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </label>
                </div>

                <label className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={orderForm.customerConfirmed}
                    onChange={(event) =>
                      setOrderForm((current) => ({
                        ...current,
                        customerConfirmed: event.target.checked
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600"
                  />
                  <span className="text-sm text-gray-700">
                    Mark this as phone-confirmed by the farmer. Pending orders should be called and confirmed before moving to processing.
                  </span>
                </label>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    {drawerMode === 'create' ? 'Save Order' : 'Update Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrderManagement;

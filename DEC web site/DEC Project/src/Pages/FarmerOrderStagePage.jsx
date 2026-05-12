import { useMemo, useState } from 'react';
import {
  FaBoxOpen,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaEdit,
  FaEye,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaTruck
} from 'react-icons/fa';
import {
  FARMER_ORDER_STAGES,
  ORDER_UNIT_OPTIONS,
  createEmptyOrderForm,
  formatOrderCurrency,
  formatOrderDate,
  getNextOrderStage,
  getOrderQuickActionLabel,
  getOrderStageMeta,
  getOrderStageTabId
} from './farmerOrderConfig';
import { confirmAction } from '../utils/sweetAlert';

const STAGE_ICONS = {
  pending: FaClock,
  processing: FaSpinner,
  packing: FaBoxOpen,
  delivery: FaTruck,
  completed: FaCheckCircle
};

const PAGE_COPY = {
  pending: {
    eyebrow: 'Need farmer confirmation',
    emptyTitle: 'No pending orders right now',
    emptyDescription: 'New orders waiting for your confirmation call will appear on this page.'
  },
  processing: {
    eyebrow: 'Confirmed and checking',
    emptyTitle: 'No processing orders right now',
    emptyDescription: 'Confirmed orders that are being prepared will appear here.'
  },
  packing: {
    eyebrow: 'Packing workflow',
    emptyTitle: 'No packing orders right now',
    emptyDescription: 'Orders ready for packing and labeling will appear on this page.'
  },
  delivery: {
    eyebrow: 'Orders in transit',
    emptyTitle: 'No delivery orders right now',
    emptyDescription: 'Orders that are currently moving to customers will appear here.'
  },
  completed: {
    eyebrow: 'Closed successfully',
    emptyTitle: 'No completed orders yet',
    emptyDescription: 'Delivered and closed orders will appear on this page after completion.'
  }
};

const buildMoveNotes = (order, nextStage) => {
  if (order.status === 'pending' && nextStage === 'processing') {
    const confirmationNote = 'Customer confirmed by phone before processing.';
    if ((order.notes || '').includes(confirmationNote)) {
      return order.notes;
    }

    return order.notes ? `${order.notes}\n${confirmationNote}` : confirmationNote;
  }

  return order.notes || '';
};

const FarmerOrderStagePage = ({ stageId, orders = [], setOrders, onNavigateToStage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerMode, setDrawerMode] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderForm, setOrderForm] = useState(createEmptyOrderForm(stageId));

  const stageMeta = getOrderStageMeta(stageId);
  const stageCopy = PAGE_COPY[stageId] || PAGE_COPY.pending;
  const StageIcon = STAGE_ICONS[stageId] || FaClock;

  const stageOrders = useMemo(
    () => orders.filter((order) => order.status === stageId),
    [orders, stageId]
  );

  const stageCounts = useMemo(
    () =>
      FARMER_ORDER_STAGES.reduce((accumulator, stage) => {
        accumulator[stage.id] = orders.filter((order) => order.status === stage.id).length;
        return accumulator;
      }, {}),
    [orders]
  );

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return stageOrders;

    return stageOrders.filter((order) => {
      const searchText = [
        order.id,
        order.customerName,
        order.customerPhone,
        order.productName,
        order.deliveryAddress
      ]
        .join(' ')
        .toLowerCase();

      return searchText.includes(query);
    });
  }, [searchQuery, stageOrders]);

  const stageValue = stageOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const confirmedCount = stageOrders.filter((order) => order.customerConfirmed).length;
  const confirmationNeededCount = stageOrders.filter((order) => !order.customerConfirmed).length;
  const nextStage = getNextOrderStage(stageId);

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelectedOrder(null);
  };

  const openCreateDrawer = () => {
    const defaultStatus = stageId === 'completed' ? 'pending' : stageId;
    setOrderForm(createEmptyOrderForm(defaultStatus));
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

  const moveToStageTab = (targetStage) => {
    if (!targetStage) return;
    onNavigateToStage(getOrderStageTabId(targetStage));
  };

  const handleDeleteOrder = async (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    const shouldDelete = await confirmAction({
      title: 'Delete order?',
      text: `Delete order ${order.id} for ${order.customerName}?`,
      confirmButtonText: 'Yes, delete order'
    });

    if (!shouldDelete) {
      return;
    }

    setOrders((currentOrders) => currentOrders.filter((item) => item.id !== orderId));
    if (selectedOrder?.id === orderId) {
      closeDrawer();
    }
  };

  const updateOrderRecord = (orderId, updates) => {
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

  const moveOrderToStage = (order, targetStage) => {
    if (!targetStage || targetStage === order.status) return;

    const now = new Date().toISOString();
    const updates = {
      status: targetStage,
      customerConfirmed: targetStage === 'pending' ? false : true,
      completedAt: targetStage === 'completed' ? now : null,
      lastContactedAt: targetStage === 'pending' ? null : order.lastContactedAt || now,
      notes: buildMoveNotes(order, targetStage)
    };

    updateOrderRecord(order.id, updates);
    closeDrawer();
    moveToStageTab(targetStage);
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
      customerConfirmed: normalizedStatus === 'pending' ? orderForm.customerConfirmed : true,
      notes: orderForm.notes.trim()
    };

    if (
      !payload.customerName ||
      !payload.customerPhone ||
      !payload.productName ||
      !payload.deliveryAddress ||
      !payload.quantity
    ) {
      return;
    }

    const now = new Date().toISOString();

    if (drawerMode === 'edit' && selectedOrder) {
      updateOrderRecord(selectedOrder.id, {
        ...payload,
        customerConfirmed: payload.status === 'pending' ? payload.customerConfirmed : true,
        lastContactedAt:
          payload.status === 'pending'
            ? null
            : selectedOrder.lastContactedAt || now,
        completedAt: payload.status === 'completed' ? selectedOrder.completedAt || now : null
      });
    } else {
      const newOrder = {
        id: `ORD-${String(Date.now()).slice(-4)}`,
        ...payload,
        customerConfirmed: payload.status === 'pending' ? payload.customerConfirmed : true,
        createdAt: now,
        updatedAt: now,
        lastContactedAt: payload.status === 'pending' ? null : now,
        completedAt: payload.status === 'completed' ? now : null
      };

      setOrders((currentOrders) => [newOrder, ...currentOrders]);
    }

    closeDrawer();
    moveToStageTab(payload.status);
  };

  const renderWorkflow = (currentStatus) => {
    const currentIndex = FARMER_ORDER_STAGES.findIndex((stage) => stage.id === currentStatus);

    return (
      <div className="grid gap-3 md:grid-cols-5">
        {FARMER_ORDER_STAGES.map((stage, index) => {
          const isDone = index <= currentIndex;

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border px-4 py-4 text-center ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <p className="text-sm font-semibold">{stage.shortLabel}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(240,253,250,0.98)_56%,_rgba(236,253,245,0.96)_100%)] p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <StageIcon className={`${stageId === 'processing' ? 'animate-spin' : ''} text-xs`} />
              Order Management
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              {stageMeta.label} Page
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
              {stageMeta.description} This page helps you manage this stage with quick actions,
              table controls, and full order details.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <FaPlus className="text-xs" />
            Create Order
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {stageCopy.eyebrow}
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stageOrders.length}</p>
            <p className="mt-2 text-sm text-slate-500">Orders currently on this stage page.</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Confirmed Orders
            </p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{confirmedCount}</p>
            <p className="mt-2 text-sm text-slate-500">Orders already confirmed by the farmer.</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Need Action
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-600">{confirmationNeededCount}</p>
            <p className="mt-2 text-sm text-slate-500">
              Orders still waiting for a call, update, or next move.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Stage Value
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatOrderCurrency(stageValue)}
            </p>
            <p className="mt-2 text-sm text-slate-500">Total order value on this page.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={`Search ${stageMeta.shortLabel.toLowerCase()} orders...`}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            {FARMER_ORDER_STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => moveToStageTab(stage.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  stage.id === stageId
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-100 hover:text-emerald-700'
                }`}
              >
                {stage.shortLabel}
                <span className="ml-2 text-xs text-slate-400">{stageCounts[stage.id] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`mt-5 rounded-[1.75rem] bg-gradient-to-r ${stageMeta.accent} p-5 text-white shadow-lg`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                {stageCopy.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-bold">{stageMeta.label}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/85">
                Keep this page updated so your customers and delivery workflow move smoothly from one
                stage to the next.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/70">Orders</p>
                <p className="mt-2 text-2xl font-bold">{stageOrders.length}</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/70">Next Stage</p>
                <p className="mt-2 text-sm font-semibold">
                  {nextStage ? getOrderStageMeta(nextStage).shortLabel : 'Closed'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/70">Search Results</p>
                <p className="mt-2 text-2xl font-bold">{visibleOrders.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {visibleOrders.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
          <div className="mx-auto max-w-md">
            <StageIcon className={`mx-auto mb-4 text-4xl text-slate-300 ${stageId === 'processing' ? 'animate-spin' : ''}`} />
            <h3 className="text-xl font-semibold text-slate-900">
              {searchQuery ? 'No matching orders found' : stageCopy.emptyTitle}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {searchQuery
                ? `Try a different search or open another order page from the management section.`
                : stageCopy.emptyDescription}
            </p>
            <button
              type="button"
              onClick={openCreateDrawer}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              <FaPlus className="text-xs" />
              Create Order
            </button>
          </div>
        </div>
      ) : (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{stageMeta.label} Table</h2>
                <p className="mt-1 text-sm text-slate-500">
                  View details, edit data, delete orders, or move each order to another stage page.
                </p>
              </div>
              <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${stageMeta.badgeClass}`}>
                {stageMeta.shortLabel}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Order
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Address
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Move Stage
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleOrders.map((order) => {
                  const orderStage = getOrderStageMeta(order.status);
                  const rowNextStage = getNextOrderStage(order.status);
                  const quickActionLabel = getOrderQuickActionLabel(order.status);

                  return (
                    <tr key={order.id} className="align-top transition hover:bg-slate-50/80">
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                              {order.id}
                            </div>
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${orderStage.badgeClass}`}>
                              {orderStage.shortLabel}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{order.productName}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Requested: {formatOrderDate(order.requestedDate)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">{order.customerName}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <FaPhoneAlt className="text-xs text-emerald-500" />
                          <span>{order.customerPhone}</span>
                        </div>
                        <p className="mt-3 text-xs font-medium text-slate-500">
                          {order.customerConfirmed ? 'Phone confirmation complete' : 'Pending farmer call'}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">
                          {order.quantity} {order.unit}
                        </p>
                        <p className="mt-2 text-sm text-emerald-700">
                          {formatOrderCurrency(order.amount)}
                        </p>
                        {order.lastContactedAt ? (
                          <p className="mt-2 text-xs text-slate-500">
                            Last update: {formatOrderDate(order.lastContactedAt)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-emerald-500" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={order.status}
                          onChange={(event) => moveOrderToStage(order, event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                        >
                          {FARMER_ORDER_STAGES.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.label}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-slate-500">
                          Use this to move the order to another page instantly.
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openViewDrawer(order)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <FaEye className="text-xs" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditDrawer(order)}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                          >
                            <FaTrash className="text-xs" />
                            Delete
                          </button>
                          {quickActionLabel && rowNextStage ? (
                            <button
                              type="button"
                              onClick={() => moveOrderToStage(order, rowNextStage)}
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              {order.status === 'pending' ? (
                                <FaPhoneAlt className="text-xs" />
                              ) : (
                                <FaChevronRight className="text-xs" />
                              )}
                              {quickActionLabel}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {drawerMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeDrawer}
              className="absolute right-5 top-5 rounded-full bg-slate-100 p-3 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <FaTimes />
            </button>

            {drawerMode === 'view' && selectedOrder ? (
              <div className="p-6 sm:p-8">
                <div className="border-b border-slate-100 pb-6 pr-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${getOrderStageMeta(selectedOrder.status).badgeClass}`}>
                      {getOrderStageMeta(selectedOrder.status).label}
                    </div>
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      {selectedOrder.id}
                    </div>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900">{selectedOrder.productName}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    View full order details, customer contact information, and the current workflow stage.
                  </p>
                </div>

                <div className="grid gap-6 py-6 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">Customer</p>
                    <p className="mt-3 text-xl font-bold text-slate-900">{selectedOrder.customerName}</p>
                    <p className="mt-2 text-sm text-slate-600">{selectedOrder.customerPhone}</p>
                    <p className="mt-4 text-sm text-slate-500">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">Order Summary</p>
                    <p className="mt-3 text-xl font-bold text-slate-900">
                      {selectedOrder.quantity} {selectedOrder.unit}
                    </p>
                    <p className="mt-2 text-sm text-emerald-700">
                      {formatOrderCurrency(selectedOrder.amount)}
                    </p>
                    <p className="mt-4 text-sm text-slate-500">
                      Requested date: {formatOrderDate(selectedOrder.requestedDate)}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500" />
                    <h4 className="text-lg font-semibold text-slate-900">Workflow</h4>
                  </div>
                  <div className="mt-5">{renderWorkflow(selectedOrder.status)}</div>
                </div>

                <div className="mt-6 rounded-[1.75rem] bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Notes</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                    {selectedOrder.notes || 'No notes added for this order yet.'}
                  </p>
                </div>
              </div>
            ) : null}

            {drawerMode !== 'view' ? (
              <form onSubmit={handleSaveOrder} className="p-6 sm:p-8">
                <div className="border-b border-slate-100 pb-6 pr-10">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    {drawerMode === 'create' ? 'Create Order' : 'Edit Order'}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-slate-900">
                    {drawerMode === 'create'
                      ? 'Create a new customer order'
                      : `Update ${selectedOrder?.id || 'order'} and move it to another page`}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Use this form to update customer details, stage page, confirmation status, and order notes.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Customer name</span>
                    <input
                      required
                      value={orderForm.customerName}
                      onChange={(event) =>
                        setOrderForm((current) => ({ ...current, customerName: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Customer phone</span>
                    <input
                      required
                      value={orderForm.customerPhone}
                      onChange={(event) =>
                        setOrderForm((current) => ({ ...current, customerPhone: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Product</span>
                    <input
                      required
                      value={orderForm.productName}
                      onChange={(event) =>
                        setOrderForm((current) => ({ ...current, productName: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Requested date</span>
                    <input
                      required
                      type="date"
                      value={orderForm.requestedDate}
                      onChange={(event) =>
                        setOrderForm((current) => ({ ...current, requestedDate: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Quantity</span>
                    <input
                      required
                      min="1"
                      type="number"
                      value={orderForm.quantity}
                      onChange={(event) =>
                        setOrderForm((current) => ({ ...current, quantity: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Unit</span>
                    <select
                      value={orderForm.unit}
                      onChange={(event) =>
                        setOrderForm((current) => ({ ...current, unit: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                    >
                      {ORDER_UNIT_OPTIONS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Amount (LKR)</span>
                    <input
                      required
                      min="0"
                      type="number"
                      value={orderForm.amount}
                      onChange={(event) =>
                        setOrderForm((current) => ({ ...current, amount: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Status page</span>
                    <select
                      value={orderForm.status}
                      onChange={(event) =>
                        setOrderForm((current) => ({
                          ...current,
                          status: event.target.value,
                          customerConfirmed:
                            event.target.value === 'pending' ? current.customerConfirmed : true
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                    >
                      {FARMER_ORDER_STAGES.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">Delivery address</span>
                    <input
                      required
                      value={orderForm.deliveryAddress}
                      onChange={(event) =>
                        setOrderForm((current) => ({
                          ...current,
                          deliveryAddress: event.target.value
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">Order notes</span>
                    <textarea
                      rows="4"
                      value={orderForm.notes}
                      onChange={(event) =>
                        setOrderForm((current) => ({ ...current, notes: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
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
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  <span className="text-sm text-slate-700">
                    Mark this as phone-confirmed by the farmer. Pending orders should be confirmed
                    before moving to processing.
                  </span>
                </label>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    {drawerMode === 'create' ? 'Save Order' : 'Update Order'}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FarmerOrderStagePage;

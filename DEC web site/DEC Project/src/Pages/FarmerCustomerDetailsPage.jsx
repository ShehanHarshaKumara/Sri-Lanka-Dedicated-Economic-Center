import { useMemo, useState } from 'react';
import {
  FaEdit,
  FaEye,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPrint,
  FaSave,
  FaSearch,
  FaShoppingCart,
  FaTimes,
  FaTrash,
  FaUserFriends
} from 'react-icons/fa';
import {
  formatOrderCurrency,
  formatOrderDate,
  getOrderStageMeta
} from './farmerOrderConfig';
import { confirmAction } from '../utils/sweetAlert';

const createEmptyCustomerForm = () => ({
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  customerNotes: ''
});

const normalizeCustomerKey = (order) => {
  const phoneKey = (order.customerPhone || '').replace(/\s+/g, '').toLowerCase();
  if (phoneKey) {
    return phoneKey;
  }

  return `${order.customerName || 'customer'}-${order.deliveryAddress || 'address'}`
    .trim()
    .toLowerCase();
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const FarmerCustomerDetailsPage = ({ orders = [], setOrders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerMode, setDrawerMode] = useState(null);
  const [selectedCustomerKey, setSelectedCustomerKey] = useState(null);
  const [customerForm, setCustomerForm] = useState(createEmptyCustomerForm());

  const customerRecords = useMemo(() => {
    const groupedCustomers = new Map();

    orders.forEach((order) => {
      const key = normalizeCustomerKey(order);
      const existingRecord = groupedCustomers.get(key);
      const orderTimestamp = new Date(
        order.updatedAt || order.createdAt || order.requestedDate || Date.now()
      ).getTime();

      if (!existingRecord) {
        groupedCustomers.set(key, {
          key,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress,
          customerNotes: order.customerNotes || '',
          totalOrders: 1,
          totalSpent: Number(order.amount || 0),
          latestOrderTimestamp: orderTimestamp,
          latestOrderId: order.id,
          latestOrderStatus: order.status,
          latestOrderDate:
            order.updatedAt || order.createdAt || order.requestedDate || new Date().toISOString(),
          recentProducts: [order.productName].filter(Boolean),
          orders: [order]
        });
        return;
      }

      existingRecord.totalOrders += 1;
      existingRecord.totalSpent += Number(order.amount || 0);
      existingRecord.orders.push(order);

      if (order.productName && !existingRecord.recentProducts.includes(order.productName)) {
        existingRecord.recentProducts.push(order.productName);
      }

      if (order.customerNotes && !existingRecord.customerNotes) {
        existingRecord.customerNotes = order.customerNotes;
      }

      if (orderTimestamp >= existingRecord.latestOrderTimestamp) {
        existingRecord.customerName = order.customerName;
        existingRecord.customerPhone = order.customerPhone;
        existingRecord.deliveryAddress = order.deliveryAddress;
        existingRecord.latestOrderTimestamp = orderTimestamp;
        existingRecord.latestOrderId = order.id;
        existingRecord.latestOrderStatus = order.status;
        existingRecord.latestOrderDate =
          order.updatedAt || order.createdAt || order.requestedDate || new Date().toISOString();
        existingRecord.customerNotes = order.customerNotes || existingRecord.customerNotes;
      }
    });

    return Array.from(groupedCustomers.values())
      .map((customer) => ({
        ...customer,
        orders: [...customer.orders].sort((firstOrder, secondOrder) => {
          const firstTime = new Date(
            firstOrder.updatedAt || firstOrder.createdAt || firstOrder.requestedDate || 0
          ).getTime();
          const secondTime = new Date(
            secondOrder.updatedAt || secondOrder.createdAt || secondOrder.requestedDate || 0
          ).getTime();
          return secondTime - firstTime;
        })
      }))
      .sort((firstCustomer, secondCustomer) => secondCustomer.latestOrderTimestamp - firstCustomer.latestOrderTimestamp);
  }, [orders]);

  const selectedCustomer =
    customerRecords.find((customer) => customer.key === selectedCustomerKey) || null;

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return customerRecords;
    }

    return customerRecords.filter((customer) => {
      const searchableText = [
        customer.customerName,
        customer.customerPhone,
        customer.deliveryAddress,
        customer.latestOrderId,
        ...customer.recentProducts
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [customerRecords, searchQuery]);

  const summary = useMemo(
    () => ({
      totalCustomers: customerRecords.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
      activeCustomers: customerRecords.filter((customer) =>
        customer.orders.some((order) => order.status !== 'completed')
      ).length
    }),
    [customerRecords, orders]
  );

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelectedCustomerKey(null);
    setCustomerForm(createEmptyCustomerForm());
  };

  const openViewDrawer = (customer) => {
    setSelectedCustomerKey(customer.key);
    setDrawerMode('view');
  };

  const openEditDrawer = (customer) => {
    setSelectedCustomerKey(customer.key);
    setCustomerForm({
      customerName: customer.customerName || '',
      customerPhone: customer.customerPhone || '',
      deliveryAddress: customer.deliveryAddress || '',
      customerNotes: customer.customerNotes || ''
    });
    setDrawerMode('edit');
  };

  const handleSaveCustomer = (event) => {
    event.preventDefault();

    if (!selectedCustomer) {
      return;
    }

    const payload = {
      customerName: customerForm.customerName.trim(),
      customerPhone: customerForm.customerPhone.trim(),
      deliveryAddress: customerForm.deliveryAddress.trim(),
      customerNotes: customerForm.customerNotes.trim()
    };

    if (!payload.customerName || !payload.customerPhone || !payload.deliveryAddress) {
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        normalizeCustomerKey(order) === selectedCustomer.key
          ? {
              ...order,
              ...payload,
              updatedAt: new Date().toISOString()
            }
          : order
      )
    );

    closeDrawer();
  };

  const handleDeleteCustomer = async (customer) => {
    if (!customer) {
      return;
    }

    const shouldDelete = await confirmAction({
      title: 'Delete customer orders?',
      text: `Delete ${customer.customerName} and remove all ${customer.totalOrders} related order records?`,
      confirmButtonText: 'Yes, delete records'
    });

    if (!shouldDelete) {
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.filter((order) => normalizeCustomerKey(order) !== customer.key)
    );

    if (selectedCustomerKey === customer.key) {
      closeDrawer();
    }
  };

  const handlePrintCustomer = (customer) => {
    if (!customer) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=960,height=720');
    if (!printWindow) {
      return;
    }

    const rowsMarkup = customer.orders
      .map((order) => {
        const stageMeta = getOrderStageMeta(order.status);

        return `
          <tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.productName)}</td>
            <td>${escapeHtml(`${order.quantity} ${order.unit}`)}</td>
            <td>${escapeHtml(formatOrderCurrency(order.amount))}</td>
            <td>${escapeHtml(stageMeta.shortLabel)}</td>
            <td>${escapeHtml(formatOrderDate(order.updatedAt || order.createdAt || order.requestedDate))}</td>
          </tr>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(customer.customerName)} - Customer Details</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
            h1 { margin-bottom: 8px; }
            .meta { margin-bottom: 20px; color: #475569; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
            .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 14px; }
            th { background: #f8fafc; }
            .notes { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(customer.customerName)}</h1>
          <div class="meta">Customer buying and order details summary</div>
          <div class="grid">
            <div class="card"><strong>Phone</strong><br />${escapeHtml(customer.customerPhone || 'Not provided')}</div>
            <div class="card"><strong>Address</strong><br />${escapeHtml(customer.deliveryAddress || 'Not provided')}</div>
            <div class="card"><strong>Total Orders</strong><br />${escapeHtml(customer.totalOrders)}</div>
            <div class="card"><strong>Total Buying Value</strong><br />${escapeHtml(formatOrderCurrency(customer.totalSpent))}</div>
          </div>
          <div class="card notes"><strong>Customer Notes</strong><br />${escapeHtml(customer.customerNotes || 'No notes saved')}</div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Value</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>${rowsMarkup}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(240,253,244,0.98)_50%,_rgba(236,253,245,0.96)_100%)] p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <FaUserFriends className="text-xs" />
              Customer Details Panel
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 lg:text-3xl">
              View every customer who ordered your products
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-600 lg:text-base">
              This page automatically saves and displays customer buying details from your order
              pages, so you can view, edit, print, and delete customer records in one place.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-100 bg-white/90 p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Saved automatically</p>
            <p className="mt-2 text-sm text-slate-500">
              Any change you make here updates the related customer order records too.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Customers</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{summary.totalCustomers}</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Customer Orders</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{summary.totalOrders}</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Buying Value</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {formatOrderCurrency(summary.totalRevenue)}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Customers</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{summary.activeCustomers}</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Customer list</h2>
            <p className="mt-1 text-sm text-slate-500">
              Open a customer to view their order history and latest buying status.
            </p>
          </div>
          <div className="relative w-full max-w-md">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by customer, phone, product, or order..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </div>
        </div>
      </section>

      {filteredCustomers.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <FaUserFriends className="text-2xl" />
          </div>
          <h3 className="mt-6 text-2xl font-bold text-slate-900">
            {searchQuery ? 'No matching customers found' : 'No customer details available yet'}
          </h3>
          <p className="mt-3 text-sm text-slate-500">
            {searchQuery
              ? 'Try a different search term to find the customer record you need.'
              : 'Customer records will appear here automatically when orders are created or updated.'}
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Buying Details</th>
                  <th className="px-5 py-4">Latest Order</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => {
                  const latestStage = getOrderStageMeta(customer.latestOrderStatus);

                  return (
                    <tr key={customer.key} className="align-top transition hover:bg-slate-50/80">
                      <td className="px-5 py-5">
                        <p className="text-sm font-bold text-slate-900">{customer.customerName}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {customer.totalOrders} order{customer.totalOrders > 1 ? 's' : ''} saved
                        </p>
                      </td>
                      <td className="px-5 py-5 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <FaPhoneAlt className="mt-1 text-slate-400" />
                          <span>{customer.customerPhone}</span>
                        </div>
                        <div className="mt-3 flex items-start gap-2">
                          <FaMapMarkerAlt className="mt-1 text-slate-400" />
                          <span>{customer.deliveryAddress}</span>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-sm text-slate-600">
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          <FaShoppingCart className="text-emerald-500" />
                          {formatOrderCurrency(customer.totalSpent)}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Products: {customer.recentProducts.slice(0, 3).join(', ')}
                          {customer.recentProducts.length > 3
                            ? ` +${customer.recentProducts.length - 3} more`
                            : ''}
                        </p>
                      </td>
                      <td className="px-5 py-5 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">{customer.latestOrderId}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          Updated: {formatOrderDate(customer.latestOrderDate)}
                        </p>
                      </td>
                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${latestStage.badgeClass}`}
                        >
                          {latestStage.shortLabel}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openViewDrawer(customer)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <FaEye className="text-xs" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditDrawer(customer)}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintCustomer(customer)}
                            className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                          >
                            <FaPrint className="text-xs" />
                            Print
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomer(customer)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                          >
                            <FaTrash className="text-xs" />
                            Delete
                          </button>
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

      {drawerMode && selectedCustomer && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/45 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close customer details drawer"
            className="h-full flex-1"
            onClick={closeDrawer}
          />
          <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-slate-50 px-5 py-6 shadow-2xl sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={closeDrawer}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"
            >
              <FaTimes />
            </button>

            {drawerMode === 'view' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-6 pr-10">
                  <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    Customer Detail View
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900">{selectedCustomer.customerName}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Full customer contact details, order history, and current buying summary.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Phone Number</p>
                    <p className="mt-3 text-lg font-bold text-slate-900">{selectedCustomer.customerPhone}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Buying Value</p>
                    <p className="mt-3 text-lg font-bold text-slate-900">
                      {formatOrderCurrency(selectedCustomer.totalSpent)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
                    <p className="text-sm font-medium text-slate-500">Delivery Address</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {selectedCustomer.deliveryAddress}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
                    <p className="text-sm font-medium text-slate-500">Customer Notes</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      {selectedCustomer.customerNotes || 'No customer notes saved yet.'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">Order history</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Every order currently connected to this customer record.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrintCustomer(selectedCustomer)}
                      className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                    >
                      <FaPrint className="text-xs" />
                      Print
                    </button>
                  </div>
                  <div className="mt-5 space-y-3">
                    {selectedCustomer.orders.map((order) => {
                      const stageMeta = getOrderStageMeta(order.status);

                      return (
                        <div
                          key={order.id}
                          className="rounded-[1.35rem] border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {order.id} · {order.productName}
                              </p>
                              <p className="mt-2 text-sm text-slate-600">
                                {order.quantity} {order.unit} · {formatOrderCurrency(order.amount)}
                              </p>
                              <p className="mt-2 text-xs text-slate-500">
                                Updated: {formatOrderDate(order.updatedAt || order.createdAt || order.requestedDate)}
                              </p>
                            </div>
                            <span
                              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${stageMeta.badgeClass}`}
                            >
                              {stageMeta.shortLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {drawerMode === 'edit' && (
              <form className="space-y-6" onSubmit={handleSaveCustomer}>
                <div className="border-b border-slate-100 pb-6 pr-10">
                  <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    Edit Customer Details
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900">
                    Update {selectedCustomer.customerName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Save contact details here to update every related customer order record.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Customer Name
                    <input
                      type="text"
                      value={customerForm.customerName}
                      onChange={(event) =>
                        setCustomerForm((current) => ({
                          ...current,
                          customerName: event.target.value
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Phone Number
                    <input
                      type="text"
                      value={customerForm.customerPhone}
                      onChange={(event) =>
                        setCustomerForm((current) => ({
                          ...current,
                          customerPhone: event.target.value
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700 md:col-span-2">
                    Delivery Address
                    <textarea
                      rows={3}
                      value={customerForm.deliveryAddress}
                      onChange={(event) =>
                        setCustomerForm((current) => ({
                          ...current,
                          deliveryAddress: event.target.value
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700 md:col-span-2">
                    Customer Notes
                    <textarea
                      rows={4}
                      value={customerForm.customerNotes}
                      onChange={(event) =>
                        setCustomerForm((current) => ({
                          ...current,
                          customerNotes: event.target.value
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                      placeholder="Add delivery notes, buying preferences, or customer reminders..."
                    />
                  </label>
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <FaSave className="text-xs" />
                    Save Customer
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

export default FarmerCustomerDetailsPage;

const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const TAX_RATE = 0.05;
const COD_FEE = 25;
const SHIPPING_OPTIONS = {
  standard: { price: 50 },
  express: { price: 100 },
  free: { price: 0 }
};
const DISCOUNT_CODES = {
  SAVE10: 0.1,
  WELCOME20: 0.2,
  FRESH15: 0.15
};

app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dedicated_economic_center',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const roundMoney = (value) => Number.parseFloat((Number(value) || 0).toFixed(2));
const normalizeText = (value) => String(value || '').trim();
const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
const isValidPhone = (value) => /^[0-9+\s-]{9,15}$/.test(value);
const isValidExpiry = (value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
const isValidCvv = (value) => /^\d{3,4}$/.test(value);
const ORDER_STATUSES = ['pending', 'processing', 'packing', 'delivery', 'completed', 'delivered', 'cancelled'];

const sanitizeItems = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          productId: Number.parseInt(item?.productId, 10),
          quantity: Number.parseInt(item?.quantity, 10),
          price: roundMoney(Number.parseFloat(item?.price))
        }))
        .filter(
          (item) =>
            Number.isInteger(item.productId) &&
            item.productId > 0 &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            item.price >= 0
        )
    : [];

const mapOrderRows = (rows) => {
  const orderMap = new Map();

  rows.forEach((row) => {
    if (!orderMap.has(row.order_id)) {
      orderMap.set(row.order_id, {
        id: row.order_id,
        orderNumber: `ORD-${String(row.order_id).padStart(6, '0')}`,
        status: row.status || 'pending',
        createdAt: row.order_created_at,
        customer: {
          id: row.user_id,
          name: row.customer_name,
          email: row.customer_email,
          phone: row.customer_phone,
          address: row.customer_address,
          city: row.customer_city,
          zipCode: row.customer_zip
        },
        shippingMethod: row.shipping_method,
        paymentMethod: row.payment_method,
        discountCode: row.discount_code,
        totals: {
          subtotal: roundMoney(Number.parseFloat(row.subtotal)),
          discount: roundMoney(Number.parseFloat(row.discount)),
          shippingCost: roundMoney(Number.parseFloat(row.shipping_cost)),
          tax: roundMoney(Number.parseFloat(row.tax)),
          total: roundMoney(Number.parseFloat(row.total))
        },
        items: []
      });
    }

    if (row.order_item_id) {
      orderMap.get(row.order_id).items.push({
        id: row.order_item_id,
        productId: row.product_id,
        productName: row.product_name || 'Ordered product',
        image:
          row.product_image ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=450&fit=crop',
        category: row.product_category || 'Produce',
        quantity: Number.parseInt(row.item_quantity, 10) || 1,
        price: roundMoney(Number.parseFloat(row.item_price)),
        unit: row.product_unit || 'unit',
        location: row.product_address || 'Sri Lanka',
        farmerId: row.farmer_id,
        farmerName: row.farmer_name || 'Product farmer'
      });
    }
  });

  return Array.from(orderMap.values());
};

const orderListSql = `
  SELECT
    o.id AS order_id,
    o.user_id,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.customer_address,
    o.customer_city,
    o.customer_zip,
    o.shipping_method,
    o.payment_method,
    o.discount_code,
    o.discount,
    o.subtotal,
    o.shipping_cost,
    o.tax,
    o.total,
    o.status,
    o.created_at AS order_created_at,
    oi.id AS order_item_id,
    oi.product_id,
    oi.quantity AS item_quantity,
    oi.price AS item_price,
    p.name AS product_name,
    p.image_url AS product_image,
    p.category AS product_category,
    p.unit AS product_unit,
    p.address AS product_address,
    p.farmer_id,
    u.name AS farmer_name
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products p ON p.id = oi.product_id
  LEFT JOIN users u ON u.id = p.farmer_id
`;

app.post('/api/orders', async (req, res) => {
  const {
    userId,
    customer = {},
    items = [],
    shippingMethod,
    paymentMethod,
    paymentDetails,
    discountCode
  } = req.body;

  const normalizedCustomer = {
    name: normalizeText(customer.name),
    email: normalizeText(customer.email),
    phone: normalizeText(customer.phone),
    address: normalizeText(customer.address),
    city: normalizeText(customer.city),
    zipCode: normalizeText(customer.zipCode),
    notes: normalizeText(customer.notes)
  };
  const normalizedItems = sanitizeItems(items);
  const normalizedShippingMethod = normalizeText(shippingMethod).toLowerCase();
  const normalizedPaymentMethod = normalizeText(paymentMethod).toLowerCase();
  const normalizedDiscountCode = normalizeText(discountCode).toUpperCase();

  if (
    !normalizedCustomer.name ||
    !normalizedCustomer.email ||
    !normalizedCustomer.phone ||
    !normalizedCustomer.address ||
    !normalizedCustomer.city ||
    !normalizedCustomer.zipCode
  ) {
    return res.status(400).json({ error: 'Missing required customer details.' });
  }

  if (!isValidEmail(normalizedCustomer.email)) {
    return res.status(400).json({ error: 'Invalid customer email address.' });
  }

  if (!isValidPhone(normalizedCustomer.phone)) {
    return res.status(400).json({ error: 'Invalid customer phone number.' });
  }

  if (normalizedItems.length === 0) {
    return res.status(400).json({ error: 'At least one valid order item is required.' });
  }

  if (!SHIPPING_OPTIONS[normalizedShippingMethod]) {
    return res.status(400).json({ error: 'Invalid shipping method.' });
  }

  if (!['card', 'cod'].includes(normalizedPaymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method.' });
  }

  const normalizedCard =
    normalizedPaymentMethod === 'card'
      ? {
          cardNumber: String(paymentDetails?.cardNumber || '').replace(/\D/g, ''),
          cardName: normalizeText(paymentDetails?.cardName),
          cardExpiry: normalizeText(paymentDetails?.cardExpiry),
          cardCVV: String(paymentDetails?.cardCVV || '').replace(/\D/g, '')
        }
      : null;

  if (normalizedPaymentMethod === 'card') {
    if (
      normalizedCard.cardNumber.length !== 16 ||
      !normalizedCard.cardName ||
      !isValidExpiry(normalizedCard.cardExpiry) ||
      !isValidCvv(normalizedCard.cardCVV)
    ) {
      return res.status(400).json({ error: 'Invalid card payment details.' });
    }
  }

  const subtotal = roundMoney(
    normalizedItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  );
  const discountRate = DISCOUNT_CODES[normalizedDiscountCode] || 0;
  const discount = roundMoney(subtotal * discountRate);
  const shippingCost = roundMoney(SHIPPING_OPTIONS[normalizedShippingMethod].price);
  const codFee = normalizedPaymentMethod === 'cod' ? COD_FEE : 0;
  const tax = roundMoney(Math.max(subtotal - discount, 0) * TAX_RATE);
  const total = roundMoney(subtotal + shippingCost + codFee + tax - discount);

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.execute(
      `INSERT INTO orders
        (user_id, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_zip,
         shipping_method, payment_method, discount_code, discount, subtotal, shipping_cost, tax, total, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        Number.isInteger(Number(userId)) ? Number(userId) : null,
        normalizedCustomer.name,
        normalizedCustomer.email,
        normalizedCustomer.phone,
        normalizedCustomer.address,
        normalizedCustomer.city,
        normalizedCustomer.zipCode,
        normalizedShippingMethod,
        normalizedPaymentMethod,
        normalizedDiscountCode || null,
        discount,
        subtotal,
        shippingCost,
        tax,
        total
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of normalizedItems) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    if (normalizedPaymentMethod === 'card' && normalizedCard) {
      await connection.execute(
        `INSERT INTO order_payments (order_id, card_last4, card_name, card_expiry, payment_status, created_at)
         VALUES (?, ?, ?, ?, 'paid', NOW())`,
        [
          orderId,
          normalizedCard.cardNumber.slice(-4),
          normalizedCard.cardName,
          normalizedCard.cardExpiry
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      orderId,
      orderNumber: `ORD-${String(orderId).padStart(6, '0')}`,
      totals: {
        subtotal,
        discount,
        shippingCost,
        codFee,
        tax,
        total
      }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Order creation failed:', error);
    return res.status(500).json({ error: 'Order creation failed', details: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/orders', async (req, res) => {
  const requestedUserId = Number.parseInt(req.query.userId, 10);
  const requestedEmail = normalizeText(req.query.email).toLowerCase();
  const filters = [];
  const params = [];

  if (Number.isInteger(requestedUserId) && requestedUserId > 0) {
    filters.push('o.user_id = ?');
    params.push(requestedUserId);
  }

  if (requestedEmail) {
    filters.push('LOWER(o.customer_email) = ?');
    params.push(requestedEmail);
  }

  if (filters.length === 0) {
    return res.status(400).json({ error: 'A user id or email is required to fetch orders.' });
  }

  try {
    const [rows] = await pool.execute(
      `
        ${orderListSql}
        WHERE ${filters.map((filter) => `(${filter})`).join(' OR ')}
        ORDER BY o.created_at DESC, oi.id ASC
      `,
      params
    );

    return res.json({ orders: mapOrderRows(rows) });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

app.get('/api/admin/orders', async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      ${orderListSql}
      ORDER BY o.created_at DESC, oi.id ASC
    `);

    return res.json({ orders: mapOrderRows(rows) });
  } catch (error) {
    console.error('Failed to fetch admin orders:', error);
    return res.status(500).json({ error: 'Failed to fetch admin orders', details: error.message });
  }
});

app.get('/api/farmer/:farmerId/orders', async (req, res) => {
  const farmerId = Number.parseInt(req.params.farmerId, 10);

  if (!Number.isInteger(farmerId) || farmerId <= 0) {
    return res.status(400).json({ error: 'A valid farmer id is required.' });
  }

  try {
    const [rows] = await pool.execute(
      `
        ${orderListSql}
        WHERE p.farmer_id = ?
        ORDER BY o.created_at DESC, oi.id ASC
      `,
      [farmerId]
    );

    return res.json({ orders: mapOrderRows(rows) });
  } catch (error) {
    console.error('Failed to fetch farmer orders:', error);
    return res.status(500).json({ error: 'Failed to fetch farmer orders', details: error.message });
  }
});

app.patch('/api/orders/:orderId', async (req, res) => {
  const orderId = Number.parseInt(req.params.orderId, 10);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: 'A valid order id is required.' });
  }

  const updates = [];
  const params = [];
  const allowedTextFields = {
    customerName: 'customer_name',
    customerEmail: 'customer_email',
    customerPhone: 'customer_phone',
    customerAddress: 'customer_address',
    customerCity: 'customer_city',
    customerZip: 'customer_zip',
    shippingMethod: 'shipping_method',
    paymentMethod: 'payment_method'
  };

  Object.entries(allowedTextFields).forEach(([field, column]) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates.push(`${column} = ?`);
      params.push(normalizeText(req.body[field]));
    }
  });

  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    const status = normalizeText(req.body.status).toLowerCase();

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    updates.push('status = ?');
    params.push(status);
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'total')) {
    const total = roundMoney(Number.parseFloat(req.body.total));

    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({ error: 'Order total must be a valid number.' });
    }

    updates.push('total = ?');
    params.push(total);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid order fields were provided.' });
  }

  params.push(orderId);

  try {
    const [result] = await pool.execute(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const [rows] = await pool.execute(
      `
        ${orderListSql}
        WHERE o.id = ?
        ORDER BY oi.id ASC
      `,
      [orderId]
    );

    return res.json({ success: true, order: mapOrderRows(rows)[0] || null });
  } catch (error) {
    console.error('Failed to update order:', error);
    return res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
});

app.delete('/api/orders/:orderId', async (req, res) => {
  const orderId = Number.parseInt(req.params.orderId, 10);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: 'A valid order id is required.' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [orderId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return res.status(500).json({ error: 'Failed to delete order', details: error.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { productId, name, email, rating, review } = req.body;

  if (!productId || !name || !rating || !review) {
    return res.status(400).json({ error: 'Missing review fields' });
  }

  try {
    await pool.execute(
      `INSERT INTO product_reviews (product_id, name, email, rating, review, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [productId, name, email || null, rating, review]
    );

    return res.json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Review submission failed', details: error.message });
  }
});

app.get('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT id, name, rating, review, created_at
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY created_at DESC`,
      [productId]
    );

    return res.json(rows);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Failed to fetch reviews', details: error.message });
  }
});

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Payment backend running on port ${PORT}`);
});

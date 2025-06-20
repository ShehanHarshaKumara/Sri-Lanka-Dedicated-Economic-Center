const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dedicated_economic_center',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create Order (with payment)
app.post('/api/orders', async (req, res) => {
  const {
    userId, // optional, for logged-in users
    customer, // { name, email, phone, address, city, zipCode }
    items, // [{ productId, quantity, price }]
    shippingMethod, // string
    paymentMethod, // 'card' | 'cod'
    paymentDetails, // { cardNumber, cardName, cardExpiry, cardCVV } if card
    discountCode,
    discount,
    subtotal,
    shippingCost,
    tax,
    total
  } = req.body;

  if (!customer || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert order
    const [orderResult] = await conn.execute(
      `INSERT INTO orders 
        (user_id, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_zip, 
         shipping_method, payment_method, discount_code, discount, subtotal, shipping_cost, tax, total, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        userId || null,
        customer.name, customer.email, customer.phone, customer.address, customer.city, customer.zipCode,
        shippingMethod, paymentMethod, discountCode || null, discount || 0, subtotal, shippingCost, tax, total
      ]
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    // Optionally, store payment details (never store CVV, and card info should be tokenized in production)
    if (paymentMethod === 'card' && paymentDetails) {
      await conn.execute(
        `INSERT INTO order_payments (order_id, card_last4, card_name, card_expiry, payment_status, created_at)
         VALUES (?, ?, ?, ?, 'paid', NOW())`,
        [
          orderId,
          paymentDetails.cardNumber.slice(-4),
          paymentDetails.cardName,
          paymentDetails.cardExpiry
        ]
      );
    }

    await conn.commit();
    res.json({ success: true, orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Order creation failed', details: err.message });
  } finally {
    conn.release();
  }
});

// Submit Product Review
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Review submission failed', details: err.message });
  }
});

// Get Reviews for a Product
app.get('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, rating, review, created_at FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC`,
      [productId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Payment backend running on port ${PORT}`);
});

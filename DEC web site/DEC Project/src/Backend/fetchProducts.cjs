const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // set your password if any
  database: 'dedicated_economic_center'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

// GET all products (for customers)
app.get('/api/products', (req, res) => {
  const sql = `
    SELECT 
      p.id, p.name, p.description, p.price, p.quantity, p.category, p.image_url, 
      p.address, p.created_at, u.name AS seller, u.id AS seller_id
    FROM products p
    JOIN users u ON p.farmer_id = u.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// (Optional) Serve images if you store them locally
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 5001; // Or any port you use
app.listen(PORT, () => {
  console.log(`Products API server running on port ${PORT}`);
});
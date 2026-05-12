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
  ensureAdminProductColumns();
});

const ensureAdminProductColumns = () => {
  db.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dedicated_economic_center'
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'status'
  `, (err, rows) => {
    if (err) {
      console.error('Error checking product status column:', err);
      return;
    }

    if (rows.length > 0) {
      return;
    }

    db.query(`ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT 'active'`, (alterErr) => {
      if (alterErr) {
        console.error('Error adding product status column:', alterErr);
        return;
      }

      console.log('Product status column added successfully');
    });
  });
};

// GET all products (for customers)
app.get('/api/products', (req, res) => {
  const sql = `
    SELECT 
      p.id, p.name, p.description, p.price, p.quantity, p.category, p.image_url, 
      p.address, p.lat, p.lng, p.created_at, u.name AS seller, u.id AS seller_id
    FROM products p
    JOIN users u ON p.farmer_id = u.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Format results with proper image handling
    const formattedResults = results.map(product => ({
      ...product,
      image_url: product.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop'
    }));
    
    res.json(formattedResults);
  });
});

// GET all products for admin dashboard
app.get('/api/admin/products', (req, res) => {
  const sql = `
    SELECT 
      p.id, 
      p.name, 
      p.description, 
      p.price, 
      p.quantity as stock, 
      p.category, 
      p.image_url, 
      p.address, 
      p.lat,
      p.lng,
      p.created_at,
      p.status,
      u.name AS farmer,
      u.id AS farmer_id
    FROM products p
    JOIN users u ON p.farmer_id = u.id
    ORDER BY p.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching admin products:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Format the results to match frontend expectations
    const formattedResults = results.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      farmer: product.farmer,
      farmerId: product.farmer_id,
      price: parseFloat(product.price),
      stock: parseInt(product.stock) || 0,
      image: product.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
      image_url: product.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
      status: product.status || 'active',
      sales: 0, // Default to 0 since we don't have order tables yet
      rating: 4.5, // Default rating
      description: product.description,
      address: product.address,
      lat: product.lat,
      lng: product.lng,
      created_at: product.created_at
    }));
    
    res.json(formattedResults);
  });
});

// GET product statistics for admin dashboard
app.get('/api/admin/product-stats', (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_products,
      COUNT(CASE WHEN COALESCE(p.status, 'active') = 'active' THEN 1 END) as active_products,
      COUNT(CASE WHEN p.quantity < 50 THEN 1 END) as low_stock_products,
      COUNT(DISTINCT p.category) as total_categories
    FROM products p
  `;
  
  db.query(statsQuery, (err, results) => {
    if (err) {
      console.error('Error fetching product stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results[0]);
  });
});

// (Optional) Serve images if you store them locally
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 5050; // Or any port you use
app.listen(PORT, () => {
  console.log(`Products API server running on port ${PORT}`);
});

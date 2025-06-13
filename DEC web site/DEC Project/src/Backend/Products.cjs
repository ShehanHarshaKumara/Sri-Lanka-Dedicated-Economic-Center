// Full Express backend code for uploading products (with MySQL and image upload support)

const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dedicated_economic_center'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// Product upload endpoint
app.post('/api/products/upload', upload.single('image'), (req, res) => {
  const {
    farmer_id,        // Should be provided by frontend or session
    name,
    description,
    price,
    quantity,
    category,
    lat,
    lng,
    address
  } = req.body;

  // Validate required fields
  if (!farmer_id || !name || !price || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    INSERT INTO products
    (farmer_id, name, description, price, quantity, category, image_url, lat, lng, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      farmer_id,
      name,
      description || null,
      price,
      quantity,
      category || null,
      image_url,
      lat || null,
      lng || null,
      address || null
    ],
    (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, productId: result.insertId });
    }
  );
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
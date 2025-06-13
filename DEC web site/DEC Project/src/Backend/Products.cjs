const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(uploadsDir));

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

// Multer for multiple images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// Product upload endpoint
app.post('/api/products/upload', upload.array('images', 5), (req, res) => {
  try {
    const {
      farmer_id,
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

    // Save only the first image as main image
    let image_url = null;
    if (req.files && req.files.length > 0) {
      image_url = `/uploads/${req.files[0].filename}`;
    }

    const sql = `
      INSERT INTO products
      (farmer_id, name, description, price, quantity, category, image_url, lat, lng, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        parseInt(farmer_id),
        name,
        description || null,
        parseFloat(price),
        parseInt(quantity),
        category || null,
        image_url,
        lat ? parseFloat(lat) : null,
        lng ? parseFloat(lng) : null,
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
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET endpoint to fetch products for a farmer
app.get('/api/products', (req, res) => {
  const farmer_id = req.query.farmer_id;
  let sql = 'SELECT * FROM products';
  let params = [];
  if (farmer_id) {
    sql += ' WHERE farmer_id = ? ORDER BY created_at DESC';
    params.push(farmer_id);
  } else {
    sql += ' ORDER BY created_at DESC';
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
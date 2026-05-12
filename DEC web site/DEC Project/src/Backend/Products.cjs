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
  
  // Check and add missing columns
  checkAndAddColumns();
});

// Function to check and add missing columns
function checkAndAddColumns() {
  // Check if unit column exists
  db.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'dedicated_economic_center' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'unit'
  `, (err, results) => {
    if (err) {
      console.error('Error checking unit column:', err);
      return;
    }
    
    if (results.length === 0) {
      // Add unit column if it doesn't exist
      db.query(`ALTER TABLE products ADD COLUMN unit VARCHAR(20) DEFAULT 'kg'`, (err) => {
        if (err) {
          console.error('Error adding unit column:', err);
        } else {
          console.log('Unit column added successfully');
        }
      });
    }
  });
  
  // Check if status column exists
  db.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'dedicated_economic_center' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'status'
  `, (err, results) => {
    if (err) {
      console.error('Error checking status column:', err);
      return;
    }
    
    if (results.length === 0) {
      // Add status column if it doesn't exist
      db.query(`ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT 'active'`, (err) => {
        if (err) {
          console.error('Error adding status column:', err);
        } else {
          console.log('Status column added successfully');
        }
      });
    }
  });
}

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
      address,
      unit,
      status
    } = req.body;

    // Debug logging
    console.log('Upload request body:', req.body);
    console.log('Upload files:', req.files);

    // Validate required fields
    if (!farmer_id || !name || !price || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: farmer_id, name, price, and quantity are required' 
      });
    }

    // Validate numeric fields
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Price must be a valid positive number' 
      });
    }

    if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be a valid positive number' 
      });
    }

    let image_url = null;
    if (req.files && req.files.length > 0) {
      // Validate image file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.files[0].mimetype)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid image format. Please upload JPG, PNG, or GIF files only.' 
        });
      }
      image_url = `http://127.0.0.1:5001/uploads/${req.files[0].filename}`;
    }

    // First, check which columns exist
    db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'dedicated_economic_center' 
      AND TABLE_NAME = 'products'
    `, (err, columns) => {
      if (err) {
        console.error('Error checking columns:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Database error while checking table structure' 
        });
      }

      const columnNames = columns.map(col => col.COLUMN_NAME);
      const hasUnit = columnNames.includes('unit');
      const hasStatus = columnNames.includes('status');

      let sql = `
        INSERT INTO products
        (farmer_id, name, description, price, quantity, category, image_url, lat, lng, address${hasUnit ? ', unit' : ''}${hasStatus ? ', status' : ''})
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?${hasUnit ? ', ?' : ''}${hasStatus ? ', ?' : ''})
      `;

      const values = [
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
      ];

      if (hasUnit) values.push(unit || 'kg');
      if (hasStatus) values.push(status || 'active');

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ 
            success: false, 
            error: 'Failed to save product to database: ' + err.message 
          });
        }
        
        console.log('Product inserted successfully, ID:', result.insertId);
        res.json({ 
          success: true, 
          productId: result.insertId,
          message: 'Product uploaded successfully'
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
});

// Product update endpoint
app.put('/api/products/:id', upload.array('images', 5), (req, res) => {
  try {
    const productId = req.params.id;
    
    // Validate product ID
    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid product ID' 
      });
    }

    // Debug logging
    console.log('Update request body:', req.body);
    console.log('Update files:', req.files);
    console.log('Product ID:', productId);

    const normalizeText = (value) => (value === undefined || value === null ? '' : String(value).trim());

    // Safely normalize with validation
    const name = normalizeText(req.body.name);
    const description = normalizeText(req.body.description);
    const price = req.body.price;
    const quantity = req.body.quantity;
    const category = normalizeText(req.body.category);
    const lat = req.body.lat || null;
    const lng = req.body.lng || null;
    const address = normalizeText(req.body.address);
    const unit = normalizeText(req.body.unit) || 'kg';
    const status = normalizeText(req.body.status) || 'active';

    // Validate required fields
    if (!name || price === undefined || price === null || price === '' || quantity === undefined || quantity === null || quantity === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, price, and quantity are required' 
      });
    }

    // Validate numeric fields
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Price must be a valid positive number' 
      });
    }

    if (isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be zero or a valid positive number' 
      });
    }

    // Handle image URL
    let image_url = req.body.image_url || null;
    if (req.files && req.files.length > 0) {
      // Validate image file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.files[0].mimetype)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid image format. Please upload JPG, PNG, or GIF files only.' 
        });
      }
      image_url = `http://127.0.0.1:5001/uploads/${req.files[0].filename}`;
    }

    // First, check which columns exist
    db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'dedicated_economic_center' 
      AND TABLE_NAME = 'products'
    `, (err, columns) => {
      if (err) {
        console.error('Error checking columns:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Database error while checking table structure' 
        });
      }

      const columnNames = columns.map(col => col.COLUMN_NAME);
      const hasUnit = columnNames.includes('unit');
      const hasStatus = columnNames.includes('status');

      let sql = `
        UPDATE products SET
          name = ?,
          description = ?,
          price = ?,
          quantity = ?,
          category = ?,
          image_url = ?,
          lat = ?,
          lng = ?,
          address = ?
      `;

      const values = [
        name,
        description,
        parseFloat(price),
        parseInt(quantity),
        category,
        image_url,
        lat ? parseFloat(lat) : null,
        lng ? parseFloat(lng) : null,
        address
      ];

      if (hasUnit) {
        sql += ', unit = ?';
        values.push(unit);
      }

      if (hasStatus) {
        sql += ', status = ?';
        values.push(status);
      }

      sql += ' WHERE id = ?';
      values.push(parseInt(productId));

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Update error:', err);
          return res.status(500).json({ 
            success: false, 
            error: 'Failed to update product: ' + err.message 
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            success: false, 
            error: 'Product not found' 
          });
        }
        
        console.log('Update successful, affected rows:', result.affectedRows);
        res.json({ 
          success: true, 
          affectedRows: result.affectedRows,
          message: 'Product updated successfully'
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
});

// GET endpoint to fetch products for a farmer
app.get('/api/products', (req, res) => {
  const farmer_id = req.query.farmer_id;
  
  // First check which columns exist
  db.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'dedicated_economic_center' 
    AND TABLE_NAME = 'products'
  `, (err, columns) => {
    if (err) {
      console.error('Error checking columns:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const columnNames = columns.map(col => col.COLUMN_NAME);
    const hasUnit = columnNames.includes('unit');
    const hasStatus = columnNames.includes('status');

    let sql = `
      SELECT 
        id, farmer_id, name, description, price, quantity, category, 
        image_url, lat, lng, address, created_at
        ${hasUnit ? ', unit' : ''}
        ${hasStatus ? ', status' : ''}
      FROM products
    `;
    
    let params = [];
    
    if (farmer_id) {
      sql += ' WHERE farmer_id = ? ORDER BY created_at DESC';
      params.push(parseInt(farmer_id));
    } else {
      sql += ' ORDER BY created_at DESC';
    }
    
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error('Fetch error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Add default values for missing columns
      const productsWithDefaults = results.map(product => ({
        ...product,
        unit: hasUnit ? product.unit : 'kg',
        status: hasStatus ? product.status : 'active'
      }));
      
      res.json(productsWithDefaults);
    });
  });
});

// GET single product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  
  const sql = 'SELECT * FROM products WHERE id = ?';
  
  db.query(sql, [parseInt(productId)], (err, results) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(results[0]);
  });
});

// DELETE endpoint for products
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  
  // Validate product ID
  if (!productId || isNaN(parseInt(productId))) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid product ID' 
    });
  }
  
  // First, get the product to delete its image file
  const selectSql = 'SELECT image_url FROM products WHERE id = ?';
  
  db.query(selectSql, [parseInt(productId)], (err, results) => {
    if (err) {
      console.error('Select error:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error while finding product' 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    // Extract filename from URL if exists
    const imageUrl = results[0].image_url;
    if (imageUrl) {
      const filename = imageUrl.split('/').pop();
      const filepath = path.join(uploadsDir, filename);
      
      // Delete the file if it exists
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
          console.log('Deleted image file:', filename);
        } catch (fileErr) {
          console.error('Error deleting image file:', fileErr);
          // Continue with database deletion even if file deletion fails
        }
      }
    }
    
    // Now delete the product from database
    const deleteSql = 'DELETE FROM products WHERE id = ?';
    
    db.query(deleteSql, [parseInt(productId)], (err, result) => {
      if (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to delete product from database' 
        });
      }
      
      res.json({ 
        success: true, 
        affectedRows: result.affectedRows,
        message: 'Product deleted successfully'
      });
    });
  });
});

// Update product status endpoint
app.patch('/api/products/:id/status', (req, res) => {
  const productId = req.params.id;
  const { status } = req.body;
  
  // Validate product ID
  if (!productId || isNaN(parseInt(productId))) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid product ID' 
    });
  }
  
  if (!status || !['active', 'inactive'].includes(status)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid status. Must be either "active" or "inactive"' 
    });
  }

  // Check if status column exists
  db.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'dedicated_economic_center' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'status'
  `, (err, results) => {
    if (err) {
      console.error('Error checking status column:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error while checking table structure' 
      });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status column does not exist in database' 
      });
    }

    const sql = 'UPDATE products SET status = ? WHERE id = ?';
    
    db.query(sql, [status, parseInt(productId)], (err, result) => {
      if (err) {
        console.error('Status update error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to update product status' 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Product not found' 
        });
      }
      
      res.json({ 
        success: true, 
        affectedRows: result.affectedRows,
        message: `Product status updated to ${status}`
      });
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB per image.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 5 images allowed.'
      });
    }
  }
  
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// No changes needed for backend logic for this requirement.

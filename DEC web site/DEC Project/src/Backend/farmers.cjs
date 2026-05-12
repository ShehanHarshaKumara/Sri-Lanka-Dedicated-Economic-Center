const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads folder with proper caching
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1d', // Cache images for 1 day
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// Database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Replace with your database user
  password: '', // Replace with your database password
  database: 'dedicated_economic_center', // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Helper function to construct full image URLs
const constructImageUrls = (data) => {
  const baseUrl = 'http://127.0.0.1:5003/uploads/';

  if (Array.isArray(data)) {
    return data.map(item => {
      if (item.profile_image && !item.profile_image.startsWith('http')) {
        item.profile_image = baseUrl + item.profile_image;
      }
      if (item.image_url && !item.image_url.startsWith('http')) {
        item.image_url = baseUrl + item.image_url;
      }
      return item;
    });
  } else {
    if (data.profile_image && !data.profile_image.startsWith('http')) {
      data.profile_image = baseUrl + data.profile_image;
    }
    if (data.image_url && !data.image_url.startsWith('http')) {
      data.image_url = baseUrl + data.image_url;
    }
    return data;
  }
};

// ====================== FARMERS ROUTES ======================

// Get all farmers with their products
app.get('/api/farmers', async (req, res) => {
  try {
    const farmersQuery = `
      SELECT 
        u.id as user_id,
        u.name as full_name,
        fp.first_name,
        fp.last_name,
        fp.email,
        fp.phone,
        fp.age,
        fp.experience,
        fp.farming_type,
        fp.address,
        fp.city,
        fp.bio,
        fp.profile_image,
        fp.location_lat,
        fp.location_lng,
        fp.location_address,
        COUNT(DISTINCT p.id) as total_products,
        COALESCE(AVG(p.price), 0) as avg_price
      FROM users u
      INNER JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN products p ON u.id = p.farmer_id
      WHERE u.role = 'farmer'
      GROUP BY u.id, fp.id
      ORDER BY u.name
    `;

    const [farmers] = await pool.execute(farmersQuery);

    // Get products for each farmer
    const farmersWithProducts = await Promise.all(
      farmers.map(async (farmer) => {
        const productsQuery = `
          SELECT 
            id,
            name,
            description,
            price,
            quantity,
            category,
            image_url,
            address as product_address,
            created_at
          FROM products
          WHERE farmer_id = ?
          ORDER BY created_at DESC
          LIMIT 6
        `;
        const [products] = await pool.execute(productsQuery, [farmer.user_id]);
        return {
          ...constructImageUrls(farmer),
          products: constructImageUrls(products)
        };
      })
    );

    res.json(farmersWithProducts);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Failed to fetch farmers data' });
  }
});

// Get single farmer details with all products
app.get('/api/farmers/:id', async (req, res) => {
  try {
    const farmerId = req.params.id;

    const farmerQuery = `
      SELECT 
        u.id as user_id,
        u.name as full_name,
        fp.*
      FROM users u
      INNER JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.id = ? AND u.role = 'farmer'
    `;

    const [farmerResult] = await pool.execute(farmerQuery, [farmerId]);

    if (farmerResult.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const farmer = farmerResult[0];

    const productsQuery = `
      SELECT 
        id,
        name,
        description,
        price,
        quantity,
        category,
        image_url,
        lat,
        lng,
        address,
        created_at
      FROM products
      WHERE farmer_id = ?
      ORDER BY created_at DESC
    `;

    const [products] = await pool.execute(productsQuery, [farmerId]);

    const statsQuery = `
      SELECT 
        COUNT(*) as total_products,
        SUM(quantity) as total_inventory,
        COUNT(DISTINCT category) as total_categories,
        COALESCE(AVG(price), 0) as avg_price
      FROM products
      WHERE farmer_id = ?
    `;

    const [stats] = await pool.execute(statsQuery, [farmerId]);

    res.json({
      ...constructImageUrls(farmer),
      products: constructImageUrls(products),
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching farmer details:', error);
    res.status(500).json({ error: 'Failed to fetch farmer details' });
  }
});

// Search farmers by name, location, or farming type
app.get('/api/farmers/search', async (req, res) => {
  try {
    const { q, type, city } = req.query;
    let query = `
      SELECT 
        u.id as user_id,
        u.name as full_name,
        fp.first_name,
        fp.last_name,
        fp.email,
        fp.phone,
        fp.farming_type,
        fp.city,
        fp.bio,
        fp.profile_image,
        COUNT(DISTINCT p.id) as total_products
      FROM users u
      INNER JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN products p ON u.id = p.farmer_id
      WHERE u.role = 'farmer'
    `;

    const params = [];

    if (q) {
      query += ` AND (u.name LIKE ? OR fp.bio LIKE ? OR fp.farming_type LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (type) {
      query += ` AND fp.farming_type = ?`;
      params.push(type);
    }

    if (city) {
      query += ` AND fp.city = ?`;
      params.push(city);
    }

    query += ` GROUP BY u.id, fp.id ORDER BY u.name`;

    const [farmers] = await pool.execute(query, params);
    res.json(constructImageUrls(farmers));
  } catch (error) {
    console.error('Error searching farmers:', error);
    res.status(500).json({ error: 'Failed to search farmers' });
  }
});

// Get farmer categories/types
app.get('/api/farmers/categories', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT farming_type, COUNT(*) as count
      FROM farmer_profiles
      WHERE farming_type IS NOT NULL
      GROUP BY farming_type
      ORDER BY count DESC
    `;

    const [categories] = await pool.execute(query);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching farmer categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get cities where farmers are located
app.get('/api/farmers/cities', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT city, COUNT(*) as count
      FROM farmer_profiles
      WHERE city IS NOT NULL
      GROUP BY city
      ORDER BY count DESC
    `;

    const [cities] = await pool.execute(query);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// ====================== PRODUCTS ROUTES ======================

// Get all products with seller information
app.get('/api/products', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        u.name as seller,
        p.farmer_id as seller_id
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      WHERE p.quantity > 0
      ORDER BY p.created_at DESC
    `;
    const [products] = await pool.execute(query);
    res.json(constructImageUrls(products));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product details
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const query = `
      SELECT 
        p.*,
        u.name as seller,
        u.email as seller_email,
        fp.phone as seller_phone,
        fp.city as seller_city
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE p.id = ?
    `;
    const [products] = await pool.execute(query, [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(constructImageUrls(products[0]));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// Search products
app.get('/api/products/search', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    let query = `
      SELECT 
        p.*,
        u.name as seller,
        p.farmer_id as seller_id
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      WHERE p.quantity > 0
    `;
    const params = [];
    if (q) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      query += ` AND p.category = ?`;
      params.push(category);
    }
    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(maxPrice);
    }
    query += ` ORDER BY p.created_at DESC`;
    const [products] = await pool.execute(query, params);
    res.json(constructImageUrls(products));
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get product categories
app.get('/api/products/categories', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT category, COUNT(*) as count
      FROM products
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `;
    const [categories] = await pool.execute(query);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ====================== ERROR HANDLING ======================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ====================== START SERVER ======================

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - GET /api/farmers`);
  console.log(`  - GET /api/farmers/:id`);
  console.log(`  - GET /api/farmers/search`);
  console.log(`  - GET /api/farmers/categories`);
  console.log(`  - GET /api/farmers/cities`);
  console.log(`  - GET /api/products`);
  console.log(`  - GET /api/products/:id`);
  console.log(`  - GET /api/products/search`);
  console.log(`  - GET /api/products/categories`);
});

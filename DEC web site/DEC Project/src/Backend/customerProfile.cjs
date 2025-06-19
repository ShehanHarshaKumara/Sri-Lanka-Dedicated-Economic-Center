require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const { google } = require('googleapis');
const { Readable } = require('stream');
const router = express.Router();

const PROFILE_PORT = process.env.PROFILE_PORT || 3000;

let GOOGLE_DRIVE_ENABLED = false;
let auth, drive;

// Add missing validation function
const validateGoogleDriveConfig = () => {
  const requiredVars = [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_PRIVATE_KEY_ID', 
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_CLIENT_ID'
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.log(`❌ Missing Google Drive config: ${varName}`);
      return false;
    }
  }
  return true;
};

// Initialize Google Drive API
const initializeGoogleDrive = async () => {
  try {
    GOOGLE_DRIVE_ENABLED = validateGoogleDriveConfig();
    
    if (!GOOGLE_DRIVE_ENABLED) {
      console.log('💾 Using local storage for images (Google Drive not configured)');
      return;
    }

    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`
    };

    auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    drive = google.drive({ version: 'v3', auth });
    
    // Test connection
    await drive.files.list({ pageSize: 1 });
    console.log('✅ Google Drive API initialized successfully');
    GOOGLE_DRIVE_ENABLED = true;
  } catch (error) {
    console.error('❌ Failed to initialize Google Drive API:', error.message);
    console.log('🔧 Falling back to local storage');
    GOOGLE_DRIVE_ENABLED = false;
  }
};

// Initialize Google Drive on startup
initializeGoogleDrive();

// Ensure uploads directory exists
const profileUploadsDir = path.join(__dirname, 'uploads', 'customer-profiles');
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
  console.log('✓ Customer profile uploads directory created');
}

// MySQL connection - Fixed database name to match your table
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dedicated_economic_center'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Failed:', err.message);
    process.exit(1);
  } else {
    console.log('✓ MySQL Connected Successfully!');
  }
});

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'customer-profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Upload to Google Drive function
async function uploadToGoogleDrive(fileBuffer, originalName, mimeType, userId) {
  if (!GOOGLE_DRIVE_ENABLED) {
    throw new Error('Google Drive is not configured');
  }

  try {
    const fileName = `customer-profile-${userId}-${Date.now()}-${originalName}`;
    
    const fileMetadata = {
      name: fileName,
      parents: [GOOGLE_DRIVE_FOLDER_ID]
    };

    const media = {
      mimeType: mimeType,
      body: Readable.from(fileBuffer)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name'
    });

    await drive.permissions.create({
      fileId: response.data.id,
      resource: {
        role: 'reader',
        type: 'anyone'
      }
    });

    const directLink = `https://drive.google.com/uc?id=${response.data.id}`;
    
    return {
      fileId: response.data.id,
      fileName: response.data.name,
      directLink: directLink
    };
  } catch (error) {
    throw new Error('Failed to upload to Google Drive: ' + error.message);
  }
}

// Get customer profile - Fixed query structure
router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching profile for userId:', userId);
    
    const [rows] = await db.promise().query(
      'SELECT * FROM customer_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      // Get user info from users table
      const [userRows] = await db.promise().query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId]
      );
      
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = userRows[0];
      const names = user.name ? user.name.split(' ') : ['', ''];
      
      // Return default profile structure
      return res.json({
        user_id: user.id,
        first_name: names[0] || '',
        last_name: names.slice(1).join(' ') || '',
        email: user.email,
        phone: '',
        age: null,
        nic_number: '',
        address: '',
        city: '',
        country: 'Sri Lanka',
        bio: '',
        profile_image: null,
        location_lat: null,
        location_lng: null,
        location_address: ''
      });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile: ' + error.message });
  }
});

// Create or update customer profile - Fixed insert/update logic
router.post('/profile/:userId', upload.single('profile_image'), async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      first_name,
      last_name,
      email,
      phone,
      age,
      nic_number,
      address,
      city,
      country,
      bio,
      location_lat,
      location_lng,
      location_address,
      existing_image
    } = req.body;

    console.log('Profile save request for userId:', userId);
    console.log('Request body:', req.body);

    if (!first_name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'First name and email are required' 
      });
    }

    let profile_image = existing_image || null;

    if (req.file) {
      console.log('Processing new image upload...');
      profile_image = `http://localhost:${PROFILE_PORT}/uploads/customer-profiles/${req.file.filename}`;
      
      // Delete old local image if exists
      if (existing_image && existing_image.startsWith(`http://localhost:${PROFILE_PORT}/uploads/customer-profiles/`)) {
        const oldImagePath = path.join(__dirname, 'uploads', 'customer-profiles', path.basename(existing_image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('🗑️ Old local image deleted');
        }
      }
    }

    // Check if profile exists
    const [existing] = await db.promise().query(
      'SELECT id FROM customer_profiles WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing profile
      await db.promise().query(
        `UPDATE customer_profiles SET
          first_name = ?, last_name = ?, email = ?, phone = ?, age = ?, nic_number = ?,
          address = ?, city = ?, country = ?, bio = ?, profile_image = ?,
          location_lat = ?, location_lng = ?, location_address = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [
          first_name, 
          last_name || '', 
          email, 
          phone || null, 
          age ? parseInt(age) : null, 
          nic_number || null,
          address || null, 
          city || null, 
          country || 'Sri Lanka', 
          bio || null, 
          profile_image, 
          location_lat ? parseFloat(location_lat) : null, 
          location_lng ? parseFloat(location_lng) : null, 
          location_address || null, 
          userId
        ]
      );
      console.log('Profile updated successfully');
    } else {
      // Insert new profile
      await db.promise().query(
        `INSERT INTO customer_profiles (
          user_id, first_name, last_name, email, phone, age, nic_number,
          address, city, country, bio, profile_image,
          location_lat, location_lng, location_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          first_name, 
          last_name || '', 
          email, 
          phone || null, 
          age ? parseInt(age) : null, 
          nic_number || null,
          address || null, 
          city || null, 
          country || 'Sri Lanka', 
          bio || null, 
          profile_image, 
          location_lat ? parseFloat(location_lat) : null, 
          location_lng ? parseFloat(location_lng) : null, 
          location_address || null
        ]
      );
      console.log('Profile created successfully');
    }
    
    res.json({ 
      success: true, 
      message: existing.length > 0 ? 'Profile updated successfully' : 'Profile created successfully',
      profileImageUrl: profile_image
    });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save profile: ' + error.message 
    });
  }
});

// Delete profile image
router.delete('/profile/:userId/image', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.promise().query(
      'SELECT profile_image FROM customer_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (rows.length > 0 && rows[0].profile_image) {
      const imageUrl = rows[0].profile_image;
      
      if (imageUrl.startsWith(`http://localhost:${PROFILE_PORT}/uploads/customer-profiles/`)) {
        const imagePath = path.join(__dirname, 'uploads', 'customer-profiles', path.basename(imageUrl));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      await db.promise().query(
        'UPDATE customer_profiles SET profile_image = NULL WHERE user_id = ?',
        [userId]
      );
    }
    
    res.json({ success: true, message: 'Profile image deleted' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete image: ' + error.message 
    });
  }
});

// Get all customer profiles for admin
router.get('/all', async (req, res) => {
  try {
    // Get all users with role 'customer'
    const [users] = await db.promise().query(
      "SELECT id, name, email, role FROM users WHERE role = 'customer'"
    );

    // Get all customer profiles
    const [profiles] = await db.promise().query(
      "SELECT * FROM customer_profiles"
    );

    // Map userId to profile
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.user_id] = profile;
    });

    // Merge user info with profile, fallback to user info if profile missing
    const customers = users.map(user => {
      const profile = profileMap[user.id];
      if (profile) {
        return {
          ...profile,
          name: user.name,
          email: user.email,
          status: 'active', // You can add logic for status if needed
          verified: true // You can add logic for verification if needed
        };
      } else {
        const names = user.name ? user.name.split(' ') : ['', ''];
        return {
          user_id: user.id,
          first_name: names[0] || '',
          last_name: names.slice(1).join(' ') || '',
          email: user.email,
          phone: '',
          age: null,
          nic_number: '',
          address: '',
          city: '',
          country: 'Sri Lanka',
          bio: '',
          profile_image: null,
          location_lat: null,
          location_lng: null,
          location_address: '',
          name: user.name,
          status: 'pending',
          verified: false
        };
      }
    });

    res.json(customers);
  } catch (error) {
    console.error('Fetch all customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers: ' + error.message });
  }
});

// Delete customer from all tables
router.delete('/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Delete from customer_profiles
    await db.promise().query('DELETE FROM customer_profiles WHERE user_id = ?', [userId]);
    // Delete from users
    await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);
    // TODO: Delete from other related tables if needed (e.g., orders, reviews)
    res.json({ success: true, message: 'Customer deleted from all tables.' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete customer: ' + error.message });
  }
});

// If running as standalone server
if (require.main === module) {
  const app = express();
  const PORT = PROFILE_PORT;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/api/customer', router);

  app.listen(PORT, () => {
    console.log(`Customer Profile Server Running on http://localhost:${PORT}/api/customer`);
  });
}

module.exports = router;

/*CREATE TABLE IF NOT EXISTS customer_profiles (
id int(11) NOT NULL AUTO_INCREMENT,
user_id int(11) NOT NULL,
first_name varchar(100) NOT NULL,
last_name varchar(100) DEFAULT NULL,
email varchar(255) NOT NULL,
phone varchar(20) DEFAULT NULL,
age int(3) DEFAULT NULL,
nic_number varchar(20) DEFAULT NULL,
address text DEFAULT NULL,
city varchar(100) DEFAULT NULL,
country varchar(100) DEFAULT 'Sri Lanka',
bio text DEFAULT NULL,
profile_image text DEFAULT NULL,
location_lat decimal(10,8) DEFAULT NULL,
location_lng decimal(11,8) DEFAULT NULL,
location_address text DEFAULT NULL,
created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (id),
UNIQUE KEY unique_user_id (user_id),
KEY idx_email (email),
KEY idx_phone (phone),
KEY idx_city (city),
KEY idx_location (location_lat, location_lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;*/
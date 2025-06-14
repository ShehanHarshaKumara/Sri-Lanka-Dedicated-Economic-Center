const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const router = express.Router();

const PROFILE_PORT = 5002; // Use this for all image URLs

// Ensure uploads directory exists
const profileUploadsDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
  console.log('✓ Profile uploads directory created');
}

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dedicated_economic_center'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Failed:', err.message);
    process.exit(1);
  } else {
    console.log('✓ MySQL Connected Successfully!');
  }
});

// Multer configuration for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get farmer profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.promise().query(
      'SELECT * FROM farmer_profiles WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      // If no profile exists, return basic user data
      const [userRows] = await db.promise().query(
        'SELECT id, name, email FROM users WHERE id = ?',
        [userId]
      );
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const user = userRows[0];
      const names = user.name.split(' ');
      return res.json({
        user_id: user.id,
        first_name: names[0] || '',
        last_name: names.slice(1).join(' ') || '',
        email: user.email,
        phone: '',
        age: '',
        nic_number: '',
        experience: '',
        farming_type: 'Mixed Farming',
        address: '',
        city: '',
        bio: '',
        profile_image: null,
        location_lat: null,
        location_lng: null,
        location_address: ''
      });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile: ' + error.message });
  }
});

// Create or update farmer profile
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
      experience,
      farming_type,
      address,
      city,
      bio,
      location_lat,
      location_lng,
      location_address,
      existing_image
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'First name, last name, and email are required' 
      });
    }

    let profile_image = existing_image || null;
    // If a new image is uploaded, use it
    if (req.file) {
      profile_image = `http://localhost:${PROFILE_PORT}/uploads/profiles/${req.file.filename}`;
      // Delete old image if exists and is a local file
      if (existing_image && existing_image.startsWith(`http://localhost:${PROFILE_PORT}/uploads/profiles/`)) {
        const oldImagePath = path.join(__dirname, 'uploads', 'profiles', path.basename(existing_image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Check if profile exists
    const [existing] = await db.promise().query(
      'SELECT id FROM farmer_profiles WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing profile
      await db.promise().query(
        `UPDATE farmer_profiles SET
          first_name = ?, last_name = ?, email = ?, phone = ?,
          age = ?, nic_number = ?, experience = ?, farming_type = ?,
          address = ?, city = ?, bio = ?, profile_image = ?,
          location_lat = ?, location_lng = ?, location_address = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [
          first_name, last_name, email, phone || null,
          age || null, nic_number || null, experience || null, farming_type || 'Mixed Farming',
          address || null, city || null, bio || null, profile_image,
          location_lat || null, location_lng || null, location_address || null,
          userId
        ]
      );
      res.json({ success: true, message: 'Profile updated successfully' });
    } else {
      // Create new profile
      await db.promise().query(
        `INSERT INTO farmer_profiles (
          user_id, first_name, last_name, email, phone,
          age, nic_number, experience, farming_type,
          address, city, bio, profile_image,
          location_lat, location_lng, location_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, first_name, last_name, email, phone || null,
          age || null, nic_number || null, experience || null, farming_type || 'Mixed Farming',
          address || null, city || null, bio || null, profile_image,
          location_lat || null, location_lng || null, location_address || null
        ]
      );
      res.json({ success: true, message: 'Profile created successfully' });
    }
  } catch (error) {
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
      'SELECT profile_image FROM farmer_profiles WHERE user_id = ?',
      [userId]
    );
    if (rows.length > 0 && rows[0].profile_image) {
      const imagePath = path.join(__dirname, 'uploads', 'profiles', path.basename(rows[0].profile_image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      await db.promise().query(
        'UPDATE farmer_profiles SET profile_image = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [userId]
      );
    }
    res.json({ success: true, message: 'Profile image deleted' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete image: ' + error.message 
    });
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
  app.use('/api/farmer', router);

  app.listen(PORT, () => {
    console.log(`Farmer Profile Server Running on http://localhost:${PORT}/api/farmer`);
  });
}

module.exports = router;
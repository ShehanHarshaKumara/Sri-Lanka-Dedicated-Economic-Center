const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const { google } = require('googleapis');
const { Readable } = require('stream');
const router = express.Router();

const PROFILE_PORT = 3000;

// Google Drive Configuration
const GOOGLE_DRIVE_FOLDER_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Replace with your folder ID
const GOOGLE_DRIVE_CREDENTIALS = {
  type: "service_account",
  project_id: "your-project-id",
  private_key_id: "your-private-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  client_email: "your-service-account@your-project-id.iam.gserviceaccount.com",
  client_id: "your-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project-id.iam.gserviceaccount.com"
};

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_DRIVE_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

const drive = google.drive({ version: 'v3', auth });

// Ensure uploads directory exists (for temporary storage)
const profileUploadsDir = path.join(__dirname, 'uploads', 'customer-profiles');
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
  console.log('✓ Customer profile uploads directory created');
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

// Enhanced Multer configuration with Google Drive upload
const storage = multer.memoryStorage(); // Store in memory for direct upload to Google Drive

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
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Function to upload file to Google Drive
async function uploadToGoogleDrive(fileBuffer, originalName, mimeType, userId) {
  try {
    console.log('Uploading to Google Drive:', { originalName, mimeType, size: fileBuffer.length });
    
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
      fields: 'id, name, webViewLink, webContentLink'
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      resource: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Get the direct download link
    const directLink = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
    
    console.log('File uploaded to Google Drive successfully:', {
      fileId: response.data.id,
      name: response.data.name,
      directLink
    });

    return {
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
      directLink: directLink
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error('Failed to upload image to Google Drive: ' + error.message);
  }
}

// Function to delete file from Google Drive
async function deleteFromGoogleDrive(fileId) {
  try {
    if (!fileId) return;
    
    console.log('Deleting file from Google Drive:', fileId);
    await drive.files.delete({ fileId: fileId });
    console.log('File deleted successfully from Google Drive');
  } catch (error) {
    console.error('Error deleting from Google Drive:', error);
    // Don't throw error as it's not critical
  }
}

// Function to extract Google Drive file ID from URL
function extractGoogleDriveFileId(url) {
  if (!url) return null;
  
  // Match various Google Drive URL formats
  const patterns = [
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /file\/d\/([a-zA-Z0-9-_]+)$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Get customer profile - Updated to work with login system
router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching profile for userId:', userId);
    
    const [rows] = await db.promise().query(
      'SELECT * FROM customer_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      console.log('No customer profile found, checking users table');
      // If no profile exists, get basic user data from users table
      const [userRows] = await db.promise().query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId]
      );
      
      if (userRows.length === 0) {
        console.log('User not found in users table');
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = userRows[0];
      const names = user.name ? user.name.split(' ') : ['', ''];
      
      console.log('Returning default profile data for user:', user);
      
      return res.json({
        user_id: user.id,
        first_name: names[0] || '',
        last_name: names.slice(1).join(' ') || '',
        email: user.email,
        phone: '',
        date_of_birth: '',
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
    
    console.log('Found existing customer profile:', rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile: ' + error.message });
  }
});

// Create or update customer profile
router.post('/profile/:userId', upload.single('profile_image'), async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Saving profile for userId:', userId);
    console.log('File uploaded:', req.file ? req.file.originalname : 'No file');
    console.log('Form data:', req.body);
    
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      address,
      city,
      country,
      bio,
      location_lat,
      location_lng,
      location_address,
      existing_image
    } = req.body;

    // Only first name and email are required
    if (!first_name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'First name and email are required' 
      });
    }

    const lastName = last_name && last_name.trim() ? last_name.trim() : '';
    let profile_image = existing_image || null;
    let oldImageFileId = null;

    // If a new image is uploaded, upload to Google Drive
    if (req.file) {
      console.log('Processing new image upload...');
      
      try {
        // Extract old image file ID for deletion
        if (existing_image) {
          oldImageFileId = extractGoogleDriveFileId(existing_image);
        }

        // Upload new image to Google Drive
        const driveUpload = await uploadToGoogleDrive(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          userId
        );
        
        profile_image = driveUpload.directLink;
        console.log('New image uploaded to Google Drive:', profile_image);
        
        // Delete old image from Google Drive (if exists)
        if (oldImageFileId) {
          console.log('Deleting old image from Google Drive...');
          await deleteFromGoogleDrive(oldImageFileId);
        }
        
      } catch (uploadError) {
        console.error('Google Drive upload failed:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image to Google Drive: ' + uploadError.message
        });
      }
    }

    // Check if profile exists
    const [existing] = await db.promise().query(
      'SELECT id, profile_image FROM customer_profiles WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      console.log('Updating existing profile for user:', userId);
      // Update existing profile
      await db.promise().query(
        `UPDATE customer_profiles SET
          first_name = ?, last_name = ?, email = ?, phone = ?,
          date_of_birth = ?, address = ?, city = ?, country = ?, bio = ?, profile_image = ?,
          location_lat = ?, location_lng = ?, location_address = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [
          first_name, lastName, email, phone || null,
          date_of_birth || null, address || null, city || null, country || 'Sri Lanka', bio || null, profile_image,
          location_lat || null, location_lng || null, location_address || null,
          userId
        ]
      );
      
      res.json({ 
        success: true, 
        message: 'Profile updated successfully',
        profileImageUrl: profile_image
      });
    } else {
      console.log('Creating new profile for user:', userId);
      // Create new profile
      await db.promise().query(
        `INSERT INTO customer_profiles (
          user_id, first_name, last_name, email, phone,
          date_of_birth, address, city, country, bio, profile_image,
          location_lat, location_lng, location_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, first_name, lastName, email, phone || null,
          date_of_birth || null, address || null, city || null, country || 'Sri Lanka', bio || null, profile_image,
          location_lat || null, location_lng || null, location_address || null
        ]
      );
      
      res.json({ 
        success: true, 
        message: 'Profile created successfully',
        profileImageUrl: profile_image
      });
    }
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
      // Extract Google Drive file ID and delete
      const fileId = extractGoogleDriveFileId(rows[0].profile_image);
      if (fileId) {
        await deleteFromGoogleDrive(fileId);
      }
      
      // Update database
      await db.promise().query(
        'UPDATE customer_profiles SET profile_image = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
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

// Test Google Drive connection
router.get('/test-drive', async (req, res) => {
  try {
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'files(id, name)'
    });
    
    res.json({
      success: true,
      message: 'Google Drive connection successful',
      files: response.data.files
    });
  } catch (error) {
    console.error('Google Drive test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Google Drive connection failed: ' + error.message
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
  app.use('/api/customer', router);

  app.listen(PORT, () => {
    console.log(`Customer Profile Server Running on http://localhost:${PORT}/api/customer`);
  });
}

module.exports = router;
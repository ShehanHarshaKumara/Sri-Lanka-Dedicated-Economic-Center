const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'a526cdc5998a8d0ed930ab4cf517a302b55ae6172c5991640e7bebad1b028706';
const adminUploadsDir = path.join(__dirname, 'uploads', 'admin-profiles');

if (!fs.existsSync(adminUploadsDir)) {
  fs.mkdirSync(adminUploadsDir, { recursive: true });
}

const buildAdminAvatarUrl = (fileName) =>
  `http://localhost:${PORT}/uploads/admin-profiles/${fileName}`;

const isLocalAdminAvatarUrl = (avatarUrl = '') =>
  avatarUrl.startsWith(`http://localhost:${PORT}/uploads/admin-profiles/`) ||
  avatarUrl.startsWith(`http://127.0.0.1:${PORT}/uploads/admin-profiles/`);

const deleteFileIfExists = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Failed to delete file:', filePath, error);
  }
};

const adminAvatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, adminUploadsDir);
  },
  filename: (req, file, cb) => {
    const safeExtension = path.extname(file.originalname || '').toLowerCase() || '.png';
    cb(null, `admin-avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`);
  }
});

const adminAvatarUpload = multer({
  storage: adminAvatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
      return;
    }

    cb(new Error('Only JPG, PNG, GIF, and WEBP images are allowed for admin avatars'));
  }
});

// Middleware
const isAllowedOrigin = (origin = '') => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dedicated_economic_center'
});
const dbPromise = db.promise();

const ensureFarmerCommunityTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS farmer_community_messages (
      id INT NOT NULL AUTO_INCREMENT,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_farmer_community_sender (sender_id),
      KEY idx_farmer_community_receiver (receiver_id),
      KEY idx_farmer_community_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Failed to ensure farmer community messages table:', err);
      return;
    }
    console.log('Farmer community messages table is ready');
  });
};

const ensureAdminAvatarColumn = () => {
  db.query("SHOW COLUMNS FROM admins LIKE 'avatar'", (err, results) => {
    if (err) {
      console.error('Failed to inspect admins avatar column:', err);
      return;
    }

    if (results.length > 0) {
      return;
    }

    db.query(
      'ALTER TABLE admins ADD COLUMN avatar TEXT DEFAULT NULL AFTER password_status',
      (alterErr) => {
        if (alterErr) {
          console.error('Failed to add avatar column to admins table:', alterErr);
          return;
        }

        console.log('Admin avatar column added successfully');
      }
    );
  });
};

const requireFarmerRole = (req, res) => {
  if (req.user?.role !== 'farmer') {
    res.status(403).json({ message: 'Only registered farmers can access the farmer community' });
    return false;
  }

  return true;
};

const getCommunityStatus = (lastLogin) => {
  if (!lastLogin) return 'offline';

  const lastLoginDate = new Date(lastLogin);
  if (Number.isNaN(lastLoginDate.getTime())) return 'offline';

  const minutesSinceLastLogin = (Date.now() - lastLoginDate.getTime()) / 60000;

  if (minutesSinceLastLogin <= 30) return 'online';
  if (minutesSinceLastLogin <= 24 * 60) return 'away';

  return 'offline';
};

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
  ensureFarmerCommunityTable();
  ensureAdminAvatarColumn();
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdminRole = (role = '') => ['admin', 'administrator'].includes(role);

const requireAdminAccess = (req, res) => {
  if (!isAdminRole(req.user?.role)) {
    res.status(403).json({ message: 'Admin access required' });
    return false;
  }

  return true;
};

const isBcryptHash = (value = '') =>
  value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');

const verifyStoredPassword = async (plainTextPassword, storedPassword = '') => {
  if (!storedPassword) {
    return false;
  }

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(plainTextPassword, storedPassword);
  }

  return plainTextPassword === storedPassword;
};

const mapAdminSessionUser = (adminRecord, role = 'admin') => ({
  id: adminRecord.id,
  userId: adminRecord.id,
  name: adminRecord.name || 'Administrator',
  email: adminRecord.email,
  avatar: adminRecord.avatar || '',
  role,
  created_at: adminRecord.created_at || null,
  updated_at: adminRecord.updated_at || null,
  last_login: adminRecord.last_login || null
});

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    console.log('Registration attempt:', { name, email, role });

    // Validation
    if (!name || !email || !password || !confirmPassword || !role) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Valid roles check
    const validRoles = ['farmer', 'customer', 'administrator'];
    if (!validRoles.includes(role)) {
      console.log('Invalid role:', role);
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (results.length > 0) {
        console.log('User already exists with email:', email);
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const insertUserQuery = `
        INSERT INTO users (name, email, password, role, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;

      console.log('Inserting user with role:', role);

      db.query(insertUserQuery, [name, email, hashedPassword, role], (err, result) => {
        if (err) {
          console.error('Database error during insert:', err);
          return res.status(500).json({ message: 'Server error during registration' });
        }

        console.log('User registered successfully with ID:', result.insertId);

        const userData = {
          id: result.insertId,
          name: name,
          email: email,
          role: role
        };

        console.log('Sending registration response with user data:', userData);

        // Return success without token - user needs to login separately
        res.status(201).json({
          message: 'User registered successfully. Please login with your credentials.',
          user: userData
        });
      });
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const getUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(getUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (results.length === 0) {
        console.log('No user found with email:', email);
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const user = results[0];
      console.log('Found user:', { id: user.id, name: user.name, email: user.email, role: user.role });

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Invalid password for user:', email);
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Update last login
      const updateLoginQuery = 'UPDATE users SET last_login = NOW() WHERE id = ?';
      db.query(updateLoginQuery, [user.id], (err) => {
        if (err) {
          console.error('Error updating last login:', err);
        }
      });

      console.log('User logged in successfully:', { id: user.id, name: user.name, email: user.email, role: user.role });

      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const userData = {
        id: user.id,
        userId: user.id, // Add both id and userId for compatibility
        name: user.name,
        email: user.email,
        role: user.role
      };

      console.log('Sending login response with user data:', userData);

      res.json({
        message: 'Login successful',
        token: token,
        user: userData
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login Route
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Admin login attempt for email:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }    // Check if admin exists - get name and other details
    const getAdminQuery = 'SELECT * FROM admins WHERE email = ?';
    db.query(getAdminQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (results.length === 0) {
        console.log('No admin found with email:', email);
        return res.status(400).json({ message: 'Invalid admin credentials' });
      }

      const admin = results[0];
      console.log('Found admin:', { id: admin.id, name: admin.name, email: admin.email });

      // Check if password is hashed
      const isPasswordHashed = isBcryptHash(admin.password);
      
      let isPasswordValid = false;
      
      if (isPasswordHashed) {
        isPasswordValid = await verifyStoredPassword(password, admin.password);
      } else {
        isPasswordValid = (password === admin.password);
          // Hash the password for future use
        if (isPasswordValid) {
          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const updatePasswordQuery = 'UPDATE admins SET password = ? WHERE id = ?';
            db.query(updatePasswordQuery, [hashedPassword, admin.id], (err) => {
              if (err) {
                console.error('Error updating admin password hash:', err);
              } else {
                console.log('Admin password has been hashed and updated in database');
              }
            });
          } catch (hashError) {
            console.error('Error hashing password:', hashError);
          }
        }
      }

      if (!isPasswordValid) {
        console.log('Invalid password for admin:', email);
        return res.status(400).json({ message: 'Invalid admin credentials' });
      }

      // Update last login
      const updateLoginQuery = 'UPDATE admins SET last_login = NOW(), updated_at = NOW() WHERE id = ?';
      db.query(updateLoginQuery, [admin.id], (err) => {
        if (err) {
          console.error('Error updating admin last login:', err);
        }
      });

      console.log('Admin logged in successfully:', { id: admin.id, name: admin.name, email: admin.email });

      // Create JWT token with admin role
      const token = jwt.sign(
        { 
          userId: admin.id, 
          email: admin.email, 
          role: 'admin',
          isAdmin: true,
          name: admin.name || 'Administrator'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const adminData = {
        id: admin.id,
        userId: admin.id,
        name: admin.name || 'Administrator',
        email: admin.email,
        avatar: admin.avatar || '',
        role: 'admin'
      };

      console.log('Sending admin login response with admin data:', adminData);

      res.json({
        message: 'Admin login successful',
        token: token,
        user: adminData
      });
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Social Login Route (Placeholder)
app.post('/api/auth/social-login', async (req, res) => {
  try {
    const { provider, email, name, socialId } = req.body;

    if (!provider || !email || !name || !socialId) {
      return res.status(400).json({ message: 'All social login fields are required' });
    }

    // Check if user exists with this email
    const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR social_id = ?';
    db.query(checkUserQuery, [email, socialId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (results.length > 0) {
        // User exists, log them in
        const user = results[0];
        
        // Update social login info if needed
        const updateSocialQuery = 'UPDATE users SET social_provider = ?, social_id = ?, last_login = NOW() WHERE id = ?';
        db.query(updateSocialQuery, [provider, socialId, user.id], (err) => {
          if (err) {
            console.error('Error updating social info:', err);
          }
        });

        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          message: 'Social login successful',
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      } else {
        // New user, create account with default role 'customer'
        const insertUserQuery = `
          INSERT INTO users (name, email, password, role, social_provider, social_id, created_at, updated_at, last_login) 
          VALUES (?, ?, '', 'customer', ?, ?, NOW(), NOW(), NOW())
        `;

        db.query(insertUserQuery, [name, email, provider, socialId], (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error during social registration' });
          }

          const token = jwt.sign(
            { 
              userId: result.insertId, 
              email: email, 
              role: 'customer' 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          res.status(201).json({
            message: 'Social account created successfully',
            token: token,
            user: {
              id: result.insertId,
              name: name,
              email: email,
              role: 'customer'
            }
          });
        });
      }
    });

  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Token Route
app.get('/api/auth/verify-token', verifyToken, (req, res) => {
  // Get user details
  const getUserQuery = 'SELECT id, name, email, role FROM users WHERE id = ?';
  db.query(getUserQuery, [req.user.userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Token is valid',
      user: results[0]
    });
  });
});

// Get User Profile Route
app.get('/api/auth/profile', verifyToken, (req, res) => {
  const getUserQuery = 'SELECT id, name, email, role, created_at, last_login FROM users WHERE id = ?';
  db.query(getUserQuery, [req.user.userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user: results[0]
    });
  });
});

app.get('/api/auth/admin-profile', verifyToken, async (req, res) => {
  if (!requireAdminAccess(req, res)) return;

  try {
    const adminId = req.user.userId;
    const [admins] = await dbPromise.query(
      'SELECT id, name, email, avatar, created_at, updated_at, last_login FROM admins WHERE id = ? LIMIT 1',
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    res.json({
      message: 'Admin profile retrieved successfully',
      user: mapAdminSessionUser(admins[0], req.user.role || 'admin')
    });
  } catch (error) {
    console.error('Failed to fetch admin profile:', error);
    res.status(500).json({ message: 'Failed to fetch admin profile' });
  }
});

app.put('/api/auth/admin-profile', verifyToken, adminAvatarUpload.single('avatar'), async (req, res) => {
  if (!requireAdminAccess(req, res)) return;

  const uploadedAvatarPath = req.file ? path.join(adminUploadsDir, req.file.filename) : null;

  try {
    const adminId = req.user.userId;
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!name) {
      deleteFileIfExists(uploadedAvatarPath);
      return res.status(400).json({ message: 'Admin name is required' });
    }

    if (!email) {
      deleteFileIfExists(uploadedAvatarPath);
      return res.status(400).json({ message: 'Admin email is required' });
    }

    const [currentAdmins] = await dbPromise.query(
      'SELECT id, avatar FROM admins WHERE id = ? LIMIT 1',
      [adminId]
    );

    if (currentAdmins.length === 0) {
      deleteFileIfExists(uploadedAvatarPath);
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const [duplicateAdmins] = await dbPromise.query(
      'SELECT id FROM admins WHERE email = ? AND id <> ? LIMIT 1',
      [email, adminId]
    );

    if (duplicateAdmins.length > 0) {
      deleteFileIfExists(uploadedAvatarPath);
      return res.status(409).json({ message: 'That email address is already used by another admin account' });
    }

    let avatar = currentAdmins[0].avatar || null;
    let oldAvatarPathToDelete = null;

    if (req.file) {
      if (avatar && isLocalAdminAvatarUrl(avatar)) {
        oldAvatarPathToDelete = path.join(adminUploadsDir, path.basename(avatar));
      }

      avatar = buildAdminAvatarUrl(req.file.filename);
    }

    const [updateResult] = await dbPromise.query(
      'UPDATE admins SET name = ?, email = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
      [name, email, avatar, adminId]
    );

    if (updateResult.affectedRows === 0) {
      deleteFileIfExists(uploadedAvatarPath);
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const [admins] = await dbPromise.query(
      'SELECT id, name, email, avatar, created_at, updated_at, last_login FROM admins WHERE id = ? LIMIT 1',
      [adminId]
    );

    if (oldAvatarPathToDelete) {
      deleteFileIfExists(oldAvatarPathToDelete);
    }

    res.json({
      message: 'Admin profile updated successfully',
      user: mapAdminSessionUser(admins[0], req.user.role || 'admin')
    });
  } catch (error) {
    deleteFileIfExists(uploadedAvatarPath);
    console.error('Failed to update admin profile:', error);
    res.status(500).json({ message: 'Failed to update admin profile' });
  }
});

app.put('/api/auth/admin-profile/password', verifyToken, async (req, res) => {
  if (!requireAdminAccess(req, res)) return;

  try {
    const adminId = req.user.userId;
    const currentPassword = req.body.currentPassword || '';
    const newPassword = req.body.newPassword || '';
    const confirmPassword = req.body.confirmPassword || '';

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Current password, new password, and confirm password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Choose a new password that is different from the current password' });
    }

    const [admins] = await dbPromise.query(
      'SELECT id, password FROM admins WHERE id = ? LIMIT 1',
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const admin = admins[0];
    const isCurrentPasswordValid = await verifyStoredPassword(currentPassword, admin.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await dbPromise.query(
      'UPDATE admins SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, adminId]
    );

    res.json({ message: 'Admin password updated successfully' });
  } catch (error) {
    console.error('Failed to update admin password:', error);
    res.status(500).json({ message: 'Failed to update admin password' });
  }
});

// Get Database Users Route
app.get('/api/auth/users', verifyToken, (req, res) => {
  if (!requireAdminAccess(req, res)) return;

  const getUsersQuery = `
    SELECT
      'user' AS account_type,
      id,
      name,
      email,
      role,
      created_at,
      updated_at,
      last_login,
      CASE
        WHEN password IS NULL OR password = '' THEN 'not_set'
        WHEN password LIKE '$2%' THEN 'hashed'
        ELSE 'legacy_plain_text'
      END AS password_status
    FROM users

    UNION ALL

    SELECT
      'admin' AS account_type,
      id,
      name,
      email,
      'admin' AS role,
      created_at,
      updated_at,
      last_login,
      CASE
        WHEN password IS NULL OR password = '' THEN 'not_set'
        WHEN password LIKE '$2%' THEN 'hashed'
        ELSE 'legacy_plain_text'
      END AS password_status
    FROM admins

    ORDER BY created_at DESC, id DESC
  `;

  db.query(getUsersQuery, (err, results) => {
    if (err) {
      console.error('Database error while fetching users:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json({
      message: 'Users retrieved successfully',
      users: results
    });
  });
});

// Update Profile Route
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, address, city, country, bio } = req.body;
    const userId = req.user.userId;

    console.log('Profile update request for user:', userId, req.body);

    // Validation
    if (!firstName) {
      return res.status(400).json({ message: 'First name is required' });
    }

    // Update user profile
    const updateProfileQuery = `
      UPDATE users SET 
        name = ?,
        phone = ?,
        address = ?,
        city = ?,
        country = ?,
        bio = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    // Combine first name and last name for the name field
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    db.query(updateProfileQuery, [
      fullName,
      phone,
      dateOfBirth,
      address,
      city,
      country,
      bio,
      userId
    ], (err, result) => {
      if (err) {
        console.error('Database error during profile update:', err);
        return res.status(500).json({ message: 'Server error during profile update' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Profile updated successfully for user:', userId);

      // Return updated user data
      const getUserQuery = 'SELECT id, name, email, role FROM users WHERE id = ?';
      db.query(getUserQuery, [userId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.json({
          message: 'Profile updated successfully',
          user: results[0]
        });
      });
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Farmer community: registered farmers only
app.get('/api/auth/farmer-community/users', verifyToken, async (req, res) => {
  if (!requireFarmerRole(req, res)) return;

  try {
    const currentUserId = req.user.userId;
    const farmersQuery = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.phone AS user_phone,
        u.address AS user_address,
        u.city AS user_city,
        u.country,
        u.bio AS user_bio,
        u.last_login,
        u.created_at,
        fp.phone AS profile_phone,
        fp.city AS profile_city,
        fp.bio AS profile_bio,
        fp.profile_image,
        fp.farming_type,
        fp.location_address,
        (
          SELECT m.message
          FROM farmer_community_messages m
          WHERE (m.sender_id = u.id AND m.receiver_id = ?)
             OR (m.sender_id = ? AND m.receiver_id = u.id)
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message
      FROM users u
      LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
      WHERE u.role = 'farmer'
      ORDER BY u.name
    `;

    const [farmers] = await dbPromise.query(farmersQuery, [currentUserId, currentUserId]);

    const mappedFarmers = farmers.map((farmer) => ({
      id: farmer.id,
      name: farmer.name,
      email: farmer.email,
      role: farmer.role,
      phone: farmer.profile_phone || farmer.user_phone || '',
      specialty: farmer.farming_type || 'Farmer',
      location:
        farmer.location_address ||
        farmer.profile_city ||
        farmer.user_city ||
        farmer.country ||
        'Sri Lanka',
      bio: farmer.profile_bio || farmer.user_bio || '',
      avatar: farmer.profile_image || '',
      status: getCommunityStatus(farmer.last_login),
      joinedCommunity: true,
      joinedAt: farmer.created_at,
      lastMessage: farmer.last_message || 'Start a conversation with this farmer.'
    }));

    res.json({ farmers: mappedFarmers });
  } catch (error) {
    console.error('Failed to fetch farmer community users:', error);
    res.status(500).json({ message: 'Failed to fetch registered farmers for the community' });
  }
});

app.get('/api/auth/farmer-community/messages/:farmerId', verifyToken, async (req, res) => {
  if (!requireFarmerRole(req, res)) return;

  try {
    const currentUserId = req.user.userId;
    const otherFarmerId = Number.parseInt(req.params.farmerId, 10);

    if (!otherFarmerId || otherFarmerId === currentUserId) {
      return res.json({ messages: [] });
    }

    const [farmerRows] = await dbPromise.query(
      'SELECT id, role FROM users WHERE id = ? AND role = "farmer"',
      [otherFarmerId]
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({ message: 'Farmer not found in the community' });
    }

    const messagesQuery = `
      SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.message,
        m.created_at,
        sender.name AS sender_name
      FROM farmer_community_messages m
      INNER JOIN users sender ON sender.id = m.sender_id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `;

    const [messages] = await dbPromise.query(messagesQuery, [
      currentUserId,
      otherFarmerId,
      otherFarmerId,
      currentUserId
    ]);

    res.json({ messages });
  } catch (error) {
    console.error('Failed to fetch farmer community messages:', error);
    res.status(500).json({ message: 'Failed to fetch community messages' });
  }
});

app.post('/api/auth/farmer-community/messages', verifyToken, async (req, res) => {
  if (!requireFarmerRole(req, res)) return;

  try {
    const senderId = req.user.userId;
    const { receiverId, message } = req.body;
    const normalizedReceiverId = Number.parseInt(receiverId, 10);
    const normalizedMessage = String(message || '').trim();

    if (!normalizedReceiverId || normalizedReceiverId === senderId) {
      return res.status(400).json({ message: 'A valid farmer receiver is required' });
    }

    if (!normalizedMessage) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const [receiverRows] = await dbPromise.query(
      'SELECT id, role FROM users WHERE id = ? AND role = "farmer"',
      [normalizedReceiverId]
    );

    if (receiverRows.length === 0) {
      return res.status(404).json({ message: 'Receiver farmer was not found' });
    }

    const insertQuery = `
      INSERT INTO farmer_community_messages (sender_id, receiver_id, message)
      VALUES (?, ?, ?)
    `;

    const [insertResult] = await dbPromise.query(insertQuery, [
      senderId,
      normalizedReceiverId,
      normalizedMessage
    ]);

    const [senderRows] = await dbPromise.query('SELECT name FROM users WHERE id = ?', [senderId]);

    res.status(201).json({
      message: {
        id: insertResult.insertId,
        sender_id: senderId,
        receiver_id: normalizedReceiverId,
        sender_name: senderRows[0]?.name || 'Farmer',
        message: normalizedMessage,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to create farmer community message:', error);
    res.status(500).json({ message: 'Failed to send community message' });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Admin profile photo must be 5MB or smaller' });
    }

    return res.status(400).json({ message: err.message || 'Admin profile upload failed' });
  }

  if (err?.message?.includes('admin avatars')) {
    return res.status(400).json({ message: err.message });
  }

  return next(err);
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Agricultural Hub API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Health check: http://localhost:${PORT}/api/health`);
});

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

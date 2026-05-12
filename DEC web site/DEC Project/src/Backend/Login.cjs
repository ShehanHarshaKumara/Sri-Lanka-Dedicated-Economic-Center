const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'a526cdc5998a8d0ed930ab4cf517a302b55ae6172c5991640e7bebad1b028706';

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

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dedicated_economic_center'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
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
      const isPasswordHashed = admin.password.startsWith('$2a$') || 
                              admin.password.startsWith('$2b$') || 
                              admin.password.startsWith('$2y$');
      
      let isPasswordValid = false;
      
      if (isPasswordHashed) {
        isPasswordValid = await bcrypt.compare(password, admin.password);
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
      }      // Update last login
      const updateLoginQuery = 'UPDATE admins SET updated_at = NOW() WHERE id = ?';
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

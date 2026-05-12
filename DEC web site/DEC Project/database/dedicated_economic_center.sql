CREATE DATABASE IF NOT EXISTS dedicated_economic_center
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dedicated_economic_center;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL DEFAULT '',
  password_status VARCHAR(20)
    GENERATED ALWAYS AS (
      CASE
        WHEN password IS NULL OR password = '' THEN 'not_set'
        WHEN password LIKE '$2%' THEN 'hashed'
        ELSE 'legacy_plain_text'
      END
    ) STORED,
  role ENUM('farmer', 'customer', 'administrator') NOT NULL DEFAULT 'customer',
  phone VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  country VARCHAR(100) DEFAULT 'Sri Lanka',
  bio TEXT DEFAULT NULL,
  social_provider VARCHAR(50) DEFAULT NULL,
  social_id VARCHAR(255) DEFAULT NULL,
  last_login TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_social_id (social_id),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  password_status VARCHAR(20)
    GENERATED ALWAYS AS (
      CASE
        WHEN password IS NULL OR password = '' THEN 'not_set'
        WHEN password LIKE '$2%' THEN 'hashed'
        ELSE 'legacy_plain_text'
      END
    ) STORED,
  avatar TEXT DEFAULT NULL,
  last_login TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_profiles (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  age INT DEFAULT NULL,
  nic_number VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  country VARCHAR(100) DEFAULT 'Sri Lanka',
  bio TEXT DEFAULT NULL,
  profile_image TEXT DEFAULT NULL,
  location_lat DECIMAL(10, 8) DEFAULT NULL,
  location_lng DECIMAL(11, 8) DEFAULT NULL,
  location_address TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customer_profiles_user_id (user_id),
  KEY idx_customer_profiles_email (email),
  KEY idx_customer_profiles_phone (phone),
  KEY idx_customer_profiles_city (city),
  KEY idx_customer_profiles_location (location_lat, location_lng),
  CONSTRAINT fk_customer_profiles_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS farmer_profiles (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  age INT DEFAULT NULL,
  nic_number VARCHAR(20) DEFAULT NULL,
  experience VARCHAR(100) DEFAULT NULL,
  farming_type VARCHAR(100) DEFAULT 'Mixed Farming',
  address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  profile_image TEXT DEFAULT NULL,
  location_lat DECIMAL(10, 8) DEFAULT NULL,
  location_lng DECIMAL(11, 8) DEFAULT NULL,
  location_address TEXT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_farmer_profiles_user_id (user_id),
  KEY idx_farmer_profiles_email (email),
  KEY idx_farmer_profiles_city (city),
  KEY idx_farmer_profiles_status (status),
  CONSTRAINT fk_farmer_profiles_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT NOT NULL AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  category VARCHAR(100) DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  lat DECIMAL(10, 8) DEFAULT NULL,
  lng DECIMAL(11, 8) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_farmer_id (farmer_id),
  KEY idx_products_category (category),
  KEY idx_products_status (status),
  KEY idx_products_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) DEFAULT NULL,
  customer_address TEXT NOT NULL,
  customer_city VARCHAR(100) NOT NULL,
  customer_zip VARCHAR(20) DEFAULT NULL,
  shipping_method VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  discount_code VARCHAR(50) DEFAULT NULL,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_user_id (user_id),
  KEY idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_payments (
  id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  card_last4 CHAR(4) DEFAULT NULL,
  card_name VARCHAR(150) DEFAULT NULL,
  card_expiry VARCHAR(20) DEFAULT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_payments_order_id (order_id),
  CONSTRAINT fk_order_payments_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_reviews (
  id INT NOT NULL AUTO_INCREMENT,
  product_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  rating INT NOT NULL,
  review TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_reviews_product_id (product_id),
  KEY idx_product_reviews_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW account_password_overview AS
SELECT
  'user' AS account_type,
  id,
  name,
  email,
  role,
  password_status,
  CASE
    WHEN password_status = 'hashed' THEN 'Protected - actual password cannot be viewed'
    WHEN password_status = 'legacy_plain_text' THEN 'Legacy plain-text password exists - reset immediately'
    ELSE 'Password not set'
  END AS password_note,
  created_at,
  updated_at,
  last_login
FROM users

UNION ALL

SELECT
  'admin' AS account_type,
  id,
  name,
  email,
  'admin' AS role,
  password_status,
  CASE
    WHEN password_status = 'hashed' THEN 'Protected - actual password cannot be viewed'
    WHEN password_status = 'legacy_plain_text' THEN 'Legacy plain-text password exists - reset immediately'
    ELSE 'Password not set'
  END AS password_note,
  created_at,
  updated_at,
  last_login
FROM admins;

INSERT IGNORE INTO admins (name, email, password)
VALUES ('System Admin', 'admin@dec.local', '$2b$10$Ss3XXE2BTe4jkUeDc2Fjz.dqqAjtm3DUjvG/sEVQG4P8ARI93vGem');

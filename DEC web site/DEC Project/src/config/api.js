const resolveBase = (envKey, devBase, fallbackBase) =>
  import.meta.env[envKey] || (import.meta.env.DEV ? devBase : fallbackBase);

export const API_BASES = {
  auth: resolveBase('VITE_AUTH_API_BASE', '/auth-api', 'http://127.0.0.1:5000/api/auth'),
  products: resolveBase('VITE_PRODUCTS_API_BASE', '/products-api', 'http://127.0.0.1:5001/api'),
  farmerProfile: resolveBase(
    'VITE_FARMER_PROFILE_API_BASE',
    '/farmer-profile-api',
    'http://127.0.0.1:5002/api/farmer'
  ),
  farmerDirectory: resolveBase(
    'VITE_FARMER_DIRECTORY_API_BASE',
    '/farmer-directory-api',
    'http://127.0.0.1:5003/api'
  ),
  payments: resolveBase('VITE_PAYMENTS_API_BASE', '/payments-api', 'http://127.0.0.1:4001/api'),
  customer: resolveBase('VITE_CUSTOMER_API_BASE', '/customer-api', 'http://127.0.0.1:3000/api/customer'),
  adminProducts: resolveBase(
    'VITE_ADMIN_PRODUCTS_API_BASE',
    '/admin-products-api',
    'http://127.0.0.1:5050/api/admin'
  )
};

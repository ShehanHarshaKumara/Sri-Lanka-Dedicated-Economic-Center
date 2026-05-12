import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true'
    ? '/Sri-Lanka-Dedicated-Economic-Center/'
    : '/',
  plugins: [
    tailwindcss(),
    react()
    
  ],
  server: {
    proxy: {
      '/auth-api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, '/api/auth')
      },
      '/products-api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/products-api/, '/api')
      },
      '/farmer-profile-api': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/farmer-profile-api/, '/api/farmer')
      },
      '/farmer-directory-api': {
        target: 'http://127.0.0.1:5003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/farmer-directory-api/, '/api')
      },
      '/payments-api': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/payments-api/, '/api')
      },
      '/customer-api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/customer-api/, '/api/customer')
      },
      '/admin-products-api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/admin-products-api/, '/api/admin')
      }
    }
  }
})

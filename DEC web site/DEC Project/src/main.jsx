import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginPage from './Pages/LoginPage.jsx'
// import AdminHP from './Pages/AdminHP.jsx'
// import FarmerHP from './Pages/FarmerHp.jsx'
// import CustomerHP from './Pages/CustomerHP.jsx'
// import CustomerProfile from './Pages/CustomerProfile.jsx'
import FarmerProfile from './Pages/FarmerProfile.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
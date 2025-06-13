import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import ProductCard from './Pages/ProductCard'
// import LoginPage from './Pages/LoginPage.jsx'
// import AdminHP from './Pages/AdminHP.jsx'
// import FarmerHP from './Pages/FarmerHP.jsx'
//  import CustomerHP from './Pages/CustomerHP.jsx'
// import CustomerProfile from './Pages/CustomerProfile.jsx'
// import FarmerProfile from './Pages/FarmerProfile.jsx'
import Map from './Pages/Map.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Map/>
    {/* <ProductCard/> */}
     {/* <FarmerProfile/>  */}
    {/* <LoginPage /> */}
    {/* <CustomerProfile /> */}
    {/* <CustomerHP /> */}
     {/* <FarmerHP />  */}
    {/* <AdminHP /> */}
  </StrictMode>,
)
import { StrictMode, } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import ProductCard from './Pages/ProductCard'
// import LoginPage from './Pages/LoginPage.jsx'
// import AdminHP from './Pages/AdminHP.jsx'
// import FarmerHP from './Pages/FarmerHP.jsx'
//  import CustomerHP from './Pages/CustomerHP.jsx'
// import CustomerProfile from './Pages/CustomerProfile.jsx'
// import FarmerProfile from './Pages/FarmerProfile.jsx'
// import Map from './Pages/Map.jsx'
// import Chatbot from './Pages/Chatbot.jsx'
// import ChatHp from './Pages/chatHp.jsx'
// import FramerPage from './Pages/FramerPage.jsx'
// import Payemntpage from './Pages/Payemntpage.jsx'
// import Message from './Pages/message.jsx'
// import Review from './Pages/Review.jsx'
// import RiveAndFeedback from './Pages/RiveAndFeedback.jsx'
import PaymentAndReting from './Pages/PaymentAndReting.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PaymentAndReting />
    {/* <RiveAndFeedback /> */}
    {/* <Review/> */}
    {/* <Message/> */}
    {/* <Payemntpage /> */}
    {/* <FramerPage /> */}
    {/* <ChatHp /> */}
    {/* <Chatbot /> */}
    {/* <Map/> */}
    {/* <ProductCard/> */}
     {/* <FarmerProfile/>  */}
    {/* <LoginPage /> */}
    {/* <CustomerProfile /> */}
    {/* <CustomerHP /> */}
     {/* <FarmerHP />  */}
    {/* <AdminHP /> */}
  </StrictMode>,
)
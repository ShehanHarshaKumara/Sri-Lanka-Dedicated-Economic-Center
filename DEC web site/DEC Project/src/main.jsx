import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginPage from './Pages/LoginPage.jsx'
import AdminHP from './Pages/AdminHP.jsx'
import FarmerHP from './Pages/FarmerHP.jsx'
import CustomerHP from './Pages/CustomerHP.jsx'
import FarmingFoodsPage from './Pages/productPage.jsx'
// Optionally import other pages for navigation or future use
// import ProductCard from './Pages/ProductCard'
// import CustomerProfile from './Pages/CustomerProfile.jsx'
//import FarmerProfile from './Pages/FarmerProfile.jsx'
// import Map from './Pages/Map.jsx'
// import Chatbot from './Pages/Chatbot.jsx'
//import ChatHp from './Pages/chatHp.jsx'
import FramerPage from './Pages/FramerPage.jsx'
// import Payemntpage from './Pages/Payemntpage.jsx'
// import Message from './Pages/message.jsx'
// import Review from './Pages/Review.jsx'
// import RiveAndFeedback from './Pages/RiveAndFeedback.jsx'
// import PaymentAndReting from './Pages/PaymentAndReting.jsx'

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('main');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('main');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleNavigateToProducts = () => {
    setCurrentPage('products');
  };

  // Add handler for navigating to sellers (FramerPage)
  const handleNavigateToSellers = () => {
    setCurrentPage('sellers');
  };

  const handleBackToCustomerHP = () => {
    setCurrentPage('main');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === 'admin' || user.role === 'administrator') {
    return <AdminHP user={user} onLogout={handleLogout} />;
  }
  if (user.role === 'farmer') {
    return <FarmerHP user={user} onLogout={handleLogout} />;
  }
  if (user.role === 'customer') {
    // Handle customer navigation
    if (currentPage === 'products') {
      return <FarmingFoodsPage onBack={handleBackToCustomerHP} />;
    }
    // Render FramerPage when currentPage is 'sellers'
    if (currentPage === 'sellers') {
      return <FramerPage />;
    }
    // Pass handleNavigateToSellers to CustomerHP
    return (
      <CustomerHP
        user={user}
        onLogout={handleLogout}
        onNavigateToProducts={handleNavigateToProducts}
        onNavigateToSellers={handleNavigateToSellers}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Unknown user role</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginPage from './Pages/LoginPage.jsx'
import FarmerHP from './Pages/FarmerHP.jsx'
import CustomerHP from './Pages/CustomerHP.jsx'
// import AdminHP from './Pages/AdminHP.jsx' // Uncomment when you create this component

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in when app loads
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Verify token with backend
          const response = await fetch('http://localhost:5000/api/auth/verify-token', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Token verified, user:', data.user);
            setUser(data.user);
          } else {
            console.log('Token invalid, clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData) => {
    console.log('App handleLogin called with:', userData);
    setUser(userData);
  };

  const handleLogout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const renderHomePage = () => {
    if (!user) return null;
    
    console.log('Rendering home page for user role:', user.role);
    
    switch (user.role) {
      case 'farmer':
        return <FarmerHP user={user} onLogout={handleLogout} />;
      case 'customer':
        return <CustomerHP user={user} onLogout={handleLogout} />;
      case 'administrator':
        // For now, redirect administrators to farmer page
        // Uncomment the line below when you create AdminHP component
        // return <AdminHP user={user} onLogout={handleLogout} />;
        return <FarmerHP user={user} onLogout={handleLogout} />;
      default:
        console.error('Unknown user role:', user.role);
        return <CustomerHP user={user} onLogout={handleLogout} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Logged in - show appropriate home page
  return renderHomePage();
}

// Render the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
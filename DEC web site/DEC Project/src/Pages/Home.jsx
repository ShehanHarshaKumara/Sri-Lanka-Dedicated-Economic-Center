// src/pages/HomePage.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import CustomerDashboard from '../components/customer/CustomerDashboard';
import FarmerDashboard from '../components/farmer/FarmerDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';

const HomePage = () => {
  const { userRole } = useAuth();

  const renderDashboard = () => {
    switch (userRole) {
      case 'customer':
        return <CustomerDashboard />;
      case 'farmer':
        return <FarmerDashboard />;
      case 'administrator':
        return <AdminDashboard />;
      default:
        return <CustomerDashboard />; // Default view for non-authenticated users
    }
  };

  return renderDashboard();
};

export default HomePage;
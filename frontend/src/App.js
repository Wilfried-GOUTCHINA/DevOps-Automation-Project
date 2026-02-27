import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import DashboardFournisseur from './pages/DashboardFournisseur';
import DashboardAcheteur from './pages/DashboardAcheteur';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
          <Route path="/fournisseur/dashboard" element={
            <PrivateRoute roles={['fournisseur']}>
              <DashboardFournisseur />
            </PrivateRoute>
          } />
          
          <Route path="/acheteur/dashboard" element={
            <PrivateRoute roles={['acheteur']}>
              <DashboardAcheteur />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

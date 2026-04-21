import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './components/CartDrawer';
import AuthPage from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

/**
 * ProtectedRoute Component
 * A high-order component (HOC) that guards sensitive routes.
 * Ensures that:
 * 1. The user is fully authenticated.
 * 2. The user possesses the required role (if specified) to access the target view.
 */
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  // Prevents flicker and premature redirects while session is being verified
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-600 font-bold">Loading...</div>;
  
  // Enforce session presence
  if (!user) return <Navigate to="/auth" />;
  
  // Enforce role-based isolation
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
}

/**
 * HomeRedirect Component
 * Intelligent landing page redirector based on session role.
 */
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'farmer') return <Navigate to="/farmer" />;
  return <Navigate to="/marketplace" />;
}

import ErrorBoundary from './components/ErrorBoundary';

/**
 * Root Application Entry Point
 * Defines the foundational architecture of the platform including:
 * - Error monitoring (ErrorBoundary)
 * - Global State Orchestration (Auth, Notification, Cart providers)
 * - SPA Routing configuration
 */
export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        {/* Foundation: Authentication and User Session */}
        <AuthProvider>
          {/* Layer: Real-time Communication and Alerts */}
          <NotificationProvider>
            {/* Layer: Commerce and Shopping Cart state */}
            <CartProvider>
              <CartDrawer />
              <Routes>
                {/* Public Access Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Product Browsing (Publicly viewable, Restricted purchase) */}
                <Route path="/marketplace" element={<Marketplace />} />

                {/* Farmer Workspace - Restricted */}
                <Route path="/farmer/*" element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                } />

                {/* Platform Administration - Restricted */}
                <Route path="/admin/*" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Customer Management - Restricted */}
                <Route path="/customer/*" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />

                {/* Universal Authenticated Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
              </Routes>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

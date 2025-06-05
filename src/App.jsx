import { Routes, Route, Navigate, Outlet } from 'react-router';
import { useState } from 'react';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AlertProvider } from './contexts/AlertContext.jsx';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected route wrapper component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Render child routes if authenticated
  return <Outlet />;
};

// Main app with routes
function AppRoutes() {
  const [activeTab, setActiveTab] = useState('home');
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* 
        TODO: IMPORTANT - These routes should be protected with authentication
        They are temporarily public for development purposes
        Wrap them in ProtectedRoute before production deployment
      */}
      <Route 
        path="/app" 
        element={
          <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <FeedPage />
          </MainLayout>
        } 
      />
      <Route 
        path="/app/adoption" 
        element={
          <MainLayout activeTab="cat" setActiveTab={setActiveTab}>
            <div>Mascotas en Adopción</div>
          </MainLayout>
        } 
      />
      <Route 
        path="/app/contact" 
        element={
          <MainLayout activeTab="message" setActiveTab={setActiveTab}>
            <div>Contacto</div>
          </MainLayout>
        } 
      />
      <Route 
        path="/app/favorites" 
        element={
          <MainLayout activeTab="heart" setActiveTab={setActiveTab}>
            <div>Favoritos</div>
          </MainLayout>
        } 
      />
      
      {/* For reference - this is how protected routes should be implemented:
      <Route path="/protected" element={<ProtectedRoute />}>
        <Route index element={<ProtectedContent />} />
      </Route> 
      */}
      
      {/* Catch-all route for 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <AppRoutes />
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;

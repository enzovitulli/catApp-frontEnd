import { Routes, Route, Navigate, Outlet } from 'react-router';
import { useState } from 'react';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import BackofficeDashboard from './pages/BackofficeDashboard';
import BackofficeOverview from './pages/BackofficeOverview';
import BackofficePets from './pages/BackofficePets';
import BackofficePetitions from './pages/BackofficePetitions';
import PetForm from './pages/PetForm';
import BackofficeLayout from './layouts/BackofficeLayout';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AlertProvider } from './contexts/AlertContext.jsx';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedCompanyRoute from './components/ProtectedCompanyRoute';

// Protected route wrapper component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes if authenticated
  return <Outlet />;
};

// Main app with routes
function AppRoutes() {
  const [activeTab, setActiveTab] = useState('home');
  
  return (    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected routes - require authentication */}
      <Route path="/app" element={<ProtectedRoute />}>
        <Route 
          index 
          element={
            <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <FeedPage />
            </MainLayout>
          } 
        />
        <Route 
          path="adoption" 
          element={
            <MainLayout activeTab="cat" setActiveTab={setActiveTab}>
              <div>Mascotas en Adopción</div>
            </MainLayout>
          } 
        />
        <Route 
          path="contact" 
          element={
            <MainLayout activeTab="message" setActiveTab={setActiveTab}>
              <div>Contacto</div>
            </MainLayout>
          } 
        />
        <Route 
          path="favorites" 
          element={
            <MainLayout activeTab="heart" setActiveTab={setActiveTab}>
              <div>Favoritos</div>
            </MainLayout>
          } 
        />      </Route>      {/* Backoffice routes - require EMPRESA authentication */}
      <Route path="/backoffice" element={<ProtectedCompanyRoute />}>
        <Route 
          index 
          element={
            <BackofficeLayout>
              <BackofficeOverview />
            </BackofficeLayout>
          } 
        />
        <Route 
          path="overview"
          element={
            <BackofficeLayout>
              <BackofficeOverview />
            </BackofficeLayout>
          } 
        />
        <Route 
          path="pets"
          element={
            <BackofficeLayout>
              <BackofficePets />
            </BackofficeLayout>
          } 
        />
        <Route 
          path="petitions"
          element={
            <BackofficeLayout>
              <BackofficePetitions />
            </BackofficeLayout>
          } 
        />
        <Route 
          path="pets/new" 
          element={<PetForm />} 
        />
        <Route 
          path="pets/:id/edit" 
          element={<PetForm />} 
        />
      </Route>
      
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

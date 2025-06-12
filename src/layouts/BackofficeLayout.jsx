import { Link, useLocation } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { backofficeApi } from '../services/api';
import PropTypes from 'prop-types';
import { 
  PawPrint, 
  Home, 
  Plus, 
  LogOut,
  Building2,
  Mail
} from 'lucide-react';

const BackofficeLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notificationCounts, setNotificationCounts] = useState({
    pendingPetitions: 0
  });

  // Load notification counts
  const loadNotificationCounts = useCallback(async () => {
    try {
      const petitionsResponse = await backofficeApi.getCompanyPetitions();
      const petitionsData = petitionsResponse.data || [];
      const pendingCount = petitionsData.filter(p => p.estado === 'Pendiente').length;
      
      setNotificationCounts({
        pendingPetitions: pendingCount
      });
    } catch (error) {
      console.error('Error loading notification counts:', error);
    }
  }, []);

  useEffect(() => {
    loadNotificationCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(loadNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, [loadNotificationCounts]);// Navigation items for the sidebar
  const navigationItems = [
    {
      id: 'overview',
      label: 'Vista General',
      icon: Home,
      path: '/backoffice',
      description: 'Resumen del refugio'
    },
    {
      id: 'pets',
      label: 'Mis Mascotas',
      icon: PawPrint,
      path: '/backoffice/pets',
      description: 'Gestionar mascotas'
    },
    {
      id: 'petitions',
      label: 'Peticiones',
      icon: Mail,
      path: '/backoffice/petitions',
      description: 'Solicitudes de adopción'
    },
    {
      id: 'add-pet',
      label: 'Agregar Mascota',
      icon: Plus,
      path: '/backoffice/pets/new',
      description: 'Añadir nueva mascota'
    },
  ];

  const handleLogout = () => {
    logout();
  };

  // Get user display name and avatar
  const getUserDisplayName = () => {
    if (user?.nombre_empresa && user.nombre_empresa.trim().length > 0) {
      return user.nombre_empresa;
    }
    if (user?.email) {
      return user.email;
    }
    return 'Refugio';
  };
  
  const getAvatarLetter = () => {
    if (user?.nombre_empresa && user.nombre_empresa.trim().length > 0) {
      return user.nombre_empresa.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'R';
  };  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Fixed */}
      <div className="w-64 bg-oxford-900 shadow-lg flex flex-col fixed left-0 top-0 h-screen z-10">
        {/* Logo and Company Info */}
        <div className="p-6 border-b border-oxford-700 flex-shrink-0">
          <div className="flex items-center mb-4">
            <PawPrint className="text-aquamarine-400 mr-2" size={28} />
            <h1 className="text-xl np-bold text-white">NewTail</h1>
          </div>
          
          {/* User Info */}
          <div className="flex items-center">            <div className="w-10 h-10 rounded-full bg-orchid-600 flex items-center justify-center text-white np-bold text-lg mr-3">
              {getAvatarLetter()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm np-semibold text-white truncate">
                {getUserDisplayName()}
              </div>
              <div className="text-xs text-gray-300 flex items-center">
                <Building2 size={12} className="mr-1" />
                Refugio
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id}>                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-aquamarine-600/20 text-aquamarine-400 border-l-4 border-aquamarine-400' 
                        : 'text-gray-300 hover:bg-oxford-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm np-medium flex items-center justify-between">
                        <span>{item.label}</span>
                        {item.id === 'petitions' && notificationCounts.pendingPetitions > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                            {notificationCounts.pendingPetitions}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-oxford-700 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={20} className="mr-3 flex-shrink-0" />
            <span className="text-sm np-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>      {/* Main Content Container - Floating */}
      <div className="flex-1 ml-64 p-6">
        <div className="bg-white rounded-2xl shadow-lg min-h-[calc(100vh-3rem)] overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

BackofficeLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BackofficeLayout;

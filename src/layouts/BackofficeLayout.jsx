import { Link, useLocation } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { backofficeApi } from '../services/api';
import PropTypes from 'prop-types';
import { 
  PawPrint, 
  Home, 
  Plus, 
  LogOut,
  Building2,
  Mail,
  Menu,
  X
} from 'lucide-react';

const BackofficeLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notificationCounts, setNotificationCounts] = useState({
    pendingPetitions: 0
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  }, [loadNotificationCounts]);

  // Navigation items for the sidebar and mobile menu
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
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (    <div className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden xl:flex w-64 bg-oxford-900 shadow-lg flex-col fixed left-0 top-0 h-screen z-10">
        {/* Logo and Company Info */}
        <div className="p-6 border-b border-oxford-700/50 flex-shrink-0">
          <div className="flex items-center mb-4">
            <img src="/svg/NewTail.svg" alt="NewTail" className="w-7 h-7 mr-2" />
            <h1 className="text-xl np-bold text-white">NewTail</h1>
          </div>
          
          {/* User Info */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orchid-600 flex items-center justify-center text-white np-bold text-lg mr-3">
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
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-xl transition-colors cursor-pointer ${
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
        <div className="p-4 border-t border-oxford-700/50 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={20} className="mr-3 flex-shrink-0" />
            <span className="text-sm np-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>      {/* Mobile Header */}
      <div className="xl:hidden bg-oxford-900 shadow-lg relative z-50">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/svg/NewTail.svg" alt="NewTail" className="w-6 h-6 mr-2" />
            <h1 className="text-lg np-bold text-white">NewTail</h1>
          </div>

          {/* User info and menu button */}
          <div className="flex items-center gap-3">
            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-orchid-600 flex items-center justify-center text-white np-bold text-sm">
              {getAvatarLetter()}
            </div>
            
            {/* Menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="p-2 text-white hover:bg-oxford-800 rounded-lg transition-colors"
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown with Animation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
              className="mobile-menu-container absolute top-full left-0 right-0 bg-oxford-900 border-t border-oxford-700/30 shadow-lg overflow-hidden"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ 
                  duration: 0.2,
                  delay: 0.1,
                  ease: "easeOut"
                }}
                className="p-4"
              >
                {/* Navigation items */}
                <nav className="space-y-1 mb-4">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.2,
                          delay: 0.1 + index * 0.05,
                          ease: "easeOut"
                        }}
                      >
                        <Link
                          to={item.path}
                          className={`flex items-center p-3 rounded-xl transition-colors ${
                            isActive 
                              ? 'bg-aquamarine-600/20 text-aquamarine-400' 
                              : 'text-gray-300 hover:bg-oxford-800 hover:text-white'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon size={18} className="mr-3 flex-shrink-0" />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm np-medium">{item.label}</span>
                            {item.id === 'petitions' && notificationCounts.pendingPetitions > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                {notificationCounts.pendingPetitions}
                              </span>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Separator line - rounder and less visible */}
                <div className="border-t border-oxford-700/30 rounded-full mx-4 mb-4"></div>

                {/* User info section above logout */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.2,
                    delay: 0.2 + navigationItems.length * 0.05,
                    ease: "easeOut"
                  }}
                  className="mb-4 px-3"
                >
                  <div className="text-sm np-semibold text-white">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-gray-300 flex items-center mt-1">
                    <Building2 size={12} className="mr-1" />
                    Refugio
                  </div>
                </motion.div>

                {/* Logout button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.2,
                    delay: 0.25 + navigationItems.length * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full p-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-xl transition-colors"
                  >
                    <LogOut size={18} className="mr-3 flex-shrink-0" />
                    <span className="text-sm np-medium">Cerrar Sesión</span>
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>      {/* Main Content Container */}
      <div className="xl:ml-64">
        <div className="min-h-screen bg-gray-100 p-4 xl:p-6">
          <div className="bg-white rounded-2xl shadow-lg min-h-[calc(100vh-2rem)] xl:min-h-[calc(100vh-3rem)] h-fit">
            <div className="p-4 xl:p-6 h-fit">
              {children}
            </div>
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

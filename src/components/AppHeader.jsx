import { Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { PawPrint, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AppHeader = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout } = useAuth();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };
  return (
    <motion.header 
      className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-marine-800/95 backdrop-blur-md border-b border-gray-200/20 dark:border-marine-600/30 transition-colors duration-300"
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        paddingBottom: '0.75rem',
        paddingLeft: 'env(safe-area-inset-left, 1rem)',
        paddingRight: 'env(safe-area-inset-right, 1rem)'
      }}
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Empty space for balance */}
          <div className="flex-1"></div>
          
          {/* Centered Logo */}
          <Link to="/app" className="flex items-center">
            <PawPrint className="text-orchid-500 dark:text-aquamarine-400 mr-1.5 transition-colors duration-300" size={26} />
            <h1 className="text-xl np-bold text-gray-900 dark:text-white transition-colors duration-300">NewTail</h1>
          </Link>
          
          {/* User Menu */}
          <div className="flex-1 flex justify-end">
            <div className="relative" ref={menuRef}><button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-gray-700 dark:text-white hover:text-orchid-500 dark:hover:text-aquamarine-400 transition-colors duration-300"
            >
              <User size={20} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-marine-800 rounded-lg shadow-lg border border-gray-200 dark:border-marine-600 py-1 transition-colors duration-300">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-marine-700 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="np-medium">Cerrar sesión</span>
                </button>
              </div>            )}
          </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;

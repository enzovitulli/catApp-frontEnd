import { Link } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { PawPrint, LogOut, MessageCircle, UserCog } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PropTypes from 'prop-types';

// Navigation items for desktop header
const navItems = [
  { id: 'petitions', icon: MessageCircle, label: 'Peticiones', path: '/app/petitions' },
  { id: 'feed', icon: PawPrint, label: 'Mascotas', path: '/app/adoption' },
  { id: 'settings', icon: UserCog, label: 'Perfil', path: '/app/settings' },
];

const AppHeader = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleTabClick = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    }
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
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="relative flex items-center h-16">
          {/* Desktop: Logo on left */}
          <div className="hidden md:block">
            <Link to="/app" className="flex items-center">
              <img src="/svg/NewTail.svg" alt="NewTail" className="w-7 h-7 mr-1.5" />
              <h1 className="text-xl np-bold text-gray-900 dark:text-white transition-colors duration-300">NewTail</h1>
            </Link>
          </div>
          
          {/* Mobile: Centered Logo */}
          <div className="flex md:hidden w-full justify-center">
            <Link to="/app" className="flex items-center">
              <img src="/svg/NewTail.svg" alt="NewTail" className="w-7 h-7 mr-1.5" />
              <h1 className="text-xl np-bold text-gray-900 dark:text-white transition-colors duration-300">NewTail</h1>
            </Link>
          </div>
          
          {/* Desktop: Centered Navigation */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <nav className="flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-orchid-500 dark:text-aquamarine-400 bg-orchid-50 dark:bg-aquamarine-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-orchid-500 dark:hover:text-aquamarine-400 hover:bg-gray-100 dark:hover:bg-marine-700/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="np-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Desktop: Direct Logout Button */}
          <div className="hidden md:block ml-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-white hover:text-orchid-500 dark:hover:text-aquamarine-400 hover:bg-gray-100 dark:hover:bg-marine-700/50 rounded-lg transition-all duration-300 cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
              <span className="np-medium text-sm">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

AppHeader.propTypes = {
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
};

export default AppHeader;

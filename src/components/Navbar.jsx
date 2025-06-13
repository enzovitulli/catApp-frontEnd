import { PawPrint, MessageCircle, UserCog } from 'lucide-react';
import { Link } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import PropTypes from 'prop-types';

// Updated nav items for the new structure: Petitions, Feed (centered), Settings
const navItems = [
  { id: 'petitions', icon: MessageCircle, label: 'Peticiones', path: '/app/petitions' },
  { id: 'feed', icon: PawPrint, label: 'Mascotas', path: '/app/adoption', isCenter: true },
  { id: 'settings', icon: UserCog, label: 'Perfil', path: '/app/settings' },
];

const Navbar = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div
      className='fixed bottom-4 left-0 right-0 flex justify-center md:hidden z-50'
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        boxSizing: 'border-box',
      }}
    >
      <div className='flex items-center justify-between w-[90%] max-w-md px-6 py-4 bg-white/95 dark:bg-marine-800/95 backdrop-blur-md rounded-full shadow-lg shadow-black/10 dark:shadow-black/30 border border-gray-200/20 dark:border-marine-600/30 h-20'>
        {/* Left section - Petitions */}
        <div className="flex-1 flex justify-start">
          {navItems.filter(item => item.id === 'petitions').map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => handleTabClick(item.id)}
                className="flex items-center justify-center p-3 relative transition-all duration-200"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="flex flex-col items-center"
                >
                  <Icon 
                    size={24} 
                    className={`transition-all duration-200 ${
                      isActive 
                        ? 'text-green-500 dark:text-green-400 drop-shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                  
                  {/* Simple indicator dot without complex animations */}
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mt-1" />
                  )}
                  
                  <span className="sr-only">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Center section - Feed icon (prominent) */}
        <div className="flex justify-center">
          {navItems.filter(item => item.isCenter).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => handleTabClick(item.id)}
                className="flex items-center justify-center transition-all duration-200"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-500 dark:bg-green-400 shadow-lg' 
                      : 'bg-gray-100 dark:bg-marine-700 hover:bg-gray-200 dark:hover:bg-marine-600'
                  }`}
                >
                  <Icon 
                    size={28} 
                    className={`transition-all duration-200 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                  <span className="sr-only">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Right section - Settings */}
        <div className="flex-1 flex justify-end">
          {navItems.filter(item => item.id === 'settings').map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => handleTabClick(item.id)}
                className="flex items-center justify-center p-3 relative transition-all duration-200"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="flex flex-col items-center"
                >
                  <Icon 
                    size={24} 
                    className={`transition-all duration-200 ${
                      isActive 
                        ? 'text-green-500 dark:text-green-400 drop-shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                  
                  {/* Simple indicator dot without complex animations */}
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mt-1" />
                  )}
                  
                  <span className="sr-only">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default Navbar;

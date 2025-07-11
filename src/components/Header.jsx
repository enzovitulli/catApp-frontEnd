import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Home, Heart, MessageCircle, LogIn, 
  UserPlus, LogOut, User, Loader2, Settings, Info, HelpCircle, Building, BookOpen
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = ({ showAuthButtons = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  // Check if we're on the help page
  const isHelpPage = location.pathname === '/help';
  
  // State for search docking
  const [isSearchDocked, setIsSearchDocked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const [menuHeight, setMenuHeight] = useState(0);
  
  // Toggle mobile menu with animation
  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      requestAnimationFrame(() => {
        if (menuRef.current) {
          setMenuHeight(menuRef.current.scrollHeight);
        }
      });
    } else {
      setMenuHeight(0);
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 300);
    }
  };

  // Toggle user dropdown menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(prev => !prev);
  };

  // Handle logout action
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isUserMenuOpen) return;
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Update menu height on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen && menuRef.current) {
        setMenuHeight(menuRef.current.scrollHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMenuOpen]);
  
  // Helper functions for user display
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  };
  
  const getAvatarLetter = () => {
    if (user?.name && user.name.trim().length > 0) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  // Updated navigation links - added "Historias" and "Más Información"
  const navLinks = [
    { to: "/", label: "Inicio", icon: <Home size={20} className="mr-1.5" /> },
    { to: "/shelter", label: "Únete como refugio", icon: <Building size={20} className="mr-1.5" /> },
    { to: "/historias", label: "Historias", icon: <Heart size={20} className="mr-1.5" /> },
    { to: "/help", label: "Ayuda", icon: <HelpCircle size={20} className="mr-1.5" /> }
  ];

  const navigationItems = [
    { 
      to: '/historias', 
      label: 'Historias', 
      icon: <BookOpen size={18} />,
      description: 'Historias de adopción'
    },
    { 
      to: '/help', 
      label: 'Ayuda', 
      icon: <HelpCircle size={18} />,
      description: 'Centro de ayuda'
    },
    { 
      to: '/shelter', 
      label: 'Refugios', 
      icon: <Building size={18} />,
      description: 'Para refugios'
    }
  ];

  // Custom hamburger icon with rounded lines
  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  // Expose the search docking state setter globally for the HelpPage to use
  useEffect(() => {
    if (isHelpPage) {
      window.setHeaderSearchDocked = setIsSearchDocked;
      return () => {
        window.setHeaderSearchDocked = null;
      };
    }
  }, [isHelpPage]);

  // Function to handle header link clicks with scroll reset
  const handleHeaderLinkClick = () => {
    // Close mobile menu if open
    setIsMenuOpen(false);
    
    // Reset scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 w-full z-50 bg-marine-800"
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        paddingLeft: 'env(safe-area-inset-left, 1rem)',
        paddingRight: 'env(safe-area-inset-right, 1rem)'
      }}
      initial={{ y: -50 }}
      animate={{ 
        y: 0,
        paddingBottom: isHelpPage && isSearchDocked ? '2.5rem' : '0.75rem' // Reduced from 3.5rem to 2.5rem
      }}
      transition={{ 
        y: { type: "spring", stiffness: 300, damping: 30 },
        paddingBottom: { duration: 0.15, ease: "easeInOut" } // Faster animation
      }}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo - centered on mobile/tablet */}
          <Link to={isAuthenticated ? '/app' : '/'} className="flex items-center mx-auto lg:mx-0">
            <img src="/svg/NewTail.svg" alt="NewTail" className="w-7 h-7 mr-1.5" />
            <h1 className="text-xl np-bold text-white">NewTail</h1>
          </Link>
          
          {/* Desktop Navigation Links - hidden below lg (1024px) */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                to={link.to}
                className={({ isActive }) =>
                  `text-white hover:text-aquamarine-300 transition-colors whitespace-nowrap np-medium
                  ${isActive ? 'text-aquamarine-400' : ''}`}
                onClick={handleHeaderLinkClick}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          
          {/* Desktop Auth Buttons - hidden below lg (1024px) */}
          <div className="hidden lg:flex items-center space-x-4">
            {loading ? (
              <div className="text-white flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-aquamarine-400" />
                <span className="text-sm np-regular">Cargando...</span>
              </div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  ref={userButtonRef}
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-white rounded-full hover:text-aquamarine-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orchid-600 flex items-center justify-center text-white np-bold cursor-pointer">
                    {getAvatarLetter()}
                  </div>
                  <span className="cursor-pointer np-medium">{getUserDisplayName()}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      ref={userMenuRef}
                      className="absolute right-0 mt-2 w-64 bg-oxford-800 rounded-lg shadow-lg py-2 z-50 overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >                      <div className="px-5 py-3 border-b border-oxford-700">
                        <p className="text-sm text-gray-400 np-regular">Iniciado como</p>
                        <p className="np-medium text-white truncate">{user?.email}</p>
                        {user?.tipo === 'EMPRESA' && (
                          <p className="text-xs text-aquamarine-400 np-regular">Empresa</p>
                        )}
                      </div>
                      
                      {/* Backoffice link for EMPRESA users */}
                      {user?.tipo === 'EMPRESA' && (
                        <>
                          <Link
                            to="/backoffice"
                            className="block px-5 py-2.5 text-gray-300 hover:bg-oxford-700 flex items-center cursor-pointer np-regular"
                            onClick={() => {setIsUserMenuOpen(false); handleHeaderLinkClick()}}
                          >
                            <Building size={18} className="mr-3" />
                            <span>Backoffice</span>
                          </Link>
                          <div className="border-t border-oxford-700 my-1"></div>
                        </>
                      )}
                      
                      <Link
                        to="/profile"
                        className="block px-5 py-2.5 text-gray-300 hover:bg-oxford-700 flex items-center cursor-pointer np-regular"
                        onClick={() => {setIsUserMenuOpen(false); handleHeaderLinkClick()}}
                      >
                        <User size={18} className="mr-3" />
                        <span>Mi Perfil</span>
                      </Link>
                      
                      <Link
                        to="/app/favorites"
                        className="block px-5 py-2.5 text-gray-300 hover:bg-oxford-700 flex items-center cursor-pointer np-regular"
                        onClick={() => {setIsUserMenuOpen(false); handleHeaderLinkClick()}}
                      >
                        <Heart size={18} className="mr-3" />
                        <span>Mis Favoritos</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="block px-5 py-2.5 text-gray-300 hover:bg-oxford-700 flex items-center cursor-pointer np-regular"
                        onClick={() => {setIsUserMenuOpen(false); handleHeaderLinkClick()}}
                      >
                        <Settings size={18} className="mr-3" />
                        <span>Preferencias</span>
                      </Link>
                      
                      <div className="border-t border-oxford-700 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-5 py-2.5 text-gray-300 hover:bg-oxford-700 flex items-center cursor-pointer np-regular"
                      >
                        <LogOut size={18} className="mr-3" />
                        <span>Cerrar sesión</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="flex items-center text-white hover:text-aquamarine-300 transition-colors np-medium"
                >
                  <LogIn size={18} className="mr-1" />
                  <span>Iniciar Sesión</span>
                </Link>
                <Link 
                  to="/register" 
                  className="bg-aquamarine-400 hover:bg-aquamarine-500 text-oxford-900 py-2 px-5 rounded-full flex items-center np-bold"
                >
                  <UserPlus size={18} className="mr-1" />
                  <span>Registrarse</span>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button - visible below lg (1024px) */}
          <div className="lg:hidden flex items-center absolute right-4">
            <button 
              className="text-white p-1 mx-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <MenuIcon />}
            </button>
          </div>
        </div>
        
        {/* Search input docking area - only visible on help page */}
        <motion.div
          id="header-search-dock"
          className="flex justify-center relative"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isHelpPage && isSearchDocked ? '52px' : '0px', // Increased slightly for better spacing
            opacity: isHelpPage && isSearchDocked ? 1 : 0,
            marginTop: isHelpPage && isSearchDocked ? '10px' : '0px', // Consistent spacing
          }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          style={{ 
            overflow: 'visible',
            zIndex: 40
          }}
        >
          {/* Space reserved for the docked search input - no visual placeholder needed */}
        </motion.div>
        
        {/* Mobile Navigation Menu - visible below lg (1024px) */}
        <div 
          className="lg:hidden overflow-hidden transition-all duration-300 ease-in-out absolute left-0 right-0 -mt-px top-full bg-marine-800 shadow-lg z-20"
          style={{ 
            height: isMenuOpen ? menuHeight + 'px' : '0',
            opacity: 1,
            visibility: isMenuOpen ? 'visible' : 'hidden',
            borderBottomLeftRadius: '0.5rem',
            borderBottomRightRadius: '0.5rem',
            boxShadow: isMenuOpen ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          <div ref={menuRef} className="py-2 px-6">
            <div className="flex flex-col space-y-1 pb-3">
              {navLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center text-white hover:text-aquamarine-300 py-3 transition-colors np-medium
                    ${isActive ? 'text-aquamarine-400' : ''}`}
                  onClick={() => {toggleMenu(); handleHeaderLinkClick()}}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}

              {/* Always include login/register in mobile menu */}
              {!isAuthenticated && (
                <>
                  <NavLink
                    to="/login"
                    className="flex items-center text-gray-300 hover:text-white py-3 transition-colors np-medium"
                    onClick={() => {toggleMenu(); handleHeaderLinkClick()}}
                  >
                    <LogIn className="h-5 w-5 mr-3" strokeWidth={2} />
                    Iniciar Sesión
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="flex items-center text-aquamarine-400 hover:text-aquamarine-300 py-3 transition-colors cursor-pointer np-bold"
                    onClick={() => {toggleMenu(); handleHeaderLinkClick()}}
                  >
                    <UserPlus className="h-5 w-5 mr-3" strokeWidth={2} />
                    Registrarse
                  </NavLink>
                </>
              )}

              {loading ? (
                <div className="flex items-center text-white py-3 mt-4">
                  <Loader2 className="h-5 w-5 animate-spin text-aquamarine-400 mr-3" />
                  <span className="np-regular">Cargando...</span>
                </div>
              ) : isAuthenticated ? (
                <>
                  <div className="mt-6 pt-4 border-t border-marine-700">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-orchid-600 flex items-center justify-center text-white np-bold text-lg">
                        {getAvatarLetter()}
                      </div>
                      <div className="ml-3">
                        <div className="text-white np-medium">{getUserDisplayName()}</div>
                        <div className="text-sm text-gray-300 opacity-80 truncate max-w-[200px] np-regular">{user?.email}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 ml-1 space-y-1">
                      <Link
                        to="/profile"
                        className="flex items-center text-gray-300 hover:text-white py-2 transition-colors np-regular"
                        onClick={() => {toggleMenu(); handleHeaderLinkClick()}}
                      >
                        <User className="h-5 w-5 mr-3" strokeWidth={2} />
                        Mi Perfil
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center text-gray-300 hover:text-white py-2 transition-colors np-regular"
                        onClick={() => {toggleMenu(); handleHeaderLinkClick()}}
                      >
                        <Settings className="h-5 w-5 mr-3" strokeWidth={2} />
                        Preferencias
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          toggleMenu();
                        }}
                        className="flex items-center w-full text-left text-aquamarine-400 hover:text-aquamarine-300 py-2 transition-colors np-medium"
                      >
                        <LogOut className="h-5 w-5 mr-3" strokeWidth={2} />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
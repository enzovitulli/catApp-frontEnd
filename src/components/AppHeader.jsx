import { Link } from 'react-router';
import { motion } from 'motion/react';
import { PawPrint } from 'lucide-react';

const AppHeader = () => {
  return (
    <motion.header 
      className="fixed top-0 left-0 w-full z-50 bg-marine-800"
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
      <div className="container mx-auto">
        <div className="flex justify-center items-center">
          {/* Logo - centered on all screen sizes */}
          <Link to="/app" className="flex items-center">
            <PawPrint className="text-aquamarine-400 mr-1.5" size={26} />
            <h1 className="text-xl np-bold text-white">NewTail</h1>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;

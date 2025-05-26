import { motion } from 'motion/react';

const Header = () => {
  return (
    <motion.div 
      className="bg-gray-100 shadow-sm z-50"
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
      <div className="flex justify-center items-center">
        <h1 className="text-xl font-bold">Adopt</h1>
      </div>
    </motion.div>
  );
};

export default Header;

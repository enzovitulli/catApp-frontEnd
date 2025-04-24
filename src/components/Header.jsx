import { motion } from 'motion/react';

const Header = () => {
  return (
    <motion.div 
      className="bg-gray-100 py-3 px-4 shadow-sm z-50"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-center items-center">
        <h1 className="text-xl font-bold">Cattify</h1>
      </div>
    </motion.div>
  );
};

export default Header;

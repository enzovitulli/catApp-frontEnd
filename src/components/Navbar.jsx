import { Home, Cat, MessageCircle, Heart } from 'lucide-react';
import { motion } from 'motion/react';

// Updated nav items labels to match pet adoption context
const navItems = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'cat', icon: Cat, label: 'Mascotas' },
  { id: 'message', icon: MessageCircle, label: 'Contacto' },
  { id: 'heart', icon: Heart, label: 'Favoritos' },
];

const Navbar = ({ activeTab, setActiveTab }) => (
  <div
    className='fixed bottom-4 left-0 right-0 flex justify-center md:hidden z-50'
    style={{
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      boxSizing: 'border-box',
    }}>
    <div className='flex items-center justify-between w-[90%] max-w-md px-4 py-3 bg-gray-100 rounded-full shadow-md relative overflow-visible'>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className='flex items-center justify-center p-2 z-10 relative'
            style={{ width: '25%' }}
            whileTap={{ scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
            {/* Accessible label */}
            <span className="sr-only">{item.label}</span>
            
            {/* SVG icons */}
            {item.id === 'home' ? (
              <svg
                width={28}
                height={28}
                viewBox='0 0 24 24'
                fill={isActive ? 'black' : 'none'}
                stroke='black'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                {/* Casa exterior */}
                <path d='M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' />
                <path d='M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
                {/* Puerta como un rectángulo blanco, dimensionado y posicionado para coincidir con la puerta */}
                {isActive && <rect x='10' y='13' width='4' height='8' fill='#F3F4F6' stroke='none' rx='1' />}
              </svg>
            ) : item.id === 'cat' ? (
              <svg
                width={28}
                height={28}
                viewBox='0 0 24 24'
                fill={isActive ? 'black' : 'none'}
                stroke='black'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                {/* Contorno de gato */}
                <path d='M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z' />
                {/* Ojos */}
                <path d='M8 14v.5' stroke={isActive ? '#F3F4F6' : 'black'} strokeWidth='2' strokeLinecap='round' />
                <path d='M16 14v.5' stroke={isActive ? '#F3F4F6' : 'black'} strokeWidth='2' strokeLinecap='round' />
                {/* Nariz */}
                <path
                  d='M11.25 16.25h1.5L12 17l-.75-.75Z'
                  stroke={isActive ? '#F3F4F6' : 'black'}
                  strokeWidth='2'
                  strokeLinejoin='round'
                />
              </svg>
            ) : item.id === 'message' ? (
              <Icon size={28} stroke='black' fill={isActive ? 'black' : 'none'} />
            ) : item.id === 'heart' ? (
              <Icon size={28} stroke='black' fill={isActive ? 'black' : 'none'} />
            ) : null}
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default Navbar;

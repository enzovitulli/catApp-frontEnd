import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const AccordionItem = ({ title, children, isOpen, onToggle, index }) => {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="flex justify-between items-center w-full py-5 px-4 text-left focus:outline-none cursor-pointer"
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${index}`}
      >
        <h3 className="text-lg np-semibold text-oxford-800">{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          <ChevronDown size={20} className="text-orchid-500" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-content-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-0 text-gray-600 np-regular">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Accordion = ({ items, resetTrigger = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  
  // Reset accordion when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setActiveIndex(null);
    }
  }, [resetTrigger]);
  
  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          index={index}
          title={item.question || item.title}
          isOpen={activeIndex === index}
          onToggle={handleToggle}
        >
          {item.answer || item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;

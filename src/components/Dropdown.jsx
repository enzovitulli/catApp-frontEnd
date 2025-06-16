import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';

const Dropdown = ({
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  disabled = false,
  error = false,
  leftIcon,
  className = "",
  id,
  maxHeight = "192px",
  renderOption = null, // Custom option renderer
  displayValue = null // Custom display value
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  // Handle selecting an option
  const handleSelect = (option) => {
    if (onChange) {
      onChange(option);
    }
    setIsOpen(false);
  };

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = parseInt(maxHeight) || 192;
    
    // Check if there's enough space below
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    // Calculate positioning style
    const baseStyle = {
      zIndex: 9999,
      left: buttonRect.left,
      width: buttonRect.width,
      maxHeight
    };
    
    // If there's not enough space below but enough above, position above
    if (spaceBelow < dropdownHeight + 20 && spaceAbove > dropdownHeight + 20) {
      setDropdownStyle({
        ...baseStyle,
        bottom: viewportHeight - buttonRect.top + 4
      });
    } else {
      setDropdownStyle({
        ...baseStyle,
        top: buttonRect.bottom + 4
      });
    }
  };

  // Toggle dropdown
  const handleToggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        calculateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Recalculate position on window resize
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      calculateDropdownPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);
  // Get display text
  const getDisplayText = () => {
    if (!value) return placeholder;
    if (displayValue) return displayValue(value);
    
    // If value is an object, return its label
    if (typeof value === 'object') return value.label;
    
    // Find the matching option in the options array to get the proper label
    const matchingOption = options.find(option => {
      const optionValue = typeof option === 'object' ? option.value : option;
      return optionValue === value;
    });
    
    // Return the label from the matching option, or fallback to value
    if (matchingOption) {
      return typeof matchingOption === 'object' ? matchingOption.label : matchingOption;
    }
    
    return value;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={handleToggleDropdown}
        disabled={disabled}
        className={`
          w-full ${leftIcon ? 'pl-10' : 'pl-4'} pr-10 py-4 
          bg-white border-2 rounded-2xl 
          np-regular text-left
          cursor-pointer
          transition-all duration-200 focus:outline-none
          flex items-center justify-between
          min-h-[56px]
          shadow-inner hover:shadow-inner focus:shadow-inner
          ${error 
            ? 'border-red-300 focus:border-red-500 ring-2 ring-red-200' 
            : 'border-gray-300 focus:border-aquamarine-600 focus:ring-2 focus:ring-aquamarine-100'
          }
          ${disabled 
            ? 'bg-gray-50 cursor-not-allowed' 
            : 'hover:border-aquamarine-300'
          }
          ${!value ? 'text-gray-400' : 'text-gray-800'}
        `}
      >
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        
        {/* Display text */}
        <span className="flex-1 truncate">
          {getDisplayText()}
        </span>
        
        {/* Chevron Icon - Fixed positioning to match left icon spacing */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <ChevronDown 
            size={20} 
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            } ${error ? 'text-red-400' : 'text-gray-400'}`} 
          />
        </div>
      </button>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div 
          ref={listRef}
          className="fixed bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          style={dropdownStyle}
        >
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight }}>
            {options.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center np-regular">
                No hay opciones disponibles
              </div>
            ) : (
              options.map((option, index) => {
                const optionValue = typeof option === 'object' ? option.value : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
                const isSelected = value === optionValue || 
                  (typeof value === 'object' && value?.value === optionValue);
                
                return (                  <button
                    key={`${optionValue}-${index}`}
                    type="button"
                    onClick={() => handleSelect(optionValue)}
                    className={`w-full px-4 py-3 text-left transition-colors duration-150 np-regular cursor-pointer ${
                      isSelected 
                        ? 'bg-aquamarine-100 text-aquamarine-800' 
                        : 'text-gray-700 hover:bg-aquamarine-50 hover:text-aquamarine-700'
                    } ${index !== options.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {renderOption ? renderOption(option, isSelected) : optionLabel}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  leftIcon: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  maxHeight: PropTypes.string,
  renderOption: PropTypes.func,
  displayValue: PropTypes.func
};

export default Dropdown;

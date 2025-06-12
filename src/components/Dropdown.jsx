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
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Handle selecting an option
  const handleSelect = (option) => {
    if (onChange) {
      onChange(option);
    }
    setIsOpen(false);
  };

  // Toggle dropdown
  const handleToggleDropdown = () => {
    if (!disabled) {
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
        disabled={disabled}        className={`
          w-full pl-${leftIcon ? '10' : '4'} pr-10 py-4 
          bg-white border-2 rounded-2xl 
          np-regular text-center
          cursor-pointer relative
          transition-colors focus:outline-none
          flex items-center justify-center
          min-h-[56px]
          ${error 
            ? 'border-red-300 focus:border-red-500' 
            : 'border-gray-300 focus:border-aquamarine-600'
          }
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'hover:border-aquamarine-300'
          }
          ${!value ? 'text-gray-400' : 'text-gray-800'}
        `}
      >
        {/* Left Icon */}
        {leftIcon && (
          <div className={`absolute left-3 transition-colors pointer-events-none ${
            error ? 'text-red-500' : 'text-aquamarine-600'
          }`}>
            {leftIcon}
          </div>
        )}
        
        {/* Display text */}
        <span className="flex-1 truncate">
          {getDisplayText()}
        </span>
        
        {/* Chevron Icon */}
        <ChevronDown 
          size={20} 
          className={`absolute right-3 transition-transform pointer-events-none ${
            isOpen ? 'rotate-180' : ''
          } ${error ? 'text-red-500' : 'text-aquamarine-600'}`} 
        />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden"
          style={{ maxHeight }}
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
                
                return (
                  <button
                    key={`${optionValue}-${index}`}
                    type="button"
                    onClick={() => handleSelect(optionValue)}                    className={`w-full px-4 py-3 text-left transition-colors np-regular border-b border-gray-100 last:border-b-0 min-h-[48px] flex items-center cursor-pointer ${
                      isSelected 
                        ? 'bg-aquamarine-50 text-aquamarine-700' 
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
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

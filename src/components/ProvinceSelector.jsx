import { MapPinPlus, ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';

const ProvinceSelector = ({ 
  value, 
  onChange, 
  label = "¿En qué provincia vives?",
  placeholder = "Selecciona tu provincia",
  id = "provincia",
  className = "",
  labelSize = "lg",
  labelColor = "text-gray-800",
  required = false,
  disabled = false,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Spanish provinces list
  const provinces = [
    'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona', 
    'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 
    'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Gipuzkoa', 'Huelva', 'Huesca', 'Jaén', 
    'La Coruña', 'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 
    'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Segovia', 
    'Sevilla', 'Soria', 'Tarragona', 'Santa Cruz de Tenerife', 'Teruel', 'Toledo', 
    'Valencia', 'Valladolid', 'Bizkaia', 'Zamora', 'Zaragoza'
  ];
  // Handle selecting a province
  const handleSelect = (province) => {
    if (onChange) {
      onChange(province);
    }
    setIsOpen(false);
  };

  // Calculate dropdown position when opening
  const handleToggleDropdown = () => {
    if (!disabled) {
      if (!isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
      setIsOpen(!isOpen);
    }
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dynamic label sizing
  let labelSizeClass = 'text-sm';
  if (labelSize === 'lg') {
    labelSizeClass = 'text-lg';
  } else if (labelSize === 'base') {
    labelSizeClass = 'text-base';
  }  return (
    <div className={`space-y-2 province-selector ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id} 
          className={`block ${labelSizeClass} np-medium ${labelColor} mb-4 text-center`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Custom Dropdown Container */}
      <div className="relative">        {/* Dropdown Button */}
        <button
          ref={buttonRef}
          type="button"
          id={id}
          onClick={handleToggleDropdown}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-4 
            bg-gray-50 border rounded-2xl 
            np-regular text-center
            cursor-pointer relative
            transition-colors focus:outline-none
            flex items-center justify-center
            ${error 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-aquamarine-600'
            }
            ${disabled 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'hover:border-aquamarine-300'
            }
            ${!value ? 'text-gray-400' : 'text-gray-800'}
          `}
        >{/* MapPinPlus Icon */}
          <MapPinPlus 
            size={20} 
            className={`absolute left-3 transition-colors pointer-events-none ${
              error ? 'text-red-500' : 'text-aquamarine-600'
            }`} 
          />
          
          {/* Display text */}
          <span className="flex-1">
            {value || placeholder}
          </span>
          
          {/* Chevron Icon */}
          <ChevronDown 
            size={20} 
            className={`absolute right-3 transition-transform pointer-events-none ${
              isOpen ? 'rotate-180' : ''
            } ${error ? 'text-red-500' : 'text-aquamarine-600'}`} 
          />
        </button>        {/* Custom Dropdown List */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="fixed bg-white border border-gray-200 rounded-2xl shadow-lg z-[100] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: '192px'
            }}
          >
            <div className="overflow-y-auto custom-scrollbar" style={{ height: '192px' }}>
              {provinces.map((province) => (
                <button
                  key={province}
                  type="button"
                  onClick={() => handleSelect(province)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors np-regular text-gray-800 border-b border-gray-100 last:border-b-0"
                  style={{ height: '48px', minHeight: '48px' }}
                >
                  {province}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ProvinceSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  labelSize: PropTypes.oneOf(['sm', 'base', 'lg']),
  labelColor: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool
};

export default ProvinceSelector;

import { MapPinPlus } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Dropdown from './Dropdown';

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
  error = false,
  errorMessage = "",
  submissionTrigger = 0
}) => {
  const [shouldWiggle, setShouldWiggle] = useState(false);

  // Trigger wiggle animation when there's an error and form submission is attempted
  useEffect(() => {
    if (error && submissionTrigger > 0) {
      setShouldWiggle(true);
      const timer = setTimeout(() => setShouldWiggle(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error, submissionTrigger]);

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

  // Dynamic label sizing
  let labelSizeClass = 'text-sm';
  if (labelSize === 'lg') {
    labelSizeClass = 'text-lg';
  } else if (labelSize === 'base') {
    labelSizeClass = 'text-base';
  }

  // Dynamic icon color based on error state
  const getIconColor = () => {
    if (error) {
      return 'text-red-400';
    }
    return 'text-aquamarine-600';
  };

  // Dynamic icon animation class based on error state
  const getIconAnimationClass = () => {
    if (error && submissionTrigger > 0) {
      return 'animate-wiggle';
    }
    return '';
  };

  return (
    <div className={`province-selector ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id} 
          className={`block ${labelSizeClass} np-medium ${labelColor} mb-2`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Dropdown */}
      <Dropdown
        value={value}
        onChange={onChange}
        options={provinces}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        leftIcon={
          <div 
            key={error && submissionTrigger > 0 ? `icon-${submissionTrigger}` : 'icon'}
            className={`${getIconColor()} ${getIconAnimationClass()}`}
          >
            <MapPinPlus size={20} />
          </div>
        }
        id={id}
        maxHeight="192px"
        className="w-full"
      />
      
      {/* Error message container - Always reserves space to prevent layout shift */}
      <div className="mt-1 h-5 flex items-start">
        {error && errorMessage && (
          <p className="text-sm text-red-600 np-regular leading-tight">
            {errorMessage}
          </p>
        )}
      </div>
    </div>  );
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
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  submissionTrigger: PropTypes.number
};

export default ProvinceSelector;

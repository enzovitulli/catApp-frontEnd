import { MapPinPlus } from 'lucide-react';
import PropTypes from 'prop-types';
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
  error = false
}) => {
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

  return (
    <div className={`space-y-2 province-selector ${className}`}>
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
      
      {/* Dropdown */}
      <Dropdown
        value={value}
        onChange={onChange}
        options={provinces}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        leftIcon={<MapPinPlus size={20} />}
        id={id}
        maxHeight="192px"
        className="w-full"
      />
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
  error: PropTypes.bool
};

export default ProvinceSelector;

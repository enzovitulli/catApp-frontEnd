import PropTypes from 'prop-types';

/**
 * ToggleSwitch - A modern iOS-style toggle switch component
 * @param {boolean} checked - Whether the switch is toggled on
 * @param {function} onChange - Callback when the switch is toggled
 * @param {string} label - Label text for the switch
 * @param {string} description - Optional description text
 * @param {boolean} disabled - Whether the switch is disabled
 * @param {string} size - Size of the switch ('sm', 'md', 'lg')
 * @param {string} className - Additional CSS classes
 */
const ToggleSwitch = ({ 
  checked = false, 
  onChange, 
  label, 
  description,
  disabled = false,
  size = 'md',
  className = '',
  id
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4'
    },
    md: {
      container: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      container: 'w-14 h-8',
      thumb: 'w-7 h-7',
      translate: 'translate-x-6'
    }
  };

  const config = sizeConfig[size];

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex items-center pt-0.5">
        {/* Hidden checkbox for accessibility */}
        <input
          id={toggleId}
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
          className="sr-only"
        />
        
        {/* Toggle switch */}
        <label
          htmlFor={toggleId}
          className={`
            relative inline-flex ${config.container} items-center rounded-full 
            transition-all duration-300 ease-in-out cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${checked 
              ? 'bg-aquamarine-500 hover:bg-aquamarine-600' 
              : 'bg-gray-300 hover:bg-gray-400'
            }
            focus-within:ring-2 focus-within:ring-aquamarine-500 focus-within:ring-offset-2
            shadow-inner
          `}
        >
          {/* Thumb */}
          <span
            className={`
              ${config.thumb} inline-block rounded-full bg-white shadow-lg
              transition-all duration-300 ease-in-out
              ${checked ? config.translate : 'translate-x-0.5'}
              transform-gpu
            `}
          />
        </label>
      </div>

      {/* Label and description */}
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={toggleId}
              className={`
                block text-sm font-medium np-medium cursor-pointer
                ${disabled ? 'text-gray-400' : 'text-gray-700'}
              `}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`
              text-sm np-regular mt-1
              ${disabled ? 'text-gray-400' : 'text-gray-500'}
            `}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

ToggleSwitch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  id: PropTypes.string
};

export default ToggleSwitch;

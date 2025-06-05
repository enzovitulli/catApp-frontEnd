import PropTypes from 'prop-types';

/**
 * InputField - A reusable input field component with icon and label
 * @param {string} id - Unique identifier for the input
 * @param {string} label - Label text to display above the input
 * @param {string} type - Input type (email, password, tel, text, etc.)
 * @param {string} value - Current input value
 * @param {function} onChange - Callback when input value changes
 * @param {string} placeholder - Placeholder text
 * @param {ReactNode} leftIcon - Icon to display on the left side of the input
 * @param {string} labelSize - Label text size ('sm', 'base', 'lg') - default 'base'
 * @param {string} iconColor - Icon color class - default 'text-aquamarine-600'
 * @param {string} focusColor - Focus border color - default 'focus:border-aquamarine-600'
 * @param {string} placeholderColor - Placeholder text color - default 'placeholder-gray-400'
 * @param {ReactNode} rightElement - Optional element to display on the right (e.g., forgot password link)
 * @param {boolean} error - Whether the field has an error - default false
 * @param {string} errorMessage - Error message to display - default null
 * @param {number} submissionTrigger - Counter that increments on each form submission to trigger wiggle animation
 */
export default function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  leftIcon,
  labelSize = 'base',
  iconColor = 'text-aquamarine-600',
  focusColor = 'focus:border-aquamarine-600',
  placeholderColor = 'placeholder-gray-400',
  rightElement = null,
  error = false,
  errorMessage = null,
  submissionTrigger = 0,
  ...props
}) {const getLabelSizeClass = () => {
    switch (labelSize) {
      case 'sm':
        return 'text-xs sm:text-sm';
      case 'lg':
        return 'text-base sm:text-lg';
      case 'base':
      default:
        return 'text-sm sm:text-base';
    }
  };
  // Dynamic border color based on error state
  const getBorderColor = () => {
    if (error) {
      return 'border-red-300 focus:border-red-500';
    }
    return `border-gray-300 ${focusColor}`;
  };
  // Dynamic icon color based on error state
  const getIconColor = () => {
    if (error) {
      return 'text-red-400';
    }
    return iconColor;
  };
  // Dynamic icon animation class based on error state - restarts animation on each submission
  const getIconAnimationClass = () => {
    if (error && submissionTrigger > 0) {
      // Use submissionTrigger as a unique key to force animation restart
      return `animate-wiggle`;
    }
    return '';
  };

  return (
    <div>
      {/* Label with optional right element */}
      <div className={rightElement ? 'flex items-center justify-between mb-2' : 'mb-2'}>
        <label htmlFor={id} className={`block ${getLabelSizeClass()} np-medium text-gray-700`}>
          {label}
        </label>
        {rightElement}
      </div>
      
      {/* Input with icon */}      <div className="relative">
        {leftIcon && (
          <div 
            key={error && submissionTrigger > 0 ? `icon-${submissionTrigger}` : 'icon'}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getIconColor()} ${getIconAnimationClass()}`}
          >
            {leftIcon}
          </div>
        )}        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${leftIcon ? 'pl-10' : 'pl-4'} pr-4 py-4 bg-white border-2 ${getBorderColor()} rounded-2xl text-gray-800 ${placeholderColor} focus:outline-none transition-all duration-200 np-regular shadow-inner hover:shadow-inner focus:shadow-inner ${error ? 'ring-2 ring-red-200' : 'focus:ring-2 focus:ring-aquamarine-100'}`}
          {...props}
        />
      </div>
      
      {/* Error message container - Always reserves space to prevent layout shift */}
      <div className="mt-1 h-5 flex items-start">
        {error && errorMessage && (
          <p className="text-sm text-red-600 np-regular leading-tight">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  leftIcon: PropTypes.node,
  labelSize: PropTypes.oneOf(['sm', 'base', 'lg']),
  iconColor: PropTypes.string,
  focusColor: PropTypes.string,
  placeholderColor: PropTypes.string,
  rightElement: PropTypes.node,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  submissionTrigger: PropTypes.number,
};

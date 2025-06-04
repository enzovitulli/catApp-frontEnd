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
  ...props
}) {
  const getLabelSizeClass = () => {
    switch (labelSize) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'base':
      default:
        return 'text-base';
    }
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
      
      {/* Input with icon */}
      <div className="relative">
        {leftIcon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconColor}`}>
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${leftIcon ? 'pl-10' : 'pl-4'} pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 ${placeholderColor} ${focusColor} focus:outline-none transition-colors np-regular`}
          {...props}
        />
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
};

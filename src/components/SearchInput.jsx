import { useState } from 'react';
import PropTypes from 'prop-types';

const SearchInput = ({
  value,
  onChange,
  placeholder = '',
  leftIcon,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`relative w-full max-w-none ${className}`}>
      {/* Left Icon */}
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10 text-aquamarine-500">
          {leftIcon}
        </div>
      )}

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`
          w-full ${leftIcon ? 'pl-10' : 'pl-4'} pr-4 py-4 
          bg-white/95 backdrop-blur-sm border-0 rounded-2xl 
          text-gray-800 placeholder-gray-500 
          focus:outline-none focus:ring-2 focus:ring-aquamarine-500 focus:ring-opacity-50
          transition-all duration-200
          np-regular
          shadow-lg hover:shadow-xl focus:shadow-xl
          min-h-[48px] max-h-[48px]
          ${isFocused ? 'bg-white shadow-xl ring-2 ring-aquamarine-500 ring-opacity-50' : ''}
        `.trim()}
        {...props}
      />
    </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  leftIcon: PropTypes.node,
  className: PropTypes.string,
};

export default SearchInput;
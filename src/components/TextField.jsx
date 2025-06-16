import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';

const TextField = ({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  leftIcon,
  error = false,
  errorMessage = '',
  required = false,
  disabled = false,
  maxLength = 500,
  rows = 4,
  submissionTrigger = 0,
  className = '',
  labelSize = 'base',
  labelColor = 'text-gray-700',
  validateInput = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [internalError, setInternalError] = useState('');

  // Update character count when value changes
  useEffect(() => {
    setCharacterCount(value ? value.length : 0);
  }, [value]);

  // Handle input change with character limit and validation
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Respect maxLength limit
    if (newValue.length <= maxLength) {
      // Clear internal error when user starts typing
      if (internalError) {
        setInternalError('');
      }
      
      // If validation is enabled, validate the input
      if (validateInput) {
        // Only allow letters, numbers, spaces, and basic punctuation
        const validChars = /^[a-zA-Z0-9À-ÿ\u00f1\u00d1\s.,!?¿¡\-]*$/;
        
        if (!validChars.test(newValue)) {
          setInternalError('Solo se permiten letras, números y signos de puntuación básicos');
          return; // Don't update the value if it contains invalid characters
        }
      }
      
      onChange(newValue);
    }
  };

  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Determine label size classes
  const getLabelSizeClass = () => {
    switch (labelSize) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  // Determine if character count should be warning color
  const getCharacterCountColor = () => {
    const percentage = (characterCount / maxLength) * 100;
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-amber-500';
    return 'text-gray-500';
  };

  // Determine if there's an error to display (external or internal)
  const hasError = error || !!internalError;
  const displayErrorMessage = errorMessage || internalError;

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id}
          className={`block np-medium mb-2 ${getLabelSizeClass()} ${labelColor} ${
            required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''
          }`}
        >
          {label}
        </label>
      )}

      {/* Input Container - Use consistent spacing like InputField */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-3 text-gray-500 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        {/* Textarea */}
        <motion.textarea
          key={`${id}-${submissionTrigger}`}
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full resize-none
            ${leftIcon ? 'pl-10' : 'pl-4'} pr-4 py-3 pb-8
            bg-white border-2 border-gray-300 rounded-2xl
            text-gray-800 placeholder-gray-400
            focus:border-aquamarine-600 focus:outline-none focus:ring-2 focus:ring-aquamarine-100
            transition-all duration-200
            np-regular
            shadow-inner hover:shadow-inner focus:shadow-inner
            ${hasError ? 'border-red-300 bg-red-50 focus:border-red-500 ring-2 ring-red-200' : ''}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
            ${
              isFocused && !hasError && !disabled
                ? 'border-aquamarine-600 bg-white shadow-sm ring-2 ring-aquamarine-100'
                : ''
            }
          `.trim()}
          {...props}
        />

        {/* Character Counter */}
        <div className={`absolute bottom-2 right-3 text-xs np-regular pointer-events-none ${getCharacterCountColor()}`}>
          {characterCount}/{maxLength}
        </div>
      </div>

      {/* Error message container - Match InputField spacing exactly on all devices */}
      <div className="mt-1 h-5 flex items-start">
        {hasError && displayErrorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 np-regular leading-tight"
          >
            {displayErrorMessage}
          </motion.p>
        )}
      </div>
    </div>
  );
};

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  leftIcon: PropTypes.node,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  maxLength: PropTypes.number,
  rows: PropTypes.number,
  submissionTrigger: PropTypes.number,
  className: PropTypes.string,
  labelSize: PropTypes.oneOf(['sm', 'base', 'lg', 'xl']),
  labelColor: PropTypes.string,
  validateInput: PropTypes.bool,
};

export default TextField;

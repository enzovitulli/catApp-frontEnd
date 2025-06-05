// Validation utilities for forms

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'El email es requerido' };
  }

  // Remove any whitespace
  const trimmedEmail = email.trim();
  
  if (trimmedEmail !== email) {
    return { isValid: false, message: 'El email no puede contener espacios' };
  }

  // Basic email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: 'Por favor, introduce un email válido' };
  }
  // Check for invalid characters (only allow alphanumeric, dots, underscores, hyphens, plus signs, and @)
  const validChars = /^[a-zA-Z0-9._%+@-]+$/;
  if (!validChars.test(trimmedEmail)) {
    return { isValid: false, message: 'El email contiene caracteres no válidos' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates Spanish phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, message: string, cleanPhone: string }
 */
export const validateSpanishPhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: 'El teléfono es requerido', cleanPhone: '' };
  }
  // Remove all whitespace and common separators
  const cleanPhone = phone.replace(/[\s\-().]/g, '');
  
  // Check for +34 prefix
  const hasCountryCode = cleanPhone.startsWith('+34');
  const phoneWithoutCountryCode = hasCountryCode ? cleanPhone.substring(3) : cleanPhone;
  
  // Spanish phone numbers should be exactly 9 digits
  const phoneRegex = /^[6-9]\d{8}$/;
    if (!phoneRegex.test(phoneWithoutCountryCode)) {
    return { 
      isValid: false, 
      message: 'Introduce un número válido', 
      cleanPhone: phoneWithoutCountryCode 
    };
  }

  return { 
    isValid: true, 
    message: '', 
    cleanPhone: phoneWithoutCountryCode // Return without +34 for backend
  };
};

/**
 * Validates password
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'La contraseña es requerida' };
  }

  // Check for whitespace
  if (password.includes(' ')) {
    return { isValid: false, message: 'La contraseña no puede contener espacios' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates all form fields for registration
 * @param {object} formData - Form data object
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  let isValid = true;

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }

  // Validate phone
  const phoneValidation = validateSpanishPhone(formData.telefono);
  if (!phoneValidation.isValid) {
    errors.telefono = phoneValidation.message;
    isValid = false;
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
    isValid = false;
  }

  return { isValid, errors };
};

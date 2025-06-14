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
 * Validates name field (only letters and whitespaces, no numbers or symbols)
 * @param {string} name - Name to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateName = (name) => {
  if (!name) {
    return { isValid: false, message: 'El nombre es requerido' };
  }

  // Remove leading and trailing whitespace
  const trimmedName = name.trim();
  
  if (trimmedName !== name) {
    return { isValid: false, message: 'El nombre no puede empezar o terminar con espacios' };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, message: 'El nombre no puede tener más de 50 caracteres' };
  }

  // Only allow letters (including accented characters) and single spaces
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/;
  
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, message: 'El nombre solo puede contener letras y espacios' };
  }

  // Check for multiple consecutive spaces
  if (trimmedName.includes('  ')) {
    return { isValid: false, message: 'No se permiten espacios dobles' };
  }

  // Check that there are at least two words (name and last name)
  const words = trimmedName.split(' ').filter(word => word.length > 0);
  if (words.length < 2) {
    return { isValid: false, message: 'Debes introducir nombre y apellido' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates text field (only letters, numbers, and spaces)
 * @param {string} text - Text to validate
 * @param {boolean} required - Whether the field is required
 * @returns {object} - { isValid: boolean, message: string, cleanText: string }
 */
export const validateTextField = (text, required = false) => {
  if (!text && required) {
    return { isValid: false, message: 'Este campo es requerido', cleanText: '' };
  }
  
  if (!text) {
    return { isValid: true, message: '', cleanText: '' };
  }

  // Remove line breaks and excessive whitespace
  const cleanText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Only allow letters, numbers, spaces, and basic punctuation (.,!?¿¡-)
  const validChars = /^[a-zA-Z0-9À-ÿ\u00f1\u00d1\s.,!?¿¡\-]*$/;
  
  if (!validChars.test(cleanText)) {
    return { 
      isValid: false, 
      message: 'Solo se permiten letras, números y signos de puntuación básicos',
      cleanText: cleanText
    };
  }

  return { 
    isValid: true, 
    message: '', 
    cleanText: cleanText
  };
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

  // Validate name
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

/**
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
  return password.length >= 6;
};

/**
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {boolean}
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * @param {Object} formData
 * @returns {{isValid: boolean, errors: Object}}
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!isValidEmail(formData.email)) {
    errors.email = "Введите корректный Email";
  }

  if (!isValidPassword(formData.password)) {
    errors.password = "Пароль должен содержать минимум 6 символов";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * @param {Object} formData
 * @returns {{isValid: boolean, errors: Object}}
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  if (!isValidEmail(formData.email)) {
    errors.email = "Введите корректный Email";
  }

  if (!isValidPassword(formData.password)) {
    errors.password = "Пароль должен содержать минимум 6 символов";
  }

  if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = "Пароли не совпадают";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

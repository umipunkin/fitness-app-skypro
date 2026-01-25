import { ref, computed } from "vue";
import {
  isValidEmail,
  isValidPassword,
  passwordsMatch,
  validateLoginForm,
  validateRegisterForm,
} from "../utils/validation";

/**
 * @param {Object} props
 * @returns {Object}
 */

export function useAuthForm(props) {
  const email = ref("");
  const password = ref("");
  const confirmPassword = ref("");
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);

  const emailError = computed(() => !isValidEmail(email.value));
  const passwordError = computed(() => !isValidPassword(password.value));
  const confirmPasswordError = computed(
    () =>
      !props.isLogin && !passwordsMatch(password.value, confirmPassword.value)
  );

  const isFormValid = computed(() => {
    if (props.isLogin) {
      const validation = validateLoginForm({
        email: email.value,
        password: password.value,
      });
      return validation.isValid;
    }

    const validation = validateRegisterForm({
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    });
    return validation.isValid;
  });

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };

  const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
  };

  const resetForm = () => {
    email.value = "";
    password.value = "";
    confirmPassword.value = "";
    showPassword.value = false;
    showConfirmPassword.value = false;
  };

  return {
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,

    emailError,
    passwordError,
    confirmPasswordError,
    isFormValid,

    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    resetForm,
  };
}

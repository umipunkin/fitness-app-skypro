<template>
  <div
    v-show="isVisible"
    class="modal-overlay"
    @click.self="handleOverlayClick"
  >
    <div class="modal-content">
      <div class="logo">
        <img src="/img/logo.png" alt="Logo" >
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-input">
          <div class="input-wrapper">
            <input
              v-model="email"
              type="email"
              placeholder="Логин"
              required
              :class="{ 'error-field': emailError }"
            >
          </div>

          <div class="input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Пароль"
              required
              :class="{ 'error-field': passwordError }"
            >
            <button
              v-if="password.length > 0"
              type="button"
              class="password-toggle"
              :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              @click="togglePasswordVisibility"
            >
              <span class="toggle-icon">
                {{ showPassword ? "👁️" : "👁️‍🗨️" }}
              </span>
            </button>
          </div>

          <div v-if="!isLogin" class="input-wrapper">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Повторите пароль"
              required
              :class="{ 'error-field': confirmPasswordError }"
            >
            <button
              v-if="confirmPassword.length > 0"
              type="button"
              class="password-toggle"
              :aria-label="
                showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'
              "
              @click="toggleConfirmPasswordVisibility"
            >
              <span class="toggle-icon">
                {{ showConfirmPassword ? "👁️" : "👁️‍🗨️" }}
              </span>
            </button>
          </div>

          <div v-if="userStore.error" class="error-message">
            {{ errorMessage }}
          </div>
        </div>

        <div class="form-button">
          <button type="submit" class="login-button" :disabled="!isFormValid">
            {{ isLogin ? "Войти" : "Зарегистрироваться" }}
          </button>
          <button type="button" class="toggle-button" @click="handleModeToggle">
            {{ isLogin ? "Зарегистрироваться" : "Войти" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { useAuthForm } from "../composables/useAuthForm";

const props = defineProps({
  isLogin: {
    type: Boolean,
    required: true,
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
  isModal: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "toggle-mode"]);

const router = useRouter();
const userStore = useUserStore();

const {
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
} = useAuthForm(props);

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  try {
    if (props.isLogin) {
      await userStore.login(email.value, password.value);
    } else {
      await userStore.register(email.value, password.value);

      if (userStore.error) return;

      await userStore.login(email.value, password.value);
    }

    if (userStore.token && !userStore.error) {
      if (props.isModal) {
        emit("close");
      } else {
        await router.push("/");
      }
      resetForm();
    }
  } catch (error) {
    console.error("Auth error:", error);
  }
};

const errorMessages = {
  "invalid-email": "Введите корректный Email",
  "email-exists": "Пользователь с таким email уже существует",
  "password-length": "Пароль должен содержать минимум 6 символов",
  "password-special-chars": "Добавьте минимум 2 спецсимвола (!@#$%^&*)",
  "password-uppercase": "Добавьте минимум одну заглавную букву",
  "user-not-found": "Пользователь не найден",
  "wrong-password": "Неверный пароль",
  "unknown-error": "Произошла ошибка. Попробуйте снова",
};

const errorMessage = computed(() => {
  return errorMessages[userStore.error] || errorMessages["unknown-error"];
});

const handleModeToggle = () => {
  if (props.isModal) {
    emit("toggle-mode");
  } else {
    router.push(props.isLogin ? "/regpage" : "/authpage");
  }
};

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget && props.isVisible) {
    emit("close");
  }
};

watch([email, password, confirmPassword], () => {
  if (userStore.error) userStore.error = null;
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: #fff;
  padding-top: 40px;
  padding-bottom: 40px;
  border-radius: 30px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-align: center;
  padding-bottom: 48px;

  @media (max-width: 480px) {
    padding-bottom: 32px;
    img {
      max-width: 200px;
    }
  }
}

form {
  display: flex;
  flex-direction: column;
  width: 280px;
}

.form-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #d0cece;
  gap: 10px;
}

.input-wrapper {
  position: relative;
  width: 100%;
  min-width: 280px;
}

input {
  width: 100%;
  min-width: 280px;
  padding-left: 18px;
  padding-right: 50px;
  height: 52px;
  border: 1px solid #d0cece;
  border-radius: 8px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    height: 48px;
  }
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 20px;
  color: #666;
  z-index: 1;
}

.password-toggle:hover {
  color: #000;
}

.password-toggle:focus {
  outline: none;
  color: #7ed321;
}

.toggle-icon {
  display: inline-block;
  user-select: none;
}

.form-button {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 34px;
  width: 280px;

  @media (max-width: 480px) {
    margin-top: 24px;
  }
}

.login-button,
.toggle-button {
  width: 100%;
  height: 52px;
  padding: 10px;
  border-radius: 46px;
  font-size: 18px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    background-color: #e9eced !important;
    color: #b0b0b0 !important;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    height: 48px;
  }
}

.login-button {
  background-color: #7ed321;
  color: #000000;
  border: none;
}

.login-button:hover {
  background-color: #000000;
  color: #ffffff;
}

.toggle-button {
  background-color: transparent;
  border: 1px solid #000000;
  color: #000000;
}

.toggle-button:hover {
  background-color: #e9eced;
}

.error-message {
  color: #ff4444;
  text-align: center;
  margin-top: 10px;
  width: 100%;
}

.error-field {
  border-color: #ff4444 !important;
  background-color: #fff5f5;
}
</style>

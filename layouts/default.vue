<template>
  <div class="layout">
    <header v-if="!isAuthPage" class="header">
      <div class="header-content">
        <div class="left-section" @click="goToHome">
          <img src="/img/logo.png" alt="Логотип" class="logo" >
          <span class="logo-text">Онлайн-тренировки для занятий дома</span>
        </div>

        <div v-if="currentUser" class="user-section">
          <button class="user-dropdown" @click="toggleDropdown">
            <img
              class="desktop-icon"
              src="~/assets/img/icon/Profile-desktop.svg"
            >
            <span class="desktop-name">{{ userDisplayName }}</span>
            <svg class="dropdown-icon" viewBox="0 0 10 6" fill="currentColor">
              <path d="M0 0l5 5 5-5" />
            </svg>
          </button>

          <div 
            v-if="showDropdown" 
            class="dropdown-overlay" 
            @click="closeDropdown"
          />

          <div v-if="showDropdown" class="dropdown-menu">
            <div class="dropdown-content">
              <p class="user-name">{{ userDisplayName }}</p>
              <p class="user-email">{{ currentUser?.user?.email }}</p>
              <button class="custom-btn-profile" @click="goToProfile">
                Мой профиль
              </button>
              <button class="custom-btn-exit" @click="handleLogout">
                Выйти
              </button>
            </div>
          </div>
        </div>

        <button v-else class="custom-btn" @click="showModal = true">
          Войти
        </button>
      </div>
      <SigninModal
        v-if="showModal"
        :show-modal="showModal"
        @close="showModal = false"
      />
    </header>

    <main class="container">
      <div class="content-wrapper">
        <slot />
      </div>

      <button
        v-show="showScrollButton"
        class="scroll-top"
        aria-label="Вернуться наверх"
        @click="scrollToTop"
      >
        <span class="text">Наверх</span>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M4 12l1.41 1.41L11 7.83V16h2V7.83l5.59 5.59L19.6 12l-8-8-8 8z"
          />
        </svg>
      </button>
    </main>

    <footer v-if="!isAuthPage" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useUserStore } from "@/stores/user";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const showModal = ref(false);
const showDropdown = ref(false);

const isAuthPage = computed(
  () => route.path.startsWith("/auth") || route.path.startsWith("/reg")
);

const currentUser = computed(() => userStore.userData);

const userDisplayName = computed(() => {
  const email = currentUser.value?.user?.email;
  if (!email) return "Пользователь";
  return email.split("@")[0].replace(/\./g, " ");
});

const handleLogout = () => {
  userStore.logout();
  showDropdown.value = false;
};

const goToProfile = () => {
  showDropdown.value = false;
  router.push("/profile");
};

const goToHome = () => {
  router.push("/");
};

// Изменяем метод открытия дропдауна
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// Добавляем метод для закрытия
const closeDropdown = () => {
  showDropdown.value = false;
};

const showScrollButton = ref(false);
const handleScroll = () => {
  showScrollButton.value = window.scrollY > 100;
};
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const initUser = async () => {
  const token = localStorage.getItem("fitnessToken");

  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = Date.now() >= payload.exp * 1000;

    if (isExpired) {
      userStore.logout();
      return;
    }

    userStore.setToken(token);
    await userStore.fetchUserData();
  } catch (e) {
    console.error("Error parsing token:", e);
    userStore.logout();
  }
};

onMounted(async () => {
  window.addEventListener("scroll", handleScroll);
  await nextTick();
  await initUser();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.layout {
  background-color: #fafafa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 76px;
}

.header {
  background: #fafafa;
  padding: 15px 20px;
  position: static;
  z-index: 1000;
}

.header-content {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: auto;
}

.left-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  cursor: pointer;
}

.logo {
  display: block;
  max-height: 40px;
}

.logo-text {
  font-size: 18px;
  color: #999;
  font-weight: 400;
  padding-top: 15px;
}

.user-section {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f5f5;
}

.desktop-icon,
.mobile-icon {
  width: 41px;
  height: 41px;
}

.dropdown-icon {
  width: 12px;
  height: 12px;
  color: #666;
}

/* Стили для оверлея */
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 1000; /* Ниже дропдауна, но выше всего остального */
  cursor: default;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1001; /* Выше оверлея */
  margin-top: 5px;
}

.dropdown-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  width: 206px;
}

.dropdown-content .user-email {
  color: #999999;
}

.desktop-name {
  font-size: 24px;
  color: black;
  font-weight: 400;
}

.dropdown-content p {
  color: #333;
  margin: 0;
}

.dropdown-content p:first-child {
  font-weight: 600;
}

.dropdown-content p:last-child {
  color: #999;
  font-size: 14px;
}

.custom-btn-profile {
  margin-top: 24px;
  background: #bcec30;
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  font-size: 18px;
}

.custom-btn {
  width: 103px;
  padding: 12px;
  border-radius: 16px;
  border: none;
  font-size: 18px;
  transition: all 0.3s ease;
  background-color: #bcec30;
}

.custom-btn:hover {
  background: #a9d82a;
}

.custom-btn-exit {
  background-color: white;
  color: black;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  border: 1px solid #000;
  cursor: pointer;
  font-weight: 500;
  font-size: 18px;
  width: 100%;
}

main {
  flex: 1;
}

.content-wrapper {
  max-width: 1160px;
  margin: 0 auto;
  padding: 20px 0;
}

.scroll-top {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #bcec30;
  color: #000;
  border: none;
  border-radius: 30px;
  padding: 12px 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1000;
  font-size: 18px;
}

.scroll-top:hover {
  background: #a9d82a;
  transform: translateX(-50%) translateY(-2px);
}

.container {
  width: 100%;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .header {
    padding: 0 15px;
  }

  .header-content {
    height: 60px;
  }

  .logo-text {
    display: none;
  }

  .desktop-name {
    display: none;
  }

  .scroll-top {
    padding: 8px 15px;
    border-radius: 25px;
    font-size: 16px;
    width: 120px;
    height: 48px;
    right: -45px;
    bottom: 20px;
    left: auto;
  }

  .scroll-top svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 10px;
  }

  .custom-btn {
    padding: 8px 16px;
    font-size: 14px;
  }

  .main_title {
    font-weight: 500;
  }
}
</style>
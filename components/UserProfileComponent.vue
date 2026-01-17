<template>
  <div class="profile-container">
    <div v-if="isLoading" class="loading">
      <p>Загрузка данных профиля...</p>
    </div>

    <div v-else-if="!userStore.isAuthenticated" class="auth-required">
      <p>Пожалуйста, войдите в систему</p>
    </div>

    <div v-else class="profile-content">
      <h1>Профиль</h1>

      <div class="profile-info">
        <div class="avatar">
          <img src="../assets/img/profile.png" >
        </div>

        <div class="details">
          <p>{{ userDisplayName || "Не указано" }}</p>
          <p><strong>Email:</strong> {{ user.email || "Не указан" }}</p>
          <button class="logout-btn" @click="handleLogout">Выйти</button>
        </div>
      </div>
    </div>

    <div v-if="userStore.isAuthenticated">
      <h1>Мои курсы</h1>
      <div class="courses-grid">
        <AppLessonCard
          v-if="!isLoading"
          :courses="userCourses || []"
          :is-loading="coursesStore.isLoading"
          :has-error="coursesStore.error"
          :is-profile-page="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "../stores/user";
import { useCoursesStore } from "../stores/courses";

const userStore = useUserStore();
const coursesStore = useCoursesStore();
const isLoading = computed(() => userStore.isLoading);

const user = computed(() => {
  if (userStore.currentUser && userStore.currentUser.user) {
    return userStore.currentUser.user;
  }
  return {};
});

const userDisplayName = computed(() => {
  if (!user.value?.email) return "";
  const emailParts = user.value.email.split("@");
  return emailParts[0].replace(/\./g, " ");
});

const userCourses = computed(() => coursesStore.getUserCourses);

const waitForUser = async () => {
  return new Promise((resolve) => {
    const check = () => {
      if (userStore.currentUser && userStore.currentUser.user) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

onMounted(async () => {
  await waitForUser();
  try {
    const courseIds = userStore.currentUser?.user?.selectedCourses || [];

    await coursesStore.fetchCourses();

    if (courseIds.length > 0) {
      await coursesStore.fetchUserCourses(courseIds);
    }
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
});

const handleLogout = () => {
  userStore.logout();
};
</script>

<style scoped>
.profile-container {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

h1 {
  font-size: 40px;
  margin-bottom: 30px;
}

.profile-content {
  width: 100%;
}

.profile-info {
  display: flex;
  gap: 33px;
  margin-bottom: 20px;
  height: 257px;
  padding: 30px;
  align-items: stretch;
  background-color: white;
  box-shadow: 0px 4px 67px -12px #00000021;
}

.avatar {
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.details p:first-child {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

.details p:nth-child(2) {
  font-size: 18px;
  margin: 0;
}

.logout-btn {
  width: 100%;
  max-width: 200px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid #000;
  color: #000;
  font-size: 18px;
  transition: all 0.3s ease;
  background-color: white;

  &:hover {
    background-color: #f5f5f5;
    border-color: #666;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .profile-info {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    height: 365px;
  }

  .avatar {
    width: 141px;
    height: 141px;
    margin: 0 auto;
  }

  .details p:first-child {
    font-size: 24px;
    text-align: center;
  }

  .details p:nth-child(2) {
    font-size: 16px;
    text-align: center;
  }

  .logout-btn {
    max-width: 283px;
    margin: 0 auto;
    padding: 10px;
    font-size: 16px;
  }
}
</style>

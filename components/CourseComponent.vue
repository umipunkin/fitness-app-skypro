<template>
  <div class="course-card">
    <div class="course-image-wrapper">
      <img :src="courseImage" :alt="course.nameRU" class="course-main-image" />
      <h2 class="visually-hidden">{{ course.nameRU }}</h2>
    </div>

    <div class="target-section">
      <h3 class="section-title">Подойдет для вас, если:</h3>

      <div class="target-list">
        <div
          v-for="(fit, index) in course.fitting"
          :key="index"
          class="target-item"
          :class="`target-item-${index + 1}`"
        >
          <span class="number">{{ index + 1 }}</span>
          <p class="fit-text">{{ fit }}</p>
        </div>
      </div>
    </div>

    <div class="directions-section">
      <h3 class="section-title">Направления:</h3>
      <div class="directions-wrapper">
        <ul class="directions-list">
          <li
            v-for="(direction, index) in course.directions"
            :key="index"
            class="direction-item"
          >
            <img src="@/assets/img/icon/Star.svg" />
            {{ direction }}
          </li>
        </ul>
      </div>
    </div>

    <div class="mobile-image-containe">
      <img src="@/assets/img/course/mobile.png" class="mobile-image" />
    </div>

    <div class="benefits-section">
      <div class="content-wrapper">
        <h3 class="section-title-benefit">
          Начните путь<br />
          к новому телу:
        </h3>
        <ul class="benefits-list">
          <li class="benefit-item">Проработка всех групп мышц</li>
          <li class="benefit-item">Тренировка суставов</li>
          <li class="benefit-item">Улучшение циркуляции крови</li>
          <li class="benefit-item">Упражнения заряжают бодростью</li>
          <li class="benefit-item">Помогают противостоять стрессам</li>
        </ul>

        <button
          v-if="!isAuthenticated"
          class="auth-button"
          @click="handleAuthRedirect"
        >
          Войдите, чтобы добавить курс
        </button>

        <div v-else class="course-actions">
          <button
            class="auth-button"
            :class="{ added: isCourseAdded }"
            :disabled="isProcessing"
            @click="handleCourseToggle"
          >
            {{ isCourseAdded ? "Удалить курс" : "Добавить курс" }}
            <span v-if="isProcessing" class="loading-indicator">⌛</span>
          </button>
        </div>
      </div>

      <div class="image-overlay">
        <img src="../assets/img/course/vector.png" class="background-image" />
        <img src="../assets/img/course/man.png" class="foreground-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { useCoursesStore } from "@/stores/courses";

const props = defineProps({
  course: {
    type: Object,
    required: true,
    validator: (c) => {
      return ["nameRU", "directions", "fitting"].every((f) => f in c);
    },
  },
});

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const coursesStore = useCoursesStore();
const isProcessing = ref(false);

const isMobile = ref(false);
const checkDeviceType = () => {
  isMobile.value = window.matchMedia("(max-width: 768px)").matches;
};

const courseImage = computed(() => {
  const basePath = "../assets/img/";
  const deviceFolder = isMobile.value ? "main/" : "course/";

  try {
    return new URL(
      `${basePath}${deviceFolder}${props.course.nameEN}.png`,
      import.meta.url
    ).href;
  } catch {
    console.warn("Используется fallback-изображение");
    return new URL(`${basePath}default.png`, import.meta.url).href;
  }
});

onMounted(() => {
  checkDeviceType();
  window.addEventListener("resize", checkDeviceType);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkDeviceType);
});

const isAuthenticated = computed(() => !!userStore.currentUser?.user);

const isCourseAdded = computed(() =>
  userStore.currentUser?.user?.selectedCourses?.includes(props.course._id)
);

const handleCourseToggle = async () => {
  isProcessing.value = true;

  try {
    if (isCourseAdded.value) {
      await coursesStore.removeCourse(props.course._id);
    } else {
      await coursesStore.addCourse(props.course._id);
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert(error.message);
  } finally {
    isProcessing.value = false;
  }
};

const handleAuthRedirect = () => {
  const redirectPath = route.fullPath;

  router.push({
    path: "/auth",
    query: { redirect: redirectPath },
  });
};
</script>

<style scoped>
.course-card {
  border-radius: 12px;
  padding: 0;
  margin-bottom: 2rem;
}

.course-image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px;

  .course-main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.section-title {
  color: #374151;
  font-size: 40px;
  margin-bottom: 40px;
  position: relative;

  &::before {
    display: none;
  }
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

.target-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
}

.target-item {
  background: #222;
  color: #fff;
  padding: 20px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  gap: 25px;
  height: 141px;
  box-sizing: border-box;
  flex: 0 0 auto;
}

.target-item-1 {
  width: 368px;
}

.target-item-2 {
  width: 431px;
}

.target-item-3 {
  width: 327px;
}

.target-item .number {
  font-size: 75px;
  color: #bcec30;
  flex-shrink: 0;
}

.target-item .fit-text {
  font-size: 22px;
  font-weight: 400;
  line-height: 110%;
  margin: 0;
}

.directions-wrapper {
  background: #bcec30;
  border-radius: 16px;
  padding: 1rem;
}

.directions-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 0;
  list-style: none;
  width: 100%;
}

.direction-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
}

.benefits-list {
  list-style: none;
  padding-left: 40px;
  margin-bottom: 28px;
  color: #999;
  font-size: 24px;
}

.target-list li,
.directions-list li,
.benefits-list li {
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
}

.section-title-benefit {
  padding-left: 40px;
  margin-top: 40px;
  font-size: 60px;
  margin-bottom: 0px;
}

.content-wrapper {
  box-shadow: 0px 4px 67px -12px #00000021;
  margin-top: 102px;
  background-color: #ffffff;
  display: flex;
  border-radius: 16px;
  flex-direction: column;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.background-image {
  position: absolute;
  bottom: -0.1%;
  right: +4%;
}

.foreground-image {
  position: absolute;
  bottom: +3%;
  right: 5%;
  z-index: 3;
}

.mobile-image {
  display: none;
}

.auth-button {
  width: 437px;
  padding: 1rem;
  background: #bcec30;
  color: #000000;
  border: none;
  border-radius: 26px;
  font-size: 18px;
  margin-bottom: 40px;
  margin-left: 25px;
}

.auth-button:hover {
  background: #a8d52b;
}

@media (max-width: 480px) {
  .course-card {
    padding: 1.5rem;
  }

  .course-title {
    font-size: 24px;
  }

  .section-title {
    padding-top: 20px;
    font-size: 24px;
    font-weight: 500;
  }

  .target-list {
    flex-direction: column;
    gap: 0.8rem;
  }

  .target-item .fit-text {
    font-size: 18px;
    font-weight: 400;
  }

  .target-item {
    border-radius: 28px;
    width: 100%;
    height: 141px;
  }

  .directions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-left: 20px;
  }

  .image-overlay {
    position: relative;
  }

  .background-image,
  .foreground-image {
    display: none;
  }

  .mobile-image-container {
    position: relative;
  }

  .mobile-image {
    position: absolute;
    display: block;
    bottom: 220px;
  }

  .directions-section {
    position: relative;
  }

  .benefits-section {
    position: relative;
  }

  .section-title-benefit {
    font-size: 32px;
    font-weight: 500;
    padding-top: 30px;
  }

  .benefits-list {
    font-size: 18px;
  }

  .content-wrapper {
    margin-top: 156px;
    position: static;
    width: 100%;
    min-width: 0;
    max-width: none;
    height: auto;

    transform: none;

    display: block;
    box-sizing: border-box;
  }
  h3 {
    font-size: 32px;
  }
  .auth-button {
    width: 283px;
    margin-left: 50px;
  }
}
</style>

<template>
  <div class="workout-container">
    <div v-if="isLoading" class="loading">Загрузка...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
      <button class="retry-btn" @click="retryLoading">Повторить попытку</button>
    </div>

    <div v-else-if="workout && courseData" class="workout-content">
      <div class="course-header">
        <div class="course-title">
          {{ courseData.nameRU || "Название курса" }}
        </div>
      </div>

      <div v-if="workout.video" class="video-wrapper">
        <iframe
          :src="workout.video"
          title="Видео тренировки"
          allowfullscreen
          class="video-player"
        />
      </div>

      <div class="exercises-list">
        <h2 class="workout-title">{{ workout.name }}</h2>
        <div class="exercise-wrapper">
          <div
            v-for="(exercise, index) in workout.exercises"
            :key="exercise._id || index"
            class="exercise-card"
          >
            <h3 class="exercise-title">
              {{ exercise.name }} {{ getProgressPercentage(exercise) }}%
            </h3>

            <div class="progress-section">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: getProgressPercentage(exercise) + '%' }"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <button
            :class="['progress-btn', 'partial-progress']"
            @click="openModal"
          >
            {{ progressButtonText }}
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="!courseData" class="no-data">Курс не найден</div>

    <div v-else class="no-data">Тренировка не найдена</div>
    <ProgressModal
      :is-open="showProgressModal"
      :course-id="courseId"
      :workout-id="workout.id"
      :exercises="workout.exercises"
      @close="showProgressModal = false"
      @success="handleProgressSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useWorkoutsStore } from "@/stores/workouts";
import { useCoursesStore } from "@/stores/courses";
import { useUserStore } from "@/stores/user";
import ProgressModal from "~/components/ProgressModal.vue";

const route = useRoute();
const workoutsStore = useWorkoutsStore();
const coursesStore = useCoursesStore();
const userStore = useUserStore();

const workoutId = computed(() => route.params.workoutId);
const courseId = computed(() => route.params.courseId);

const isLoading = ref(true);
const error = ref(null);
const progress = ref([]);
const courseData = ref(null);
const showProgressModal = ref(false);

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
    if (!workoutId.value || !courseId.value) {
      throw new Error("Некорректные параметры URL");
    }

    const [workoutRes, courseRes] = await Promise.allSettled([
      workoutsStore.fetchWorkout(workoutId.value),
      coursesStore.getCourseById(courseId.value),
      workoutsStore.fetchWorkoutProgress(courseId.value, workoutId.value),
    ]);

    if (workoutRes.status === "rejected") {
      throw new Error(
        "Ошибка загрузки тренировки: " + workoutRes.reason.message
      );
    }

    if (courseRes.status === "rejected") {
      console.warn("Ошибка загрузки курса:", courseRes.reason);
      courseData.value = { nameRU: "Неизвестный курс" };
    } else {
      courseData.value = courseRes.value;
    }

    const workout = workoutsStore.currentWorkout;
    if (workout?.exercises) {
      progress.value =
        workoutsStore.workoutProgress[workoutId.value]?.progressData ||
        new Array(workout.exercises.length).fill(0);
    }
  } catch (err) {
    error.value = err.message;
    console.error("❌ Ошибка инициализации:", err);
  } finally {
    isLoading.value = false;
  }
});

const workout = computed(() => {
  const baseWorkout = workoutsStore.currentWorkout || {};
  return {
    id: baseWorkout.id || route.params.workoutId,
    exercises: baseWorkout.exercises || [],
    ...baseWorkout,
  };
});

const getProgressPercentage = (exercise) => {
  const index = workout.value.exercises?.indexOf(exercise) ?? -1;
  const current = index !== -1 ? progress.value?.[index] || 0 : 0;
  const quantity = exercise?.quantity || 100;

  return Math.min(Math.round((current / quantity) * 100), 100);
};

const progressButtonText = computed(() => {
  if (!progress.value?.length) return "Заполнить свой прогресс";

  const isAllZero = progress.value.every((v) => v === 0);
  const isAllCompleted = progress.value.every(
    (v, i) => v >= workout.value.exercises?.[i]?.quantity || 0
  );

  return isAllZero
    ? "Заполнить свой прогресс"
    : isAllCompleted
    ? "Прогресс завершён"
    : "Обновить свой прогресс";
});

const openModal = () => {
  if (!workout.value.id || typeof workout.value.id !== "string") {
    console.error("Invalid workout ID:", workout.value.id);
    return;
  }
  showProgressModal.value = true;
};

const handleProgressSuccess = async () => {
  try {
    await workoutsStore.fetchWorkoutProgress(courseId.value, workoutId.value);

    progress.value =
      workoutsStore.workoutProgress[workoutId.value]?.progressData || [];

    if (!progress.value.length) {
      throw new Error("Прогресс не был обновлен");
    }
  } catch (error) {
    console.error("Ошибка при обновлении прогресса:", error);
  }
};

watch(
  () => workoutsStore.workoutProgress[workoutId.value],
  async (newProgress) => {
    if (newProgress) {
      progress.value = newProgress.progressData || [];
    }
  },
  { deep: true }
);
</script>

<style scoped>
.workout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  background: #ffe3e6;
  color: #dc3545;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.course-header {
  text-align: center;
  margin-bottom: 40px;
}

.course-title {
  color: black;
  font-size: 60px;
  font-family: "Roboto", sans-serif;
  text-align: start;
  font-weight: 400;
}

.workout-title {
  color: black;
  padding-left: 20px;
}

.video-wrapper {
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-player {
  width: 100%;
  height: 500px;
  border: none;
}

.exercise-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.exercises-list {
  background-color: white;
  margin: 3rem 0;
  display: grid;
  gap: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.exercise-card {
  background: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.exercise-title {
  color: black;
  margin-bottom: 1rem;
  font-size: 18px;
  flex: 1;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex-grow: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-top: auto;
}

.progress-fill {
  height: 100%;
  background: #00c1ff;
  transition: width 0.3s ease;
}

.progress-text {
  color: #666;
  font-weight: 500;
  min-width: 80px;
  text-align: right;
}

.action-buttons {
  margin: 2rem;
}

.progress-btn {
  width: 100%;
  max-width: 320px;
  padding: 12px;
  border-radius: 16px;
  font-size: 18px;
  transition: all 0.3s ease;
  background-color: #bcec30;
  border: none;
}

.retry-btn {
  background: #dc3545;
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 10px;
}

.no-data {
  padding: 3rem;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .video-player {
    height: 300px;
  }

  .exercise-card {
    padding: 1rem;
  }

  .progress-section {
    flex-direction: column;
    align-items: stretch;
  }

  .progress-text {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .workout-container {
    padding: 10px;
  }

  .course-title {
    font-size: 1.5rem !important;
    text-align: center !important;
    font-size: 24px !important;
    text-align: left !important;
  }

  .workout-title {
    font-size: 32px;
    text-align: left;
  }
  .exercise-title {
    font-size: 16px;
    text-align: left;
  }

  .video-player {
    height: 200px;
    aspect-ratio: 16/9;
  }

  .exercise-wrapper {
    grid-template-columns: 1fr !important;
    gap: 1rem;
  }

  .exercise-card {
    padding: 1rem;
    margin: 0 10px;
  }

  .progress-btn {
    max-width: 100% !important;
    width: 100%;
    padding: 15px !important;
    font-size: 16px !important;
  }

  .action-buttons {
    margin: 1rem 0;
    padding: 0 10px;
  }

  .error-message {
    margin: 1rem;
    padding: 1rem;
    text-align: center;
  }

  .retry-btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .course-title {
    font-size: 24px;
    font-weight: 500;
  }

  .video-player {
    height: 180px;
  }

  .exercise-title {
    font-size: 18px;
    font-weight: 400;
  }

  .progress-bar {
    height: 4px;
  }
}
</style>

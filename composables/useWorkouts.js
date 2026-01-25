import { ref, computed, onUnmounted } from "vue";
import { useWorkoutsStore } from "../stores/workouts";
import { useUserStore } from "../stores/user";


export function useWorkouts() {
  const workoutsStore = useWorkoutsStore();
  const userStore = useUserStore();

  const isLoading = ref(false);
  const error = ref(null);
  const currentWorkout = ref(null);

  const isUserAuthenticated = computed(() => userStore.isAuthenticated);
  const exercises = computed(() => workoutsStore.exercises);

  const initializeWorkouts = async () => {
    try {
      await workoutsStore.initialize();
    } catch (err) {
      error.value = err.message || "Ошибка инициализации тренировок";
      throw err;
    }
  };

  const loadWorkout = async (workoutId) => {
    if (!workoutId) {
      error.value = "Не указан ID тренировки";
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const workout = await workoutsStore.fetchWorkout(workoutId);
      currentWorkout.value = workout;
      return workout;
    } catch (err) {
      error.value = err.message || "Ошибка загрузки тренировки";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadCourseProgress = async (courseId) => {
    if (!isUserAuthenticated.value) {
      error.value = "Требуется авторизация";
      return null;
    }

    if (!courseId) {
      error.value = "Не указан ID курса";
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      return await workoutsStore.fetchCourseProgress(courseId);
    } catch (err) {
      error.value = err.message || "Ошибка загрузки прогресса курса";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadWorkoutProgress = async (courseId, workoutId) => {
    if (!isUserAuthenticated.value) {
      error.value = "Требуется авторизация";
      return null;
    }

    if (!courseId || !workoutId) {
      error.value = "Не указаны ID курса или тренировки";
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      return await workoutsStore.fetchWorkoutProgress(courseId, workoutId);
    } catch (err) {
      error.value = err.message || "Ошибка загрузки прогресса тренировки";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const saveProgress = async (courseId, workoutId, progressData) => {
    if (!isUserAuthenticated.value) {
      error.value = "Требуется авторизация";
      return { success: false, error: "Требуется авторизация" };
    }

    if (!courseId || !workoutId || !progressData) {
      error.value = "Не указаны все необходимые параметры";
      return { success: false, error: "Не указаны все необходимые параметры" };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await workoutsStore.saveWorkoutProgress(
        courseId,
        workoutId,
        progressData
      );

      return { success: true, data: result };
    } catch (err) {
      error.value = err.message || "Ошибка сохранения прогресса";
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const checkWorkoutCompletion = (workoutId) => {
    return workoutsStore.isWorkoutCompleted(workoutId);
  };

  const getExerciseProgress = (workoutId, exerciseIndex) => {
    return workoutsStore.getExerciseProgress(workoutId, exerciseIndex);
  };

  const getCourseCompletionPercentage = (courseId) => {
    return workoutsStore.getCourseCompletionPercentage(courseId);
  };

  onUnmounted(() => {
    currentWorkout.value = null;
  });

  return {
    isLoading,
    error,
    currentWorkout,

    isUserAuthenticated,
    exercises,

    initializeWorkouts,
    loadWorkout,
    loadCourseProgress,
    loadWorkoutProgress,
    saveProgress,

    checkWorkoutCompletion,
    getExerciseProgress,
    getCourseCompletionPercentage,
    clearError: () => {
      error.value = null;
    },
    clearCurrentWorkout: () => {
      currentWorkout.value = null;
    },
  };
}

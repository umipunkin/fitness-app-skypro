import { ref, computed, onUnmounted } from "vue";
import { useCoursesStore } from "../stores/courses.js";
import { useUserStore } from "../stores/user.js";

export function useCourses() {
  const coursesStore = useCoursesStore();
  const userStore = useUserStore();

  const isLoading = ref(false);
  const error = ref(null);

  const allCourses = computed(() => coursesStore.getAllCourses);
  const userCourses = computed(() => coursesStore.getUserCourses);
  const isUserAuthenticated = computed(() => userStore.isAuthenticated);

  const loadAllCourses = async (forceRefresh = false) => {
    isLoading.value = true;
    error.value = null;

    try {
      await coursesStore.fetchCourses(forceRefresh);
    } catch (err) {
      error.value = err.message || "Ошибка загрузки курсов";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadUserCourses = async () => {
    if (!isUserAuthenticated.value) {
      error.value = "Требуется авторизация";
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const courseIds = userStore.currentUser?.user?.selectedCourses || [];
      await coursesStore.fetchUserCourses(courseIds);
    } catch (err) {
      error.value = err.message || "Ошибка загрузки пользовательских курсов";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getCourseById = async (courseId) => {
    if (!courseId) {
      error.value = "Не указан ID курса";
      return null;
    }

    try {
      return await coursesStore.getCourseById(courseId);
    } catch (err) {
      error.value = err.message || "Ошибка загрузки курса";
      throw err;
    }
  };

  const toggleCourse = async (courseId) => {
    if (!isUserAuthenticated.value) {
      error.value = "Требуется авторизация";
      return { success: false, error: "Требуется авторизация" };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const isAdded = userCourses.value.some(
        (course) => course._id === courseId
      );

      if (isAdded) {
        await coursesStore.removeCourse(courseId);
        return { success: true, action: "removed" };
      } else {
        await coursesStore.addCourse(courseId);
        return { success: true, action: "added" };
      }
    } catch (err) {
      error.value = err.message || "Ошибка изменения статуса курса";
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const refreshCourses = async () => {
    await loadAllCourses(true);
    if (isUserAuthenticated.value) {
      await loadUserCourses();
    }
  };

  onUnmounted(() => {});

  return {
    isLoading,
    error,

    allCourses,
    userCourses,
    isUserAuthenticated,

    loadAllCourses,
    loadUserCourses,
    getCourseById,
    toggleCourse,
    refreshCourses,

    clearError: () => {
      error.value = null;
    },
  };
}

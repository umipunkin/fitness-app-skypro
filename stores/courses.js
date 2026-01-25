import { defineStore } from "pinia";
import { useUserStore } from "../stores/user";

export const useCoursesStore = defineStore("courses", {
  state: () => ({
    courses: [],
    userCourses: [],
    loading: false,
    error: null,
    _cache: new Map(),
  }),

  actions: {
    _addToCache(course) {
      this._cache.set(course._id, course);
      if (!this.courses.some((c) => c._id === course._id)) {
        this.courses.push(course);
      }
    },

    async fetchCourses() {
      this.loading = true;
      try {
        const response = await $fetch(
          "https://wedev-api.sky.pro/api/fitness/courses"
        );
        response.forEach((course) => this._addToCache(course));
      } catch (error) {
        this.error = error.message;
        console.error("Fetch courses error:", error);
      } finally {
        this.loading = false;
      }
    },

    async getCourseById(courseId) {
      if (this._cache.has(courseId)) {
        return this._cache.get(courseId);
      }

      try {
        const course = await $fetch(
          `https://wedev-api.sky.pro/api/fitness/courses/${courseId}`
        );
        this._addToCache(course);
        return course;
      } catch (error) {
        console.error("Get course error:", error);
        throw error;
      }
    },

    async fetchUserCourses(courseIds) {
      this.loading = true;
      this.error = null;
      try {
        const uniqueIds = [...new Set(courseIds)];
        const userCourses = uniqueIds
          .map((id) => {
            const course = this.courses.find((c) => c._id === id);
            return course;
          })
          .filter((course) => course !== undefined);
        this.userCourses = userCourses;
      } catch (error) {
        this.error = error.message || "Ошибка при загрузке курсов";
      } finally {
        this.loading = false;
      }
    },

    async addCourse(courseId) {
      const userStore = useUserStore();
      const initialUserCourses = [...this.userCourses];

      try {
        if (!courseId || typeof courseId !== "string") {
          throw new Error("Некорректный идентификатор курса");
        }

        if (!userStore.token || userStore.token.length < 100) {
          throw new Error("Требуется авторизация");
        }

        const course = await this.getCourseById(courseId);
        this.userCourses.push(course);
        userStore.addCourseLocally(courseId);

        const response = await fetch(
          "https://wedev-api.sky.pro/api/fitness/users/me/courses",
          {
            method: "POST",
            headers: {
              "Content-Type": "",
              Authorization: `Bearer ${userStore.token}`,
            },
            body: JSON.stringify({ courseId }),
          }
        );

        return response;
      } catch (error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack.split("\n").slice(0, 3),
        });

        this.userCourses = initialUserCourses;
        userStore.removeCourseLocally(courseId);

        throw new Error(`Ошибка добавления курса: ${error.message}`);
      }
    },

    async removeCourse(courseId) {
      const userStore = useUserStore();
      const initialUserCourses = [...this.userCourses];

      try {
        this.userCourses = this.userCourses.filter((c) => c._id !== courseId);
        userStore.removeCourseLocally(courseId);

        await $fetch(
          `https://wedev-api.sky.pro/api/fitness/users/me/courses/${courseId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${userStore.token}` },
          }
        );
      } catch (error) {
        this.userCourses = initialUserCourses;
        userStore.addCourseLocally(courseId);
        throw error;
      }
    },

    async updateUserCourses() {
      const userStore = useUserStore();
      const courseIds = userStore.currentUser?.user?.selectedCourses || [];

      const missingIds = courseIds.filter((id) => !this._cache.has(id));
      if (missingIds.length > 0) {
        await this._fetchMissingCourses(missingIds);
      }

      this.userCourses = courseIds
        .map((id) => this._cache.get(id))
        .filter(Boolean);
    },

    async _fetchMissingCourses(ids) {
      try {
        const { courses } = await $fetch(
          "https://wedev-api.sky.pro/api/fitness/courses/by-ids",
          {
            method: "POST",
            body: { ids },
          }
        );

        courses.forEach((course) => this._addToCache(course));
      } catch (error) {
        console.error("Fetch missing courses error:", error);
        throw error;
      }
    },

    async fetchCourseWorkouts(courseId) {
      const userStore = useUserStore();

      try {
        const response = await $fetch(
          `https://wedev-api.sky.pro/api/fitness/courses/${courseId}/workouts`,
          {
            headers: { Authorization: `Bearer ${userStore.token}` },
          }
        );

        if (!Array.isArray(response)) {
          throw new Error("Invalid workouts response format");
        }

        const course = this._cache.get(courseId);
        if (course) {
          course.workouts = response;
          this._addToCache(course);
        }

        return response;
      } catch (error) {
        console.error("Error fetching workouts:", error);
        throw error;
      }
    },
  },

  getters: {
    getAllCourses: (state) => state.courses,
    getUserCourses: (state) => state.userCourses,
    isLoading: (state) => state.loading,
    hasError: (state) => {
      if (state.error) {
        return state.error;
      }
      return false;
    },
  },
});

import { defineStore } from "pinia";
import { useUserStore } from "../stores/user";

export const useWorkoutsStore = defineStore("workouts", {
  state: () => ({
    currentWorkout: null,
    courseProgress: {},
    workoutProgress: {},
    workoutsCompleted: {},
    isLoading: false,
    error: null,
    isInitialized: false,
  }),

  actions: {
    async initialize() {
      try {
        this.isInitialized = true;
      } catch (error) {
        this.isInitialized = false;
        this.error = this.handleError(error);
      }
    },

    async fetchWorkout(workoutId) {
      try {
        this.isLoading = true;
        const userStore = useUserStore();

        const response = await $fetch(
          `https://wedev-api.sky.pro/api/fitness/workouts/${workoutId}`,
          {
            headers: {
              Authorization: `Bearer ${userStore.token}`,
            },
          }
        );

        this.currentWorkout = response;
        return response;
      } catch (error) {
        this.error = this.handleError(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCourseProgress(courseId) {
      const coursesStore = useCoursesStore();
      const userStore = useUserStore();

      try {
        const response = await $fetch(
          `https://wedev-api.sky.pro/api/fitness/users/me/progress`,
          {
            params: { courseId },
            headers: {
              Authorization: `Bearer ${userStore.token}`,
            },
          }
        );

        const courseWorkouts = await coursesStore.fetchCourseWorkouts(courseId);
        const validWorkoutIds = new Set(
          courseWorkouts?.map((w) => w._id) || []
        );
        const updatedProgress = {
          workoutsProgress: (response.workoutsProgress || []).filter((wp) =>
            validWorkoutIds.has(wp.workoutId)
          ),
          totalWorkouts: courseWorkouts?.length || 0,
        };

        this.$patch((state) => {
          state.courseProgress = {
            ...state.courseProgress,
            [courseId]: updatedProgress,
          };
        });

        updatedProgress.workoutsProgress.forEach((wp) => {
          this.workoutsCompleted[wp.workoutId] = wp.workoutCompleted;
        });
      } catch (error) {
        if (error.response?.status === 404) {
          if (!this.courseProgress[courseId]) {
            this.$patch({
              courseProgress: {
                ...this.courseProgress,
                [courseId]: {
                  workoutsProgress: [],
                  totalWorkouts: 0,
                },
              },
            });
          }
        } else {
          this.error = this.handleError(error);
          throw error;
        }
      }
    },

    async fetchWorkoutProgress(courseId, workoutId) {
      try {
        const userStore = useUserStore();

        this.workoutProgress[workoutId] = await $fetch(
          `https://wedev-api.sky.pro/api/fitness/users/me/progress`,
          {
            params: { courseId, workoutId },
            headers: {
              Authorization: `Bearer ${userStore.token}`,
            },
          }
        );
      } catch (error) {
        this.error = this.handleError(error);
        throw error;
      }
    },

    async saveWorkoutProgress(courseId, workoutId, progressData) {
      try {
        const userStore = useUserStore();

        const updatedProgress = await fetch(
          `https://wedev-api.sky.pro/api/fitness/courses/${courseId}/workouts/${workoutId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${userStore.token}`,
            },
            body: JSON.stringify({ progressData }),
          }
        );

        if (!updatedProgress.ok) {
          const errorData = await updatedProgress.json();
          throw new Error(
            errorData.message || "Ошибка при сохранении прогресса"
          );
        }

        const workoutCompleted = progressData.every((v) => v >= 100);

        this.$patch((state) => {
          state.workoutProgress[workoutId] = {
            ...(state.workoutProgress[workoutId] || {}),
            progressData,
            workoutCompleted,
            updatedAt: new Date().toISOString(),
          };

          if (state.courseProgress[courseId]) {
            const workoutsProgress =
              state.courseProgress[courseId].workoutsProgress;

            const workoutIndex = workoutsProgress.findIndex(
              (wp) => wp.workoutId === workoutId
            );

            if (workoutIndex !== -1) {
              workoutsProgress[workoutIndex] = {
                ...workoutsProgress[workoutIndex],
                progressData,
                workoutCompleted,
              };
            } else {
              workoutsProgress.push({
                workoutId,
                progressData,
                workoutCompleted,
              });
            }

            state.courseProgress[courseId].completedCount =
              workoutsProgress.filter((wp) => wp.workoutCompleted).length;
          }
        });

        this.courseProgress = { ...this.courseProgress };
      } catch (error) {
        console.error("[SAVE] Ошибка:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        this.error = this.handleError(error);
        throw error;
      }
    },

    async resetWorkoutProgress(courseId, workoutId) {
      try {
        const userStore = useUserStore();
        this.$patch((state) => {
          delete state.courseProgress[courseId];
          delete state.workoutProgress;
        });
        await $fetch(
          `https://wedev-api.sky.pro/api/fitness/courses/${courseId}/workouts/${workoutId}/reset`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${userStore.token}`,
            },
          }
        );

        if (this.workoutProgress[workoutId]) {
          this.workoutProgress[workoutId] = {
            workoutId,
            workoutCompleted: false,
            progressData: new Array(
              this.workoutProgress[workoutId].progressData.length
            ).fill(0),
          };
        }
      } catch (error) {
        this.error = this.handleError(error);
        throw error;
      }
    },

    handleError(error) {
      if (error.data?.message) return error.data.message;
      if (error.status === 401) return "Требуется авторизация";
      return "Произошла ошибка при выполнении запроса";
    },

    isWorkoutCompleted(workoutId) {
      return this.workoutProgress[workoutId]?.workoutCompleted || false;
    },

    getExerciseProgress(workoutId, exerciseIndex) {
      return this.workoutProgress[workoutId]?.progressData[exerciseIndex] || 0;
    },
  },

  getters: {
    exercises: (state) => state.currentWorkout?.exercises || [],
    getCourseProgress: (state) => (courseId) => {
      return (
        state.courseProgress[courseId] || {
          workoutsProgress: [],
          totalWorkouts: 0,
        }
      );
    },
    getWorkoutCompletedStatus: (state) => (workoutId) => {
      return state.workoutsCompleted[workoutId] ?? false;
    },
    isStoreInitialized: (state) => state.isInitialized,
  },
});

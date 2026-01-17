<template>
  <div v-if="isOpen" class="modal">
    <div class="modal-content">
      <h2 class="train_header">Выберите тренировку</h2>
      <button class="close-btn" @click="closeModal">×</button>

      <div class="workout-list">
        <div
          v-for="(workout, index) in workouts"
          :key="workout._id"
          class="workout-item"
          :class="{ 'disabled-item': !isWorkoutAvailable(index) }"
          @click="selectWorkout(workout, index)"
        >
          <div class="workout-header">
            <div class="progress-indicator">
              <img
                v-if="isWorkoutCompleted(workout._id)"
                src="../assets/img/icon/check.png"
                alt="галочка"
                class="status-icon"
              />
              <img
                v-else
                src="../assets/img/icon/circle.png"
                alt="пустой кружок"
                class="status-icon"
              />
            </div>

            <div>
              <h3>{{ getWorkoutName(workout.name) }}</h3>
              <p class="workout-description">
                {{ getWorkoutDescription(workout.name) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button class="start-btn" @click="startTraining">Начать</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCoursesStore } from "@/stores/courses";
import { useWorkoutsStore } from "@/stores/workouts";
import { sortWorkouts } from "@/utils/workoutUtils";

const workoutsStore = useWorkoutsStore();

const props = defineProps({
  courseId: {
    type: String,
    required: true,
  },
  sortedWorkouts: {
    type: Array,
    default: null,
  },
});

const emit = defineEmits(["close"]);
const router = useRouter();
const coursesStore = useCoursesStore();
const isOpen = ref(true);
const selectedWorkout = ref(null);
const workouts = ref([]);
const course = ref(null);

const isWorkoutCompleted = (workoutId) => {
  if (!workoutId) return false;
  return workoutsStore.getWorkoutCompletedStatus(workoutId);
};

const isWorkoutAvailable = (workoutIndex) => {
  if (workoutIndex === 0) return true;

  const previousWorkout = workouts.value[workoutIndex - 1];
  if (!previousWorkout) return false;

  return workoutsStore.getWorkoutCompletedStatus(previousWorkout._id);
};

onMounted(async () => {
  try {
    course.value = await coursesStore.getCourseById(props.courseId);

    if (props.sortedWorkouts) {
      workouts.value = props.sortedWorkouts;
    } else {
      const rawWorkouts = await coursesStore.fetchCourseWorkouts(
        props.courseId
      );
      workouts.value = sortWorkouts(rawWorkouts);
    }

    try {
      await workoutsStore.fetchCourseProgress(props.courseId);
    } catch (progressError) {
      console.error(progressError);
    }
  } catch (error) {
    console.error("Ошибка загрузки тренировок:", error);
  }
});
const getWorkoutName = (fullName) => {
  return fullName.split("/")[0].trim();
};

const getWorkoutDescription = (fullName) => {
  const parts = fullName.split("/");
  return parts.slice(1, 3).join("/").trim();
};

const selectWorkout = (workout) => {
  selectedWorkout.value = workout;
};

const startTraining = () => {
  if (!selectedWorkout.value?._id) {
    console.error("Workout ID is missing!");
    return;
  }

  emit("close");

  router.push({
    path: `/course/${props.courseId}/workout/${selectedWorkout.value._id}`,
    query: {
      courseName: course.value.name,
      courseDifficulty: course.value.difficulty,
    },
  });
};
const closeModal = () => {
  isOpen.value = false;
  emit("close");
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.train_header {
  font-size: 32px;
  font-family: "StratosSkyeng", sans-serif;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.progress-indicator {
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
  font-size: 18px;
}

.workout-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.workout-item {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.3s;

  &.disabled-item {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;

    .progress-indicator {
      .circle-icon {
        color: #aaa;
      }
    }

    &:hover {
      background-color: transparent;
    }
  }

  &:hover:not(.disabled-item) {
    background-color: #f0f0f0;
  }

  &:last-child {
    border-bottom: none;
  }
}

.start-btn {
  width: 380px;
  padding: 12px;
  border-radius: 16px;
  font-size: 18px;
  transition: all 0.3s ease;
  background-color: #bcec30;
  border: none;

  &:hover:not(:disabled) {
    background-color: #000000;
    color: #ffffff;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
}

.exercise-list {
  margin-top: 10px;
  padding-left: 20px;
  list-style-type: none;
}

.exercise {
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}
</style>

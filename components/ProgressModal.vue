<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal">
      <h2 class="modal-title">Мой прогресс</h2>

      <div class="exercises-list">
        <div
          v-for="exercise in exercises"
          :key="exercise._id"
          class="exercise-item"
        >
          <label class="exercise-label">{{ exercise.name }}</label>
          <input
            v-model="progressValues[exercise._id]"
            type="text"
            min="0"
            class="exercise-input"
            placeholder="0"
            @input="validateInput"
            @keypress="onlyNumbers"
          >
          <div v-if="errors[exercise._id]" class="error-message">
            {{ errors[exercise._id] }}
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button
          class="save-button"
          :class="{ loading: isLoading }"
          :disabled="isLoading || hasErrors"
          @click="handleSubmit"
        >
          <span v-if="!isLoading">Сохранить</span>
        </button>
      </div>
    </div>
  </div>

  <SuccessModal v-if="showSuccess" @close="showSuccess = false" />
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useWorkoutsStore } from "../stores/workouts";
const props = defineProps({
  courseId: {
    type: String,
    required: true,
  },
  workoutId: {
    type: String,
    required: true,
  },
  exercises: {
    type: Array,
    default: () => [],
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "success"]);
const workoutsStore = useWorkoutsStore();

const progressValues = ref({});
const isLoading = ref(false);
const showSuccess = ref(false);
const errors = ref({});
const hasErrors = computed(() => Object.keys(errors.value).length > 0);

watch(
  () => props.exercises,
  (newExercises) => {
    progressValues.value = newExercises.reduce((acc, exercise) => {
      acc[exercise._id] = exercise.currentProgress || 0;
      return acc;
    }, {});
    errors.value = {};
  },
  { immediate: true }
);

const validateInput = () => {
  errors.value = {};
  props.exercises.forEach((exercise) => {
    let rawValue = progressValues.value[exercise._id] || "";

    rawValue = rawValue.toString().replace(/\D/g, "");
    progressValues.value[exercise._id] = rawValue;

    if (rawValue === "") {
      errors.value[exercise._id] = "Введите значение";
      return;
    }

    const value = Number(rawValue);

    if (value < 0 || value > exercise.quantity) {
      errors.value[
        exercise._id
      ] = `Допустимый диапазон: 0-${exercise.quantity}`;
    }
  });
};

const handleClose = () => {
  if (!isLoading.value) {
    emit("close");
  }
};

onMounted(() => {
  if (!props.courseId || !props.workoutId) {
    console.error("Critical Error: Missing required IDs!", props);
    throw new Error("Компоненту не переданы обязательные параметры");
  }
});

const handleSubmit = async () => {
  try {
    validateInput();
    if (hasErrors.value) return;

    const progressData = props.exercises.map((exercise) => {
      const enteredValue = Number(progressValues.value[exercise._id]);
      return enteredValue;
    });

    await workoutsStore.saveWorkoutProgress(
      props.courseId,
      props.workoutId,
      progressData
    );

    showSuccess.value = true;
    emit("success");
    emit("close");
  } catch (error) {
    console.error("Ошибка валидации:", error.message);
    errors.value.general = error.message;
  }
};
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-title {
  margin-bottom: 1.5rem;
  color: #1a1a1a;
  font-size: 1.5rem;
}

.exercises-list {
  margin-bottom: 2rem;
}

.exercise-item {
  margin-bottom: 1rem;
}

.exercise-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.exercise-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.save-button {
  width: 100%;
  max-width: 200px;
  padding: 12px;
  border-radius: 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: #bcec30;

  &:hover {
    background-color: #000000;
    color: #ffffff;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }

  &.loading {
    padding: 0.75rem 2rem;
  }
}

.loader {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.exercise-input:invalid {
  border-color: red;
}

.save-button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

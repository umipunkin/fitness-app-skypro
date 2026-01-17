<template>
  <div class="course-page">
    <div v-if="loading" class="loader" />

    <CourseComponent v-else-if="course" :course="course" />
  </div>
</template>

<script setup>
import { useCoursesStore } from "~/stores/courses";
const route = useRoute();
const coursesStore = useCoursesStore();

const course = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    course.value = await coursesStore.getCourseById(route.params.id);
  } catch (err) {
    console.error("Ошибка при загрузке курса:", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.course-page {
  min-height: 80vh;
  position: relative;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>

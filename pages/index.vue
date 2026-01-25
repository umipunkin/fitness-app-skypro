<template>
  <div class="content-container">
    <div class="wrapper">
      <div class="text-container">
        <div class="main-title">
          Начните заниматься спортом <br >и улучшите качество жизни
        </div>
      </div>

      <div class="image-container">
        <img src="/img/message.png" alt="Измени свое тело за полгода" >
      </div>
    </div>

    <AppLessonCard
      :courses="coursesStore.getAllCourses"
      :is-loading="coursesStore.isLoading"
      :has-error="coursesStore.hasError"
    />
  </div>
</template>

<script setup>
import { useCoursesStore } from "~/stores/courses";
import { onMounted } from "vue";

const coursesStore = useCoursesStore();

onMounted(async () => {
  await coursesStore.fetchCourses();
});
</script>

<style scoped>
.wrapper {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
}

.text-container {
  flex: 1;
}

.main-title {
  font-size: 60px;
  line-height: 100%;
  margin: 0;
  font-weight: 500;
}

.image-container {
  flex: 0 0 auto;
  max-width: 300px;
}

@media (max-width: 768px) {
  .wrapper {
    flex-direction: column;
    gap: 20px;
  }
  .main-title {
    font-size: 32px;
  }
  .image-container {
    display: none;
  }
}
</style>

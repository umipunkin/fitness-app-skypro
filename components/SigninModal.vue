<template>
  <div v-if="props.showModal" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <AppAuthForm
        :is-modal="true"
        :is-visible="true"
        :is-login="isLogin"
        @close="handleClose"
        @toggle-mode="toggleMode"
      />
    </div>
  </div>
</template>

<script setup>
import AppAuthForm from "./AppAuthForm.vue";

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const isLogin = ref(true);

const handleClose = () => {
  emit("close");
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>

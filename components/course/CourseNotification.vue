<template>
    <div class="card-notification" :class="type">
      {{ message }}
    </div>
  </template>
  
  <script setup>
  defineProps({
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "add",
      validator: (value) => ["add", "remove", "info"].includes(value),
    },
  });
  </script>
  
  <style scoped>
  .card-notification {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 14px;
    color: #000;
    opacity: 0;
    animation: fadeInOut 2s ease forwards;
    pointer-events: none;
    z-index: 50;
    max-width: 90%;
    text-align: center;
  }
  
  .card-notification.add {
    background: #bcec30;
  }
  
  .card-notification.remove {
    background: rgba(149, 165, 166, 0.9);
    color: #fff;
  }
  
  .card-notification.info {
    background: #3498db;
    color: #fff;
  }
  
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    15% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    85% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
  }
  </style>
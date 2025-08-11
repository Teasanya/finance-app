<template>
  <header class="app-header">
    <theme-button></theme-button>
  </header>
</template>

<script setup lang="ts">
import ThemeButton from './ThemeButton.vue';
</script>

<style scoped>
.app-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-color);
  color: white;
  margin-bottom: 2rem;
  transition: background-color 0.5s ease;
  /* border-bottom: 1px solid rgb(159, 172, 190); */
}

/* .theme-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
} */

/* .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
} */
</style>

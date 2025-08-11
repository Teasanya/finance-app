import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
  }),
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;

      localStorage.setItem('darkTheme', String(this.isDark));

      if (this.isDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    },
    initializeTheme() {
      const savedTheme = localStorage.getItem('darkTheme');
      this.isDark = savedTheme === 'true';
      if (this.isDark) {
        document.body.classList.add('dark-theme');
      }
    },
  },
});

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardStore = defineStore('dashboardStore', () => {
  const filter = ref('all');
  const sortOrder = ref('newest');

  return { filter, sortOrder };
});

<template>
  <div :class="{ 'dark': darkMode }">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <nav class="flex space-x-4">
            <router-link 
              to="/" 
              class="px-3 py-2 rounded-md text-sm font-medium"
              :class="{
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': $route.path === '/',
                'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700': $route.path !== '/'
              }"
            >
              To-do List
            </router-link>
            <router-link 
              to="/dashboard" 
              class="px-3 py-2 rounded-md text-sm font-medium"
              :class="{
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': $route.path === '/todos',
                'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700': $route.path !== '/todos'
              }"
            >
              Dashboard
            </router-link>
          </nav>
          <button 
            @click="toggleDarkMode"
            class="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            <MoonIcon v-if="darkMode" class="h-6 w-6 text-yellow-400" />
            <SunIcon v-else class="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { MoonIcon, SunIcon } from '@heroicons/vue/24/solid';
import { useRoute } from 'vue-router';

const route = useRoute();
const darkMode = ref(false);

onMounted(() => {
  if (localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && 
      window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    darkMode.value = true;
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  if (darkMode.value) {
    localStorage.theme = 'dark';
    document.documentElement.classList.add('dark');
  } else {
    localStorage.theme = 'light';
    document.documentElement.classList.remove('dark');
  }
};
</script>
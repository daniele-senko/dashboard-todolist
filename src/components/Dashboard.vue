<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
    <h1 class="text-4xl font-bold text-center mb-6 dark:text-white">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div 
        v-for="(card, index) in statsCards" 
        :key="index"
        class="p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-[1.02]"
        :class="card.bgColor"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium">{{ card.title }}</p>
            <p class="text-3xl font-bold mt-2">{{ card.value }}</p>
          </div>
          <div class="p-2 rounded-full bg-white/20">
            <component :is="card.icon" class="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Gráfico Semanal -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">Progresso Semanal</h2>
        <LineChart 
          :chart-data="weeklyProgressData" 
          :options="chartOptions"
          class="h-80"
        />
      </div>
      
      <!-- Gráfico de Status -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">Status das Tarefas</h2>
        <PieChart 
          :chart-data="statusChartData" 
          :options="chartOptions"
          class="h-80"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTaskStore } from '../stores/taskStore';
import { PieChart, LineChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

Chart.register(...registerables);

const taskStore = useTaskStore();

const statsCards = computed(() => [
  {
    title: 'Total de Tarefas',
    value: taskStore.totalTasks,
    icon: ClipboardDocumentListIcon,
    bgColor: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
  },
  {
    title: 'Concluídas',
    value: taskStore.completedTasks,
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  },
  {
    title: 'Pendentes',
    value: taskStore.pendingTasks,
    icon: ClockIcon,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
  },
  {
    title: 'Atrasadas',
    value: taskStore.overdueTasks,
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  }
]);

const weeklyProgressData = computed(() => {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  
  const weeklyData = Array(7).fill().map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + i);
    const dateStr = date.toISOString().split('T')[0];

    return {
      date: dateStr,
      label: daysOfWeek[date.getDay()],
      completed: taskStore.tasks.filter(t => 
        t.completed && t.completedAt?.includes(dateStr)).length,
      created: taskStore.tasks.filter(t => 
        t.createdAt.includes(dateStr)).length
    };
  });

  return {
    labels: weeklyData.map(d => d.label),
    datasets: [
      {
        label: 'Tarefas Criadas',
        data: weeklyData.map(d => d.created),
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F620',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Tarefas Concluídas',
        data: weeklyData.map(d => d.completed),
        borderColor: '#10B981',
        backgroundColor: '#10B98120',
        tension: 0.3,
        fill: true
      }
    ]
  };
});

const statusChartData = computed(() => ({
  labels: ['Concluídas', 'Pendentes', 'Atrasadas'],
  datasets: [{
    data: [
      taskStore.completedTasks,
      taskStore.pendingTasks,
      taskStore.overdueTasks
    ],
    backgroundColor: [
      '#10B981',
      '#F59E0B',
      '#EF4444'
    ],
    borderWidth: 1
  }]
}));

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#6B7280',
        font: {
          size: 12
        }
      }
    }
  }
});
</script>
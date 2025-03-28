<template>
  <!-- Container principal -->
  <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-6 transition-colors duration-300">
    <!-- Título -->
    <h1 class="text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white">Lista de Tarefas</h1>
    
    <!-- Filtros e Ordenação -->
    <div class="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex-grow flex flex-col md:flex-row gap-2">
        <!-- Filtro de tarefas -->
        <select 
          v-model="currentFilter"
          class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Todas as tarefas</option>
          <option value="pending">Pendentes</option>
          <option value="completed">Concluídas</option>
          <option value="overdue">Atrasadas</option>
          <option value="today">Para hoje</option>
        </select>
        
        <!-- Ordenação -->
        <select 
          v-model="currentSort"
          class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="newest">Mais recentes</option>
          <option value="oldest">Mais antigas</option>
          <option value="dueDate">Por data</option>
          <option value="priority">Por prioridade</option>
        </select>
      </div>
    </div>

    <!-- Formulário para adicionar/editar tarefas -->
    <div class="flex flex-col md:flex-row gap-2 mb-6">
      <!-- Campo de texto -->
      <input
        v-model="newTask"
        @keyup.enter="handleTaskAction"
        placeholder="Adicionar nova tarefa..."
        class="flex-grow p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />
      
      <!-- Campos de data, hora e prioridade -->
      <div class="flex gap-2">
        <input
          type="date"
          v-model="dueDate"
          :min="getTodayDate()"
          class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
        />
        <input
          type="time"
          v-model="dueTime"
          @change="handleTimeChange"
          class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
        />
        <select
          v-model="priority"
          class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
        <!-- Botão de ação (Adicionar/Atualizar) -->
        <button 
          @click="handleTaskAction"
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>{{ isEditing ? 'Atualizar' : 'Adicionar' }}</span>
          <ArrowPathIcon v-if="isEditing" class="h-5 w-5" />
          <PlusIcon v-else class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Lista de tarefas -->
    <ul class="divide-y divide-gray-200 dark:divide-gray-700">
      <!-- Item de tarefa -->
      <li 
        v-for="task in filteredAndSortedTasks" 
        :key="task.id"
        class="py-4 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        :class="{
          'border-l-4 border-red-500': taskStore.isOverdue(task.dueDate, task.dueTime),
          'border-l-4 border-blue-500': isDueToday(task.dueDate),
          'border-l-4 border-yellow-500': task.priority === 'high',
          'opacity-70': task.completed
        }"
      >
        <div class="flex items-center justify-between">
          <!-- Checkbox e descrição -->
          <div class="flex items-center flex-grow min-w-0">
            <input
              type="checkbox"
              :checked="task.completed"
              @change="taskStore.toggleTask(task.id)"
              class="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-600"
            />
            <div class="min-w-0">
              <!-- Texto da tarefa -->
              <p 
                class="text-lg truncate"
                :class="{
                  'line-through text-gray-500 dark:text-gray-400': task.completed,
                  'text-gray-800 dark:text-white': !task.completed
                }"
              >
                {{ task.text }}
              </p>
              <!-- Metadados (data, status, prioridade) -->
              <div class="flex flex-wrap gap-2 mt-1 items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ taskStore.formatDueDateTime(task.dueDate, task.dueTime) }}
                </span>
                <!-- Badges de status -->
                <span 
                  v-if="taskStore.isOverdue(task.dueDate, task.dueTime)"
                  class="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full"
                >
                  Atrasada
                </span>
                <span 
                  v-else-if="isDueToday(task.dueDate)"
                  class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  Hoje
                </span>
                <!-- Badges de prioridade -->
                <span 
                  v-if="task.priority === 'high'"
                  class="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full"
                >
                  Alta prioridade
                </span>
                <span 
                  v-else-if="task.priority === 'medium'"
                  class="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full"
                >
                  Média prioridade
                </span>
              </div>
            </div>
          </div>
          
          <!-- Botões de ação -->
          <div class="flex gap-2 ml-4">
            <button 
              @click="editTask(task)"
              class="p-2 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-full transition-colors"
              title="Editar"
            >
              <PencilSquareIcon class="h-5 w-5" />
            </button>
            <button 
              @click="taskStore.removeTask(task.id)"
              class="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors"
              title="Excluir"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Estado vazio -->
    <div 
      v-if="filteredAndSortedTasks.length === 0" 
      class="text-center py-8 text-gray-500 dark:text-gray-400"
    >
      <InboxIcon class="mx-auto h-12 w-12 opacity-50" />
      <p class="mt-2">Nenhuma tarefa encontrada</p>
      <p class="text-sm">Adicione novas tarefas usando o formulário acima</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTaskStore } from '../stores/taskStore';
import {
  PlusIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  InboxIcon
} from '@heroicons/vue/24/outline';

const taskStore = useTaskStore();

// Refs para os dados do formulário
const newTask = ref(''); // Texto da tarefa
const dueDate = ref(''); // Data de vencimento
const dueTime = ref(''); // Hora de vencimento
const priority = ref('medium'); // Prioridade padrão
const isEditing = ref(false); // Modo edição
const editingTaskId = ref(null); // ID da tarefa sendo editada

// Filtros e ordenação
const currentFilter = ref('all'); // Filtro atual
const currentSort = ref('newest'); // Ordenação atual

/**
 * Obtém a data atual no formato YYYY-MM-DD
 * @returns {string} Data formatada
 */
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Verifica se a tarefa vence hoje
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {boolean} True se a tarefa vence hoje
 */
const isDueToday = (date) => {
  if (date === 'não definido' || !date) return false;
  return date === getTodayDate();
};

/**
 * Manipula mudanças no campo de hora
 * @param {Event} event - Evento de change
 */
const handleTimeChange = (event) => {
  if (event.target.value && !dueDate.value) {
    // Se tem hora mas não tem data, usa a data atual
    dueDate.value = getTodayDate();
  }
  dueTime.value = event.target.value || '';
};

/**
 * Adiciona uma nova tarefa
 */
const addNewTask = () => {
  if (!newTask.value.trim()) {
    alert('Por favor, insira uma descrição para a tarefa');
    return;
  }

  const taskData = {
    text: newTask.value.trim(),
    dueDate: dueDate.value || 'não definido',
    dueTime: dueTime.value || 'não definido',
    priority: priority.value
  };

  taskStore.addTask(taskData);
  resetForm();
};

/**
 * Prepara o formulário para edição
 * @param {Object} task - Tarefa a ser editada
 */
const editTask = (task) => {
  newTask.value = task.text;
  dueDate.value = task.dueDate === 'não definido' ? '' : task.dueDate;
  dueTime.value = task.dueTime === 'não definido' ? '' : task.dueTime;
  priority.value = task.priority || 'medium';
  isEditing.value = true;
  editingTaskId.value = task.id;
};

/**
 * Atualiza uma tarefa existente
 */
const updateTask = () => {
  if (!newTask.value.trim()) {
    alert('Por favor, insira uma descrição para a tarefa');
    return;
  }

  if (editingTaskId.value) {
    taskStore.updateTask(editingTaskId.value, {
      text: newTask.value.trim(),
      dueDate: dueDate.value || 'não definido',
      dueTime: dueTime.value || 'não definido',
      priority: priority.value
    });
    resetForm();
  }
};

/**
 * Decide se adiciona ou atualiza uma tarefa
 */
const handleTaskAction = () => {
  isEditing.value ? updateTask() : addNewTask();
};

/**
 * Reseta o formulário para o estado inicial
 */
const resetForm = () => {
  newTask.value = '';
  dueDate.value = '';
  dueTime.value = '';
  priority.value = 'medium';
  isEditing.value = false;
  editingTaskId.value = null;
};

/**
 * Filtra e ordena as tarefas conforme as seleções
 */
const filteredAndSortedTasks = computed(() => {
  let tasks = [...taskStore.tasks];

  // Aplica filtros
  switch (currentFilter.value) {
    case 'pending':
      tasks = tasks.filter(task => !task.completed);
      break;
    case 'completed':
      tasks = tasks.filter(task => task.completed);
      break;
    case 'overdue':
      tasks = tasks.filter(task => taskStore.isOverdue(task.dueDate, task.dueTime));
      break;
    case 'today':
      tasks = tasks.filter(task => isDueToday(task.dueDate));
      break;
  }

  // Aplica ordenação
  switch (currentSort.value) {
    case 'newest':
      tasks.sort((a, b) => b.id - a.id); // Mais recentes primeiro
      break;
    case 'oldest':
      tasks.sort((a, b) => a.id - b.id); // Mais antigas primeiro
      break;
    case 'dueDate':
      tasks.sort((a, b) => {
        if (a.dueDate === 'não definido' && b.dueDate === 'não definido') return 0;
        if (a.dueDate === 'não definido') return 1; // Tarefas sem data vão para o final
        if (b.dueDate === 'não definido') return -1;
        return new Date(a.dueDate) - new Date(b.dueDate); // Ordena por data
      });
      break;
    case 'priority':
      const priorityOrder = { high: 3, medium: 2, low: 1 }; // Mapeamento de prioridades
      tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]); // Ordena por prioridade
      break;
  }

  return tasks;
});
</script>

<style scoped>
/* Transições para animação de lista */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
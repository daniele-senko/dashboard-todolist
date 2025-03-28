import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTaskStore = defineStore('taskStore', () => {
  const tasks = ref([]); // Array reativo para armazenar as tarefas

  /**
   * Obtém a data atual no formato YYYY-MM-DD
   * @returns {string} Data formatada
   */
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses são 0-indexados
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Adiciona uma nova tarefa à lista
   * @param {Object} taskData - Dados da tarefa
   * @param {string} taskData.text - Texto da tarefa
   * @param {string} taskData.dueDate - Data de vencimento (YYYY-MM-DD)
   * @param {string} taskData.dueTime - Hora de vencimento (HH:MM)
   * @param {string} taskData.priority - Prioridade (low/medium/high)
   * @returns {Object} A nova tarefa criada
   */
  const addTask = ({ text, dueDate = 'não definido', dueTime = 'não definido', priority = 'medium' }) => {
    const newTask = {
      id: Date.now(), // ID único baseado no timestamp
      text: text.trim(),
      completed: false,
      dueDate: dueDate === '' ? 'não definido' : dueDate,
      dueTime: dueTime === '' ? 'não definido' : dueTime,
      priority,
      createdAt: getCurrentDate(), // Usa a data atual correta
      completedAt: null
    };
    tasks.value.push(newTask);
    return newTask;
  };

  /**
   * Remove uma tarefa pelo ID
   * @param {number} id - ID da tarefa a ser removida
   */
  const removeTask = (id) => {
    tasks.value = tasks.value.filter(task => task.id !== id);
  };

  /**
   * Atualiza uma tarefa existente
   * @param {number} id - ID da tarefa
   * @param {Object} updates - Campos atualizados
   */
  const updateTask = (id, updates) => {
    const taskIndex = tasks.value.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = {
        ...tasks.value[taskIndex], // Mantém os dados existentes
        ...updates, // Aplica as atualizações
        // Atualiza completedAt se o status foi alterado
        ...(updates.completed !== undefined ? 
          { completedAt: updates.completed ? getCurrentDate() : null } : 
          {}
        )
      };
    }
  };

  /**
   * Alterna o status de conclusão de uma tarefa
   * @param {number} id - ID da tarefa
   */
  const toggleTask = (id) => {
    const taskIndex = tasks.value.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
      const completed = !tasks.value[taskIndex].completed;
      tasks.value[taskIndex] = {
        ...tasks.value[taskIndex],
        completed,
        completedAt: completed ? getCurrentDate() : null
      };
    }
  };

  /**
   * Verifica se uma tarefa está atrasada
   * @param {string} dueDate - Data de vencimento
   * @param {string} dueTime - Hora de vencimento
   * @returns {boolean} True se a tarefa está atrasada
   */
  function isOverdue(dueDate, dueTime) {
    // Se não tem data nem hora definida, não está atrasada
    if (dueDate === 'não definido' && dueTime === 'não definido') return false;
    
    const now = new Date();
    let taskDate;
    
    if (dueDate === 'não definido') {
      // Se só tem hora, usa a data atual com a hora especificada
      const [hours, minutes] = dueTime.split(':');
      taskDate = new Date();
      taskDate.setHours(hours, minutes, 0, 0);
    } else {
      // Combina data e hora (ou usa 23:59 como padrão)
      taskDate = new Date(`${dueDate}T${dueTime || '23:59'}`);
    }
    
    return taskDate < now; // Compara com o momento atual
  }

  /**
   * Formata data e hora para exibição
   * @param {string} dueDate - Data no formato YYYY-MM-DD
   * @param {string} dueTime - Hora no formato HH:MM
   * @returns {string} Data formatada para exibição
   */
  function formatDueDateTime(dueDate, dueTime) {
    if (dueDate === 'não definido' && dueTime === 'não definido') {
      return 'Sem prazo';
    }

    let dateStr = '';
    if (dueDate !== 'não definido') {
      // Formata no padrão brasileiro DD/MM/YYYY
      const [year, month, day] = dueDate.split('-');
      dateStr = `${day}/${month}/${year}`;
    }

    const timeStr = dueTime !== 'não definido' 
      ? dueTime.substring(0, 5) // Pega apenas horas e minutos
      : '';

    // Combina data e hora para exibição
    return [dateStr, timeStr].filter(Boolean).join(' às ') || 'Sem prazo';
  }

  // Propriedades computadas
  const totalTasks = computed(() => tasks.value.length);
  const completedTasks = computed(() => tasks.value.filter(task => task.completed).length);
  const pendingTasks = computed(() => tasks.value.filter(task => !task.completed).length);
  const overdueTasks = computed(() => tasks.value.filter(task => isOverdue(task.dueDate, task.dueTime)).length);

  return { 
    tasks,
    addTask,
    removeTask,
    updateTask,
    toggleTask,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    isOverdue,
    formatDueDateTime
  };
});
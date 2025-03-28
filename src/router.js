import { createRouter, createWebHistory } from "vue-router";
import TodoList from "./components/TodoList.vue";
import Dashboard from "./components/Dashboard.vue";

const routes = [
    { path: "/", component: TodoList},
    { path: "/dashboard", component: Dashboard}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
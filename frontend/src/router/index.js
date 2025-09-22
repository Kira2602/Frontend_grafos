import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Pizarra_grafos from '../views/Pizarra_grafos.vue'  
import Johnson from '../views/Johnson.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/pizarra',
      name: 'Pizarra',
      component: Pizarra_grafos,
    },
    {
      path: '/johnson',
      name: 'johnson',
      component: Johnson,
    },
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Pizarra_grafos from '../views/Pizarra_grafos.vue'
import Johnson from '../views/Johnson.vue'
import Asignacion from '@/views/Asignacion.vue'
import Sorts from '@/views/Sorts.vue'
import ArbolBinario from '@/views/ArbolBinario.vue'
import NorWest from '@/views/NorWest.vue'
import Dijkstra from '@/views/Dijkstra.vue'
import Kruskal from '@/views/Kruskal.vue'
import FuzzyLogic from '@/views/FuzzyLogic.vue'

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
        {
      path: '/asignacion',
      name: 'asignacion',
      component: Asignacion,
    },
    {
      path: '/sorts',
      name: 'sorts',
      component: Sorts,
    },
    {
      path: '/arbol-binario',
      name: 'arbol-binario',
      component: ArbolBinario,
    },
    {
      path: '/norwest',
      name: 'norwest',
      component: NorWest,
    },
    {
      path: '/dijkstra',
      name: 'dijkstra',
      component: Dijkstra,
    },
    {
      path: '/kruskal',
      name: 'kruskal',
      component: Kruskal,
    },
    {
      path: '/fuzzy-logic',
      name: 'fuzzy-logic',
      component: FuzzyLogic,
    },
  ],
})

export default router

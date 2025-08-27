<!-- src/App.vue -->
<script setup>
import NavbarComponent from './components/NavbarComponent.vue';
</script>

<template>
  <NavbarComponent />
  <!-- Aquí se renderizan las vistas del router -->
  <RouterView />
</template>

<style>
/* Asegura que el fondo global no te juegue en contra */
html, body, #app { height: 100%; }
body {
  font-family: "Bellota", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

body { margin: 0; background: transparent; }
</style>

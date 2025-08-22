<template>
  <header>
    <nav>
      <div class="container">
        <ul class="nav-list" :class="{ 'is-open': isOpen }">
          <!-- Izquierda: Logo -->
          <li class="nav-logo">
            <a class="logo" href="/" aria-label="Home">
              <img class="logo-img" src="@/assets/img/graph_logo.png" alt="Logo Grafos" />
            </a>

            <!-- Botón hamburguesa (solo móvil) -->
            <button class="btn nav-toggle" @click="toggleNav" aria-label="Abrir/cerrar menú">
              <i class="fa fa-bars"></i>
            </button>
          </li>

          <!-- Centro: Menú -->
          <li class="nav-center">
            <ul class="nav-menu">
              <li class="nav-link" tabindex="0">
                Grafos <i class="fa fa-chevron-up"></i>
                <ul class="nav-drop" role="menu">
                  <li role="menuitem">Algoritmo</li>
                </ul>
              </li>

              <li class="nav-link" tabindex="0">Ayuda</li>
              <li class="nav-link" tabindex="0">Contacto</li>
            </ul>
          </li>

          <!-- (Opcional) Acciones a la derecha -->
          <!-- <li class="nav-actions">
            <button class="btn">Sign in</button>
          </li> -->
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from "vue";
const isOpen = ref(false);
const toggleNav = () => (isOpen.value = !isOpen.value);
</script>

<style lang="scss" scoped>
$primary-color: #c8d9e6;
$primary-color-light: rgba($primary-color, 0.2);
$shadow-color: #e1e5ee;
$break-point: 768px;

@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300&family=Poppins:wght@300&display=swap");

*,
*::before,
*::after { box-sizing: border-box; margin: 0; padding: 0; }

.container { max-width: 1200px; padding: 0; margin: 0 auto; }

ul, li { list-style: none; }

nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  width: 100%;
  z-index: 50;
  font-family: "Poppins", sans-serif;

  /* 🎨 Glass effect */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  .nav-list {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0;
    min-height: 72px;
    width: 100%;

    /* Logo */
    .nav-logo {
      flex: 0 0 auto;
      display: flex; align-items: center; gap: 0.75rem;

      .logo {
        display: inline-flex; align-items: center; text-decoration: none; cursor: pointer;
      }
      .logo-img {
        height: 36px;            /* tamaño desktop */
        width: auto;
        opacity: .95;
        transition: transform .2s ease, filter .2s ease, opacity .2s ease;
      }
      .logo:hover .logo-img,
      .logo:focus .logo-img {
        transform: scale(1.06);
        filter: drop-shadow(0 0 10px rgba(200, 217, 230, 0.7));
        opacity: 1;
      }

      .nav-toggle { display: none; }
    }

    /* Menú centrado */
    .nav-center {
      flex: 1 1 auto;
      display: flex; justify-content: center; align-items: center; min-width: 0;

      .nav-menu { display: flex; align-items: center; gap: 1.5rem; margin: 0; padding: 0; }
    }

    /* (Opcional) Acciones a la derecha */
    .nav-actions { margin-left: auto; display: flex; align-items: center; }

    /* Opciones */
    .nav-link {
      font-weight: 600;
      padding: 1.5rem 1.2rem;
      position: relative;
      cursor: pointer;
      white-space: nowrap;
      color: white;  /* texto blanco */

      i { color: white; transition: transform 0.3s; }

      &:after {
        position: absolute; content: "";
        width: 0%; height: 0.3em;
        background: $primary-color; border-radius: 4px;
        bottom: 1em; left: 1.2em; transition: width 0.3s;
      }
      &:hover::after { width: 60%; }
      &:hover { ul { opacity: 1; visibility: visible; } i { transform: rotate(180deg); } }

      /* Dropdown */
      .nav-drop {
        position: absolute; top: 4rem;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        width: 12rem; padding: 0.5rem; margin-left: -1rem;
        display: flex; flex-direction: column; gap: 0.5rem;
        opacity: 0; visibility: hidden; transition: 300ms ease-out;

        li {
          padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; transition: background 0.1s;
          &:hover, &:focus { background: $primary-color-light; }
        }
      }
    }
  }

  .btn {
    border: none; outline: transparent;
    padding: 0.6rem 1.1rem; border-radius: 0.6rem;
    background: lighten($primary-color, 25%); color: darken($primary-color, 25%);
    font-family: inherit; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: 0.1s;

    &.outline { background: inherit; border: 2px solid lighten($primary-color, 25%); }
    &:hover { background: lighten($primary-color, 15%); }
    &:focus { text-shadow: 0 0 18px $primary-color; outline: 4px solid lighten($primary-color, 20%); }
    &:active { transform: scale(0.98); }
  }
}

/* ========================= RESPONSIVE ========================= */
@media screen and (min-width: $break-point) {
  nav .nav-list {
    .nav-center { display: flex !important; }
    .nav-actions { display: flex !important; }
    .nav-logo .nav-toggle { display: none !important; }
  }
}

@media screen and (max-width: $break-point) {
  nav { padding: 0.6rem 0; }

  nav .nav-list {
    gap: 0.5rem;

    .nav-logo {
      width: 100%; justify-content: space-between;
      .logo-img { height: 28px; } /* tamaño móvil */
      .nav-toggle { display: inline-flex; }
    }

    .nav-center, .nav-actions { display: none; width: 100%; }
    &.is-open { .nav-center, .nav-actions { display: block !important; } }

    .nav-center { margin-top: 0.5rem; display: block; }
    .nav-menu  { display: block; }

    .nav-link {
      padding: 1rem 0.5rem; display: block;
      i { right: 0.5rem; top: 1.2rem; }

      .nav-drop { position: relative; top: 0.4rem; box-shadow: unset; width: 100%; margin-left: 0; opacity: 0; visibility: hidden; }
      &:after { top: 2.6em; left: 0.08em; }
      &:hover::after { width: 4em; }
      &:hover .nav-drop { position: relative; opacity: 1; visibility: visible; }
    }

    .nav-actions { margin-top: 0.6rem; display: block; text-align: left; .btn { width: 100%; } }
  }
}
</style>

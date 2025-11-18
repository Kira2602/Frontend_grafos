<template>
  <header>
    <nav>
      <div class="container">
        <ul class="nav-list" :class="{ 'is-open': isOpen }">
          <!-- Izquierda: Logo + Wordmark -->
          <li class="nav-logo">
            <a class="logo" href="/" aria-label="Home">
              <img class="logo-img" src="../assets/img/graph_logo.png" alt="Logo Grafos" />
            </a>

            <span class="brand-wordmark" aria-label="Graphroom">Graphroom</span>

            <button class="btn nav-toggle" @click="toggleNav" aria-label="Abrir/cerrar menú">
              <i class="fa fa-bars"></i>
            </button>
          </li>

          <!-- Centro: Menú -->
          <li class="nav-center">
            <ul class="nav-menu">
              <!-- Algoritmos -->
              <li class="nav-link" tabindex="0">
                Algoritmos <i class="fa fa-chevron-down"></i>
                <ul class="nav-drop" role="menu">
                  <li
                    role="menuitem"
                    tabindex="0"
                    @click="goPizarra"
                    @keydown.enter="goPizarra"
                    aria-label="Ir a Pizarra de grafos"
                  >
                    Pizarra de grafos
                  </li>
                  <li
                    role="menuitem"
                    tabindex="0"
                    @click="goJohnson"
                    @keydown.enter="goJohnson"
                    aria-label="Ir a Algoritmo de Johnson"
                  >
                    Johnson
                  </li>
                  <li
                    role="menuitem"
                    tabindex="0"
                    @click="goAsignacion"
                    @keydown.enter="goAsignacion"
                    aria-label="Ir a Algoritmo de Asignacion"
                  >
                    Asignacion
                  </li>
                  <li
                    role="menuitem"
                    tabindex="0"
                    @click="goNorWest"
                    @keydown.enter="goNorWest"
                    aria-label="Ir a North West Corner"
                  >
                    North West
                  </li>
                  <li
                    role="menuitem"
                    tabindex="0"
                    @click="goSorts"
                    @keydown.enter="goSorts"
                    aria-label="Ir a Sorts"
                  >
                    Sorts
                  </li>
                  <li
                    role="menuitem"
                    tabindex="0"
                    @click="goArbolBinario"
                    @keydown.enter="goArbolBinario"
                    aria-label="Ir a Árboles Bianrios"
                  >
                    Árboles Binarios
                  </li>

                  <li
                    role="menuitem"
                    tabindex="0"
                    @click="goDijkstra"
                    @keydown.enter="goDijkstra"
                    aria-label="Ir a Dijkstra"
                  >
                    Dijkstra
                  </li>
                </ul>
              </li>

              <!-- Inicio -->
              <li
                class="nav-link"
                role="link"
                tabindex="0"
                @click="goHome"
                @keydown.enter="goHome"
                aria-label="Ir al inicio"
              >
                Inicio
              </li>

              <!-- Ayuda -->
              <li
                v-if="!!helpCfg"
                class="nav-link"
                role="button"
                tabindex="0"
                aria-haspopup="dialog"
                @click="openHelp"
                @keydown.enter="openHelp"
              >
                Ayuda
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  </header>

  <!-- Modal Ayuda -->
  <HelpModal
    v-if="!!helpCfg"
    :open="isHelpOpen"
    :video-id="helpCfg.videoId"
    :heading="helpCfg.heading"
    :youtube-url="helpCfg.youtubeUrl"
    :embed-query="helpCfg.embedQuery"
    :pdf-url="helpCfg.pdfUrl"
    @close="isHelpOpen = false"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import HelpModal from './HelpModal.vue'

const isOpen = ref(false)
const isHelpOpen = ref(false)
const toggleNav = () => (isOpen.value = !isOpen.value)

const router = useRouter()
const route = useRoute()

const goHome = () => {
  isOpen.value = false
  router.push('/')
}

const goPizarra = () => {
  isOpen.value = false
  router.push('/pizarra')
}

const goJohnson = () => {
  isOpen.value = false
  router.push('/johnson')
}

const goAsignacion = () => {
  isOpen.value = false
  router.push('/asignacion')
}

const goNorWest = () => {
  isOpen.value = false
  router.push('/norwest')
}

const goSorts = () => {
  isOpen.value = false
  router.push('/sorts')
}

const goArbolBinario = () => {
  isOpen.value = false
  router.push('/arbol-binario')
}

const goDijkstra = () => {
  isOpen.value = false
  router.push('/dijkstra')
}

const openHelp = () => {
  isOpen.value = false
  isHelpOpen.value = true
}

// ======================================
// CONFIGURACIÓN DE AYUDA SEGÚN LA RUTA
// ======================================
const helpCfg = computed(() => {
  const name = route.name?.toString().toLowerCase() || ''
  const path = route.path?.toString().toLowerCase() || ''

  if (name === 'pizarra' || path === '/pizarra') {
    const videoId = 'ZDfQM-VOog4'
    return {
      heading: 'Tutorial',
      videoId,
      youtubeUrl: `https://youtu.be/${videoId}`,
      embedQuery: '',
      pdfUrl: '',
    }
  }

  if (name === 'johnson' || path === '/johnson') {
    const videoId = 'ZJJhLHeQXoM'
    const si = 'IA050QXKmZ5Da7Jl'
    return {
      heading: 'Johnson: Tutorial',
      videoId,
      youtubeUrl: `https://youtu.be/${videoId}?si=${si}`,
      embedQuery: `si=${si}`,
      pdfUrl: '/assets/pdf/johnson_guide.pdf',
    }
  }

  if (name === 'asignacion' || path === '/asignacion') {
    const videoId = 'gUYPWANOpRw'
    const si = '1r-cH1VDTjwgdFj3'
    return {
      heading: 'Asignación: Tutorial',
      videoId,
      youtubeUrl: `https://youtu.be/${videoId}?si=${si}`,
      embedQuery: `si=${si}`,
      pdfUrl: '/assets/pdf/asignacion_guide.pdf',
    }
  }

  if (name === 'norwest' || path === '/norwest') {
    const videoId = 'EXAMPLE_VIDEO_ID'
    const si = 'EXAMPLE_SI'
    return {
      heading: 'North West: Tutorial',
      videoId,
      youtubeUrl: `https://youtu.be/${videoId}?si=${si}`,
      embedQuery: `si=${si}`,
      pdfUrl: '/assets/pdf/norwest_guide.pdf',
    }
  }

  if (name === 'sorts' || path === '/sorts') {
    const videoId = 'hF7X8kzjKcM'
    const si = 'qX4mJYk1b8mO5O3D'
    return {
      heading: 'Sorts: Tutorial',
      videoId,
      youtubeUrl: `https://youtu.be/${videoId}?si=${si}`,
      embedQuery: `si=${si}`,
      pdfUrl: '/assets/pdf/sorts_guide.pdf',
    }
  }

  // ✅ NUEVO BLOQUE PARA ÁRBOL BINARIO
    // ✅ NUEVO BLOQUE PARA ÁRBOL BINARIO
  if (name === 'arbol-binario' || path === '/arbol-binario') {
    const videoId = 'XfpBkrlmyk4'
    const si = 'hDwM5E6qON9DJkcX'
    return {
      heading: 'Árbol Binario: Tutorial',
      videoId,
      youtubeUrl: `https://youtu.be/${videoId}?si=${si}`,
      embedQuery: `si=${si}`,
      pdfUrl: '/assets/pdf/arboles_guide.pdf',
    }
  }

  if(name === 'dijkstra' || path === '/dijkstra') {
    const videoId = 'EXAMPLE_VIDEO_ID'
    const si = 'EXAMPLE_SI'
    return {
      heading: 'Dijkstra: Tutorial',
      videoId,
      youtubeUrl: `https://youtu.be/${videoId}?si=${si}`,
      embedQuery: `si=${si}`,
      pdfUrl: '/assets/pdf/dijkstra_guide.pdf',
    }
  }

  return null
})

watch(
  () => route.fullPath,
  () => {
    isOpen.value = false
    if (!helpCfg.value) isHelpOpen.value = false
  },
)
</script>

<style lang="scss" scoped>
$primary-color: #c8d9e6;
$primary-color-light: rgba($primary-color, 0.2);
$shadow-color: #e1e5ee;
$break-point: 768px;

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300&family=Poppins:wght@300&family=Bellota:wght@300;400;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.container {
  max-width: 1200px;
  padding: 0;
  margin: 0 auto;
}
ul,
li {
  list-style: none;
}

nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 50;
  font-family: 'Poppins', sans-serif;
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

    .nav-logo {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .logo {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        cursor: pointer;
      }
      .logo-img {
        height: 36px;
        width: auto;
        opacity: 0.95;
        transition:
          transform 0.2s ease,
          filter 0.2s ease,
          opacity 0.2s ease;
      }
      .logo:hover .logo-img,
      .logo:focus .logo-img {
        transform: scale(1.06);
        filter: drop-shadow(0 0 10px rgba(200, 217, 230, 0.7));
        opacity: 1;
      }

      .brand-wordmark {
        font-family: 'Bellota', cursive;
        font-weight: 700;
        font-size: 1.35rem;
        line-height: 1;
        letter-spacing: 0.02em;
        color: #ffffff;
        margin-left: 0.1rem;
        transform: translateY(1px);
        white-space: nowrap;
        text-shadow: 0 0 6px rgba(200, 217, 230, 0.35);
        user-select: none;
      }

      .nav-toggle {
        display: none;
        margin-left: 0.25rem;
      }
    }

    .nav-center {
      flex: 1 1 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 0;
      .nav-menu {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin: 0;
        padding: 0;
      }
    }

    .nav-link {
      font-weight: 600;
      padding: 1.5rem 1.2rem;
      position: relative;
      cursor: pointer;
      white-space: nowrap;
      color: white;

      i {
        color: white;
        transition: transform 0.3s;
      }

      &:after {
        position: absolute;
        content: '';
        width: 0%;
        height: 0.3em;
        background: $primary-color;
        border-radius: 4px;
        bottom: 1em;
        left: 1.2em;
        transition: width 0.3s;
      }
      &:hover::after {
        width: 60%;
      }
      &:hover {
        ul {
          opacity: 1;
          visibility: visible;
        }
        i {
          transform: rotate(180deg);
        }
      }

      .nav-drop {
        position: absolute;
        top: 4rem;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        width: 12rem;
        padding: 0.5rem;
        margin-left: -1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        opacity: 0;
        visibility: hidden;
        transition: 300ms ease-out;

        li {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.1s;
          &:hover,
          &:focus {
            background: $primary-color-light;
          }
        }
      }
    }
  }

  .btn {
    border: none;
    outline: transparent;
    padding: 0.6rem 1.1rem;
    border-radius: 0.6rem;
    background: lighten($primary-color, 25%);
    color: darken($primary-color, 25%);
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: 0.1s;

    &.outline {
      background: inherit;
      border: 2px solid lighten($primary-color, 25%);
    }
    &:hover {
      background: lighten($primary-color, 15%);
    }
    &:focus {
      text-shadow: 0 0 18px $primary-color;
      outline: 4px solid lighten($primary-color, 20%);
    }
    &:active {
      transform: scale(0.98);
    }
  }
}

@media screen and (min-width: $break-point) {
  nav .nav-list {
    .nav-center {
      display: flex !important;
    }
    .nav-logo .nav-toggle {
      display: none !important;
    }
  }
}

@media screen and (max-width: $break-point) {
  nav {
    padding: 0.6rem 0;
  }

  nav .nav-list {
    gap: 0.5rem;

    .nav-logo {
      width: 100%;
      justify-content: space-between;
      .logo-img {
        height: 28px;
      }
      .brand-wordmark {
        display: none;
      }
      .nav-toggle {
        display: inline-flex;
      }
    }

    .nav-center {
      display: none;
      width: 100%;
    }
    &.is-open {
      .nav-center {
        display: block !important;
      }
    }

    .nav-center {
      margin-top: 0.5rem;
      display: block;
    }
    .nav-menu {
      display: block;
    }

    .nav-link {
      padding: 1rem 0.5rem;
      display: block;
      i {
        right: 0.5rem;
        top: 1.2rem;
      }

      .nav-drop {
        position: relative;
        top: 0.4rem;
        width: 100%;
        margin-left: 0;
        opacity: 0;
        visibility: hidden;
      }
      &:after {
        top: 2.6em;
        left: 0.08em;
      }
      &:hover::after {
        width: 4em;
      }
      &:hover .nav-drop {
        position: relative;
        opacity: 1;
        visibility: visible;
      }
    }
  }
}
</style>

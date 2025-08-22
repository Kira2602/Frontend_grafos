<template>
  <section class="page">
    <div class="board-wrap">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="tools-left">
          <button class="tool" @click="noop"><i class="fa-regular fa-circle"></i> Nodo</button>
          <button class="tool" @click="noop"><i class="fa-solid fa-pen"></i> Texto</button>
          <button class="tool" @click="noop"><i class="fa-solid fa-eraser"></i> Borrar</button>
        </div>

        <div class="tools-right">
          <!-- Exportar con dropdown -->
          <div class="tool--drop" :class="{ 'is-open': openExport }" ref="dropRef">
            <button
              class="tool tool-trigger"
              @click.stop="toggleExport"
              aria-haspopup="menu"
              :aria-expanded="openExport ? 'true' : 'false'"
              title="Exportar"
            >
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              Exportar
              <i class="fa fa-chevron-up caret"></i>
            </button>

            <!-- usa v-if en lugar de v-show -->
            <ul class="tool-drop" role="menu" v-if="openExport">
              <li role="menuitem">
                <button class="drop-item" @click="exportImagen">
                  <i class="fa-regular fa-image"></i> Exportar imagen
                </button>
              </li>
              <li role="menuitem">
                <button class="drop-item" @click="exportPDF">
                  <i class="fa-regular fa-file-pdf"></i> Exportar PDF
                </button>
              </li>
              <li role="menuitem">
                <button class="drop-item" @click="exportJSON">
                  <i class="fa-regular fa-file-lines"></i> Exportar JSON
                </button>
              </li>
            </ul>
          </div>

          <!-- Importar JSON aparte -->
          <label class="tool file" title="Importar JSON">
            <i class="fa-solid fa-file-import"></i> Importar JSON
            <input type="file" accept="application/json" @change="importJSON" />
          </label>
        </div>
      </div>

      <!-- Pizarra -->
      <div
        class="board"
        :class="[themeClass, { 'no-grid': !showGrid }]"
        :style="boardStyle"
        role="region"
        aria-label="Pizarra de grafos"
      >
        <button class="fab" @click="showPicker = true" title="Cambiar estilo">
          <i class="fa-solid fa-palette"></i>
        </button>
      </div>
    </div>

    <!-- Modal -->
    <EstiloPizarra
      v-model="showPicker"
      :theme="theme"
      :color="color"
      :image="image"
      @confirm="applyTheme"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import EstiloPizarra from '@/components/EstiloPizarra.vue'

/* Estado pizarra */
const theme = ref('grid')
const color = ref('#fff7ef')
const image = ref('')
const showGrid = ref(true)
const showPicker = ref(false)
const themeClass = computed(() => `theme-${theme.value}`)

const boardStyle = computed(() => ({
  '--board-bg': color.value,
  '--board-image': image.value ? `url("${image.value}")` : 'none',
}))

const applyTheme = ({ theme: t, color: c, image: img }) => {
  if (t === 'image' && !img) {
    theme.value = 'plain'
    color.value = '#ffffff'
    image.value = ''
    return
  }
  theme.value = t
  if (c) color.value = c
  image.value = img || ''
}

const toggleGrid = () => (showGrid.value = !showGrid.value)
const noop = () => {}

/* Dropdown Exportar */
const openExport = ref(false)
const dropRef = ref(null)

const toggleExport = () => (openExport.value = !openExport.value)

const onClickOutside = (e) => {
  // si se hace clic fuera, cerrar
  if (!dropRef.value) return
  if (!dropRef.value.contains(e.target)) openExport.value = false
}
const onKey = (e) => { if (e.key === 'Escape') openExport.value = false }

onMounted(() => {
  document.addEventListener('click', onClickOutside, true)  // captura para cerrar antes
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside, true)
  document.removeEventListener('keydown', onKey)
})

/* Acciones (stubs) */
const exportImagen = () => { openExport.value = false; noop() }
const exportPDF   = () => { openExport.value = false; noop() }
const exportJSON  = () => { openExport.value = false; noop() }
const importJSON  = () => { noop() }
</script>

<style scoped lang="scss">
$navbar-height: 72px;
$wrap-max: 1200px;

$page-bg: #0f1120;
$panel-bg: #2c2f3a;
$panel-border: rgba(255,255,255,.08);
$shadow: 0 10px 24px rgba(0,0,0,.25);

.page { min-height: calc(100vh - $navbar-height); padding-top: calc($navbar-height + 16px); display: flex; align-items: flex-start; justify-content: center; background: $page-bg; }
.board-wrap { width: 100%; max-width: $wrap-max; padding: 0 16px 48px; }

.toolbar {
  background: $panel-bg; border: 1px solid $panel-border; border-radius: 12px; padding: 8px;
  display: flex; align-items: center; justify-content: space-between; box-shadow: $shadow; backdrop-filter: blur(6px); color: #e7e7ec;
  overflow: visible; /* 🔧 permite que el dropdown “se salga” */

  .tools-left, .tools-right { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

  .tool {
    display: inline-flex; align-items: center; gap: 8px;
    font-weight: 600; border: 1px solid $panel-border;
    background: rgba(255,255,255,.06); color: #e7e7ec;
    padding: 8px 12px; border-radius: 10px; cursor: pointer;
    transition: transform .05s, background .2s, border-color .2s;
    i { font-size: 14px; }
    &:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.18); }
    &:active { transform: translateY(1px); }
    &.file { position: relative; input[type="file"]{ position:absolute; inset:0; opacity:0; cursor:pointer; } }
  }

  /* Botón con dropdown */
  .tool--drop {
    position: relative; z-index: 30; /* por encima de otros elementos */

    .tool-trigger {
      .caret { margin-left: 8px; transition: transform .25s ease; }
    }
    &.is-open .caret { transform: rotate(180deg); }

    .tool-drop {
      position: absolute; top: calc(100% + 8px); right: 0;
      z-index: 999; /* 🔧 bien arriba */
      display: block;
      background: rgba(0,0,0,0.7);
      color: white;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 10px;
      padding: 6px;
      min-width: 220px;
      backdrop-filter: blur(6px);
      box-shadow: 0 12px 28px rgba(0,0,0,.35);

      li { list-style: none; }

      .drop-item {
        width: 100%;
        display: flex; align-items: center; gap: 10px;
        background: transparent; color: white;
        border: none; border-radius: 8px;
        padding: 10px 12px; text-align: left; cursor: pointer;
        transition: background .15s ease;
        i { width: 18px; text-align: center; }
        &:hover { background: rgba(255,255,255,0.12); }
      }
    }
  }
}

.board {
  margin-top: 14px; border-radius: 16px; border: 1px solid $panel-border; min-height: clamp(420px, 65vh, 720px);
  position: relative; overflow: hidden; box-shadow: $shadow;
  background-color: var(--board-bg, #ffffff);
  background-image:
    linear-gradient(to right, rgba(0,0,0,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,.05) 1px, transparent 1px);
  background-size: 16px 16px;

  &.no-grid { background-image: none !important; }

  .empty-hint { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; color: #e7e7ec; h2 { margin: 0; font-size: 28px; } p { opacity: .85; margin-top: 6px; } }

  .fab { position: absolute; right: 14px; bottom: 14px; width: 44px; height: 44px; border-radius: 999px; border: none; background: #567c8d; color: #ecebe6; display: grid; place-items: center; cursor: pointer; box-shadow: 0 8px 22px rgba(0,0,0,.35); transition: transform .06s, filter .2s; &:hover { filter: brightness(1.05); } &:active { transform: translateY(1px); } }
}

/* Temas */
.theme-plain { background-color: var(--board-bg, #ffffff); background-image: none; }
.theme-grid  { background-color: var(--board-bg, #fff7ef);
  background-image:
    linear-gradient(to right, rgba(0,0,0,.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,.08) 1px, transparent 1px);
  background-size: 20px 20px;
}
.theme-dotted{ background-color: var(--board-bg, #ffffff); background-image: radial-gradient(circle, rgba(0,0,0,.32) 1.1px, transparent 1.1px); background-size: 14px 14px; }
.theme-image{ background-color: var(--board-bg, #ffffff); background-image: var(--board-image); background-size: cover; background-position: center; }

/* Responsive toolbar */
@media (max-width: 900px){ .toolbar{ gap:10px; .tools-right{ margin-left:auto; } } }
@media (max-width: 640px){
  .toolbar{ flex-direction: column; align-items: stretch;
    .tools-left, .tools-right{ justify-content: flex-start; }
  }
}
</style>

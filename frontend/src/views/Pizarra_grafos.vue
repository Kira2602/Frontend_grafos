<template>
  <section class="page">
    <div class="board-wrap">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="tools-left">
          <button class="tool" @click="noop"><i class="fa-regular fa-circle"></i> Círculo</button>
          <button class="tool" @click="noop"><i class="fa-regular fa-square"></i> Rectángulo</button>
          <button class="tool" @click="noop"><i class="fa-regular fa-star"></i> Estrella</button>
          <button class="tool" @click="noop"><i class="fa-solid fa-pen"></i> Texto</button>
          <button class="tool" @click="noop"><i class="fa-solid fa-eraser"></i> Borrar</button>
          <button class="tool" @click="toggleGrid"><i class="fa-solid fa-border-all"></i> Rejilla</button>
        </div>

        <div class="tools-right">
          <button class="tool" @click="noop"><i class="fa-regular fa-image"></i> Exportar Imagen</button>
          <button class="tool" @click="noop"><i class="fa-regular fa-file-pdf"></i> Exportar PDF</button>
          <button class="tool" @click="noop"><i class="fa-regular fa-file-lines"></i> Exportar JSON</button>
          <label class="tool file">
            <i class="fa-solid fa-file-import"></i> Importar JSON
            <input type="file" accept="application/json" @change="noop"/>
          </label>

          <!-- Abrir modal de estilo -->
          <button class="tool primary" @click="showPicker = true" title="Cambiar estilo">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </button>
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
import { ref, computed } from 'vue'
import EstiloPizarra from '@/components/EstiloPizarra.vue'

// estado
const theme = ref('grid')        // 'plain' | 'grid' | 'dotted' | 'image'
const color = ref('#fff7ef')     // color base del fondo
const image = ref('')            // dataURL/URL si hay imagen
const showGrid = ref(true)
const showPicker = ref(false)

const themeClass = computed(() => `theme-${theme.value}`)

// estilo dinámico
const boardStyle = computed(() => ({
  '--board-bg': color.value,
  '--board-image': image.value ? `url("${image.value}")` : 'none',
}))

const applyTheme = ({ theme: t, color: c, image: img }) => {
  // fallback seguro: si pide 'image' pero no hay imagen, usar blanco
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

  .tools-left, .tools-right { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .tool { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; border: 1px solid $panel-border; background: rgba(255,255,255,.06); color: #e7e7ec; padding: 8px 12px; border-radius: 10px; cursor: pointer; transition: transform .05s, background .2s, border-color .2s;
    i { font-size: 14px; }
    &:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.18); }
    &:active { transform: translateY(1px); }
    &.primary { background: #6a8dff; color: #0b0e19; border-color: transparent; &:hover{ background: #7b9aff; } }
    &.file { position: relative; input[type="file"]{ position:absolute; inset:0; opacity:0; cursor:pointer; } }
  }
}

.board {
  margin-top: 14px; border-radius: 16px; border: 1px solid $panel-border; min-height: clamp(420px, 65vh, 720px);
  position: relative; overflow: hidden; box-shadow: $shadow;
  background-color: var(--board-bg, #ffffff);

  /* patrón base (se anula por clase/imagen) */
  background-image:
    linear-gradient(to right, rgba(0,0,0,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,.05) 1px, transparent 1px);
  background-size: 16px 16px;

  &.no-grid { background-image: none !important; }

  .empty-hint { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; color: #e7e7ec; h2 { margin: 0; font-size: 28px; } p { opacity: .85; margin-top: 6px; } }

  .fab { position: absolute; right: 14px; bottom: 14px; width: 44px; height: 44px; border-radius: 999px; border: none; background: #ffcc6a; color: #332400; display: grid; place-items: center; cursor: pointer; box-shadow: 0 8px 22px rgba(0,0,0,.35); transition: transform .06s, filter .2s;
    &:hover { filter: brightness(1.05); } &:active { transform: translateY(1px); }
  }
}

/* ===== Temas ===== */
.theme-plain { background-color: var(--board-bg, #ffffff); background-image: none; }
.theme-grid  { background-color: var(--board-bg, #fff7ef);
  background-image:
    linear-gradient(to right, rgba(0,0,0,.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,.08) 1px, transparent 1px);
  background-size: 20px 20px;
}
.theme-dotted{
  background-color: var(--board-bg, #ffffff);
  background-image: radial-gradient(circle, rgba(0,0,0,.32) 1.1px, transparent 1.1px);
  background-size: 14px 14px;
}
.theme-image{
  background-color: var(--board-bg, #ffffff);
  background-image: var(--board-image);
  background-size: cover;
  background-position: center;
}

/* Responsive toolbar */
@media (max-width: 900px){ .toolbar{ gap:10px; .tools-right{ margin-left:auto; } } }
@media (max-width: 640px){
  .toolbar{ flex-direction: column; align-items: stretch;
    .tools-left, .tools-right{ justify-content: flex-start; }
  }
}
</style>

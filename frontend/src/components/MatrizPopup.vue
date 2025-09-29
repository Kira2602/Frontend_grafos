<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="matTitle">
        <div class="header">
          <h3 id="matTitle">Matriz de adyacencia</h3>
          <button class="btn-icon" @click="close" title="Cerrar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- leyenda opcional -->
        <div v-if="showLegend" class="legend">
          <span class="chip match">Asignado</span>
          <span class="chip heat" v-if="heatmap">Heatmap (modo: {{ heatModeLabel }})</span>
          <span class="chip total" v-if="typeof total==='number'">Total: {{ total }}</span>
        </div>

        <div class="table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="corner"></th>
                <th v-for="(c, j) in colHeads" :key="'c'+j">{{ c }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in body" :key="'r'+i">
                <th class="row-head">{{ rowHeads[i] }}</th>
                <td
                  v-for="(val, j) in row"
                  :key="'x'+i+'-'+j"
                  :class="cellClass(i,j)"
                  :style="cellStyle(i,j,val)"
                >
                  {{ val }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="actions">
          <button class="btn" @click="close">Cerrar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

/* 🔧 Props (compatibles con tu API) */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // Compat anterior (cuadrada con 'nodes')
  nodes:   { type: Array, default: () => [] },
  matrix:  { type: Array, default: () => [] },
  // Rectangular L×R (asignación)
  rowLabels: { type: Array, default: null },
  colLabels: { type: Array, default: null },
  // Resultado hungarian
  matches:   { type: Array,  default: () => [] }, // [[i,j], ...] 0-based
  total:     { type: Number, default: null },
  // Heatmap y modo
  heatmap:   { type: Boolean, default: false },
  heatMode:  { type: String, default: 'min' }, // 'min' | 'max'
  // 🔵 NUEVO: pintar solo extremos (min o max global)
  extremaOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
const close = () => emit('update:modelValue', false)

/* --------- Datos base (retro-compat o rectangular) --------- */
const body = computed(() => {
  if (Array.isArray(props.rowLabels) && Array.isArray(props.colLabels) && props.rowLabels.length) {
    return props.matrix
  }
  return props.matrix
})

const rowHeads = computed(() => {
  if (props.rowLabels?.length) return props.rowLabels.map((x,i) => String(x ?? `L${i+1}`))
  if (props.nodes?.length)     return props.nodes.map((x,i) => String(x ?? `N${i+1}`))
  return (body.value || []).map((_,i) => `N${i+1}`)
})

const colHeads = computed(() => {
  if (props.colLabels?.length) return props.colLabels.map((x,i) => String(x ?? `R${i+1}`))
  if (props.nodes?.length)     return props.nodes.map((x,i) => String(x ?? `N${i+1}`))
  const n = (body.value?.[0]?.length) || 0
  return Array.from({ length: n }, (_,i) => `N${i+1}`)
})

/* --------- Normalización para gradiente (modo clásico) --------- */
function flattenNumbers () {
  const out = []
  for (const r of (body.value || [])) {
    for (const v of (r || [])) {
      const n = Number(v)
      if (Number.isFinite(n)) out.push(n)
    }
  }
  return out
}
const minVal = computed(() => {
  const arr = flattenNumbers()
  return arr.length ? Math.min(...arr) : 0
})
const maxVal = computed(() => {
  const arr = flattenNumbers()
  return arr.length ? Math.max(...arr) : 1
})

/* --------- Estado/leyenda ---------- */
const matchSet = computed(() => new Set((props.matches || []).map(([i,j]) => `${i}-${j}`)))
const showLegend = computed(() => (props.matches?.length || props.heatmap || typeof props.total === 'number'))
const heatModeLabel = computed(() => props.heatMode === 'max' ? 'maximizar' : 'minimizar')

/* --------- Extremos (min/max global) --------- */
const extremeValue = computed(() => {
  const vals = flattenNumbers()
  if (!vals.length) return null
  return props.heatMode === 'max' ? Math.max(...vals) : Math.min(...vals)
})
const EPS = 1e-9
const extremeSet = computed(() => {
  const set = new Set()
  if (extremeValue.value == null) return set
  const tgt = extremeValue.value
  ;(body.value || []).forEach((row, i) => {
    (row || []).forEach((v, j) => {
      const n = Number(v)
      if (Number.isFinite(n) && Math.abs(n - tgt) < EPS) set.add(`${i}-${j}`)
    })
  })
  return set
})
function isExtreme (i,j) { return extremeSet.value.has(`${i}-${j}`) }
function isAssigned(i,j) { return matchSet.value.has(`${i}-${j}`) }

/* --------- clases/estilos de celdas --------- */
function cellClass(i, j) {
  const isMatch = isAssigned(i, j)
  const isExt   = props.extremaOnly && props.heatmap && isExtreme(i, j)
  return {
    match: isMatch,
    'is-extreme-min': isExt && props.heatMode === 'min',
    'is-extreme-max': isExt && props.heatMode === 'max'
  }
}

function colorFor(val) {
  // En modo "extremos solamente" anulamos gradiente
  if (!props.heatmap || props.extremaOnly) return null
  const num = Number(val)
  if (!Number.isFinite(num)) return null

  // Normalización [0,1]
  const minV = minVal.value
  const maxV = maxVal.value
  const t = (maxV === minV) ? 0 : (num - minV) / (maxV - minV)

  // Gradiente azul (mismo para min/max; solo cambia interpretación)
  const alpha = 0.10 + 0.35 * t   // 0.10 → 0.45
  return `rgba(94, 180, 255, ${alpha})`
}

function cellStyle(i, j, val) {
  const styles = {}

  // Fondo por gradiente (solo si NO estamos en "extremos solamente")
  const base = colorFor(val)
  if (base) styles.background = base

  // Resaltado de asignación (borde azul, compatible con extremos)
  if (isAssigned(i, j)) {
    styles.outline = '2px solid #5eb4ff'
    styles.boxShadow = 'inset 0 0 0 9999px rgba(94,180,255,.22)'
    styles.fontWeight = '700'
  }
  return styles
}
</script>

<style scoped lang="scss">
.overlay{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.45);display:grid;place-items:center}
.modal{
  display:grid;gap:12px;padding:14px 16px 16px;border-radius:12px;
  background:#2c2f3a;color:#e7e7ec;box-shadow:0 20px 44px rgba(0,0,0,.35);
  inline-size:fit-content;max-inline-size:92vw;max-block-size:85vh;
}
.header{display:flex;align-items:center;justify-content:center;position:relative}
.header h3{margin:0;font-weight:800}
.btn-icon{position:absolute;right:6px;top:2px;border:0;background:transparent;color:#bfc5d1;cursor:pointer}
.btn-icon:hover{color:#fff}

/* Leyenda */
.legend{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.chip{padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.15);font-weight:700;opacity:.9}
.chip.match{background:#20354d}
.chip.heat{background:#1e2b3a}
.chip.total{background:#38422e}

.table-wrap{max-inline-size:90vw;max-block-size:62vh;overflow:auto}

/* Tabla */
.matrix-table{border-collapse:collapse;border-spacing:0;inline-size:max-content;background:#2c2f3a;font-size:14px}
.matrix-table th,.matrix-table td{
  padding:6px 8px;text-align:center;border:1px solid rgba(255,255,255,.12);
  white-space:nowrap;min-inline-size:34px;color:#e7e7ec;
}
.matrix-table thead th{position:sticky;top:0;z-index:1;background:#3a3f4e;font-weight:700}
.matrix-table .row-head{position:sticky;left:0;background:#3a3f4e;text-align:left;padding-inline:10px;min-inline-size:42px}
.matrix-table .corner{position:sticky;left:0;top:0;z-index:2;background:#3a3f4e;min-inline-size:42px;border-right:1px solid rgba(255,255,255,.12)}

/* Asignadas */
.matrix-table td.match{
  position:relative;
  background:rgba(94,180,255,.18) !important;
}
.matrix-table td.match::after{
  content:'';
  position:absolute; inset:0;
  box-shadow:inset 0 0 0 2px #5eb4ff;
  border-radius:2px;
  pointer-events:none;
}

/* 🎨 Extremos con color único (no compiten con 'match') */
.matrix-table td.is-extreme-min{
  background:#2d4637 !important;   /* verde oscuro */
  color:#c9f7df !important;
  outline:2px solid #42d392;
}
.matrix-table td.is-extreme-max{
  background:#4a3b2b !important;   /* naranja oscuro */
  color:#ffe1c2 !important;
  outline:2px solid #ffb454;
}

/* Combinación: extremo + asignado (mantiene borde azul de match) */
.matrix-table td.match.is-extreme-min,
.matrix-table td.match.is-extreme-max{
  /* El borde azul del ::after de .match se mantiene por encima */
}

.actions{display:flex;justify-content:center}
.btn{background:#567c8d;color:#ecebe6;border:0;padding:8px 14px;border-radius:10px;cursor:pointer;font-weight:700}
.btn:hover{filter:brightness(1.05)}
</style>

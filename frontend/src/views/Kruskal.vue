<template>
  <section class="page">
    <div class="board-wrap">
      <!-- ===================== TOOLBAR ===================== -->
      <div class="toolbar">
        <div class="tools-left">
          <button class="tool" :class="{ 'is-active': nodeMode }" @click="toggleNodeMode">
            <i class="fa-regular fa-circle"></i> Nodo
          </button>
          <button class="tool" :class="{ 'is-active': connectMode }" @click="toggleConnectMode">
            <i class="fa-solid fa-link"></i> Conectar
          </button>
          <button class="tool" :class="{ 'is-active': moveMode }" @click="toggleMoveMode">
            <i class="fa-solid fa-hand"></i> Mover
          </button>
          <button class="tool" :class="{ 'is-active': deleteMode }" @click="toggleDeleteMode">
            <i class="fa-solid fa-eraser"></i> Borrar
          </button>
          <button class="tool" :class="{ 'is-active': textMode }" @click="toggleTextMode">
            <i class="fa-solid fa-pen"></i> Texto
          </button>
        </div>

        <div class="tools-right">
          <button
            class="tool tool-trigger"
            @click="showExport = true"
            aria-haspopup="dialog"
            :aria-expanded="showExport ? 'true' : 'false'"
            title="Exportar"
            type="button"
          >
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            Exportar
          </button>

          <label class="tool file" title="Importar JSON">
            <i class="fa-solid fa-file-import"></i> Importar JSON
            <input type="file" accept="application/json" @change="importJSON" />
          </label>
        </div>
      </div>

      <!-- ===================== PIZARRA ===================== -->
      <div
        class="board"
        ref="boardRef"
        :class="[themeClass, { 'no-grid': !showGrid }]"
        :style="boardStyle"
        role="region"
        aria-label="Pizarra de grafos"
      >
        <div ref="cyRef" class="graph-layer"></div>

        <!-- FAB derecha -->
        <button class="fab fab-clear" title="Limpiar pizarra" type="button" @click.stop="confirmClear">
          <i class="fa-solid fa-broom"></i>
        </button>
        <button class="fab" @click.stop="showPicker = true" title="Cambiar estilo" type="button">
          <i class="fa-solid fa-palette"></i>
        </button>

        <!-- FAB izquierda: KRUSKAL -->
        <button
          class="fab fab-left fab-left-top"
          title="Ejecutar Kruskal"
          type="button"
          @click.stop="openKruskalOptions"
        >
          <i class="fa-solid fa-tree"></i>
        </button>

        <!-- FAB izquierda inferior: MATRIZ -->
        <button class="fab fab-left" title="Matriz de adyacencia" type="button" @click.stop="openMatriz">
          <i class="fa-solid fa-table"></i>
        </button>
      </div>
    </div>

    <EstiloPizarra
      v-model="showPicker"
      :theme="theme"
      :color="color"
      :image="image"
      @confirm="applyTheme"
    />

    <ExportPopup
      v-model="showExport"
      title="Exportar pizarra"
      @select="handleExport"
    />

    <EdgePropsPopup
      v-model="showEdgeProps"
      :source-label="edgeCtx.sourceLabel"
      :target-label="edgeCtx.targetLabel"
      :loop="edgeCtx.isLoop"
      :default-weight="edgeCtx.defaultWeight"
      :initial-dir="edgeCtx.initialDir"
      @confirm="onEdgePropsConfirm"
    />

    <NodeNamePopup
      v-model="showNodeName"
      :default-name="nodeNameCtx.defaultName"
      @confirm="onNodeNameConfirm"
    />
    <NodePropsPopup
      v-model="showNodeProps"
      :default-name="nodePropsCtx.name"
      :default-color="nodePropsCtx.color"
      @confirm="onNodePropsConfirm"
    />

    <!-- Matriz de adyacencia (pinta solo el MST) -->
    <MatrizPopup
      v-model="showMatriz"
      :nodes="matrizLabels"
      :matrix="matrizValues"
      :matches="mstMatrixMatches"
      :total="mstTotal"
      :heatmap="false"
      :heat-mode="mstHeatMode"
    />

    <!-- Popup nombre archivo -->
    <NombreArchivoPopup
      v-model="showNamePopup"
      :default-name="suggestedBaseName"
      :ext="fileExtForType"
      @confirm="onNameConfirm"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import EstiloPizarra from '@/components/EstiloPizarra.vue'
import ExportPopup from '@/components/ExportPopup.vue'
import EdgePropsPopup from '@/components/EdgePropsPopup.vue'
import NodeNamePopup from '@/components/NodeNamePopup.vue'
import NodePropsPopup from '@/components/NodePropsPopup.vue'
import MatrizPopup from '@/components/MatrizPopup.vue'
import NombreArchivoPopup from '@/components/NombreArchivoPopup.vue'

import cytoscape from 'cytoscape'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

/* 🔸 Algoritmo de Kruskal */
import {
  kruskal,
  buildGraphFromCy,
  paintMstEdges,
  clearStyles
} from '@/algorithms/kruskal.js'

import { createCyAnimator } from '@/utils/cy-animator.js'

const cyRef = ref(null)
const boardRef = ref(null)
let cy = null
let animator = null

const swalColors = { confirmButtonColor: '#567c8d', cancelButtonColor: '#2f4156' }

/* 🔹 Estado del último MST (para la matriz) */
const lastMst = ref([])              // [{u,v,w}, ...]
const lastKruskalMode = ref('asc')   // 'asc' | 'desc'
const lastTotal = ref(null)          // peso total

/* =====================================================
   🟩 EJECUCIÓN DEL ALGORITMO DE KRUSKAL
===================================================== */
async function openKruskalOptions() {
  const { value: mode } = await Swal.fire({
    title: 'Ejecutar Kruskal',
    input: 'select',
    inputOptions: {
      asc: 'Árbol de expansión mínimo',
      desc: 'Árbol de expansión máximo'
    },
    inputPlaceholder: 'Selecciona el modo',
    showCancelButton: true,
    confirmButtonText: 'Ejecutar',
    cancelButtonText: 'Cancelar',
    ...swalColors
  })
  if (mode) await runKruskal(mode)
}

async function runKruskal(mode = 'asc') {
  const g = buildGraphFromCy(cy)
  if (!g.nodes.length || !g.edges.length) {
    await Swal.fire({
      icon: 'info',
      title: 'Grafo vacío',
      text: 'Agrega nodos y aristas antes de ejecutar Kruskal.',
      ...swalColors
    })
    return
  }

  // 🔹 Limpia rutas previas
  cy.elements().removeClass('highlight highlight-max')
  clearStyles(cy)

  const { mst, totalWeight } = kruskal(g, mode)

  // 🔹 Guardar MST para la matriz
  lastMst.value = mst || []
  lastKruskalMode.value = mode
  lastTotal.value = totalWeight ?? null

  if (!mst.length) {
    await Swal.fire({
      icon: 'info',
      title: 'Sin resultados',
      text: 'No se pudo construir un árbol de expansión (grafo posiblemente desconectado).',
      ...swalColors
    })
    return
  }

  // 🔹 Animación paso a paso
  for (const edge of mst) {
    const e = cy.$(
      `edge[source="${edge.u}"][target="${edge.v}"], edge[source="${edge.v}"][target="${edge.u}"]`
    )
    if (!e.empty()) {
      await animator.animateEdges(e, {
        color: mode === 'desc' ? '#ff9a3d' : '#57c3d1',
        edgeDuration: 220,
        nodeDuration: 200,
        step: 100
      })
    }
  }

  // 🔹 Aplica color final según tipo
  paintMstEdges(cy, mst, mode === 'desc')

  await Swal.fire({
    icon: 'success',
    title: mode === 'desc' ? 'Árbol de expansión máximo' : 'Árbol de expansión mínimo',
    html: `Se seleccionaron <b>${mst.length}</b> aristas.<br>Peso total: <b>${totalWeight.toFixed(
      2
    )}</b>`,
    ...swalColors
  })
}

/* =====================================================
   🟩 MODO DE EDICIÓN / NODOS / ARISTAS
===================================================== */
const nodeMode = ref(false)
const connectMode = ref(false)
const moveMode = ref(false)
const deleteMode = ref(false)
const textMode = ref(false)
let connectFromId = null

let uid = 1
const nextId = (pfx) => `${pfx}${uid++}`

/* Doble tap */
let lastTap = { id: null, t: 0 }
const isDoubleTap = (id) => {
  const now = Date.now()
  const ok = lastTap.id === id && (now - lastTap.t) < 300
  lastTap = { id, t: now }
  return ok
}

const swalBase = { confirmButtonColor: '#567c8d', cancelButtonColor: '#2f4156' }

/* ===================== EDGE PROPS POPUP ===================== */
const showEdgeProps = ref(false)
const edgeCtx = ref({
  sId: null, tId: null, editId: null, isLoop: false,
  sourceLabel: '', targetLabel: '', defaultWeight: '1', initialDir: 'undirected'
})

function openEdgeProps({ sId, tId, editId = null, defaultWeight = '1', initialDir = 'undirected' }) {
  const s = cy.$id(sId)
  const t = cy.$id(tId)
  edgeCtx.value = {
    sId, tId, editId, isLoop: sId === tId,
    sourceLabel: s?.data('label') || sId,
    targetLabel: t?.data('label') || tId,
    defaultWeight: String(defaultWeight ?? '1'),
    initialDir
  }
  showEdgeProps.value = true
}

async function onEdgePropsConfirm({ weight /*, dir */ }) {
  const { sId, tId, editId } = edgeCtx.value
  const w = Number(weight)
  if (Number.isNaN(w)) {
    await Swal.fire({
      icon: 'warning',
      title: 'Peso inválido',
      text: 'Introduce un valor numérico válido.',
      ...swalBase
    })
    return
  }
  if (editId) {
    const ele = cy.$id(editId)
    if (!ele.empty()) ele.data({ weight, source: sId, target: tId })
  } else {
    ensureEdge(sId, tId, weight)
  }
  showEdgeProps.value = false
}

/* ===================== NODOS ===================== */
const showNodeName = ref(false)
const nodeNameCtx = ref({ mode: 'create', position: null, nodeId: null, defaultName: 'Nodo' })

function openNodeNameForCreate(position, defaultName = 'Nodo') {
  nodeNameCtx.value = { mode: 'create', position, nodeId: null, defaultName }
  showNodeName.value = true
}
function openNodeNameForEdit(nodeId, defaultName) {
  nodeNameCtx.value = { mode: 'edit', nodeId, position: null, defaultName: defaultName || 'Nodo' }
  showNodeName.value = true
}

function onNodeNameConfirm(name) {
  const { mode, position, nodeId } = nodeNameCtx.value
  if (mode === 'create' && position) {
    const base = '#57c3d1'
    const id = nextId('n')
    cy.add({
      group: 'nodes',
      data: { id, label: name, color: base, borderColor: darkenColor(base, 28) },
      position
    })
    const n = cy.$id(id)
    resizeNodeToLabel(n)
  } else if (mode === 'edit' && nodeId) {
    const n = cy.$id(nodeId)
    n.data('label', name)
    resizeNodeToLabel(n)
  }
  showNodeName.value = false
}

/* ===================== PROPIEDADES DE NODOS ===================== */
const showNodeProps = ref(false)
const nodePropsCtx = ref({ nodeId: null, name: '', color: '#57c3d1' })

function openNodeProps(node) {
  nodePropsCtx.value = {
    nodeId: node.id(),
    name: node.data('label') || '',
    color: node.data('color') || '#57c3d1'
  }
  showNodeProps.value = true
}

function onNodePropsConfirm({ name, color }) {
  const { nodeId } = nodePropsCtx.value
  const n = cy.$id(nodeId)
  if (n.empty()) return
  if (name) {
    n.data('label', name.trim())
    resizeNodeToLabel(n)
  }
  if (color) {
    n.data({ color, borderColor: darkenColor(color, 28) })
  }
  showNodeProps.value = false
}

/* =====================================================
   🟩 MATRIZ DE ADYACENCIA (MST)
===================================================== */
const showMatriz = ref(false)
const matrizLabels = ref([])
const matrizValues = ref([])
const mstMatrixMatches = ref([]) // celdas [i,j] que pertenecen al MST
const mstTotal = ref(null)
const mstHeatMode = ref('min')

function computeAdjacency() {
  if (!cy) return { labels: [], matrix: [], idIndex: {} }
  const list = cy.nodes().filter(n => !n.hasClass('text-block'))
  const ordered = list.sort((a, b) =>
    (a.data('label') || a.id()).localeCompare(
      (b.data('label') || b.id()),
      'es',
      { numeric: true, sensitivity: 'base' }
    )
  )

  const labels = ordered.map(n => (n.data('label') || '').toString().trim() || n.id())
  const idx = Object.fromEntries(ordered.map((n, i) => [n.id(), i]))
  const n = ordered.length
  const M = Array.from({ length: n }, () => Array(n).fill(0))

  cy.edges().forEach(e => {
    const s = idx[e.source().id()]
    const t = idx[e.target().id()]
    if (s == null || t == null) return
    const w = Number(e.data('weight')) || 0
    M[s][t] = w
    M[t][s] = w // ✅ grafo no dirigido
  })

  return { labels, matrix: M, idIndex: idx }
}

function openMatriz() {
  const { labels, matrix, idIndex } = computeAdjacency()
  matrizLabels.value = labels
  matrizValues.value = matrix

  const matches = []
  if (lastMst.value?.length) {
    lastMst.value.forEach(({ u, v }) => {
      const i = idIndex[u]
      const j = idIndex[v]
      if (i != null && j != null) {
        matches.push([i, j])
        matches.push([j, i]) // simétrico
      }
    })
  }
  mstMatrixMatches.value = matches
  mstTotal.value = typeof lastTotal.value === 'number' ? lastTotal.value : null
  mstHeatMode.value = lastKruskalMode.value === 'desc' ? 'max' : 'min'

  showMatriz.value = true
}

/* =====================================================
   🟩 CYTOSCAPE INIT
===================================================== */
onMounted(() => {
  cy = cytoscape({
    container: cyRef.value,
    layout: { name: 'preset' },
    wheelSensitivity: 0.25,
    minZoom: 0.1,
    maxZoom: 3,
    style: [
      { selector: 'node.highlight-max', style: { 'background-color': '#ff9a3d', 'border-color': '#cc6a00' } },
      { selector: 'edge.highlight-max', style: { 'line-color': '#ff9a3d', 'width': 3 } },
      {
        selector: 'node',
        style: {
          'shape': 'ellipse',
          'width': 56,
          'height': 56,
          'background-color': 'data(color)',
          'border-width': 2,
          'border-color': 'data(borderColor)',
          'label': 'data(label)',
          'color': '#0f1120',
          'font-family': 'Poppins, sans-serif',
          'font-weight': 700,
          'font-size': 12,
          'text-valign': 'center',
          'text-halign': 'center',
          'text-wrap': 'wrap',
          'text-max-width': 120
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#000',
          'curve-style': 'bezier',
          // 🔁 Sin dirección (grafo no dirigido)
          'target-arrow-shape': 'none',
          'source-arrow-shape': 'none',
          'label': 'data(weight)',
          'color': '#fff',
          'font-size': 12,
          'text-wrap': 'wrap',
          'text-background-color': '#2c2f3a',
          'text-background-opacity': 0.85,
          'text-background-padding': 2,
          'text-rotation': 'autorotate'
        }
      },
      { selector: 'node.highlight', style: { 'background-color': '#5eb4ff', 'border-color': '#2a7fc0' } },
      { selector: 'edge.highlight', style: { 'line-color': '#5eb4ff', 'width': 3 } }
    ]
  })

  animator = createCyAnimator(cy)

  /* 🖱️ Eventos */
  cy.on('tap', (evt) => {
    if (evt.target !== cy) return
    if (nodeMode.value) return openNodeNameForCreate(evt.position)
    if (textMode.value) return addTextAt(evt.position)
    if (connectMode.value && connectFromId) clearPendingConnect()
  })

  cy.on('tap', 'node,edge', async (evt) => {
    const ele = evt.target
    if (deleteMode.value) {
      const tipo = ele.isEdge() ? 'arista' : ele.hasClass('text-block') ? 'texto' : 'nodo'
      const { isConfirmed } = await Swal.fire({
        title: `¿Eliminar ${tipo}?`,
        icon: 'warning',
        showCancelButton: true,
        ...swalColors
      })
      if (isConfirmed) cy.remove(ele)
      return
    }

    if (connectMode.value) {
      if (ele.isEdge() && isDoubleTap(ele.id())) {
        const sId = ele.source().id()
        const tId = ele.target().id()
        openEdgeProps({ sId, tId, editId: ele.id(), defaultWeight: ele.data('weight') ?? '1' })
        return
      }
      if (ele.isNode() && !ele.hasClass('text-block')) {
        const clickedId = ele.id()
        if (!connectFromId) {
          connectFromId = clickedId
          cy.$id(clickedId).addClass('edge-pending')
        } else {
          const sId = connectFromId
          const tId = clickedId
          cy.$id(sId).removeClass('edge-pending')
          connectFromId = null
          openEdgeProps({ sId, tId, defaultWeight: '1' })
        }
      }
      return
    }

    if (ele.isNode() && !ele.hasClass('text-block')) {
      openNodeProps(ele)
      return
    }

    if (ele.isEdge() && isDoubleTap(ele.id())) {
      const sId = ele.source().id()
      const tId = ele.target().id()
      openEdgeProps({ sId, tId, editId: ele.id(), defaultWeight: ele.data('weight') ?? '1' })
    }
  })

  const onKey = (e) => {
    if (e.key === 'Escape') {
      nodeMode.value =
        connectMode.value =
        deleteMode.value =
        moveMode.value =
        textMode.value =
          false
      clearPendingConnect()
      applyGrabRules()
    }
  }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

  applyGrabRules()
})

onBeforeUnmount(() => cy?.destroy())

/* =====================================================
   🟩 UTILIDADES VARIAS
===================================================== */
function resizeNodeToLabel(node) {
  if (!node || node.hasClass('text-block')) return
  const label = (node.data('label') || '').toString()
  const ctx = getMeasureCtx()
  ctx.font = '700 12px Poppins, sans-serif'
  const textW = Math.ceil(ctx.measureText(label || 'Nodo').width)
  const newW = Math.max(56, Math.min(textW + 24, 260))
  node.style('width', newW)
  node.style('text-max-width', Math.max(52, newW - 10))
}

let _measureCtx = null
function getMeasureCtx() {
  if (!_measureCtx) {
    const c = document.createElement('canvas')
    _measureCtx = c.getContext('2d')
  }
  return _measureCtx
}

function darkenColor(hex, percent = 25) {
  try {
    const h = hex.replace('#', '')
    const bigint = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16)
    let r = (bigint >> 16) & 255
    let g = (bigint >> 8) & 255
    let b = bigint & 255
    const p = Math.min(Math.max(percent, 0), 100) / 100
    r = Math.round(r * (1 - p)); g = Math.round(g * (1 - p)); b = Math.round(b * (1 - p))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  } catch { return '#167293' }
}

/* 🔁 Arista sin dirección: evita duplicar A→B y B→A */
function ensureEdge(source, target, weight) {
  const w = Number(weight)
  const existing = cy.$(
    `edge[source="${source}"][target="${target}"], edge[source="${target}"][target="${source}"]`
  )

  if (existing.empty()) {
    cy.add({
      group: 'edges',
      data: {
        id: `e_${source}_${target}_${Date.now()}`,
        source,
        target,
        weight: Number.isNaN(w) ? 0 : w
      }
    })
  } else {
    existing.data('weight', Number.isNaN(w) ? 0 : w)
  }
}

function clearPendingConnect() {
  if (connectFromId) {
    cy.$id(connectFromId).removeClass('edge-pending')
    connectFromId = null
  }
}

async function addTextAt(position) {
  const { isConfirmed, value } = await Swal.fire({
    title: 'Texto',
    input: 'textarea',
    inputPlaceholder: 'Escribe aquí…',
    showCancelButton: true,
    ...swalColors
  })
  if (isConfirmed) {
    const text = (value ?? '').toString().trim()
    if (text) {
      const id = nextId('t')
      cy.add({ group: 'nodes', data: { id, text }, position, classes: 'text-block' })
    }
  }
}

/* =====================================================
   🟩 MODOS / ESTILO / EXPORTACIÓN
===================================================== */
function toggleNodeMode() {
  nodeMode.value = !nodeMode.value
  if (nodeMode.value) connectMode.value = deleteMode.value = moveMode.value = textMode.value = false
  applyGrabRules()
}
function toggleDeleteMode() {
  deleteMode.value = !deleteMode.value
  if (deleteMode.value) nodeMode.value = connectMode.value = moveMode.value = textMode.value = false
  applyGrabRules()
}
function toggleConnectMode() {
  connectMode.value = !connectMode.value
  if (connectMode.value) {
    nodeMode.value = deleteMode.value = moveMode.value = textMode.value = false
  } else {
    clearPendingConnect()
  }
  applyGrabRules()
}
function toggleMoveMode() {
  moveMode.value = !moveMode.value
  if (moveMode.value) nodeMode.value = connectMode.value = deleteMode.value = textMode.value = false
  applyGrabRules()
}
function toggleTextMode() {
  textMode.value = !textMode.value
  if (textMode.value) nodeMode.value = connectMode.value = deleteMode.value = moveMode.value = false
  applyGrabRules()
}

function applyGrabRules() {
  if (!cy) return
  const anySpecial = nodeMode.value || connectMode.value || deleteMode.value || textMode.value
  if (moveMode.value || !anySpecial) cy.nodes().grabify()
  else cy.nodes().ungrabify()
}

/* =====================================================
   🟩 LIMPIAR PIZARRA
===================================================== */
async function confirmClear(e) {
  e?.stopPropagation?.()
  const { isConfirmed } = await Swal.fire({
    title: 'Limpiar pizarra',
    text: 'Esto eliminará todos los nodos y aristas.',
    icon: 'warning',
    showCancelButton: true,
    ...swalColors
  })
  if (isConfirmed) {
    cy?.elements().remove()
    clearStyles(cy)
    clearPendingConnect()
    nodeMode.value = connectMode.value = deleteMode.value = moveMode.value = textMode.value = false

    // reset MST
    lastMst.value = []
    lastKruskalMode.value = 'asc'
    lastTotal.value = null
    mstMatrixMatches.value = []
    mstTotal.value = null
    mstHeatMode.value = 'min'

    applyGrabRules()
  }
}

/* =====================================================
   🎨 ESTILO PIZARRA Y EXPORTACIÓN / IMPORTACIÓN
===================================================== */
const theme = ref('grid')
const color = ref('#fff7ef')
const image = ref('')
const showGrid = ref(true)
const showPicker = ref(false)
const showExport = ref(false)

/* Tema y estilo de fondo dinámico */
const themeClass = computed(() => `theme-${theme.value}`)
const boardStyle = computed(() => ({
  '--board-bg': color.value,
  '--board-image': image.value ? `url("${image.value}")` : 'none'
}))

function applyTheme({ theme: t, color: c, image: img }) {
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

function toggleGrid() {
  showGrid.value = !showGrid.value
}

/* ===================== EXPORTACIÓN / IMPORTACIÓN ===================== */

function getBoardBg() {
  return color.value || '#ffffff'
}

/* --- Utilidades base --- */
function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], { type: mime })
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/* --- Captura de pizarra --- */
async function cyPngBlob(opts = {}) {
  try {
    return await cy.png({
      output: 'blob-promise',
      full: true,
      scale: opts.scale ?? 2,
      bg: opts.bg ?? getBoardBg()
    })
  } catch (e) {
    const dataUrl = cy.png({
      full: true,
      scale: opts.scale ?? 2,
      bg: opts.bg ?? getBoardBg()
    })
    return dataURLtoBlob(dataUrl)
  }
}

/* --- Canvas de matriz --- */
function renderMatrixCanvas(labels, matrix, { scale = 2 } = {}) {
  const n = labels.length
  if (n === 0) {
    const c = document.createElement('canvas')
    c.width = 600
    c.height = 140
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#2c2f3a'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = '#e7e7ec'
    ctx.font = '700 18px Poppins, sans-serif'
    ctx.fillText('Matriz de adyacencia (vacía)', 16, 70)
    return c
  }

  const tmp = document.createElement('canvas').getContext('2d')
  tmp.font = '700 14px Poppins, sans-serif'
  const pad = 12
  const rowH = 28
  const headH = 32

  let labelW = 42
  labels.forEach(l => {
    labelW = Math.max(labelW, Math.ceil(tmp.measureText(String(l)).width) + pad)
  })

  let numW = 28
  matrix.forEach(r =>
    r.forEach(v => {
      numW = Math.max(numW, Math.ceil(tmp.measureText(String(v)).width) + pad)
    })
  )

  const w = labelW + n * numW
  const h = headH + n * rowH
  const c = document.createElement('canvas')
  c.width = Math.round(w * scale)
  c.height = Math.round(h * scale)
  const ctx = c.getContext('2d')
  ctx.scale(scale, scale)
  ctx.fillStyle = '#2c2f3a'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#3a3f4e'
  ctx.fillRect(0, 0, w, headH)
  ctx.fillRect(0, 0, labelW, h)

  ctx.strokeStyle = 'rgba(255,255,255,.14)'
  ctx.lineWidth = 1
  for (let j = 0; j <= n; j++) {
    const x = labelW + j * numW + 0.5
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let i = 0; i <= n; i++) {
    const y = headH + i * rowH + 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  ctx.fillStyle = '#e7e7ec'
  ctx.textBaseline = 'middle'
  ctx.font = '700 14px Poppins, sans-serif'
  for (let j = 0; j < n; j++) {
    const text = String(labels[j])
    const x = labelW + j * numW + numW / 2
    ctx.fillText(text, x - ctx.measureText(text).width / 2, headH / 2)
  }
  for (let i = 0; i < n; i++) {
    const y = headH + i * rowH + rowH / 2
    ctx.fillText(String(labels[i]), 8, y)
  }

  ctx.font = '600 14px Poppins, sans-serif'
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const val = String(matrix[i][j])
      const x = labelW + j * numW + numW / 2
      const y = headH + i * rowH + rowH / 2
      ctx.fillText(val, x - ctx.measureText(val).width / 2, y)
    }
  }
  return c
}

/* --- Composición vertical de pizarra + matriz --- */
function composeVerticalCanvas(topCanvas, bottomCanvas, gap = 16) {
  const w = Math.max(topCanvas.width, bottomCanvas.width)
  const h = topCanvas.height + gap + bottomCanvas.height
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.fillStyle = getBoardBg()
  ctx.fillRect(0, 0, w, h)
  const topX = Math.round((w - topCanvas.width) / 2)
  const bottomX = Math.round((w - bottomCanvas.width) / 2)
  ctx.drawImage(topCanvas, topX, 0)
  ctx.drawImage(bottomCanvas, bottomX, topCanvas.height + gap)
  return c
}

/* ======= SERIALIZAR / EXPORTAR ======= */
function serializeGraph() {
  const nodes = cy.nodes().map(n => {
    let classes = n.classes()
    classes = classes.filter(
      c => c === 'highlight' || c === 'highlight-max' || c === 'text-block'
    )

    return {
      id: n.id(),
      label: n.data('label') ?? '',
      color: n.data('color') ?? '#57c3d1',
      borderColor: n.data('borderColor') ?? '#167293',
      text: n.hasClass('text-block') ? (n.data('text') ?? '') : undefined,
      classes,
      position: n.position()
    }
  })

  const edges = cy.edges().map(e => {
    let classes = e.classes()
    classes = classes.filter(c => c === 'highlight' || c === 'highlight-max')

    return {
      id: e.id(),
      source: e.source().id(),
      target: e.target().id(),
      weight: String(e.data('weight') ?? ''),
      classes
    }
  })

  const mstEdges = cy.edges('edge.highlight, edge.highlight-max').map(e => e.id())
  const hasMax = cy.edges('edge.highlight-max').length > 0

  return {
    meta: {
      version: 1,
      exportedAt: new Date().toISOString(),
      mstEdges,
      mstMode: hasMax ? 'desc' : 'asc'
    },
    board: {
      theme: theme.value,
      color: color.value,
      image: image.value,
      showGrid: showGrid.value
    },
    graph: { nodes, edges }
  }
}

function updateUidFromElements(nodes = [], edges = []) {
  let maxNum = uid
  const rx = /(\d+)$/
  ;[...nodes, ...edges].forEach(el => {
    const m = (el.id || '').match(rx)
    if (m) {
      maxNum = Math.max(maxNum, parseInt(m[1], 10) + 1)
    }
  })
  uid = Math.max(uid, maxNum)
}

function loadFromSerializable(obj) {
  const g = obj?.graph || obj?.elements || obj
  if (!g) throw new Error('Estructura inválida')

  const nodes = g.nodes || g?.elements?.nodes || []
  const edges = g.edges || g?.elements?.edges || []

  cy.startBatch()
  cy.elements().remove()

  if (obj.board) {
    theme.value = obj.board.theme ?? theme.value
    color.value = obj.board.color ?? color.value
    image.value = obj.board.image ?? image.value
    showGrid.value = obj.board.showGrid ?? showGrid.value
  }

  nodes.forEach(n => {
    const position = n.position || n?.data?.position || { x: 0, y: 0 }
    const data = {
      id: n.id,
      label: n.label ?? '',
      color: n.color ?? '#57c3d1',
      borderColor: n.borderColor ?? darkenColor(n.color ?? '#57c3d1', 28)
    }
    if (n.text) {
      data.text = n.text
    }

    const rawClasses = n.classes || n?.data?.classes || []
    const classes = Array.isArray(rawClasses)
      ? rawClasses.join(' ')
      : String(rawClasses).replace(/,/g, ' ').trim()

    cy.add({ group: 'nodes', data, position, classes })
  })

  edges.forEach(e => {
    const data = {
      id: e.id ?? `e_${e.source}_${e.target}_${Date.now()}`,
      source: e.source ?? e?.data?.source,
      target: e.target ?? e?.data?.target,
      weight: String(e.weight ?? e?.data?.weight ?? '')
    }

    const rawClasses = e.classes || e?.data?.classes || []
    const classes = Array.isArray(rawClasses)
      ? rawClasses.join(' ')
      : String(rawClasses).replace(/,/g, ' ').trim()

    cy.add({ group: 'edges', data, classes })
  })

  cy.endBatch()

  cy.style().update()
  cy.fit(undefined, 24)
  updateUidFromElements(nodes, edges)
  cy.nodes().forEach(n => resizeNodeToLabel(n))

  if (obj.meta?.mstMode === 'desc') {
    const anyMax = cy.$('.highlight-max').length
    const anyMin = cy.$('.highlight').length
    if (!anyMax && anyMin) {
      cy.edges('.highlight').forEach(e => {
        e.removeClass('highlight')
        e.addClass('highlight-max')
      })
      cy.nodes('.highlight').forEach(n => {
        n.removeClass('highlight')
        n.addClass('highlight-max')
      })
    }
  }

  requestAnimationFrame(() => {
    const maxNodes = cy.$('node.highlight-max')
    const maxEdges = cy.$('edge.highlight-max')
    const minNodes = cy.$('node.highlight')
    const minEdges = cy.$('edge.highlight')

    if (maxNodes.length || maxEdges.length || minNodes.length || minEdges.length) {
      maxNodes.forEach(n => {
        n.style({
          'background-color': '#ff9a3d',
          'border-color': '#cc6a00',
          'transition-property': 'none'
        })
      })
      maxEdges.forEach(e => {
        e.style({
          'line-color': '#ff9a3d',
          'width': 3,
          'transition-property': 'none'
        })
      })

      minNodes.forEach(n => {
        n.style({
          'background-color': '#5eb4ff',
          'border-color': '#2a7fc0',
          'transition-property': 'none'
        })
      })
      minEdges.forEach(e => {
        e.style({
          'line-color': '#5eb4ff',
          'width': 3,
          'transition-property': 'none'
        })
      })

      cy.style().update()
      setTimeout(() => cy.style().update(), 150)
    }
  })
}

/* ======= IMPORTAR JSON (restaura MST + colores de nodos) ======= */
async function importJSON(ev) {
  const file = ev?.target?.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const obj = JSON.parse(text)

    const { isConfirmed } = await Swal.fire({
      title: 'Importar JSON',
      text: 'Esto reemplazará el contenido actual de la pizarra.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Importar',
      cancelButtonText: 'Cancelar',
      ...swalColors
    })
    if (!isConfirmed) return

    loadFromSerializable(obj)

    if (obj.meta?.mstEdges?.length) {
      const isMax = obj.meta.mstMode === 'desc'
      await Swal.fire({
        icon: 'success',
        title: isMax
          ? 'Árbol de expansión máximo restaurado'
          : 'Árbol de expansión mínimo restaurado',
        text: `Se restauró la ruta con ${obj.meta.mstEdges.length} aristas.`,
        ...swalColors
      })
    } else {
      await Swal.fire({
        icon: 'success',
        title: 'Importación completada',
        text: 'El grafo se cargó correctamente.',
        ...swalColors
      })
    }

    ev.target.value = ''
  } catch (err) {
    console.error(err)
    Swal.fire({
      icon: 'error',
      title: 'Error al importar',
      text: 'Archivo JSON inválido o dañado.',
      ...swalColors
    })
  }
}

/* --- Integración con popup de exportación --- */
const showNamePopup = ref(false)
const pendingExportType = ref(null)
const fileExtForType = computed(() => {
  return pendingExportType.value === 'image'
    ? 'png'
    : pendingExportType.value === 'pdf'
    ? 'pdf'
    : pendingExportType.value === 'json'
    ? 'json'
    : 'png'
})

const suggestedBaseName = computed(() => defaultBaseName())

function defaultBaseName() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const y = now.getFullYear()
  const m = pad(now.getMonth() + 1)
  const d = pad(now.getDate())
  const h = pad(now.getHours())
  const min = pad(now.getMinutes())
  return `grafo_${y}-${m}-${d}_${h}-${min}`
}

function handleExport(type) {
  pendingExportType.value = type
  showExport.value = false
  showNamePopup.value = true
}

async function onNameConfirm(base) {
  showNamePopup.value = false
  const type = pendingExportType.value
  pendingExportType.value = null
  if (type === 'image') await exportImagen(base)
  else if (type === 'json') await exportJSON(base)
}

async function exportJSON(base) {
  const data = serializeGraph()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(`${base}.json`, blob)
  await Swal.fire({
    icon: 'success',
    title: 'Exportación completada',
    text: 'El grafo se guardó correctamente en formato JSON.',
    ...swalColors
  })
}
</script>

<style scoped lang="scss">
$navbar-height: 72px;
$wrap-max: 1200px;

$page-bg: #0f1120;
$panel-bg: #2c2f3a;
$panel-border: rgba(255,255,255,.08);
$shadow: 0 10px 24px rgba(0,0,0,.25);

/* ===================== LAYOUT GENERAL ===================== */
.page {
  min-height: calc(100vh - $navbar-height);
  padding-top: calc($navbar-height + 16px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: $page-bg;
}

.board-wrap {
  width: 100%;
  max-width: $wrap-max;
  padding: 0 16px 48px;
}

/* ===================== TOOLBAR ===================== */
.toolbar {
  background: $panel-bg;
  border: 1px solid $panel-border;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: $shadow;
  backdrop-filter: blur(6px);
  color: #e7e7ec;

  .tools-left, .tools-right {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .tool {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    border: 1px solid $panel-border;
    background: rgba(255,255,255,.06);
    color: #e7e7ec;
    padding: 8px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: transform .05s, background .2s, border-color .2s;

    i { font-size: 14px; }
    &:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.18); }
    &:active { transform: translateY(1px); }

    &.file {
      position: relative;
      input[type="file"] {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }
    }

    &.is-active {
      background: #567c8d !important;
      color: #ecebe6;
      border-color: rgba(255,255,255,.28);
    }
  }
}

/* ===================== PIZARRA ===================== */
.board {
  margin-top: 14px;
  border-radius: 16px;
  border: 1px solid $panel-border;
  min-height: clamp(420px, 65vh, 720px);
  position: relative;
  overflow: hidden;
  box-shadow: $shadow;
  background-color: var(--board-bg, #ffffff);
  background-image:
    linear-gradient(to right, rgba(0,0,0,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,.05) 1px, transparent 1px);
  background-size: 16px 16px;

  .fab {
    position: absolute;
    right: 14px;
    bottom: 14px;
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: none;
    background: #567c8d;
    color: #ecebe6;
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 8px 22px rgba(0,0,0,.35);
    transition: transform .06s, filter .2s;
    z-index: 20;
    pointer-events: auto;

    &:hover { filter: brightness(1.05); }
    &:active { transform: translateY(1px); }
  }

  .fab-clear { bottom: 68px; background: #2f4156; z-index: 25; }
  .fab-left { left: 14px; right: auto; }
  .fab-left-top { left: 14px; right: auto; bottom: 68px; }

  &.no-grid { background-image: none !important; }
}

/* ===================== TEMAS ===================== */
.theme-plain {
  background-color: var(--board-bg, #ffffff);
  background-image: none;
}

.theme-grid {
  background-color: var(--board-bg, #fff7ef);
  background-image:
    linear-gradient(to right, rgba(0,0,0,.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,.08) 1px, transparent 1px);
  background-size: 20px 20px;
}

.theme-dotted {
  background-color: var(--board-bg, #ffffff);
  background-image: radial-gradient(circle, rgba(0,0,0,.32) 1.1px, transparent 1.1px);
  background-size: 14px 14px;
}

.theme-image {
  background-color: var(--board-bg, #ffffff);
  background-image: var(--board-image);
  background-size: cover;
  background-position: center;
}

/* ===================== CYTOSCAPE ===================== */
.graph-layer { position: absolute; inset: 0; z-index: 0; }

:deep(.swal2-html-container code) {
  background: #1e2430;
  color: #e7e7ec;
  padding: 2px 5px;
  border-radius: 4px;
}

/* Colores especiales para Kruskal */
:deep(.cytoscape-container) {
  .highlight-max {
    background-color: #ff9a3d !important;
    border-color: #cc6a00 !important;
    box-shadow: 0 0 18px rgba(255,154,61,0.6) !important;
  }
}

/* ===================== RESPONSIVE ===================== */
@media (max-width: 900px) {
  .toolbar {
    gap: 10px;
    .tools-right { margin-left: auto; }
  }
}

@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    .tools-left, .tools-right { justify-content: flex-start; }
  }
}
</style>

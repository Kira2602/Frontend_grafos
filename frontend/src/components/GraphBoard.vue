<template>
  <div class="graph-wrap">
    <div ref="container" class="graph"></div>
    <div class="hint">
      <span>Arrastra para mover • Doble click nodo = renombrar • Doble click arista = editar peso • Arrastra el manejador para crear aristas</span>
      <span v-if="deleteMode" class="danger">Modo borrar activo: clic en nodo/arista para eliminar</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineExpose } from 'vue'
import cytoscape from 'cytoscape'
import edgehandles from 'cytoscape-edgehandles'
import dagre from 'cytoscape-dagre'

cytoscape.use(edgehandles)
cytoscape.use(dagre)

const container = ref(null)
let cy = null
let eh = null

// estados de modo
let addNodeOnce = false
const deleteMode = ref(false)

let uid = 1
const nextId = () => `n${uid++}`

let lastTap = { id: null, t: 0 }
const isDoubleTap = (eleId) => {
  const now = Date.now()
  const dbl = lastTap.id === eleId && (now - lastTap.t) < 300
  lastTap = { id: eleId, t: now }
  return dbl
}

onMounted(() => {
  cy = cytoscape({
    container: container.value,
    wheelSensitivity: 0.25,
    minZoom: 0.1,
    maxZoom: 3,
    layout: { name: 'preset' },
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#57c3d1',
          'border-width': 2,
          'border-color': '#167293',
          'shape': 'round-rectangle',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': '#0f1120',
          'font-weight': 700,
          'text-wrap': 'wrap',
          'padding': '8px',
          'width': 'label',
          'height': 'label'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#e7e7ec',
          'target-arrow-color': '#e7e7ec',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(weight)',
          'text-background-color': '#2c2f3a',
          'text-background-opacity': 0.85,
          'text-background-padding': 2,
          'text-rotation': 'autorotate',
          'font-size': 12,
          'color': '#ffffff'
        }
      },
      { selector: ':selected', style: { 'border-color': '#fff', 'line-color': '#fff', 'target-arrow-color': '#fff' } }
    ]
  })

  eh = cy.edgehandles({
    handleNodes: 'node',
    handleSize: 10,
    handleColor: '#57c3d1',
    edgeType: () => 'flat',
    loopAllowed: () => true,
    snap: true,
    noEdgeEventsInDraw: true
  })

  cy.on('tap', (evt) => {
    if (evt.target === cy && addNodeOnce) {
      const p = evt.position
      cy.add({ group: 'nodes', data: { id: nextId(), label: 'Nodo' }, position: p })
      addNodeOnce = false
    }
  })

  cy.on('dragfree', 'node', () => {})

 //Borrar modo
  cy.on('tap', 'node,edge', (evt) => {
    const ele = evt.target
    if (deleteMode.value) {
      cy.remove(ele)
      return
    }

    // doble click para editar
    if (isDoubleTap(ele.id())) {
      if (ele.isNode()) {
        const name = prompt('Nombre del nodo', ele.data('label') || '')
        if (name !== null) ele.data('label', name.trim() || 'Nodo')
      } else {
        const w = prompt('Peso de la arista', ele.data('weight') ?? '1')
        if (w !== null) ele.data('weight', String(w).trim() || '1')
      }
    }
  })

  // al completar una arista, preguntar peso por defecto
  cy.on('ehcomplete', (_event, source, target, addedEdge) => {
    addedEdge.data('directed', true)
    addedEdge.data('weight', '1')
  })
})

onBeforeUnmount(() => {
  eh?.destroy()
  cy?.destroy()
})

function startAddNode() { addNodeOnce = true }
function toggleDeleteMode() { deleteMode.value = !deleteMode.value }
function layoutDagre() {
  cy.layout({ name: 'dagre', nodeSep: 40, rankSep: 60, rankDir: 'LR' }).run()
}
function exportJSON() {
  const nodes = cy.nodes().map(n => ({
    id: n.id(),
    label: n.data('label'),
    position: n.position()
  }))
  const edges = cy.edges().map(e => ({
    id: e.id(),
    source: e.data('source') ?? e.source().id(),
    target: e.data('target') ?? e.target().id(),
    weight: e.data('weight') ?? '1'
  }))
  return { nodes, edges }
}
function importJSON(payload) {
  cy.elements().remove()
  const els = []
  payload.nodes?.forEach(n => {
    els.push({ group: 'nodes', data: { id: n.id, label: n.label ?? 'Nodo' }, position: n.position })
  })
  payload.edges?.forEach(e => {
    els.push({ group: 'edges', data: { id: e.id || `${e.source}-${e.target}-${Math.random()}`, source: e.source, target: e.target, weight: e.weight ?? '1' } })
  })
  cy.add(els)
  cy.center()
}
async function toPNG() {
  const blob = await fetch(cy.png({ full: true, output: 'blob' })).then(r => r.blob())
  return blob
}

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

async function saveToServer(graphId = 1) {
  const data = exportJSON()
  const res = await fetch(`${API}/api/graphs/${graphId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('No se pudo guardar')
}

async function loadFromServer(graphId = 1) {
  const res = await fetch(`${API}/api/graphs/${graphId}`)
  if (!res.ok) throw new Error('No se pudo cargar')
  const data = await res.json()
  importJSON(data)
}

defineExpose({
  startAddNode, toggleDeleteMode, layoutDagre,
  exportJSON, importJSON, toPNG, saveToServer, loadFromServer
})
</script>

<style scoped>
.graph-wrap { position: relative; width: 100%; height: clamp(420px, 65vh, 720px); }
.graph { position: absolute; inset: 0; border-radius: 16px; overflow: hidden; }
.hint { position: absolute; left: 12px; bottom: 12px; right: 12px; font-size: 12px; color: #e7e7ec; display: flex; justify-content: space-between; pointer-events: none; }
.danger { color: #ffb4b4; font-weight: 700; }
</style>

<template>
  <section class="page">
    <div class="board-wrap">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="tools-left">
          <button class="tool" :class="{ 'is-active': nodeMode }" @click="toggleNodeMode">
            <i class="fa-regular fa-circle"></i> Nodo
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

      <!-- Pizarra -->
      <div
        class="board"
        ref="boardRef"
        :class="[themeClass, { 'no-grid': !showGrid }]"
        :style="boardStyle"
        role="region"
        aria-label="Pizarra de grafos"
      >
        <div ref="cyRef" class="graph-layer"></div>

        <button class="fab fab-clear" title="Limpiar pizarra" type="button" @click.stop="confirmClear">
          <i class="fa-solid fa-broom"></i>
        </button>
        <button class="fab" @click.stop="showPicker = true" title="Cambiar estilo" type="button">
          <i class="fa-solid fa-palette"></i>
        </button>

        <!-- FAB izquierda: Johnson / CPM -->
        <button
          class="fab fab-left fab-left-top"
          title="Johnson/CPM"
          type="button"
          @click.stop="openOptions"
        >
          <i class="fa-solid fa-route"></i>
        </button>

        <!-- FAB izquierda: Matriz -->
        <button class="fab fab-left" title="Matriz de adyacencia" type="button" @click.stop="openMatriz">
          <i class="fa-solid fa-table"></i>
        </button>
      </div>
    </div>

    <!-- Modales -->
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

    <!-- Matriz de adyacencia -->
    <MatrizPopup
      v-model="showMatriz"
      :nodes="matrizLabels"
      :matrix="matrizValues"
    />

    <!-- Popup: nombre de archivo -->
    <NombreArchivoPopup
      v-model="showNamePopup"
      :default-name="suggestedBaseName"
      :ext="fileExtForType"
      @confirm="onNameConfirm"
    />

    <!-- Opciones Johnson/CPM -->
    <JohnsonOptions
      v-model="showOptions"
      :nodes="nodesForOptions"
      @confirm="onOptionsConfirm"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import EstiloPizarra from '@/components/EstiloPizarra.vue'
import ExportPopup from '@/components/ExportPopup.vue'
import EdgePropsPopup from '@/components/EdgePropsPopup.vue'
import NodeNamePopup from '@/components/NodeNamePopup.vue'
import NodePropsPopup from '@/components/NodePropsPopup.vue'
import MatrizPopup from '@/components/MatrizPopup.vue'
import NombreArchivoPopup from '@/components/NombreArchivoPopup.vue'
import JohnsonOptions from '@/components/JohnsonOptions.vue'

import cytoscape from 'cytoscape'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

/* Algoritmos y utils */
import { johnson, reconstructPath, cpm, buildGraphFromCy } from '@/algorithms/johnson.js'
import { createCyAnimator } from '@/utils/cy-animator.js'

const cyRef = ref(null)
const boardRef = ref(null)
let cy = null
let animator = null

/* ===== MODAL DE OPCIONES ===== */
const showOptions = ref(false)
const nodesForOptions = computed(() => {
  if (!cy) return []
  return cy.nodes()
    .filter(n => !n.hasClass('text-block'))
    .map(n => ({ id: n.id(), label: (n.data('label')?.toString().split('\n')[0]) || n.id() }))
})
function openOptions(){ showOptions.value = true }

/* ===== MODOs ===== */
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

const swalColors = { confirmButtonColor: '#567c8d', cancelButtonColor: '#2f4156' }

/* ===== Edge props popup ===== */
const showEdgeProps = ref(false)
const edgeCtx = ref({
  sId: null, tId: null, editId: null, isLoop: false,
  sourceLabel: '', targetLabel: '', defaultWeight: '1', initialDir: 'forward'
})
function openEdgeProps({ sId, tId, editId = null, defaultWeight = '1', initialDir = 'forward' }) {
  const s = cy.$id(sId); const t = cy.$id(tId)
  edgeCtx.value = {
    sId, tId, editId, isLoop: sId === tId,
    sourceLabel: s?.data('label') || sId,
    targetLabel: t?.data('label') || tId,
    defaultWeight: String(defaultWeight ?? '1'),
    initialDir
  }
  showEdgeProps.value = true
}
function onEdgePropsConfirm({ weight, dir }) {
  const { sId, tId, editId, isLoop } = edgeCtx.value
  if (editId) {
    const ele = cy.$id(editId)
    if (!ele.empty()) {
      if (isLoop || dir === 'forward') ele.data({ weight, source: sId, target: tId })
      else if (dir === 'reverse')       ele.data({ weight, source: tId, target: sId })
      else {
        ele.data({ weight, source: sId, target: tId })
        const rev = cy.$(`edge[source="${tId}"][target="${sId}"]`)
        if (rev.empty()) cy.add({ group: 'edges', data: { id: `e_${tId}_${sId}_${Date.now()}`, source: tId, target: sId, weight } })
        else rev.data('weight', weight)
      }
    }
  } else {
    if (isLoop || dir === 'forward') ensureEdge(sId, tId, weight)
    else if (dir === 'reverse')      ensureEdge(tId, sId, weight)
    else { ensureEdge(sId, tId, weight); ensureEdge(tId, sId, weight) }
  }
  showEdgeProps.value = false
}

/* ===== NODOS ===== */
const showNodeName = ref(false)
const nodeNameCtx = ref({ mode:'create', position:null, nodeId:null, defaultName:'Nodo' })
function openNodeNameForCreate(position, defaultName='Nodo'){
  nodeNameCtx.value = { mode:'create', position, nodeId:null, defaultName }
  showNodeName.value = true
}
function openNodeNameForEdit(nodeId, defaultName){
  nodeNameCtx.value = { mode:'edit', nodeId, position:null, defaultName: defaultName||'Nodo' }
  showNodeName.value = true
}
function onNodeNameConfirm(name){
  const { mode, position, nodeId } = nodeNameCtx.value
  if (mode==='create' && position){
    const base = '#57c3d1'
    const id = nextId('n')
    cy.add({ group:'nodes', data:{ id, label:name, color:base, borderColor: darkenColor(base, 28) }, position })
    const n = cy.$id(id)
    resizeNodeToLabel(n)
  } else if (mode==='edit' && nodeId){
    const n = cy.$id(nodeId)
    n.data('label', name)
    resizeNodeToLabel(n)
  }
  showNodeName.value = false
}

/* Editar nodo */
const showNodeProps = ref(false)
const nodePropsCtx = ref({ nodeId:null, name:'', color:'#57c3d1' })
function openNodeProps(node){
  nodePropsCtx.value = { nodeId: node.id(), name: node.data('label') || '', color: node.data('color') || '#57c3d1' }
  showNodeProps.value = true
}
function onNodePropsConfirm({ name, color }){
  const { nodeId } = nodePropsCtx.value
  const n = cy.$id(nodeId)
  if (n.empty()) return
  if (name !== undefined) {
    n.data('label', (name || '').trim())
    resizeNodeToLabel(n)
  }
  if (color){
    n.data({ color, borderColor: darkenColor(color, 28) })
  }
  showNodeProps.value = false
}

/* ====== MATRIZ ====== */
const showMatriz   = ref(false)
const matrizLabels = ref([])
const matrizValues = ref([])

function computeAdjacency(){
  if (!cy) return { labels: [], matrix: [] }

  const list = cy.nodes().filter(n => !n.hasClass('text-block'))
  const ordered = list.sort((a, b) =>
    (a.data('label') || a.id()).localeCompare((b.data('label') || b.id()), 'es', { numeric: true, sensitivity: 'base' })
  )

  const labels = ordered.map(n => (n.data('label') || '').toString().trim() || n.id())
  const idx = Object.fromEntries(ordered.map((n, i) => [n.id(), i]))

  const n = ordered.length
  const M = Array.from({ length: n }, () => Array(n).fill(0))
  cy.edges().forEach(e => {
    const s = idx[e.source().id()]
    const t = idx[e.target().id()]
    if (s == null || t == null) return
    const w = Number((e.data('weight')||'').toString().split('\n').pop()) || 1
    M[s][t] += w
  })
  return { labels, matrix: M }
}

function openMatriz () {
  const { labels, matrix } = computeAdjacency()
  matrizLabels.value = labels
  matrizValues.value = matrix
  showMatriz.value = true
}

/* ===== Helpers de estilos ===== */
function baseNodeName(n){ return (n.data('label')?.toString().split('\n')[0]) || n.id() }
function clearCriticalStyles(){ cy.nodes().removeClass('critical'); cy.edges().removeClass('critical') }
function clearHighlightStyles(){ cy.nodes().removeClass('highlight'); cy.edges().removeClass('highlight') }

/* 🔄 Limpieza total antes de correr opciones */
function resetVisuals(){
  try { animator?.stop?.() } catch(_){}
  clearCriticalStyles()
  clearHighlightStyles()
  cy?.elements()?.removeStyle()
}

/* ✅ dos frames para asegurar repintado antes de animar */
const nextFrame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

/* ======= Handler del modal ======= */
async function onOptionsConfirm({ mode }){
  const g = buildGraphFromCy(cy)
  if (!g.nodes.length){
    await Swal.fire({ icon:'info', title:'No hay grafo', text:'Agrega nodos y aristas.', ...swalColors })
    return
  }

  resetVisuals()

  if (mode === 'max'){
    // ---- Máximo: CPM ----
    const res = cpm(g)
    if (!res){
      await Swal.fire({ icon:'warning', title:'El grafo no es acíclico', html:'La Ruta Crítica (CPM) requiere un <b>DAG</b>.', ...swalColors })
      return
    }
    const { E, L, slack, duration } = res

    // 1) construir camino crítico SIN pintar aún
    const critPath = buildCriticalPathFromSlack(E, slack)

    // 2) forzar layout/repintado y animar primero
    await nextTick()
    await nextFrame()
    if (critPath.length > 1){
      await animator?.animatePath(critPath, { color:'#f06277', step:120 })
    }

    // 3) ahora sí: etiquetar nodos/aristas y dejar estilos persistentes
    cy.nodes().forEach(n => {
      if (n.hasClass('text-block')) return
      n.data('label', `${baseNodeName(n)}\n${E[n.id()]} | ${L[n.id()]}`)
      resizeNodeToLabel(n)
    })

    cy.edges().forEach(e => {
      const u = e.source().id(), v = e.target().id()
      const w = Number((e.data('weight')||'').toString().split('\n').pop()) || 0
      const h = slack[`${u}->${v}`] ?? 0
      e.data('weight', `h=${h}\n${w}`)
      if (h === 0) {
        e.addClass('critical'); cy.$id(u).addClass('critical'); cy.$id(v).addClass('critical')
      }
    })

    // asegurar que el camino animado quede marcado como crítico
    for (let i=0;i<critPath.length-1;i++){
      const u = critPath[i], v = critPath[i+1]
      cy.$(`edge[source="${u}"][target="${v}"]`).addClass('critical')
      cy.$id(u).addClass('critical'); cy.$id(v).addClass('critical')
    }

    await Swal.fire({
      icon:'success',
      title:'¡Ruta Crítica (CPM)!',
      html:`D: <b>${duration}</b><br>La ruta crítica está resaltada.`,
      ...swalColors
    })
    return
  }

  // ---- Mínimo (Johnson) ----
  const { negCycle, dist, prev } = johnson(g)
  if (negCycle){
    await Swal.fire({ icon:'error', title:'Ciclo negativo detectado', text:'Johnson no puede ejecutarse con ciclos de peso negativo.', ...swalColors })
    return
  }

  const nodeOptions = {}
  g.nodes.forEach(id => {
    const label = (cy.$id(id).data('label')?.toString().split('\n')[0]) || id
    nodeOptions[id] = label
  })

  const originSwal = await Swal.fire({
    title: 'Camino mínimo',
    html: '<div style="text-align:left">Selecciona <b>origen</b> y, si quieres, un <b>destino</b> para resaltar el camino.</div>',
    input: 'select',
    inputOptions: nodeOptions,
    inputLabel: 'Origen',
    inputPlaceholder: '— seleccionar —',
    showCancelButton: true,
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar',
    ...swalColors
  })
  if (!originSwal.isConfirmed) return
  const source = originSwal.value
  if (!source) return

  const destSwal = await Swal.fire({
    title: '¿Destino?',
    input: 'select',
    inputOptions: { '': '(ninguno)', ...nodeOptions },
    inputValue: '',
    showCancelButton: true,
    confirmButtonText: 'Aplicar',
    cancelButtonText: 'Omitir',
    ...swalColors
  })
  if (!destSwal.isConfirmed) return
  const target = destSwal.value

  const dS = dist[source], pS = prev[source]

  cy.nodes().forEach(n => {
    if (n.hasClass('text-block')) return
    const d = dS[n.id()]
    const val = (d === Number.POSITIVE_INFINITY) ? '∞' : d
    n.data('label', `${baseNodeName(n)}\n${val} | ${val}`)
    resizeNodeToLabel(n)
  })

  cy.edges().forEach(e => {
    const u = e.source().id(), v = e.target().id()
    const w = Number((e.data('weight')||'').toString().split('\n').pop()) || 0
    const hasU = dS[u] !== Number.POSITIVE_INFINITY
    const hasV = dS[v] !== Number.POSITIVE_INFINITY
    const h = (hasU && hasV) ? (dS[v] - dS[u] - w) : 0
    e.data('weight', `h=${h}\n${w}`)
  })

  if (target){
    const path = reconstructPath(pS, source, target)
    if (path.length){
      await nextTick()
      await nextFrame()
      await animator?.animatePath(path, { color:'#5eb4ff', step:140 })
      for (let i=0;i<path.length-1;i++){
        const u = path[i], v = path[i+1]
        cy.$(`edge[source="${u}"][target="${v}"]`).addClass('highlight')
        cy.$id(u).addClass('highlight'); cy.$id(v).addClass('highlight')
      }
      await Swal.fire({ icon:'info', title:'Camino más corto', html:`<b>${source}</b> → <b>${target}</b><br>Distancia: <b>${dS[target]}</b>`, ...swalColors })
    } else {
      await Swal.fire({ icon:'info', title:'Sin ruta', text:`No hay camino de ${source} a ${target}.`, ...swalColors })
    }
  } else {
    await Swal.fire({ icon:'success', title:'Distancias calculadas', html:`Se etiquetaron distancias desde <b>${source}</b> y holguras en las aristas.`, ...swalColors })
  }
}

/* === Camino crítico a partir de E y slack (sin depender de clases) === */
function buildCriticalPathFromSlack(E, slack){
  // Construir lista de aristas críticas (h=0)
  const critAdj = new Map() // u -> array de v
  cy.edges().forEach(e => {
    const u = e.source().id(), v = e.target().id()
    const w = Number((e.data('weight')||'').toString().split('\n').pop()) || 0
    const h = slack[`${u}->${v}`]
    if (h === 0 && E[v] === E[u] + w){
      if (!critAdj.has(u)) critAdj.set(u, [])
      critAdj.get(u).push(v)
    }
  })

  if (critAdj.size === 0) return []

  // fuente: nodo con indegree == 0 dentro del subgrafo crítico (o E mínimo)
  const critNodes = new Set([...critAdj.keys(), ...[...critAdj.values()].flat()])
  let start = [...critNodes].filter(id => cy.$id(id).indegree() === 0)[0]
  if (!start){
    start = [...critNodes].sort((a,b)=>(E[a]??0)-(E[b]??0))[0]
  }
  if (!start) return []

  const path = [start]
  const seen = new Set([start])
  let cur = start
  while (critAdj.has(cur) && critAdj.get(cur).length){
    // Elegir siguiente por E más pequeño para determinismo
    const next = critAdj.get(cur).slice().sort((v1,v2)=>(E[v1]??0)-(E[v2]??0))[0]
    if (!next || seen.has(next)) break
    path.push(next); seen.add(next); cur = next
  }
  return path
}

/* ===================== CY INIT ===================== */
onMounted(() => {
  cy = cytoscape({
    container: cyRef.value,
    layout: { name:'preset' },
    wheelSensitivity: 0.25, minZoom:0.1, maxZoom:3,
    style: [
      { selector:'node', style:{
        'shape':'ellipse', 'width':56, 'height':56,
        'background-color':'data(color)',
        'border-width':2, 'border-color':'data(borderColor)',
        'label':'data(label)', 'color':'#0f1120',
        'font-family':'Poppins, sans-serif', 'font-weight':700, 'font-size':12,
        'text-valign':'center','text-halign':'center',
        'text-wrap':'wrap','text-max-width':120,
        'outline-width':0, 'overlay-opacity':0
      }},
      { selector:'node.text-block', style:{
        'shape':'round-rectangle','width':28,'height':20,'background-opacity':0,'border-width':0,
        'label':'data(text)','color':'#e7e7ec','font-size':13,'font-weight':600,'text-wrap':'wrap','text-max-width':220,
        'text-halign':'center','text-valign':'center','text-background-color':'#2c2f3a','text-background-opacity':0.85,'text-background-padding':6,'text-background-shape':'roundrectangle'
      }},
      { selector:'node:selected', style:{ 'border-color':'#ffffff', 'overlay-color':'#ffffff', 'overlay-opacity':0.18, 'overlay-padding':6 }},
      { selector:'node.edge-pending', style:{ 'overlay-color':'#567c8d', 'overlay-opacity':0.25, 'overlay-padding':8 }},

      /* Etiquetas de aristas */
      { selector:'edge', style:{
        'width':2,
        'line-color':'#000000',
        'target-arrow-color':'#000000',
        'target-arrow-shape':'triangle',
        'curve-style':'bezier',
        'label':'data(weight)',
        'text-wrap':'wrap',
        'text-background-color':'#2c2f3a',
        'text-background-opacity':0.85,
        'text-background-padding':2,
        'text-rotation':'autorotate',
        'text-margin-y': -2,
        'font-size':12,
        'color':'#ffffff'
      }},
      { selector:'edge:selected', style:{ 'line-color':'#000000','target-arrow-color':'#000000','width':3 }},

      /* 🎯 Estilos CPM - Ruta crítica */
      { selector:'node.critical', style:{
        'background-color':'#f06277',
        'border-color': '#c83c53',
        'color':'#0f1120',
        'box-shadow':'0 0 18px rgba(240,98,119,.55)'
      }},
      { selector:'edge.critical', style:{
        'line-color':'#f06277',
        'target-arrow-color':'#f06277',
        'width':3
      }},

      /* 🎯 Estilos Johnson - camino mínimo (destacado azul) */
      { selector:'node.highlight', style:{
        'background-color':'#5eb4ff',
        'border-color':'#2a7fc0'
      }},
      { selector:'edge.highlight', style:{
        'line-color':'#5eb4ff',
        'target-arrow-color':'#5eb4ff',
        'width':3
      }}
    ]
  })

  animator = createCyAnimator(cy)

  cy.on('tap', (evt) => {
    if (evt.target !== cy) return
    if (nodeMode.value){ openNodeNameForCreate(evt.position, 'Nodo'); return }
    if (textMode.value){ return addTextAt(evt.position) }
    if (connectMode.value && connectFromId) clearPendingConnect()
  })

  cy.on('tap', 'node,edge', async (evt) => {
    const ele = evt.target
    if (deleteMode.value) {
      const isEdge = ele.isEdge()
      const isText = ele.isNode() && ele.hasClass('text-block')
      const isGraphNode = ele.isNode() && !ele.hasClass('text-block')
      const tipo = isEdge ? 'arista' : (isText ? 'texto' : 'nodo')
      const detalle = isGraphNode ? 'Se eliminarán también sus aristas asociadas.' : (isText ? 'Se eliminará el bloque de texto.' : '')
      const nombre = isText ? (ele.data('text')?.toString().slice(0,40)||'Texto') : isGraphNode ? (ele.data('label')||'Nodo') : ''
      const { isConfirmed } = await Swal.fire({
        title: `¿Eliminar ${tipo}?`,
        text: nombre ? `${detalle ? detalle + ' ' : ''}(${nombre})` : detalle,
        icon: 'warning', showCancelButton: true, showCloseButton: true,
        confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', ...swalColors,
      })
      if (isConfirmed) cy.remove(ele)
      return
    }

    if (connectMode.value) {
      if (ele.isEdge() && isDoubleTap(ele.id())) {
        const sId = ele.source().id(), tId = ele.target().id()
        openEdgeProps({ sId, tId, editId: ele.id(), defaultWeight: ele.data('weight')??'1', initialDir:'forward' })
        return
      }
      if (ele.isNode() && !ele.hasClass('text-block')) {
        const clickedId = ele.id()
        if (!connectFromId){ connectFromId = clickedId; cy.$id(clickedId).addClass('edge-pending') }
        else {
          const sId = connectFromId, tId = clickedId
          cy.$id(sId).removeClass('edge-pending'); connectFromId = null
          openEdgeProps({ sId, tId, defaultWeight:'1', initialDir:'forward' })
        }
      }
      return
    }

    if (ele.isNode() && !ele.hasClass('text-block')) {
      openNodeProps(ele)
      return
    }

    if (ele.isNode() && ele.hasClass('text-block') && isDoubleTap(ele.id())) {
      await editTextNode(ele)
    }

    if (ele.isEdge() && isDoubleTap(ele.id())) {
      const sId = ele.source().id(), tId = ele.target().id()
      openEdgeProps({ sId, tId, editId: ele.id(), defaultWeight: ele.data('weight')??'1', initialDir:'forward' })
    }
  })

  const onKey = (e) => {
    if (e.key === 'Escape') {
      nodeMode.value = connectMode.value = deleteMode.value = moveMode.value = textMode.value = false
      clearPendingConnect(); applyGrabRules()
    }
  }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

  applyGrabRules()
})

onBeforeUnmount(() => { cy?.destroy() })

/* ===================== UTILES ===================== */
let _measureCtx = null
function getMeasureCtx(){
  if (!_measureCtx){
    const c = document.createElement('canvas')
    _measureCtx = c.getContext('2d')
  }
  return _measureCtx
}

function resizeNodeToLabel(node){
  if (!node || node.hasClass('text-block')) return
  const label = (node.data('label') || '').toString()
  const baseSize = 56
  const paddingX = 24
  const maxW = 260

  const ctx = getMeasureCtx()
  ctx.font = '700 12px "Poppins", sans-serif'
  const textW = Math.ceil(ctx.measureText(label || 'Nodo').width)
  const newW = Math.max(baseSize, Math.min(textW + paddingX, maxW))
  const newH = baseSize
  node.style('width', newW)
  node.style('height', newH)
  node.style('text-max-width', Math.max(52, newW - 10))
}

function ensureEdge(source, target, weight){
  const existing = cy.$(`edge[source="${source}"][target="${target}"]`)
  if (existing.empty()) cy.add({ group:'edges', data:{ id:`e_${source}_${target}_${Date.now()}`, source, target, weight } })
  else existing.data('weight', weight)
}
function clearPendingConnect(){ if (connectFromId){ cy.$id(connectFromId).removeClass('edge-pending'); connectFromId = null } }

async function addTextAt(position){
  const { isConfirmed, value } = await Swal.fire({
    title:'Texto', input:'textarea', inputLabel:'Contenido', inputPlaceholder:'Escribe aquí…',
    showCancelButton:true, showCloseButton:true, confirmButtonText:'Agregar', cancelButtonText:'Cancelar', ...swalColors
  })
  if (isConfirmed){
    const text = (value??'').toString().trim()
    if (text){ const id = nextId('t'); cy.add({ group:'nodes', data:{ id, text }, position, classes:'text-block' }) }
  }
}
async function editTextNode(ele){
  const { isConfirmed, value } = await Swal.fire({
    title:'Editar texto', input:'textarea', inputValue: ele.data('text')||'',
    showCancelButton:true, showCloseButton:true, confirmButtonText:'Guardar', cancelButtonText:'Cancelar', ...swalColors
  })
  if (isConfirmed) ele.data('text', (value??'').toString().trim())
}

function darkenColor(hex, percent=25){
  try{
    const h = hex.replace('#','')
    const bigint = parseInt(h.length===3 ? h.split('').map(x=>x+x).join('') : h, 16)
    let r = (bigint>>16)&255, g=(bigint>>8)&255, b=bigint&255
    const p = Math.min(Math.max(percent,0),100)/100
    r = Math.round(r*(1-p)); g = Math.round(g*(1-p)); b = Math.round(b*(1-p))
    const toHex = (n)=> n.toString(16).padStart(2,'0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }catch{ return '#167293' }
}

/* ===== estado pizarra ===== */
const theme = ref('grid')
const color = ref('#fff7ef')
const image = ref('')
const showGrid = ref(true)
const showPicker = ref(false)
const showExport = ref(false)
const themeClass = computed(() => `theme-${theme.value}`)
const boardStyle = computed(() => ({ '--board-bg': color.value, '--board-image': image.value ? `url("${image.value}")` : 'none' }))
const applyTheme = ({ theme: t, color: c, image: img }) => { if (t === 'image' && !img) { theme.value='plain'; color.value='#ffffff'; image.value=''; return } theme.value=t; if (c) color.value=c; image.value=img||'' }
const toggleGrid = () => (showGrid.value = !showGrid.value)
const noop = () => {}

/* ===================== EXPORT / IMPORT ===================== */
function getBoardBg(){ return color.value || '#ffffff' }

function dataURLtoBlob(dataUrl){
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], { type: mime })
}
function downloadBlob(filename, blob){
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}
async function cyPngBlob(opts = {}){
  try{
    return await cy.png({ output:'blob-promise', full:true, scale: opts.scale ?? 2, bg: opts.bg ?? getBoardBg() })
  }catch(e){
    const dataUrl = cy.png({ full:true, scale: opts.scale ?? 2, bg: opts.bg ?? getBoardBg() })
    return dataURLtoBlob(dataUrl)
  }
}
function canvasToBlob(canvas, type='image/png', quality){
  return new Promise(resolve => canvas.toBlob(b => resolve(b), type, quality))
}

function dottedTileDataUrl (size = 14, radius = 1.1, color = 'rgba(0,0,0,0.32)') {
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2)
  ctx.fill()
  return c.toDataURL('image/png')
}

async function captureBoardCanvas(scale = 2){
  let html2canvas
  try {
    const mod = await import('html2canvas')
    html2canvas = (mod && (mod.default || mod)) || null
  } catch (_) { return null }
  const boardEl = boardRef.value
  if (!boardEl || !html2canvas) return null

  const fabs = Array.from(boardEl.querySelectorAll('.fab'))
  const prev = fabs.map(el => el.style.visibility)
  fabs.forEach(el => { el.style.visibility = 'hidden' })

  let patched = false
  let prevBgImage = '', prevBgSize = '', prevBgRepeat = '', prevBgOrigin = '', prevBgPosition = ''
  if (theme.value === 'dotted') {
    patched = true
    prevBgImage = boardEl.style.backgroundImage
    prevBgSize = boardEl.style.backgroundSize
    prevBgRepeat = boardEl.style.backgroundRepeat
    prevBgOrigin = boardEl.style.backgroundOrigin
    prevBgPosition = boardEl.style.backgroundPosition

    const tile = dottedTileDataUrl(14, 1.1, 'rgba(0,0,0,0.32)')
    boardEl.style.backgroundImage = `url("${tile}")`
    boardEl.style.backgroundSize = '14px 14px'
    boardEl.style.backgroundRepeat = 'repeat'
    boardEl.style.backgroundOrigin = 'padding-box'
    boardEl.style.backgroundPosition = '0 0'
  }

  try {
    const canvas = await html2canvas(boardEl, { useCORS: true, backgroundColor: null, scale })
    return canvas
  } finally {
    if (patched) {
      boardEl.style.backgroundImage = prevBgImage
      boardEl.style.backgroundSize = prevBgSize
      boardEl.style.backgroundRepeat = prevBgRepeat
      boardEl.style.backgroundOrigin = prevBgOrigin
      boardEl.style.backgroundPosition = prevBgPosition
    }
    fabs.forEach((el, i) => { el.style.visibility = prev[i] || '' })
  }
}

/* ===== Render matriz a canvas ===== */
function renderMatrixCanvas(labels, matrix, { scale = 2 } = {}){
  const n = labels.length
  if (n === 0){
    const c = document.createElement('canvas')
    c.width = 600; c.height = 140
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#2c2f3a'; ctx.fillRect(0,0,c.width,c.height)
    ctx.fillStyle = '#e7e7ec'; ctx.font = '700 18px Poppins, sans-serif'
    ctx.fillText('Matriz de adyacencia (vacía)', 16, 70)
    return c
  }

  const tmp = document.createElement('canvas').getContext('2d')
  tmp.font = '700 14px Poppins, sans-serif'
  const rowLabelPad = 16
  const colLabelPad = 12
  const numPad   = 12
  const rowH = 28
  const headH = 32

  let labelW = 42
  labels.forEach(l => { labelW = Math.max(labelW, Math.ceil(tmp.measureText(String(l)).width) + rowLabelPad) })

  let maxNumW = 28
  matrix.forEach(r => r.forEach(v => { maxNumW = Math.max(maxNumW, Math.ceil(tmp.measureText(String(v)).width) + numPad) }))

  let maxHeaderW = 28
  labels.forEach(l => { maxHeaderW = Math.max(maxHeaderW, Math.ceil(tmp.measureText(String(l)).width) + colLabelPad) })

  const numW = Math.max(28, maxNumW, maxHeaderW)

  const w = labelW + n * numW
  const h = headH + n * rowH

  const c = document.createElement('canvas')
  c.width = Math.round(w * scale)
  c.height = Math.round(h * scale)
  const ctx = c.getContext('2d')
  ctx.scale(scale, scale)

  ctx.fillStyle = '#2c2f3a'; ctx.fillRect(0,0,w,h)
  ctx.fillStyle = '#3a3f4e'; ctx.fillRect(0,0,w,headH)
  ctx.fillRect(0,0,labelW,h)

  ctx.strokeStyle = 'rgba(255,255,255,.14)'
  ctx.lineWidth = 1
  for (let j=0;j<=n;j++){
    const x = Math.floor(labelW + j*numW) + .5
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let i=0;i<=n;i++){
    const y = Math.floor(headH + i*rowH) + .5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  ctx.beginPath(); ctx.moveTo(.5, 0); ctx.lineTo(.5, h); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, .5); ctx.lineTo(w, .5); ctx.stroke()

  ctx.fillStyle = '#e7e7ec'
  ctx.textBaseline = 'middle'
  ctx.font = '700 14px Poppins, sans-serif'
  for (let j=0;j<n;j++){
    const text = String(labels[j])
    const x = labelW + j*numW + numW/2
    ctx.fillText(text, x - ctx.measureText(text).width/2, headH/2)
  }
  for (let i=0;i<n;i++){
    const y = headH + i*rowH + rowH/2
    ctx.fillText(String(labels[i]), 8, y)
  }
  ctx.font = '600 14px Poppins, sans-serif'
  for (let i=0;i<n;i++){
    for (let j=0;j<n;j++){
      const val = String(matrix[i][j])
      const x = labelW + j*numW + numW/2
      const y = headH + i*rowH + rowH/2
      ctx.fillText(val, x - ctx.measureText(val).width/2, y)
    }
  }

  return c
}

/* Componer verticalmente */
function composeVerticalCanvas(topCanvas, bottomCanvas, gap = 16){
  const w = Math.max(topCanvas.width, bottomCanvas.width)
  const h = topCanvas.height + gap + bottomCanvas.height
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')

  ctx.fillStyle = getBoardBg()
  ctx.fillRect(0,0,w,h)

  const topX = Math.round((w - topCanvas.width)/2)
  const bottomX = Math.round((w - bottomCanvas.width)/2)
  ctx.drawImage(topCanvas, topX, 0)
  ctx.drawImage(bottomCanvas, bottomX, topCanvas.height + gap)
  return c
}

/* Obtener canvas de la pizarra */
async function getBoardCanvas(){
  const canvas = await captureBoardCanvas(2)
  if (canvas) return canvas
  const dataUrl = cy.png({ full:true, scale: 2, bg: getBoardBg() })
  const img = await new Promise(res => {
    const i = new Image()
    i.onload = () => res(i)
    i.src = dataUrl
  })
  const c = document.createElement('canvas')
  c.width = img.naturalWidth || img.width
  c.height = img.naturalHeight || img.height
  c.getContext('2d').drawImage(img,0,0)
  return c
}

/* ========= Nombre de archivo ========= */
const showNamePopup = ref(false)
const pendingExportType = ref(null)
const fileExtForType = computed(() => {
  return pendingExportType.value === 'image' ? 'png'
    : pendingExportType.value === 'pdf' ? 'pdf'
    : pendingExportType.value === 'json' ? 'json'
    : pendingExportType.value === 'zip'  ? 'zip'
    : 'png'
})
function defaultBaseName(){
  return `grafos-${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}`
}
const suggestedBaseName = computed(() => defaultBaseName())

/* ========= Exportar con nombre ========= */
async function getCompositePngBlob(){
  const boardCanvas = await getBoardCanvas()
  const { labels, matrix } = computeAdjacency()
  const matCanvas = renderMatrixCanvas(labels, matrix, { scale: 2 })
  const composed = composeVerticalCanvas(boardCanvas, matCanvas, 18)
  return await canvasToBlob(composed, 'image/png')
}

async function getPdfBlobWithMatrix(){
  let jsPDFmod = null
  try { jsPDFmod = await import('jspdf') } catch (_){}
  if (!jsPDFmod?.jsPDF) return null
  const { jsPDF } = jsPDFmod

  const boardCanvas = await getBoardCanvas()
  const { labels, matrix } = computeAdjacency()
  const matCanvas = renderMatrixCanvas(labels, matrix, { scale: 2 })

  const doc = new jsPDF({ orientation: boardCanvas.width >= boardCanvas.height ? 'l' : 'p', unit: 'pt', compress: true })
  const margin = 24
  const addCanvasAsImage = (canvas) => {
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const w = canvas.width
    const h = canvas.height
    const scale = Math.min((pageW - margin*2)/w, (pageH - margin*2)/h)
    const imgW = w * scale, imgH = h * scale
    const x = (pageW - imgW)/2, y = (pageH - imgH)/2
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, imgW, imgH)
  }

  addCanvasAsImage(boardCanvas)
  doc.addPage()
  addCanvasAsImage(matCanvas)

  return doc.output('blob')
}

async function exportImagen(base){
  const blob = await getCompositePngBlob()
  downloadBlob(`${base || defaultBaseName()}.png`, blob)
}

async function exportPDF(base){
  const pdfBlob = await getPdfBlobWithMatrix()
  if (pdfBlob){
    downloadBlob(`${base || defaultBaseName()}.pdf`, pdfBlob)
    return
  }
  await Swal.fire({
    icon:'info',
    title:'Falta dependencia',
    html:'No se encontró <code>jspdf</code>. Instala: <pre style="background:#1e2430;color:#e7e7ec;padding:8px;border-radius:8px">npm i jspdf html2canvas</pre>',
    ...swalColors
  })
}

function getJsonBlob(){
  const json = serializeGraph()
  return new Blob([JSON.stringify(json, null, 2)], { type:'application/json' })
}
async function exportJSON(base){
  const blob = getJsonBlob()
  downloadBlob(`${base || defaultBaseName()}.json`, blob)
}

async function exportZIP(base){
  let JSZipMod = null
  try { JSZipMod = await import('jszip') } catch (_){}
  if (!JSZipMod?.default){
    await Swal.fire({
      icon:'info',
      title:'Falta dependencia',
      html:'Para crear ZIP instala: <pre style="background:#1e2430;color:#e7e7ec;padding:8px;border-radius:8px">npm i jszip jspdf html2canvas</pre>',
      ...swalColors
    })
    return
  }
  const JSZip = JSZipMod.default
  const zip = new JSZip()
  const baseName = base || defaultBaseName()

  const pngBlob = await getCompositePngBlob()
  zip.file(`${baseName}.png`, pngBlob)

  const jsonBlob = getJsonBlob()
  zip.file(`${baseName}.json`, jsonBlob)

  const pdfBlob = await getPdfBlobWithMatrix()
  if (pdfBlob) {
    zip.file(`${baseName}.pdf`, pdfBlob)
  } else {
    zip.file('LEEME.txt',
      'No se incluyó el PDF porque no se encontró la librería "jspdf".\n' +
      'Instala: npm i jspdf html2canvas\n' +
      'El ZIP contiene PNG (con matriz) y JSON correctamente.\n')
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(`${baseName}.zip`, zipBlob)
}

/* ===== serialización / carga (MEJORADAS) ===== */
function serializeGraph(){
  const toStr = v => (v == null ? '' : String(v))

  // Formato estilo Cytoscape (elements.*)
  const elementsNodes = cy.nodes().map(n => ({
    data: {
      id: toStr(n.id()),
      label: toStr(n.data('label') ?? ''),
      color: toStr(n.data('color') ?? '#57c3d1'),
      borderColor: toStr(n.data('borderColor') ?? '#167293'),
      text: n.hasClass('text-block') ? toStr(n.data('text') ?? '') : undefined,
    },
    position: n.position(),
    classes: n.classes()
  }))

  const elementsEdges = cy.edges().map(e => ({
    data: {
      id: toStr(e.id()),
      source: toStr(e.source().id()),
      target: toStr(e.target().id()),
      weight: toStr(e.data('weight') ?? '')
    },
    classes: e.classes()
  }))

  // Formato "plano" (graph.*) para compatibilidad
  const graphNodes = elementsNodes.map(n => ({
    id: n.data.id,
    label: n.data.label,
    color: n.data.color,
    borderColor: n.data.borderColor,
    text: n.data.text,
    classes: n.classes,
    position: n.position
  }))

  const graphEdges = elementsEdges.map(e => ({
    id: e.data.id,
    source: e.data.source,
    target: e.data.target,
    weight: e.data.weight,
    classes: e.classes
  }))

  return {
    meta: { version: 2, exportedAt: new Date().toISOString() },
    board: { theme: theme.value, color: color.value, image: image.value, showGrid: showGrid.value },
    graph: { nodes: graphNodes, edges: graphEdges },
    elements: { nodes: elementsNodes, edges: elementsEdges }
  }
}

function updateUidFromElements(nodes = [], edges = []){
  let maxNum = uid
  const rx = /(\d+)$/
  ;[...nodes, ...edges].forEach(el => {
    // Soporta {id} o {data:{id}}
    const id = (el && (el.id || el?.data?.id)) || ''
    const m = String(id).match(rx)
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10) + 1)
  })
  uid = Math.max(uid, maxNum)
}

function loadFromSerializable(obj){
  // Normaliza a estructura "elements" (nodos y aristas con data/position/classes)
  let elements = null

  if (obj?.elements?.nodes && obj?.elements?.edges) {
    elements = { nodes: obj.elements.nodes, edges: obj.elements.edges }
  } else if (obj?.graph?.nodes && obj?.graph?.edges) {
    elements = {
      nodes: obj.graph.nodes.map(n => ({
        data: {
          id: String(n.id),
          label: String(n.label ?? ''),
          color: String(n.color ?? '#57c3d1'),
          borderColor: String(n.borderColor ?? darkenColor(n.color ?? '#57c3d1', 28)),
          text: n.text != null ? String(n.text) : undefined
        },
        position: n.position || { x: 0, y: 0 },
        classes: (n.classes || '').toString()
      })),
      edges: obj.graph.edges.map(e => ({
        data: {
          id: String(e.id ?? `e_${e.source}_${e.target}_${Date.now()}`),
          source: String(e.source),
          target: String(e.target),
          weight: String(e.weight ?? '')
        },
        classes: (e.classes || '').toString()
      }))
    }
  } else if (Array.isArray(obj?.nodes) && Array.isArray(obj?.edges)) {
    // Compatibilidad con esquema plano {nodes, edges}
    elements = {
      nodes: obj.nodes.map(n => ({
        data: {
          id: String(n.id),
          label: String(n.label ?? ''),
          color: String(n.color ?? '#57c3d1'),
          borderColor: String(n.borderColor ?? darkenColor(n.color ?? '#57c3d1', 28)),
          text: n.text != null ? String(n.text) : undefined
        },
        position: n.position || { x: 0, y: 0 },
        classes: (n.classes || '').toString()
      })),
      edges: obj.edges.map(e => ({
        data: {
          id: String(e.id ?? `e_${e.source}_${e.target}_${Date.now()}`),
          source: String(e.source),
          target: String(e.target),
          weight: String(e.weight ?? '')
        },
        classes: (e.classes || '').toString()
      }))
    }
  }

  if (!elements?.nodes || !elements?.edges) throw new Error('Estructura inválida')

  cy.startBatch()
  cy.elements().remove()

  // Restaura estado visual del tablero si viene
  if (obj?.board){
    theme.value = obj.board.theme ?? theme.value
    color.value = obj.board.color ?? color.value
    image.value = obj.board.image ?? image.value
    showGrid.value = obj.board.showGrid ?? showGrid.value
  }

  // Agregar nodos primero
  elements.nodes.forEach(n => {
    cy.add({ group:'nodes', data:n.data, position:n.position, classes:n.classes })
  })

  // Luego aristas; descartar si faltan extremos
  elements.edges.forEach(e => {
    const d = e.data || {}
    const src = d.source, tgt = d.target
    if (!src || !tgt) return
    if (cy.$id(src).empty() || cy.$id(tgt).empty()) return
    cy.add({ group:'edges', data:d, classes:e.classes })
  })

  cy.endBatch()
  cy.fit(undefined, 24)
  updateUidFromElements(elements.nodes, elements.edges)
  cy.nodes().forEach(resizeNodeToLabel)
}

async function importJSON(ev){
  const file = ev?.target?.files?.[0]
  if (!file) return

  try{
    const text = await file.text()
    const obj = JSON.parse(text)

    const { isConfirmed } = await Swal.fire({
      title:'Importar JSON',
      text:'Esto reemplazará el contenido actual de la pizarra.',
      icon:'warning',
      showCancelButton:true, showCloseButton:true,
      confirmButtonText:'Importar', cancelButtonText:'Cancelar',
      ...swalColors
    })
    if (!isConfirmed) return

    loadFromSerializable(obj)

    await Swal.fire({ icon:'success', title:'Importación completada', text:'El grafo se cargó correctamente.', confirmButtonText:'OK', ...swalColors })
    ev.target.value = ''
  }catch(e){
    console.error(e)
    Swal.fire({ icon:'error', title:'Importación fallida', text:'El archivo no tiene el formato esperado o está dañado.', ...swalColors })
  }
}

/* ========= Flujo de exportación ========= */
const handleExport = async (type) => {
  pendingExportType.value = type
  showExport.value = false
  showNamePopup.value = true
}
async function onNameConfirm(base){
  showNamePopup.value = false
  const type = pendingExportType.value
  pendingExportType.value = null
  if (type === 'image') await exportImagen(base)
  else if (type === 'pdf') await exportPDF(base)
  else if (type === 'json') await exportJSON(base)
  else if (type === 'zip') await exportZIP(base)
}

function toggleNodeMode(){ nodeMode.value=!nodeMode.value; if(nodeMode.value){ connectMode.value=deleteMode.value=moveMode.value=textMode.value=false } applyGrabRules() }
function toggleDeleteMode(){ deleteMode.value=!deleteMode.value; if(deleteMode.value){ nodeMode.value=connectMode.value=moveMode.value=textMode.value=false } applyGrabRules() }
function toggleConnectMode(){ connectMode.value=!connectMode.value; if(connectMode.value){ nodeMode.value=deleteMode.value=moveMode.value=textMode.value=false } else clearPendingConnect(); applyGrabRules() }
function toggleMoveMode(){ moveMode.value=!moveMode.value; if(moveMode.value){ nodeMode.value=connectMode.value=deleteMode.value=textMode.value=false } applyGrabRules() }
function toggleTextMode(){ textMode.value=!textMode.value; if(textMode.value){ nodeMode.value=connectMode.value=deleteMode.value=moveMode.value=false } applyGrabRules() }

function applyGrabRules(){
  if(!cy) return
  const anySpecial = nodeMode.value || connectMode.value || deleteMode.value || textMode.value
  if (moveMode.value || !anySpecial) cy.nodes().grabify()
  else cy.nodes().ungrabify()
}

/* Limpiar Pizarra */
async function confirmClear(e){
  e?.stopPropagation?.()
  const { isConfirmed } = await Swal.fire({
    title:'Limpiar pizarra', text:'Esto eliminará todos los nodos y aristas.',
    icon:'warning', showCancelButton:true, showCloseButton:true,
    confirmButtonText:'Limpiar', cancelButtonText:'Cancelar', ...swalColors
  })
  if (isConfirmed){
    cy?.elements().remove()
    resetVisuals()
    clearPendingConnect()
    nodeMode.value = connectMode.value = deleteMode.value = moveMode.value = textMode.value = false
    applyGrabRules()
  }
}
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
    &.is-active { background:#567c8d !important; color:#ecebe6; border-color: rgba(255,255,255,.28); }
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

  .fab { position:absolute; right:14px; bottom:14px; width:44px; height:44px; border-radius:999px; border:none; background:#567c8d; color:#ecebe6; display:grid; place-items:center; cursor:pointer; box-shadow:0 8px 22px rgba(0,0,0,.35); transition: transform .06s, filter .2s; &:hover{filter:brightness(1.05)} &:active{ transform: translateY(1px); } z-index:20; pointer-events:auto; }
  .fab-clear{ bottom:68px; background:#2f4156; z-index:25; }
  .fab-left{ left:14px; right:auto; }
  .fab-left-top{ left:14px; right:auto; bottom:68px; }
  &.no-grid { background-image: none !important; }
}

.theme-plain { background-color: var(--board-bg, #ffffff); background-image: none; }
.theme-grid  { background-color: var(--board-bg, #fff7ef); background-image:
    linear-gradient(to right, rgba(0,0,0,.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,.08) 1px, transparent 1px); background-size: 20px 20px; }
.theme-dotted{ background-color: var(--board-bg, #ffffff); background-image: radial-gradient(circle, rgba(0,0,0,.32) 1.1px, transparent 1.1px); background-size: 14px 14px; }
.theme-image{ background-color: var(--board-bg, #ffffff); background-image: var(--board-image); background-size: cover; background-position: center; }

.graph-layer { position: absolute; inset: 0; z-index: 0; }

:deep(.swal2-html-container code){ background:#1e2430; color:#e7e7ec; padding:2px 5px; border-radius:4px; }

@media (max-width: 900px){ .toolbar{ gap:10px; .tools-right{ margin-left:auto; } } }
@media (max-width: 640px){ .toolbar{ flex-direction: column; align-items: stretch; .tools-left, .tools-right{ justify-content: flex-start; } } }
</style>

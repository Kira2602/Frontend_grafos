<template>
  <section class="page">
    <div class="norwest-container">
      <!-- Título y controles principales -->
      <div class="header-section">
        <h1 class="page-title">
          <i class="fa-solid fa-truck"></i>
          Algoritmo North West Corner
        </h1>
        <p class="page-subtitle">Método de la esquina noroeste para problemas de transporte</p>
      </div>

      <!-- Panel de controles -->
      <div class="controls-panel">
        <div class="control-group">
          <button class="btn btn-primary" @click="addRow" title="Agregar fila (origen)">
            <i class="fa-solid fa-plus"></i> Agregar Fila
          </button>
          <button class="btn btn-primary" @click="addColumn" title="Agregar columna (destino)">
            <i class="fa-solid fa-plus"></i> Agregar Columna
          </button>
          <button
            class="btn btn-danger"
            @click="confirmRemoveRow"
            :disabled="rows <= 2"
            title="Eliminar última fila"
          >
            <i class="fa-solid fa-minus"></i> Eliminar Fila
          </button>
          <button
            class="btn btn-danger"
            @click="confirmRemoveColumn"
            :disabled="cols <= 2"
            title="Eliminar última columna"
          >
            <i class="fa-solid fa-minus"></i> Eliminar Columna
          </button>
          <button class="btn btn-info" @click="showExamplePopup = true" title="Cargar ejemplo">
            <i class="fa-solid fa-lightbulb"></i> Ejemplos
          </button>
          <button class="btn btn-export" @click="openImportDialog" title="Importar CSV/JSON">
            <i class="fa-solid fa-file-import"></i> Importar
          </button>
          <input
            ref="importInputRef"
            type="file"
            accept=".csv,application/json,text/csv,application/vnd.ms-excel"
            class="visually-hidden"
            @change="onImportFileSelected"
          />
        </div>

        <div class="control-group">
          <button
            class="btn btn-toggle"
            :class="{ 'is-maximize': isMaximize }"
            @click="toggleOptimization"
            title="Cambiar objetivo"
          >
            <i :class="isMaximize ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i>
            {{ isMaximize ? 'Maximizar' : 'Minimizar' }}
          </button>
          <button class="btn btn-success" @click="solve" title="Resolver con North West">
            <i class="fa-solid fa-play"></i> Resolver
          </button>
          <button class="btn btn-secondary" @click="clearTable" title="Limpiar tabla">
            <i class="fa-solid fa-broom"></i> Limpiar
          </button>
        </div>

        <div class="control-group">
          <button class="btn btn-export" @click="exportCSV" title="Descargar CSV">
            <i class="fa-solid fa-file-csv"></i> CSV
          </button>
          <button class="btn btn-export" @click="exportJSON" title="Descargar JSON">
            <i class="fa-solid fa-file-code"></i> JSON
          </button>
          <button class="btn btn-export" @click="exportImage" title="Descargar como imagen">
            <i class="fa-solid fa-image"></i> Imagen
          </button>
        </div>
      </div>

      <!-- Tabla de entrada de datos -->
      <div class="table-wrapper" ref="tableWrapperRef">
        <div class="table-container">
          <table class="data-table" ref="tableRef">
            <thead>
              <tr>
                <th class="corner-cell"></th>
                <th v-for="j in cols" :key="`header-${j}`" class="header-cell">
                  Destino {{ j }}
                </th>
                <th class="header-cell supply-header">Oferta</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="i in rows"
                :key="`row-${i}`"
                :class="{ 'pending-delete-row': pendingDeleteRowIdx === i - 1 }"
              >
                <th class="header-cell">Origen {{ i }}</th>
                <td
                  v-for="j in cols"
                  :key="`cell-${i}-${j}`"
                  class="data-cell"
                  :class="{ 'pending-delete-col': pendingDeleteColIdx === j - 1 }"
                >
                  <input
                    type="number"
                    v-model.number="costs[i - 1][j - 1]"
                    class="cell-input"
                    step="any"
                    placeholder="0"
                  />
                </td>
                <td class="data-cell supply-cell">
                  <input
                    type="number"
                    v-model.number="supply[i - 1]"
                    class="cell-input supply-input"
                    step="any"
                    placeholder="0"
                  />
                </td>
              </tr>
              <tr class="demand-row">
                <th class="header-cell">Demanda</th>
                <td
                  v-for="j in cols"
                  :key="`demand-${j}`"
                  class="data-cell demand-cell"
                  :class="{ 'pending-delete-col': pendingDeleteColIdx === j - 1 }"
                >
                  <input
                    type="number"
                    v-model.number="demand[j - 1]"
                    class="cell-input demand-input"
                    step="any"
                    placeholder="0"
                  />
                </td>
                <td class="data-cell total-cell">
                  <div class="total-display">
                    <span class="total-label">Σ Oferta:</span>
                    <span class="total-value">{{ totalSupply }}</span>
                  </div>
                  <div class="total-display">
                    <span class="total-label">Σ Demanda:</span>
                    <span class="total-value">{{ totalDemand }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resultados -->
      <div v-if="result" class="results-section">
        <div class="result-header">
          <h2 class="result-title">
            <i class="fa-solid fa-chart-line"></i>
            Resultados
          </h2>
          <div class="result-summary">
            <div class="summary-item">
              <span class="summary-label">{{ isMaximize ? 'Ganancia Total:' : 'Costo Total:' }}</span>
              <span class="summary-value">{{ result.totalCost }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Método:</span>
              <span class="summary-value">{{ result.method }}</span>
            </div>
            <div class="summary-item warning" v-if="!result.isOptimal">
              <i class="fa-solid fa-exclamation-triangle"></i>
              <span>Esta solución puede no ser óptima</span>
            </div>
          </div>
        </div>

        <!-- Matriz de asignación final (mapa de calor) -->
        <div class="heatmap-container">
          <h3 class="section-subtitle">Matriz de Asignación Final</h3>
          <div class="table-container">
            <table class="result-table heatmap-table">
              <thead>
                <tr>
                  <th class="corner-cell"></th>
                  <th v-for="j in cols" :key="`res-header-${j}`" class="header-cell">
                    Destino {{ j }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="i in rows" :key="`res-row-${i}`">
                  <th class="header-cell">Origen {{ i }}</th>
                  <td
                    v-for="j in cols"
                    :key="`res-cell-${i}-${j}`"
                    class="data-cell heatmap-cell"
                    :style="getHeatmapStyle(result.allocation[i - 1][j - 1])"
                  >
                    <div class="cell-content">
                      <span class="cell-value">{{ result.allocation[i - 1][j - 1] }}</span>
                      <span class="cell-cost" v-if="result.allocation[i - 1][j - 1] > 0">
                        ({{ costs[i - 1][j - 1] }})
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Iteraciones -->
        <div class="iterations-container">
          <h3 class="section-subtitle">
            <i class="fa-solid fa-list-ol"></i>
            Iteraciones del Algoritmo
          </h3>
          <div class="iteration-controls">
            <button
              class="btn btn-small"
              @click="prevIteration"
              :disabled="currentIteration === 0"
            >
              <i class="fa-solid fa-chevron-left"></i> Anterior
            </button>
            <span class="iteration-counter">
              Iteración {{ currentIteration + 1 }} de {{ result.iterations.length }}
            </span>
            <button
              class="btn btn-small"
              @click="nextIteration"
              :disabled="currentIteration === result.iterations.length - 1"
            >
              Siguiente <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <!-- Mostrar iteración actual -->
          <div v-if="currentIterationData" class="iteration-display">
            <div class="iteration-info">
              <p class="iteration-message">
                <i class="fa-solid fa-info-circle"></i>
                {{ currentIterationData.message }}
              </p>
              <div class="iteration-stats">
                <span>Cantidad: {{ currentIterationData.amount }}</span>
                <span>{{ isMaximize ? 'Beneficio unitario' : 'Costo unitario' }}: {{ currentIterationData.cost }}</span>
                <span>{{ isMaximize ? 'Beneficio total' : 'Costo total' }}: {{ currentIterationData.totalCost }}</span>
              </div>
            </div>

            <!-- Matriz de la iteración -->
            <div class="table-container">
              <table class="result-table iteration-table">
                <thead>
                  <tr>
                    <th class="corner-cell"></th>
                    <th v-for="j in cols" :key="`iter-header-${j}`" class="header-cell">
                      D{{ j }}
                    </th>
                    <th class="header-cell">Oferta Rest.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in rows" :key="`iter-row-${i}`">
                    <th class="header-cell">O{{ i }}</th>
                    <td
                      v-for="j in cols"
                      :key="`iter-cell-${i}-${j}`"
                      class="data-cell iteration-cell"
                      :class="{
                        'is-current':
                          currentIterationData.position.row === i - 1 &&
                          currentIterationData.position.col === j - 1
                      }"
                      :style="getIterationHeatmapStyle(currentIterationData.allocation[i - 1][j - 1])"
                    >
                      {{ currentIterationData.allocation[i - 1][j - 1] }}
                    </td>
                    <td class="data-cell supply-cell">
                      {{ currentIterationData.supplyLeft[i - 1] }}
                    </td>
                  </tr>
                  <tr class="demand-row">
                    <th class="header-cell">Dem. Rest.</th>
                    <td v-for="j in cols" :key="`iter-demand-${j}`" class="data-cell demand-cell">
                      {{ currentIterationData.demandLeft[j - 1] }}
                    </td>
                    <td class="data-cell"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup de ejemplos -->
    <LoadExamplePopup v-model="showExamplePopup" @select="loadExample" />
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import html2canvas from 'html2canvas'
import LoadExamplePopup from '@/components/LoadExamplePopup.vue'
import {
  northWestCorner,
  validateCostMatrix,
  validateSupplyDemand,
  calculateHeatmapIntensity,
  exportToCSV as exportCSVUtil,
  exportToJSON as exportJSONUtil
} from '@/algorithms/northwest.js'

// Estado de la tabla
const rows = ref(3)
const cols = ref(4)
const costs = ref([])
const supply = ref([])
const demand = ref([])
const isMaximize = ref(false)

// Resultados
const result = ref(null)
const currentIteration = ref(0)

// Referencias
const tableRef = ref(null)
const tableWrapperRef = ref(null)
const showExamplePopup = ref(false)
const importInputRef = ref(null)
const pendingDeleteRowIdx = ref(null)
const pendingDeleteColIdx = ref(null)

// Inicializar tabla por defecto
const initializeTable = () => {
  costs.value = Array.from({ length: rows.value }, () => Array(cols.value).fill(0))
  supply.value = Array(rows.value).fill(0)
  demand.value = Array(cols.value).fill(0)
}

initializeTable()

// Computed
const totalSupply = computed(() => supply.value.reduce((a, b) => a + b, 0))
const totalDemand = computed(() => demand.value.reduce((a, b) => a + b, 0))

const currentIterationData = computed(() => {
  if (!result.value || !result.value.iterations) return null
  return result.value.iterations[currentIteration.value]
})

const maxAllocation = computed(() => {
  if (!result.value) return 0
  return Math.max(...result.value.allocation.flat())
})

const maxIterationAllocation = computed(() => {
  if (!currentIterationData.value) return 0
  return Math.max(...currentIterationData.value.allocation.flat())
})

// Métodos de modificación de tabla
const addRow = () => {
  rows.value++
  costs.value.push(Array(cols.value).fill(0))
  supply.value.push(0)
}

const addColumn = () => {
  cols.value++
  costs.value.forEach((row) => row.push(0))
  demand.value.push(0)
}

const removeRow = () => {
  if (rows.value <= 2) {
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: 'Debe haber al menos 2 filas',
      background: '#1e1e1e',
      color: '#ffffff'
    })
    return
  }
  rows.value--
  costs.value.pop()
  supply.value.pop()
  result.value = null
}

const removeColumn = () => {
  if (cols.value <= 2) {
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: 'Debe haber al menos 2 columnas',
      background: '#1e1e1e',
      color: '#ffffff'
    })
    return
  }
  cols.value--
  costs.value.forEach((row) => row.pop())
  demand.value.pop()
  result.value = null
}

// Confirmaciones con indicador visual
const confirmRemoveRow = async () => {
  if (rows.value <= 2) return removeRow()
  pendingDeleteRowIdx.value = rows.value - 1
  await new Promise((r) => setTimeout(r, 100))
  const resp = await Swal.fire({
    icon: 'question',
    title: `Eliminar fila Origen ${rows.value}?`,
    text: 'Esta acción no se puede deshacer',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#25293a',
    color: '#ffffff',
    width: 420,
    position: 'top'
  })
  if (resp.isConfirmed) removeRow()
  pendingDeleteRowIdx.value = null
}

const confirmRemoveColumn = async () => {
  if (cols.value <= 2) return removeColumn()
  pendingDeleteColIdx.value = cols.value - 1
  await new Promise((r) => setTimeout(r, 100))
  const resp = await Swal.fire({
    icon: 'question',
    title: `Eliminar columna Destino ${cols.value}?`,
    text: 'Esta acción no se puede deshacer',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#25293a',
    color: '#ffffff',
    width: 420,
    position: 'top'
  })
  if (resp.isConfirmed) removeColumn()
  pendingDeleteColIdx.value = null
}

const clearTable = () => {
  Swal.fire({
    title: '¿Limpiar tabla?',
    text: 'Se perderán todos los datos ingresados',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, limpiar',
    cancelButtonText: 'Cancelar',
    background: '#1e1e1e',
    color: '#ffffff'
  }).then((resp) => {
    if (resp.isConfirmed) {
      initializeTable()
      result.value = null
      Swal.fire({
        icon: 'success',
        title: 'Tabla limpiada',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#1e1e1e',
        color: '#ffffff'
      })
    }
  })
}

const toggleOptimization = () => {
  isMaximize.value = !isMaximize.value
}

// Cargar ejemplo
const loadExample = (example) => {
  rows.value = example.rows
  cols.value = example.cols
  costs.value = example.costs.map((row) => [...row])
  supply.value = [...example.supply]
  demand.value = [...example.demand]
  result.value = null

  Swal.fire({
    icon: 'success',
    title: 'Ejemplo cargado',
    text: `${example.name} cargado correctamente`,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    background: '#1e1e1e',
    color: '#ffffff'
  })
}

// Resolver algoritmo
const solve = async () => {
  // Validar matriz de costos
  const costValidation = validateCostMatrix(costs.value)
  if (!costValidation.valid) {
    Swal.fire({
      icon: 'error',
      title: 'Error en matriz de costos',
      text: costValidation.error,
      background: '#1e1e1e',
      color: '#ffffff'
    })
    return
  }

  // Validar oferta y demanda
  const supplyDemandValidation = validateSupplyDemand(supply.value, demand.value)
  if (!supplyDemandValidation.valid) {
    Swal.fire({
      icon: 'error',
      title: 'Error en oferta/demanda',
      text: supplyDemandValidation.error,
      background: '#1e1e1e',
      color: '#ffffff'
    })
    return
  }

  // Advertir si hay diferencia entre oferta y demanda
  if (totalSupply.value !== totalDemand.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Oferta y demanda no equilibradas',
      html: `
        <p>Oferta total: ${totalSupply.value}</p>
        <p>Demanda total: ${totalDemand.value}</p>
        <p>Diferencia: ${Math.abs(totalSupply.value - totalDemand.value)}</p>
        <p>El problema debe estar equilibrado para resolverse.</p>
      `,
      background: '#1e1e1e',
      color: '#ffffff'
    })
    return
  }

  try {
    // Mostrar loading
    Swal.fire({
      title: 'Resolviendo...',
      text: 'Aplicando método North West Corner',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
      background: '#1e1e1e',
      color: '#ffffff'
    })

    // Simular tiempo de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Resolver (nota: North West no usa el parámetro maximize, es solo una heurística básica)
  result.value = northWestCorner(costs.value, supply.value, demand.value, { maximize: isMaximize.value })
    currentIteration.value = 0

    Swal.fire({
      icon: 'success',
      title: '¡Resuelto!',
      html: `
        <p>${isMaximize.value ? 'Ganancia total' : 'Costo total'}: <strong>${result.value.totalCost}</strong></p>
        <p>Iteraciones: <strong>${result.value.iterations.length}</strong></p>
      `,
      background: '#1e1e1e',
      color: '#ffffff'
    })

    // Scroll a resultados
    setTimeout(() => {
      document.querySelector('.results-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 500)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al resolver',
      text: error.message,
      background: '#1e1e1e',
      color: '#ffffff'
    })
  }
}

// Navegación de iteraciones
const prevIteration = () => {
  if (currentIteration.value > 0) {
    currentIteration.value--
  }
}

const nextIteration = () => {
  if (result.value && currentIteration.value < result.value.iterations.length - 1) {
    currentIteration.value++
  }
}

// Mapa de calor
const getHeatmapStyle = (value) => {
  if (value === 0) return {}
  const intensity = calculateHeatmapIntensity(value, maxAllocation.value)
  const hue = 200 // Azul
  const saturation = 70
  const lightness = 40 + intensity * 30
  return {
    backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 + intensity * 0.7})`,
    color: intensity > 0.5 ? '#ffffff' : '#e0e0e0',
    fontWeight: 'bold'
  }
}

const getIterationHeatmapStyle = (value) => {
  if (value === 0) return {}
  const intensity = calculateHeatmapIntensity(value, maxIterationAllocation.value)
  const hue = 160 // Verde-azul
  const saturation = 60
  const lightness = 35 + intensity * 25
  return {
    backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.2 + intensity * 0.6})`,
    fontWeight: value > 0 ? 'bold' : 'normal'
  }
}

// Exportación
const exportCSV = () => {
  try {
    const csv = exportCSVUtil(costs.value, supply.value, demand.value)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `northwest-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)

    Swal.fire({
      icon: 'success',
      title: 'CSV descargado',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      background: '#1e1e1e',
      color: '#ffffff'
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al exportar CSV',
      text: error.message,
      background: '#1e1e1e',
      color: '#ffffff'
    })
  }
}

const exportJSON = () => {
  try {
    const json = exportJSONUtil(costs.value, supply.value, demand.value)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `northwest-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    Swal.fire({
      icon: 'success',
      title: 'JSON descargado',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      background: '#1e1e1e',
      color: '#ffffff'
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al exportar JSON',
      text: error.message,
      background: '#1e1e1e',
      color: '#ffffff'
    })
  }
}

const exportImage = async () => {
  try {
    Swal.fire({
      title: 'Generando imagen...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
      background: '#1e1e1e',
      color: '#ffffff'
    })

    const element = tableWrapperRef.value
    const canvas = await html2canvas(element, {
      backgroundColor: '#1e1e1e',
      scale: 2
    })

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `northwest-table-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)

      Swal.fire({
        icon: 'success',
        title: 'Imagen descargada',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#1e1e1e',
        color: '#ffffff'
      })
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al exportar imagen',
      text: error.message,
      background: '#1e1e1e',
      color: '#ffffff'
    })
  }
}

// Importación CSV/JSON
const openImportDialog = () => {
  importInputRef.value?.click()
}

const onImportFileSelected = async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  try {
    const ext = file.name.split('.').pop()?.toLowerCase()
    const text = await file.text()
    let data
    if (ext === 'json' || file.type === 'application/json') {
      data = parseJSON(text)
    } else if (ext === 'csv' || file.type.includes('csv')) {
      data = parseCSV(text)
    } else {
      throw new Error('Formato no soportado. Usa .csv o .json')
    }
    applyImportedData(data)
    Swal.fire({
      icon: 'success',
      title: 'Datos importados',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      background: '#1e1e1e',
      color: '#ffffff'
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error al importar',
      text: err.message,
      background: '#1e1e1e',
      color: '#ffffff'
    })
  }
}

const parseJSON = (text) => {
  const obj = JSON.parse(text)
  if (!obj || !Array.isArray(obj.costs) || !Array.isArray(obj.supply) || !Array.isArray(obj.demand)) {
    throw new Error('JSON inválido. Se esperan las claves costs, supply y demand')
  }
  const r = obj.costs.length
  const c = obj.costs[0]?.length || 0
  if (obj.supply.length !== r || obj.demand.length !== c) {
    throw new Error('Dimensiones inconsistentes entre costs, supply y demand')
  }
  return { costs: obj.costs, supply: obj.supply, demand: obj.demand }
}

const parseCSV = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length < 3) throw new Error('CSV demasiado corto')

  const split = (line) =>
    line
      .split(',')
      .map((s) => s.trim())
      .filter((_, idx, arr) => !(idx === arr.length - 1 && arr[idx] === ''))

  const header = split(lines[0])
  // Esperado: ['', 'Destino 1', ..., 'Oferta']
  const colsCount = Math.max(0, header.length - 2)
  if (colsCount <= 0) throw new Error('Encabezado inválido en CSV')

  const costs = []
  const supply = []
  let demand = []

  for (let i = 1; i < lines.length; i++) {
    const parts = split(lines[i])
    if (parts[0].toLowerCase().startsWith('demanda')) {
      demand = parts.slice(1, 1 + colsCount).map((v) => parseFloat(v))
      continue
    }
    // Fila origen
    const rowVals = parts.slice(1, 1 + colsCount).map((v) => parseFloat(v))
    const supplyVal = parseFloat(parts[1 + colsCount])
    if (rowVals.length !== colsCount || isNaN(supplyVal)) {
      throw new Error(`Fila inválida: "${lines[i]}"`)
    }
    if (rowVals.some((x) => isNaN(x))) {
      throw new Error(`Valores no numéricos en: "${lines[i]}"`)
    }
    costs.push(rowVals)
    supply.push(supplyVal)
  }

  if (!demand.length) throw new Error('No se encontró fila de Demanda en el CSV')
  if (demand.length !== colsCount) throw new Error('La cantidad de columnas de demanda no coincide')

  return { costs, supply, demand }
}

const applyImportedData = (data) => {
  const r = data.costs.length
  const c = data.costs[0]?.length || 0
  rows.value = r
  cols.value = c
  costs.value = data.costs.map((row) => row.map((v) => Number(v)))
  supply.value = data.supply.map((v) => Number(v))
  demand.value = data.demand.map((v) => Number(v))
  result.value = null
}
// Limpiar resultados al cambiar tamaño de tabla
watch([rows, cols], () => {
  result.value = null
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 6rem 1rem 2rem;
  color: #e0e0e0;
}

.norwest-container {
  max-width: 1400px;
  margin: 0 auto;
}

// Header
.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #c8d9e6;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(200, 217, 230, 0.3);

  i {
    margin-right: 0.5rem;
    color: #7fa8c9;
  }
}

.page-subtitle {
  font-size: 1.1rem;
  color: #a0a0a0;
}

// Controles
.controls-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.control-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  i {
    font-size: 1rem;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
}

.btn-danger {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  }
}

.btn-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-size: 1.05rem;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  }
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }
}

.btn-toggle {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #1a1a2e;

  &.is-maximize {
    background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
    color: white;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
  }
}

.btn-export {
  background: rgba(255, 255, 255, 0.08);
  color: #c8d9e6;
  border: 1px solid rgba(200, 217, 230, 0.3);

  &:hover:not(:disabled) {
    background: rgba(200, 217, 230, 0.15);
    border-color: rgba(200, 217, 230, 0.5);
  }
}

.btn-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

// Tabla
.table-wrapper {
  margin-bottom: 2rem;
  overflow-x: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
}

.data-table,
.result-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  table-layout: fixed; /* Evita desbordes y distribuye columnas */

  th,
  td {
    padding: 0.35rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  thead th {
    background: rgba(200, 217, 230, 0.15);
    color: #c8d9e6;
    font-weight: 600;
    padding: 1rem 0.5rem;
  }

  tbody th {
    background: rgba(127, 168, 201, 0.1);
    color: #7fa8c9;
    font-weight: 600;
  }
}

.corner-cell {
  background: rgba(0, 0, 0, 0.5) !important;
}

.header-cell {
  padding: 0.2rem;
  font-size: 0.9rem;
  white-space: nowrap;
}

.demand-row {
  font-size: 0.9rem;
}
.demand-cell {
  background: rgba(33, 150, 243, 0.15) !important;
}

.total-cell {
  background: rgba(76, 175, 80, 0.15) !important;
  vertical-align: middle;
}

.total-display {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.85rem;

  .total-label {
    color: #a0a0a0;
  }

  .total-value {
    color: #4caf50;
    font-weight: bold;
  }
}

.data-cell {
  padding: 0.2rem;
}

.cell-input {
  display: block;
  width: 100%; /* exactamente el ancho de la celda */
  box-sizing: border-box; /* incluye padding en el ancho */
  min-width: 0;
  padding: 0.35rem 0.3rem; /* padding reducido */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.85rem;
  line-height: 1;
  text-align: center;
  transition: all 0.25s ease;
  overflow: hidden;

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    border-color: #4facfe;
    box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.25);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &::placeholder {
    color: #666;
  }
}

/* Evitar que los spinners de inputs numéricos agreguen ancho extra */
.cell-input::-webkit-outer-spin-button,
.cell-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.cell-input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.supply-input {
  border-color: rgba(255, 193, 7, 0.3);

  &:focus {
    border-color: #ffc107;
    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
  }
}

.demand-input {
  border-color: rgba(33, 150, 243, 0.3);

  &:focus {
    border-color: #2196f3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
  }
}

// Resultados
.results-section {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.result-header {
  margin-bottom: 2rem;
}

.result-title {
  font-size: 2rem;
  color: #c8d9e6;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.result-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &.warning {
    color: #ffc107;

    i {
      font-size: 1.2rem;
    }
  }
}

.summary-label {
  color: #a0a0a0;
  font-weight: 500;
}

.summary-value {
  color: #4facfe;
  font-weight: 700;
  font-size: 1.2rem;
}

.section-subtitle {
  font-size: 1.5rem;
  color: #7fa8c9;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

// Mapa de calor
.heatmap-container {
  margin-bottom: 2rem;
}

.heatmap-cell {
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    z-index: 10;
  }
}

.cell-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cell-value {
  font-size: 1.1rem;
  font-weight: bold;
}

.cell-cost {
  font-size: 0.75rem;
  opacity: 0.8;
}

// Iteraciones
.iterations-container {
  margin-top: 2rem;
}

.iteration-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.iteration-counter {
  font-size: 1rem;
  font-weight: 600;
  color: #c8d9e6;
  padding: 0.5rem 1rem;
  background: rgba(200, 217, 230, 0.1);
  border-radius: 8px;
}

.iteration-display {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
}

.iteration-info {
  margin-bottom: 1.5rem;
}

.iteration-message {
  font-size: 1.1rem;
  color: #e0e0e0;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(79, 172, 254, 0.1);
  border-left: 4px solid #4facfe;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    color: #4facfe;
    font-size: 1.2rem;
  }
}

.iteration-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.95rem;

  span {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    color: #a0a0a0;

    &::before {
      content: '• ';
      color: #4facfe;
      font-weight: bold;
    }
  }
}

.iteration-table {
  .iteration-cell {
    transition: all 0.3s ease;

    &.is-current {
      background: rgba(255, 193, 7, 0.3) !important;
      border: 2px solid #ffc107;
      font-weight: bold;
      font-size: 1.1rem;
      box-shadow: 0 0 15px rgba(255, 193, 7, 0.5);
    }
  }
}

/* Indicadores de eliminación */
.pending-delete-row {
  outline: 2px solid rgba(245, 87, 108, 0.8);
  outline-offset: -2px;
  background: rgba(245, 87, 108, 0.12) !important;
}
.pending-delete-col {
  position: relative;
  background: rgba(245, 87, 108, 0.12) !important;
}
.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Responsive
@media (max-width: 768px) {
  .page {
    padding: 5rem 0.5rem 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .controls-panel {
    padding: 1rem;
  }

  .control-group {
    width: 100%;
    justify-content: center;
  }

  .btn {
    flex: 1;
    min-width: 120px;
    font-size: 0.85rem;
    padding: 0.6rem 0.8rem;
  }

  .table-wrapper {
    padding: 0.5rem;
  }

  .cell-input {
    font-size: 0.85rem;
    padding: 0.5rem 0.3rem;
  }

  .result-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .summary-value {
    font-size: 1rem;
  }

  .iteration-controls {
    flex-direction: column;
    gap: 0.5rem;
  }

  .iteration-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .btn {
    min-width: 100px;
    font-size: 0.8rem;
  }

  .data-table,
  .result-table {
    font-size: 0.85rem;

    th,
    td {
      padding: 0.3rem;
    }
  }
}
</style>
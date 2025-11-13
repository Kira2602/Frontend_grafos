/**
 * Algoritmo North West (Esquina Noroeste)
 * Método de transporte para problemas de asignación
 */

/**
 * Resuelve el problema de transporte usando el método de la esquina noroeste
 * @param {number[][]} costs - Matriz de costos (origenes x destinos)
 * @param {number[]} supply - Array de oferta de cada origen
 * @param {number[]} demand - Array de demanda de cada destino
 * @returns {Object} Resultado con asignaciones, costo total e iteraciones
 */
export function northWestCorner(costs, supply, demand, options = {}) {
  const maximize = options.maximize === true
  const m = supply.length // número de orígenes
  const n = demand.length // número de destinos

  // Validaciones
  const totalSupply = supply.reduce((a, b) => a + b, 0)
  const totalDemand = demand.reduce((a, b) => a + b, 0)

  if (totalSupply !== totalDemand) {
    throw new Error(
      `La oferta total (${totalSupply}) debe ser igual a la demanda total (${totalDemand})`
    )
  }

  // Copias de trabajo
  const supplyLeft = [...supply]
  const demandLeft = [...demand]
  const allocation = Array.from({ length: m }, () => Array(n).fill(0))
  const iterations = []

  let totalCost = 0
  let step = 1

  if (!maximize) {
    // Algoritmo clásico de la esquina noroeste (minimización: independiente de costos)
    let i = 0
    let j = 0
    while (i < m && j < n) {
      const amount = Math.min(supplyLeft[i], demandLeft[j])
      allocation[i][j] = amount

      const cost = amount * costs[i][j]
      totalCost += cost

      supplyLeft[i] -= amount
      demandLeft[j] -= amount

      iterations.push({
        step: step++,
        position: { row: i, col: j },
        amount,
        cost: costs[i][j],
        totalCost: cost,
        allocation: allocation.map((row) => [...row]),
        supplyLeft: [...supplyLeft],
        demandLeft: [...demandLeft],
        message: `Asignar ${amount} unidades de Origen ${i + 1} a Destino ${j + 1} (costo unitario: ${costs[i][j]})`
      })

      if (supplyLeft[i] === 0) i++
      if (demandLeft[j] === 0) j++
    }

    return {
      allocation,
      totalCost,
      iterations,
      isOptimal: false, // North West no garantiza solución óptima
      method: 'North West Corner (min)'
    }
  }

  // Maximización: estrategia voraz de "Costo Máximo" (elige la celda con mayor beneficio disponible)
  // Nota: Esto NO es NW clásico, pero habilita la opción de maximizar usando los mismos datos
  const activeRows = new Set(Array.from({ length: m }, (_, r) => r))
  const activeCols = new Set(Array.from({ length: n }, (_, c) => c))

  while (activeRows.size > 0 && activeCols.size > 0) {
    // Buscar la celda con mayor "beneficio" entre filas/columnas aún activas
    let bestI = -1
    let bestJ = -1
    let bestVal = -Infinity
    activeRows.forEach((ri) => {
      activeCols.forEach((cj) => {
        if (supplyLeft[ri] > 0 && demandLeft[cj] > 0) {
          const val = costs[ri][cj]
          if (val > bestVal) {
            bestVal = val
            bestI = ri
            bestJ = cj
          }
        }
      })
    })

    if (bestI === -1 || bestJ === -1) break

    const amount = Math.min(supplyLeft[bestI], demandLeft[bestJ])
    allocation[bestI][bestJ] += amount
    const gain = amount * costs[bestI][bestJ]
    totalCost += gain

    supplyLeft[bestI] -= amount
    demandLeft[bestJ] -= amount

    iterations.push({
      step: step++,
      position: { row: bestI, col: bestJ },
      amount,
      cost: costs[bestI][bestJ],
      totalCost: gain,
      allocation: allocation.map((row) => [...row]),
      supplyLeft: [...supplyLeft],
      demandLeft: [...demandLeft],
      message: `Asignar ${amount} unidades de Origen ${bestI + 1} a Destino ${bestJ + 1} (beneficio unitario: ${costs[bestI][bestJ]})`
    })

    if (supplyLeft[bestI] === 0) activeRows.delete(bestI)
    if (demandLeft[bestJ] === 0) activeCols.delete(bestJ)
  }

  return {
    allocation,
    totalCost, // en max es "ganancia total"
    iterations,
    isOptimal: false,
    method: 'Greedy Costo Máximo (max)'
  }
}

/**
 * Valida que la matriz de costos sea válida
 * @param {number[][]} costs
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateCostMatrix(costs) {
  if (!costs || costs.length === 0) {
    return { valid: false, error: 'La matriz de costos no puede estar vacía' }
  }

  const cols = costs[0].length
  for (let i = 0; i < costs.length; i++) {
    if (costs[i].length !== cols) {
      return { valid: false, error: 'Todas las filas deben tener el mismo número de columnas' }
    }
    for (let j = 0; j < costs[i].length; j++) {
      if (typeof costs[i][j] !== 'number' || isNaN(costs[i][j])) {
        return {
          valid: false,
          error: `Valor inválido en posición [${i + 1}, ${j + 1}]. Debe ser un número`
        }
      }
    }
  }

  return { valid: true, error: null }
}

/**
 * Valida oferta y demanda
 * @param {number[]} supply
 * @param {number[]} demand
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateSupplyDemand(supply, demand) {
  // Validar que todos sean números positivos
  for (let i = 0; i < supply.length; i++) {
    if (typeof supply[i] !== 'number' || isNaN(supply[i]) || supply[i] < 0) {
      return { valid: false, error: `Oferta del origen ${i + 1} debe ser un número no negativo` }
    }
  }

  for (let j = 0; j < demand.length; j++) {
    if (typeof demand[j] !== 'number' || isNaN(demand[j]) || demand[j] < 0) {
      return { valid: false, error: `Demanda del destino ${j + 1} debe ser un número no negativo` }
    }
  }

  const totalSupply = supply.reduce((a, b) => a + b, 0)
  const totalDemand = demand.reduce((a, b) => a + b, 0)

  if (totalSupply !== totalDemand) {
    return {
      valid: false,
      error: `La oferta total (${totalSupply}) debe ser igual a la demanda total (${totalDemand})`
    }
  }

  return { valid: true, error: null }
}

/**
 * Calcula la intensidad de color para el mapa de calor
 * @param {number} value - Valor de la celda
 * @param {number} maxValue - Valor máximo en la matriz
 * @returns {number} Intensidad entre 0 y 1
 */
export function calculateHeatmapIntensity(value, maxValue) {
  if (maxValue === 0) return 0
  return value / maxValue
}

/**
 * Exporta la tabla a CSV
 * @param {number[][]} costs
 * @param {number[]} supply
 * @param {number[]} demand
 * @returns {string} Contenido CSV
 */
export function exportToCSV(costs, supply, demand) {
  let csv = ''

  // Encabezados
  csv += ','
  for (let j = 0; j < demand.length; j++) {
    csv += `Destino ${j + 1},`
  }
  csv += 'Oferta\n'

  // Filas de costos
  for (let i = 0; i < costs.length; i++) {
    csv += `Origen ${i + 1},`
    for (let j = 0; j < costs[i].length; j++) {
      csv += `${costs[i][j]},`
    }
    csv += `${supply[i]}\n`
  }

  // Fila de demanda
  csv += 'Demanda,'
  for (let j = 0; j < demand.length; j++) {
    csv += `${demand[j]},`
  }
  csv += '\n'

  return csv
}

/**
 * Exporta la tabla a JSON
 * @param {number[][]} costs
 * @param {number[]} supply
 * @param {number[]} demand
 * @returns {string} Contenido JSON
 */
export function exportToJSON(costs, supply, demand) {
  return JSON.stringify(
    {
      costs,
      supply,
      demand,
      metadata: {
        rows: costs.length,
        cols: costs[0]?.length || 0,
        totalSupply: supply.reduce((a, b) => a + b, 0),
        totalDemand: demand.reduce((a, b) => a + b, 0)
      }
    },
    null,
    2
  )
}

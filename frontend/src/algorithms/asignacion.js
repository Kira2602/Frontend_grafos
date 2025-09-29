// Construye bipartición L (solo salida) y R (solo entrada) desde el grafo de Cytoscape.
// Convierte aristas L->R a matriz de costos (min). Para modo "max", hace shift a min.
export function buildBipartiteFromCy(cy, { mode = 'min' } = {}) {
  const L = [], R = []
  const nodes = cy.nodes().filter(n => !n.hasClass('text-block'))
  nodes.forEach(n => {
    const out = n.outdegree(), inn = n.indegree()
    if (out > 0 && inn === 0) L.push(n.id())
    else if (inn > 0 && out === 0) R.push(n.id())
  })
  // indices
  const li = L.slice()
  const rj = R.slice()
  const iIndex = Object.fromEntries(li.map((id, i) => [id, i]))
  const jIndex = Object.fromEntries(rj.map((id, j) => [id, j]))

  // recolectar pesos
  const edgesMap = new Map() // key `${u}->${v}` -> edgeId
  let maxW = 0
  cy.edges().forEach(e => {
    const u = e.source().id(), v = e.target().id()
    if (!(u in iIndex) || !(v in jIndex)) return
    const raw = String(e.data('weight') ?? '')
    const last = raw.split('\n').pop().trim()
    const w = Number(last)
    const wNum = Number.isFinite(w) ? w : 1
    if (wNum > maxW) maxW = wNum
    edgesMap.set(`${u}->${v}`, e.id())
  })

  const n = li.length, m = rj.length
  const INF = 1e9
  const costMatrix = Array.from({ length: n }, () => Array(m).fill(INF))

  cy.edges().forEach(e => {
    const u = e.source().id(), v = e.target().id()
    if (!(u in iIndex) || !(v in jIndex)) return
    const raw = String(e.data('weight') ?? '')
    const last = raw.split('\n').pop().trim()
    const w = Number(last)
    const wNum = Number.isFinite(w) ? w : 1
    const i = iIndex[u], j = jIndex[v]
    // Si es maximizar, transformamos a costo mínimo
    costMatrix[i][j] = (mode === 'max') ? (maxW - wNum) : wNum
  })

  return { L, R, li, rj, edgesMap, costMatrix }
}

// Implementación clásica del algoritmo húngaro para costo mínimo.
// Si allowUnassigned = true, resuelve matching parcial (rellenando con dummies de costo 0).
export function hungarianAssign(cost, { allowUnassigned = true } = {}) {
  // Clonar matriz (para no mutar)
  const a = cost.map(row => row.slice())
  let n = a.length, m = a[0]?.length ?? 0
  if (n === 0 || m === 0) return { pairs: [], total: 0 }

  // Si se permite parcial, hacemos la matriz cuadrada con dummies (costo 0)
  const N = Math.max(n, m)
  for (let i = 0; i < n; i++) {
    for (let j = m; j < N; j++) a[i][j] = 0
  }
  for (let i = n; i < N; i++) {
    a[i] = Array.from({ length: N }, () => 0)
  }

  // Húngaro (O(N^3))
  const u = Array(N + 1).fill(0)
  const v = Array(N + 1).fill(0)
  const p = Array(N + 1).fill(0)
  const way = Array(N + 1).fill(0)

  for (let i = 1; i <= N; i++) {
    p[0] = i
    let j0 = 0
    const minv = Array(N + 1).fill(Infinity)
    const used = Array(N + 1).fill(false)
    do {
      used[j0] = true
      const i0 = p[j0]
      let delta = Infinity, j1 = 0
      for (let j = 1; j <= N; j++) if (!used[j]) {
        const cur = a[i0 - 1][j - 1] - u[i0] - v[j]
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0 }
        if (minv[j] < delta) { delta = minv[j]; j1 = j }
      }
      for (let j = 0; j <= N; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta }
        else { minv[j] -= delta }
      }
      j0 = j1
    } while (p[j0] !== 0)
    do {
      const j1 = way[j0]
      p[j0] = p[j1]
      j0 = j1
    } while (j0 !== 0)
  }

  const assignment = Array(N + 1).fill(0)
  for (let j = 1; j <= N; j++) assignment[p[j]] = j

  // Construimos pares (i, j) en índices originales
  const pairs = []
  let total = 0
  for (let i = 0; i < n; i++) {
    const j = assignment[i + 1] - 1
    if (j >= 0 && j < m) {
      const c = cost[i][j]
      if (allowUnassigned && a[i][j] === 0 && (i >= n || j >= m)) {
        // dummy → lo ignoramos (pero en esta implementación el dummy
        // real solo aparece cuando i>=n o j>=m)
      }
      pairs.push([i, j])
      total += (Number.isFinite(c) ? c : 0)
    } else if (!allowUnassigned) {
      // si no se permite parcial, debería ser cuadrada y siempre asignar
    }
  }

  return { pairs, total }
}

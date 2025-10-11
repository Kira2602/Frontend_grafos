// src/algorithms/asignacion.js

const INF = 1e12;

/* Util: parsear número desde el último renglón de un label/weight */
function parseNumber(raw) {
  const last = String(raw ?? '').split('\n').pop().trim();
  const n = Number(last);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Construye L/R y devuelve matriz **CUADRADA** de costos para MIN.
 * Soporta:
 *  - mode: 'min' | 'max'
 *  - allowUnassigned: si true, permite dummies (no-asignación):
 *      * en min: dummy = 0 (neutral)
 *      * en max: dummy = base  (peor que cualquier beneficio positivo)
 *    si false, dummy = INF (obliga a emparejar real).
 *
 * Retorna: { L, R, li, rj, edgesMap, costMatrix }
 *   - L, R: ids de nodos
 *   - li, rj: copias para indexar (orden estable)
 *   - edgesMap: `${u}->${v}` -> edgeId
 *   - costMatrix: NxN lista para algoritmo húngaro (MIN)
 */
export function buildBipartiteFromCy(
  cy,
  { mode = 'min', allowUnassigned = true } = {}
) {
  // Detectar L (solo salida) y R (solo entrada)
  const L = [], R = [];
  cy.nodes().filter(n => !n.hasClass('text-block')).forEach(n => {
    const out = n.outdegree(), inn = n.indegree();
    if (out > 0 && inn === 0) L.push(n.id());
    else if (inn > 0 && out === 0) R.push(n.id());
  });

  const li = L.slice();
  const rj = R.slice();
  const iIndex = Object.fromEntries(li.map((id, i) => [id, i]));
  const jIndex = Object.fromEntries(rj.map((id, j) => [id, j]));

  // Mapear aristas L->R y calcular beneficio máximo
  const edgesMap = new Map();
  let maxBenefit = 0;
  cy.edges().forEach(e => {
    const u = e.source().id(), v = e.target().id();
    if (!(u in iIndex) || !(v in jIndex)) return;
    edgesMap.set(`${u}->${v}`, e.id());
    const w = parseNumber(e.data('weight'));
    if (Number.isFinite(w) && w > maxBenefit) maxBenefit = w;
  });

  const n = li.length, m = rj.length;
  const N = Math.max(n, m);
  const base = Math.max(maxBenefit, 0); // para transformar max->min

  // Matriz de beneficios reales (-1 = no existe arista)
  const B = Array.from({ length: n }, () => Array(m).fill(-1));
  cy.edges().forEach(e => {
    const u = e.source().id(), v = e.target().id();
    if (!(u in iIndex) || !(v in jIndex)) return;
    const i = iIndex[u], j = jIndex[v];
    const w = parseNumber(e.data('weight'));
    if (Number.isFinite(w)) B[i][j] = w;
  });

  // Construir matriz **cuadrada** de costos (MIN)
  const costMatrix = Array.from({ length: N }, () => Array(N).fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const isDummy = (i >= n) || (j >= m);

      if (isDummy) {
        if (allowUnassigned) {
          // En max, el dummy debe ser "caro" (base) para no desplazar beneficios reales
          costMatrix[i][j] = (mode === 'max') ? base : 0;
        } else {
          costMatrix[i][j] = INF; // prohibir no-asignación
        }
        continue;
      }

      const w = B[i][j];
      if (w === -1) {
        // Par inexistente
        costMatrix[i][j] = INF;
      } else {
        // Celda real
        costMatrix[i][j] = (mode === 'max') ? (base - w) : w;
      }
    }
  }

  return { L, R, li, rj, edgesMap, costMatrix };
}

/**
 * Húngaro clásico (MIN) sobre matriz **cuadrada**.
 * Devuelve { pairs, total } con índices 0-based sobre la matriz cuadrada.
 * Nota: el filtrado de dummies lo haces luego comparando con n/m reales.
 */
export function hungarianAssign(cost /* NxN */, { allowUnassigned = true } = {}) {
  const N = cost.length;
  if (!N) return { pairs: [], total: 0 };

  const u = Array(N + 1).fill(0);
  const v = Array(N + 1).fill(0);
  const p = Array(N + 1).fill(0);
  const way = Array(N + 1).fill(0);

  for (let i = 1; i <= N; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(N + 1).fill(Infinity);
    const used = Array(N + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= N; j++) if (!used[j]) {
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= N; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else { minv[j] -= delta; }
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }

  const pairs = [];
  let total = 0;
  for (let j = 1; j <= N; j++) {
    const i = p[j] - 1;
    pairs.push([i, j - 1]);
    const c = cost[i][j - 1];
    total += Number.isFinite(c) ? c : 0;
  }
  return { pairs, total };
}

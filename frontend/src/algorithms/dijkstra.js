// src/algorithms/dijkstra.js
// -------------------------------------------------------------
// ✅ MÓDULO: Algoritmo de Dijkstra (caminos mínimos desde un origen)
//    Requiere pesos no negativos. Utilidades para Cytoscape incluidas.
// -------------------------------------------------------------

/** @typedef {{u:string,v:string,w:number}} Edge */
/** @typedef {{nodes:string[], edges:Edge[]}} Graph */

/* ---------------- Dijkstra (caminos mínimos desde origen único) ---------------- */

/**
 * Ejecuta Dijkstra desde un nodo origen
 * @param {Graph} g - Grafo con nodos y aristas
 * @param {string} source - Nodo origen
 * @returns {{dist: Record<string,number>, prev: Record<string,string|null>}}
 */
export function dijkstra(g, source) {
  /** @type {Record<string, number>} */
  const dist = {};
  /** @type {Record<string, string|null>} */
  const prev = {};
  /** @type {Record<string, boolean>} */
  const visited = {};

  // Inicializar
  g.nodes.forEach(v => {
    dist[v] = Number.POSITIVE_INFINITY;
    prev[v] = null;
    visited[v] = false;
  });

  dist[source] = 0;

  // Construcción de lista de adyacencia para acceso rápido
  const adj = {};
  g.nodes.forEach(v => (adj[v] = []));
  g.edges.forEach(e => adj[e.u].push(e));

  // Algoritmo principal (implementación O(V²) suficiente para grafos visuales)
  for (let i = 0; i < g.nodes.length; i++) {
    // Encontrar nodo no visitado con menor distancia
    let u = null;
    let minDist = Number.POSITIVE_INFINITY;

    for (const v of g.nodes) {
      if (!visited[v] && dist[v] < minDist) {
        minDist = dist[v];
        u = v;
      }
    }

    // Si no hay más nodos alcanzables, terminar
    if (u === null || dist[u] === Number.POSITIVE_INFINITY) break;

    visited[u] = true;

    // Relajar aristas adyacentes
    for (const edge of adj[u]) {
      const v = edge.v;
      const alt = dist[u] + edge.w;

      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }

  return { dist, prev };
}

/**
 * Reconstruye el camino desde el origen hasta un destino
 * @param {Record<string,string|null>} prev - Mapa de predecesores
 * @param {string} source - Nodo origen
 * @param {string} target - Nodo destino
 * @returns {string[]} - Camino como lista de nodos
 */
export function reconstructPath(prev, source, target) {
  const path = [];
  let current = target;

  while (current) {
    path.push(current);
    if (current === source) break;
    current = prev[current];
  }

  // Verificar que llegamos al origen
  return (path[path.length - 1] === source) ? path.reverse() : [];
}

/**
 * Calcula holguras de las aristas desde un origen
 * @param {Graph} g - Grafo
 * @param {Record<string,number>} dist - Distancias desde el origen
 * @returns {Record<string,number>} - Holguras por arista (formato "u->v")
 */
export function calculateSlacks(g, dist) {
  /** @type {Record<string, number>} */
  const slack = {};

  for (const e of g.edges) {
    const key = `${e.u}->${e.v}`;
    // slack = dist[v] - dist[u] - peso
    slack[key] = dist[e.v] - dist[e.u] - e.w;
  }

  return slack;
}

/**
 * Encuentra el camino más corto entre dos nodos específicos
 * @param {Graph} g - Grafo
 * @param {string} source - Origen
 * @param {string} target - Destino
 * @returns {{path: string[], distance: number}} - Camino y distancia
 */
export function shortestPath(g, source, target) {
  const { dist, prev } = dijkstra(g, source);
  const path = reconstructPath(prev, source, target);
  const distance = dist[target];

  return { path, distance };
}

/* ------------------- Utilidades para Cytoscape ------------------- */

/**
 * Construye un grafo desde Cytoscape
 * @param {*} cy - Instancia de Cytoscape
 * @returns {Graph}
 */
export function buildGraphFromCy(cy) {
  const nodes = cy.nodes()
    .filter(n => !n.hasClass('text-block'))
    .map(n => n.id());

  const edges = cy.edges().map(e => ({
    u: e.source().id(),
    v: e.target().id(),
    // Extraer peso (toma la última línea si hay formato "h=x\nw")
    w: Number((e.data('weight') || '').toString().split('\n').pop()) || 0
  }));

  return { nodes, edges };
}

/**
 * Obtiene el nombre base de un nodo (primera línea del label)
 * @param {*} node - Nodo de Cytoscape
 * @returns {string}
 */
export function baseNodeLabel(node) {
  return (node.data('label')?.toString().split('\n')[0]) || node.id();
}

/**
 * Limpia estilos de resaltado y críticos
 * @param {*} cy - Instancia de Cytoscape
 */
export function clearStyles(cy) {
  cy.nodes().removeClass('critical highlight');
  cy.edges().removeClass('critical highlight');
}

/**
 * Pinta aristas con una clase CSS
 * @param {*} cy - Instancia de Cytoscape
 * @param {Edge[]} edges - Aristas a pintar
 * @param {string} className - Clase CSS
 */
export function paintEdges(cy, edges, className) {
  edges.forEach(e => {
    const match = cy.$(`edge[source="${e.u}"][target="${e.v}"]`);
    if (!match.empty()) match.addClass(className);
  });

  // También resaltar nodos involucrados
  edges.forEach(e => {
    cy.$id(e.u).addClass(className);
    cy.$id(e.v).addClass(className);
  });
}

/**
 * Etiqueta nodos con sus distancias desde el origen
 * @param {*} cy - Instancia de Cytoscape
 * @param {Record<string,number>} dist - Distancias calculadas
 * @param {Function} resize - Función para redimensionar nodo
 */
export function labelNodesWithDistance(cy, dist, resize) {
  cy.nodes().forEach(n => {
    if (n.hasClass('text-block')) return;

    const d = dist[n.id()];
    const distText = (d === Number.POSITIVE_INFINITY) ? '∞' : d;

    n.data('label', `${baseNodeLabel(n)}\n${distText}`);
    if (resize) resize(n);
  });
}

/**
 * Etiqueta aristas con holguras y pesos
 * @param {*} cy - Instancia de Cytoscape
 * @param {Graph} g - Grafo
 * @param {Record<string,number>} slack - Holguras calculadas
 */
export function labelEdgesWithSlack(cy, g, slack) {
  cy.edges().forEach(e => {
    const key = `${e.source().id()}->${e.target().id()}`;
    const w = g.edges.find(x => x.u === e.source().id() && x.v === e.target().id())?.w ?? 0;
    const h = slack[key] ?? 0;

    e.data('weight', `h=${h}\n${w}`);
  });
}

/**
 * Restaura etiquetas de aristas solo con el peso
 * @param {*} cy - Instancia de Cytoscape
 * @param {Graph} g - Grafo
 */
export function labelEdgesWeightOnly(cy, g) {
  cy.edges().forEach(e => {
    const w = g.edges.find(x => x.u === e.source().id() && x.v === e.target().id())?.w ?? 0;
    e.data('weight', `${w}`);
  });
}

/**
 * Valida que todas las aristas tengan pesos no negativos
 * @param {Graph} g - Grafo
 * @returns {{valid: boolean, negativeEdges: Edge[]}}
 */
export function validateNonNegativeWeights(g) {
  const negativeEdges = g.edges.filter(e => e.w < 0);
  return {
    valid: negativeEdges.length === 0,
    negativeEdges
  };
}

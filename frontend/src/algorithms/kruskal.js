// src/algorithms/kruskal.js
// -------------------------------------------------------------
// ✅ MÓDULO: Algoritmo de Kruskal (árbol de expansión mínima / máxima)
//    Utiliza estructura de conjuntos disjuntos (Union-Find).
//    Compatible con Cytoscape.js.
// -------------------------------------------------------------

/** @typedef {{u:string,v:string,w:number}} Edge */
/** @typedef {{nodes:string[], edges:Edge[]}} Graph */

/* -------------------- Estructura Union-Find -------------------- */
class DisjointSet {
  constructor(elements) {
    this.parent = {};
    this.rank = {};
    for (const e of elements) {
      this.parent[e] = e;
      this.rank[e] = 0;
    }
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // compresión de camino
    }
    return this.parent[x];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    // unión por rango
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}

/* ---------------------- Algoritmo de Kruskal ---------------------- */

/**
 * Ejecuta el algoritmo de Kruskal sobre un grafo no dirigido.
 * @param {Graph} g - Grafo con nodos y aristas.
 * @param {'asc'|'desc'} [mode='asc'] - 'asc' = mínimo, 'desc' = máximo.
 * @returns {{mst: Edge[], totalWeight: number}}
 */
export function kruskal(g, mode = 'asc') {
  if (!g.nodes?.length) return { mst: [], totalWeight: 0 };

  // Ordenar aristas según el modo
  const sortedEdges = [...g.edges].sort((a, b) =>
    mode === 'asc' ? a.w - b.w : b.w - a.w
  );

  const ds = new DisjointSet(g.nodes);
  const mst = [];

  for (const edge of sortedEdges) {
    if (ds.union(edge.u, edge.v)) {
      mst.push(edge);
    }
    // Si ya tenemos n-1 aristas, detener
    if (mst.length === g.nodes.length - 1) break;
  }

  const totalWeight = mst.reduce((sum, e) => sum + e.w, 0);
  return { mst, totalWeight };
}

/* ---------------------- Utilidades para Cytoscape ---------------------- */

/**
 * Construye un grafo desde una instancia de Cytoscape
 * @param {*} cy - Instancia de Cytoscape
 * @returns {Graph}
 */
export function buildGraphFromCy(cy) {
  const nodes = cy
    .nodes()
    .filter(n => !n.hasClass('text-block'))
    .map(n => n.id());

  const edges = cy.edges().map(e => {
    const rawWeight = e.data('weight');
    const parsed = Number(String(rawWeight ?? '').trim());
    return {
      u: e.source().id(),
      v: e.target().id(),
      w: Number.isNaN(parsed) ? 0 : parsed
    };
  });

  return { nodes, edges };
}

/**
 * Limpia estilos previos de resaltado y restaura el estilo base.
 * (Se usa antes de pintar un nuevo MST o al limpiar la pizarra)
 * @param {*} cy - Instancia de Cytoscape
 */
export function clearStyles(cy) {
  if (!cy) return;

  // Quitar clases de highlight
  cy.nodes().removeClass('highlight highlight-max');
  cy.edges().removeClass('highlight highlight-max');

  // Restaurar estilo base de las aristas
  cy.edges().forEach(e => {
    e.style({
      'line-color': '#000',
      'target-arrow-color': '#000',
      'width': 2
    });
  });

  // Restaurar estilo base de los nodos usando sus datos
  cy.nodes().forEach(n => {
    const baseColor = n.data('color') || '#57c3d1';
    const baseBorder = n.data('borderColor') || '#2a7fc0';
    n.style({
      'background-color': baseColor,
      'border-color': baseBorder,
      'box-shadow': 'none'
    });
  });

  cy.style().update();
}

/**
 * Pinta las aristas del MST en el grafo Cytoscape.
 * Usa clases + estilos inline para que se vea igual en
 * ejecución normal y cuando se importa desde JSON.
 * @param {*} cy - Instancia de Cytoscape
 * @param {Edge[]} mst - Aristas a resaltar
 * @param {boolean} [isMax=false] - true = árbol de expansión máxima
 */
export function paintMstEdges(cy, mst, isMax = false) {
  if (!cy) return;

  const color = isMax ? '#ff9a3d' : '#57c3d1';
  const border = isMax ? '#cc6a00' : '#2a7fc0';
  const cls = isMax ? 'highlight-max' : 'highlight';

  // Quitamos clases antiguas, pero NO tocamos estilos base aquí:
  // eso ya lo hace clearStyles antes de llamar a esta función.
  cy.elements().removeClass('highlight highlight-max');

  mst.forEach(({ u, v }) => {
    // Buscar arista u-v (o v-u) porque lo tratamos como no dirigido
    const e = cy.$(
      `edge[source="${u}"][target="${v}"], edge[source="${v}"][target="${u}"]`
    );
    const s = cy.$id(u);
    const t = cy.$id(v);

    if (!e.empty()) {
      e.addClass(cls);
      e.style({
        'line-color': color,
        'target-arrow-color': color,
        'width': 3
      });
    }

    if (!s.empty()) {
      s.addClass(cls);
      s.style({
        'background-color': color,
        'border-color': border
      });
    }

    if (!t.empty()) {
      t.addClass(cls);
      t.style({
        'background-color': color,
        'border-color': border
      });
    }
  });

  cy.style().update();
}

/**
 * Valida que el grafo sea no dirigido (placeholder, siempre true por ahora)
 * @param {Graph} g
 * @returns {boolean}
 */
export function validateUndirected(g) {
  const seen = new Set();
  for (const e of g.edges) {
    const a = `${e.u}-${e.v}`;
    const b = `${e.v}-${e.u}`;
    if (seen.has(a) || seen.has(b)) continue;
    seen.add(a);
  }
  return true;
}

/**
 * Verifica si existen pesos negativos
 * @param {Graph} g
 * @returns {{valid:boolean, negativeEdges:Edge[]}}
 */
export function validateNonNegativeWeights(g) {
  const negativeEdges = g.edges.filter(e => e.w < 0);
  return {
    valid: negativeEdges.length === 0,
    negativeEdges
  };
}

/**
 * Calcula la suma de pesos de un conjunto de aristas
 * @param {Edge[]} edges
 * @returns {number}
 */
export function totalWeight(edges) {
  return edges.reduce((acc, e) => acc + e.w, 0);
}

export default {
  kruskal,
  buildGraphFromCy,
  clearStyles,
  paintMstEdges,
  validateUndirected,
  validateNonNegativeWeights,
  totalWeight
};

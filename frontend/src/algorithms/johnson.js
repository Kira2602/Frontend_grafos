// src/algorithms/johnson.js
// -------------------------------------------------------------
// ✅ MÓDULO ÚNICO: Johnson (mínimos), CPM (ruta crítica / máximos),
//    camino más largo en DAG, y utilidades para Cytoscape.
//    Todo listo para usar desde tu johnson.vue.
// -------------------------------------------------------------

/** @typedef {{u:string,v:string,w:number}} Edge */
/** @typedef {{nodes:string[], edges:Edge[]}} Graph */

/* ---------------- Johnson (APSP / caminos mínimos) ---------------- */

export function bellmanFord(g, s) {
  /** @type {Record<string, number>} */
  const dist = {};
  g.nodes.forEach(v => (dist[v] = Number.POSITIVE_INFINITY));
  dist[s] = 0;

  for (let i = 0; i < g.nodes.length - 1; i++) {
    let changed = false;
    for (const { u, v, w } of g.edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
    if (!changed) break;
  }
  // ciclo negativo
  for (const { u, v, w } of g.edges) {
    if (dist[u] + w < dist[v]) return { dist, negCycle: true };
  }
  return { dist, negCycle: false };
}

function dijkstraFrom(g, s, wprime) {
  /** @type {Record<string, number>} */ const dist = {};
  /** @type {Record<string, string|null>} */ const prev = {};
  /** @type {Record<string, boolean>} */ const visited = {};
  g.nodes.forEach(v => { dist[v] = Number.POSITIVE_INFINITY; prev[v] = null; visited[v] = false; });
  dist[s] = 0;

  // O(V^2) (suficiente para tamaños de pizarra)
  for (let i = 0; i < g.nodes.length; i++) {
    let u = null, best = Number.POSITIVE_INFINITY;
    for (const v of g.nodes) if (!visited[v] && dist[v] < best) { best = dist[v]; u = v; }
    if (u == null) break;
    visited[u] = true;

    for (const e of g.edges) if (e.u === u) {
      const alt = dist[u] + wprime(e.u, e.v);
      if (alt < dist[e.v]) { dist[e.v] = alt; prev[e.v] = u; }
    }
  }
  return { dist, prev };
}

export function johnson(g) {
  const q = '__q__';
  const aug = { nodes: [q, ...g.nodes], edges: [...g.edges, ...g.nodes.map(v => ({ u: q, v, w: 0 }))] };
  const { dist: h, negCycle } = bellmanFord(aug, q);
  if (negCycle) return { h: {}, dist: {}, prev: {}, negCycle: true };

  const wprime = (u, v) => {
    const e = g.edges.find(e => e.u === u && e.v === v);
    return (e ? e.w : 0) + h[u] - h[v];
  };

  /** @type {Record<string, Record<string, number>>} */ const allDist = {};
  /** @type {Record<string, Record<string, string|null>>} */ const allPrev = {};

  for (const s of g.nodes) {
    const { dist: dP, prev } = dijkstraFrom(g, s, wprime);
    allPrev[s] = prev;
    allDist[s] = {};
    for (const t of g.nodes) {
      allDist[s][t] = (dP[t] === Number.POSITIVE_INFINITY)
        ? Number.POSITIVE_INFINITY
        : dP[t] - h[s] + h[t];
    }
  }
  // quita q y devuelve
  const hh = {}; g.nodes.forEach(v => (hh[v] = h[v]));
  return { h: hh, dist: allDist, prev: allPrev, negCycle: false };
}

export function reconstructPath(prev, s, t) {
  const path = [];
  let cur = t;
  while (cur) { path.push(cur); if (cur === s) break; cur = prev[cur]; }
  return (path[path.length - 1] === s) ? path.reverse() : [];
}

export function slacksFromSource(g, s, distS) {
  /** @type {Record<string, number>} */ const slack = {};
  for (const e of g.edges) {
    const key = `${e.u}->${e.v}`;
    slack[key] = distS[e.v] - distS[e.u] - e.w;
  }
  return slack;
}

/* --------------- Máximos en DAG (CPM / ruta crítica) --------------- */

/** Ruta crítica estándar (CPM) en DAG */
export function cpm(g){
  const indeg = {}, outs = {}, ins = {}
  g.nodes.forEach(v => { indeg[v]=0; outs[v]=[]; ins[v]=[] })
  g.edges.forEach(e => { indeg[e.v]++; outs[e.u].push(e); ins[e.v].push(e) })

  const q = g.nodes.filter(v => indeg[v]===0)
  const order=[]
  while(q.length){ const v=q.shift(); order.push(v); for(const e of outs[v]) if(--indeg[e.v]===0) q.push(e.v) }
  if(order.length!==g.nodes.length) return null // no DAG

  const E = {}; g.nodes.forEach(v => E[v]=0)
  for(const v of order) for(const e of outs[v]) E[e.v] = Math.max(E[e.v], E[v] + e.w)
  const duration = Math.max(...g.nodes.map(v => E[v]))

  const L = {}; g.nodes.forEach(v => L[v]=duration)
  for(let i=order.length-1; i>=0; i--){
    const v = order[i]
    L[v] = outs[v].length ? Math.min(...outs[v].map(e => L[e.v]-e.w)) : duration
  }

  const slack = {}
  for(const e of g.edges) slack[`${e.u}->${e.v}`] = L[e.v] - E[e.u] - e.w

  return { E, L, slack, duration, outs, ins }
}

/** Extrae una ruta crítica (holgura 0) de duración máxima */
export function criticalPath(g, cpmRes){
  const { E, slack } = cpmRes
  let end = g.nodes.reduce((a,b) => E[a] >= E[b] ? a : b) // nodo con E máximo
  const edges = [], nodes = [end]

  // retroceder por aristas con holgura 0 y que cumplan E[v]=E[u]+w
  while(true){
    const inEdges = g.edges.filter(e => e.v === nodes[0] && slack[`${e.u}->${e.v}`] === 0 && E[e.v] === E[e.u] + e.w)
    if (!inEdges.length) break
    const best = inEdges.reduce((a,b)=> (a.w>=b.w?a:b))
    edges.unshift(best)
    nodes.unshift(best.u)
  }
  return { nodes, edges, duration: E[end] }
}

/** Camino más largo s→t en DAG (si no defines s/t usa CPM) */
export function longestPathDAGBetween(g, s, t){
  const topo = (() => {
    const indeg = {}; g.nodes.forEach(v => indeg[v]=0)
    g.edges.forEach(e => indeg[e.v]++)
    const q = g.nodes.filter(v => indeg[v]===0), ord=[]
    while(q.length){ const v=q.shift(); ord.push(v); for(const e of g.edges) if(e.u===v && --indeg[e.v]===0) q.push(e.v) }
    return ord.length===g.nodes.length ? ord : null
  })()
  if (!topo) return null

  const outs = {}; g.nodes.forEach(v => outs[v]=[])
  g.edges.forEach(e => outs[e.u].push(e))

  const dist = {}, prev = {}
  g.nodes.forEach(v => { dist[v] = Number.NEGATIVE_INFINITY; prev[v]=null })
  dist[s] = 0

  for (const u of topo){
    if (dist[u]===Number.NEGATIVE_INFINITY) continue
    for (const e of outs[u]){
      const cand = dist[u] + e.w
      if (cand > dist[e.v]) { dist[e.v] = cand; prev[e.v] = u }
    }
  }
  if (dist[t]===Number.NEGATIVE_INFINITY) return { nodes:[], edges:[], duration: null }

  const nodes=[], edges=[]
  let cur = t
  while (cur) { nodes.unshift(cur); if (cur===s) break; const p=prev[cur]; if(!p)break; edges.unshift(g.edges.find(e => e.u===p && e.v===cur)); cur=p }
  return { nodes, edges, duration: dist[t] }
}

/** Versión original simple (mantener compatibilidad) */
export function longestPathDAG(g, s) {
  /** indeg */
  const indeg = {}; g.nodes.forEach(v => (indeg[v] = 0));
  g.edges.forEach(e => indeg[e.v]++);
  const outs = {}; g.nodes.forEach(v => (outs[v] = []));
  g.edges.forEach(e => outs[e.u].push(e));

  const q = g.nodes.filter(v => indeg[v] === 0);
  const order = [];
  while (q.length) { const v = q.shift(); order.push(v); for (const e of outs[v]) if (--indeg[e.v] === 0) q.push(e.v); }

  if (order.length !== g.nodes.length) return null; // no es DAG

  const dist = {}, prev = {};
  g.nodes.forEach(v => { dist[v] = Number.NEGATIVE_INFINITY; prev[v] = null; });
  dist[s] = 0;

  for (const u of order) {
    if (dist[u] === Number.NEGATIVE_INFINITY) continue;
    for (const e of outs[u]) {
      const cand = dist[u] + e.w;
      if (cand > dist[e.v]) { dist[e.v] = cand; prev[e.v] = u; }
    }
  }
  return { dist, prev };
}

/* ------------------- Utilidades para Cytoscape ------------------- */
/* Las siguientes helpers ayudan a leer/escribir desde el grafo de la pizarra
   y a pintar/etiquetar resultados. Úsalas desde tu johnson.vue. */

export function buildGraphFromCy(cy){
  const nodes = cy.nodes().filter(n => !n.hasClass('text-block')).map(n => n.id())
  const edges = cy.edges().map(e => ({
    u: e.source().id(),
    v: e.target().id(),
    // si el label tiene "h=x\nw", tomamos la última línea como peso
    w: Number((e.data('weight')||'').toString().split('\n').pop()) || 0
  }))
  return { nodes, edges }
}

export function baseNodeLabel(n){
  return (n.data('label')?.toString().split('\n')[0]) || n.id()
}

export function clearStyles(cy){
  cy.nodes().removeClass('critical highlight')
  cy.edges().removeClass('critical highlight')
}

export function paintEdges(cy, edges, className){
  edges.forEach(e => {
    const match = cy.$(`edge[source="${e.u}"][target="${e.v}"]`)
    if (!match.empty()) match.addClass(className)
  })
  edges.forEach(e => { cy.$id(e.u).addClass(className); cy.$id(e.v).addClass(className) })
}

export function labelNodesEL(cy, E, L, resize){
  cy.nodes().forEach(n => {
    if (n.hasClass('text-block')) return
    n.data('label', `${baseNodeLabel(n)}\n${E[n.id()]} | ${L[n.id()]}`)
    resize && resize(n)
  })
}

export function labelEdgesSlack(cy, g, slack){
  cy.edges().forEach(e => {
    const key = `${e.source().id()}->${e.target().id()}`
    const w = g.edges.find(x => x.u===e.source().id() && x.v===e.target().id())?.w ?? 0
    e.data('weight', `h=${slack[key] ?? 0}\n${w}`)
  })
}

export function labelNodesDist(cy, distFrom, resize){
  cy.nodes().forEach(n => {
    if (n.hasClass('text-block')) return
    const d = distFrom[n.id()]
    n.data('label', `${baseNodeLabel(n)}\n${d===Number.POSITIVE_INFINITY?'∞':d}`)
    resize && resize(n)
  })
}

export function labelEdgesWeightOnly(cy, g){
  cy.edges().forEach(e => {
    const w = g.edges.find(x => x.u===e.source().id() && x.v===e.target().id())?.w ?? 0
    e.data('weight', `${w}`)
  })
}

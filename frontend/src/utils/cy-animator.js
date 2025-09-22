// src/utils/cy-animator.js
// Animaciones reutilizables para Cytoscape (sin dependencias extra)

export function createCyAnimator(cy) {
  if (!cy) throw new Error('createCyAnimator: cy es requerido')

  const edgeSel = (u, v) => cy.$(`edge[source="${u}"][target="${v}"]`)

  function animateEdgeStyle(edge, style, { duration = 380 } = {}) {
    return new Promise(res => {
      if (!edge || edge.empty()) return res()
      edge.animate({ style }, { duration, complete: () => res() })
    })
  }

  function animateNodeStyle(node, style, { duration = 300 } = {}) {
    return new Promise(res => {
      if (!node || node.empty()) return res()
      node.animate({ style }, { duration, complete: () => res() })
    })
  }

  /** Anima un camino de nodos [n0, n1, ...] */
  async function animatePath(nodeIds, {
    color = '#5eb4ff', // azul para mínimo
    nodeDuration = 300,
    edgeDuration = 380,
    step = 140
  } = {}) {
    if (!nodeIds || nodeIds.length < 2) return
    await animateNodeStyle(cy.$id(nodeIds[0]),
      { 'background-color': color, 'border-color': color }, { duration: nodeDuration })

    for (let i = 0; i < nodeIds.length - 1; i++) {
      const u = nodeIds[i], v = nodeIds[i + 1]
      const e = edgeSel(u, v)
      await animateEdgeStyle(e,
        { 'width': 4, 'line-color': color, 'target-arrow-color': color },
        { duration: edgeDuration })
      await animateNodeStyle(cy.$id(v),
        { 'background-color': color, 'border-color': color }, { duration: nodeDuration })
      await wait(step)
    }
  }

  /** Anima una lista de aristas (por ejemplo las críticas del CPM) */
  async function animateEdges(edges, {
    color = '#f06277', // rojo para CPM
    nodeDuration = 260,
    edgeDuration = 320,
    step = 120
  } = {}) {
    const arr = edges?.toArray ? edges.toArray() : (edges || [])
    for (const e of arr) {
      await animateEdgeStyle(e,
        { 'width': 4, 'line-color': color, 'target-arrow-color': color },
        { duration: edgeDuration })
      await animateNodeStyle(e.source(),
        { 'background-color': color, 'border-color': color }, { duration: nodeDuration })
      await animateNodeStyle(e.target(),
        { 'background-color': color, 'border-color': color }, { duration: nodeDuration })
      await wait(step)
    }
  }

  /** Efecto “dash en movimiento” (opcional) mientras se anima */
  function startDashFlow(edge, {
    dash = [6, 6], speed = 24
  } = {}) {
    if (!edge || edge.empty()) return () => {}
    edge.style({ 'line-dash-pattern': dash })
    let off = 0, stop = false
    function tick() {
      if (stop) return
      off = (off + 1) % 1000
      edge.style('line-dash-offset', off)
      req = requestAnimationFrame(tick)
    }
    let req = requestAnimationFrame(tick)
    return () => { stop = true; cancelAnimationFrame(req); edge.style({ 'line-dash-pattern': [], 'line-dash-offset': 0 }) }
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)) }

  return {
    animatePath,
    animateEdges,
    startDashFlow,
    edgeSel
  }
}

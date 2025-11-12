// src/utils/BinaryTree.js
export class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class BinaryTree {
  constructor() {
    this.root = null;
  }

  // ================================
  // Inserción estándar en ABB
  // ================================
  insert(value) {
    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
  }

  // ================================
  // Recorridos con protección anti-ciclo
  // ================================
  inOrder(node = this.root, result = [], visited = new Set()) {
    if (!node || visited.has(node)) return result;
    visited.add(node);
    this.inOrder(node.left, result, visited);
    result.push(node.value);
    this.inOrder(node.right, result, visited);
    return result;
  }

  preOrder(node = this.root, result = [], visited = new Set()) {
    if (!node || visited.has(node)) return result;
    visited.add(node);
    result.push(node.value);
    this.preOrder(node.left, result, visited);
    this.preOrder(node.right, result, visited);
    return result;
  }

  postOrder(node = this.root, result = [], visited = new Set()) {
    if (!node || visited.has(node)) return result;
    visited.add(node);
    this.postOrder(node.left, result, visited);
    this.postOrder(node.right, result, visited);
    result.push(node.value);
    return result;
  }

  // ================================
  // Altura del árbol
  // ================================
  height(node = this.root, visited = new Set()) {
    if (!node || visited.has(node)) return 0;
    visited.add(node);
    return 1 + Math.max(
      this.height(node.left, visited),
      this.height(node.right, visited)
    );
  }

  // ================================
  // Exportar a JSON
  // ================================
  toJSON() {
    const traverse = (node) => {
      if (!node) return null;
      return {
        value: node.value,
        left: traverse(node.left),
        right: traverse(node.right)
      };
    };
    return JSON.stringify(traverse(this.root), null, 2);
  }

  // ================================
  // Cargar desde JSON
  // ================================
  fromJSON(json) {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    const build = (obj) => {
      if (!obj) return null;
      const node = new Node(obj.value);
      node.left = build(obj.left);
      node.right = build(obj.right);
      return node;
    };
    this.root = build(data);
  }

  // ================================
  // ✅ Reconstrucción desde InOrder + PreOrder
  // ================================
  static buildFromInPre(inOrder, preOrder) {
    if (!inOrder.length || !preOrder.length) return null;

    const build = (inOrder, preOrder) => {
      if (!inOrder.length || !preOrder.length) return null;

      const rootValue = preOrder.shift(); // Primer elemento = raíz
      const root = new Node(rootValue);
      const rootIndex = inOrder.indexOf(rootValue);

      if (rootIndex === -1) return null;

      // Construir primero izquierda, luego derecha
      root.left = build(inOrder.slice(0, rootIndex), preOrder);
      root.right = build(inOrder.slice(rootIndex + 1), preOrder);
      return root;
    };

    const root = build([...inOrder], [...preOrder]);
    const tree = new BinaryTree();
    tree.root = root;
    return tree;
  }

  // ================================
  // ✅ Reconstrucción desde InOrder + PostOrder
  // ================================
  static buildFromInPost(inOrder, postOrder) {
    if (!inOrder.length || !postOrder.length) return null;

    const build = (inOrder, postOrder) => {
      if (!inOrder.length || !postOrder.length) return null;

      const rootValue = postOrder.pop(); // Último elemento = raíz
      const root = new Node(rootValue);
      const rootIndex = inOrder.indexOf(rootValue);

      if (rootIndex === -1) return null;

      // Construir primero derecha, luego izquierda
      root.right = build(inOrder.slice(rootIndex + 1), postOrder);
      root.left = build(inOrder.slice(0, rootIndex), postOrder);

      return root;
    };

    const root = build([...inOrder], [...postOrder]);
    const tree = new BinaryTree();
    tree.root = root;
    return tree;
  }

  // ================================
  // Generar grafo (para Cytoscape)
  // ================================
  toGraph() {
  const nodes = [];
  const edges = [];

  // Separación horizontal y vertical
  const X_STEP = 150;
  const Y_STEP = 100;

  // 🧠 Traverse recursivo con posiciones simétricas correctas
  const traverse = (node, x = 0, y = 0, depth = 0, offset = 1) => {
    if (!node) return;

    // Añadimos el nodo actual
    nodes.push({
      data: { id: String(node.value), label: String(node.value) },
      position: { x, y }
    });

    // 🌳 Hijo izquierdo
    if (node.left) {
      edges.push({
        data: { source: String(node.value), target: String(node.left.value) }
      });
      // izquierda = x - distancia
      traverse(node.left, x - X_STEP / offset, y + Y_STEP, depth + 1, offset * 1.2);
    }

    // 🌳 Hijo derecho
    if (node.right) {
      edges.push({
        data: { source: String(node.value), target: String(node.right.value) }
      });
      // derecha = x + distancia
      traverse(node.right, x + X_STEP / offset, y + Y_STEP, depth + 1, offset * 1.2);
    }
  };

  traverse(this.root);
  return { nodes, edges };
}
}

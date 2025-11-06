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

  inOrder(node = this.root, result = []) {
    if (!node) return result;
    this.inOrder(node.left, result);
    result.push(node.value);
    this.inOrder(node.right, result);
    return result;
  }

  preOrder(node = this.root, result = []) {
    if (!node) return result;
    result.push(node.value);
    this.preOrder(node.left, result);
    this.preOrder(node.right, result);
    return result;
  }

  postOrder(node = this.root, result = []) {
    if (!node) return result;
    this.postOrder(node.left, result);
    this.postOrder(node.right, result);
    result.push(node.value);
    return result;
  }

  height(node = this.root) {
    if (!node) return 0;
    return 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  // Convierte a JSON exportable
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

  // Reconstrucción desde JSON
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

  // Reconstrucción desde inOrder + preOrder
  static buildFromInPre(inOrder, preOrder) {
    if (!inOrder.length || !preOrder.length) return null;
    const rootValue = preOrder[0];
    const root = new Node(rootValue);
    const rootIndex = inOrder.indexOf(rootValue);

    root.left = BinaryTree.buildFromInPre(inOrder.slice(0, rootIndex), preOrder.slice(1, rootIndex + 1));
    root.right = BinaryTree.buildFromInPre(inOrder.slice(rootIndex + 1), preOrder.slice(rootIndex + 1));

    const tree = new BinaryTree();
    tree.root = root;
    return tree;
  }

  // Reconstrucción desde inOrder + postOrder
  static buildFromInPost(inOrder, postOrder) {
    if (!inOrder.length || !postOrder.length) return null;
    const rootValue = postOrder[postOrder.length - 1];
    const root = new Node(rootValue);
    const rootIndex = inOrder.indexOf(rootValue);

    root.left = BinaryTree.buildFromInPost(inOrder.slice(0, rootIndex), postOrder.slice(0, rootIndex));
    root.right = BinaryTree.buildFromInPost(inOrder.slice(rootIndex + 1), postOrder.slice(rootIndex, postOrder.length - 1));

    const tree = new BinaryTree();
    tree.root = root;
    return tree;
  }

  toGraph() {
    if (!this.root) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];

    const traverse = (node) => {
      if (!node) return;
      nodes.push({ data: { id: String(node.value), label: String(node.value) } });

      if (node.left) {
        edges.push({ data: { source: String(node.value), target: String(node.left.value) } });
        traverse(node.left);
      }
      if (node.right) {
        edges.push({ data: { source: String(node.value), target: String(node.right.value) } });
        traverse(node.right);
      }
    };

    traverse(this.root);
    return { nodes, edges };
  }
}

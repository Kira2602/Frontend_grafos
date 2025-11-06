<template>
  <div class="arboles-container">
    <!-- Panel lateral izquierdo: Grafo -->
    <div class="graph-section">
      <div class="graph-header">
        <h2>Visualización del Árbol</h2>
        <button class="style-btn" @click="showPicker = true" title="Cambiar estilo">
          <i class="fa-solid fa-palette"></i>
        </button>
      </div>

      <div
        ref="cyContainer"
        class="cy"
        :class="[`theme-${theme}`, { 'no-grid': !showGrid }]"
        :style="boardStyle"
      ></div>

      <!-- Popup de estilos -->
      <EstiloPizarra
        v-model="showPicker"
        :theme="theme"
        :color="color"
        :image="image"
        @confirm="applyTheme"
      />
    </div>

    <!-- Panel derecho: Controles -->
    <div class="control-section">
      <h1>Árbol Binario de Búsqueda</h1>

      <!-- Pestañas -->
      <div class="tab-buttons">
        <button :class="{ active: mode === 'build' }" @click="switchMode('build')">Construir Árbol</button>
        <button :class="{ active: mode === 'rebuild' }" @click="switchMode('rebuild')">Reconstruir Árbol</button>
      </div>

      <!-- ===================== -->
      <!-- MODO: CONSTRUIR -->
      <!-- ===================== -->
      <div v-if="mode === 'build'" class="build-section">
        <div class="controls">
          <input v-model.number="inputValue" type="number" placeholder="Ingrese un número" @keyup.enter="addNode" />
          <button @click="addNode">Insertar</button>
          <button @click="resetTree">Reset</button>
          <button @click="exportTree">Exportar JSON</button>
          <button @click="importTree">Importar JSON</button>
          <input ref="fileInput" type="file" accept=".json" @change="handleFileImport" hidden />
        </div>

        <div class="stats">
          <span>Número de Nodos: {{ numNodes }}</span>
          <span>Altura del Árbol: {{ height }}</span>
        </div>

        <div class="traversals">
          <h3>Recorridos</h3>
          <div class="buttons">
            <button @click="runTraversal('inOrder')">In-Order</button>
            <button @click="runTraversal('preOrder')">Pre-Order</button>
            <button @click="runTraversal('postOrder')">Post-Order</button>
          </div>
          <p>Resultado: {{ traversalResult.join(', ') }}</p>
        </div>
      </div>

      <!-- ===================== -->
      <!-- MODO: RECONSTRUIR -->
      <!-- ===================== -->
      <div v-else class="rebuild-section">
        <h3>Reconstruir Árbol</h3>

        <div class="mode-selector">
          <label><input type="radio" value="in-pre" v-model="rebuildMode" /> In-Order + Pre-Order</label>
          <label><input type="radio" value="in-post" v-model="rebuildMode" /> In-Order + Post-Order</label>
        </div>

        <div class="inputs">
          <input v-model="inOrderInput" placeholder="In-Order (ej: 4,2,5,1,3)" />
          <input
            v-model="secondOrderInput"
            :placeholder="rebuildMode === 'in-pre' ? 'Pre-Order (ej: 1,2,4,5,3)' : 'Post-Order (ej: 4,5,2,3,1)'"
          />
        </div>

        <div class="buttons">
          <button @click="rebuildTree">Reconstruir</button>
          <button @click="resetTree">Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import cytoscape from "cytoscape";
import { ref, onMounted, nextTick, computed } from "vue";
import gsap from "gsap";
import { BinaryTree } from "@/algorithms/BinaryTree";
import EstiloPizarra from "@/components/EstiloPizarra.vue";

const tree = ref(new BinaryTree());
const inputValue = ref("");
const traversalResult = ref([]);
const numNodes = ref(0);
const height = ref(0);
const mode = ref("build");

const rebuildMode = ref("in-pre");
const inOrderInput = ref("");
const secondOrderInput = ref("");

const cyContainer = ref(null);
const fileInput = ref(null);
let cy = null;

// 🎨 Fondo del área de visualización
const theme = ref("dotted");
const color = ref("#1c212b");
const image = ref("");
const showGrid = ref(true);
const showPicker = ref(false);

const boardStyle = computed(() => ({
  "--board-bg": color.value,
  "--board-image": image.value ? `url('${image.value}')` : "none",
}));

const applyTheme = ({ theme: t, color: c, image: img }) => {
  theme.value = t;
  color.value = c || "#1c212b";
  image.value = img || "";
};

// ==========================
// Cambiar de modo
// ==========================
const switchMode = (m) => {
  mode.value = m;
  resetTree();
};

// ==========================
// Renderizado del árbol
// ==========================
const renderTree = async (target, dataTree) => {
  await nextTick();

  // Inicializar Cytoscape una sola vez
  if (!cy) {
    cy = cytoscape({
      container: cyContainer.value,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "data(color)",
            "text-valign": "center",
            color: "#0f1120", // texto negro
            "font-size": "14px",
            width: 36,
            height: 36,
            "border-width": 2,
            "border-color": "#ffffff55",
            "transition-property": "background-color, width, height",
            "transition-duration": "0.4s",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#6fa96f",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#6fa96f",
            "curve-style": "bezier",
          },
        },
      ],
    });
  }

  const { nodes, edges } = dataTree.toGraph();

  // 🌳 Colorear por tipo de nodo
  const colorizeNodes = (nodo, depth = 0) => {
    if (!nodo) return;
    const id = String(nodo.value);
    let color = "#81c784";
    if (!nodo.left && !nodo.right) color = "#c8e6c9";
    if (depth === 0) color = "#4caf50";
    const el = nodes.find((n) => n.data.id === id);
    if (el) el.data.color = color;
    colorizeNodes(nodo.left, depth + 1);
    colorizeNodes(nodo.right, depth + 1);
  };
  colorizeNodes(dataTree.root);

  cy.elements().remove();
  cy.add([...nodes, ...edges]);

  // Layout vertical
  cy.layout({
    name: "breadthfirst",
    directed: true,
    padding: 20,
    spacingFactor: 1.15,
    fit: false,
    orientation: "vertical",
  }).run();

  // Animación
  gsap.from(cy.nodes().map((n) => n.popperRef()), {
    scale: 0.6,
    opacity: 0,
    duration: 0.5,
    stagger: 0.05,
  });

  if (cy.nodes().length > 10) cy.fit();
};

// ==========================
// Inserción y manejo del árbol
// ==========================
const addNode = () => {
  if (inputValue.value === "" || isNaN(inputValue.value)) return;
  tree.value.insert(Number(inputValue.value));
  inputValue.value = "";
  updateStats();
  renderTree("build", tree.value);
};

const resetTree = () => {
  tree.value = new BinaryTree();
  traversalResult.value = [];
  updateStats();
  if (cy) cy.elements().remove();
};

const updateStats = () => {
  numNodes.value = tree.value.inOrder().length;
  height.value = tree.value.height();
};

// ==========================
// Recorridos
// ==========================
const runTraversal = (type) => {
  traversalResult.value = tree.value[type]();
  animateTraversal(traversalResult.value);
};

const animateTraversal = (order) => {
  if (!cy) return;
  const nodes = cy.nodes();
  let i = 0;
  const interval = setInterval(() => {
    nodes.forEach((n) => n.style("background-color", n.data("color")));
    if (i < order.length) {
      const node = cy.$id(String(order[i]));
      node.style("background-color", "#ff7043");
      i++;
    } else clearInterval(interval);
  }, 700);
};

// ==========================
// Exportar / importar JSON
// ==========================
const exportTree = () => {
  const blob = new Blob([tree.value.toJSON()], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "arbol.json";
  link.click();
};

const importTree = () => fileInput.value.click();

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    tree.value.fromJSON(e.target.result);
    updateStats();
    renderTree("build", tree.value);
  };
  reader.readAsText(file);
};

// ==========================
// Reconstrucción
// ==========================
const rebuildTree = () => {
  const inArr = inOrderInput.value.split(",").map((n) => parseInt(n.trim())).filter((n) => !isNaN(n));
  const secArr = secondOrderInput.value.split(",").map((n) => parseInt(n.trim())).filter((n) => !isNaN(n));

  if (!inArr.length || !secArr.length) {
    alert("Por favor, ingrese recorridos válidos.");
    return;
  }

  if (rebuildMode.value === "in-pre") tree.value = BinaryTree.buildFromInPre(inArr, secArr);
  else tree.value = BinaryTree.buildFromInPost(inArr, secArr);

  updateStats();
  renderTree("rebuild", tree.value);
};

onMounted(() => renderTree("build", tree.value));
</script>

<style scoped lang="scss">
$navbar-height: 72px;
$page-bg: #0f1120;
$panel-bg: #2c2f3a;
$panel-border: rgba(255, 255, 255, 0.08);
$text-color: #e7e7ec;
$accent: #567c8d;
$shadow: 0 10px 24px rgba(0, 0, 0, 0.25);

.arboles-container {
  min-height: calc(100vh - $navbar-height);
  padding-top: calc($navbar-height + 16px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: $page-bg;
  color: $text-color;
  font-family: "Poppins", sans-serif;
  padding-bottom: 48px;
  gap: 28px;
}

/* ===== Panel izquierdo (grafo) ===== */
.graph-section {
  flex: 0 0 480px;
  background: $panel-bg;
  border: 1px solid $panel-border;
  border-radius: 16px;
  box-shadow: $shadow;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.graph-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  h2 {
    font-size: 18px;
    color: $text-color;
  }

  .style-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 6px 10px;
    color: $text-color;
    cursor: pointer;
    transition: background 0.2s;
    i {
      font-size: 14px;
    }
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

/* Fondo tipo Graphroom */
.cy {
  width: 100%;
  height: 440px;
  border-radius: 12px;
  background-color: var(--board-bg, #1c212b);
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.08) 1.1px, transparent 1.1px);
  background-size: 14px 14px;
  box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.08);

  &.theme-grid {
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  &.theme-dotted {
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1.1px, transparent 1.1px);
    background-size: 14px 14px;
  }

  &.theme-plain {
    background-image: none;
  }

  &.theme-image {
    background-image: var(--board-image);
    background-size: cover;
    background-position: center;
  }
}

/* ===== Panel derecho ===== */
.control-section {
  flex: 1;
  background: $panel-bg;
  border: 1px solid $panel-border;
  border-radius: 16px;
  box-shadow: $shadow;
  padding: 24px 28px;
}
h1 {
  text-align: center;
  color: $text-color;
  font-size: 22px;
  margin-bottom: 14px;
}

.tab-buttons {
  text-align: center;
  margin-bottom: 18px;
}
.tab-buttons button {
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid $panel-border;
  color: $text-color;
  font-weight: 600;
  border-radius: 10px;
  margin: 3px;
  cursor: pointer;
  transition: background 0.2s, transform 0.05s;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
  &:active {
    transform: translateY(1px);
  }
}
.tab-buttons .active {
  background: $accent;
  color: #ecebe6;
}

.controls input,
.inputs input {
  background: rgba(255, 255, 255, 0.08);
  color: $text-color;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px;
  border-radius: 8px;
  width: 160px;
  margin-right: 8px;
  font-weight: 500;
}

.controls button,
.buttons button {
  background: $accent;
  border: none;
  color: #ecebe6;
  padding: 8px 14px;
  border-radius: 8px;
  margin: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: filter 0.2s;
  &:hover {
    filter: brightness(1.08);
  }
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.traversals {
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 12px;
}

.traversals h3 {
  margin-bottom: 8px;
  font-size: 16px;
  color: $text-color;
}
.traversals p {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 960px) {
  .arboles-container {
    flex-direction: column;
    align-items: center;
    padding: calc($navbar-height + 10px) 12px 40px;
  }
  .graph-section {
    width: 100%;
    max-width: 600px;
  }
  .control-section {
    width: 100%;
    margin-top: 20px;
  }
}
</style>

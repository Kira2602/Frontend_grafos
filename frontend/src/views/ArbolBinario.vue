<template>
  <div class="arboles-container">
    <!-- Panel lateral izquierdo: Grafo -->
    <!-- Panel lateral izquierdo: Grafo -->
    <div class="graph-section">
      <div class="graph-header">
        <h2>Visualización del Árbol 🌲</h2>
        <button class="style-btn" @click="showPicker = true" title="Cambiar estilo">
          <i class="fa-solid fa-palette"></i>
        </button>
      </div>

      <!-- Área de dibujo -->
      <div
        ref="cyContainer"
        class="cy"
        :class="[`theme-${theme}`, { 'no-grid': !showGrid }]"
        :style="boardStyle"
      ></div>

      <!-- 🔹 Botón flotante de Reset visible en ambos modos -->
      <button class="reset-float-btn" @click="resetTree" title="Reiniciar Árbol">
        <i class="fa-solid fa-rotate-right"></i>
      </button>

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
        <button :class="{ active: mode === 'build' }" @click="switchMode('build')">
          <div class="lottie-container">
            <iframe
              src="https://lottie.host/embed/dc81bef4-269f-4413-9293-68181bc58553/4k1Hf7JxFN.lottie"
              frameborder="0"
              class="lottie-icon"
            ></iframe>
          </div>
          <span>Construir Árbol</span>
        </button>

        <button :class="{ active: mode === 'rebuild' }" @click="switchMode('rebuild')">
          <div class="lottie-container">
            <iframe
              src="https://lottie.host/embed/fb931282-f9a5-4feb-94b7-403bb1384049/Hhv63n0gUW.lottie"
              frameborder="0"
              class="lottie-icon"
            ></iframe>
          </div>
          <span>Reconstruir Árbol</span>
        </button>
      </div>

      <!-- ===================== -->
      <!-- MODO: CONSTRUIR -->
      <!-- ===================== -->
      <div v-if="mode === 'build'" class="build-section">
        <div class="controls">
          <input v-model.number="inputValue" type="number" placeholder="Ingrese un número" @keyup.enter="addNode" />
          <button @click="addNode">Insertar</button>
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

        <!-- 🔹 Nueva selección de modo -->
        <div class="rebuild-modes">
          <button
            :class="{ active: rebuildMode === 'in-pre' }"
            @click="rebuildMode = 'in-pre'"
          >
            In-Order + Pre-Order
          </button>
          <button
            :class="{ active: rebuildMode === 'in-post' }"
            @click="rebuildMode = 'in-post'"
          >
            In-Order + Post-Order
          </button>
        </div>

        <div class="inputs">
          <input v-model="inOrderInput" placeholder="In-Order (ej: 4,2,5,1,3)" />
          <input
            v-model="secondOrderInput"
            :placeholder="rebuildMode === 'in-pre' ? 'Pre-Order (ej: 1,2,4,5,3)' : 'Post-Order (ej: 4,5,2,3,1)'"
          />
        </div>

        <div class="buttons rebuild-actions">
          <button @click="rebuildTree">Reconstruir</button>
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
            color: "#0f1120",
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
 // ✅ Usar layout "preset" para mantener las posiciones definidas en toGraph()
    cy.layout({
      name: "preset",     // ← no genera su propio layout
      animate: false,
    }).run();

    // 🔄 Centrar árbol en pantalla
    cy.fit(cy.nodes(), 80);

  //cy.center();
  // ==========================
  // 🎬 Animación condicional (solo en reconstruir)
  // ==========================
  if (target === "rebuild") {
    const nodes = cy.nodes();
    const edges = cy.edges();

    // Ocultar todo inicialmente
    nodes.forEach((n) => n.style("opacity", 0));
    edges.forEach((e) => e.style("opacity", 0));

    const tl = gsap.timeline({ defaults: { duration: 0.35, ease: "back.out(1.7)" } });

    // 🔹 Aparición progresiva de nodos con un "destello" (color temporal)
    nodes.forEach((node, i) => {
      const originalColor = node.data("color");
      tl.to({}, {
      duration: 0.3,
      onStart: () => {
        node.style("background-color", "#ffcc80");
        node.style("width", "42px");
        node.style("height", "42px");
      },
      onComplete: () => {
        node.style("background-color", originalColor);
        node.style("width", "36px");
        node.style("height", "36px");
        node.style("opacity", 1);
      },
    }, i * 0.18);

    });

    // 🔸 Luego aparecen las aristas
    tl.to({}, { duration: 0.2 }); // pequeño delay
    edges.forEach((edge, i) => {
      tl.to({}, {
        duration: 0.2,
        onStart: () => edge.style("opacity", 1),
      }, "<+=0.08");
    });

  } else {
    // 🔹 Animación simple (modo construir)
    gsap.from(cy.nodes().map((n) => n.popperRef()), {
      scale: 0.6,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
    });
  }

    // 🔄 Centrar el árbol en pantalla
    cy.fit(cy.nodes(), 80);

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

  let newTree = null;

  if (rebuildMode.value === "in-pre") {
    newTree = BinaryTree.buildFromInPre(inArr, secArr);
  } else {
    newTree = BinaryTree.buildFromInPost(inArr, secArr);
  }

  if (!newTree || !newTree.root) {
    alert("Los recorridos no coinciden o no forman un árbol válido.");
    return;
  }

  tree.value = newTree;
  updateStats();
  console.log("Árbol reconstruido:", JSON.stringify(tree.value.root, null, 2));
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
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background: $page-bg;
  color: $text-color;
  font-family: "Poppins", sans-serif;
  padding: calc($navbar-height + 16px) 24px 48px;
  gap: 20px;
}

/* ===== Panel izquierdo (grafo) ===== */
.graph-section {
  flex: 1;
  background: $panel-bg;
  border: 1px solid $panel-border;
  border-radius: 16px;
  box-shadow: $shadow;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.reset-float-btn {
  position: absolute;
  bottom: 45px; 
  right: 28px;  
  background: $accent;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 44px; 
  height: 44px; 
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transition: all 0.25s ease;
  z-index: 10;

  &:hover {
    background: lighten($accent, 8%);
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.94);
  }

  i {
    pointer-events: none;
  }
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
  height: 75vh; 
  border-radius: 12px;
  background-color: #ffffff; 
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.08) 1.2px, transparent 1.2px);
  background-size: 14px 14px;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.05);

  &.theme-grid {
    background-image: 
      linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  &.theme-dotted {
    background-image: radial-gradient(circle, rgba(0, 0, 0, 0.08) 1.2px, transparent 1.2px);
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
h1 {
  text-align: center;
  color: $text-color;
  font-size: 22px;
  margin-bottom: 14px;
}

.tab-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-buttons button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid $panel-border;
  color: $text-color;
  font-weight: 600;
  border-radius: 14px;
  padding: 10px;
  cursor: pointer;
  transition: background 0.2s, transform 0.05s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(1px);
  }

  span {
    margin-top: 8px;
    font-size: 14px;
  }

.lottie-container {
  width: 120px;
  height: 120px; 
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px; 

  .lottie-icon {
    width: 120%;
    height: 120%;
    border: none;
    border-radius: 12px;
    transform: scale(1.1);
    pointer-events: none;
  }
}
}

.tab-buttons .active {
  background: $accent;
  color: #ecebe6;
  box-shadow: 0 0 10px rgba(86, 124, 141, 0.8);
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
.rebuild-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.rebuild-modes {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin: 10px 0 18px 0;
}

.rebuild-modes button {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $text-color;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &.active {
    background: $accent;
    color: #fff;
    box-shadow: 0 0 10px rgba(86, 124, 141, 0.8);
  }
}

.rebuild-actions {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
@media (max-width: 960px) {
  .arboles-container {
    flex-direction: column;
    align-items: center;
  }
  .graph-section,
  .control-section {
    width: 100%;
    max-width: 100%;
  }
}
</style>

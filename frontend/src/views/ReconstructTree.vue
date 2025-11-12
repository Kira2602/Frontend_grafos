<template>
  <div class="reconstruct-container">
    <h2>Reconstruir Árbol Binario</h2>

    <div class="mode-buttons">
      <button
        :class="{ active: mode === 'in-pre' }"
        @click="mode = 'in-pre'"
      >
        In-Order + Pre-Order
      </button>
      <button
        :class="{ active: mode === 'in-post' }"
        @click="mode = 'in-post'"
      >
        In-Order + Post-Order
      </button>
    </div>

    <div class="inputs">
      <input v-model="inOrder" placeholder="In-Order (ej. 4,2,5,1,3)" />
      <input
        v-model="secondOrder"
        :placeholder="mode==='in-pre' ? 'Pre-Order (ej. 1,2,4,5,3)' : 'Post-Order (ej. 4,5,2,3,1)'"
      />
      <button @click="rebuildTree">Reconstruir</button>
      <button @click="resetTree">Reset</button>
    </div>

    <div ref="cyContainer" class="cy"></div>
  </div>
</template>

<script setup>
import cytoscape from "cytoscape";
import { ref, onMounted } from "vue";
import { BinaryTree } from "../utils/BinaryTree";
import { gsap } from "gsap";

const cyContainer = ref(null);
let cy = null;
const mode = ref("in-pre");
const inOrder = ref("");
const secondOrder = ref("");
let tree = null;

// ======= Dibujar árbol con animación =======
// ==== Nueva versión del renderizado con animación visible ====
const renderTreeAnimated = () => {
  if (!tree || !tree.root) return;

  const { nodes, edges } = tree.toGraph();

  if (!cy) {
    cy = cytoscape({
      container: cyContainer.value,
      style: [
        {
          selector: "node",
          style: {
            "label": "data(label)",
            "background-color": "#FFB680",
            "text-valign": "center",
            "color": "#333",
            "width": 45,
            "height": 45,
            "font-size": "16px",
            "opacity": 0,
            "transform": "scale(0)"
          },
        },
        {
          selector: "edge",
          style: {
            "width": 2,
            "line-color": "#FFCC99",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#FFCC99",
            "curve-style": "bezier",
            "opacity": 0
          },
        },
      ],
    });
  }
  cy.elements().remove();
cy.add([...nodes, ...edges]);

// ⚙️ Asegurar que Cytoscape use las posiciones originales de toGraph()
// (sin reordenar ni aplicar layout automático)
cy.layout({
  name: "preset", // usa las coordenadas manuales
  animate: false
}).run();

// 🔄 Ajuste para centrar el árbol en pantalla
cy.fit(cy.nodes(), 80);


  const allNodes = cy.nodes();
  const allEdges = cy.edges();

  // ✅ GSAP timeline para aparición secuencial
  const tl = gsap.timeline({ defaults: { duration: 0.4, ease: "back.out(1.7)" } });

  allNodes.forEach((node, i) => {
    const ele = node.popperRef(); // referencia del DOM virtual de Cytoscape
    tl.to(node.style(), {
      opacity: 1,
      duration: 0.3,
      onUpdate: () => node.style("transform", `scale(${gsap.utils.clamp(0, 1.1, gsap.getProperty(ele, "scale") || 1)})`),
    }, i * 0.2);
  });

  // 🔶 Aparecen aristas luego de los nodos
  tl.to({}, { duration: 0.2 }); // pequeño delay
  allEdges.forEach((edge, i) => {
    tl.to(edge.style(), {
      opacity: 1,
      duration: 0.3,
      ease: "power1.inOut",
    }, "<+=0.05");
  });
};
const addNode = () => {
  if (inputValue.value === "") return;
  tree.value.insert(inputValue.value);
  inputValue.value = "";
  updateStats();
  renderTree("build", tree.value);

  // Pequeño delay para obtener el nuevo nodo renderizado
  setTimeout(() => {
    const lastNode = cy.nodes()[cy.nodes().length - 1];
    if (lastNode) {
      gsap.fromTo(
        lastNode.style(),
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.8)",
          onUpdate: () => lastNode.style("transform", "scale(1)"),
        }
      );
    }
  }, 150);
};

  // 🔶 Aristas aparecen después
  setTimeout(() => {
    const nodes = cy.nodes();
    const last = nodes[nodes.length - 1];
    if (last) {
        last.animate(
        { style: { opacity: 1, "transform": "scale(1.2)" } },
        { duration: 250, easing: "ease-out" }
        ).promise('completed').then(() => {
        last.animate({ style: { "transform": "scale(1)" } }, { duration: 150 });
        });
    }
    }, 100);

// ======= Reconstrucción del árbol =======
const rebuildTree = () => {
  const inArr = inOrder.value.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  const secArr = secondOrder.value.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));

  if (!inArr.length || !secArr.length) {
    alert("Por favor, ingrese ambos recorridos correctamente.");
    return;
  }

  if (mode.value === "in-pre")
    tree = BinaryTree.buildFromInPre(inArr, secArr);
  else
    tree = BinaryTree.buildFromInPost(inArr, secArr);

  renderTreeAnimated();
};

// ======= Reset del árbol =======
const resetTree = () => {
  tree = null;
  if (cy) cy.elements().remove();
};

onMounted(() => {
  cy = cytoscape({
    container: cyContainer.value,
    style: [
      { selector: "node", style: { "label": "data(label)", "background-color": "#FFD3A1" } },
      { selector: "edge", style: { "width": 2, "line-color": "#FFCA99" } },
    ],
  });
});
</script>

<style scoped>
.reconstruct-container {
  max-width: 900px;
  margin: auto;
  text-align: center;
  background: #fff8f4;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(255, 188, 150, 0.3);
}
.mode-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.mode-buttons button {
  background: #ffb680;
  border: none;
  color: #333;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.mode-buttons button:hover {
  background: #ff9a55;
  transform: translateY(-1px);
}

.mode-buttons .active {
  background: #ff9a55;
  color: #fff;
  box-shadow: 0 0 10px rgba(255, 154, 85, 0.6);
}

.inputs {
  margin-top: 20px; /* 🔹 separa de los botones de modo */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.cy {
  height: 400px;
  width: 100%;
  background-color: #fffaf6;
  border-radius: 10px;
  margin: 15px 0;
}
</style>

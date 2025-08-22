<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const bgRef = ref(null);
const particlesRef = ref(null);

function createShapes() {
  const background = bgRef.value;
  if (!background) return;
  const types = ["square", "circle", "triangle", "rectangle"];
  for (let i = 0; i < 40; i++) {
    const shape = document.createElement("div");
    shape.className = `shape ${types[Math.floor(Math.random() * types.length)]}`;
    shape.style.left = `${Math.random() * 100}%`;
    shape.style.top = `${Math.random() * 100}%`;
    shape.style.animationDelay = `${Math.random() * 10}s`;
    shape.style.animationDuration = `${Math.random() * 10 + 10}s`;
    background.appendChild(shape);
  }
}

function createParticles() {
  const container = particlesRef.value;
  if (!container) return;
  for (let i = 0; i < 100; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    p.style.animationDuration = `${Math.random() * 4 + 4}s`;
    container.appendChild(p);
  }
}

let mouseHandler = null;
function addMouseInteraction() {
  mouseHandler = (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    const shapes = bgRef.value?.querySelectorAll(".shape") ?? [];
    shapes.forEach((s) => {
      const speed = 0.05;
      const posX = parseFloat(s.style.left);
      const posY = parseFloat(s.style.top);
      s.style.left = `${posX + (x - 0.5) * speed}%`;
      s.style.top = `${posY + (y - 0.5) * speed}%`;
    });
  };
  document.addEventListener("mousemove", mouseHandler);
}

onMounted(() => {
  createShapes();
  createParticles();
  addMouseInteraction();
});

onBeforeUnmount(() => {
  if (mouseHandler) document.removeEventListener("mousemove", mouseHandler);
  bgRef.value?.replaceChildren();
  particlesRef.value?.replaceChildren();
});
</script>

<template>
  <section class="stage">
    <div class="geometric-background" ref="bgRef"></div>
    <div class="particles" ref="particlesRef"></div>
    <div class="gradient-overlay"></div>

    <div class="container">
      <slot />
    </div>
  </section>
</template>

<!-- Bloque SCOPED: sólo layout y contenedores -->
<style scoped>
.stage {
  position: relative;
  min-height: 100vh;
  background: #1a1a2e;
  overflow: hidden;
  padding-top: 72px; /* altura del navbar */
}

.container {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 72px);
  text-align: center;
  color: white;
}

.geometric-background,
.particles,
.gradient-overlay {
  position: absolute;
  inset: 0;
}

.gradient-overlay {
  background: radial-gradient(circle at center, transparent 0%, #1a1a2e 80%);
  animation: pulse-overlay 10s infinite alternate;
  z-index: 5;
}

@keyframes pulse-overlay {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}
</style>

<!-- Bloque GLOBAL: estilos para elementos creados dinámicamente -->
<style>
/* Figuras y partículas (NO scoped para que apliquen) */
.shape {
  position: absolute;
  opacity: 0.2;
  transform-origin: center;
  z-index: 1;
}
.square {
  width: 40px; height: 40px; background: #f72585;
  animation-name: rotate; animation-timing-function: linear; animation-iteration-count: infinite;
}
.circle {
  width: 60px; height: 60px; border-radius: 50%; background: #4cc9f0;
  animation-name: pulse; animation-direction: alternate; animation-iteration-count: infinite;
}
.triangle {
  width: 0; height: 0;
  border-left: 25px solid transparent; border-right: 25px solid transparent;
  border-bottom: 50px solid #7209b7;
  animation-name: float; animation-timing-function: ease-in-out; animation-iteration-count: infinite;
}
.rectangle {
  width: 80px; height: 30px; background: #4361ee;
  animation-name: slide; animation-timing-function: linear; animation-iteration-count: infinite;
}

.particles { z-index: 0; }
.particle {
  position: absolute; width: 2px; height: 2px; background: #fff; opacity: .5;
  animation-name: sparkle; animation-timing-function: linear; animation-iteration-count: infinite;
}

/* Animaciones */
@keyframes rotate { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
@keyframes pulse { 0%{transform:scale(1);opacity:.1} 50%{transform:scale(1.5);opacity:.3} 100%{transform:scale(1);opacity:.1} }
@keyframes float { 0%{transform:translate(0,0) rotate(0)} 50%{transform:translate(20px,-20px) rotate(180deg)} 100%{transform:translate(0,0) rotate(360deg)} }
@keyframes slide { 0%{transform:translateX(-100px) rotate(0)} 50%{transform:translateX(100px) rotate(180deg)} 100%{transform:translateX(-100px) rotate(360deg)} }
@keyframes sparkle { 0%{opacity:0} 50%{opacity:.8} 100%{opacity:0} }
</style>

<template>
  <div v-if="modelValue" class="popup-mask" @click.self="close">
    <div class="popup-card">
      <center><h3>🌱 Generar Árbol Aleatorio</h3></center>

      <!-- Lottie animación -->
      <div class="popup-lottie">
        <iframe
          class="popup-lottie-frame"
          src="https://lottie.host/embed/c27429e6-1a04-4266-87a5-f7f0662a7451/26xVaJMHuH.lottie"
          frameborder="0"
        ></iframe>
      </div>


      <div class="popup-fields">
        <label>Número de nodos:</label>
        <input v-model.number="numNodos" type="number" min="1" />

        <label>Valor mínimo:</label>
        <input v-model.number="valorMin" type="number" />

        <label>Valor máximo:</label>
        <input v-model.number="valorMax" type="number" />
      </div>

      <div class="popup-actions">
        <button class="btn btn-sec" @click="close">Cancelar</button>
        <button class="btn btn-main" @click="generar">Generar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "confirm"]);

const numNodos = ref(5);
const valorMin = ref(1);
const valorMax = ref(100);

function close() {
  emit("update:modelValue", false);
}

function generar() {
  if (numNodos.value <= 0 || valorMin.value > valorMax.value) {
    alert("Verifique los valores ingresados.");
    return;
  }
  const valores = [];
  while (valores.length < numNodos.value) {
    const val = Math.floor(Math.random() * (valorMax.value - valorMin.value + 1)) + valorMin.value;
    if (!valores.includes(val)) valores.push(val);
  }
  emit("confirm", valores);
  close();
}
</script>

<style scoped>
.popup-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 50;
}
.popup-card {
  width: min(420px, 90vw);
  background: #2c2f3a;
  color: #e7e7ec;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}
.popup-lottie {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0 16px;
}
.popup-lottie-frame {
  width: 160px;
  height: 160px;
  border: none;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(86, 124, 141, 0.4);
  pointer-events: none;
}
.popup-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0;
}
.popup-fields label {
  font-weight: 600;
  font-size: 0.95rem;
}
.popup-fields input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #e7e7ec;
  padding: 8px;
}
.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
.btn {
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-weight: 600;
  transition: 0.2s;
}
.btn-sec {
  background: #2f4156;
  color: #ecebe6;
}
.btn-main {
  background: #567c8d;
  color: #fff;
}
.btn:hover {
  filter: brightness(1.1);
}
</style>

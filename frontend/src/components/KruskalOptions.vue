<template>
  <div v-if="modelValue" class="jo-mask" @click.self="close">
    <div class="jo-card">
      <center><h3>Kruskal</h3></center>

      <!-- Lottie centrado -->
      <div class="jo-lottie">
        <iframe
          class="jo-lottie-frame"
          title="Kruskal animation"
          src="https://lottie.host/embed/ea7b47c8-d5c3-47e9-8b73-bb0a6bb16821/tztYv3kGKy.lottie"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>

      <p class="jo-sub">
        Selecciona qué tipo de árbol de expansión deseas generar.
      </p>

      <div class="jo-grid-2">
        <button
          class="jo-card-btn"
          :class="{ active: mode === 'min' }"
          @click="choose('min')"
        >
          <div class="jo-ico"><i class="fa-solid fa-compress"></i></div>
          <div class="jo-ttl">Árbol de Expansión Mínima</div>
          <div class="jo-txt">
            Encuentra el conjunto de aristas con <b>peso total mínimo</b>.
          </div>
        </button>

        <button
          class="jo-card-btn"
          :class="{ active: mode === 'max' }"
          @click="choose('max')"
        >
          <div class="jo-ico"><i class="fa-solid fa-expand"></i></div>
          <div class="jo-ttl">Árbol de Expansión Máxima</div>
          <div class="jo-txt">
            Encuentra el conjunto de aristas con <b>peso total máximo</b>.
          </div>
        </button>
      </div>

      <div class="jo-info">
        <i class="fa-solid fa-circle-info"></i>
        <div>
          <strong>Kruskal</strong> construye el árbol de expansión conectando los nodos
          de menor o mayor costo posible sin formar ciclos.
          <br />
          Los pesos deben ser <strong>no negativos</strong>.
        </div>
      </div>

      <div class="jo-actions">
        <button class="btn btn-sec" @click="close">Cancelar</button>
        <button
          class="btn btn-pri"
          :disabled="!mode"
          @click="confirm"
        >
          <i class="fa-solid fa-play"></i> Ejecutar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const mode = ref('')

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) mode.value = ''
  }
)

function close() {
  emit('update:modelValue', false)
}

function choose(m) {
  mode.value = m
}

function confirm() {
  emit('confirm', { mode: mode.value })
  close()
}
</script>

<style scoped>
.jo-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 50;
}

.jo-card {
  width: min(560px, 94vw);
  background: #2c2f3a;
  color: #e7e7ec;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  font-family: "Poppins", sans-serif;
}

/* Lottie centrado */
.jo-lottie {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 6px 0 10px;
}
.jo-lottie-frame {
  width: min(180px, 50vw);
  height: min(180px, 50vw);
  border: 0;
  background: transparent;
  border-radius: 12px;
  pointer-events: none;
}

/* Texto */
.jo-sub {
  opacity: 0.9;
  margin: 0.25rem 0 1rem;
  text-align: center;
}

/* Botones de modo */
.jo-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 1rem;
}
.jo-card-btn {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  background: #567c8d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: transform 0.06s, filter 0.2s, border-color 0.2s;
}
.jo-card-btn:hover {
  filter: brightness(1.05);
  border-color: rgba(255, 255, 255, 0.18);
}
.jo-card-btn:active {
  transform: translateY(1px);
}
.jo-card-btn.active {
  border-color: #9ad0f5;
  box-shadow: 0 0 0 2px rgba(86, 124, 141, 0.5);
}
.jo-ico {
  font-size: 22px;
  line-height: 1;
}
.jo-ttl {
  font-weight: 800;
}
.jo-txt {
  opacity: 0.9;
  font-size: 0.95rem;
}

/* Info box */
.jo-info {
  background: rgba(86, 124, 141, 0.12);
  border: 1px solid rgba(86, 124, 141, 0.25);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  gap: 10px;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 14px;
}
.jo-info i {
  color: #567c8d;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}
.jo-info strong {
  color: #fff;
}

/* Acciones */
.btn {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.06s, filter 0.2s, border-color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn:active {
  transform: translateY(1px);
}
.btn-sec {
  background: #2f4156;
  color: #ecebe6;
}
.btn-sec:hover {
  filter: brightness(1.08);
  border-color: rgba(255, 255, 255, 0.18);
}
.btn-pri {
  background: #567c8d;
  color: #ecebe6;
  border-color: rgba(255, 255, 255, 0.15);
}
.btn-pri:hover:not(:disabled) {
  filter: brightness(1.08);
  border-color: rgba(255, 255, 255, 0.25);
}
.btn-pri:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.jo-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

/* Responsive */
@media (max-width: 560px) {
  .jo-grid-2 {
    grid-template-columns: 1fr;
  }
  .jo-actions {
    flex-direction: column-reverse;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

<template>
  <div v-if="modelValue" class="jo-mask" @click.self="close">
    <div class="jo-card">
      <center><h3>Kruskal</h3></center>

      <p class="jo-sub">
        Selecciona qué tipo de árbol de expansión deseas generar.
      </p>

      <div class="jo-grid-2">
        <!-- MÍNIMO -->
        <button
          class="jo-card-btn"
          :class="{ active: mode === 'min' }"
          @click="choose('min')"
        >
          <div class="jo-card-lottie">
            <iframe
              class="jo-card-lottie-frame"
              title="Árbol mínimo"
              src="https://lottie.host/embed/e9f13b40-49ab-4e18-970f-335670644c9f/GB1npz4bBg.lottie"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
          <div class="jo-ttl">Minimizar</div>
          <div class="jo-txt">
            Encuentra el conjunto de aristas con
            <b>peso total mínimo</b>.
          </div>
        </button>

        <!-- MÁXIMO -->
        <button
          class="jo-card-btn"
          :class="{ active: mode === 'max' }"
          @click="choose('max')"
        >
          <div class="jo-card-lottie">
            <iframe
              class="jo-card-lottie-frame"
              title="Árbol máximo"
              src="https://lottie.host/embed/6f7305c1-f0ed-45f0-bb5f-8b172a473abe/lvOBaxvlbO.lottie"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
          <div class="jo-ttl">Maximizar</div>
          <div class="jo-txt">
            Encuentra el conjunto de aristas con
            <b>peso total máximo</b>.
          </div>
        </button>
      </div>

      <div class="jo-info">
        <i class="fa-solid fa-circle-info"></i>
        <div>
          <strong>Kruskal</strong> construye el árbol de expansión conectando los
          nodos de menor o mayor costo posible sin formar ciclos.
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

function close () {
  emit('update:modelValue', false)
}

function choose (m) {
  mode.value = m
}

function confirm () {
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

h3 {
  margin: 0;
  margin-bottom: 6px;
}

/* Texto bajo el título */
.jo-sub {
  opacity: 0.9;
  margin: 0.25rem 0 1rem;
  text-align: center;
  color: #dbe9ff;
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
  align-items: center;
  gap: 8px;
  text-align: center;
  background: #1f2733;
  border: 1px solid rgba(154, 208, 245, 0.15);
  border-radius: 16px;
  padding: 14px 10px 16px;
  cursor: pointer;
  transition: transform 0.06s, filter 0.2s, border-color 0.2s,
    box-shadow 0.2s, background 0.2s;
  color: #f5fbff;
}

.jo-card-btn:hover {
  filter: brightness(1.06);
  border-color: rgba(154, 208, 245, 0.6);
}

.jo-card-btn:active {
  transform: translateY(1px);
}

.jo-card-btn.active {
  background: #263446;
  border-color: #9ad0f5;
  box-shadow: 0 0 0 2px rgba(154, 208, 245, 0.45);
}

/* Lottie dentro de la tarjeta */
.jo-card-lottie {
  width: 100%;
  display: flex;
  justify-content: center;
}

.jo-card-lottie-frame {
  width: 96px;
  height: 96px;
  border: 0;
  background: transparent;
  pointer-events: none;
  border-radius: 14px;
}

/* Textos de la tarjeta */
.jo-ttl {
  font-weight: 800;
  color: #f8fbff;       /* blanco */
}

.jo-txt {
  opacity: 0.95;
  font-size: 0.92rem;
  color: #c8e0ff;       /* celeste suave */
}

.jo-txt b {
  color: #9ad0f5;       /* celeste más fuerte para resaltar */
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
  color: #9ad0f5;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}
.jo-info strong {
  color: #ffffff;
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

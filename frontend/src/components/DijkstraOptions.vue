<template>
  <div v-if="modelValue" class="jo-mask" @click.self="close">
    <div class="jo-card">
      <center><h3>Dijkstra</h3></center>

      <!-- Lottie centrado -->
      <div class="jo-lottie">
        <iframe
          class="jo-lottie-frame"
          title="Dijkstra animation"
          src="https://lottie.host/embed/91467bcf-af97-480e-8055-1759ae827e17/4mMqNhOpx0.lottie"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>

      <p class="jo-sub">Selecciona el nodo origen y opcionalmente un destino.</p>

      <!-- Selección de nodos -->
      <div class="jo-selects">
        <div class="jo-field">
          <label class="jo-label">
            <i class="fa-solid fa-location-dot"></i> Nodo Origen <span class="required">*</span>
          </label>
          <select v-model="sourceNode" class="jo-select">
            <option value="" disabled>— Seleccionar origen —</option>
            <option v-for="node in nodes" :key="node.id" :value="node.id">
              {{ node.label }}
            </option>
          </select>
        </div>

        <div class="jo-field">
          <label class="jo-label">
            <i class="fa-solid fa-flag-checkered"></i> Nodo Destino <span class="optional">(opcional)</span>
          </label>
          <select v-model="targetNode" class="jo-select">
            <option value="">— Sin destino (todas las distancias) —</option>
            <option
              v-for="node in nodes"
              :key="node.id"
              :value="node.id"
              :disabled="node.id === sourceNode"
            >
              {{ node.label }} {{ node.id === sourceNode ? '(origen)' : '' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Info box -->
      <div class="jo-info">
        <i class="fa-solid fa-circle-info"></i>
        <div>
          <strong>Dijkstra</strong> calcula caminos más cortos desde un origen.
          Requiere <strong>pesos ≥ 0</strong>.
        </div>
      </div>

      <div class="jo-actions">
        <button class="btn btn-sec" @click="close">Cancelar</button>
        <button class="btn btn-pri" @click="confirm" :disabled="!sourceNode">
          <i class="fa-solid fa-play"></i> Ejecutar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  nodes: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const sourceNode = ref('')
const targetNode = ref('')

// Resetear al abrir
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    sourceNode.value = ''
    targetNode.value = ''
    // Debug: verificar que llegan los nodos
    console.log('📊 Nodos disponibles:', props.nodes)
  }
})

// Limpiar destino si es igual al origen
watch(sourceNode, (newSource) => {
  if (targetNode.value === newSource) {
    targetNode.value = ''
  }
})

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  if (!sourceNode.value) return

  emit('confirm', {
    source: sourceNode.value,
    target: targetNode.value || null
  })

  close()
}
</script>

<style scoped>
.jo-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:50}
.jo-card{width:min(560px,94vw);background:#2c2f3a;color:#e7e7ec;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px}

/* Lottie centrado y responsive */
.jo-lottie{display:flex;justify-content:center;align-items:center;margin:6px 0 10px}
.jo-lottie-frame{
  width:min(180px, 50vw);
  height:min(180px, 50vw);
  border:0;
  background:transparent;
  border-radius:12px;
  pointer-events:none;
}

.jo-sub{opacity:.9;margin:.25rem 0 1rem;text-align:center}

/* Selects de nodos */
.jo-selects{display:flex;flex-direction:column;gap:14px;margin-bottom:14px}
.jo-field{display:flex;flex-direction:column;gap:6px}
.jo-label{
  display:flex;align-items:center;gap:6px;font-weight:600;font-size:.9rem;
  i{color:#567c8d}
  .required{color:#f06277;font-size:.85rem}
  .optional{color:#a0a4b8;font-weight:400;font-size:.85rem}
}
.jo-select{
  width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);
  border-radius:10px;padding:10px 14px;color:#e7e7ec;font-size:.95rem;
  font-family:inherit;cursor:pointer;transition:all .2s;
  &:hover{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.06)}
  &:focus{outline:none;border-color:#567c8d;background:rgba(255,255,255,.08)}
  option{background:#1e2430;color:#e7e7ec;padding:8px}
  option:disabled{color:#6b6f80}
}

/* Info box */
.jo-info{
  background:rgba(86,124,141,.12);border:1px solid rgba(86,124,141,.25);
  border-radius:10px;padding:12px;display:flex;gap:10px;font-size:.9rem;
  line-height:1.5;margin-bottom:14px;
  i{color:#567c8d;font-size:16px;flex-shrink:0;margin-top:2px}
  strong{color:#fff}
}

/* Botones */
.btn{padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.12);cursor:pointer;font-weight:600;transition:transform .06s,filter .2s,border-color .2s;display:inline-flex;align-items:center;gap:6px}
.btn:active{transform:translateY(1px)}
.btn-sec{background:#2f4156;color:#ecebe6}
.btn-sec:hover{filter:brightness(1.08);border-color:rgba(255,255,255,.18)}
.btn-pri{background:#567c8d;color:#ecebe6;border-color:rgba(255,255,255,.15)}
.btn-pri:hover:not(:disabled){filter:brightness(1.08);border-color:rgba(255,255,255,.25)}
.btn-pri:disabled{opacity:.4;cursor:not-allowed}
.jo-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}

@media (max-width:560px){
  .jo-actions{flex-direction:column-reverse}
  .btn{width:100%;justify-content:center}
}
</style>

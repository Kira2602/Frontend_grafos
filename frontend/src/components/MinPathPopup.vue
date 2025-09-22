<template>
  <div v-if="modelValue" class="mp-mask" @click.self="close">
    <div class="mp-card">
      <h3 class="mp-title">Camino mínimo</h3>
      <p class="mp-sub">
        Selecciona <b>Nodo Origen y Destino </b> para resaltar el camino.
      </p>

      <label class="mp-label">Origen</label>
      <select v-model="local.source">
        <option disabled value="">— seleccionar —</option>
        <option v-for="n in nodes" :key="n.id" :value="n.id">
          {{ n.label || n.id }}
        </option>
      </select>

      <label class="mp-label" style="margin-top:10px">Nodo Destino</label>
      <select v-model="local.target">
        <option value="">— ninguno —</option>
        <option v-for="n in nodes" :key="n.id" :value="n.id">
          {{ n.label || n.id }}
        </option>
      </select>

      <div class="mp-actions">
        <button class="btn btn-pri" @click="confirm">Continuar</button>
        <button class="btn btn-sec" @click="close">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  nodes: { type: Array, default: () => [] } // [{ id, label }]
})
const emit = defineEmits(['update:modelValue','confirm'])

const local = reactive({ source: '', target: '' })

watch(() => props.modelValue, (v) => {
  if (v) { local.source = ''; local.target = '' }
})

function close(){ emit('update:modelValue', false) }
function confirm(){
  if (!local.source) return
  emit('confirm', { source: local.source, target: local.target || null })
  close()
}
</script>

<style scoped>
.mp-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:60}
.mp-card{width:min(520px,94vw);background:#2c2f3a;color:#e7e7ec;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px}
.mp-title{text-align:center;margin:0 0 6px}
.mp-sub{opacity:.9;margin:.25rem 0 1rem;text-align:center}
.mp-label{display:block;font-weight:700;margin:8px 0 6px}
select{width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:#1e2430;color:#e7e7ec}
.mp-actions{display:flex;gap:8px;justify-content:center;margin-top:14px}
.btn{padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.12);cursor:pointer}
.btn-pri{background:#567c8d;color:#ecebe6}
.btn-sec{background:#2f4156;color:#ecebe6}
</style>

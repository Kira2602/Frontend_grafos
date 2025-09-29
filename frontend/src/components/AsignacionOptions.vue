<template>
  <div v-if="modelValue" class="modal-wrap" role="dialog" aria-modal="true" aria-label="Opciones de asignación">
    <div class="modal">
      <header class="modal-header">
        <h3>Asignación</h3>
        <button class="icon" @click="$emit('update:modelValue', false)" title="Cerrar" type="button">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </header>

      <section class="modal-body">
        <div class="field">
          <label class="label">Modo</label>
          <div class="options">
            <label class="opt"><input type="radio" name="modo" value="min" v-model="local.mode"/> Minimizar costo</label>
            <label class="opt"><input type="radio" name="modo" value="max" v-model="local.mode"/> Maximizar beneficio</label>
          </div>
        </div>

        <div class="field">
          <label class="label">Permisos</label>
          <label class="opt"><input type="checkbox" v-model="local.allowUnassigned"/> Permitir no asignar (matching parcial)</label>
        </div>

        <div class="summary" v-if="typeof lCount==='number' && typeof rCount==='number'">
          <div class="pill l">L: {{ lCount }}</div>
          <div class="pill r">R: {{ rCount }}</div>
          <div v-if="overlapCount>0" class="warn">
            {{ overlapCount }} nodos aparecen como origen y destino; se ignorarán para la matriz L×R. Ajusta direcciones si es necesario.
          </div>
        </div>
      </section>

      <footer class="modal-footer">
        <button class="btn" @click="$emit('update:modelValue', false)" type="button">Cancelar</button>
        <button class="btn primary" @click="confirm" type="button">Resolver</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, toRefs } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  defaultMode: { type: String, default: 'min' }, // 'min' | 'max'
  defaultAllowUnassigned: { type: Boolean, default: true },
  lCount: { type: Number, default: 0 },
  rCount: { type: Number, default: 0 },
  overlapCount: { type: Number, default: 0 }
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const local = reactive({ mode: props.defaultMode, allowUnassigned: props.defaultAllowUnassigned })

watch(() => props.modelValue, (v) => {
  if (v) {
    local.mode = props.defaultMode
    local.allowUnassigned = props.defaultAllowUnassigned
  }
})

function confirm(){
  emit('update:modelValue', false)
  emit('confirm', { mode: local.mode, allowUnassigned: local.allowUnassigned })
}
</script>

<style scoped>
.modal-wrap{ position:fixed; inset:0; display:grid; place-items:center; background:rgba(0,0,0,.45); z-index:1000; }
.modal{ width:min(560px, calc(100vw - 24px)); background:#2c2f3a; border:1px solid rgba(255,255,255,.08); border-radius:12px; color:#e7e7ec; box-shadow:0 10px 24px rgba(0,0,0,.25); }
.modal-header{ display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08) }
.modal-body{ padding:14px; display:grid; gap:14px }
.modal-footer{ display:flex; justify-content:flex-end; gap:8px; padding:12px 14px; border-top:1px solid rgba(255,255,255,.08) }
.icon{ background:transparent; border:none; color:#e7e7ec; cursor:pointer }
.label{ font-weight:700; margin-bottom:6px; display:block }
.options{ display:flex; gap:16px; flex-wrap:wrap }
.opt{ display:flex; align-items:center; gap:8px }
.summary{ display:flex; align-items:center; gap:8px; margin-top:6px }
.pill{ font-weight:700; padding:2px 8px; border-radius:999px; border:1px solid rgba(255,255,255,.15); opacity:.85 }
.pill.l{ background:#20354d }
.pill.r{ background:#4d3520 }
.warn{ color:#ffcf7a; font-size:.92rem }
.btn{ border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); color:#e7e7ec; padding:8px 12px; border-radius:10px; cursor:pointer }
.btn.primary{ background:#567c8d; border-color:rgba(255,255,255,.28) }
</style>

<template>
  <div v-if="modelValue" class="jo-mask" @click.self="close" role="dialog" aria-modal="true" aria-label="Opciones de asignación">
    <div class="jo-card">
      <center><h3>Asignación</h3></center>

      <!-- Lottie centrado -->
      <div class="jo-lottie">
        <iframe
          class="jo-lottie-frame"
          title="Assignment animation"
          src="https://lottie.host/embed/e991163b-ca50-4342-b9f9-5422c131ba6d/eImXSN7bPT.lottie"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>

      <p class="jo-sub">Elige el objetivo y configura la asignación.</p>

      <!-- Grid de opciones -->
      <div class="jo-grid-2">
        <button
          class="jo-card-btn"
          :class="{ 'is-active': local.mode === 'min' }"
          @click="local.mode = 'min'"
          type="button"
          aria-pressed="local.mode==='min'"
        >
          <div class="jo-ico"><i class="fa-solid fa-compress"></i></div>
          <div class="jo-ttl">Minimizar</div>
          <div class="jo-txt">Asignación de <b>mínimo costo</b> (Hungarian).</div>
        </button>

        <button
          class="jo-card-btn"
          :class="{ 'is-active': local.mode === 'max' }"
          @click="local.mode = 'max'"
          type="button"
          aria-pressed="local.mode==='max'"
        >
          <div class="jo-ico"><i class="fa-solid fa-expand"></i></div>
          <div class="jo-ttl">Maximizar</div>
          <div class="jo-txt">Asignación de <b>máximo beneficio</b>.</div>
        </button>
      </div>

      <!-- Permisos -->
      <div class="jo-box">
        <label class="switch">
          <input type="checkbox" v-model="local.allowUnassigned" />
          <span class="slider"></span>
          <span class="switch-label">Permitir no asignar (matching parcial)</span>
        </label>
      </div>

      <!-- Resumen L/R -->
      <div class="jo-summary" v-if="typeof lCount==='number' && typeof rCount==='number'">
        <div class="pill l">L: {{ lCount }}</div>
        <div class="pill r">R: {{ rCount }}</div>
        <div v-if="overlapCount>0" class="warn">
          {{ overlapCount }} nodos aparecen como origen y destino; se ignorarán para la matriz L×R. Ajusta direcciones si es necesario.
        </div>
      </div>

      <div class="jo-actions">
        <button class="btn btn-sec" @click="close" type="button">Cerrar</button>
        <button class="btn btn-pri" @click="confirm" type="button">
          <i class="fa-solid fa-check"></i>&nbsp;Resolver
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  defaultMode: { type: String, default: 'min' }, // 'min' | 'max'
  defaultAllowUnassigned: { type: Boolean, default: true },
  lCount: { type: Number, default: 0 },
  rCount: { type: Number, default: 0 },
  overlapCount: { type: Number, default: 0 }
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const local = reactive({
  mode: props.defaultMode,
  allowUnassigned: props.defaultAllowUnassigned
})

watch(() => props.modelValue, (v) => {
  if (v) {
    local.mode = props.defaultMode
    local.allowUnassigned = props.defaultAllowUnassigned
  }
})

function close(){ emit('update:modelValue', false) }
function confirm(){
  emit('confirm', { mode: local.mode, allowUnassigned: local.allowUnassigned })
  close()
}
</script>

<style scoped>
.jo-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:50}
.jo-card{width:min(560px,94vw);background:#2c2f3a;color:#e7e7ec;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px}
.jo-sub{opacity:.9;margin:.2rem 0 .8rem}

.jo-lottie{display:flex;justify-content:center;align-items:center;margin:4px 0 8px}
.jo-lottie-frame{
  width:min(140px, 42vw);
  height:min(140px, 42vw);
  border:0;
  background:transparent;
  border-radius:12px;
  pointer-events:none;
}

.jo-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}
.jo-card-btn{
  display:flex;flex-direction:column;gap:6px;text-align:left;
  background:#567c8d;border:1px solid rgba(255,255,255,.08);border-radius:12px;
  padding:12px;cursor:pointer;transition:transform .06s,filter .2s,border-color .2s, box-shadow .2s
}
.jo-card-btn:hover{filter:brightness(1.05);border-color:rgba(255,255,255,.18)}
.jo-card-btn:active{transform:translateY(1px)}
.jo-card-btn.is-active{
  border-color:#fff;                /* ✅ borde blanco */
  box-shadow:0 0 6px rgba(255,255,255,.4); /* ✅ brillo blanco */
}
.jo-ico{font-size:20px;line-height:1}
.jo-ttl{font-weight:800;font-size:.98rem}
.jo-txt{opacity:.9;font-size:.9rem}

.jo-box{
  margin-top:10px;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.08);
  border-radius:12px;
  padding:10px;
}

.switch{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none}
.switch input{appearance:none;width:0;height:0;position:absolute;opacity:0}
.slider{
  position:relative;width:38px;height:22px;border-radius:999px;background:#2f4156;display:inline-block;transition:background .2s
}
.slider::after{
  content:""; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:999px; background:#ecebe6;
  transition:transform .2s;
}
.switch input:checked + .slider{background:#567c8d}
.switch input:checked + .slider::after{transform:translateX(16px)}
.switch-label{font-weight:600;opacity:.95;font-size:.95rem}

.jo-summary{display:flex;align-items:center;gap:6px;margin-top:10px;flex-wrap:wrap}
.pill{font-weight:700;padding:2px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.15);opacity:.9;font-size:.92rem}
.pill.l{background:#20354d}
.pill.r{background:#4d3520}
.warn{color:#ffcf7a;font-size:.9rem}

.btn{padding:7px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.12);cursor:pointer;font-size:.95rem}
.btn-sec{background:#2f4156;color:#ecebe6}
.btn-pri{background:#567c8d;color:#ecebe6;border-color:rgba(255,255,255,.28)}
.jo-actions{display:flex;justify-content:flex-end;margin-top:12px;gap:8px}

@media (max-width:560px){ .jo-grid-2{grid-template-columns:1fr} }
</style>

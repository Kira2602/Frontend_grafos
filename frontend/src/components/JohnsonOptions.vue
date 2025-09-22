<template>
  <div v-if="modelValue" class="jo-mask" @click.self="close">
    <div class="jo-card">
      <center><h3>Johnson</h3></center>

      <!-- Lottie centrado -->
      <div class="jo-lottie">
        <iframe
          class="jo-lottie-frame"
          title="Johnson animation"
          src="https://lottie.host/embed/91467bcf-af97-480e-8055-1759ae827e17/4mMqNhOpx0.lottie"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>

      <p class="jo-sub">Elige qué quieres hacer con el grafo.</p>

      <div class="jo-grid-2">
        <button class="jo-card-btn" @click="choose('min')">
          <div class="jo-ico">
            <i class="fa-solid fa-compress"></i>
          </div>
          <div class="jo-ttl">Minimizar</div>
          <div class="jo-txt">Encuentra el caminos más cortos (Johnson).</div>
        </button>

        <button class="jo-card-btn" @click="choose('max')">
          <div class="jo-ico">
            <i class="fa-solid fa-expand"></i>
          </div>
          <div class="jo-ttl">Maximizar</div>
          <div class="jo-txt">Encuentra la Ruta crítica (CPM) y holguras.</div>
        </button>
      </div>

      <div class="jo-actions">
        <button class="btn btn-sec" @click="close">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue','confirm'])

function close(){ emit('update:modelValue', false) }
function choose(mode){
  emit('confirm', { mode })
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
  pointer-events:none; /* evita clics sobre el iframe */
}

.jo-sub{opacity:.9;margin:.25rem 0 1rem}
.jo-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}
.jo-card-btn{
  display:flex;flex-direction:column;gap:8px;text-align:left;
  background:#567c8d;border:1px solid rgba(255,255,255,.08);border-radius:12px;
  padding:14px;cursor:pointer;transition:transform .06s,filter .2s,border-color .2s
}
.jo-card-btn:hover{filter:brightness(1.05);border-color:rgba(255,255,255,.18)}
.jo-card-btn:active{transform:translateY(1px)}
.jo-ico{font-size:22px;line-height:1}
.jo-ttl{font-weight:800}
.jo-txt{opacity:.9;font-size:.95rem}
.btn{padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.12);cursor:pointer}
.btn-sec{background:#2f4156;color:#ecebe6}
.jo-actions{display:flex;justify-content:flex-end;margin-top:14px}
@media (max-width:560px){ .jo-grid-2{grid-template-columns:1fr} }
</style>

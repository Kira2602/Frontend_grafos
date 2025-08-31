<!-- src/components/NombreArchivoPopup.vue -->
<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="saveTitle">
        <div class="header">
          <h3 id="saveTitle">Guardar como…</h3>
          <button class="btn-icon" @click="close" title="Cerrar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="body">
          <label class="label">Nombre del archivo (sin extensión)</label>
          <input
            v-model="name"
            class="input"
            type="text"
            :placeholder="placeholder"
            @keyup.enter="confirm"
          />
          <div class="hint">Se guardará como <b>{{ safeBase || 'grafos' }}</b>.{{ ext }}</div>
        </div>

        <div class="actions">
          <button class="btn ghost" @click="close">Cancelar</button>
          <button class="btn" @click="confirm">Guardar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  defaultName: { type: String, default: '' },
  ext: { type: String, default: 'png' }
})
const emit = defineEmits(['update:modelValue','confirm'])

const name = ref(props.defaultName)
watch(() => props.modelValue, v => { if (v) name.value = props.defaultName })

const placeholder = computed(() => props.defaultName || 'grafos-AAAA-MM-DD-HH-mm')
const safeBase = computed(() => (name.value || '')
  .replace(/[\\/:*?"<>|]/g,'_')
  .trim()
  .replace(/\.$/, '')
)
const close = () => emit('update:modelValue', false)
const confirm = () => emit('confirm', safeBase.value || 'grafos')
</script>

<style scoped>
/* Fondo */
.overlay{
  position:fixed; inset:0; z-index:1000;
  background:rgba(0,0,0,.48);
  display:grid; place-items:center;
  padding:16px; /* margen seguro en móviles */
}

/* Contenedor del modal */
.modal{
  background:#2c2f3a; color:#e7e7ec;
  border:1px solid rgba(255,255,255,.08);
  border-radius:14px;
  box-shadow:0 20px 44px rgba(0,0,0,.35);
  /* >>> Ajustes de tamaño */
  width:clamp(380px, 90vw, 520px);
  max-height:90vh;
  overflow:auto;
  box-sizing:border-box;
  padding:18px 20px 16px;
  display:grid; gap:14px;
  grid-template-rows:auto auto auto; /* header, body, actions */
}

/* Evitar desbordes de grid */
.modal, .header, .body { min-width:0; }

.header{
  display:flex; align-items:center; justify-content:center;
  position:relative;
}
.header h3{
  margin:0; font-weight:800; font-size:20px; line-height:1.2;
}
.btn-icon{
  position:absolute; right:8px; top:4px;
  border:0; background:transparent; color:#bfc5d1; cursor:pointer;
  padding:6px; line-height:1;
}
.btn-icon:hover{ color:#fff; }

.body{ display:grid; gap:10px; }
.label{ font-size:12px; color:#c8ceda; }
.input{
  width:100%; padding:10px 12px; height:40px;
  border-radius:10px; border:1px solid rgba(255,255,255,.14);
  background:#242833; color:#e7e7ec; box-sizing:border-box;
}
.hint{
  font-size:12px; color:#b8becc; line-height:1.3;
  white-space:normal; word-break:break-word; /* que nunca sobresalga */
}

.actions{
  display:flex; justify-content:flex-end; gap:10px; flex-wrap:wrap;
  padding-top:4px;
}
.btn{
  background:#567c8d; color:#ecebe6; border:0;
  padding:9px 16px; border-radius:10px; cursor:pointer;
  font-weight:700; min-width:120px; /* botones consistentes */
}
.btn.ghost{ background:transparent; border:1px solid rgba(255,255,255,.18); }
.btn:hover{ filter:brightness(1.05); }
</style>

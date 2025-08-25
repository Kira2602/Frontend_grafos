<template>
  <Teleport to="body">
    <div v-if="modelValue" class="node-overlay" @click.self="close">
      <div class="node-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
        <div class="modal-head">
          <div></div>
          <h3 :id="titleId" class="modal-title">{{ title }}</h3>
          <button class="btn-icon close" @click="close" aria-label="Cerrar (Esc)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="content">
          <div class="row name">
            <label for="nodeName">Nombre</label>
            <input
              id="nodeName"
              ref="nameRef"
              type="text"
              v-model="localName"
              @keydown.enter.prevent="confirm"
            />
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-cancel" type="button" @click="close">Cancelar</button>
          <button class="btn btn-ok" type="button" @click="confirm">Guardar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Nombre del nodo' },
  titleId: { type: String, default: 'nodeNameTitle' },
  defaultName: { type: String, default: 'Nodo' }
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const nameRef = ref(null)
const localName = ref(props.defaultName)

watch(() => props.modelValue, async (open) => {
  if (open) {
    localName.value = props.defaultName || 'Nodo'
    await nextTick()
    nameRef.value?.focus?.()
    nameRef.value?.select?.()
    document.addEventListener('keydown', onKey)
  } else {
    document.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

function onKey(e){
  if (e.key === 'Escape') close()
  if ((e.key === 'Enter' || e.key === 'NumpadEnter') && props.modelValue) confirm()
}
function close(){ emit('update:modelValue', false) }
function confirm(){
  const name = (localName.value ?? '').toString().trim() || 'Nodo'
  emit('confirm', name)
  close()
}
</script>

<style scoped lang="scss">
.node-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.45);
  display: grid; place-items: center;
  animation: fadeIn .12s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.node-modal {
  width: min(86vw, 360px);
  min-height: unset;               /* compacto */
  background: #2c2f3a;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,.5);
  color: #e7e7ec;
  padding: 10px 12px;
}

.modal-head {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  gap: 6px; margin-bottom: 6px;
  .modal-title { grid-column: 2; margin: 0; font-size: 18px; text-align: center; }
  .btn-icon {
    grid-column: 3; justify-self: end;
    background: transparent; border: none; color: inherit; cursor: pointer;
    width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center;
    &:hover { background: rgba(255,255,255,.08); }
  }
}

.content { text-align: center; }

.row.name {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin: 6px 0 8px;
  label { font-weight: 600; }
  input {
    margin: 0; padding: 8px 10px; width: 220px; max-width: 260px;
    border-radius: 10px; border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.06); color: #e7e7ec;
    outline: none;
  }
}

.actions {
  margin-top: 6px;
  display: flex; justify-content: center; gap: 8px;
  .btn { padding: 8px 12px; border-radius: 10px; border: none; cursor: pointer; font-weight: 700; color: #ecebe6; }
  .btn-ok     { background: #567c8d; }
  .btn-cancel { background: #2f4156; }
}
</style>

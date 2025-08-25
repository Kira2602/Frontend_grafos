<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
        <div class="head">
          <div></div>
          <h3 :id="titleId" class="title">Propiedades del nodo</h3>
          <button class="btn-icon" @click="close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="content">
          <!-- Nombre -->
          <div class="row">
            <label for="nodeName">Nombre</label>
            <input id="nodeName" ref="nameRef" type="text" v-model="localName" @keydown.enter.prevent="confirm" />
          </div>

          <!-- Color -->
          <div class="row">
            <label>Color</label>
            <div class="palette">
              <button
                v-for="c in colors" :key="c"
                class="sw"
                :style="{ background: c, outline: localColor === c ? '2px solid #fff' : 'none' }"
                @click="localColor = c"
                :aria-label="`Color ${c}`"
              />
              <label class="custom">
                <input type="color" v-model="localColor" />
                <span>Personalizado</span>
              </label>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn cancel" @click="close">Cancelar</button>
          <button class="btn ok" @click="confirm">Guardar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  titleId: { type: String, default: 'nodePropsTitle' },
  defaultName: { type: String, default: '' },
  defaultColor: { type: String, default: '#57c3d1' }
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const nameRef = ref(null)
const localName = ref(props.defaultName)
const localColor = ref(props.defaultColor)

const colors = [
  '#57c3d1', '#4db6ac', '#81c784', '#ffb74d',
  '#e57373', '#ba68c8', '#7986cb', '#90a4ae',
  '#ffd54f', '#f06292', '#4fc3f7', '#a1887f'
]

watch(() => props.modelValue, async (open) => {
  if (open) {
    localName.value = props.defaultName || ''
    localColor.value = props.defaultColor || '#57c3d1'
    await nextTick()
    nameRef.value?.focus?.()
    nameRef.value?.select?.()
    document.addEventListener('keydown', onKey)
  } else {
    document.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

function onKey(e){ if(e.key==='Escape') close(); if(e.key==='Enter') confirm() }
function close(){ emit('update:modelValue', false) }
function confirm(){
  emit('confirm', { name: (localName.value??'').toString().trim(), color: localColor.value })
  close()
}
</script>

<style scoped lang="scss">
.overlay{
  position: fixed; inset:0; z-index:1000; background: rgba(0,0,0,.45);
  display:grid; place-items:center; animation: fade .12s ease;
}
@keyframes fade{from{opacity:0}to{opacity:1}}

.modal{
  width:min(86vw, 380px);
  background:#2c2f3a; color:#e7e7ec;
  border:1px solid rgba(255,255,255,.08); border-radius:14px;
  box-shadow:0 16px 48px rgba(0,0,0,.5);
  padding:10px 12px;
}

.head{
  display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:6px; margin-bottom:6px;
  .title{ grid-column:2; margin:0; font-size:18px; text-align:center; }
  .btn-icon{ grid-column:3; justify-self:end; background:transparent; border:none; color:inherit; width:30px; height:30px; border-radius:8px; display:grid; place-items:center; cursor:pointer;
    &:hover{ background:rgba(255,255,255,.08); }
  }
}

.content{ display:grid; gap:10px; }
.row{
  display:flex; align-items:center; justify-content:center; gap:10px;
  label{ font-weight:600; }
  input[type="text"]{
    width:220px; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,.18);
    background:rgba(255,255,255,.06); color:#e7e7ec; outline:none;
  }
}
.palette{
  display:flex; align-items:center; flex-wrap:wrap; gap:8px; max-width:280px; justify-content:center;
  .sw{
    width:26px; height:26px; border-radius:50%; border:1px solid rgba(255,255,255,.25); cursor:pointer;
  }
  .custom{
    display:inline-flex; align-items:center; gap:6px; font-size:12px; opacity:.9; cursor:pointer;
    input[type="color"]{ appearance:none; border:none; padding:0; width:26px; height:26px; border-radius:50%; background:none; }
  }
}

.actions{
  margin-top:6px; display:flex; justify-content:center; gap:8px;
  .btn{ padding:8px 12px; border:none; border-radius:10px; font-weight:700; color:#ecebe6; cursor:pointer; }
  .ok{ background:#567c8d; } .cancel{ background:#2f4156; }
}
</style>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="export-overlay"
      @click.self="close"
    >
      <div
        class="export-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div class="modal-head">
          <div></div>
          <h3 :id="titleId" class="modal-title">{{ title }}</h3>
          <button class="btn-icon close" @click="close" aria-label="Cerrar (Esc)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p class="sub">Elige el formato de exportación:</p>

        <div class="options">
          <button
            ref="firstBtn"
            class="opt"
            @click="select('image')"
          >
            <i class="fa-regular fa-image"></i>
            <span>Imagen (PNG)</span>
          </button>

          <button class="opt" @click="select('pdf')">
            <i class="fa-regular fa-file-pdf"></i>
            <span>PDF</span>
          </button>

          <button class="opt" @click="select('json')">
            <i class="fa-regular fa-file-lines"></i>
            <span>JSON</span>
          </button>

          <!-- NUEVO: ZIP -->
          <button class="opt" @click="select('zip')">
            <i class="fa-solid fa-file-zipper"></i>
            <span>ZIP (PNG + PDF + JSON)</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Exportar pizarra' },
  titleId: { type: String, default: 'exportTitle' }
})

const emit = defineEmits(['update:modelValue', 'select'])

const firstBtn = ref(null)

const focusFirst = async () => {
  await nextTick()
  firstBtn.value?.focus?.()
}

watch(() => props.modelValue, (open) => {
  if (open) focusFirst()
})

const onKey = (e) => {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

const close = () => emit('update:modelValue', false)
const select = (format) => {
  emit('select', format)
  close()
}
</script>

<style scoped lang="scss">
.export-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.45);
  display: grid; place-items: center;
  animation: fadeIn .15s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

/* Modal */
.export-modal {
  width: min(92vw, 420px);
  background: #2c2f3a;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,.5);
  color: #e7e7ec;
  padding: 14px;
}

.modal-head {
  display: grid;
  grid-template-columns: 1fr auto 1fr; 
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .modal-title {
    grid-column: 2;          
    margin: 0;
    font-size: 18px;
    text-align: center;      
  }

  .btn-icon {
    grid-column: 3;
    justify-self: end;
    background: transparent; border: none; color: inherit; cursor: pointer;
    width: 36px; height: 36px; border-radius: 8px;
    display: grid; place-items: center;
    &:hover { background: rgba(255,255,255,.08); }
  }
}

.sub { opacity: .9; margin: 2px 0 10px; font-size: 14px; text-align: center; }

$options-min-w: 180px;

.options {
  display: grid; 
  gap: 8px;
  justify-items: center;
}

.opt {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  width: auto;
  min-width: $options-min-w;
  max-width: 260px;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.08);
  color: #e7e7ec;
  cursor: pointer;
  transition: background .15s ease, border-color .2s, transform .05s ease;
  i { width: 18px; text-align: center; }
  &:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.18); }
  &:active { transform: translateY(1px); }
}

@media (max-width: 360px) {
  .opt { min-width: 140px; }
}
</style>

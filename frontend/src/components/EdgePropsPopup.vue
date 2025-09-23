<template>
  <Teleport to="body">
    <div v-if="modelValue" class="edge-overlay" @click.self="close">
      <div class="edge-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
        <div class="modal-head">
          <div></div>
          <h3 :id="titleId" class="modal-title">Propiedades de la arista</h3>
          <button class="btn-icon close" @click="close" aria-label="Cerrar (Esc)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="content">
          <div class="row weight">
            <label for="edgeWeight">Peso</label>
            <input
              id="edgeWeight"
              ref="weightRef"
              type="number"
              step="any"
              min="0"
              v-model="localWeight"
            />
          </div>

          <div v-if="!loop" class="row dir">
            <span class="chip" :title="sourceLabel">{{ sourceLabel }}</span>

            <div class="dd" ref="ddRef">
              <button class="dd-btn" type="button" @click.stop="toggleMenu">
                <span class="arrow">{{ labelFor(currentDir) }}</span>
                <i class="fa fa-chevron-down"></i>
              </button>
              <ul v-show="openMenu" class="dd-menu" role="menu">
                <li role="menuitem" @click="pick('forward')">→</li>
                <li role="menuitem" @click="pick('reverse')">←</li>
                <li role="menuitem" @click="pick('both')">↔︎</li>
              </ul>
            </div>

            <span class="chip" :title="targetLabel">{{ targetLabel }}</span>
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
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  titleId: { type: String, default: 'edgePropsTitle' },
  sourceLabel: { type: String, default: '' },
  targetLabel: { type: String, default: '' },
  loop: { type: Boolean, default: false },
  defaultWeight: { type: [String, Number], default: '1' },
  initialDir: { type: String, default: 'forward' }
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const weightRef = ref(null)
const localWeight = ref('1')
const currentDir = ref(props.initialDir)
const openMenu = ref(false)
const ddRef = ref(null)

/* ========= Helpers de normalización / validación ========= */
function parseWeightForInput(raw) {
  // Toma la última línea (si viene con "h=..." arriba), y devuelve string
  const str = String(raw ?? '').split('\n').pop().trim()
  // Si no es número, vuelve a '1' para no bloquear el input
  const num = Number(str)
  return Number.isFinite(num) ? String(num) : '1'
}
function parseWeightNumber(raw) {
  const str = String(raw ?? '').split('\n').pop().trim()
  const val = Number(str)
  return Number.isFinite(val) ? val : NaN
}
async function showNegativeWeightAlert() {
  await Swal.fire({
    icon: 'warning',
    title: 'Peso inválido',
    html:
      'No se permiten <b>pesos negativos</b> ni valores no numéricos en las aristas.<br>' +
      'Use pesos <b>≥ 0</b>.',
  })
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      localWeight.value = parseWeightForInput(props.defaultWeight)
      currentDir.value = props.initialDir || 'forward'
      openMenu.value = false
      await nextTick()
      weightRef.value?.focus?.()
      weightRef.value?.select?.()
      document.addEventListener('click', onDocClick, true)
      document.addEventListener('keydown', onKey)
    } else {
      document.removeEventListener('click', onDocClick, true)
      document.removeEventListener('keydown', onKey)
    }
  }
)

onMounted(() => {
  if (props.modelValue) {
    document.addEventListener('click', onDocClick, true)
    document.addEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick, true)
  document.removeEventListener('keydown', onKey)
})

function onDocClick(e) { if (!ddRef.value?.contains(e.target)) openMenu.value = false }
function onKey(e) {
  if (e.key === 'Escape') close()
  if ((e.key === 'Enter' || e.key === 'NumpadEnter') && props.modelValue) confirm()
}

function toggleMenu() { openMenu.value = !openMenu.value }
function pick(dir) { currentDir.value = dir; openMenu.value = false }
function labelFor(dir) { return dir === 'forward' ? '→' : dir === 'reverse' ? '←' : '↔︎' }

function close() { emit('update:modelValue', false) }

async function confirm() {
  // Normaliza y valida el peso:
  const num = parseWeightNumber(localWeight.value)
  if (!Number.isFinite(num) || num < 0) {
    await showNegativeWeightAlert()
    return
  }
  const cleanWeight = String(num)

  const dir = props.loop ? 'forward' : (currentDir.value || 'forward')
  emit('confirm', { weight: cleanWeight, dir })
  close()
}
</script>

<style scoped lang="scss">
.edge-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.45);
  display: grid; place-items: center;
  animation: fadeIn .12s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.edge-modal {
  width: min(86vw, 360px);
  min-height: unset;
  background: #2c2f3a;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,.5);
  color: #e7e7ec;
  padding: 10px 12px;
  overflow: visible;
}

.modal-head {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 6px;
  margin-bottom: 4px;
  .modal-title { grid-column: 2; margin: 0; font-size: 18px; text-align: center; }
  .btn-icon {
    grid-column: 3; justify-self: end;
    background: transparent; border: none; color: inherit; cursor: pointer;
    width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center;
    &:hover { background: rgba(255,255,255,.08); }
  }
}

.content { text-align: center; }

.row.weight {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin: 4px 0 8px;
  label { font-weight: 600; }
  input {
    margin: 0; padding: 6px 8px;
    width: 90px; max-width: 90px; text-align: center;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.06); color: #e7e7ec;
    outline: none;
  }
}

.row.dir {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  .chip {
    padding: 4px 8px; border-radius: 999px;
    background: #2c2f3a; color: #e7e7ec;
    border: 1px solid rgba(255,255,255,.12);
    max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dd { position: relative; }
  .dd-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 10px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,.18);
    background: #2c2f3a; color: #e7e7ec; cursor: pointer; min-width: 72px; justify-content: center;
  }
  .dd-menu {
    position: absolute; top: calc(100% + 6px); left: 50%; transform: translateX(-50%);
    min-width: 120px; margin: 0; padding: 6px;
    background: #1f2230; color: #e7e7ec;
    border: 1px solid rgba(255,255,255,.18); border-radius: 8px;
    box-shadow: 0 10px 24px rgba(0,0,0,.35); text-align: center; z-index: 10;
    li { list-style: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; &:hover{background:rgba(255,255,255,.10);} }
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

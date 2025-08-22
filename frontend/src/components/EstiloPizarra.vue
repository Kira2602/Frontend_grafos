<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="onCancel">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="title">
        <!-- Header -->
        <div class="modal-head">
          <h3 id="title">Cambiar Estilo de Pizarra</h3>
          <button class="btn-icon close" @click="onCancel" title="Cerrar (Esc)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Opciones de tema -->
        <div class="options">
          <button
            v-for="opt in options"
            :key="opt.value"
            class="opt"
            :class="[{ active: selectedTheme === opt.value }, opt.value]"
            @click="selectedTheme = opt.value"
            :aria-pressed="selectedTheme === opt.value"
            :title="opt.label"
          >
            <span class="preview"></span>
            <span class="label">{{ opt.label }}</span>
            <i v-if="selectedTheme === opt.value" class="fa-solid fa-check check"></i>
          </button>

          <!-- Imagen como fondo -->
          <label class="opt image" :class="{ active: selectedTheme === 'image' }" title="Usar imagen">
            <span class="preview">
              <img v-if="imagePreview" :src="imagePreview" alt="Fondo" />
              <span v-else class="image-hint"><i class="fa-regular fa-image"></i></span>
            </span>
            <span class="label">Imagen</span>
            <i v-if="selectedTheme === 'image'" class="fa-solid fa-check check"></i>
            <input type="file" accept="image/*" @change="onPickImage" />
            <button
              v-if="imagePreview"
              type="button"
              class="btn-mini"
              @click.stop="clearImage"
              title="Quitar imagen y volver a blanco"
            >
              Quitar
            </button>
          </label>
        </div>

        <!-- Paleta de colores -->
        <div class="color-row">
          <span class="color-title"><i class="fa-solid fa-palette"></i> Color base</span>

          <button class="btn pick" type="button" @click="openColorDialog">
            Elegir color
          </button>
          <input
            ref="colorInputRef"
            type="color"
            v-model="selectedColor"
            class="hidden-color"
            aria-label="Selector de color"
          />
          <span class="swatch" :style="{ background: selectedColor }" :title="selectedColor"></span>
        </div>

        <!-- Botones -->
        <div class="actions">
          <button class="btn ok" @click="onConfirm">ACEPTAR</button>
          <button class="btn cancel" @click="onCancel">CANCELAR</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  theme: { type: String, default: 'grid' },    
  color: { type: String, default: '#fff7ef' },
  image: { type: String, default: '' },        
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const options = computed(() => ([
  { value: 'plain',  label: 'Blanco' },
  { value: 'grid',   label: 'Cuadrícula' },
  { value: 'dotted', label: 'Punteado' },
]))

const selectedTheme   = ref(props.theme)
const selectedColor   = ref(props.color)
const imagePreview    = ref(props.image || '')

watch(() => props.theme,  v => selectedTheme.value = v)
watch(() => props.color,  v => selectedColor.value = v)
watch(() => props.image,  v => imagePreview.value = v)

const onPickImage = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = String(reader.result)
    selectedTheme.value = 'image'
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  imagePreview.value = ''
  selectedTheme.value = 'plain'
  selectedColor.value = '#ffffff' 
}

const onConfirm = () => {
  const theme = (selectedTheme.value === 'image' && !imagePreview.value) ? 'plain' : selectedTheme.value
  emit('confirm', { theme, color: selectedColor.value, image: imagePreview.value })
  emit('update:modelValue', false)
}

const onCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

const onKey = (e) => { if (e.key === 'Escape') onCancel() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// Rueda de colores
const colorInputRef = ref(null)
const openColorDialog = () => {
  colorInputRef.value?.showPicker?.() || colorInputRef.value?.click()
}
</script>

<style scoped lang="scss">
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; z-index: 999; }
.modal { width: min(92vw, 540px); background: #fff; border-radius: 14px; box-shadow: 0 20px 44px rgba(0,0,0,.35); padding: 16px; color: #2b2b2b; }
.modal-head { display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 8px; }
.modal-head h3 { margin: 0; font-weight: 800; color: #2f4156; }
.btn-icon { border: none; background: transparent; cursor: pointer; }
.btn-icon.close { position: absolute; right: 6px; top: 2px; font-size: 20px; color: #666; }
.btn-icon.close:hover { color: #000; }

.options { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 10px 0 14px; }
.opt { position: relative; border: 2px solid #dadde6; border-radius: 10px; padding: 10px 8px 8px; background: #fafafa; cursor: pointer; display: grid; gap: 8px; justify-items: center; transition: border-color .2s, transform .05s, background .2s; }
.opt:hover { border-color: #c8ccda; background: #fff; }
.opt:active { transform: translateY(1px); }
.opt .preview { width: 90px; height: 80px; border-radius: 8px; background: #fff; border: 1px solid #e5e7ee; position: relative; overflow: hidden; display: grid; place-items: center; }
.opt .label { font-size: 13px; font-weight: 700; color: #3b3e45; }
.opt.active { border-color: #28a745; box-shadow: 0 0 0 2px rgba(40,167,69,.15) inset; }
.opt .check { position: absolute; top: 6px; right: 8px; color: #28a745; }

.opt.plain .preview { background: #ffffff; }
.opt.grid .preview { background: linear-gradient(to right, rgba(0,0,0,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.12) 1px, transparent 1px); background-size: 16px 16px; background-color: #fff; }
.opt.dotted .preview { background: radial-gradient(circle, rgba(0,0,0,.6) 1px, transparent 1px); background-size: 12px 12px; background-color: #fff; }

.opt.image { position: relative; }
.opt.image input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.opt.image .image-hint { color: #9aa1ad; font-size: 26px; }
.opt.image .preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.btn-mini { margin-top: 4px; border: none; background: #f0f2f6; color: #333; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-weight: 700; }

.color-row {
  margin: 14px 0 8px;
  display: flex;
  justify-content: center;  
  gap: 12px;
  flex-wrap: wrap;
}
.color-title { font-weight: 600; color: #3b3e45; display: inline-flex; align-items: center; gap: 6px; }
.hidden-color { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; }
.btn.pick { background: #c8d9e6; color: #353333; border: none; padding: 8px 12px; border-radius: 8px; font-weight: 800; cursor: pointer; }
.swatch { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #cad0db; }

/* Botones aceptar y cnacelar estilo de pizarra*/

.actions { display: flex; gap: 10px; justify-content: center; padding-top: 10px; }
.btn { min-width: 130px; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 700; letter-spacing: .2px; cursor: pointer; }
.ok { background: #c8d9e6; color: #353333; } .ok:hover { filter: brightness(1.05); }
.cancel { background: #567c8d; color: #353333; } .cancel:hover { filter: brightness(1.05); }

@media (max-width: 560px){ .options{ grid-template-columns: repeat(2, 1fr);} }
</style>

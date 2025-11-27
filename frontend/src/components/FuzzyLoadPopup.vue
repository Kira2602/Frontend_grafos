<template>
  <div class="popup-overlay" @click.self="closePopup">
    <div class="popup-container">
      <!-- Header -->
      <div class="popup-header">
        <h2>
          <i class="fa-solid fa-brain"></i>
          Cargar Sistema de Lógica Difusa
        </h2>
        <button class="close-btn" @click="closePopup" aria-label="Cerrar">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="popup-content">
        <p class="description">
          Selecciona cómo deseas cargar el sistema de lógica difusa en MATLAB Fuzzy Logic Designer:
        </p>

        <!-- Opciones -->
        <div class="options-container">
          <!-- Opción 1: Sistema Predeterminado -->
          <div 
            class="option-card" 
            :class="{ selected: selectedOption === 'default' }"
            @click="selectOption('default')"
          >
            <div class="option-icon">
              <i class="fa-solid fa-star"></i>
            </div>
            <div class="option-content">
              <h3>Sistema Predeterminado</h3>
              <p>
                Usa el ejemplo de rendimiento académico con 3 entradas 
                (interés, calidad docente, infraestructura) y 1 salida.
              </p>
            </div>
            <div class="radio-indicator">
              <div class="radio-dot"></div>
            </div>
          </div>

          <!-- Opción 2: Cargar Archivo .fis -->
          <div 
            class="option-card" 
            :class="{ selected: selectedOption === 'upload' }"
            @click="selectOption('upload')"
          >
            <div class="option-icon">
              <i class="fa-solid fa-upload"></i>
            </div>
            <div class="option-content">
              <h3>Cargar Archivo .fis</h3>
              <p>
                Sube tu propio archivo de sistema de inferencia difusa (.fis) 
                para visualizarlo y editarlo.
              </p>
            </div>
            <div class="radio-indicator">
              <div class="radio-dot"></div>
            </div>
          </div>
        </div>

        <!-- File Upload Area (solo visible si se selecciona 'upload') -->
        <transition name="slide-fade">
          <div v-if="selectedOption === 'upload'" class="upload-area">
            <div 
              class="dropzone" 
              :class="{ 'drag-over': isDragging, 'has-file': selectedFile }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <input 
                ref="fileInput"
                type="file" 
                accept=".fis"
                @change="handleFileSelect"
                hidden
              />
              
              <div v-if="!selectedFile" class="dropzone-content">
                <i class="fa-solid fa-cloud-upload-alt"></i>
                <p class="main-text">Arrastra tu archivo .fis aquí</p>
                <p class="sub-text">o haz clic para seleccionar</p>
                <span class="file-info">Máximo 5MB</span>
              </div>

              <div v-else class="file-preview">
                <i class="fa-solid fa-file-code"></i>
                <div class="file-details">
                  <p class="file-name">{{ selectedFile.name }}</p>
                  <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <button 
                  class="remove-file-btn" 
                  @click.stop="removeFile"
                  aria-label="Eliminar archivo"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

            <p v-if="fileError" class="error-message">
              <i class="fa-solid fa-exclamation-circle"></i>
              {{ fileError }}
            </p>
          </div>
        </transition>

        <!-- Loading/Error States -->
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>Iniciando MATLAB Fuzzy Logic Designer...</p>
        </div>

        <div v-if="errorMessage" class="error-container">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <p>{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="popup-footer">
        <button class="btn btn-secondary" @click="closePopup" :disabled="isLoading">
          <i class="fa-solid fa-times"></i>
          Cancelar
        </button>
        <button 
          class="btn btn-primary" 
          @click="launchFuzzy" 
          :disabled="isLoading || (selectedOption === 'upload' && !selectedFile)"
        >
          <i class="fa-solid fa-rocket"></i>
          Lanzar MATLAB
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { launchDefaultFuzzy, launchCustomFuzzy, validateFisFile } from '@/utils/fuzzyService'

const emit = defineEmits(['close', 'success'])

// State
const selectedOption = ref('default')
const selectedFile = ref(null)
const fileError = ref('')
const isDragging = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const fileInput = ref(null)

// Methods
const selectOption = (option) => {
  selectedOption.value = option
  fileError.value = ''
  errorMessage.value = ''
  
  if (option === 'default') {
    selectedFile.value = null
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const validateAndSetFile = (file) => {
  const validation = validateFisFile(file)
  
  if (validation.valid) {
    selectedFile.value = file
    fileError.value = ''
    errorMessage.value = ''
  } else {
    fileError.value = validation.message
    selectedFile.value = null
  }
}

const removeFile = () => {
  selectedFile.value = null
  fileError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const launchFuzzy = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    let result

    if (selectedOption.value === 'default') {
      result = await launchDefaultFuzzy()
    } else {
      if (!selectedFile.value) {
        errorMessage.value = 'Por favor, selecciona un archivo .fis'
        isLoading.value = false
        return
      }
      result = await launchCustomFuzzy(selectedFile.value)
    }

    if (result.success) {
      emit('success', {
        message: result.message,
        systemName: result.systemName,
        source: result.source
      })
      closePopup()
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = 'Error inesperado al comunicarse con el servidor'
    console.error('Error launching fuzzy system:', error)
  } finally {
    isLoading.value = false
  }
}

const closePopup = () => {
  if (!isLoading.value) {
    emit('close')
  }
}
</script>

<style scoped lang="scss">
$overlay-bg: rgba(15, 17, 32, 0.85);
$popup-bg: #2c2f3a;
$border-color: rgba(255, 255, 255, 0.1);
$text-color: #e7e7ec;
$text-muted: #a0a0b0;
$accent: #567c8d;
$accent-light: #C8D9E6;
$success: #4caf50;
$error: #f44336;
$shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $overlay-bg;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.popup-container {
  background: $popup-bg;
  border: 1px solid $border-color;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.popup-header {
  padding: 24px 32px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(86, 124, 141, 0.1) 0%, transparent 100%);

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: $accent-light;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    i {
      color: $accent;
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: $text-muted;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: $text-color;
    }
  }
}

.popup-content {
  padding: 32px;
  overflow-y: auto;
  flex: 1;

  .description {
    color: $text-muted;
    margin-bottom: 24px;
    line-height: 1.6;
  }
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.option-card {
  border: 2px solid $border-color;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);

  &:hover {
    background: rgba(86, 124, 141, 0.1);
    border-color: rgba(86, 124, 141, 0.3);
  }

  &.selected {
    border-color: $accent;
    background: rgba(86, 124, 141, 0.15);

    .radio-indicator {
      border-color: $accent;

      .radio-dot {
        transform: scale(1);
      }
    }

    .option-icon i {
      color: $accent-light;
    }
  }

  .option-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    background: rgba(86, 124, 141, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 1.5rem;
      color: $accent;
      transition: color 0.3s ease;
    }
  }

  .option-content {
    flex: 1;

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: $text-color;
      margin: 0 0 8px 0;
    }

    p {
      font-size: 0.9rem;
      color: $text-muted;
      margin: 0;
      line-height: 1.5;
    }
  }

  .radio-indicator {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border: 2px solid $border-color;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s ease;

    .radio-dot {
      width: 12px;
      height: 12px;
      background: $accent;
      border-radius: 50%;
      transform: scale(0);
      transition: transform 0.3s ease;
    }
  }
}

.upload-area {
  margin-top: 24px;
}

.dropzone {
  border: 2px dashed $border-color;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);

  &:hover {
    border-color: $accent;
    background: rgba(86, 124, 141, 0.05);
  }

  &.drag-over {
    border-color: $accent;
    background: rgba(86, 124, 141, 0.15);
  }

  &.has-file {
    border-style: solid;
    border-color: $success;
    background: rgba(76, 175, 80, 0.1);
  }

  .dropzone-content {
    i {
      font-size: 3rem;
      color: $accent;
      margin-bottom: 16px;
    }

    .main-text {
      font-size: 1.1rem;
      color: $text-color;
      margin-bottom: 8px;
    }

    .sub-text {
      font-size: 0.9rem;
      color: $text-muted;
      margin-bottom: 12px;
    }

    .file-info {
      font-size: 0.8rem;
      color: $text-muted;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 12px;
      border-radius: 12px;
    }
  }

  .file-preview {
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: center;

    i {
      font-size: 2.5rem;
      color: $success;
    }

    .file-details {
      text-align: left;

      .file-name {
        font-size: 1rem;
        font-weight: 600;
        color: $text-color;
        margin: 0 0 4px 0;
      }

      .file-size {
        font-size: 0.85rem;
        color: $text-muted;
        margin: 0;
      }
    }

    .remove-file-btn {
      background: rgba(244, 67, 54, 0.2);
      border: none;
      color: $error;
      padding: 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(244, 67, 54, 0.3);
        transform: scale(1.1);
      }
    }
  }
}

.error-message {
  color: $error;
  font-size: 0.9rem;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 1rem;
  }
}

.loading-container {
  text-align: center;
  padding: 24px;
  color: $accent-light;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(86, 124, 141, 0.2);
    border-top-color: $accent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  p {
    color: $text-muted;
    margin: 0;
  }
}

.error-container {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  padding: 16px;
  color: $error;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;

  i {
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    flex: 1;
  }
}

.popup-footer {
  padding: 20px 32px;
  border-top: 1px solid $border-color;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: rgba(255, 255, 255, 0.02);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: $text-color;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  &.btn-primary {
    background: $accent;
    color: white;

    &:hover:not(:disabled) {
      background: $accent-light;
      color: #0f1120;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(86, 124, 141, 0.4);
    }
  }
}

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// Responsive
@media (max-width: 640px) {
  .popup-container {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 95vh;
  }

  .popup-header, .popup-content, .popup-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .option-card {
    flex-direction: column;

    .option-icon {
      width: 40px;
      height: 40px;

      i {
        font-size: 1.2rem;
      }
    }
  }

  .btn {
    flex: 1;
  }
}
</style>

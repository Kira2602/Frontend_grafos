<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="fa-solid fa-database"></i>
            Cargar Datos de Ejemplo
          </h2>
          <button class="btn-close" @click="close" aria-label="Cerrar">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-description">
            Selecciona un ejemplo predefinido para comenzar rápidamente:
          </p>

          <div class="examples-grid">
            <div
              v-for="example in examples"
              :key="example.id"
              class="example-card"
              @click="selectExample(example)"
            >
              <div class="example-header">
                <i :class="example.icon"></i>
                <h3>{{ example.name }}</h3>
              </div>
              <p class="example-description">{{ example.description }}</p>
              <div class="example-info">
                <span>{{ example.rows }} × {{ example.cols }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineEmits } from 'vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const examples = [
  {
    id: 'small',
    name: 'Ejemplo Pequeño',
    description: 'Problema básico 3×3 para aprender',
    icon: 'fa-solid fa-cube',
    rows: 3,
    cols: 3,
    costs: [
      [10, 20, 30],
      [15, 25, 35],
      [20, 30, 40]
    ],
    supply: [100, 150, 200],
    demand: [150, 200, 100]
  },
  {
    id: 'medium',
    name: 'Ejemplo Mediano',
    description: 'Problema típico 4×5',
    icon: 'fa-solid fa-cubes',
    rows: 4,
    cols: 5,
    costs: [
      [8, 6, 10, 9, 7],
      [9, 12, 13, 7, 11],
      [14, 9, 16, 5, 8],
      [10, 11, 12, 15, 13]
    ],
    supply: [200, 250, 300, 150],
    demand: [180, 220, 200, 150, 150]
  },
  {
    id: 'large',
    name: 'Ejemplo Grande',
    description: 'Problema complejo 5×6',
    icon: 'fa-solid fa-th',
    rows: 5,
    cols: 6,
    costs: [
      [5, 8, 6, 7, 9, 10],
      [7, 6, 9, 8, 11, 12],
      [9, 7, 5, 6, 8, 9],
      [11, 10, 8, 9, 7, 6],
      [8, 9, 7, 10, 6, 11]
    ],
    supply: [150, 200, 175, 225, 250],
    demand: [180, 200, 150, 170, 190, 110]
  },
  {
    id: 'balanced',
    name: 'Ejemplo Equilibrado',
    description: 'Oferta y demanda perfectamente equilibradas',
    icon: 'fa-solid fa-balance-scale',
    rows: 3,
    cols: 4,
    costs: [
      [12, 15, 18, 20],
      [14, 16, 19, 22],
      [10, 13, 17, 21]
    ],
    supply: [300, 400, 300],
    demand: [250, 250, 250, 250]
  }
]

const close = () => {
  emit('update:modelValue', false)
}

const selectExample = (example) => {
  emit('select', example)
  close()
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  color: #c8d9e6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;

  i {
    color: #4facfe;
  }
}

.btn-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #e0e0e0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
}

.modal-body {
  padding: 1.5rem;
}

.modal-description {
  color: #a0a0a0;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.example-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #4facfe;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3);
  }
}

.example-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  i {
    font-size: 1.5rem;
    color: #4facfe;
  }

  h3 {
    font-size: 1.1rem;
    color: #e0e0e0;
    margin: 0;
  }
}

.example-description {
  color: #a0a0a0;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.example-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7fa8c9;
  font-size: 0.85rem;
  font-weight: 600;

  span {
    background: rgba(127, 168, 201, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
  }
}

// Transiciones
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .modal-content {
    max-height: 95vh;
  }

  .examples-grid {
    grid-template-columns: 1fr;
  }

  .modal-title {
    font-size: 1.2rem;
  }
}
</style>

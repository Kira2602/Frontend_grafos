<template>
  <main class="page-content" :class="{ 'stats-open': showStatsPanel }">
    <NavbarComponent />
    <section class="wrap" style="padding: 0 16px">
      <h1 class="title">Sorts</h1>
      <div class="bubble-container" ref="bubbleContainer">
        <div 
          v-for="(value, index) in bubbleArray" 
          :key="index"
          class="bubble"
          :style="bubbleStyle(value)"
          :title="value"
        >
          {{ shouldShowText(value) ? value : '' }}
        </div>
      </div>
      <div class="tool-bar">
        <input v-model="size" type="number" v-if="isRnd" placeholder="Cantidad de Elementos" class="rndInput"/>
        <input v-model="topL" type="number" v-if="isRnd" placeholder="Limite Superior" class="rndInput"/>
        <input v-model="bottomL" type="number" v-if="isRnd" placeholder="Limite Inferior" class="rndInput"/>
        <input v-model="array" type="text" v-if="!isRnd" placeholder="Ingrese el arreglo (separado por comas)" class="manualInput"/>
        
        <button 
          class="hover-btn"
          ref="generateBtn"
          v-if="!isGenerated"
          @click="generateArray">
          <i class="fas fa-plus"></i>
          <span class="btn-text">Generar</span>
        </button>
        
        <button 
          class="hover-btn"
          ref="clearBtn"
          v-if="isGenerated"
          @click="clearArray">
          <i class="fas fa-trash"></i>
          <span class="btn-text">Limpiar</span>
        </button>
        
        <button 
          class="hover-btn"
          @click="isRnd = !isRnd"
          ref="modeBtn">
          <i class="fas fa-dice" v-if="isRnd"></i>
          <i class="fas fa-pencil" v-else></i>
          <span class="btn-text">{{ isRnd ? 'Randomico' : 'Manual' }}</span>
        </button>

        <button 
          class="hover-btn import-btn"
          @click="showImportModal = true">
          <i class="fas fa-file-import"></i>
          <span class="btn-text">Importar</span>
        </button>
        
        <button 
          class="hover-btn"
          @click="isAsc = !isAsc"
          ref="orderBtn">
          <i class="fas fa-arrow-up-wide-short" v-if="isAsc"></i>
          <i class="fas fa-arrow-down-wide-short" v-else></i>
          <span class="btn-text">{{ isAsc ? 'Ascendente' : 'Descendente' }}</span>
        </button>
        
        <button 
          class="hover-btn toggle-stats-btn"
          v-if="currentArray.length > 0"
          @click="toggleStatsPanel">
          <i class="fas fa-chart-bar"></i>
          <span class="btn-text">{{ showStatsPanel ? 'Ocultar' : 'Mostrar' }} Stats</span>
        </button>
        
        <div style="position: relative; display: inline-flex; align-items: center;">
          <!-- acciones (se muestran arriba cuando fabOpen es true) -->
          <div
            v-show="fabOpen"
            style="position: absolute; right: 0; bottom: 72px; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; z-index: 50;"
          >
            <button
              class="hover-btn"
              @click="() => { playSortingAlgorithm('selection'); fabOpen = false }"
              title="Selection Sort"
              style="width: 220px; justify-content: flex-start; padding: 8px 12px;"
            >
              <i class="fas fa-list"></i>
              <span class="btn-text" style="margin-left: 8px;">Selection Sort</span>
            </button>

            <button
              class="hover-btn"
              @click="() => { playSortingAlgorithm('insert'); fabOpen = false }"
              title="Insert Sort"
              style="width: 220px; justify-content: flex-start; padding: 8px 12px;"
            >
              <i class="fas fa-pencil-alt"></i>
              <span class="btn-text" style="margin-left: 8px;">Insertion Sort</span>
            </button>

            <button
              class="hover-btn"
              @click="() => { playSortingAlgorithm('merge'); fabOpen = false }"
              title="Merge Sort"
              style="width: 220px; justify-content: flex-start; padding: 8px 12px;"
            >
              <i class="fas fa-code-merge"></i>
              <span class="btn-text" style="margin-left: 8px;">Merge Sort</span>
            </button>

            <button
              class="hover-btn"
              @click="() => { playSortingAlgorithm('shell'); fabOpen = false }"
              title="Shell Sort"
              style="width: 220px; justify-content: flex-start; padding: 8px 12px;"
            >
              <i class="fas fa-ellipsis-h"></i>
              <span class="btn-text" style="margin-left: 8px;">Shell Sort</span>
            </button>
          </div>

          <!-- botón principal (floating action) -->
          <button
            class="hover-btn"
            @click="fabOpen = !fabOpen"
            ref="playBtn"
            style="width:56px; height:56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; padding: 0;"
            :aria-expanded="fabOpen"
            :aria-label="fabOpen ? 'Cerrar menú de algoritmos' : 'Abrir menú de algoritmos'"
          >
            <i class="fas" :class="fabOpen ? 'fa-times' : 'fa-play'"></i>
          </button>
        </div>
      </div>
    </section>
    <section 
      ref="statsPanel" 
      class="side-stats"
      :class="{ show: showStatsPanel }"
    >
      <div class="stats-header">
        <h1>{{ currentAlgorithm ? `${currentAlgorithm} Stats` : 'Stats' }} <i class="fas fa-stopwatch"></i></h1>
        <button class="close-stats-btn" @click="toggleStatsPanel" title="Cerrar panel">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      
      <div v-if="isAlgorithmRunning || currentArray.length > 0" class="stats-content">
        <div class="stat-item">
          <h3>Arreglo Actual:</h3>
          <div class="array-display" id="currentArrayDisplay">
            [{{ currentArray.join(', ') }}]
          </div>
        </div>

        <div class="stat-item">
          <h3>Tiempo de Ejecución:</h3>
          <div class="time-display" id="timeDisplay">
            {{ executionTime }}s
          </div>
        </div>

        <div class="stat-item">
          <h3>Registro de Pasos:</h3>
          <div class="steps-display" id="stepsDisplay">
            <div class="steps-log">
              <div v-for="(step, index) in stepLog" :key="index" class="step-entry">
                <span class="step-time">[{{ step.time }}]</span>
                <span class="step-text">{{ step.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!isSorted">
          <div class="stat-item">
            <h3>Arreglo Inicial:</h3>
            <div class="array-display initial">
              [{{ initialArray.join(', ') }}]
            </div>
          </div>

          <div class="stat-item">
            <h3>Arreglo Ordenado:</h3>
            <div class="array-display sorted">
              [{{ sortedArray.join(', ') }}]
            </div>
          </div>
        </div>

        <!-- Botones de acción después de completar el sort -->
        <div v-if="!isAlgorithmRunning && sortedArray.length > 0" class="action-buttons">
          <button class="action-btn restart-btn" @click="restartAnimation">
            <i class="fas fa-redo"></i>
            <span>Reiniciar Animación</span>
          </button>
          
          <button class="action-btn export-btn" @click="showExportModal = true">
            <i class="fas fa-download"></i>
            <span>Exportar Arreglo</span>
          </button>
        </div>
      </div>

      <div v-else class="no-algorithm">
        <p>Selecciona un algoritmo de ordenamiento para ver las estadísticas</p>
      </div>
    </section>

    <!-- Modal de Exportación -->
    <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-download"></i> Exportar Arreglo</h2>
          <button class="modal-close" @click="showExportModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre del archivo:</label>
            <input 
              v-model="exportFileName" 
              type="text" 
              placeholder="mi_arreglo"
              class="modal-input"
            />
          </div>
          <div class="form-group">
            <label>Formato:</label>
            <div class="format-buttons">
              <button 
                @click="exportArray('json')" 
                class="format-btn json-btn">
                <i class="fas fa-file-code"></i>
                JSON
              </button>
              <button 
                @click="exportArray('csv')" 
                class="format-btn csv-btn">
                <i class="fas fa-file-csv"></i>
                CSV
              </button>
              <button 
                @click="exportArray('txt')" 
                class="format-btn txt-btn">
                <i class="fas fa-file-alt"></i>
                TXT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Importación -->
    <div v-if="showImportModal" class="modal-overlay" @click="showImportModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-file-import"></i> Importar Arreglo</h2>
          <button class="modal-close" @click="showImportModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Selecciona un archivo (JSON, CSV o TXT):</label>
            <input 
              type="file" 
              @change="handleFileImport"
              accept=".json,.csv,.txt"
              class="file-input"
              ref="fileInput"
            />
          </div>
          <p class="import-hint">
            <i class="fas fa-info-circle"></i>
            El archivo debe contener números separados por comas, espacios o saltos de línea.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import NavbarComponent from '@/components/NavbarComponent.vue'
import { ref, computed } from 'vue';
import { gsap } from 'gsap';

const size = ref();
const topL = ref();
const bottomL = ref();
const array = ref('');

const isRnd = ref(true);
const isAsc = ref(true);
const isGenerated = ref(false);
const fabOpen = ref(false); // Estado para el floating action button
const isSorted = ref(false);

// Modales
const showExportModal = ref(false);
const showImportModal = ref(false);
const exportFileName = ref('arreglo_ordenado');
const fileInput = ref(null);

// Array de burbujas generado
const bubbleArray = ref([]);
const bubbleContainer = ref(null);

// Variables para el panel de Stats
const showStatsPanel = ref(false);
const currentAlgorithm = ref('');
const currentArray = ref([]);
const initialArray = ref([]);
const sortedArray = ref([]);
const executionTime = ref(0);
const isAlgorithmRunning = ref(false);
const stepLog = ref([]);
const currentStepText = ref('');

// Refs para el panel de stats
const statsPanel = ref(null);

// Refs para los botones
const generateBtn = ref(null);
const clearBtn = ref(null);
const modeBtn = ref(null);
const orderBtn = ref(null);
const playBtn = ref(null);

// Función para calcular el tamaño de cada burbuja basado en su valor
const getBubbleSize = (value) => {
  if (bubbleArray.value.length === 0) return 50;
  
  const minValue = Math.min(...bubbleArray.value);
  const maxValue = Math.max(...bubbleArray.value);
  const valueRange = maxValue - minValue;
  
  // Altura del contenedor (min-height: 70% del wrap que es aprox 580px)
  // Considerando padding de 30px (15px arriba + 15px abajo)
  const containerHeight = 580 * 0.7; // aprox 406px
  const paddingVertical = 30;
  const availableHeight = containerHeight - paddingVertical;
  
  // Tamaño máximo basado en la altura disponible
  const maxSize = Math.min(availableHeight, 150);
  // Tamaño mínimo: 20% del máximo para mantener diferencias notorias
  const minSize = maxSize * 0.2;
  const sizeRange = maxSize - minSize;
  
  // Si todos los valores son iguales, usar tamaño medio
  if (valueRange === 0) {
    return (minSize + maxSize) / 2;
  }
  
  // Usar curva cuadrática para hacer las diferencias más evidentes
  const normalizedValue = (value - minValue) / valueRange;
  const curvedValue = Math.pow(normalizedValue, 0.6); // Curva más pronunciada
  const bubbleSize = minSize + (curvedValue * sizeRange);
  
  return bubbleSize;
};

// Función para verificar si las burbujas caben en el contenedor
const getScaleFactor = () => {
  if (bubbleArray.value.length === 0) return 1;
  
  // Obtener ancho real del contenedor o usar valor por defecto
  const containerElement = bubbleContainer.value;
  const containerWidth = containerElement ? containerElement.clientWidth : 1200;
  const padding = 40;
  const gapSize = 4;
  const bubbleCount = bubbleArray.value.length;
  
  // Calcular el ancho total necesario con tamaños originales
  const totalBubbleWidth = bubbleArray.value.reduce((sum, value) => {
    return sum + getBubbleSize(value);
  }, 0);
  
  const totalGapWidth = gapSize * (bubbleCount - 1);
  const totalNeededWidth = totalBubbleWidth + totalGapWidth + padding;
  
  const availableWidth = containerWidth - padding;
  
  // Si no caben todas las burbujas, calcular factor de escala
  // Pero mantener un factor mínimo de 0.3 para preservar diferencias visuales
  if (totalNeededWidth > availableWidth) {
    const calculatedScale = (availableWidth - totalGapWidth) / totalBubbleWidth;
    return Math.max(0.3, calculatedScale);
  }
  
  return 1; // No necesita escalar
};

// Estilo responsivo para las burbujas (tamaño proporcional al valor)
const bubbleStyle = computed(() => {
  return (value) => {
    if (bubbleArray.value.length === 0) return {};
    
    const baseSize = getBubbleSize(value);
    const scaleFactor = getScaleFactor();
    const finalSize = baseSize * scaleFactor;
    
    // Calcular valores normalizados para efectos visuales adicionales
    const minValue = Math.min(...bubbleArray.value);
    const maxValue = Math.max(...bubbleArray.value);
    const valueRange = maxValue - minValue;
    const normalizedValue = valueRange === 0 ? 0.5 : (value - minValue) / valueRange;
    
    // Añadir indicadores visuales adicionales para reforzar las diferencias
    const opacity = 0.75 + (normalizedValue * 0.25); // 0.75 a 1.0
    const shadowIntensity = 15 + (normalizedValue * 20); // 15 a 35
    
    // Determinar si mostrar texto basado en el tamaño final
    const showText = finalSize >= 22;
    const fontSize = showText ? Math.max(9, Math.min(18, finalSize / 3.2)) : 0;
    
    return {
      width: `${finalSize}px`,
      height: `${finalSize}px`,
      fontSize: `${fontSize}px`,
      margin: `0 2px`,
      flexShrink: 0,
      opacity: opacity,
      boxShadow: `0 4px ${shadowIntensity}px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
    };
  };
});

// Función para determinar si mostrar el texto en una burbuja específica
const shouldShowText = (value) => {
  if (bubbleArray.value.length === 0) return true;
  
  const baseSize = getBubbleSize(value);
  const scaleFactor = getScaleFactor();
  const finalSize = baseSize * scaleFactor;
  
  return finalSize >= 22;
};

const generateArray = () => {
  try {
    if (isRnd.value) {
      // Generación aleatoria
      const sizeVal = parseInt(size.value) || 10;
      const topVal = parseInt(topL.value) || 100;
      const bottomVal = parseInt(bottomL.value) || 1;
      
      if (sizeVal <= 0 || sizeVal > 1000) {
        alert('La cantidad de elementos debe estar entre 1 y 1000');
        return;
      }
      
      if (bottomVal >= topVal) {
        alert('El límite inferior debe ser menor que el límite superior');
        return;
      }
      
      const newArray = [];
      for (let i = 0; i < sizeVal; i++) {
        const randomValue = Math.floor(Math.random() * (topVal - bottomVal + 1)) + bottomVal;
        newArray.push(randomValue);
      }
      
      bubbleArray.value = newArray;
    } else {
      // Generación manual
      if (!array.value || array.value.trim() === '') {
        alert('Por favor ingrese los elementos del arreglo separados por comas');
        return;
      }
      
      const elements = array.value.split(',').map(item => {
        const num = parseInt(item.trim());
        if (isNaN(num)) {
          throw new Error(`"${item.trim()}" no es un número válido`);
        }
        return num;
      });
      
      if (elements.length === 0) {
        alert('Debe ingresar al menos un elemento');
        return;
      }
      
      if (elements.length > 1000) {
        alert('Máximo 1000 elementos permitidos');
        return;
      }
      
      bubbleArray.value = elements;
    }
    
    isGenerated.value = true;
    console.log('Arreglo generado:', bubbleArray.value);
  } catch (error) {
    alert(error.message);
  }
};

const clearArray = () => {
  bubbleArray.value = [];
  isGenerated.value = false;
  console.log('Arreglo limpiado');
};

// Función para animar el intercambio de posiciones de las burbujas
const animateBubbleSwap = async (oldArray, newArray) => {
  // Primero actualizar el DOM con el nuevo orden
  bubbleArray.value = [...newArray];
  
  // Si hay muchos elementos (>50), reducir animaciones para evitar lag
  const isManyElements = newArray.length > 50;
  
  if (isManyElements) {
    // Solo esperar un poco para que Vue actualice el DOM
    await new Promise(resolve => setTimeout(resolve, 5));
    return null;
  }
  
  // Esperar a que Vue actualice el DOM
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const bubbles = document.querySelectorAll('.bubble');
  
  if (!bubbles.length) return null;
  
  // Crear timeline para las animaciones de entrada
  const tl = gsap.timeline();
  
  // Detectar qué elementos cambiaron de posición
  const changedElements = [];
  const unchangedElements = [];
  
  bubbles.forEach((bubble, index) => {
    const value = parseInt(bubble.title);
    const oldIndex = oldArray.indexOf(value);
    
    if (oldIndex !== index && oldIndex !== -1) {
      changedElements.push(bubble);
    } else {
      unchangedElements.push(bubble);
    }
  });
  
  // Animar elementos que cambiaron de posición
  if (changedElements.length > 0) {
    // Efecto de "salto" para elementos que se movieron
    tl.fromTo(changedElements, {
      scale: 1.15,
      y: -10,
      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.6)'
    }, {
      scale: 1,
      y: 0,
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      duration: 0.15,
      ease: "power2.out",
      stagger: 0.01
    }, 0);
  }
  
  // Pequeña pulsación para elementos que no se movieron (solo si no son muchos)
  if (unchangedElements.length > 0 && unchangedElements.length < 30) {
    tl.to(unchangedElements, {
      scale: 1.02,
      duration: 0.08,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      stagger: 0.005
    }, 0.05);
  }
  
  return tl;
};

// Función para animar cambios en el arreglo con GSAP
const animateArrayUpdate = async (newArray, updateCurrentArray = true) => {
  const oldArray = [...currentArray.value];
  
  // Solo actualizar currentArray si se especifica (para evitar mostrar subarreglos pequeños)
  if (updateCurrentArray) {
    currentArray.value = [...newArray];
    
    // Animar el texto del arreglo solo si se actualiza
    gsap.fromTo("#currentArrayDisplay", 
      { opacity: 0.3, scale: 0.95 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.3,
        ease: "back.out(1.7)"
      }
    );
  }
  
  // Animar el intercambio de posiciones de las burbujas
  const swapAnimation = await animateBubbleSwap(oldArray, newArray);
  
  // Retornar la promesa de la animación si existe
  if (swapAnimation) {
    return swapAnimation;
  }
};

// Variables para el cronómetro real
let timerInterval = null;
let algorithmStartTime = 0;

// Función para iniciar cronómetro en tiempo real
const startRealTimeTimer = () => {
  algorithmStartTime = Date.now();
  executionTime.value = '0.000';
  
  // Limpiar intervalo anterior si existe
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Actualizar cronómetro cada 50ms
  timerInterval = setInterval(() => {
    const currentTime = (Date.now() - algorithmStartTime) / 1000;
    executionTime.value = currentTime.toFixed(3);
    
    // Pequeña animación visual cada segundo
    if (Math.floor(currentTime) !== Math.floor(currentTime - 0.05)) {
      gsap.fromTo("#timeDisplay", 
        { scale: 1.02 },
        { 
          scale: 1, 
          duration: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, 50);
};

// Función para detener cronómetro
const stopRealTimeTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Animación final
  gsap.fromTo("#timeDisplay", 
    { scale: 1.1, color: "#00ff00" },
    { 
      scale: 1, 
      color: "#ffffff", 
      duration: 0.5,
      ease: "elastic.out(1, 0.5)"
    }
  );
};

// Función para mostrar el panel de stats con animación GSAP
const showStatsWithAnimation = () => {
  showStatsPanel.value = true;
  
  // Animar la entrada del panel
  gsap.fromTo(statsPanel.value, 
    { x: '33.33vw' },
    { 
      x: 0, 
      duration: 0.6,
      ease: "power3.out"
    }
  );
};

// Función para alternar visibilidad del panel de stats
const toggleStatsPanel = () => {
  if (showStatsPanel.value) {
    // Ocultar panel
    gsap.to(statsPanel.value, {
      x: '33.33vw',
      duration: 0.4,
      ease: "power3.in",
      onComplete: () => {
        showStatsPanel.value = false;
      }
    });
  } else {
    // Mostrar panel
    showStatsWithAnimation();
  }
};

// Función para reiniciar la animación
const restartAnimation = async () => {
  if (initialArray.value.length === 0 || !currentAlgorithm.value) {
    alert('No hay ningún algoritmo para reiniciar');
    return;
  }

  // Resetear el arreglo al estado inicial
  bubbleArray.value = [...initialArray.value];
  currentArray.value = [...initialArray.value];
  stepLog.value = [];
  executionTime.value = '0.000';
  sortedArray.value = [];

  // Determinar qué algoritmo ejecutar
  const algorithmMap = {
    'Selection Sort': 'selection',
    'Insertion Sort': 'insert',
    'Merge Sort': 'merge',
    'Shell Sort': 'shell'
  };

  const algorithm = algorithmMap[currentAlgorithm.value];
  
  if (algorithm) {
    // Pequeña pausa antes de reiniciar
    await new Promise(resolve => setTimeout(resolve, 500));
    await playSortingAlgorithm(algorithm);
  }
};

// Función para exportar el arreglo
const exportArray = (format) => {
  const dataToExport = sortedArray.value.length > 0 ? sortedArray.value : bubbleArray.value;
  
  if (dataToExport.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const fileName = exportFileName.value || 'arreglo';
  let content = '';
  let mimeType = '';
  let extension = '';

  switch (format) {
    case 'json':
      content = JSON.stringify({
        array: dataToExport,
        algorithm: currentAlgorithm.value || 'None',
        timestamp: new Date().toISOString(),
        stats: {
          initialArray: initialArray.value,
          sortedArray: sortedArray.value,
          executionTime: executionTime.value
        }
      }, null, 2);
      mimeType = 'application/json';
      extension = 'json';
      break;
    
    case 'csv':
      content = dataToExport.join(',');
      mimeType = 'text/csv';
      extension = 'csv';
      break;
    
    case 'txt':
      content = dataToExport.join('\n');
      mimeType = 'text/plain';
      extension = 'txt';
      break;
  }

  // Crear y descargar el archivo
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showExportModal.value = false;
  
  // Mostrar notificación
  alert(`✅ Arreglo exportado como ${fileName}.${extension}`);
};

// Función para importar archivo
const handleFileImport = (event) => {
  const file = event.target.files[0];
  
  if (!file) return;

  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const extension = file.name.split('.').pop().toLowerCase();
      let importedArray = [];

      switch (extension) {
        case 'json': {
          const jsonData = JSON.parse(content);
          // Intentar diferentes estructuras de JSON
          if (Array.isArray(jsonData)) {
            importedArray = jsonData;
          } else if (jsonData.array && Array.isArray(jsonData.array)) {
            importedArray = jsonData.array;
          } else {
            throw new Error('Formato JSON no válido');
          }
          break;
        }
        
        case 'csv':
          importedArray = content
            .split(',')
            .map(item => parseInt(item.trim()))
            .filter(num => !isNaN(num));
          break;
        
        case 'txt':
          importedArray = content
            .split(/[\n,\s]+/)
            .map(item => parseInt(item.trim()))
            .filter(num => !isNaN(num));
          break;
        
        default:
          throw new Error('Formato de archivo no soportado');
      }

      if (importedArray.length === 0) {
        throw new Error('No se encontraron números válidos en el archivo');
      }

      if (importedArray.length > 1000) {
        throw new Error('El archivo contiene más de 1000 elementos');
      }

      // Aplicar el arreglo importado
      bubbleArray.value = importedArray;
      isGenerated.value = true;
      showImportModal.value = false;

      // Limpiar el input
      if (fileInput.value) {
        fileInput.value.value = '';
      }

      alert(`✅ Arreglo importado exitosamente: ${importedArray.length} elementos`);
      
    } catch (error) {
      alert(`❌ Error al importar: ${error.message}`);
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    }
  };

  reader.onerror = () => {
    alert('❌ Error al leer el archivo');
  };

  reader.readAsText(file);
};

// Selection Sort optimizado (O(n²) - MÁS LENTO)
const selectionSort = async (arr) => {
  const array = [...arr];
  const n = array.length;
  let stepCounter = 0;
  const ascending = isAsc.value;
  const isManyElements = n > 50; // Optimización para muchos elementos
  
  const addStep = (text) => {
    stepLog.value.push({
      text: text,
      time: (stepCounter * 0.06).toFixed(3)
    });
    stepCounter++;
  };
  
  addStep(`🚀 Iniciando Selection Sort (${ascending ? 'Ascendente' : 'Descendente'})`);
  addStep(`📊 Arreglo inicial: [${array.join(', ')}]`);
  
  for (let i = 0; i < n - 1; i++) {
    let targetIdx = i;
    const targetType = ascending ? 'mínimo' : 'máximo';
    addStep(`\n🔍 Iteración ${i + 1}: Buscando ${targetType} desde posición ${i}`);
    addStep(`📌 Valor inicial ${targetType}: ${array[targetIdx]} en posición ${targetIdx}`);
    
    for (let j = i + 1; j < n; j++) {
      // Reducir logs si hay muchos elementos
      if (!isManyElements || j % 5 === 0) {
        addStep(`   🔎 Comparando: ${array[j]} (pos ${j}) vs ${array[targetIdx]} (pos ${targetIdx})`);
      }
      
      const shouldSwap = ascending ? array[j] < array[targetIdx] : array[j] > array[targetIdx];
      
      if (shouldSwap) {
        addStep(`   ✅ Nuevo ${targetType} encontrado: ${array[j]} en posición ${j}`);
        targetIdx = j;
      } else if (!isManyElements) {
        const comparison = ascending ? '>=' : '<=';
        addStep(`   ❌ ${array[j]} ${comparison} ${array[targetIdx]}, se mantiene el ${targetType}`);
      }
      
      // Reducir delay si hay muchos elementos
      await new Promise(resolve => setTimeout(resolve, isManyElements ? 10 : 60));
    }
    
    if (targetIdx !== i) {
      addStep(`🔄 Intercambio: ${array[i]} (pos ${i}) ↔ ${array[targetIdx]} (pos ${targetIdx})`);
      [array[i], array[targetIdx]] = [array[targetIdx], array[i]];
      addStep(`✨ Estado: [${array.join(', ')}]`);
      
      // Solo animar intercambios importantes o cada N pasos si hay muchos elementos
      if (!isManyElements || i % 3 === 0) {
        await animateArrayUpdate(array, true);
        await new Promise(resolve => setTimeout(resolve, isManyElements ? 5 : 30));
      } else {
        // Actualizar sin animación
        bubbleArray.value = [...array];
        currentArray.value = [...array];
      }
    } else {
      addStep(`⏭️ No hay intercambio necesario, elemento ya en posición correcta`);
    }
  }
  
  addStep(`\n🎉 Selection Sort completado`);
  addStep(`📊 Arreglo final ordenado: [${array.join(', ')}]`);
  
  return array;
};

// Insertion Sort optimizado (O(n²) - SEGUNDO MÁS LENTO)
const insertionSort = async (arr) => {
  const array = [...arr];
  let stepCounter = 0;
  const ascending = isAsc.value;
  const isManyElements = array.length > 50;
  
  const addStep = (text) => {
    stepLog.value.push({
      text: text,
      time: (stepCounter * 0.04).toFixed(3)
    });
    stepCounter++;
  };
  
  addStep(`🚀 Iniciando Insertion Sort (${ascending ? 'Ascendente' : 'Descendente'})`);
  addStep(`📊 Arreglo inicial: [${array.join(', ')}]`);
  
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    
    addStep(`\n🔍 Iteración ${i}: Insertando ${key} desde posición ${i}`);
    addStep(`📌 Elemento a insertar: ${key}`);
    
    let moves = 0;
    
    const shouldMove = (arrayValue, keyValue) => {
      return ascending ? arrayValue > keyValue : arrayValue < keyValue;
    };
    
    while (j >= 0 && shouldMove(array[j], key)) {
      const comparison = ascending ? '>' : '<';
      if (!isManyElements || moves % 3 === 0) {
        addStep(`   🔎 Comparando: ${array[j]} (pos ${j}) ${comparison} ${key}`);
        addStep(`   ➡️ Moviendo ${array[j]} de posición ${j} a ${j + 1}`);
      }
      array[j + 1] = array[j];
      j = j - 1;
      moves++;
      
      // Insertion Sort es O(n²) pero mejor que Selection
      await new Promise(resolve => setTimeout(resolve, isManyElements ? 8 : 40));
    }
    
    array[j + 1] = key;
    
    if (moves > 0) {
      addStep(`✅ Insertando ${key} en posición ${j + 1}`);
      addStep(`📊 Total de movimientos: ${moves}`);
      if (!isManyElements) {
        addStep(`✨ Estado: [${array.join(', ')}]`);
      }
      
      // Animar solo cada N pasos si hay muchos elementos
      if (!isManyElements || i % 5 === 0) {
        await animateArrayUpdate(array, true);
        await new Promise(resolve => setTimeout(resolve, isManyElements ? 3 : 20));
      } else {
        bubbleArray.value = [...array];
        currentArray.value = [...array];
      }
    } else {
      if (!isManyElements) {
        addStep(`⏭️ ${key} ya está en posición correcta`);
      }
    }
  }
  
  addStep(`\n🎉 Insertion Sort completado`);
  addStep(`📊 Arreglo final ordenado: [${array.join(', ')}]`);
  
  return array;
};

// Merge Sort optimizado (O(n log n) - EL MÁS RÁPIDO)
const mergeSort = async (arr, isRoot = true, depth = 0) => {
  if (isRoot) {
    mergeSteps = [];
    mergeStepCounter = 0;
    const addStep = (text) => {
      mergeSteps.push({
        text: text,
        time: (mergeStepCounter * 0.02).toFixed(3)
      });
      mergeStepCounter++;
    };
    const ascending = isAsc.value;
    addStep(`🚀 Iniciando Merge Sort (${ascending ? 'Ascendente' : 'Descendente'})`);
    addStep(`📊 Arreglo inicial: [${arr.join(', ')}]`);
  }
  
  if (arr.length <= 1) {
    const addStep = (text) => {
      mergeSteps.push({
        text: text,
        time: (mergeStepCounter * 0.02).toFixed(3)
      });
      mergeStepCounter++;
    };
    if (arr.length === 1) {
      addStep(`${'  '.repeat(depth)}🔹 Caso base alcanzado: [${arr[0]}]`);
    }
    return arr;
  }
  
  const mid = Math.floor(arr.length / 2);
  const leftPart = arr.slice(0, mid);
  const rightPart = arr.slice(mid);
  
  const addStep = (text) => {
    mergeSteps.push({
      text: text,
      time: (mergeStepCounter * 0.02).toFixed(3)
    });
    mergeStepCounter++;
  };
  
  addStep(`\n${'  '.repeat(depth)}✂️ Dividiendo: [${arr.join(', ')}]`);
  addStep(`${'  '.repeat(depth)}   ⬅️ Izquierda: [${leftPart.join(', ')}]`);
  addStep(`${'  '.repeat(depth)}   ➡️ Derecha: [${rightPart.join(', ')}]`);
  
  const left = await mergeSort(leftPart, false, depth + 1);
  const right = await mergeSort(rightPart, false, depth + 1);
  
  return await merge(left, right, isRoot, depth);
};

let mergeSteps = [];
let mergeStepCounter = 0;

const merge = async (left, right, isRoot = false, depth = 0) => {
  let result = [];
  let leftIndex = 0;
  let rightIndex = 0;
  const ascending = isAsc.value;
  
  const addStep = (text) => {
    mergeSteps.push({
      text: text,
      time: (mergeStepCounter * 0.02).toFixed(3)
    });
    mergeStepCounter++;
  };
  
  addStep(`\n${'  '.repeat(depth)}🔀 Fusionando: [${left.join(', ')}] + [${right.join(', ')}]`);
  
  while (leftIndex < left.length && rightIndex < right.length) {
    const leftVal = left[leftIndex];
    const rightVal = right[rightIndex];
    
    addStep(`${'  '.repeat(depth)}   🔎 Comparando: ${leftVal} vs ${rightVal}`);
    
    const takeLeft = ascending ? leftVal < rightVal : leftVal > rightVal;
    
    if (takeLeft) {
      result.push(leftVal);
      const comparison = ascending ? '<=' : '>=';
      addStep(`${'  '.repeat(depth)}   ✅ ${leftVal} ${comparison} ${rightVal} → Tomar ${leftVal} de izquierda`);
      leftIndex++;
    } else {
      result.push(rightVal);
      const comparison = ascending ? '<' : '>';
      addStep(`${'  '.repeat(depth)}   ✅ ${rightVal} ${comparison} ${leftVal} → Tomar ${rightVal} de derecha`);
      rightIndex++;
    }
    
    // Merge Sort es O(n log n) - EL MÁS EFICIENTE
    await new Promise(resolve => setTimeout(resolve, 3));
  }
  
  // Agregar elementos restantes
  if (leftIndex < left.length) {
    const remaining = left.slice(leftIndex);
    addStep(`${'  '.repeat(depth)}   📥 Agregando elementos restantes de izquierda: [${remaining.join(', ')}]`);
    result = result.concat(remaining);
  }
  
  if (rightIndex < right.length) {
    const remaining = right.slice(rightIndex);
    addStep(`${'  '.repeat(depth)}   📥 Agregando elementos restantes de derecha: [${remaining.join(', ')}]`);
    result = result.concat(remaining);
  }
  
  const merged = result;
  
  addStep(`${'  '.repeat(depth)}✨ Resultado fusionado: [${merged.join(', ')}]`);
  
  // Solo animar fusiones significativas
  if (merged.length === bubbleArray.value.length || merged.length >= Math.floor(bubbleArray.value.length / 2)) {
    await animateArrayUpdate(merged, true);
  } else {
    await animateArrayUpdate(merged, false);
  }
  
  if (isRoot) {
    addStep(`\n🎉 Merge Sort completado`);
    addStep(`📊 Arreglo final ordenado: [${merged.join(', ')}]`);
    
    // Agregar todos los pasos
    stepLog.value = [...mergeSteps];
  }
  
  return merged;
};

// Shell Sort optimizado (O(n^1.5) - SEGUNDO MÁS RÁPIDO)
const shellSort = async (arr) => {
  const array = [...arr];
  const n = array.length;
  let stepCounter = 0;
  const ascending = isAsc.value;
  const isManyElements = n > 50;
  
  const addStep = (text) => {
    stepLog.value.push({
      text: text,
      time: (stepCounter * 0.015).toFixed(3)
    });
    stepCounter++;
  };
  
  addStep(`🚀 Iniciando Shell Sort (${ascending ? 'Ascendente' : 'Descendente'})`);
  addStep(`📊 Arreglo inicial: [${array.join(', ')}]`);
  
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    addStep(`\n🔢 Gap actual: ${gap}`);
    addStep(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    for (let i = gap; i < n; i++) {
      const temp = array[i];
      let j = i;
      
      if (!isManyElements || i % 10 === 0) {
        addStep(`\n📌 Procesando elemento ${temp} en posición ${i}`);
        addStep(`   Comparando con elementos a distancia ${gap}`);
      }
      
      let comparisons = 0;
      let movements = 0;
      
      const shouldMove = (arrayValue, tempValue) => {
        return ascending ? arrayValue > tempValue : arrayValue < tempValue;
      };
      
      while (j >= gap && shouldMove(array[j - gap], temp)) {
        comparisons++;
        const comparison = ascending ? '>' : '<';
        if (!isManyElements || comparisons % 3 === 0) {
          addStep(`   🔎 Comparando: ${array[j - gap]} (pos ${j - gap}) ${comparison} ${temp}`);
          addStep(`   ➡️ Moviendo ${array[j - gap]} de posición ${j - gap} a ${j}`);
        }
        array[j] = array[j - gap];
        movements++;
        j -= gap;
        
        // Shell Sort es O(n^1.5) - más eficiente que O(n²)
        await new Promise(resolve => setTimeout(resolve, isManyElements ? 3 : 15));
      }
      
      if (j !== i) {
        array[j] = temp;
        if (!isManyElements) {
          addStep(`   ✅ Insertando ${temp} en posición ${j}`);
          addStep(`   📊 Comparaciones: ${comparisons}, Movimientos: ${movements}`);
        }
      } else if (!isManyElements) {
        addStep(`   ⏭️ ${temp} permanece en posición ${i}`);
      }
    }
    
    // Solo animar al final de cada gap
    if (!isManyElements) {
      addStep(`✨ Estado tras gap ${gap}: [${array.join(', ')}]`);
    }
    await animateArrayUpdate(array, true);
    await new Promise(resolve => setTimeout(resolve, isManyElements ? 2 : 10));
  }
  
  addStep(`\n🎉 Shell Sort completado`);
  addStep(`📊 Arreglo final ordenado: [${array.join(', ')}]`);
  
  return array;
};

// Función principal para ejecutar algoritmos
const playSortingAlgorithm = async (algorithm) => {
  if (bubbleArray.value.length === 0) {
    alert('Primero debes generar un arreglo');
    return;
  }
  
  if (isAlgorithmRunning.value) {
    alert('Ya hay un algoritmo ejecutándose');
    return;
  }
  
  // Configurar estado inicial
  isAlgorithmRunning.value = true;
  initialArray.value = [...bubbleArray.value];
  currentArray.value = [...bubbleArray.value];
  executionTime.value = '0.000';
  sortedArray.value = [];
  stepLog.value = [];
  currentStepText.value = '';
  
  // Configurar nombre del algoritmo
  const algorithmNames = {
    'selection': 'Selection Sort',
    'insert': 'Insertion Sort',
    'merge': 'Merge Sort',
    'shell': 'Shell Sort'
  };
  
  currentAlgorithm.value = algorithmNames[algorithm];
  
  // Mostrar panel de stats
  showStatsWithAnimation();
  
  // Iniciar cronómetro real
  startRealTimeTimer();
  
  try {
    let result;
    
    switch (algorithm) {
      case 'selection':
        result = await selectionSort(bubbleArray.value);
        break;
      case 'insert':
        result = await insertionSort(bubbleArray.value);
        break;
      case 'merge':
        result = await mergeSort(bubbleArray.value, true);
        break;
      case 'shell':
        result = await shellSort(bubbleArray.value);
        break;
      default:
        throw new Error('Algoritmo no implementado');
    }
    
    // Detener cronómetro
    stopRealTimeTimer();
    
    // Configurar resultado final
    sortedArray.value = [...result];
    bubbleArray.value = [...result];
    
    // Animar finalización
    gsap.to(".final-results", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    });
    
  } catch (error) {
    console.error('Error en algoritmo:', error);
    alert('Error ejecutando el algoritmo: ' + error.message);
    stopRealTimeTimer(); // Detener cronómetro en caso de error
  } finally {
    isAlgorithmRunning.value = false;
  }
};
</script>

<style lang="scss" scoped>
$navbar-height: 72px;

$page-bg: #0f1120;
$panel-bg: #2c2f3a;
$panel-border: rgba(255, 255, 255, 0.08);
$shadow: 0 10px 24px rgba(0, 0, 0, 0.25);

.page-content {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  background: $page-bg;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.stats-open {
    .wrap {
      width: 60%;
      max-width: none;
    }    
  }
}

h1 {
  text-align: center;
  font-size: 1.8rem;
  color: #333;
  margin: 4px 0 8px 0;
}

.title {
  font-size: 2.4rem;
  color: #fff;
  text-align: center;
}

.wrap {
  height: 83vh;
  width: 100%;
  margin: 90px 20px 0 20px;
  padding: 12px 16px;  
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.side-stats {
  position: fixed;
  top: 90px;
  right: -40vw; /* Oculto fuera de la pantalla */
  width: 33.340vw; /* 1/3 de la pantalla */
  height: 78.5vh;
  padding: 16px;
  border-radius: 20px 0 0 20px;
  background: #e7e7ec;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
  z-index: 10;
  overflow-y: auto;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &.show {
    right: 0; /* Posición visible */
  }

  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 2px solid #ddd;
    padding-bottom: 8px;

    h1 {
      font-size: 1.6rem;
      color: #333;
      margin: 0;
    }

    .close-stats-btn {
      background: #ff5252;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: white;

      &:hover {
        background: #ff1744;
        transform: rotate(90deg);
      }

      i {
        font-size: 16px;
      }
    }
  }

  .stats-content {
    .stat-item {
      margin-bottom: 16px;
      
      h3 {
        font-size: 1.1rem;
        color: #444;
        margin-bottom: 6px;
      }

      .array-display {
        background: #f8f9fa;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        padding: 5px 10px;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        font-weight: bold;
        color: #495057;
        min-height: 35px;
        display: flex;
        align-items: center;
        transition: all 0.3s ease;

        &.initial {
          border-color: #007bff;
          background: #e7f3ff;
        }

        &.sorted {
          border-color: #28a745;
          background: #e8f5e8;
        }
      }

      .time-display {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        padding: 10px;
        font-family: 'Courier New', monospace;
        font-size: 1.2rem;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      .steps-display {
        background: #f8f9fa;
        border: 2px solid #6c757d;
        border-radius: 8px;
        padding: 10px;
        max-height: 250px;
        overflow-y: auto;
        font-family: 'Courier New', monospace;

        .current-step {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 8px 12px;
          margin-bottom: 10px;
          font-weight: bold;
          color: #856404;
          min-height: 20px;
        }

        .steps-log {
          .step-entry {
            padding: 4px 0;
            border-bottom: 1px solid #e9ecef;
            font-size: 0.9rem;

            &:last-child {
              border-bottom: none;
            }

            .step-time {
              color: #6c757d;
              font-weight: bold;
              margin-right: 8px;
              
              &::after {
                content: "s";
              }
            }

            .step-text {
              color: #495057;
            }
          }
        }

        &::-webkit-scrollbar {
          width: 6px;
        }
        
        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
      }
    }

    .final-results {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      opacity: 0;
      transform: translateY(20px);
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #ddd;

      .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;

        i {
          font-size: 1.1rem;
        }

        &.restart-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
        }

        &.export-btn {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
          }
        }
      }
    }
  }

  .no-algorithm {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60%;
    text-align: center;
    color: #6c757d;
    font-style: italic;
    font-size: 1.2rem;
  }
}

.bubble-container {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
  align-items: center;
  gap: 2px;
  padding: 15px 20px;
  min-height: 70%;
  max-height: 130px;
  max-width: 1375px;
  overflow-x: auto;
  overflow-y: hidden;
  border: 2px dashed #ccc;
  border-radius: 12px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  .bubble {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: bold;
    text-align: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    user-select: none;
    position: relative;
    flex-shrink: 0;
    min-width: 12px;
    min-height: 12px;
    will-change: transform;
    
    &:hover {
      transform: scale(1.05) translateY(-1px);
      box-shadow: 
        0 6px 25px rgba(102, 126, 234, 0.7),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      z-index: 10;
    }
    
    &:active {
      transform: scale(0.98);
    }

    // Gradientes alternativos para variedad visual
    &:nth-child(2n) {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      box-shadow: 
        0 3px 10px rgba(240, 147, 251, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      
      &:hover {
        box-shadow: 
          0 6px 20px rgba(240, 147, 251, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
    }

    &:nth-child(3n) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      box-shadow: 
        0 3px 10px rgba(79, 172, 254, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      
      &:hover {
        box-shadow: 
          0 6px 20px rgba(79, 172, 254, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
    }

    &:nth-child(4n) {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      box-shadow: 
        0 3px 10px rgba(67, 233, 123, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      
      &:hover {
        box-shadow: 
          0 6px 20px rgba(67, 233, 123, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
    }

    &:nth-child(5n) {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      box-shadow: 
        0 3px 10px rgba(250, 112, 154, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      
      &:hover {
        box-shadow: 
          0 6px 20px rgba(250, 112, 154, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
    }
  }

  // Cuando no hay burbujas
  &:empty::before {
    content: "Genera un arreglo para ver las burbujas aquí";
    color: #999;
    font-style: italic;
    font-size: 1.2rem;
  }
}

.tool-bar {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 10px;
  border-radius: 20px;
  background-color: #ccc;

  .manualInput {
    padding: 8px 20px;
    border: none;
    border-radius: 20px;
    font-size: 1rem;
    width: 45%;
    box-shadow: $shadow;
    outline: none;

    &::placeholder {
      color: #999;
    }
  }

  .rndInput{
    width: 10%;
    padding: 8px 20px;
    border: none;
    border-radius: 20px;
    font-size: 1rem;
    box-shadow: $shadow;
    outline: none;

    &::placeholder {
      color: #999;
    }
  }

  .hover-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: #4caf50;
    padding: 8px 15px;
    border-radius: 20px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: $shadow;
    transition: background 0.45s, border-radius 0.3s;
    overflow: hidden;
    white-space: nowrap;

    &:hover {
      background: white;
      color: #4caf50;
    }

    &.import-btn {
      background: #2196f3;

      &:hover {
        background: white;
        color: #2196f3;
      }
    }

    &.toggle-stats-btn {
      background: #ff9800;

      &:hover {
        background: white;
        color: #ff9800;
      }
    }

    i {
      font-size: 1rem;
      flex-shrink: 0;
    }

    .btn-text {
      font-size: 1rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
    }
  }
}

// Estilos para modales
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;

    i {
      color: #667eea;
    }
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    transition: color 0.3s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #ff5252;
    }
  }
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
  }

  .modal-input {
    width: 90%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }

  .file-input {
    width: 100%;
    padding: 10px;
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.3s ease;

    &:hover {
      border-color: #667eea;
    }
  }
}

.format-buttons {
  display: flex;
  gap: 12px;
  justify-content: space-between;

  .format-btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    color: white;

    i {
      font-size: 1.5rem;
    }

    &.json-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
    }

    &.csv-btn {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(67, 233, 123, 0.4);
      }
    }

    &.txt-btn {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(250, 112, 154, 0.4);
      }
    }
  }
}

.import-hint {
  margin-top: 12px;
  padding: 12px;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #1976d2;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 1.1rem;
  }
}
</style>
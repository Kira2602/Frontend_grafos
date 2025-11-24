<template>
  <div class="fuzzy-page">
    <NavbarComponent />
    
    <div class="content-wrapper">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="main-title">
            <i class="fa-solid fa-brain"></i>
            Lógica Difusa
          </h1>
          <p class="subtitle">
            Razonamiento aproximado para sistemas de decisión inteligentes
          </p>
        </div>
      </section>

      <!-- Main Content -->
      <div class="main-content">
        <!-- ¿Qué es la Lógica Difusa? -->
        <section class="info-section">
          <div class="section-card">
            <div class="card-header">
              <i class="fa-solid fa-question-circle icon"></i>
              <h2>¿Qué es la Lógica Difusa?</h2>
            </div>
            <div class="card-content">
              <p>
                La <strong>Lógica Difusa</strong> (Fuzzy Logic) es una extensión de la lógica clásica 
                que permite trabajar con valores de verdad que van más allá del simple "verdadero" o "falso". 
                En lugar de usar únicamente 0 y 1, la lógica difusa permite cualquier valor entre 0 y 1, 
                representando grados de pertenencia o niveles de verdad.
              </p>
              <p>
                Fue introducida por <strong>Lotfi Zadeh</strong> en 1965 como una forma de modelar 
                la imprecisión del razonamiento humano y manejar conceptos vagos como "alto", "caliente", 
                "rápido" o "cerca", que no tienen límites precisos.
              </p>
              
              <div class="example-box">
                <h4><i class="fa-solid fa-lightbulb"></i> Ejemplo:</h4>
                <p>
                  En lógica clásica, una persona de 1.75m podría ser clasificada como "alta" o "no alta". 
                  En lógica difusa, esa misma persona podría tener un grado de pertenencia de 0.6 al conjunto 
                  "alta" y 0.4 al conjunto "media", reflejando la ambigüedad natural del concepto.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- ¿Cómo funciona? -->
        <section class="info-section">
          <div class="section-card">
            <div class="card-header">
              <i class="fa-solid fa-gears icon"></i>
              <h2>¿Cómo Funciona?</h2>
            </div>
            <div class="card-content">
              <p>
                Un sistema de lógica difusa opera en tres etapas principales:
              </p>

              <div class="steps-container">
                <div class="step-card">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h3>Fusificación (Fuzzification)</h3>
                    <p>
                      Convierte valores numéricos precisos en grados de pertenencia a conjuntos difusos 
                      utilizando <strong>funciones de pertenencia</strong>. Por ejemplo, una temperatura 
                      de 25°C podría pertenecer al conjunto "templado" con un grado de 0.7 y al conjunto 
                      "caliente" con un grado de 0.3.
                    </p>
                  </div>
                </div>

                <div class="step-card">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h3>Inferencia Difusa</h3>
                    <p>
                      Aplica <strong>reglas difusas</strong> del tipo "SI-ENTONCES" para razonar sobre 
                      los datos fusificados. Por ejemplo: "SI la temperatura es caliente Y la humedad 
                      es alta ENTONCES el ventilador debe girar rápido". Estas reglas se evalúan usando 
                      operadores difusos (AND, OR, NOT).
                    </p>
                  </div>
                </div>

                <div class="step-card">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h3>Desfusificación (Defuzzification)</h3>
                    <p>
                      Convierte el resultado difuso en un valor numérico preciso que puede ser usado 
                      para controlar un sistema. Los métodos más comunes incluyen el <strong>centroide</strong>, 
                      el <strong>máximo</strong> y la <strong>media de los máximos</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div class="formula-box">
                <h4>Funciones de Pertenencia Comunes:</h4>
                <ul>
                  <li><strong>Triangular:</strong> Forma de triángulo, con un pico en el valor central</li>
                  <li><strong>Trapezoidal:</strong> Similar al triangular pero con una meseta en la cima</li>
                  <li><strong>Gaussiana:</strong> Curva en forma de campana suave</li>
                  <li><strong>Sigmoidal:</strong> Curva S, útil para transiciones graduales</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- ¿Cuándo se usa? -->
        <section class="info-section">
          <div class="section-card">
            <div class="card-header">
              <i class="fa-solid fa-rocket icon"></i>
              <h2>¿Cuándo se Usa la Lógica Difusa?</h2>
            </div>
            <div class="card-content">
              <p>
                La lógica difusa es especialmente útil en situaciones donde:
              </p>
              
              <ul class="features-list">
                <li>
                  <i class="fa-solid fa-check-circle"></i>
                  Los datos son <strong>imprecisos o vagos</strong> por naturaleza
                </li>
                <li>
                  <i class="fa-solid fa-check-circle"></i>
                  Se necesita modelar el <strong>razonamiento humano</strong> o el conocimiento experto
                </li>
                <li>
                  <i class="fa-solid fa-check-circle"></i>
                  Los sistemas requieren <strong>respuestas graduales</strong> en lugar de binarias
                </li>
                <li>
                  <i class="fa-solid fa-check-circle"></i>
                  La complejidad del modelo matemático exacto sería <strong>muy alta</strong>
                </li>
              </ul>

              <div class="applications-grid">
                <div class="app-card">
                  <i class="fa-solid fa-industry"></i>
                  <h4>Control Industrial</h4>
                  <p>Control de temperatura, presión, velocidad en procesos industriales</p>
                </div>

                <div class="app-card">
                  <i class="fa-solid fa-car"></i>
                  <h4>Automoción</h4>
                  <p>Sistemas de frenado ABS, transmisiones automáticas, control de crucero</p>
                </div>

                <div class="app-card">
                  <i class="fa-solid fa-home"></i>
                  <h4>Domótica</h4>
                  <p>Aires acondicionados inteligentes, lavadoras, aspiradoras robot</p>
                </div>

                <div class="app-card">
                  <i class="fa-solid fa-camera"></i>
                  <h4>Visión Artificial</h4>
                  <p>Reconocimiento de patrones, clasificación de imágenes</p>
                </div>

                <div class="app-card">
                  <i class="fa-solid fa-heartbeat"></i>
                  <h4>Medicina</h4>
                  <p>Sistemas de diagnóstico, dosificación de medicamentos</p>
                </div>

                <div class="app-card">
                  <i class="fa-solid fa-chart-line"></i>
                  <h4>Finanzas</h4>
                  <p>Evaluación de riesgos, sistemas de trading automático</p>
                </div>

                <div class="app-card">
                  <i class="fa-solid fa-robot"></i>
                  <h4>Robótica</h4>
                  <p>Navegación autónoma, toma de decisiones en tiempo real</p>
                </div>

                <div class="app-card">
                  <i class="fa-solid fa-gamepad"></i>
                  <h4>Videojuegos</h4>
                  <p>Inteligencia artificial de NPCs, comportamiento adaptativo</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Ventajas y Desventajas -->
        <section class="info-section">
          <div class="pros-cons-grid">
            <div class="section-card pros-card">
              <div class="card-header">
                <i class="fa-solid fa-thumbs-up icon"></i>
                <h2>Ventajas</h2>
              </div>
              <div class="card-content">
                <ul class="bullet-list">
                  <li>Maneja la <strong>incertidumbre</strong> de forma natural</li>
                  <li>Modela el <strong>conocimiento experto</strong> mediante reglas lingüísticas</li>
                  <li>Requiere <strong>menos datos</strong> que los modelos estadísticos complejos</li>
                  <li>Proporciona <strong>respuestas suaves</strong> y graduales</li>
                  <li>Fácil de <strong>entender e implementar</strong></li>
                  <li><strong>Robusta</strong> ante datos imprecisos o ruidosos</li>
                </ul>
              </div>
            </div>

            <div class="section-card cons-card">
              <div class="card-header">
                <i class="fa-solid fa-exclamation-triangle icon"></i>
                <h2>Desventajas</h2>
              </div>
              <div class="card-content">
                <ul class="bullet-list">
                  <li>Requiere <strong>experiencia</strong> para definir funciones de pertenencia</li>
                  <li>Las reglas pueden volverse <strong>complejas</strong> en sistemas grandes</li>
                  <li>No siempre es la <strong>mejor opción</strong> si hay modelos matemáticos precisos</li>
                  <li>Dificultad para <strong>optimizar</strong> parámetros automáticamente</li>
                  <li>Puede ser <strong>computacionalmente costosa</strong> en tiempo real</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Button -->
        <section class="cta-section">
          <div class="cta-card">
            <div class="cta-content">
              <h2>
                <i class="fa-solid fa-flask"></i>
                Experimenta con Lógica Difusa
              </h2>
              <p>
                Prueba un ejemplo práctico utilizando <strong>MATLAB Fuzzy Logic Designer</strong>. 
                Diseña sistemas de inferencia difusa, visualiza funciones de pertenencia y simula 
                comportamientos complejos de manera interactiva.
              </p>
              <button class="matlab-btn" @click="launchMatlabExample">
                <i class="fa-solid fa-play-circle"></i>
                Lanzar Ejemplo en MATLAB
              </button>
            </div>
            <div class="cta-icon">
              <i class="fa-solid fa-code"></i>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavbarComponent from '@/components/NavbarComponent.vue'

const launchMatlabExample = () => {
  // Placeholder para la funcionalidad futura de MATLAB
  alert('Funcionalidad de MATLAB Fuzzy Logic Designer en desarrollo.\n\nPróximamente podrás interactuar con ejemplos prácticos directamente desde aquí.')
}
</script>

<style scoped lang="scss">
$navbar-height: 72px;
$page-bg: #0f1120;
$panel-bg: #2c2f3a;
$panel-border: rgba(255, 255, 255, 0.08);
$text-color: #e7e7ec;
$text-muted: #a0a0b0;
$accent: #567c8d;
$accent-light: #C8D9E6;
$success: #4caf50;
$warning: #ff9800;
$shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
$shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.15);

.fuzzy-page {
  min-height: 100vh;
  background: $page-bg;
  font-family: 'Poppins', sans-serif;
  color: $text-color;
}

.content-wrapper {
  padding-top: $navbar-height;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, rgba(86, 124, 141, 0.2) 0%, rgba(44, 47, 58, 0.8) 100%);
  padding: 60px 24px;
  text-align: center;
  border-bottom: 1px solid $panel-border;
  box-shadow: $shadow-sm;

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .main-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: $accent-light;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    i {
      margin-right: 16px;
      color: $accent;
    }
  }

  .subtitle {
    font-size: 1.25rem;
    color: $text-muted;
    font-weight: 300;
  }
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

.info-section {
  margin-bottom: 48px;
}

/* Section Cards */
.section-card {
  background: $panel-bg;
  border: 1px solid $panel-border;
  border-radius: 16px;
  padding: 32px;
  box-shadow: $shadow;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid $panel-border;

    .icon {
      font-size: 2rem;
      color: $accent;
    }

    h2 {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
      color: $accent-light;
    }
  }

  .card-content {
    line-height: 1.8;

    p {
      margin-bottom: 16px;
      font-size: 1rem;
      color: $text-color;
    }

    strong {
      color: $accent-light;
      font-weight: 600;
    }
  }
}

/* Example Box */
.example-box,
.formula-box {
  background: rgba(86, 124, 141, 0.1);
  border-left: 4px solid $accent;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;

  h4 {
    color: $accent-light;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      color: $accent;
    }
  }

  p, ul {
    margin: 0;
    color: $text-color;
  }

  ul {
    list-style: none;
    padding-left: 0;

    li {
      padding: 8px 0;
      padding-left: 24px;
      position: relative;

      &::before {
        content: '→';
        position: absolute;
        left: 0;
        color: $accent;
        font-weight: bold;
      }
    }
  }
}

/* Steps Container */
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
}

.step-card {
  display: flex;
  gap: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid $panel-border;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(86, 124, 141, 0.08);
  }

  .step-number {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    background: $accent;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(86, 124, 141, 0.4);
  }

  .step-content {
    h3 {
      color: $accent-light;
      margin-bottom: 8px;
      font-size: 1.25rem;
    }

    p {
      margin: 0;
      color: $text-color;
    }
  }
}

/* Features List */
.features-list {
  list-style: none;
  padding: 0;
  margin: 24px 0;

  li {
    padding: 12px 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.05rem;

    i {
      color: $success;
      font-size: 1.2rem;
    }
  }
}

/* Applications Grid */
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.app-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $panel-border;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(86, 124, 141, 0.15);
    border-color: $accent;
    transform: translateY(-4px);
  }

  i {
    font-size: 2.5rem;
    color: $accent;
    margin-bottom: 12px;
  }

  h4 {
    color: $accent-light;
    margin-bottom: 8px;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: $text-muted;
  }
}

/* Pros and Cons Grid */
.pros-cons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.pros-card {
  border-left: 4px solid $success;
}

.cons-card {
  border-left: 4px solid $warning;
}

.bullet-list {
  list-style: none;
  padding: 0;

  li {
    padding: 10px 0;
    padding-left: 28px;
    position: relative;
    font-size: 1rem;

    &::before {
      content: '•';
      position: absolute;
      left: 8px;
      font-size: 1.5rem;
      line-height: 1;
    }
  }
}

.pros-card .bullet-list li::before {
  color: $success;
}

.cons-card .bullet-list li::before {
  color: $warning;
}

/* CTA Section */
.cta-section {
  margin-top: 64px;
}

.cta-card {
  background: linear-gradient(135deg, rgba(86, 124, 141, 0.2) 0%, rgba(44, 47, 58, 0.9) 100%);
  border: 2px solid $accent;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 12px 32px rgba(86, 124, 141, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(86, 124, 141, 0.1) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
  }

  .cta-content {
    flex: 1;
    z-index: 1;

    h2 {
      font-size: 2rem;
      color: $accent-light;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;

      i {
        color: $accent;
      }
    }

    p {
      font-size: 1.1rem;
      color: $text-color;
      margin-bottom: 24px;
      line-height: 1.6;
    }
  }

  .cta-icon {
    font-size: 6rem;
    color: rgba(86, 124, 141, 0.2);
    z-index: 1;
  }
}

.matlab-btn {
  background: $accent;
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(86, 124, 141, 0.4);
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;

  i {
    font-size: 1.3rem;
  }

  &:hover {
    background: $accent-light;
    color: $page-bg;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(200, 217, 230, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    padding: 40px 16px;

    .main-title {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }
  }

  .main-content {
    padding: 32px 16px;
  }

  .section-card {
    padding: 24px 20px;

    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      h2 {
        font-size: 1.5rem;
      }
    }
  }

  .applications-grid {
    grid-template-columns: 1fr;
  }

  .pros-cons-grid {
    grid-template-columns: 1fr;
  }

  .cta-card {
    flex-direction: column;
    padding: 32px 24px;
    text-align: center;

    .cta-content h2 {
      font-size: 1.5rem;
      justify-content: center;
    }

    .cta-icon {
      font-size: 4rem;
    }
  }

  .step-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
<script setup>
import { onMounted } from 'vue'
import NavbarComponent from '../components/NavbarComponent.vue'
import Background from '../components/Background.vue'
import HeroHeader from '../components/HeroHeader.vue' // ⬅️ nuevo

// Scroll al carrusel cuando se hace clic en el CTA del hero
function onHeroCta () {
  const section = document.getElementById('cards')
  if (!section) return
  const NAV_H = 72 // altura del navbar
  const top = section.getBoundingClientRect().top + window.pageYOffset - NAV_H - 8
  window.scrollTo({ top, behavior: 'smooth' })
}

onMounted(() => {
  if (window.Swiper) {
    new window.Swiper('.cards-carousel .slide-content', {
      slidesPerView: 3,
      spaceBetween: 25,
      loop: true,
      centeredSlides: true,
      grabCursor: true,
      pagination: {
        el: '.cards-carousel .swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: '.cards-carousel .swiper-button-next',
        prevEl: '.cards-carousel .swiper-button-prev',
      },
      breakpoints: {
        0:   { slidesPerView: 1 },
        520: { slidesPerView: 2 },
        950: { slidesPerView: 3 },
      },
    })
  } else {
    console.warn('Swiper no encontrado. Cárgalo por CDN en index.html o instala el paquete.')
  }
})
</script>

<template>
  <!-- El Background es el contenedor y pinta su animación detrás -->
  <Background class="bg-root">
    <main class="page-content">
      <NavbarComponent />

      <!-- ======= NUEVO: Header/Hero ======= -->
      <HeroHeader @cta="onHeroCta" />

      <!-- ======= SECCIÓN: Carrusel de Cards (Swiper) ======= -->
      <section id="cards" class="cards-carousel">
        <div class="slide-container swiper">
          <div class="slide-content">
            <div class="card-wrapper swiper-wrapper">
              <!-- Card 1 -->
              <div class="card swiper-slide">
                <div class="image-content">
                  <span class="overlay"></span>
                  <div class="card-image">
                    <img src="" alt="" class="card-img" />
                  </div>
                </div>
                <div class="card-content">
                  <h2 class="name">Pizarra de grafos</h2>
                  <p class="description">
                    Pizarra de grafos: crea/mueve nodos, conéctalos con aristas con peso,
                    agrega notas y personaliza el fondo; importa/exporta JSON, PNG y PDF.
                  </p>
                  <button class="button">Iniciar</button>
                </div>
              </div>

              <!-- Card 2 -->
              <div class="card swiper-slide">
                <div class="image-content">
                  <span class="overlay"></span>
                  <div class="card-image">
                    <img src="" alt="" class="card-img" />
                  </div>
                </div>
                <div class="card-content">
                  <h2 class="name">Algoritmo</h2>
                  <p class="description">
                    The lorem text the section that contains header with having open functionality.
                    Lorem dolor sit amet consectetur adipisicing elit.
                  </p>
                  <button class="button">Iniciar</button>
                </div>
              </div>

              <!-- Card 3 -->
              <div class="card swiper-slide">
                <div class="image-content">
                  <span class="overlay"></span>
                  <div class="card-image">
                    <img src="" alt="" class="card-img" />
                  </div>
                </div>
                <div class="card-content">
                  <h2 class="name">Algoritmo</h2>
                  <p class="description">
                    The lorem text the section that contains header with having open functionality.
                    Lorem dolor sit amet consectetur adipisicing elit.
                  </p>
                  <button class="button">Iniciar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Controles del carrusel -->
          <div class="swiper-button-next swiper-navBtn"></div>
          <div class="swiper-button-prev swiper-navBtn"></div>
          <div class="swiper-pagination"></div>
        </div>
      </section>
      <!-- ======= /SECCIÓN: Carrusel de Cards ======= -->
    </main>
  </Background>
</template>

<style>
/* Asegura que el contenedor del background ocupe toda la vista */
.bg-root {
  display: block;
  width: 100%;
  min-height: 100vh;
}

/* Tu contenido dentro del background */
.page-content {
  position: relative;
  min-height: 100vh;
}

/* ======= Estilos del carrusel (basados en el snippet) ======= */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

html { scroll-behavior: smooth; }
/* Por si llegas por hash o desde otro lado, evita que el navbar tape el inicio */
#cards { scroll-margin-top: 90px; }

.cards-carousel {
  display: flex;
  justify-content: center;
  padding: 60px 16px;
}

.cards-carousel .slide-container{
  max-width: 1120px;
  width: 100%;
  padding: 40px 0;
  font-family: 'Poppins', sans-serif;
  position: relative; /* para flechas y dots */
}

.cards-carousel .slide-content{
  margin: 0 40px;
  overflow: hidden;
  border-radius: 25px;
}

.cards-carousel .card{
  border-radius: 25px;
  background-color: #FFF;
  /* Animación hover de la card */
  transition: transform .25s ease, box-shadow .25s ease;
  will-change: transform;
}
.cards-carousel .card:hover{
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0,0,0,.12);
}

/* Contenido */
.cards-carousel .image-content,
.cards-carousel .card-content{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 14px;
}

.cards-carousel .image-content{
  position: relative;
  row-gap: 5px;
  padding: 25px 0;
}

/* Overlay decorativo original */
.cards-carousel .overlay{
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: #2f4156;
  border-radius: 25px 25px 0 25px;
  transition: transform .3s ease, opacity .3s ease;
}
.cards-carousel .overlay::before,
.cards-carousel .overlay::after{
  content: '';
  position: absolute;
  right: 0;
  bottom: -40px;
  height: 40px;
  width: 40px;
  background-color: #2f4156;
}
.cards-carousel .overlay::after{
  border-radius: 0 25px 0 0;
  background-color: #FFF;
}

/* === Imagen RECTANGULAR HORIZONTAL (antes era círculo) === */
.cards-carousel .card-image{
  position: relative;
  width: 220px;    /* más ancho */
  height: 130px;   /* menos alto */
  border-radius: 14px;
  background: #FFF;
  padding: 3px;
  overflow: hidden;
}
.cards-carousel .card-image .card-img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;           /* esquinas suaves */
  border: 4px solid #2f4156;     /* mantiene el look del snippet */
  transform: scale(1);           /* base para hover */
  transition: transform .35s ease;
}
/* Zoom sutil al pasar el mouse por la card */
.cards-carousel .card:hover .card-image .card-img{
  transform: scale(1.05);
}

.cards-carousel .name{
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.cards-carousel .description{
  font-size: 14px;
  color: #707070;
  text-align: center;
}

.cards-carousel .button{
  border: none;
  font-size: 16px;
  color: #FFF;
  padding: 8px 16px;
  background-color: #567c8d;
  border-radius: 6px;
  margin: 14px;
  cursor: pointer;
  transition: background-color .25s ease, transform .2s ease;
}
.cards-carousel .button:hover{
  background: #C8D9E6;
  color: #333;
  transform: translateY(-1px);
}

/* Flechas y paginación (como el base) */
.cards-carousel .swiper-navBtn{
  color: #C8D9E6;
  transition: color 0.3s ease;
}
.cards-carousel .swiper-navBtn:hover{
  color: #C8D9E6;
}
.cards-carousel .swiper-navBtn::before,
.cards-carousel .swiper-navBtn::after{
  font-size: 35px;
}
.cards-carousel .swiper-button-next{ right: 0; }
.cards-carousel .swiper-button-prev{ left: 0; }

/* Fallback si no cargas el CSS de Swiper: dibuja símbolos */
.cards-carousel .swiper-button-next::after { content: '›'; }
.cards-carousel .swiper-button-prev::after { content: '‹'; }

.cards-carousel .swiper-pagination-bullet{
  background-color: #C8D9E6;
  opacity: 1;
}
.cards-carousel .swiper-pagination-bullet-active{
  background-color: #18aedb;
}

/* Menos movimiento para usuarios sensibles */
@media (prefers-reduced-motion: reduce){
  .cards-carousel .card,
  .cards-carousel .card-image .card-img,
  .cards-carousel .overlay {
    transition: none !important;
  }
}

@media screen and (max-width: 768px) {
  .cards-carousel .slide-content{
    margin: 0 10px;
  }
  .cards-carousel .swiper-navBtn{
    display: none;
  }
  .cards-carousel .card-image{
    width: 200px;
    height: 120px;
  }
}
</style>

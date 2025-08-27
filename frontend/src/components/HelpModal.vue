<script setup>
const props = defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="open" class="help-overlay" @click.self="emit('close')">
    <div class="help-modal" role="dialog" aria-modal="true">
      <button class="close-btn" @click="emit('close')" aria-label="Cerrar">×</button>

      <div class="help-content">
        <!-- Lottie a la izquierda -->
        <div class="lottie-box">
          <iframe
            class="lottie"
            title="Animación de ayuda"
            src="https://lottie.host/embed/8519c71c-c092-4397-8749-0b1757e87aca/n2Jemza0Ka.lottie"
            allowfullscreen
          ></iframe>
        </div>

        <!-- Video + botón a la derecha -->
        <div class="right">
          <h2 class="heading">Tutorial</h2>

          <div class="video-wrapper">
            <iframe
              class="yt"
              src="https://www.youtube.com/embed/4UPNkSC2kxA?rel=0"
              title="YouTube video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>

          <div class="actions">
            <a
              class="yt-button"
              href="https://youtu.be/4UPNkSC2kxA?si=uxavzF388_kVSE-i"
              target="_blank"
              rel="noopener"
            >
              Abrir en YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Overlay */
.help-overlay{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: grid; place-items: center;
  z-index: 9999;
}

/* Modal (altura auto, sin espacio sobrante) */
.help-modal{
  background: #fff;
  width: 920px; max-width: 94vw;
  padding: 18px 22px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,.35);
  max-height: 92vh;               /* por si se hace muy alto en pantallas pequeñas */
  overflow: hidden;
}

/* Cerrar */
.close-btn{
  position: absolute; top: 10px; right: 12px;
  font-size: 26px; line-height: 1;
  background: transparent; border: 0; cursor: pointer;
  color: #333;
}

/* Contenido en dos columnas (Lottie + video) */
.help-content{
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: center;
}

/* Lottie */
.lottie-box{ width: 100%; }
.lottie{
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 0;
  display: block;
}

/* Derecha */
.right{ width: 100%; }
.heading{
  text-align: center;
  font-size: 28px;
  color: #243142;
}

/* Caja del video con relación 16:9 para que no expanda el modal */
.video-wrapper{
  width: 80%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
  margin: 0 auto;
}
.yt{ width: 100%; height: 100%; border: 0; display: block; }

/* Botón centrado */
.actions{
  display: flex;
  justify-content: center;       /* ⬅️ centrado horizontal */
  margin-top: 12px;              /* poco margen, reduce espacio total */
}
.yt-button{
  display: inline-block;
  padding: 10px 16px;
  border-radius: 999px;
  text-decoration: none;
  background: #e6eef6;           /* #C8D9E6 suavizado */
  color: #2f4156;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(0,0,0,.08);
  transition: transform .15s ease, box-shadow .15s ease;
}
.yt-button:hover{ transform: translateY(-1px); box-shadow: 0 10px 22px rgba(0,0,0,.12); }

/* Responsive */
@media (max-width: 900px){
  .help-content{
    grid-template-columns: 1fr;
    align-items: start;
  }
  .lottie{ max-width: 360px; margin: 0 auto; }
  .heading{ text-align: center; }
}
</style>

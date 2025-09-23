<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  heading: { type: String, default: 'Tutorial' },
  videoId: { type: String, default: 'ZDfQM-VOog4' },
  youtubeUrl: { type: String, default: '' },
  embedQuery: { type: String, default: '' },
  pdfUrl: { type: String, default: '' } // ✅ nuevo prop
})

const emit = defineEmits(['close'])

const baseEmbed = computed(() =>
  `https://www.youtube.com/embed/${props.videoId}?rel=0&modestbranding=1&playsinline=1`
)

const iframeSrc = computed(() =>
  props.embedQuery ? `${baseEmbed.value}&${props.embedQuery}` : baseEmbed.value
)

const ytHref = computed(() =>
  props.youtubeUrl || `https://youtu.be/${props.videoId}`
)
</script>

<template>
  <div v-if="open" class="help-overlay" @click.self="emit('close')">
    <div class="help-modal" role="dialog" aria-modal="true">
      <button class="close-btn" @click="emit('close')" aria-label="Cerrar">×</button>

      <div class="help-content">
        <!-- Lottie animación -->
        <div class="lottie-box">
          <iframe
            class="lottie"
            title="Animación de ayuda"
            src="https://lottie.host/embed/8519c71c-c092-4397-8749-0b1757e87aca/n2Jemza0Ka.lottie"
            allowfullscreen
          ></iframe>
        </div>

        <div class="right">
          <h2 class="heading">{{ heading }}</h2>

          <div class="video-wrapper">
            <iframe
              class="yt"
              :src="iframeSrc"
              title="YouTube video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>

          <div class="actions">
            <a
              class="yt-button"
              :href="ytHref"
              target="_blank"
              rel="noopener"
            >
              Abrir en YouTube
            </a>

            <a
              v-if="pdfUrl"
              class="yt-button"
              :href="pdfUrl"
              target="_blank"
              rel="noopener"
            >
              Guía en PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid; place-items: center;
  z-index: 9999;
}

.help-modal {
  background: #fff;
  width: 920px; max-width: 94vw;
  padding: 18px 22px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .35);
  max-height: 92vh;
  overflow: hidden;
}

.close-btn {
  position: absolute; top: 10px; right: 12px;
  font-size: 26px; line-height: 1;
  background: transparent; border: 0; cursor: pointer;
  color: #333;
}

.help-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: center;
}

.lottie-box { width: 100%; }
.lottie {
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 0;
  display: block;
}

.right { width: 100%; }
.heading {
  text-align: center;
  font-size: 28px;
  color: #243142;
}

.video-wrapper {
  width: 80%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
  margin: 0 auto;
}
.yt { width: 100%; height: 100%; border: 0; display: block; }

.actions {
  display: flex;
  justify-content: center;
  margin-top: 12px;
  gap: 1rem;
}
.yt-button {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 999px;
  text-decoration: none;
  background: #e6eef6;
  color: #2f4156;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(0, 0, 0, .08);
  transition: transform .15s ease, box-shadow .15s ease;
}
.yt-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, .12);
}

@media (max-width: 900px) {
  .help-content {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .lottie { max-width: 360px; margin: 0 auto; }
  .heading { text-align: center; }
}
</style>

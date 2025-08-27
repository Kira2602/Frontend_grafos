<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const emit = defineEmits(['cta'])
const containerRef = ref(null)

const config = {
  particleCount: 50,
  particlePropCount: 30,
  backgroundColor: '#111827',
  circleRadius: 250,
  mouseCircleRadius: 100,
  glowStrength: 20,
  baseRadius: 2,
  rangeRadius: 3,
  scatterForce: 15,
  scatterDuration: 100,
  fadeOutSpeed: 0.02,
  reformDelay: 60,
  startColor: { h: 280, s: 300, l: 60 },
  endColor:   { h: 130, s: 300, l: 60 },
  baseWaveAmplitude: 30,
  waveAmplitudeVariance: 20,
  waveSections: 8,
  rotationSpeed: 0.0001,
  waveFrequency: 9,
  waveSpeed: 0.03,
  transitionSpeed: 0.1,
}

let canvas, ctx, particleProps, waveAmplitudes
let tick = 0
let mouseX = 0, mouseY = 0, isMouseOnCanvas = false
let scatterTimeLeft = 0, reformTimeLeft = 0
let lastMouseX = 0, lastMouseY = 0
let rafId = null

const TAU = Math.PI * 2
const rand = (n)=> Math.random() * n
const interpolateHue = (t)=> config.startColor.h + (config.endColor.h - config.startColor.h) * t

function initWaveAmplitudes(){
  waveAmplitudes = new Array(config.waveSections).fill(0).map(
    () => config.baseWaveAmplitude + Math.random()*config.waveAmplitudeVariance
  )
}
function updateWaveAmplitudes(){
  for (let i=0;i<config.waveSections;i++){
    const target = config.baseWaveAmplitude + Math.random()*config.waveAmplitudeVariance
    waveAmplitudes[i] += (target - waveAmplitudes[i]) * 0.1
  }
}

function initParticles(){
  particleProps = new Float32Array(config.particleCount * config.particlePropCount)
  const inc = TAU / config.particleCount
  for (let i=0;i<config.particleCount;i++){
    initParticle(i*config.particlePropCount, i*inc)
  }
}
function initParticle(i, angle){
  const radius = config.baseRadius + rand(config.rangeRadius)
  const hue = interpolateHue(angle / TAU)
  particleProps.set([
    Math.cos(angle)*config.circleRadius,
    Math.sin(angle)*config.circleRadius,
    0,0,
    angle,
    radius,
    hue,
    1.0,
    0,
    0
  ], i)
}

function calculateWaveOffset(angle, time){
  const rotated = (angle + time*config.rotationSpeed) % TAU
  const sectionSize = TAU / config.waveSections
  const idx = Math.floor(rotated / sectionSize)
  const sectionAngle = (rotated % sectionSize) / sectionSize
  const phase = time * config.waveSpeed
  const amp = waveAmplitudes[idx]
  return Math.sin(sectionAngle*config.waveFrequency*TAU + phase) * amp
}

function drawParticle(x,y,r,h,op){
  ctx.a.save()
  ctx.a.fillStyle = `hsla(${h}, 100%, 60%, ${op})`
  ctx.a.beginPath()
  ctx.a.arc(x,y,r,0,TAU)
  ctx.a.fill()
  ctx.a.restore()
}

function updateParticle(i, cx, cy){
  const baseAngle = particleProps[i+4]
  let x = particleProps[i]
  let y = particleProps[i+1]
  let op = particleProps[i+7]
  let state = particleProps[i+8]
  const hue = particleProps[i+6]

  if (scatterTimeLeft>0 && state===1){
    x += particleProps[i+2]
    y += particleProps[i+3]
    particleProps[i+2] *= .98
    particleProps[i+3] *= .98
    particleProps[i+3] += .2
    op -= config.fadeOutSpeed
    if (op<0) op = 0
  } else {
    const tx = isMouseOnCanvas ? lastMouseX : cx
    const ty = isMouseOnCanvas ? lastMouseY : cy
    const baseR = isMouseOnCanvas ? config.mouseCircleRadius : config.circleRadius
    const r = baseR + calculateWaveOffset(baseAngle, tick)
    const gx = tx + Math.cos(baseAngle)*r
    const gy = ty + Math.sin(baseAngle)*r
    x += (gx - x) * config.transitionSpeed
    y += (gy - y) * config.transitionSpeed
    op += config.fadeOutSpeed
    if (op>1) op = 1
    state = 0
  }

  particleProps[i] = x
  particleProps[i+1] = y
  particleProps[i+7] = op
  particleProps[i+8] = state

  drawParticle(x,y,particleProps[i+5],hue,op)
}

function drawParticles(){
  const cx = canvas.a.width/2
  const cy = canvas.a.height/2
  lastMouseX += (mouseX - lastMouseX) * config.transitionSpeed
  lastMouseY += (mouseY - lastMouseY) * config.transitionSpeed
  for (let i=0;i<config.particleCount*config.particlePropCount;i+=config.particlePropCount){
    updateParticle(i,cx,cy)
  }
}

function scatterParticles(x0,y0){
  for (let i=0;i<config.particleCount*config.particlePropCount;i+=config.particlePropCount){
    const x = particleProps[i], y = particleProps[i+1]
    const dx = x - x0, dy = y - y0
    const ang = Math.atan2(dy,dx)
    const dist = Math.sqrt(dx*dx + dy*dy)
    const speed = (config.scatterForce * (1 - dist / config.mouseCircleRadius))
    particleProps[i+2] = Math.cos(ang)*speed + (Math.random()-.5)*2
    particleProps[i+3] = Math.sin(ang)*speed + (Math.random()-.5)*2
    particleProps[i+8] = 1
  }
  scatterTimeLeft = config.scatterDuration
  reformTimeLeft = config.reformDelay
}

function createCanvas(){
  const container = containerRef.value
  canvas = { a: document.createElement('canvas'), b: document.createElement('canvas') }
  ctx = { a: canvas.a.getContext('2d'), b: canvas.b.getContext('2d') }
  container.appendChild(canvas.a)
  container.appendChild(canvas.b)
  canvas.a.style.position = 'absolute'
  canvas.a.style.top = 0
  canvas.a.style.left = 0

  canvas.a.addEventListener('mousemove', mouseHandler)
  canvas.a.addEventListener('mouseenter', ()=>{ isMouseOnCanvas = true })
  canvas.a.addEventListener('mouseleave', ()=>{ isMouseOnCanvas = false })
  canvas.a.addEventListener('click', (e)=>{ if (isMouseOnCanvas) scatterParticles(e.clientX,e.clientY) })
}
function removeCanvas(){
  if (!canvas?.a) return
  canvas.a.removeEventListener('mousemove', mouseHandler)
  canvas.a.remove()
  canvas.b.remove()
  canvas = null
}
function mouseHandler(e){ mouseX = e.clientX; mouseY = e.clientY }

function resize(){
  const { innerWidth: w, innerHeight: h } = window
  if (!canvas) return
  canvas.a.width = w; canvas.a.height = h
  canvas.b.width = w; canvas.b.height = h
  
  const minSide = Math.min(w, h)
  config.circleRadius = Math.max(260, Math.round(minSide * 0.36))
  config.mouseCircleRadius = Math.max(140, Math.round(minSide * 0.22))
}

function renderGlow(){
  ctx.b.save()
  ctx.b.filter = `blur(${config.glowStrength}px) brightness(200%)`
  ctx.b.globalCompositeOperation = 'lighter'
  ctx.b.drawImage(canvas.a, 0, 0)
  ctx.b.restore()

  ctx.b.save()
  ctx.b.filter = `blur(${config.glowStrength/2}px) brightness(200%)`
  ctx.b.globalCompositeOperation = 'lighter'
  ctx.b.drawImage(canvas.a, 0, 0)
  ctx.b.restore()
}
function renderToScreen(){
  ctx.b.save()
  ctx.b.globalCompositeOperation = 'lighter'
  ctx.b.drawImage(canvas.a, 0, 0)
  ctx.b.restore()
}

function frame(){
  tick++
  if (reformTimeLeft>0) reformTimeLeft--
  if (scatterTimeLeft>0) scatterTimeLeft--
  if (tick%2===0) updateWaveAmplitudes()

  ctx.a.clearRect(0,0,canvas.a.width,canvas.a.height)
  ctx.b.fillStyle = config.backgroundColor
  ctx.b.fillRect(0,0,canvas.a.width,canvas.a.height)

  drawParticles()
  renderGlow()
  renderToScreen()
  rafId = requestAnimationFrame(frame)
}

function setup(){
  createCanvas()
  resize()
  initParticles()
  initWaveAmplitudes()
  frame()
}

onMounted(()=>{
  setup()
  window.addEventListener('resize', resize, { passive:true })
})
onBeforeUnmount(()=>{
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
  removeCanvas()
})
</script>

<template>
  <section class="hero-stage">
    <div class="content--canvas" ref="containerRef"></div>

    <section class="hero">
      <h1>Resilience and technology<br> our blueprint for tomorrow.</h1>
      <a href="#cards" @click.prevent="$emit('cta')">
        Herramientas
      </a>
    </section>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bellota:wght@300;400;700&display=swap');

.hero-stage{
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  min-height: calc(100vh - 72px);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.content--canvas{ position: absolute; inset: 0; z-index: 1; }
.content--canvas canvas{ display:block; }

.hero{
  position: relative;
  z-index: 2;
  width: 760px;
  max-width: 92vw;
  text-align: center;
  color: #fff;
  line-height: 42px;
  pointer-events: none;
  font-family: "Bellota", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

.hero h1{
  font-family: "Bellota", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-weight: 700;
  letter-spacing: .5px;
  color: #cffafe;
  font-size: 32px;
  user-select: none;
  pointer-events: none;
}

.hero a{
  pointer-events: auto;
  display: inline-block;
  margin-top: 20px;
  padding: 8px 20px;
  border: 1px solid #fff;
  border-radius: 100px;
  color: #fff;
  text-decoration: none;
  font-family: "Bellota", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-weight: 700;
  transition: all .3s ease;
}
.hero a:hover{ background-color: rgba(255,255,255,.2); letter-spacing: 1px; cursor: pointer; }

@media (max-width: 768px){
  .hero{ width: 94vw; }
  .hero h1{ font-size: 22px; line-height: 30px; }
}
</style>

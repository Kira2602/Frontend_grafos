<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="matTitle">
        <div class="header">
          <h3 id="matTitle">Matriz de adyacencia</h3>
          <button class="btn-icon" @click="close" title="Cerrar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="corner"></th>
                <!-- Fallback visual si llega string vacío -->
                <th v-for="(n, i) in nodes" :key="'c'+i">{{ n || ('N' + (i+1)) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in matrix" :key="'r'+i">
                <th class="row-head">{{ nodes[i] || ('N' + (i+1)) }}</th>
                <td v-for="(val, j) in row" :key="'x'+i+'-'+j">{{ val }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="actions">
          <button class="btn" @click="close">Cerrar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  nodes: { type: Array, default: () => [] },
  matrix: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])
const close = () => emit('update:modelValue', false)
</script>

<style scoped lang="scss">
.overlay{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.45);display:grid;place-items:center}
.modal{
  display:grid;gap:12px;padding:14px 16px 16px;border-radius:12px;
  background:#2c2f3a;color:#e7e7ec;box-shadow:0 20px 44px rgba(0,0,0,.35);
  inline-size:fit-content;max-inline-size:92vw;max-block-size:85vh;
}
.header{display:flex;align-items:center;justify-content:center;position:relative}
.header h3{margin:0;font-weight:800}
.btn-icon{position:absolute;right:6px;top:2px;border:0;background:transparent;color:#bfc5d1;cursor:pointer}
.btn-icon:hover{color:#fff}
.table-wrap{max-inline-size:90vw;max-block-size:62vh;overflow:auto}

/* Tabla */
.matrix-table{border-collapse:collapse;border-spacing:0;inline-size:max-content;background:#2c2f3a;font-size:14px}
.matrix-table th,.matrix-table td{
  padding:6px 8px;text-align:center;border:1px solid rgba(255,255,255,.12);
  white-space:nowrap;min-inline-size:34px;color:#e7e7ec; /* asegurar contraste */
}
.matrix-table thead th{position:sticky;top:0;z-index:1;background:#3a3f4e;font-weight:700}
.matrix-table .row-head{position:sticky;left:0;background:#3a3f4e;text-align:left;padding-inline:10px;min-inline-size:42px}
.matrix-table .corner{position:sticky;left:0;top:0;z-index:2;background:#3a3f4e;min-inline-size:42px;border-right:1px solid rgba(255,255,255,.12)}

.actions{display:flex;justify-content:center}
.btn{background:#567c8d;color:#ecebe6;border:0;padding:8px 14px;border-radius:10px;cursor:pointer;font-weight:700}
.btn:hover{filter:brightness(1.05)}
</style>

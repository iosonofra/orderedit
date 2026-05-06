<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Importa Template</h3>
          <button class="btn btn-icon" @click="$emit('close')">X</button>
        </div>

        <div class="section-label">Formato</div>
        <div class="tab-bar" style="margin-bottom: 10px">
          <button class="tab-btn" :class="{ active: format === 'csv' }" @click="format = 'csv'">CSV</button>
          <button class="tab-btn" :class="{ active: format === 'json' }" @click="format = 'json'">JSON</button>
        </div>

        <div class="drop-zone"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          Trascina qui un file .csv/.json oppure incolla i dati sotto
        </div>

        <div class="format-hint">
          <span v-if="format === 'csv'">
            Formato: <code>ID,Nome prodotto</code> (senza header).
          </span>
          <span v-else>
            Formato: <code>[{"id":"123","name":"Nome"}]</code>
          </span>
        </div>

        <textarea
          id="import-textarea"
          v-model="inputData"
          class="input import-textarea"
          :placeholder="placeholderText"
          rows="8"
          style="font-family: monospace; font-size: 12px; resize: vertical"
          @input="parsePreview"
        />

        <div class="preview-summary">
          <span>{{ previewRows.length }} righe valide</span>
          <span v-if="previewErrors.length > 0" class="err">{{ previewErrors.length }} errori</span>
        </div>

        <div class="preview-list" v-if="previewRows.length > 0">
          <div class="preview-row" v-for="(r, i) in previewRows.slice(0, 20)" :key="i">
            <code>{{ r.id }}</code>
            <span>{{ r.name }}</span>
          </div>
        </div>

        <div class="error-list" v-if="previewErrors.length > 0">
          <div class="error-row" v-for="(err, i) in previewErrors.slice(0, 30)" :key="i">
            Riga {{ err.row }}: {{ err.message }}
          </div>
        </div>

        <div class="section-label" style="margin-top: 12px">Modalita import</div>
        <div class="radio-group" style="margin-top: 6px">
          <label class="radio-option">
            <input v-model="mode" type="radio" value="merge" /> Merge (aggiungi / aggiorna)
          </label>
          <label class="radio-option">
            <input v-model="mode" type="radio" value="replace" /> Sostituisci tutto
          </label>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Annulla</button>
          <button class="btn btn-primary" :disabled="previewRows.length === 0 || importing" @click="doImport">
            <span v-if="importing">...</span>
            <span v-else>Importa</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTemplateStore } from '../stores/templates.js'
import { useNotificationStore } from '../stores/notification.js'

const emit = defineEmits(['close', 'imported'])
const templateStore = useTemplateStore()
const notificationStore = useNotificationStore()

const format = ref('csv')
const mode = ref('merge')
const inputData = ref('')
const importing = ref(false)
const previewRows = ref([])
const previewErrors = ref([])

const placeholderText = computed(() => {
  if (format.value === 'csv') return '601530,Daikin 2AMXF50A\n601528,Daikin 2AMXF40A'
  return '[{"id":"601530","name":"Daikin 2AMXF50A"},{"id":"601528","name":"Daikin 2AMXF40A"}]'
})

function parseCsv(text) {
  const rows = []
  const errors = []
  const lines = text.split(/\r?\n/)
  lines.forEach((line, idx) => {
    const ln = line.trim()
    if (!ln) return
    const parts = ln.split(',')
    if (parts.length < 2) {
      errors.push({ row: idx + 1, message: 'Formato CSV non valido (atteso ID,Nome)' })
      return
    }
    const id = parts.shift().trim()
    const name = parts.join(',').trim()
    if (!id || !name) {
      errors.push({ row: idx + 1, message: 'ID o Nome mancante' })
      return
    }
    rows.push({ id, name })
  })
  return { rows, errors }
}

function parseJson(text) {
  const rows = []
  const errors = []
  try {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) return { rows: [], errors: [{ row: 1, message: 'JSON deve essere un array' }] }
    parsed.forEach((item, idx) => {
      const id = String(item?.id ?? '').trim()
      const name = String(item?.name ?? '').trim()
      if (!id || !name) {
        errors.push({ row: idx + 1, message: 'Elemento JSON senza id/name validi' })
        return
      }
      rows.push({ id, name })
    })
    return { rows, errors }
  } catch {
    return { rows: [], errors: [{ row: 1, message: 'JSON non valido' }] }
  }
}

function parsePreview() {
  const text = inputData.value.trim()
  if (!text) {
    previewRows.value = []
    previewErrors.value = []
    return
  }
  const out = format.value === 'csv' ? parseCsv(text) : parseJson(text)
  previewRows.value = out.rows
  previewErrors.value = out.errors
}

function onDrop(e) {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  const name = file.name.toLowerCase()
  if (name.endsWith('.json')) format.value = 'json'
  if (name.endsWith('.csv')) format.value = 'csv'
  const reader = new FileReader()
  reader.onload = () => {
    inputData.value = String(reader.result || '')
    parsePreview()
  }
  reader.readAsText(file)
}

async function doImport() {
  parsePreview()
  if (previewRows.value.length === 0) return
  if (mode.value === 'replace') {
    const ok = window.confirm('Attenzione: sostituirai tutti i template esistenti. Continuare?')
    if (!ok) return
  }
  importing.value = true
  try {
    const result = await templateStore.importBulk({
      format: format.value,
      data: inputData.value,
      mode: mode.value,
    })
    notificationStore.show({
      type: 'success',
      message: `Importati ${result.imported} template (${result.skipped} gia presenti)`,
    })
    emit('imported')
    emit('close')
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.drop-zone {
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 8px;
}
.format-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.format-hint code {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: var(--accent);
}
.import-textarea { line-height: 1.5; }
.preview-summary {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 10px;
}
.preview-summary .err { color: #ffb4b4; }
.preview-list {
  margin-top: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  max-height: 140px;
  overflow: auto;
}
.preview-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 8px;
  font-size: 12px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-light);
}
.preview-row:last-child { border-bottom: none; }
.error-list {
  margin-top: 8px;
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-sm);
  max-height: 120px;
  overflow: auto;
}
.error-row {
  font-size: 12px;
  color: #ffb4b4;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(239, 68, 68, 0.12);
}
.error-row:last-child { border-bottom: none; }
</style>

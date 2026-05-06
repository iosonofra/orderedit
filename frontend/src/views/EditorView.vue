<template>
  <div class="editor-view">
    <AppToolbar />

    <div
      class="sheet-area"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <Transition name="fade">
        <div v-if="dragging" class="drag-overlay">
          <div class="drag-text">Rilascia il file <strong>.xlsx</strong> qui</div>
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="!spreadsheetStore.hasData" class="empty-state">
          <h2 class="empty-title">Nessun file caricato</h2>
          <p class="empty-desc">
            Carica un file <strong>.xlsx</strong> per iniziare a modificarlo.<br />
            Usa il pulsante <em>Carica XLSX</em> nella toolbar sopra,<br />
            oppure <strong>trascina il file</strong> direttamente qui.
          </p>
          <button class="btn btn-primary" style="margin-top:16px" @click="triggerUpload">
            Carica XLSX
          </button>
        </div>
      </Transition>

      <SimpleSheetGrid v-if="spreadsheetStore.hasData" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import AppToolbar from '../components/AppToolbar.vue'
import SimpleSheetGrid from '../components/SimpleSheetGrid.vue'
import { useSpreadsheetStore } from '../stores/spreadsheet.js'
import { useNotificationStore } from '../stores/notification.js'

const spreadsheetStore = useSpreadsheetStore()
const notificationStore = useNotificationStore()

const dragging = ref(false)
let autosaveTimer = null

function persistCurrentWorkbookState() {
  if (!spreadsheetStore.hasData) return
  spreadsheetStore.persistRecoverySnapshot(spreadsheetStore.sheets)
}

onMounted(() => {
  spreadsheetStore.loadEditorPrefs()

  if (!spreadsheetStore.hasData && spreadsheetStore.recoveryEnabled) {
    const recovery = spreadsheetStore.readRecovery()
    if (recovery && Array.isArray(recovery.sheets) && recovery.sheets.length > 0) {
      const restore = window.confirm(`Trovato recupero automatico per "${recovery.filename}". Vuoi ripristinarlo?`)
      if (restore) {
        spreadsheetStore.loadRecoveredState(recovery)
        notificationStore.show({ type: 'info', message: 'Sessione ripristinata da autosave locale.' })
      } else {
        spreadsheetStore.clearRecovery()
      }
    }
  }

  autosaveTimer = setInterval(() => {
    if (spreadsheetStore.recoveryEnabled && spreadsheetStore.hasData && spreadsheetStore.isUnsaved) {
      persistCurrentWorkbookState()
    }
  }, 3000)
})

onBeforeUnmount(() => {
  if (autosaveTimer) {
    clearInterval(autosaveTimer)
    autosaveTimer = null
  }
  persistCurrentWorkbookState()
})

onBeforeRouteLeave(() => {
  persistCurrentWorkbookState()
})

function triggerUpload() {
  document.getElementById('btn-upload')?.click()
}

function onDragOver(e) {
  if (e.dataTransfer?.types?.includes('Files')) {
    dragging.value = true
  }
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  if (!file.name.match(/\.xlsx$/i)) {
    notificationStore.show({ type: 'error', message: 'Solo file .xlsx sono supportati' })
    return
  }
  const input = document.querySelector('input[type="file"][accept=".xlsx"]')
  if (input) {
    const dt = new DataTransfer()
    dt.items.add(file)
    input.files = dt.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }
}
</script>

<style scoped>
.editor-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sheet-area {
  position: relative;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.drag-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(79, 142, 247, 0.08);
  border: 2px dashed var(--accent);
  border-radius: var(--radius-lg);
  z-index: 30;
  pointer-events: none;
}

.drag-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--accent);
}

.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  text-align: center;
  background: var(--bg-primary);
  z-index: 20;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 360px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

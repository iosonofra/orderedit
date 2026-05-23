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
        <div v-if="spreadsheetStore.isProcessing" class="skeleton-container">
          <div class="skeleton-toolbar"></div>
          <div class="skeleton-grid-wrap">
            <div v-for="r in 15" :key="`r-${r}`" class="skeleton-row">
              <div v-for="c in 8" :key="`c-${c}`" class="skeleton-cell" :style="{ flex: c === 2 ? 2.5 : c === 3 ? 1.8 : 1 }"></div>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="!spreadsheetStore.hasData && !spreadsheetStore.isProcessing" class="empty-state">
          <div class="welcome-container">
            <div class="welcome-header">
              <h2>Benvenuto in OrderEdit</h2>
              <p>Il sistema intelligente e professionale per allineare i tuoi ordini e cataloghi Excel.</p>
            </div>
            
            <div class="welcome-stats-row">
              <div class="welcome-stat-card">
                <div class="welcome-stat-icon">
                  <svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
                </div>
                <div class="welcome-stat-info">
                  <span class="welcome-stat-val">{{ templateStore.templates.length }}</span>
                  <span class="welcome-stat-lbl">Prodotti in rubrica</span>
                </div>
              </div>
              
              <div class="welcome-stat-card">
                <div class="welcome-stat-icon">
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
                <div class="welcome-stat-info">
                  <span class="welcome-stat-val">{{ spreadsheetStore.recoveryEnabled ? 'Attivo' : 'Disattivato' }}</span>
                  <span class="welcome-stat-lbl">Autosalvataggio Locale</span>
                </div>
              </div>
            </div>

            <div 
              class="welcome-dropzone" 
              :class="{ 'dragging-active': dragging }"
              @click="triggerUpload"
            >
              <div class="welcome-dropzone-icon">
                <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
              </div>
              <span class="welcome-dropzone-title">Trascina qui il tuo file ordine (.xlsx)</span>
              <span class="welcome-dropzone-desc">oppure <strong>clicca per sfogliare</strong> i file nel tuo computer. Supportiamo file Excel standard con formattazione e fogli multipli.</span>
            </div>

            <div class="welcome-guide-cards">
              <div class="welcome-guide-card">
                <span class="welcome-guide-title">
                  <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                  1. Carica Excel
                </span>
                <span class="welcome-guide-desc">Usa il box soprastante o trascina il file per caricare il tuo ordine Excel.</span>
              </div>
              <div class="welcome-guide-card">
                <span class="welcome-guide-title">
                  <svg viewBox="0 0 24 24"><path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8l-2.5-1.4 1.4 2.5-1.4 2.5 2.5-1.4 2.5 1.4-1.4-2.5zM19.3 2.2l-2.5 1.4 1.4 2.5-1.4 2.5 2.5-1.4 2.5 1.4-1.4-2.5zm-3.6 7.6L3.2 22.3c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L17.1 11.2l-1.4-1.4z"/></svg>
                  2. Allinea Catalogo
                </span>
                <span class="welcome-guide-desc">Usa il pulsante <em>Aggiorna nomi</em> per rinominare i prodotti in base al catalogo.</span>
              </div>
              <div class="welcome-guide-card">
                <span class="welcome-guide-title">
                  <svg viewBox="0 0 24 24"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/></svg>
                  3. Esporta per Corriere
                </span>
                <span class="welcome-guide-desc">Controlla le modifiche evidenziate in verde sulla griglia ed esporta il file ottimizzato.</span>
              </div>
            </div>
          </div>
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
import { useTemplateStore } from '../stores/templates.js'

const spreadsheetStore = useSpreadsheetStore()
const notificationStore = useNotificationStore()
const templateStore = useTemplateStore()

const dragging = ref(false)
let autosaveTimer = null

function persistCurrentWorkbookState() {
  if (!spreadsheetStore.hasData) return
  spreadsheetStore.persistRecoverySnapshot(spreadsheetStore.sheets)
}

onMounted(() => {
  spreadsheetStore.loadEditorPrefs()
  
  if (templateStore.templates.length === 0) {
    templateStore.fetchAll()
  }

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

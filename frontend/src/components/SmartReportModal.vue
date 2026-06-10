<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal modal-wide smart-report-modal animate-fade-in" @click.stop>
        
        <div class="modal-header">
          <div class="header-title-box">
            <svg class="header-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
              <polyline points="7.5 19.79 7.5 14.6 12 12 16.5 14.6 16.5 19.79"></polyline>
              <polyline points="12 12 12 22"></polyline>
              <line x1="12" y1="6.81" x2="12" y2="12"></line>
            </svg>
            <h3>Riepilogo Elaborazione Smart AI</h3>
          </div>
          <button class="btn btn-icon" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <p class="intro-text">
            L'intelligenza artificiale ha analizzato il foglio di calcolo. Di seguito sono riportate le modifiche proposte per ciascuna colonna. Seleziona quali applicare ed eventualmente correggi i suggerimenti.
          </p>

          <!-- Tab Selector -->
          <div class="report-tabs">
            <button
              class="report-tab-btn"
              :class="{ active: activeTab === 'products' }"
              @click="activeTab = 'products'"
            >
              <span class="tab-label">Nomi Prodotto</span>
              <span class="tab-badge ok">{{ newProductsCount }} da mappare</span>
            </button>
            <button
              class="report-tab-btn"
              :class="{ active: activeTab === 'couriers' }"
              @click="activeTab = 'couriers'"
            >
              <span class="tab-label">Assegnazione Corrieri</span>
              <span class="tab-badge info">{{ newCouriersCount }} modifiche</span>
            </button>
            <button
              class="report-tab-btn"
              :class="{ active: activeTab === 'anomalies' }"
              @click="activeTab = 'anomalies'"
            >
              <span class="tab-label">Anomalie Rilevate</span>
              <span class="tab-badge" :class="totalAnomaliesCount > 0 ? 'warn' : 'ok'">
                {{ totalAnomaliesCount }}
              </span>
            </button>
          </div>

          <!-- TAB CONTENT: PRODUCTS -->
          <div v-show="activeTab === 'products'" class="tab-pane animate-fade-in">
            <template v-if="productsList.length > 0">
              <div class="pane-header-actions">
                <span class="pane-subtitle">Abbinamento nuovi template con tag <b>grassetti</b> automatici per marca/modello.</span>
                <div class="bulk-toggles">
                  <button class="btn btn-secondary btn-sm" @click="toggleAllTemplates(true)">Seleziona Tutti</button>
                  <button class="btn btn-secondary btn-sm" @click="toggleAllTemplates(false)">Deseleziona Tutti</button>
                </div>
              </div>

              <div class="table-container">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th width="40" class="text-center">Riga</th>
                      <th width="90">ID Prodotto</th>
                      <th width="200">Nome Originale</th>
                      <th width="320">Suggerimento AI (Modificabile)</th>
                      <th width="120" class="text-center">Salva in Catalogo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in productsList" :key="item.rowIndex" :class="{ 'row-skipped': !item.selected }">
                      <td class="text-center text-secondary font-mono">{{ item.rowIndex + 1 }}</td>
                      <td><code>{{ item.id }}</code></td>
                      <td class="text-secondary">{{ item.originalName }}</td>
                      <td>
                        <div class="input-preview-group">
                          <input
                            v-model="item.suggestedName"
                            class="input table-input elegant-input"
                            placeholder="Inserisci il nome..."
                          />
                          <div class="text-preview" v-html="renderHtml(item.suggestedName)"></div>
                        </div>
                      </td>
                      <td class="text-center">
                        <label class="switch-container">
                          <input type="checkbox" v-model="item.saveToCatalog" :disabled="!item.selected" />
                          <span class="custom-chk"></span>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <template v-else>
              <div class="empty-tab-state">
                <div class="empty-icon-wrapper success">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h4>Tutti i prodotti sono mappati</h4>
                <p>Nessun nuovo prodotto da configurare. I codici presenti nel foglio sono già allineati con il catalogo.</p>
              </div>
            </template>
          </div>

          <!-- TAB CONTENT: COURIERS -->
          <div v-show="activeTab === 'couriers'" class="tab-pane animate-fade-in">
            <template v-if="courierList.length > 0">
              <span class="pane-subtitle">Assegnazione automatica del corriere calcolata in base a note, destinazione e peso.</span>

              <div class="table-container">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th width="40" class="text-center">Riga</th>
                      <th width="100">ID Prodotto</th>
                      <th width="220">Prodotto</th>
                      <th width="100" class="text-center">Corr. Originale</th>
                      <th width="140" class="text-center">Corr. AI</th>
                      <th width="270">Motivazione AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in courierList" :key="item.rowIndex">
                      <td class="text-center text-secondary font-mono">{{ item.rowIndex + 1 }}</td>
                      <td><code>{{ item.id }}</code></td>
                      <td class="text-secondary truncate-text" :title="item.suggestedName">{{ stripTags(item.suggestedName) }}</td>
                      <td class="text-center text-secondary">
                        <span class="courier-badge gray">{{ item.currentCourier || '(vuoto)' }}</span>
                      </td>
                      <td class="text-center">
                        <select v-model="item.suggestedCourier" class="input elegant-select compact-select">
                          <option v-for="c in courierPresets" :key="c" :value="c">{{ c }}</option>
                          <option value="">(vuoto)</option>
                        </select>
                      </td>
                      <td>
                        <span class="reason-text" :title="item.courierReason">{{ item.courierReason || 'Assegnato per default' }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <template v-else>
              <div class="empty-tab-state">
                <div class="empty-icon-wrapper info">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <h4>Nessun ordine trovato</h4>
                <p>Non ci sono righe valide nel foglio di calcolo attivo per cui proporre l'assegnazione dei corrieri.</p>
              </div>
            </template>
          </div>

          <!-- TAB CONTENT: ANOMALIES -->
          <div v-show="activeTab === 'anomalies'" class="tab-pane animate-fade-in">
            <span class="pane-subtitle">Controlli e avvisi di qualità sui dati dei clienti, CAP e note.</span>

            <div v-if="anomaliesList.length > 0" class="anomalies-list-container">
              <div v-for="(anom, aIdx) in anomaliesList" :key="aIdx" class="anomaly-card">
                <div class="anomaly-card-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div class="anomaly-card-content">
                  <p class="anomaly-card-desc">{{ anom.description }}</p>
                  <div class="anomaly-card-badges">
                    <span class="anomaly-badge">Riga {{ anom.rowIndex + 1 }}</span>
                    <span class="anomaly-badge">Prodotto ID: <code>{{ anom.id }}</code></span>
                    <span v-if="anom.destination" class="anomaly-badge truncate-badge" :title="anom.destination">
                      Destinazione: {{ anom.destination }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-tab-state">
              <div class="empty-icon-wrapper success">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h4>Nessuna anomalia rilevata</h4>
              <p>🎉 Ottimo! Nessun errore di qualità, incongruenza di CAP o formati non corretti riscontrati nei dati.</p>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <template v-if="hasChanges">
            <button class="btn btn-secondary" @click="$emit('close')">Annulla</button>
            <button class="btn btn-success btn-with-icon" @click="handleApply">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Conferma e Applica Modifiche
            </button>
          </template>
          <template v-else>
            <button class="btn btn-primary" style="padding-left: 24px; padding-right: 24px;" @click="$emit('close')">Chiudi</button>
          </template>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  reportData: Array,
  courierPresets: Array,
})

const emit = defineEmits(['close', 'apply'])

const activeTab = ref('products')

const productsList = ref([])
const courierList = ref([])
const anomaliesList = ref([])

// Split and shape received report data
watch(() => props.show, (isOpen) => {
  if (!isOpen) return
  
  // 1. Products list (only missing templates)
  productsList.value = props.reportData
    .filter(row => row.isNewTemplate)
    .map(row => ({
      rowIndex: row.rowIndex,
      id: row.id,
      originalName: row.originalName,
      suggestedName: row.suggestedName,
      saveToCatalog: true,
      selected: true,
    }))

  // 2. Courier list (all rows that got a courier assignment recommendation)
  courierList.value = props.reportData.map(row => ({
    rowIndex: row.rowIndex,
    id: row.id,
    suggestedName: row.suggestedName,
    currentCourier: row.currentCourier,
    suggestedCourier: row.suggestedCourier,
    courierReason: row.courierReason,
  }))

  // 3. Anomalies list (collect all rows with anomalies)
  const anomalies = []
  props.reportData.forEach(row => {
    if (row.anomalies && row.anomalies.length > 0) {
      row.anomalies.forEach(description => {
        anomalies.push({
          rowIndex: row.rowIndex,
          id: row.id,
          destination: row.destination || '',
          description,
        })
      })
    }
  })
  anomaliesList.value = anomalies

  // Select first tab that has actual changes or data
  const hasProducts = productsList.value.length > 0
  const hasCourierChanges = courierList.value.some(item => item.suggestedCourier !== item.currentCourier)
  const hasAnomalies = anomaliesList.value.length > 0

  if (hasProducts) {
    activeTab.value = 'products'
  } else if (hasCourierChanges) {
    activeTab.value = 'couriers'
  } else if (hasAnomalies) {
    activeTab.value = 'anomalies'
  } else {
    activeTab.value = 'products'
  }
})

// Counts
const newProductsCount = computed(() => productsList.value.length)
const newCouriersCount = computed(() => {
  return courierList.value.filter(item => item.suggestedCourier !== item.currentCourier).length
})
const totalAnomaliesCount = computed(() => anomaliesList.value.length)

// Determine if there are actual updates to confirm
const hasChanges = computed(() => {
  const hasProductChanges = productsList.value.some(p => p.selected && p.suggestedName.trim())
  const hasCourierChanges = courierList.value.some(c => c.suggestedCourier !== c.currentCourier)
  return hasProductChanges || hasCourierChanges
})

function toggleAllTemplates(val) {
  productsList.value.forEach(item => {
    item.selected = val
    item.saveToCatalog = val
  })
}

function stripTags(htmlStr) {
  return String(htmlStr || '').replace(/<[^>]*>/g, '')
}

function renderHtml(text) {
  const safe = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // Re-inject bold tags safely
  return safe.replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>')
}

function handleApply() {
  // Build final array of updates
  const templatesToSave = productsList.value
    .filter(p => p.selected && p.saveToCatalog && p.suggestedName.trim())
    .map(p => ({
      id: p.id,
      name: p.suggestedName.trim()
    }))

  const cellUpdates = []
  
  // 1. Apply name updates
  productsList.value.forEach(p => {
    if (p.selected && p.suggestedName.trim()) {
      cellUpdates.push({
        rowIndex: p.rowIndex,
        type: 'name',
        value: p.suggestedName.trim(),
      })
    }
  })

  // 2. Apply courier updates
  courierList.value.forEach(c => {
    if (c.suggestedCourier !== c.currentCourier) {
      cellUpdates.push({
        rowIndex: c.rowIndex,
        type: 'courier',
        value: c.suggestedCourier,
      })
    }
  })

  emit('apply', {
    cellUpdates,
    templatesToSave,
  })
}
</script>

<style scoped>
.smart-report-modal {
  max-width: 900px;
  width: 90vw;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 16px;
  margin: 0;
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: var(--bg-secondary);
}

.intro-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
}

.report-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
  padding-bottom: 2px;
}

.report-tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  opacity: 0.65;
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-tab-btn:hover {
  color: var(--text-primary);
  opacity: 0.9;
  border-bottom-color: var(--border);
}

.report-tab-btn.active {
  color: var(--accent);
  opacity: 1;
  border-bottom-color: var(--accent);
}

.tab-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.tab-badge.ok {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.tab-badge.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.tab-badge.warn {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pane-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pane-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.bulk-toggles {
  display: flex;
  gap: 6px;
}

.table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 6px);
  background: var(--bg-card);
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.report-table th,
.report-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}

.report-table th {
  background: var(--bg-hover);
  font-weight: 600;
  color: var(--text-primary);
  position: sticky;
  top: 0;
  z-index: 5;
}

.report-table tbody tr:hover {
  background: var(--bg-hover);
}

.row-skipped {
  opacity: 0.6;
  background: var(--bg-hover);
}

.font-mono {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
}

.text-center {
  text-align: center;
}

.text-secondary {
  color: var(--text-secondary);
}

.input-preview-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-input {
  width: 100%;
  font-size: 13px;
  padding: 6px 10px;
}

.text-preview {
  font-size: 11px;
  color: var(--text-secondary);
  padding-left: 2px;
}

.text-preview b {
  color: var(--accent, #6366f1);
  font-weight: 600;
}

.courier-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.courier-badge.gray {
  background: var(--bg-hover, #f3f4f6);
  color: var(--text-secondary);
}

.compact-select {
  padding: 4px 8px;
  font-size: 12px;
  height: 28px;
  width: 100%;
}

.reason-text {
  font-size: 12px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-text {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.anomaly-description {
  color: #b45309;
  font-weight: 500;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-warn {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.empty-row-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 30px !important;
  font-weight: 500;
}

.empty-row-state.ok-state {
  color: #10b981;
}

/* Custom Checkbox styles matching the theme */
.switch-container {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.switch-container input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-chk {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color, #cbd5e1);
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.2s ease;
}

.switch-container input:checked + .custom-chk {
  background-color: var(--accent, #6366f1);
  border-color: var(--accent, #6366f1);
}

.switch-container input:checked + .custom-chk::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.switch-container input:disabled + .custom-chk {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty Tab States styling */
.empty-tab-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  animation: modalFadeIn 0.3s ease;
}

.empty-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.empty-icon-wrapper.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.empty-icon-wrapper.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.empty-tab-state h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.empty-tab-state p {
  font-size: 12.5px;
  color: var(--text-muted);
  max-width: 320px;
  margin: 0;
  line-height: 1.5;
}

/* Anomalies Card Layout styling */
.anomalies-list-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.anomaly-card {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(245, 158, 11, 0.02);
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-left: 4px solid var(--warning);
  border-radius: var(--radius-md, 6px);
  animation: modalSlideUp 0.25s ease;
}

:root[data-theme='light'] .anomaly-card {
  background: rgba(245, 158, 11, 0.03);
  border-color: rgba(245, 158, 11, 0.18);
}

.anomaly-card-icon {
  color: var(--warning);
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.anomaly-card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.anomaly-card-desc {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.45;
}

.anomaly-card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.anomaly-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
}

.anomaly-badge code {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  color: var(--accent);
  margin-left: 2px;
}

.truncate-badge {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tab-pane animations */
.animate-fade-in {
  animation: modalFadeIn 0.25s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideUp {
  from {
    transform: translateY(6px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

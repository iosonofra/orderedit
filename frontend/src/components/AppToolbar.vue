<template>
  <div class="toolbar">
    <input
      ref="fileInputRef"
      type="file"
      accept=".xlsx"
      style="display: none"
      @change="handleFileChange"
    />

    <div class="toolbar-left">
      <!-- Gruppo 1: File & Storia -->
      <div class="toolbar-group">
        <button id="btn-upload" class="btn btn-secondary btn-icon-inline" @click="fileInputRef.click()" title="Ctrl+O">
          <svg viewBox="0 0 24 24">
            <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6v-2h12v2z"/>
          </svg>
          <span>Carica Excel</span>
        </button>
        <div class="group-divider"></div>
        <button class="btn btn-secondary btn-icon-inline" :disabled="!spreadsheetStore.hasData || spreadsheetStore.checkpointIndex <= 0" @click="undoAction" title="Annulla ultima modifica (Ctrl+Z)">
          <svg viewBox="0 0 24 24">
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
          </svg>
          <span>Annulla</span>
        </button>
        <button class="btn btn-secondary btn-icon-inline" :disabled="!spreadsheetStore.hasData || spreadsheetStore.checkpointIndex >= spreadsheetStore.checkpoints.length - 1" @click="redoAction" title="Ripristina modifica annullata (Ctrl+Y)">
          <svg viewBox="0 0 24 24">
            <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
          </svg>
          <span>Ripeti</span>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Gruppo 2: Strumenti Testo -->
      <div class="toolbar-group">
        <button class="btn btn-secondary btn-icon-inline" :disabled="!spreadsheetStore.hasData" @click="showSearchModal = true" title="Ctrl+F">
          <svg viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm2.5-7H8v1.5h4V7zm0 3.5H8V12h4v-1.5z"/>
          </svg>
          <span>Trova e sostituisci</span>
        </button>

        <div class="group-divider"></div>

        <div class="bulk-wrap">
          <button class="btn btn-secondary btn-icon-inline" :disabled="!spreadsheetStore.hasData" @click="toggleBulkMenu">
            <svg viewBox="0 0 24 24">
              <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.6z"/>
            </svg>
            <span>Strumenti rapidi</span>
          </button>
          <div v-if="showBulkMenu" class="bulk-menu">
            <template v-for="item in bulkActions" :key="item.label">
              <div v-if="item.dividerBefore" class="bulk-menu-divider"></div>
              <button
                class="bulk-item"
                :class="{ 'bulk-item-danger': item.danger }"
                :title="item.tooltip"
                @click="item.action()"
              >
                <svg class="bulk-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="item.icon" />
                </svg>
                <span>{{ item.label }}</span>
              </button>
            </template>
          </div>
        </div>

        <div class="group-divider"></div>

        <div class="bulk-wrap">
          <button class="btn btn-secondary btn-icon-inline" :disabled="!spreadsheetStore.hasData" @click="toggleNoteMenu">
            <svg viewBox="0 0 24 24"><path d="M4 4h16v13H8l-4 4V4Zm3 5h10M7 13h7"/></svg>
            <span>Imposta Note</span>
          </button>
          <div v-if="showNoteMenu" class="bulk-menu">
            <button v-for="preset in notePresetStore.presets" :key="preset" class="bulk-item" @click="applyNotePreset(preset)">
              <svg class="bulk-icon" viewBox="0 0 24 24"><path :d="icons.note" /></svg><span>{{ preset }}</span>
            </button>
            <div class="bulk-menu-divider"></div>
            <button class="bulk-item" @click="goToNoteSettings">
              <svg class="bulk-icon" viewBox="0 0 24 24"><path :d="icons.settings" /></svg><span>Gestisci preset...</span>
            </button>
          </div>
        </div>

        <div class="group-divider"></div>

        <div class="bulk-wrap">
          <button class="btn btn-secondary btn-icon-inline" :disabled="!spreadsheetStore.hasData" @click="toggleCourierMenu">
            <svg viewBox="0 0 24 24">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm11.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM15 12H4V6h11v6z"/>
            </svg>
            <span>Imposta corriere</span>
          </button>
          <div v-if="showCourierMenu" class="bulk-menu">
            <button v-for="preset in courierPresetStore.presets" :key="preset" class="bulk-item" @click="applyCourierPreset(preset)">
              <svg class="bulk-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="icons.truck" /></svg>
              <span>{{ preset }}</span>
            </button>
            <div class="bulk-menu-divider"></div>
            <button class="bulk-item" @click="goToSettings">
              <svg class="bulk-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="icons.settings" /></svg>
              <span>Gestisci preset...</span>
            </button>
          </div>
        </div>

        <div class="group-divider"></div>

        <!-- Gruppo 3: Catalogo & Azioni -->
        <button
          id="btn-save-template"
          class="btn btn-secondary btn-icon-inline"
          :disabled="!spreadsheetStore.hasData || renaming"
          @click="saveCurrentCellAsTemplate"
          title="Salva o aggiorna il template usando i dati di questa riga"
        >
          <svg viewBox="0 0 24 24">
            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13zm-2-9H9v2h6V9zm0 3H9v2h6v-2z"/>
          </svg>
          <span>Salva nel catalogo</span>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <button
        id="btn-autorename"
        class="btn btn-primary btn-icon-inline"
        :disabled="!spreadsheetStore.hasData || renaming"
        @click="doAutoRename"
        title="Ctrl+Shift+R"
      >
        <span v-if="renaming" class="spinner"></span>
        <template v-else>
          <svg viewBox="0 0 24 24">
            <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8l-2.5-1.4 1.4 2.5-1.4 2.5 2.5-1.4 2.5 1.4-1.4-2.5zM19.3 2.2l-2.5 1.4 1.4 2.5-1.4 2.5 2.5-1.4 2.5 1.4-1.4-2.5zm-3.6 7.6L3.2 22.3c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L17.1 11.2l-1.4-1.4z"/>
          </svg>
          <span>Aggiorna nomi</span>
        </template>
      </button>

      <button
        id="btn-smart-ai"
        v-if="aiStore.enabled"
        class="btn btn-ai btn-icon-inline"
        :disabled="!spreadsheetStore.hasData || aiStore.isProcessing"
        @click="runSmartAi"
        title="Elabora con AI (Ctrl+Shift+A)"
      >
        <span v-if="aiStore.isProcessing" class="spinner-small"></span>
        <template v-else>
          <svg class="ai-sparkle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="13" r="4" />
            <line x1="12" y1="16" x2="16" y2="20" />
            <path d="M15 4.5c0 1.2.6 1.8 1.8 1.8-1.2 0-1.8.6-1.8 1.8 0-1.2-.6-1.8-1.8-1.8 1.2 0 1.8-.6 1.8-1.8z" fill="currentColor" stroke="none" />
          </svg>
          <span>Elabora con AI</span>
        </template>
      </button>

      <div class="toolbar-divider"></div>

      <!-- Gruppo 4: Esportazione -->
      <button
        id="btn-export"
        class="btn btn-success btn-icon-inline"
        :disabled="!spreadsheetStore.hasData || exporting"
        @click="openExportDiffModal"
        title="Ctrl+S"
        style="position: relative;"
      >
        <span v-if="exporting" class="spinner"></span>
        <template v-else>
          <svg viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
          </svg>
          <span>Scarica Excel</span>
        </template>
        <span v-if="spreadsheetStore.isUnsaved" class="unsaved-dot"></span>
      </button>

      <div class="toolbar-divider"></div>

      <button
        id="btn-picking"
        class="btn btn-primary btn-icon-inline"
        :disabled="!spreadsheetStore.hasData || picking"
        @click="generatePicking"
        title="Invia il file corrente a PickCSV"
      >
        <span v-if="picking" class="spinner"></span>
        <template v-else>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11ZM5.5 6A.5.5 0 0 0 5 6.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H11.2l-2-2H5.5Zm6.5 3 4 4-4 4v-3H8v-2h4V9Z"/>
          </svg>
          <span>Genera Picking</span>
        </template>
      </button>
    </div>

    <div class="toolbar-right">
      <span v-if="operationText" class="status-badge">{{ operationText }}</span>
      <span v-if="lastStats && !aiStore.isProcessing" class="stats-badge" :class="lastStats.notFound > 0 ? 'stats-warn' : 'stats-ok'">
        {{ lastStats.renamed }}/{{ lastStats.totalRows }} rinominati
        <span v-if="lastStats.notFound > 0"> - {{ lastStats.notFound }} non trovati</span>
      </span>
    </div>

    <Teleport to="body">
      <div v-if="showMissingModal" class="modal-backdrop" @click="showMissingModal = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>Prodotti non mappati</h3>
            <button class="btn btn-icon" @click="showMissingModal = false">&times;</button>
          </div>
          <div class="modal-body missing-body">
            <p>I seguenti prodotti non sono stati trovati nel template. Puoi aggiungere il mapping direttamente qui:</p>
            <div class="missing-search-wrapper" style="margin-bottom: 12px;">
              <input
                v-model="missingFilter"
                class="input missing-search-input"
                placeholder="Filtra prodotti non mappati per ID o nome..."
                style="width: 100%; font-size: 13px;"
              />
            </div>
            <ul class="missing-list">
              <li v-for="(item, i) in filteredMissingReport" :key="i" class="missing-item">
                <div class="missing-info">
                  <strong>Riga {{ item.row }}:</strong> ID <code>{{ item.id }}</code>
                  <span v-if="item.currentName" class="current-name">- "{{ item.currentName }}"</span>
                </div>
                <div v-if="!item.saved && item.suggestions?.length" class="suggestion-list">
                  <span class="suggestion-label">Suggerimenti</span>
                  <button
                    v-for="suggestion in item.suggestions"
                    :key="`${item.id}-${suggestion.id}`"
                    class="suggestion-chip"
                    type="button"
                    @click="applySuggestion(item, suggestion)"
                    :title="`ID ${suggestion.id}`"
                  >
                    <span v-html="suggestion.name"></span>
                    <small class="affinity-badge" :class="getAffinityClass(suggestion.score)">{{ suggestion.scoreLabel }}</small>
                  </button>
                </div>
                <template v-if="!item.saved">
                  <div class="quick-add-row">
                    <button
                      class="btn btn-secondary btn-sm btn-bold"
                      type="button"
                      title="Applica grassetto alla selezione"
                      @mousedown.prevent
                      @click="wrapMissingNameBold(item)"
                    >
                      <strong>B</strong>
                    </button>
                    <input
                      :ref="(el) => setMissingNameInputRef(item, el)"
                      v-model="item.newName"
                      class="input quick-add-input"
                      :placeholder="item.currentName || 'Nome corretto, anche con <b>...</b>'"
                      @keyup.enter="quickAddTemplate(item)"
                    />
                    <button class="btn btn-success btn-sm" @click="quickAddTemplate(item)" :disabled="!item.newName?.trim()">
                      Salva
                    </button>
                  </div>
                  <div
                    v-if="item.newName?.trim()"
                    class="quick-add-preview"
                    v-html="templateMarkupPreview(item.newName)"
                  ></div>
                </template>
                <div v-else class="quick-add-done">
                  Salvato
                </div>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showMissingModal = false">Chiudi</button>
            <button
              v-if="missingReport.some(i => i.saved)"
              class="btn btn-primary"
              @click="showMissingModal = false; doAutoRename()"
            >
              Riesegui Auto-rename
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showSearchModal" class="modal-backdrop" @click="showSearchModal = false">
        <div class="modal modal-wide" @click.stop>
          <div class="modal-header">
            <h3>Ricerca avanzata</h3>
            <button class="btn btn-icon" @click="showSearchModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="search-grid">
              <input v-model="searchQuery" class="input" placeholder="Testo o regex" />
              <input v-model="replaceQuery" class="input" placeholder="Sostituisci con..." />
              <input v-model="columnFilter" class="input" placeholder="Colonna (es: Nome del prodotto o C)" />
              <label class="ck"><input v-model="searchRegex" type="checkbox" /> Regex</label>
              <label class="ck"><input v-model="searchCase" type="checkbox" /> Case-sensitive</label>
              <button class="btn btn-secondary" @click="previewSearch">Anteprima</button>
              <button class="btn btn-primary" :disabled="searchMatches.length === 0" @click="replaceAllMatches">Sostituisci tutto</button>
            </div>
            <div class="search-nav-wrapper" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="preview-head" style="margin: 0;">{{ searchMatches.length }} match trovati</span>
              <span v-if="searchMatches.length > 0" class="search-count-badge">
                {{ currentSearchIndex >= 0 ? currentSearchIndex + 1 : 0 }} di {{ searchMatches.length }}
              </span>
              <button class="search-nav-btn" :disabled="searchMatches.length === 0" @click="navigateSearch(-1)" title="Precedente">&lt;</button>
              <button class="search-nav-btn" :disabled="searchMatches.length === 0" @click="navigateSearch(1)" title="Successivo">&gt;</button>
            </div>
            <div class="preview-list">
              <div
                v-for="(m, idx) in searchMatches.slice(0, 120)"
                :key="idx"
                class="preview-row"
                :class="{ active: idx === currentSearchIndex }"
                @click="jumpToSearchMatch(idx)"
                style="cursor: pointer;"
              >
                <span>S{{ m.sheet + 1 }} R{{ m.row + 1 }} C{{ m.col + 1 }}</span>
                <code>{{ m.before }}</code>
                <span>-></span>
                <code>{{ m.after }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDiffModal" class="modal-backdrop" @click="showDiffModal = false">
        <div class="modal modal-wide" @click.stop>
          <div class="modal-header">
            <h3>{{ compareOnlyMode ? 'Confronto con file originale' : 'Confronto modifiche prima export' }}</h3>
            <button class="btn btn-icon" @click="showDiffModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="preview-head">{{ diffSummary.total }} modifiche rilevate</div>
            <div v-if="!compareOnlyMode && diffSummary.groups?.length" class="diff-groups">
              <button
                class="diff-group"
                :class="{ active: !selectedGroup }"
                @click="selectedGroup = null"
                type="button"
              >
                Tutte le modifiche
              </button>
              <button
                v-for="(group, idx) in diffSummary.groups"
                :key="idx"
                class="diff-group"
                :class="{ active: selectedGroup === group.label }"
                @click="selectedGroup = selectedGroup === group.label ? null : group.label"
                type="button"
              >
                <span class="diff-group-title">{{ group.label }}</span>
                <span class="diff-group-count">{{ group.count }}</span>
              </button>
            </div>
            <div class="preview-list">
              <div v-if="compareOnlyMode && diffSummary.items.length === 0" class="compare-empty">
                Nessuna differenza rispetto al file originale.
              </div>

              <!-- Riga di intestazione fissa (sticky) per la lista delle modifiche -->
              <div v-if="!compareOnlyMode && filteredDiffItems.length > 0" class="preview-row preview-header-row">
                <div class="diff-header-col">Posizione</div>
                <div class="diff-header-col">Valore Precedente</div>
                <div></div>
                <div class="diff-header-col">Nuovo Valore</div>
              </div>

              <div v-if="compareOnlyMode" v-for="(d, idx) in diffSummary.items.slice(0, 150)" :key="`cmp-${idx}`" class="compare-card">
                <div class="compare-meta">{{ d.sheet }} · Riga {{ d.row }} · Col {{ d.col }}</div>
                <div v-if="d.changeNote" class="compare-note">{{ d.changeNote }}</div>
                <div class="compare-columns">
                  <div class="compare-col compare-before">
                    <div class="compare-label">Prima</div>
                    <div class="compare-text" v-html="d.beforeHtml || '(vuoto)'"></div>
                    <div class="compare-style">Stile: {{ d.beforeStyle }}</div>
                  </div>
                  <div class="compare-col compare-after">
                    <div class="compare-label">Dopo</div>
                    <div class="compare-text" v-html="d.afterHtml || '(vuoto)'"></div>
                    <div class="compare-style">Stile: {{ d.afterStyle }}</div>
                  </div>
                </div>
              </div>
              <div v-if="!compareOnlyMode" v-for="(d, idx) in filteredDiffItems.slice(0, 150)" :key="idx" class="preview-row">
                <div class="diff-meta" :title="`${d.sheet}!R${d.row}C${d.col}`">
                  <span class="diff-sheet">{{ d.sheet }}</span>
                  <span class="diff-coord">Riga {{ d.row }} · {{ d.colLabel }}</span>
                  <span v-if="d.changeNote" class="diff-note-inline" :title="d.changeNote">
                    {{ d.changeNote }}
                  </span>
                </div>
                <div class="diff-val diff-before" v-html="d.beforeHtml || '(vuoto)'"></div>
                <span class="diff-arrow">→</span>
                <div class="diff-val diff-after" v-html="d.afterHtml || '(vuoto)'"></div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDiffModal = false">{{ compareOnlyMode ? 'Chiudi' : 'Annulla' }}</button>
            <button v-if="!compareOnlyMode" class="btn btn-success" @click="confirmExport">Conferma export</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- AI Anomalies Modal (simplified) -->
    <AiAnomaliesModal
      :show="showAiAnomaliesModal"
      :anomalies="aiAnomaliesList"
      @close="showAiAnomaliesModal = false"
    />
  </div>
</template>

<script setup>
import { nextTick, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/index.js'
import { useSpreadsheetStore } from '../stores/spreadsheet.js'
import { useNotificationStore } from '../stores/notification.js'
import { useTemplateStore } from '../stores/templates.js'
import { useCourierPresetStore } from '../stores/courierPresets.js'
import { useNotePresetStore } from '../stores/notePresets.js'
import { useAiStore } from '../stores/ai.js'
import AiAnomaliesModal from './AiAnomaliesModal.vue'

const spreadsheetStore = useSpreadsheetStore()
const notificationStore = useNotificationStore()
const templateStore = useTemplateStore()
const courierPresetStore = useCourierPresetStore()
const notePresetStore = useNotePresetStore()
const router = useRouter()

const fileInputRef = ref(null)
const renaming = ref(false)
const exporting = ref(false)
const picking = ref(false)
const aiStore = useAiStore()
const processingAi = ref(false)
const showAiAnomaliesModal = ref(false)
const aiAnomaliesList = ref([])
const lastStats = ref(null)
const operationText = ref('')
const showBulkMenu = ref(false)
const showCourierMenu = ref(false)
const showNoteMenu = ref(false)
const showMissingModal = ref(false)
const missingReport = ref([])
const missingNameInputs = ref({})
const missingFilter = ref('')

const filteredMissingReport = computed(() => {
  const query = missingFilter.value.trim().toLowerCase()
  if (!query) return missingReport.value
  return missingReport.value.filter(item => {
    const id = String(item.id || '').toLowerCase()
    const name = String(item.currentName || '').toLowerCase()
    return id.includes(query) || name.includes(query)
  })
})

const showSearchModal = ref(false)

const searchQuery = computed({
  get() { return spreadsheetStore.searchQuery },
  set(val) {
    spreadsheetStore.searchQuery = val
    previewSearch()
  }
})
const replaceQuery = ref('')
const columnFilter = computed({
  get() { return spreadsheetStore.columnFilter },
  set(val) {
    spreadsheetStore.columnFilter = val
    previewSearch()
  }
})
const searchRegex = computed({
  get() { return spreadsheetStore.searchRegex },
  set(val) {
    spreadsheetStore.searchRegex = val
    previewSearch()
  }
})
const searchCase = computed({
  get() { return spreadsheetStore.searchCase },
  set(val) {
    spreadsheetStore.searchCase = val
    previewSearch()
  }
})

const searchMatches = ref([])
const currentSearchIndex = ref(-1)

watch(showSearchModal, (val) => {
  if (val) {
    currentSearchIndex.value = -1
  }
})

function jumpToSearchMatch(idx) {
  currentSearchIndex.value = idx
  const match = searchMatches.value[idx]
  if (!match) return
  
  // Switch active sheet if necessary
  spreadsheetStore.setActiveSheetIndex(match.sheet)
  // Highlight active selection
  spreadsheetStore.setSelectedRange({
    rowStart: match.row,
    rowEnd: match.row,
    colStart: match.col,
    colEnd: match.col
  })

  // Scroll, focus, and flash cell
  nextTick(() => {
    const el = document.querySelector(`[data-cell="${match.row}_${match.col}"]`)
    if (el) {
      el.scrollIntoView({ block: 'center', inline: 'center' })
      el.focus()
      window.dispatchEvent(new CustomEvent('cells-replaced', {
        detail: {
          sheetIndex: match.sheet,
          cells: [{ row: match.row, col: match.col }]
        }
      }))
    }
  })
}

function navigateSearch(direction) {
  if (searchMatches.value.length === 0) return
  let nextIdx = currentSearchIndex.value + direction
  if (nextIdx < 0) nextIdx = searchMatches.value.length - 1
  if (nextIdx >= searchMatches.value.length) nextIdx = 0
  
  jumpToSearchMatch(nextIdx)
}
const showDiffModal = ref(false)
const compareOnlyMode = ref(false)
const diffSummary = ref({ total: 0, items: [] })
const selectedGroup = ref(null)

const filteredDiffItems = computed(() => {
  if (!selectedGroup.value) return diffSummary.value?.items || []
  return (diffSummary.value?.items || []).filter((item) => {
    let itemGroupLabel = ''
    if (item.changeKind === 'merge') {
      itemGroupLabel = `${item.sheet}: unioni celle`
    } else if (item.changeKind === 'width') {
      itemGroupLabel = `${item.sheet}: larghezze colonne`
    } else if (item.changeKind === 'structure') {
      itemGroupLabel = `${item.sheet}: struttura`
    } else {
      itemGroupLabel = `${item.sheet}: ${item.colLabel || `Col ${item.col}`}`
    }
    return itemGroupLabel === selectedGroup.value
  })
})

const MIN_COLUMN_WIDTH = 72
const MAX_COLUMN_WIDTH = 1000

const icons = {
  note: 'M4 4h16v13H8l-4 4V4Zm3 5h10M7 13h7',
  truck: 'M4 7h11v8H4V7Zm11 3h3l2 2v3h-5v-5ZM7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 15h1M9 15h6M19 15h1',
  settings: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-5v3M12 18v3M4.9 4.9 7 7M17 17l2.1 2.1M3 12h3M18 12h3M4.9 19.1 7 17M17 7l2.1-2.1',
}

const bulkActions = [
  {
    label: 'Confronta con originale',
    action: openCompareOriginalModal,
    icon: 'M5 5h6v14H5V5Zm8 0h6v14h-6V5ZM8 9h3M8 13h3M15 9h3M15 13h3',
    tooltip: 'Mostra le differenze tra il file caricato e lo stato attuale.',
  },
  {
    label: 'Applica template a selezione',
    action: applyTemplateToSelection,
    icon: 'M4 5h10l4 4v10H4V5Zm9 0v5h5M7 13h10M7 16h7',
    tooltip: 'Applica i nomi prodotto del catalogo solo alle righe selezionate.',
  },
  {
    label: 'Normalizza spazi',
    action: normalizeSpacesSheet,
    icon: 'M4 7h16M4 12h10M4 17h16M16 12h4',
    tooltip: 'Riduce spazi multipli e pulisce la spaziatura nelle celle modificabili.',
    dividerBefore: true,
  },
  {
    label: 'Trim colonne testuali',
    action: trimTextColumns,
    icon: 'M5 5h14M12 5v14M8 19h8',
    tooltip: 'Rimuove spazi iniziali e finali dalle colonne testuali.',
  },
  {
    label: 'Unisci righe per ordine',
    action: mergeRowsByOrderRef,
    icon: 'M5 6h14M5 18h14M9 10l3 3 3-3M12 13V5',
    tooltip: 'Unisce le celle ripetute per righe con lo stesso riferimento ordine.',
    dividerBefore: true,
  },
  {
    label: 'Separa righe unite',
    action: unmergeRowsByOrderRef,
    icon: 'M5 6h14M5 18h14M12 11V5M12 13v6M9 10l3 3 3-3',
    tooltip: 'Rimuove le unioni create sulle righe raggruppate per ordine.',
  },
  {
    label: 'Elimina righe selezionate',
    action: deleteSelectedRows,
    icon: 'M5 7h14M9 7V5h6v2M8 10h8M8 14h8M10 18h4',
    tooltip: 'Elimina le righe selezionate, esclusa la riga intestazione.',
    dividerBefore: true,
    danger: true,
  },
  {
    label: 'Elimina colonne selezionate',
    action: deleteSelectedColumns,
    icon: 'M7 5v14M17 5v14M5 7h14M5 17h14M10 10l4 4M14 10l-4 4',
    tooltip: 'Elimina le colonne selezionate, tranne colonne protette come EAN e prodotto.',
    danger: true,
  },
]

function handleKeyboard(e) {
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'o') {
    e.preventDefault()
    fileInputRef.value?.click()
  }
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 's') {
    e.preventDefault()
    if (spreadsheetStore.hasData && !exporting.value) openExportDiffModal()
  }
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
    e.preventDefault()
    if (spreadsheetStore.hasData && !renaming.value) doAutoRename()
  }
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault()
    if (aiStore.enabled && spreadsheetStore.hasData && !aiStore.isProcessing) runSmartAi()
  }
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'f') {
    e.preventDefault()
    showSearchModal.value = true
    previewSearch()
  }
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    undoAction()
  }
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'y') {
    e.preventDefault()
    redoAction()
  }
}

onMounted(() => {
  courierPresetStore.load()
  notePresetStore.load()
  aiStore.load()
  window.addEventListener('keydown', handleKeyboard)
  window.addEventListener('click', clickAwayBulk)
  window.addEventListener('trigger-smart-ai', runSmartAi)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboard)
  window.removeEventListener('click', clickAwayBulk)
  window.removeEventListener('trigger-smart-ai', runSmartAi)
})

function clickAwayBulk(e) {
  const target = e.target
  if (!(target instanceof Element)) return
  if (!target.closest('.bulk-wrap')) {
    showBulkMenu.value = false
    showCourierMenu.value = false
    showNoteMenu.value = false
  }
}

function readCellText(cell, depth = 0) {
  if (cell === undefined || cell === null) return ''
  if (depth > 4) return ''
  if (typeof cell !== 'object') return String(cell)
  if (Array.isArray(cell.richText)) {
    return cell.richText.map(run => stripTechnicalTextPrefix(String(run?.text ?? ''))).join('')
  }
  if (cell.ct && cell.ct.t === 'inlineStr' && Array.isArray(cell.ct.s)) {
    return cell.ct.s.map(run => stripTechnicalTextPrefix(String(run?.v ?? ''))).join('')
  }
  if (cell.v !== undefined) return readCellText(cell.v, depth + 1)
  if (cell.m !== undefined) return readCellText(cell.m, depth + 1)
  if (cell.w !== undefined) return readCellText(cell.w, depth + 1)
  if (cell.text !== undefined) return readCellText(cell.text, depth + 1)
  if (cell.result !== undefined) return readCellText(cell.result, depth + 1)
  return ''
}

function getCellText(cell) {
  return stripTechnicalTextPrefix(readCellText(cell))
}

function clampColumnWidth(width) {
  const parsed = Number(width)
  if (!Number.isFinite(parsed)) return MIN_COLUMN_WIDTH
  return Math.min(Math.max(Math.round(parsed), MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH)
}

function measureTextWidth(value) {
  const text = String(value ?? '')
  let width = 0
  for (const char of text) {
    if (/[MW@#%&]/.test(char)) width += 10
    else if (/[A-Z0-9]/.test(char)) width += 7.5
    else if (/[il.,'`\s]/.test(char)) width += 4
    else width += 7
  }
  return width
}

function columnName(index) {
  let n = index + 1
  let out = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    out = String.fromCharCode(65 + rem) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

function templateToPlainText(value) {
  return templateToRichRuns(value).map((run) => run.v).join('')
}

function makePlainTextCell(value) {
  const text = templateToPlainText(value)
  return { v: text, m: text, w: text, ct: { fa: '@', t: 's' } }
}

function decodeHtmlEntities(value) {
  const text = String(value ?? '')
  if (typeof document === 'undefined') return text
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

function templateToRichRuns(value) {
  const source = String(value ?? '').replace(/<br\s*\/?>/gi, ' ')
  const tokens = source.split(/(<\/?b>)/gi)
  const runs = []
  let bold = false

  tokens.forEach((token) => {
    if (!token) return
    if (/^<b>$/i.test(token)) {
      bold = true
      return
    }
    if (/^<\/b>$/i.test(token)) {
      bold = false
      return
    }
    const text = stripTechnicalTextPrefix(decodeHtmlEntities(token.replace(/<[^>]+>/g, '')))
    if (!text) return
    const last = runs[runs.length - 1]
    if (last && Boolean(last.bl) === bold) {
      last.v += text
    } else {
      runs.push({ v: text, bl: bold ? 1 : 0 })
    }
  })

  return runs
}

function makeTemplateCell(value) {
  const runs = templateToRichRuns(value)
  const text = runs.map((run) => run.v).join('')
  if (!runs.some((run) => run.bl === 1)) return makePlainTextCell(text)
  return {
    v: text,
    m: text,
    w: text,
    ct: {
      t: 'inlineStr',
      s: runs.map((run) => ({ v: run.v, bl: run.bl ? 1 : 0 })),
    },
  }
}

function setCellValueAndSync(row, col, value, sheetIndex = null) {
  const cellValue = value && typeof value === 'object' ? value : makePlainTextCell(value)
  const activeIdx = Number.isInteger(sheetIndex) ? sheetIndex : getActiveSheetIndex(spreadsheetStore.sheets)
  spreadsheetStore.updateCell(activeIdx, row, col, cellValue)
}

function persistProgrammaticSnapshot({ checkpoint = true, reload = false } = {}) {
  const sheets = getCurrentSheets()
  if (sheets.length === 0) return
  if (reload) {
    reloadGrid(sheets)
  }
  spreadsheetStore.hasData = true
  spreadsheetStore.isUnsaved = true
  if (checkpoint) spreadsheetStore.pushCheckpoint(sheets)
  spreadsheetStore.persistRecoverySnapshot(sheets)
}

function getCurrentSheets() {
  const sheets = spreadsheetStore.sheets
  if (!Array.isArray(sheets)) return []
  const cleanSheets = JSON.parse(JSON.stringify(sheets))
  return cleanSheets
}

function cloneSheets(sheets) {
  return JSON.parse(JSON.stringify(sheets || []))
}

function normalizeStructureChanges(changes) {
  return Array.isArray(changes)
    ? changes.filter((change) => change && Number.isInteger(change.index) && Number.isInteger(change.count) && change.count > 0)
    : []
}

function clearCellMergeMarkers(sheet) {
  if (!sheet || !Array.isArray(sheet.data)) return
  sheet.data.forEach((row) => {
    if (!Array.isArray(row)) return
    row.forEach((cell) => {
      if (cell && typeof cell === 'object' && 'mc' in cell) delete cell.mc
    })
  })
}

function applyMergeMarkers(sheet) {
  if (!sheet?.config?.merge || typeof sheet.config.merge !== 'object') return
  Object.entries(sheet.config.merge).forEach(([key, merge]) => {
    if (!merge || !Number.isInteger(merge.r) || !Number.isInteger(merge.c)) return
    if (!Array.isArray(sheet.data)) sheet.data = []
    for (let r = merge.r; r < merge.r + merge.rs; r++) {
      if (!Array.isArray(sheet.data[r])) sheet.data[r] = []
      for (let c = merge.c; c < merge.c + merge.cs; c++) {
        const cell = sheet.data[r][c] || makePlainTextCell('')
        sheet.data[r][c] = {
          ...cell,
          mc: r === merge.r && c === merge.c
            ? { r: merge.r, c: merge.c, rs: merge.rs, cs: merge.cs }
            : { r: merge.r, c: merge.c },
        }
      }
    }
  })
}

function rebuildMergeMarkers(sheet) {
  clearCellMergeMarkers(sheet)
  applyMergeMarkers(sheet)
}

function adjustMergesForDeletedRows(sheet, start, count) {
  const mergeCfg = sheet?.config?.merge
  if (!mergeCfg || typeof mergeCfg !== 'object') return
  const next = {}
  const end = start + count
  Object.values(mergeCfg).forEach((merge) => {
    if (!merge || !Number.isInteger(merge.r) || !Number.isInteger(merge.c)) return
    const mergeEnd = merge.r + merge.rs
    if (merge.r < end && mergeEnd > start) return
    const shifted = { ...merge, r: merge.r >= end ? merge.r - count : merge.r }
    next[`${shifted.r}_${shifted.c}`] = shifted
  })
  sheet.config.merge = next
  rebuildMergeMarkers(sheet)
}

function adjustMergesForDeletedColumns(sheet, start, count) {
  const mergeCfg = sheet?.config?.merge
  if (!mergeCfg || typeof mergeCfg !== 'object') return
  const next = {}
  const end = start + count
  Object.values(mergeCfg).forEach((merge) => {
    if (!merge || !Number.isInteger(merge.r) || !Number.isInteger(merge.c)) return
    const mergeEnd = merge.c + merge.cs
    if (merge.c < end && mergeEnd > start) return
    const shifted = { ...merge, c: merge.c >= end ? merge.c - count : merge.c }
    next[`${shifted.r}_${shifted.c}`] = shifted
  })
  sheet.config.merge = next
  rebuildMergeMarkers(sheet)
}

function shiftColumnWidthConfig(config, start, count) {
  if (!config || typeof config !== 'object') return {}
  const next = {}
  Object.entries(config).forEach(([key, value]) => {
    const idx = Number.parseInt(key, 10)
    if (!Number.isInteger(idx)) return
    if (idx >= start && idx < start + count) return
    const nextIdx = idx >= start + count ? idx - count : idx
    next[nextIdx] = value
  })
  return next
}

function applyDeleteRowsToSheet(sheet, start, count) {
  if (!sheet || !Array.isArray(sheet.data)) return
  sheet.data.splice(start, count)
  sheet.row = Math.max(1, Number(sheet.row || sheet.data.length) - count)
  if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
  adjustMergesForDeletedRows(sheet, start, count)
}

function applyDeleteColumnsToSheet(sheet, start, count) {
  if (!sheet || !Array.isArray(sheet.data)) return
  sheet.data.forEach((row) => {
    if (Array.isArray(row)) row.splice(start, count)
  })
  sheet.column = Math.max(1, Number(sheet.column || 0) - count)
  if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
  sheet.config.columnWidthsPx = shiftColumnWidthConfig(sheet.config.columnWidthsPx, start, count)
  sheet.config.manualColumnWidthsPx = shiftColumnWidthConfig(sheet.config.manualColumnWidthsPx, start, count)
  adjustMergesForDeletedColumns(sheet, start, count)
}

function applyStructureChangesToSheets(sheets, changes) {
  const nextSheets = cloneSheets(sheets)
  normalizeStructureChanges(changes).forEach((change) => {
    const idx = Number.isInteger(Number(change.sheetIndex)) ? Number(change.sheetIndex) : 0
    const sheet = nextSheets[idx]
    if (!sheet) return
    if (change.type === 'deleteRows') applyDeleteRowsToSheet(sheet, change.index, change.count)
    if (change.type === 'deleteColumns') applyDeleteColumnsToSheet(sheet, change.index, change.count)
  })
  return nextSheets
}

function describeStructureChange(change, sheets = spreadsheetStore.sheets) {
  const sheet = sheets?.[Number(change.sheetIndex || 0)]
  const name = sheet?.name || `Sheet${Number(change.sheetIndex || 0) + 1}`
  if (change.type === 'deleteRows') {
    const end = change.index + change.count
    return `${name}: righe ${change.index + 1}${change.count > 1 ? `-${end}` : ''} eliminate`
  }
  if (change.type === 'deleteColumns') {
    const end = change.index + change.count - 1
    return `${name}: colonne ${columnName(change.index)}${change.count > 1 ? `-${columnName(end)}` : ''} eliminate`
  }
  return `${name}: modifica struttura`
}

function stripTechnicalTextPrefix(value) {
  if (typeof value !== 'string') return value
  const cleaned = value
    .replace(/^'+/, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  try {
    return cleaned.normalize('NFC')
  } catch {
    return cleaned
  }
}

function isStyleEnabled(value) {
  return value === 1 || value === '1' || value === true || value === 'true'
}

function scientificToPlainString(value) {
  const src = String(value).trim()
  const m = src.match(/^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/)
  if (!m) return src
  const sign = m[1] || ''
  const intPart = m[2] || '0'
  const fracPart = m[3] || ''
  const exp = Number.parseInt(m[4], 10)
  if (!Number.isFinite(exp)) return src

  let digits = intPart + fracPart
  let decPos = intPart.length + exp

  if (decPos <= 0) {
    digits = `${'0'.repeat(Math.abs(decPos))}${digits}`
    decPos = 0
  } else if (decPos >= digits.length) {
    digits = `${digits}${'0'.repeat(decPos - digits.length)}`
  }

  const whole = digits.slice(0, decPos) || '0'
  const frac = digits.slice(decPos).replace(/0+$/, '')
  return `${sign}${whole}${frac ? `.${frac}` : ''}`
}

function normalizeEanValue(value) {
  if (value === undefined || value === null) return ''
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value))
  }
  const text = stripTechnicalTextPrefix(String(value))
  const plain = /[eE]/.test(text) ? scientificToPlainString(text) : text
  return plain.replace(/\.0+$/, '')
}

function normalizeHeaderLabel(value) {
  return stripTechnicalTextPrefix(String(value ?? ''))
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function detectEanColumnsFromSheetData(sheetData) {
  const hits = []
  if (!Array.isArray(sheetData) || sheetData.length === 0) return hits
  const scanRows = Math.min(6, sheetData.length)
  for (let r = 0; r < scanRows; r++) {
    const row = sheetData[r]
    if (!Array.isArray(row)) continue
    for (let c = 0; c < row.length; c++) {
      const raw = row[c]
      const label = typeof raw === 'object' ? (raw?.v ?? raw?.m ?? '') : raw
      const normalized = normalizeHeaderLabel(label)
      if (normalized === 'ean' || normalized.includes('ean')) {
        if (!hits.some((h) => h.col === c)) hits.push({ col: c, headerRow: r })
      }
    }
  }
  return hits
}

function setCellAsText(cell, textValue) {
  const normalized = normalizeEanValue(textValue)
  if (cell && typeof cell === 'object') {
    const nextCell = { ...cell, v: normalized, m: normalized, w: normalized, ct: { fa: '@', t: 's' } }
    if ('f' in nextCell) delete nextCell.f
    if ('qp' in nextCell) delete nextCell.qp
    if ('quotePrefix' in nextCell) delete nextCell.quotePrefix
    return nextCell
  }
  return { v: normalized, m: normalized, w: normalized, ct: { fa: '@', t: 's' } }
}

function applyEanOverrides(rawSheets, eanOverrides) {
  if (!Array.isArray(rawSheets) || !Array.isArray(eanOverrides) || eanOverrides.length === 0) return
  eanOverrides.forEach((ov) => {
    let sheet = rawSheets.find((s) => s?.name === ov.name)
    if (!sheet && Number.isInteger(ov.index)) sheet = rawSheets[ov.index]
    if (!sheet || !Array.isArray(sheet.data) || !Number.isInteger(ov.col)) return
    if (!Array.isArray(ov.values)) return

    ov.values.forEach((item) => {
      if (!Number.isInteger(item?.r) || item.r < 1) return
      if (!sheet.data[item.r]) sheet.data[item.r] = []
      const current = sheet.data[item.r][ov.col]
      sheet.data[item.r][ov.col] = setCellAsText(current, item.value ?? '')
    })
  })
}

function reloadGrid(sheets) {
  if (!sheets || !sheets.length) return
  const cleanSheets = JSON.parse(JSON.stringify(sheets))
  sanitizeSheets(cleanSheets)
  spreadsheetStore.sheets = cleanSheets
  spreadsheetStore.hasData = cleanSheets.length > 0
  spreadsheetStore.persistRecoverySnapshot(cleanSheets)
}

function sanitizeSheets(rawSheets) {
  const sanitizeCell = (cell) => {
    if (typeof cell === 'string') return stripTechnicalTextPrefix(cell)
    if (!cell || typeof cell !== 'object') return cell

    const nextCell = { ...cell }
    if (typeof nextCell.v === 'string') nextCell.v = stripTechnicalTextPrefix(nextCell.v)
    if (typeof nextCell.m === 'string') nextCell.m = stripTechnicalTextPrefix(nextCell.m)
    if (typeof nextCell.w === 'string') nextCell.w = stripTechnicalTextPrefix(nextCell.w)

    // Quote-prefix flags can force apostrophe visibility in formula bar/editor.
    if ('qp' in nextCell) delete nextCell.qp
    if ('quotePrefix' in nextCell) delete nextCell.quotePrefix

    if (nextCell.ct && nextCell.ct.t === 'inlineStr' && Array.isArray(nextCell.ct.s)) {
      nextCell.ct = {
        ...nextCell.ct,
        s: nextCell.ct.s.map((run) => {
          if (!run || typeof run !== 'object') return run
          return {
            ...run,
            v: stripTechnicalTextPrefix(String(run.v ?? '')),
          }
        }),
      }
    }

    if (nextCell.v !== undefined && nextCell.m === undefined) nextCell.m = String(nextCell.v)
    return nextCell
  }

  rawSheets.forEach((sheet) => {
    if (Array.isArray(sheet.data)) {
      const eanHits = detectEanColumnsFromSheetData(sheet.data)

      for (let r = 0; r < sheet.data.length; r++) {
        const row = sheet.data[r]
        if (!row) continue
        for (let c = 0; c < row.length; c++) {
          row[c] = sanitizeCell(row[c])
          const eanHit = eanHits.find((h) => h.col === c)
          if (eanHit && r > eanHit.headerRow) {
            row[c] = setCellAsText(row[c], typeof row[c] === 'object' ? (row[c]?.v ?? row[c]?.m ?? row[c]?.w) : row[c])
          }
        }
      }
      // Keep the 2D data matrix authoritative for export and recovery.
      if (sheet.data.length > 0 && sheet.celldata) delete sheet.celldata
    }

    if (Array.isArray(sheet.celldata)) {
      sheet.celldata = sheet.celldata.map((item) => {
        if (!item || typeof item !== 'object') return item
        return {
          ...item,
          v: sanitizeCell(item.v),
        }
      })
    }

    if (sheet.defaultRowHeight && typeof sheet.defaultRowHeight === 'string') {
      sheet.defaultRowHeight = stripTechnicalTextPrefix(sheet.defaultRowHeight)
    }
    if (sheet.defaultColWidth && typeof sheet.defaultColWidth === 'string') {
      sheet.defaultColWidth = stripTechnicalTextPrefix(sheet.defaultColWidth)
    }
    if (sheet.config && typeof sheet.config === 'object') {
      if (sheet.config.authority && typeof sheet.config.authority === 'object') {
        for (const key of Object.keys(sheet.config.authority)) {
          if (typeof sheet.config.authority[key] === 'string') {
            sheet.config.authority[key] = stripTechnicalTextPrefix(sheet.config.authority[key])
          }
        }
      }
    }
  })
}

function countCells(sheets) {
  let total = 0
  sheets.forEach((s) => {
    if (!Array.isArray(s.data)) return
    s.data.forEach((r) => {
      if (!Array.isArray(r)) return
      total += r.length
    })
  })
  return total
}

function ensureDataLoaded() {
  return Boolean(spreadsheetStore.hasData && Array.isArray(spreadsheetStore.sheets) && spreadsheetStore.sheets.length > 0)
}

function getActiveSheet() {
  const sheets = spreadsheetStore.sheets
  if (!Array.isArray(sheets) || sheets.length === 0) return null
  const idx = getActiveSheetIndex(sheets)
  return sheets[idx] || sheets[0] || null
}

function getActiveSheetData() {
  const sheet = getActiveSheet()
  return Array.isArray(sheet?.data) ? sheet.data : []
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.name.match(/\.xlsx$/i)) {
    notificationStore.show({ type: 'error', message: 'Solo file .xlsx sono supportati' })
    e.target.value = ''
    return
  }

  spreadsheetStore.isProcessing = true
  operationText.value = 'Upload in corso...'
  try {
    const form = new FormData()
    form.append('file', file)

    operationText.value = 'Parsing file...'
    const backendMeta = await api.post('/xlsx/upload', form).then((res) => res?.data || null)
    const backendSheets = Array.isArray(backendMeta?.sheets) ? backendMeta.sheets : null
    const finalSheets = Array.isArray(backendSheets) && backendSheets.length > 0 ? backendSheets : null

    if (!finalSheets) {
      notificationStore.show({ type: 'error', message: 'Impossibile leggere il file. Controlla backend e formato XLSX.' })
      return
    }
    applyEanOverrides(finalSheets, backendMeta?.eanOverrides || [])
    sanitizeSheets(finalSheets)

    operationText.value = 'Rendering foglio...'
    spreadsheetStore.loadSheets(finalSheets, file.name)
    spreadsheetStore.pushCheckpoint(finalSheets, { markUnsaved: false })
    lastStats.value = null

    const cellCount = countCells(finalSheets)
    if (cellCount > 60000) {
      notificationStore.show({ type: 'info', message: 'File grande caricato. Interfaccia ottimizzata con checkpoint progressivi.' })
    } else {
      notificationStore.show({ type: 'success', message: `File caricato: ${file.name}` })
    }
  } finally {
    spreadsheetStore.isProcessing = false
    operationText.value = ''
    e.target.value = ''
  }
}

function detectHeaderColumns(data) {
  const headerRow = data?.[0] || []
  let nomeCol = -1
  let idCol = -1
  headerRow.forEach((cell, c) => {
    const val = getCellText(cell).trim()
    if (val === spreadsheetStore.nameHeaderName) nomeCol = c
    if (val === spreadsheetStore.idHeaderName) idCol = c
  })
  return { nomeCol, idCol }
}

function detectCourierColumn(data) {
  const rows = Array.isArray(data) ? data : []
  const scanRows = Math.min(6, rows.length)
  for (let r = 0; r < scanRows; r++) {
    const row = rows[r]
    if (!Array.isArray(row)) continue
    for (let c = 0; c < row.length; c++) {
      const label = getCellText(row[c]).trim().toLowerCase().replace(/\s+/g, ' ')
      if (label === spreadsheetStore.courierHeaderName.toLowerCase() || label === 'corriere') {
        return { col: c, headerRow: r }
      }
    }
  }
  return null
}

function plainTemplateText(value) {
  return templateToPlainText(value).toLowerCase()
}

function normalizeSuggestionText(value) {
  return stripTechnicalTextPrefix(String(value ?? ''))
    .toLowerCase()
    .replace(/<\/?b>/gi, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokenSet(value) {
  return new Set(normalizeSuggestionText(value).split(/\s+/).filter((token) => token.length >= 2))
}

function tokenSimilarity(a, b) {
  const left = tokenSet(a)
  const right = tokenSet(b)
  if (left.size === 0 || right.size === 0) return 0
  let intersection = 0
  left.forEach((token) => {
    if (right.has(token)) intersection++
  })
  return intersection / Math.max(left.size, right.size)
}

function idSimilarity(a, b) {
  const left = String(a ?? '').trim()
  const right = String(b ?? '').trim()
  if (!left || !right) return 0
  if (left === right) return 1
  let prefix = 0
  const maxPrefix = Math.min(left.length, right.length)
  while (prefix < maxPrefix && left[prefix] === right[prefix]) prefix++
  const prefixScore = prefix / Math.max(left.length, right.length)

  const leftNum = Number(left)
  const rightNum = Number(right)
  if (Number.isFinite(leftNum) && Number.isFinite(rightNum)) {
    const diff = Math.abs(leftNum - rightNum)
    const numericScore = diff <= 10 ? 0.7 : diff <= 100 ? 0.4 : 0
    return Math.max(prefixScore, numericScore)
  }

  return prefixScore
}

function getAffinityClass(score) {
  const pct = score * 100
  if (pct >= 80) return 'affinity-high'
  if (pct >= 50) return 'affinity-medium'
  return 'affinity-low'
}

function buildTemplateSuggestions(idValue, currentName, templates) {
  return (templates || [])
    .map((template) => {
      const nameScore = tokenSimilarity(currentName, plainTemplateText(template.name))
      const idScore = idSimilarity(idValue, template.id)
      const score = (nameScore * 0.72) + (idScore * 0.28)
      return {
        id: template.id,
        name: template.name,
        score,
        scoreLabel: `${Math.round(score * 100)}%`,
      }
    })
    .filter((item) => item.score >= 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

function applySuggestion(item, suggestion) {
  item.newName = suggestion.name
  notificationStore.show({ type: 'info', message: `Suggerimento applicato da ID ${suggestion.id}` })
}

function missingNameInputKey(item) {
  return `${item?.row ?? ''}_${item?.id ?? ''}`
}

function setMissingNameInputRef(item, el) {
  const key = missingNameInputKey(item)
  if (!key) return
  if (el) missingNameInputs.value[key] = el
  else delete missingNameInputs.value[key]
}

function wrapMissingNameBold(item) {
  if (!item) return
  const input = missingNameInputs.value[missingNameInputKey(item)]
  const current = String(item.newName ?? item.currentName ?? '')
  const hasSelection = input && Number.isInteger(input.selectionStart) && Number.isInteger(input.selectionEnd)
  const start = hasSelection ? input.selectionStart : 0
  const end = hasSelection ? input.selectionEnd : current.length
  const selected = current.slice(start, end)

  let nextValue = ''
  let nextStart = 3
  let nextEnd = 3

  if (selected) {
    nextValue = `${current.slice(0, start)}<b>${selected}</b>${current.slice(end)}`
    nextStart = start + 3
    nextEnd = nextStart + selected.length
  } else if (current) {
    nextValue = `<b>${current}</b>`
    nextStart = 3
    nextEnd = 3 + current.length
  } else {
    nextValue = '<b></b>'
  }

  item.newName = nextValue
  nextTick(() => {
    const nextInput = missingNameInputs.value[missingNameInputKey(item)]
    if (!nextInput) return
    nextInput.focus()
    nextInput.setSelectionRange(nextStart, nextEnd)
  })
}

function templateMarkupPreview(value) {
  const runs = templateToRichRuns(value)
  if (runs.length === 0) return ''
  return runs
    .map((run) => (run.bl ? `<strong>${escapeHtml(run.v)}</strong>` : escapeHtml(run.v)))
    .join('')
}

function getProtectedColumns(headerRow) {
  const protectedCols = new Set()
  const row = headerRow || []
  for (let c = 0; c < row.length; c++) {
    const label = getCellText(row[c]).trim().toLowerCase()
    if (label === spreadsheetStore.eanHeaderName.toLowerCase()) protectedCols.add(c)
  }
  return protectedCols
}

async function doAutoRename({ quiet = false } = {}) {
  if (!ensureDataLoaded()) return false
  if (!quiet) renaming.value = true
  try {
    if (templateStore.templates.length === 0) {
      await templateStore.fetchAll()
    }
    const templateMap = {}
    templateStore.templates.forEach((t) => { templateMap[String(t.id).trim()] = t.name })
    if (Object.keys(templateMap).length === 0) {
      if (!quiet) {
        notificationStore.show({ type: 'warning', message: 'Nessun template configurato. Vai nelle Impostazioni.' })
      }
      return false
    }

    const data = getActiveSheetData()
    if (!data || data.length === 0) return false
    const { nomeCol, idCol } = detectHeaderColumns(data)
    if (nomeCol === -1 || idCol === -1) {
      if (!quiet) {
        notificationStore.show({ type: 'error', message: 'Colonne Nome del prodotto / ID prodotto non trovate.' })
      }
      return false
    }

    const stats = { totalRows: 0, renamed: 0, notFound: 0 }
    missingReport.value = []
    let updatedAny = false
    for (let r = 1; r < data.length; r++) {
      const row = data[r]
      if (!row) continue
      const idVal = getCellText(row[idCol]).trim()
      if (!idVal) continue
      stats.totalRows++
      if (templateMap[idVal] !== undefined) {
        const currentName = getCellText(row[nomeCol]).trim()
        const expectedName = templateToPlainText(templateMap[idVal]).trim()
        if (currentName !== expectedName) {
          setCellValueAndSync(r, nomeCol, makeTemplateCell(templateMap[idVal]))
          updatedAny = true
        }
        stats.renamed++
      } else {
        stats.notFound++
        const currentName = getCellText(row[nomeCol]).trim()
        missingReport.value.push({
          row: r + 1,
          id: idVal,
          currentName,
          newName: currentName,
          suggestions: buildTemplateSuggestions(idVal, currentName, templateStore.templates),
          saved: false,
        })
      }
    }
    lastStats.value = stats
    if (updatedAny) {
      persistProgrammaticSnapshot({ reload: true })
    }
    if (!quiet) {
      if (stats.notFound > 0) {
        showMissingModal.value = true
        notificationStore.show({ type: 'warning', message: `Rinominati ${stats.renamed}/${stats.totalRows}. Controlla gli ID mancanti.` })
      } else {
        notificationStore.show({ type: 'success', message: `Auto-rename completato: ${stats.renamed} prodotti` })
      }
    }
    return true
  } catch (err) {
    if (!quiet) {
      notificationStore.show({ type: 'error', message: err.message })
    }
    return false
  } finally {
    if (!quiet) renaming.value = false
  }
}

async function runSmartAi() {
  if (!aiStore.enabled) return
  if (!ensureDataLoaded()) return
  if (!aiStore.hasApiKey) {
    notificationStore.show({
      type: 'warning',
      message: 'Per favore, configura la chiave API AI nelle Impostazioni prima di avviare il Tasto Smart.',
    })
    return
  }

  processingAi.value = true
  aiStore.isProcessing = true
  aiStore.setProgress('rename', 'Aggiornamento nomi da catalogo...')
  try {
    // 1. Push checkpoint BEFORE any changes (for undo)
    spreadsheetStore.pushCheckpoint(getCurrentSheets())

    // 2. Run local auto rename first in quiet mode
    await doAutoRename({ quiet: true })

    // 3. Stream AI processing via SSE
    aiStore.setProgress('ai', 'Connessione al server AI...')
    const data = getActiveSheetData()
    const columnsMapping = {
      id: spreadsheetStore.idHeaderName,
      name: spreadsheetStore.nameHeaderName,
      courier: spreadsheetStore.courierHeaderName,
      ean: spreadsheetStore.eanHeaderName,
    }

    const result = await aiStore.processSheetStream(
      data,
      columnsMapping,
      courierPresetStore.presets,
    )

    if (!result || !Array.isArray(result.processedRows)) {
      notificationStore.show({ type: 'error', message: 'Risposta invalida dal server AI.' })
      return
    }

    // 4. Auto-apply all results
    aiStore.setProgress('applying', 'Applicazione risultati...')
    const applyResult = await autoApplyAiResults(result.processedRows)

    // 5. Build anomaly list
    const anomalies = []
    result.processedRows.forEach(row => {
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

    // 6. Progress done
    aiStore.setProgress('done', 'Completato!')

    // 7. Toast with summary
    let msg = 'Smart AI completato:'
    if (applyResult.nameUpdated > 0) msg += ` ${applyResult.nameUpdated} nomi aggiornati,`
    if (applyResult.courierUpdated > 0) msg += ` ${applyResult.courierUpdated} corrieri assegnati,`
    if (applyResult.templatesSaved > 0) msg += ` ${applyResult.templatesSaved} template salvati.`
    if (applyResult.rowsMerged) msg += ' Righe unite.'
    if (result.batchErrors > 0) msg += ` ${result.batchErrors} batch con errori.`
    if (anomalies.length > 0) msg += ` ${anomalies.length} anomalie rilevate.`
    // Clean trailing comma
    msg = msg.replace(/,$/, '.')
    if (msg === 'Smart AI completato:') msg = 'Smart AI completato: nessuna modifica necessaria.'

    notificationStore.show({
      type: result.batchErrors > 0 ? 'warning' : 'success',
      message: msg,
    })

    // 8. Show anomalies modal if any
    if (anomalies.length > 0) {
      aiAnomaliesList.value = anomalies
      showAiAnomaliesModal.value = true
    }

  } catch (err) {
    console.error('Smart AI Error:', err)
    notificationStore.show({
      type: 'error',
      message: `Elaborazione fallita: ${err.message}`,
    })
  } finally {
    processingAi.value = false
    aiStore.isProcessing = false
    aiStore.resetProgress()
    operationText.value = ''
  }
}

/**
 * Auto-apply AI results: names, couriers, templates, and merge rows.
 * Returns stats about what was applied.
 */
async function autoApplyAiResults(processedRows) {
  const sheets = getCurrentSheets()
  const activeIdx = getActiveSheetIndex(sheets)
  const sheet = sheets[activeIdx]
  if (!sheet || !Array.isArray(sheet.data)) return { nameUpdated: 0, courierUpdated: 0, templatesSaved: 0, rowsMerged: false }

  const data = sheet.data
  const { nomeCol } = detectHeaderColumns(data)
  const courierInfo = detectCourierColumn(data)

  let nameUpdated = 0
  let courierUpdated = 0

  // 1. Apply name and courier cell updates
  processedRows.forEach((row) => {
    // Apply name for new templates
    if (row.isNewTemplate && row.suggestedName && nomeCol !== -1) {
      if (!data[row.rowIndex]) data[row.rowIndex] = []
      data[row.rowIndex][nomeCol] = makeTemplateCell(row.suggestedName)
      nameUpdated++
    }
    // Apply courier if changed
    if (row.suggestedCourier && row.suggestedCourier !== row.currentCourier && courierInfo && courierInfo.col !== -1) {
      if (!data[row.rowIndex]) data[row.rowIndex] = []
      data[row.rowIndex][courierInfo.col] = makePlainTextCell(row.suggestedCourier)
      courierUpdated++
    }
  })

  // 2. Merge rows by order reference
  let rowsMerged = false
  const cols = detectSmartMergeColumns(data)
  if (cols && cols.ordine !== -1) {
    const mergeCols = [cols.ordine, cols.cliente, cols.note, cols.corriere].filter((c) => c >= 0)
    clearMergesForColumns(sheet, mergeCols)

    let groupStart = -1
    let groupValue = ''

    const startDataRow = cols.headerRow + 1
    for (let r = startDataRow; r <= data.length; r++) {
      const row = data[r]
      const value = r < data.length ? getCellText(row?.[cols.ordine]).trim() : ''
      const normalized = value.toUpperCase()

      if (!groupValue && normalized) {
        groupValue = normalized
        groupStart = r
        continue
      }

      if (normalized === groupValue && normalized) continue

      if (groupValue && groupStart >= 0) {
        const end = r - 1
        if (end > groupStart) {
          mergeCols.forEach((c) => applyVerticalMerge(sheet, c, groupStart, end))
          rowsMerged = true
        }
      }

      if (normalized) {
        groupValue = normalized
        groupStart = r
      } else {
        groupValue = ''
        groupStart = -1
      }
    }
  }

  // 3. Save new templates to catalog
  let templatesSaved = 0
  const templatesToSave = processedRows
    .filter(row => row.isNewTemplate && row.suggestedName && row.suggestedName.trim())
    .map(row => ({ id: row.id, name: row.suggestedName.trim() }))

  if (templatesToSave.length > 0) {
    try {
      for (const t of templatesToSave) {
        const existing = templateStore.templates.find((tpl) => String(tpl.id).trim() === t.id)
        if (existing) {
          await templateStore.update(t.id, t.name)
        } else {
          await templateStore.create(t.id, t.name)
        }
        templatesSaved++
      }
      await templateStore.fetchAll()
    } catch (err) {
      console.error('Template save error:', err)
    }
  }

  // 4. Reload grid and persist
  reloadGrid(sheets)
  spreadsheetStore.pushCheckpoint(sheets)
  spreadsheetStore.persistRecoverySnapshot(sheets)

  return { nameUpdated, courierUpdated, templatesSaved, rowsMerged }
}

async function quickAddTemplate(item) {
  const name = item.newName?.trim()
  if (!name) return
  try {
    const existing = templateStore.templates.find((t) => String(t.id).trim() === item.id)
    if (existing) await templateStore.update(item.id, name)
    else await templateStore.create(item.id, name)
    item.saved = true
    notificationStore.show({ type: 'success', message: `Template ${item.id} aggiunto` })
  } catch (err) {
    notificationStore.show({ type: 'error', message: `Errore: ${err.message}` })
  }
}

function getSelectionRange() {
  return spreadsheetStore.selectedRange
}

async function applyTemplateToSelection() {
  showBulkMenu.value = false
  if (!ensureDataLoaded()) return
  if (templateStore.templates.length === 0) await templateStore.fetchAll()
  const templateMap = {}
  templateStore.templates.forEach((t) => { templateMap[String(t.id).trim()] = t.name })
  const data = getActiveSheetData()
  const { nomeCol, idCol } = detectHeaderColumns(data)
  if (nomeCol === -1 || idCol === -1) {
    notificationStore.show({ type: 'error', message: 'Colonne Nome del prodotto / ID prodotto non trovate.' })
    return
  }
  const range = getSelectionRange()
  if (!range) {
    notificationStore.show({ type: 'warning', message: 'Seleziona prima un intervallo di righe.' })
    return
  }
  let applied = 0
  for (let r = Math.max(1, range.rowStart); r <= range.rowEnd; r++) {
    const row = data[r]
    if (!row) continue
    const idVal = getCellText(row[idCol]).trim()
    if (idVal && templateMap[idVal] !== undefined) {
      setCellValueAndSync(r, nomeCol, makeTemplateCell(templateMap[idVal]))
      applied++
    }
  }
  persistProgrammaticSnapshot({ reload: true })
  notificationStore.show({ type: 'success', message: `Template applicato su ${applied} righe selezionate` })
}

function normalizeSpaces(str) {
  return String(str).replace(/\s+/g, ' ').trim()
}

function normalizeSpacesSheet() {
  showBulkMenu.value = false
  if (!ensureDataLoaded()) return
  const data = getActiveSheetData()
  const protectedCols = getProtectedColumns(data?.[0] || [])
  let changed = 0
  for (let r = 0; r < data.length; r++) {
    const row = data[r]
    if (!row) continue
    for (let c = 0; c < row.length; c++) {
      if (protectedCols.has(c)) continue
      const cell = row[c]
      const text = getCellText(cell)
      if (!text) continue
      const normalized = normalizeSpaces(text)
      if (normalized !== text) {
        setCellValueAndSync(r, c, normalized)
        changed++
      }
    }
  }
  persistProgrammaticSnapshot({ reload: true })
  notificationStore.show({ type: 'success', message: `Normalizzati spazi in ${changed} celle` })
}

function trimTextColumns() {
  showBulkMenu.value = false
  if (!ensureDataLoaded()) return
  const data = getActiveSheetData()
  if (!data || data.length === 0) return
  const protectedCols = getProtectedColumns(data[0] || [])
  let changed = 0
  for (let r = 1; r < data.length; r++) {
    const row = data[r]
    if (!row) continue
    for (let c = 0; c < row.length; c++) {
      if (protectedCols.has(c)) continue
      const raw = getCellText(row[c])
      if (!raw) continue
      const trimmed = raw.trim()
      if (trimmed !== raw) {
        setCellValueAndSync(r, c, trimmed)
        changed++
      }
    }
  }
  persistProgrammaticSnapshot({ reload: true })
  notificationStore.show({ type: 'success', message: `Trim applicato su ${changed} celle testuali` })
}

function parseColumnFilter(headerRow, filter) {
  const f = (filter || '').trim()
  if (!f) return null
  if (/^[A-Za-z]+$/.test(f) && f.length <= 3) {
    let idx = 0
    for (let i = 0; i < f.length; i++) idx = idx * 26 + (f.toUpperCase().charCodeAt(i) - 64)
    return idx - 1
  }
  for (let c = 0; c < headerRow.length; c++) {
    if (getCellText(headerRow[c]).trim().toLowerCase() === f.toLowerCase()) return c
  }
  return null
}

function normalizeHeaderKey(value) {
  return stripTechnicalTextPrefix(String(value ?? ''))
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function detectSmartMergeColumns(sheetData) {
  const rows = Array.isArray(sheetData) ? sheetData : []
  const scanRows = Math.min(6, rows.length)
  for (let r = 0; r < scanRows; r++) {
    const row = rows[r]
    if (!Array.isArray(row)) continue
    const found = { headerRow: r, ordine: -1, cliente: -1, note: -1, corriere: -1 }
    for (let c = 0; c < row.length; c++) {
      const key = normalizeHeaderKey(getCellText(row[c]))
      if (key === 'riferimentoordine' || key.includes('riferimentoordine')) found.ordine = c
      if (key === 'cliente') found.cliente = c
      if (key === 'note') found.note = c
      if (key === 'nomecorriere' || key === 'corriere' || key.includes('corriere')) found.corriere = c
    }
    if (found.ordine !== -1) return found
  }
  return null
}

function ensureCellObject(row, col) {
  const current = row[col]
  if (current && typeof current === 'object') return current
  const text = stripTechnicalTextPrefix(String(current ?? ''))
  const next = { v: text, m: text, w: text }
  row[col] = next
  return next
}

function clearMergesForColumns(sheet, columns) {
  if (!sheet || !Array.isArray(sheet.data) || !Array.isArray(columns) || columns.length === 0) return
  if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
  const mergeCfg = sheet.config.merge && typeof sheet.config.merge === 'object' ? sheet.config.merge : {}

  for (const key of Object.keys(mergeCfg)) {
    const item = mergeCfg[key]
    if (!item || typeof item !== 'object') continue
    if (columns.includes(item.c)) delete mergeCfg[key]
  }
  sheet.config.merge = mergeCfg

  for (let r = 0; r < sheet.data.length; r++) {
    const row = sheet.data[r]
    if (!Array.isArray(row)) continue
    for (const c of columns) {
      const cell = row[c]
      if (!cell || typeof cell !== 'object') continue
      if ('mc' in cell) delete cell.mc
    }
  }
}

function applyVerticalMerge(sheet, col, startRow, endRow) {
  if (!sheet || !Array.isArray(sheet.data)) return
  const rs = endRow - startRow + 1
  if (rs <= 1) return
  if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
  if (!sheet.config.merge || typeof sheet.config.merge !== 'object') sheet.config.merge = {}
  const key = `${startRow}_${col}`
  sheet.config.merge[key] = { r: startRow, c: col, rs, cs: 1 }

  if (!sheet.data[startRow]) sheet.data[startRow] = []
  const topCell = ensureCellObject(sheet.data[startRow], col)
  topCell.mc = { r: startRow, c: col, rs, cs: 1 }

  for (let r = startRow + 1; r <= endRow; r++) {
    if (!sheet.data[r]) sheet.data[r] = []
    const cell = ensureCellObject(sheet.data[r], col)
    cell.mc = { r: startRow, c: col }
  }
}

function getActiveSheetIndex(allSheets) {
  if (!Array.isArray(allSheets) || allSheets.length === 0) return 0
  const idx = Number(spreadsheetStore.activeSheetIndex || 0)
  return idx >= 0 && idx < allSheets.length ? idx : 0
}

function mergeRowsByOrderRef() {
  showBulkMenu.value = false
  if (!ensureDataLoaded()) return

  const allSheets = getCurrentSheets()
  const activeIdx = getActiveSheetIndex(allSheets)
  const sheet = allSheets[activeIdx]
  if (!sheet || !Array.isArray(sheet.data)) return

  const cols = detectSmartMergeColumns(sheet.data)
  if (!cols || cols.ordine === -1) {
    notificationStore.show({ type: 'error', message: 'Colonna Riferimento ordine non trovata.' })
    return
  }

  const mergeCols = [cols.ordine, cols.cliente, cols.note, cols.corriere].filter((c) => c >= 0)
  clearMergesForColumns(sheet, mergeCols)

  let groupStart = -1
  let groupValue = ''
  let mergedGroups = 0

  const startDataRow = cols.headerRow + 1
  for (let r = startDataRow; r <= sheet.data.length; r++) {
    const row = sheet.data[r]
    const value = r < sheet.data.length ? getCellText(row?.[cols.ordine]).trim() : ''
    const normalized = value.toUpperCase()

    if (!groupValue && normalized) {
      groupValue = normalized
      groupStart = r
      continue
    }

    if (normalized === groupValue && normalized) continue

    if (groupValue && groupStart >= 0) {
      const end = r - 1
      if (end > groupStart) {
        mergeCols.forEach((c) => applyVerticalMerge(sheet, c, groupStart, end))
        mergedGroups++
      }
    }

    if (normalized) {
      groupValue = normalized
      groupStart = r
    } else {
      groupValue = ''
      groupStart = -1
    }
  }

  allSheets[activeIdx] = sheet
  reloadGrid(allSheets)
  spreadsheetStore.pushCheckpoint(allSheets)
  notificationStore.show({ type: 'success', message: `Merge smart completato: ${mergedGroups} gruppi uniti` })
}

function unmergeRowsByOrderRef() {
  showBulkMenu.value = false
  if (!ensureDataLoaded()) return

  const allSheets = getCurrentSheets()
  const activeIdx = getActiveSheetIndex(allSheets)
  const sheet = allSheets[activeIdx]
  if (!sheet || !Array.isArray(sheet.data)) return

  const cols = detectSmartMergeColumns(sheet.data)
  if (!cols || cols.ordine === -1) {
    notificationStore.show({ type: 'error', message: 'Colonna Riferimento ordine non trovata.' })
    return
  }

  const mergeCols = [cols.ordine, cols.cliente, cols.note, cols.corriere].filter((c) => c >= 0)
  clearMergesForColumns(sheet, mergeCols)

  allSheets[activeIdx] = sheet
  reloadGrid(allSheets)
  spreadsheetStore.pushCheckpoint(allSheets)
  notificationStore.show({ type: 'success', message: 'Righe unite separate correttamente' })
}

function deleteSelectedRows() {
  showBulkMenu.value = false
  if (!ensureDataLoaded()) return
  const range = spreadsheetStore.selectedRange
  if (!range) {
    notificationStore.show({ type: 'warning', message: 'Seleziona prima una cella o un intervallo di righe.' })
    return
  }
  if (range.rowStart <= 0) {
    notificationStore.show({ type: 'warning', message: 'La riga intestazione non puo essere eliminata.' })
    return
  }

  const activeIdx = getActiveSheetIndex(spreadsheetStore.sheets)
  const sheet = spreadsheetStore.sheets[activeIdx]
  if (!sheet || !Array.isArray(sheet.data)) return
  const start = range.rowStart
  const count = Math.min(range.rowEnd, sheet.data.length - 1) - start + 1
  if (count <= 0) return
  if (!window.confirm(`Eliminare ${count} riga/e da ${start + 1}?`)) return

  spreadsheetStore.deleteRowsAction(activeIdx, start, count)
  spreadsheetStore.setSelectedRange(null)
  reloadGrid(spreadsheetStore.sheets)
  notificationStore.show({ type: 'success', message: `${count} riga/e eliminate.` })
}

function deleteSelectedColumns() {
  showBulkMenu.value = false
  if (!ensureDataLoaded()) return
  const range = spreadsheetStore.selectedRange
  if (!range) {
    notificationStore.show({ type: 'warning', message: 'Seleziona prima una cella o un intervallo di colonne.' })
    return
  }

  const activeIdx = getActiveSheetIndex(spreadsheetStore.sheets)
  const sheet = spreadsheetStore.sheets[activeIdx]
  if (!sheet || !Array.isArray(sheet.data)) return
  const start = range.colStart
  const count = range.colEnd - range.colStart + 1
  const protectedLabels = new Set(['ean', 'id prodotto', 'nome del prodotto'])
  const header = sheet.data[0] || []
  for (let c = start; c < start + count; c++) {
    const label = getCellText(header[c]).trim().toLowerCase()
    if (protectedLabels.has(label)) {
      notificationStore.show({ type: 'warning', message: `Colonna protetta: ${getCellText(header[c]) || columnName(c)}` })
      return
    }
  }
  if (!window.confirm(`Eliminare ${count} colonna/e da ${columnName(start)}?`)) return

  spreadsheetStore.deleteColumnsAction(activeIdx, start, count)
  spreadsheetStore.setSelectedRange(null)
  reloadGrid(spreadsheetStore.sheets)
  notificationStore.show({ type: 'success', message: `${count} colonna/e eliminate.` })
}

function buildMatcher() {
  if (!searchQuery.value) return null
  const flags = searchCase.value ? 'g' : 'gi'
  if (searchRegex.value) return new RegExp(searchQuery.value, flags)
  const escaped = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(escaped, flags)
}

function previewSearch() {
  currentSearchIndex.value = -1
  searchMatches.value = []
  if (!ensureDataLoaded()) return
  const matcher = buildMatcher()
  if (!matcher) return
  const allSheets = getCurrentSheets()
  allSheets.forEach((sheet, sIdx) => {
    const data = sheet.data || []
    const colFilter = parseColumnFilter(data[0] || [], columnFilter.value)
    for (let r = 0; r < data.length; r++) {
      const row = data[r]
      if (!row) continue
      for (let c = 0; c < row.length; c++) {
        if (colFilter !== null && c !== colFilter) continue
        const before = getCellText(row[c])
        if (!before) continue
        matcher.lastIndex = 0
        if (!matcher.test(before)) continue
        matcher.lastIndex = 0
        const after = before.replace(matcher, replaceQuery.value ?? '')
        searchMatches.value.push({ sheet: sIdx, row: r, col: c, before, after })
      }
    }
  })
}

function replaceAllMatches() {
  if (!ensureDataLoaded()) return
  if (searchMatches.value.length === 0) return
  
  const coords = searchMatches.value.map((m) => `${m.sheet}_${m.row}_${m.col}`)
  
  searchMatches.value.forEach((m) => {
    setCellValueAndSync(m.row, m.col, m.after, m.sheet)
  })
  persistProgrammaticSnapshot({ reload: true })
  
  window.dispatchEvent(new CustomEvent('cells-replaced', { detail: { coords } }))
  
  notificationStore.show({ type: 'success', message: `Sostituite ${searchMatches.value.length} occorrenze` })
  showSearchModal.value = false
}

function cellComparableValue(cell) {
  if (cell === undefined || cell === null) return ''
  if (typeof cell !== 'object') return String(cell)
  if (cell.ct && cell.ct.t === 'inlineStr' && Array.isArray(cell.ct.s)) {
    const inline = cell.ct.s
      .map((run) => {
        const boldOpen = isStyleEnabled(run?.bl) ? '<b>' : ''
        const boldClose = isStyleEnabled(run?.bl) ? '</b>' : ''
        const strikeOpen = isStyleEnabled(run?.cl) ? '<s>' : ''
        const strikeClose = isStyleEnabled(run?.cl) ? '</s>' : ''
        return `${boldOpen}${strikeOpen}${stripTechnicalTextPrefix(String(run?.v ?? ''))}${strikeClose}${boldClose}`
      })
      .join('')
    const styleSig = `|BL:${isStyleEnabled(cell?.bl) ? 1 : 0}|IT:${isStyleEnabled(cell?.it) ? 1 : 0}|UN:${isStyleEnabled(cell?.un) ? 1 : 0}|CL:${isStyleEnabled(cell?.cl) ? 1 : 0}`
    return inline + styleSig
  }
  const text = getCellText(cell)
  const styleSig = `|BL:${isStyleEnabled(cell?.bl) ? 1 : 0}|IT:${isStyleEnabled(cell?.it) ? 1 : 0}|UN:${isStyleEnabled(cell?.un) ? 1 : 0}|CL:${isStyleEnabled(cell?.cl) ? 1 : 0}`
  return text + styleSig
}

function styleSummary(cell) {
  const f = extractStyleFlags(cell)
  const tags = []
  if (f.bold) tags.push('B')
  if (f.italic) tags.push('I')
  if (f.underline) tags.push('U')
  if (f.strike) tags.push('S')
  return tags.length > 0 ? tags.join(' ') : 'normale'
}

function cellDisplayText(cell) {
  return getCellText(cell)
}

function cellRichTextSignature(cell) {
  if (!cell || typeof cell !== 'object') return ''
  if (cell.ct && cell.ct.t === 'inlineStr' && Array.isArray(cell.ct.s)) {
    return cell.ct.s
      .map((run) => `${stripTechnicalTextPrefix(String(run?.v ?? ''))}:${isStyleEnabled(run?.bl) ? 'B' : '-'}`)
      .join('|')
  }
  if (Array.isArray(cell.richText)) {
    return cell.richText
      .map((run) => `${stripTechnicalTextPrefix(String(run?.text ?? ''))}:${run?.font?.bold ? 'B' : '-'}`)
      .join('|')
  }
  return ''
}

function cellExportSignature(cell) {
  const text = cellDisplayText(cell)
  const rich = cellRichTextSignature(cell)
  return rich ? `${text}|RICH:${rich}` : text
}

function textFromComparableSignature(value) {
  const raw = String(value ?? '')
  const idx = raw.indexOf('|BL:')
  const body = idx >= 0 ? raw.slice(0, idx) : raw
  return body.replace(/<\/?b>/g, '').replace(/<\/?s>/g, '')
}

function styleFromComparableSignature(value) {
  const raw = String(value ?? '')
  const tags = []
  if (/\|BL:1/.test(raw)) tags.push('B')
  if (/\|IT:1/.test(raw)) tags.push('I')
  if (/\|UN:1/.test(raw)) tags.push('U')
  if (/\|CL:1/.test(raw)) tags.push('S')
  return tags.length > 0 ? tags.join(' ') : 'normale'
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function diffHtml(baseText, compareText, chunkClass = 'diff-chunk') {
  const a = String(baseText ?? '')
  const b = String(compareText ?? '')
  if (a === b) return escapeHtml(compareText)

  let start = 0
  const minLen = Math.min(a.length, b.length)
  while (start < minLen && a[start] === b[start]) start++

  let endA = a.length - 1
  let endB = b.length - 1
  while (endA >= start && endB >= start && a[endA] === b[endB]) {
    endA--
    endB--
  }

  const left = b.slice(0, start)
  const changed = b.slice(start, endB + 1)
  const right = b.slice(endB + 1)
  const changedHtml = changed
    ? `<span class="${chunkClass}">${escapeHtml(changed)}</span>`
    : ''
  return `${escapeHtml(left)}${changedHtml}${escapeHtml(right)}`
}

function extractStyleFlags(cell, comparable = '') {
  const fromComparable = String(comparable || '')
  const fallback = {
    bold: /\|BL:1/.test(fromComparable),
    italic: /\|IT:1/.test(fromComparable),
    underline: /\|UN:1/.test(fromComparable),
    strike: /\|CL:1/.test(fromComparable),
  }
  if (!cell || typeof cell !== 'object') return fallback

  let runBold = false
  let runItalic = false
  let runUnderline = false
  let runStrike = false
  if (cell.ct && cell.ct.t === 'inlineStr' && Array.isArray(cell.ct.s)) {
    runBold = cell.ct.s.some((run) => isStyleEnabled(run?.bl))
    runItalic = cell.ct.s.some((run) => isStyleEnabled(run?.it))
    runUnderline = cell.ct.s.some((run) => isStyleEnabled(run?.un))
    runStrike = cell.ct.s.some((run) => isStyleEnabled(run?.cl))
  }

  return {
    bold: isStyleEnabled(cell.bl) || runBold || fallback.bold,
    italic: isStyleEnabled(cell.it) || runItalic || fallback.italic,
    underline: isStyleEnabled(cell.un) || runUnderline || fallback.underline,
    strike: isStyleEnabled(cell.cl) || runStrike || fallback.strike,
  }
}

function detectStyleOnlyChange(beforeText, afterText, beforeFlags, afterFlags) {
  const sameText = String(beforeText ?? '') === String(afterText ?? '')
  if (!sameText) return ''
  const sameBold = beforeFlags.bold === afterFlags.bold
  const sameItalic = beforeFlags.italic === afterFlags.italic
  const sameUnderline = beforeFlags.underline === afterFlags.underline
  const sameStrike = beforeFlags.strike === afterFlags.strike
  const styleChanged = !(sameBold && sameItalic && sameUnderline && sameStrike)
  if (!styleChanged) return ''
  if (!sameBold && sameItalic && sameUnderline && sameStrike) return 'Solo grassetto cambiato'
  if (sameBold && !sameItalic && sameUnderline && sameStrike) return 'Solo corsivo cambiato'
  if (sameBold && sameItalic && !sameUnderline && sameStrike) return 'Solo sottolineato cambiato'
  if (sameBold && sameItalic && sameUnderline && !sameStrike) return 'Solo barrato cambiato'
  return 'È cambiato solo lo stile del testo'
}

function cellsEqualForExport(a, b) {
  return cellExportSignature(a) === cellExportSignature(b)
}

function sheetToDataMatrix(sheet) {
  if (Array.isArray(sheet?.data) && sheet.data.length > 0) return sheet.data
  if (!Array.isArray(sheet?.celldata) || sheet.celldata.length === 0) return []
  const matrix = []
  sheet.celldata.forEach((item) => {
    if (!item || !Number.isInteger(item.r) || !Number.isInteger(item.c)) return
    if (!Array.isArray(matrix[item.r])) matrix[item.r] = []
    matrix[item.r][item.c] = item.v
  })
  return matrix
}

function buildExportPatches(currentSheets, originalSheets) {
  const patches = []
  const baseOriginalSheets = applyStructureChangesToSheets(originalSheets, spreadsheetStore.structureChanges)
  const maxSheets = Math.max(currentSheets.length, baseOriginalSheets.length)
  for (let s = 0; s < maxSheets; s++) {
    const currSheet = currentSheets[s]
    if (!currSheet) continue
    const origSheet = baseOriginalSheets[s] || { data: [] }
    const currData = sheetToDataMatrix(currSheet)
    const origData = sheetToDataMatrix(origSheet)
    const protectedCols = getProtectedColumns(currData[0] || origData[0] || [])
    const cells = []

    const rows = Math.max(currData.length, origData.length)
    for (let r = 0; r < rows; r++) {
      const currRow = currData[r] || []
      const origRow = origData[r] || []
      const cols = Math.max(currRow.length, origRow.length)
      for (let c = 0; c < cols; c++) {
        if (protectedCols.has(c)) continue
        const currCell = currRow[c]
        const origCell = origRow[c]
        if (!cellsEqualForExport(currCell, origCell)) {
          cells.push({ r, c, cell: currCell ?? null })
        }
      }
    }

    if (cells.length > 0) {
      patches.push({
        name: currSheet.name,
        index: currSheet.index,
        cells,
      })
    }
  }
  return patches
}

function normalizeMergeConfig(sheet) {
  const merge = sheet?.config?.merge
  if (!merge || typeof merge !== 'object') return []
  return Object.values(merge)
    .filter((m) => m && Number.isInteger(m.r) && Number.isInteger(m.c) && Number.isInteger(m.rs) && Number.isInteger(m.cs))
    .map((m) => ({ r: m.r, c: m.c, rs: m.rs, cs: m.cs }))
    .filter((m) => m.rs > 0 && m.cs > 0)
    .sort((a, b) => (a.r - b.r) || (a.c - b.c) || (a.rs - b.rs) || (a.cs - b.cs))
}

function buildMergePatches(currentSheets, originalSheets) {
  const patches = []
  const baseOriginalSheets = applyStructureChangesToSheets(originalSheets, spreadsheetStore.structureChanges)
  const structureSheets = new Set(normalizeStructureChanges(spreadsheetStore.structureChanges).map((change) => Number(change.sheetIndex || 0)))
  const maxSheets = Math.max(currentSheets.length, baseOriginalSheets.length)
  for (let s = 0; s < maxSheets; s++) {
    const currSheet = currentSheets[s]
    if (!currSheet) continue
    const currentMerges = normalizeMergeConfig(currSheet)
    const originalMerges = normalizeMergeConfig(baseOriginalSheets[s] || {})
    if (!structureSheets.has(s) && JSON.stringify(currentMerges) === JSON.stringify(originalMerges)) continue
    patches.push({
      name: currSheet.name,
      index: currSheet.index,
      merges: currentMerges,
    })
  }
  return patches
}

function getSheetColumnCount(sheet, data) {
  const configured = Number(sheet?.column || 0)
  const dataCols = (data || []).reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0)
  const widthConfig = {
    ...(sheet?.config?.columnWidthsPx || {}),
    ...(sheet?.config?.manualColumnWidthsPx || {}),
  }
  const storedCols = Object.keys(widthConfig).reduce((max, key) => {
    const idx = Number.parseInt(key, 10)
    return Number.isInteger(idx) ? Math.max(max, idx + 1) : max
  }, 0)
  return Math.max(configured, dataCols, storedCols, 0)
}

function computeSheetColumnWidths(sheet) {
  const data = sheetToDataMatrix(sheet || {})
  const colCount = getSheetColumnCount(sheet, data)
  const widths = Array.from({ length: colCount }, (_, col) => measureTextWidth(columnName(col)) + 28)

  for (let r = 0; r < data.length; r++) {
    const row = data[r]
    if (!Array.isArray(row)) continue
    for (let c = 0; c < colCount; c++) {
      const text = getCellText(row[c])
      if (!text) continue
      const merge = row[c]?.mc
      const divisor = merge?.rs && merge?.cs && merge.r === r && merge.c === c ? Math.max(1, Number(merge.cs || 1)) : 1
      widths[c] = Math.max(widths[c], Math.ceil(measureTextWidth(text) / divisor) + 18)
    }
  }

  const stored = sheet?.config?.columnWidthsPx || {}
  const manual = sheet?.config?.manualColumnWidthsPx || {}
  return widths.map((width, col) => {
    if (Number.isFinite(manual[col])) return clampColumnWidth(manual[col])
    return clampColumnWidth(width)
  })
}

function buildColumnWidthPatches(currentSheets, originalSheets) {
  const patches = []
  const baseOriginalSheets = applyStructureChangesToSheets(originalSheets, spreadsheetStore.structureChanges)
  const maxSheets = Math.max(currentSheets.length, baseOriginalSheets.length)
  for (let s = 0; s < maxSheets; s++) {
    const currSheet = currentSheets[s]
    if (!currSheet) continue
    const currentWidths = computeSheetColumnWidths(currSheet)
    const originalWidths = baseOriginalSheets[s]?.config?.columnWidthsPx || {}
    const columns = []

    currentWidths.forEach((widthPx, c) => {
      const originalWidth = Number(originalWidths[c])
      if (!Number.isFinite(originalWidth) || Math.abs(clampColumnWidth(widthPx) - originalWidth) > 1) {
        columns.push({ c, widthPx: clampColumnWidth(widthPx) })
      }
    })

    if (columns.length > 0) {
      patches.push({
        name: currSheet.name,
        index: currSheet.index,
        columns,
      })
    }
  }
  return patches
}

function buildDiffGroups(items) {
  const groups = new Map()
  items.forEach((item) => {
    let key = ''
    let label = ''
    if (item.changeKind === 'merge') {
      key = `${item.sheet}:merge`
      label = `${item.sheet}: unioni celle`
    } else if (item.changeKind === 'width') {
      key = `${item.sheet}:width`
      label = `${item.sheet}: larghezze colonne`
    } else if (item.changeKind === 'structure') {
      key = `${item.sheet}:structure`
      label = `${item.sheet}: struttura`
    } else {
      key = `${item.sheet}:col:${item.col}`
      label = `${item.sheet}: ${item.colLabel || `Col ${item.col}`}`
    }
    const current = groups.get(key) || { label, count: 0 }
    current.count += item.groupCount || 1
    groups.set(key, current)
  })
  return Array.from(groups.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

function applyColumnWidthPatchesToSheets(sheets, columnPatches) {
  if (!Array.isArray(sheets) || !Array.isArray(columnPatches)) return
  columnPatches.forEach((patch) => {
    let sheet = sheets.find((item) => item?.name === patch.name)
    if (!sheet && Number.isInteger(Number(patch.index))) sheet = sheets[Number(patch.index)]
    if (!sheet || !Array.isArray(patch.columns)) return
    if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
    sheet.config.columnWidthsPx = {
      ...(sheet.config.columnWidthsPx || {}),
    }
    sheet.config.manualColumnWidthsPx = {
      ...(sheet.config.manualColumnWidthsPx || {}),
    }
    patch.columns.forEach((column) => {
      if (!Number.isInteger(column?.c)) return
      sheet.config.columnWidthsPx[column.c] = clampColumnWidth(column.widthPx)
      sheet.config.manualColumnWidthsPx[column.c] = clampColumnWidth(column.widthPx)
    })
  })
}

function buildDiffSummary(currentSheets, originalSheets) {
  const result = []
  const structureChanges = normalizeStructureChanges(spreadsheetStore.structureChanges)
  const baseOriginalSheets = applyStructureChangesToSheets(originalSheets, structureChanges)
  structureChanges.forEach((change) => {
    result.push({
      sheet: currentSheets[change.sheetIndex]?.name || originalSheets[change.sheetIndex]?.name || `Sheet${Number(change.sheetIndex || 0) + 1}`,
      row: change.type === 'deleteRows' ? `${change.index + 1}${change.count > 1 ? `-${change.index + change.count}` : ''}` : '-',
      col: change.type === 'deleteColumns' ? `${columnName(change.index)}${change.count > 1 ? `-${columnName(change.index + change.count - 1)}` : ''}` : '-',
      before: describeStructureChange(change, originalSheets),
      after: 'eliminata',
      beforeText: describeStructureChange(change, originalSheets),
      afterText: 'eliminata',
      beforeHtml: describeStructureChange(change, originalSheets),
      afterHtml: 'eliminata',
      beforeStyle: 'struttura',
      afterStyle: 'struttura',
      changeNote: change.type === 'deleteRows' ? 'Righe eliminate' : 'Colonne eliminate',
      changeKind: 'structure',
      groupCount: change.count,
    })
  })

  const maxSheets = Math.max(currentSheets.length, baseOriginalSheets.length)
  for (let s = 0; s < maxSheets; s++) {
    const curr = sheetToDataMatrix(currentSheets[s] || {})
    const orig = sheetToDataMatrix(baseOriginalSheets[s] || {})
    const protectedCols = getProtectedColumns(curr[0] || orig[0] || [])
    const rows = Math.max(curr.length, orig.length)
    for (let r = 0; r < rows; r++) {
      const currRow = curr[r] || []
      const origRow = orig[r] || []
      const cols = Math.max(currRow.length, origRow.length)
      for (let c = 0; c < cols; c++) {
        if (protectedCols.has(c)) continue
        const before = cellComparableValue(origRow[c])
        const after = cellComparableValue(currRow[c])
        const beforeTextRaw = cellDisplayText(origRow[c])
        const afterTextRaw = cellDisplayText(currRow[c])
        if (cellExportSignature(origRow[c]) !== cellExportSignature(currRow[c])) {
          const header = getCellText((curr[0] || orig[0] || [])[c]).trim()
          const beforeFlags = extractStyleFlags(origRow[c], before)
          const afterFlags = extractStyleFlags(currRow[c], after)
          const beforeStyleRaw = styleSummary(origRow[c]) || styleFromComparableSignature(before)
          const afterStyleRaw = styleSummary(currRow[c]) || styleFromComparableSignature(after)
          const beforeText = beforeTextRaw || textFromComparableSignature(before)
          const afterText = afterTextRaw || textFromComparableSignature(after)
          result.push({
            sheet: currentSheets[s]?.name || `Sheet${s + 1}`,
            row: r + 1,
            col: c + 1,
            colLabel: header || `Col ${c + 1}`,
            changeKind: 'cell',
            before,
            after,
            beforeText,
            afterText,
            beforeHtml: diffHtml(afterText, beforeText, 'diff-removed'),
            afterHtml: diffHtml(beforeText, afterText, 'diff-added'),
            beforeStyle: beforeStyleRaw || styleFromComparableSignature(before),
            afterStyle: afterStyleRaw || styleFromComparableSignature(after),
            changeNote: detectStyleOnlyChange(beforeText, afterText, beforeFlags, afterFlags),
          })
        }
      }
    }

    const currentMerges = normalizeMergeConfig(currentSheets[s] || {})
    const originalMerges = normalizeMergeConfig(baseOriginalSheets[s] || {})
    if (JSON.stringify(currentMerges) !== JSON.stringify(originalMerges)) {
      result.push({
        sheet: currentSheets[s]?.name || `Sheet${s + 1}`,
        row: '-',
        col: '-',
        before: `${originalMerges.length} merge`,
        after: `${currentMerges.length} merge`,
        beforeText: `${originalMerges.length} merge`,
        afterText: `${currentMerges.length} merge`,
        beforeHtml: `${originalMerges.length} merge`,
        afterHtml: `${currentMerges.length} merge`,
        beforeStyle: 'struttura',
        afterStyle: 'struttura',
        changeNote: 'Unioni celle modificate',
        changeKind: 'merge',
      })
    }
  }

  buildColumnWidthPatches(currentSheets, originalSheets).forEach((patch) => {
    result.push({
      sheet: patch.name || `Sheet${Number(patch.index || 0) + 1}`,
      row: '-',
      col: '-',
      before: 'larghezze originali',
      after: `${patch.columns.length} colonne aggiornate`,
      beforeText: 'larghezze originali',
      afterText: `${patch.columns.length} colonne aggiornate`,
      beforeHtml: 'larghezze originali',
      afterHtml: `${patch.columns.length} colonne aggiornate`,
      beforeStyle: 'struttura',
      afterStyle: 'struttura',
      changeNote: 'Larghezze colonne aggiornate',
      changeKind: 'width',
      groupCount: patch.columns.length,
    })
  })

  return { total: result.length, items: result, groups: buildDiffGroups(result) }
}

function openExportDiffModal() {
  if (!ensureDataLoaded()) return
  selectedGroup.value = null
  const currentSheets = getCurrentSheets()
  const originalSheets = spreadsheetStore.originalSheets || []
  diffSummary.value = buildDiffSummary(currentSheets, originalSheets)
  if (!spreadsheetStore.showExportSummary) {
    confirmExport()
    return
  }
  compareOnlyMode.value = false
  showDiffModal.value = true
}

function openCompareOriginalModal() {
  showBulkMenu.value = false
  if (!ensureDataLoaded()) return
  selectedGroup.value = null
  const originalSheets = spreadsheetStore.originalSheets || []
  if (!Array.isArray(originalSheets) || originalSheets.length === 0) {
    notificationStore.show({ type: 'warning', message: 'File originale non disponibile per il confronto.' })
    return
  }
  const currentSheets = getCurrentSheets()
  diffSummary.value = buildDiffSummary(currentSheets, originalSheets)
  compareOnlyMode.value = true
  showDiffModal.value = true
}

async function requestExportSaveHandle(filename) {
  if (!window.showSaveFilePicker) return null
  try {
    return await window.showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: 'File Excel',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          },
        },
      ],
    })
  } catch (err) {
    if (err?.name === 'AbortError') return false
    throw err
  }
}

async function saveExportBlob(blob, filename, fileHandle) {
  if (fileHandle) {
    const writable = await fileHandle.createWritable()
    await writable.write(blob)
    await writable.close()
    return fileHandle.name || filename
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return filename
}

async function confirmExport() {
  if (!ensureDataLoaded()) return
  exporting.value = true
  showDiffModal.value = false
  operationText.value = 'Export in corso...'
  try {
    const cleanSheets = getCurrentSheets()
    const originalSheets = spreadsheetStore.originalSheets || []
    const patches = buildExportPatches(cleanSheets, originalSheets)
    const mergePatches = buildMergePatches(cleanSheets, originalSheets)
    const columnPatches = buildColumnWidthPatches(cleanSheets, originalSheets)
    const structureChanges = normalizeStructureChanges(spreadsheetStore.structureChanges)
    if (patches.length === 0 && mergePatches.length === 0 && columnPatches.length === 0 && structureChanges.length === 0) {
      notificationStore.show({ type: 'info', message: 'Nessuna modifica da esportare.' })
      return
    }
    const outFilename = spreadsheetStore.computeExportFilename(spreadsheetStore.filename || 'export.xlsx')
    const fileHandle = spreadsheetStore.askExportSaveLocation
      ? await requestExportSaveHandle(outFilename)
      : null
    if (fileHandle === false) return
    const response = await api.post(
      '/xlsx/export',
      {
        filename: outFilename,
        patches,
        merges: mergePatches,
        columns: columnPatches,
        structure: structureChanges,
        backup: {
          enabled: spreadsheetStore.backupEnabled,
          limit: spreadsheetStore.backupLimit,
        },
      },
      { responseType: 'blob' }
    )
    const savedFilename = await saveExportBlob(response.data, outFilename, fileHandle)
    applyColumnWidthPatchesToSheets(cleanSheets, columnPatches)
    spreadsheetStore.markExported(cleanSheets)
    spreadsheetStore.refreshExportFilename()
    notificationStore.show({ type: 'success', message: `File esportato: ${savedFilename}` })
  } catch {
  } finally {
    operationText.value = ''
    exporting.value = false
  }
}

async function generatePicking() {
  if (!ensureDataLoaded() || picking.value) return

  picking.value = true
  operationText.value = 'Generazione picking...'
  try {
    const cleanSheets = getCurrentSheets()
    const originalSheets = spreadsheetStore.originalSheets || []
    const patches = buildExportPatches(cleanSheets, originalSheets)
    const mergePatches = buildMergePatches(cleanSheets, originalSheets)
    const columnPatches = buildColumnWidthPatches(cleanSheets, originalSheets)
    const structureChanges = normalizeStructureChanges(spreadsheetStore.structureChanges)
    const outFilename = spreadsheetStore.computeExportFilename(spreadsheetStore.filename || 'export.xlsx')

    const response = await api.post('/xlsx/export', {
      filename: outFilename,
      patches,
      merges: mergePatches,
      columns: columnPatches,
      structure: structureChanges,
      backup: { enabled: false },
    }, { responseType: 'blob' })

    const form = new FormData()
    form.append('file', response.data, outFilename)
    operationText.value = 'Upload picking...'
    const result = await api.post('/picking/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90_000,
    })

    notificationStore.show({
      type: 'success',
      message: result.data?.summary?.importedOrders != null
        ? `Picking generato: ${result.data.summary.importedOrders} ordini importati`
        : 'Picking generato e inviato a PickCSV',
    })
    window.open('https://pick.iosonofra.click/', '_blank', 'noopener,noreferrer')
  } catch {
    // L'interceptor API mostra già il messaggio restituito dal server.
  } finally {
    operationText.value = ''
    picking.value = false
  }
}

function undoAction() {
  if (!spreadsheetStore.undo()) return
  reloadGrid(spreadsheetStore.sheets)
  notificationStore.show({ type: 'info', message: 'Modifica annullata' })
}

function redoAction() {
  if (!spreadsheetStore.redo()) return
  reloadGrid(spreadsheetStore.sheets)
  notificationStore.show({ type: 'info', message: 'Modifica ripristinata' })
}

function toggleBulkMenu() {
  showCourierMenu.value = false
  showNoteMenu.value = false
  showBulkMenu.value = !showBulkMenu.value
}

function toggleCourierMenu() {
  showBulkMenu.value = false
  showNoteMenu.value = false
  showCourierMenu.value = !showCourierMenu.value
}

function toggleNoteMenu() {
  showBulkMenu.value = false
  showCourierMenu.value = false
  showNoteMenu.value = !showNoteMenu.value
}

function applyCourierPreset(preset) {
  showCourierMenu.value = false
  if (!ensureDataLoaded()) return
  const data = getActiveSheetData()
  const target = detectCourierColumn(data)
  if (!target) {
    notificationStore.show({ type: 'error', message: 'Colonna Nome corriere non trovata.' })
    return
  }
  let changed = 0
  for (let r = target.headerRow + 1; r < data.length; r++) {
    const currentText = getCellText(data[r]?.[target.col]).trim()
    if (!currentText) continue
    setCellValueAndSync(r, target.col, String(preset))
    changed++
  }
  persistProgrammaticSnapshot({ reload: true })
  notificationStore.show({ type: 'success', message: `Corriere "${preset}" applicato su ${changed} righe` })
}

function applyNotePreset(preset) {
  showNoteMenu.value = false
  if (!ensureDataLoaded()) return
  const data = getActiveSheetData()
  let target = null
  for (let r = 0; r < Math.min(6, data.length) && !target; r++) {
    const row = data[r]
    if (!Array.isArray(row)) continue
    for (let c = 0; c < row.length; c++) {
      const key = normalizeHeaderKey(getCellText(row[c]))
      if (key === 'note' || key === 'notes') { target = { headerRow: r, col: c }; break }
    }
  }
  if (!target) {
    notificationStore.show({ type: 'error', message: 'Colonna Note non trovata.' })
    return
  }
  let changed = 0
  for (let r = target.headerRow + 1; r < data.length; r++) {
    if (!getCellText(data[r]?.[target.col]).trim()) continue
    setCellValueAndSync(r, target.col, String(preset))
    changed++
  }
  persistProgrammaticSnapshot({ reload: true })
  notificationStore.show({ type: 'success', message: `Nota "${preset}" applicata su ${changed} righe` })
}

function goToNoteSettings() {
  showNoteMenu.value = false
  router.push({ path: '/settings', query: { tab: 'notes' } })
}

function goToSettings() {
  showCourierMenu.value = false
  router.push('/settings')
}

async function saveCurrentCellAsTemplate() {
  if (!ensureDataLoaded()) return
  try {
    const activeRange = getSelectionRange()
    if (!activeRange) {
      notificationStore.show({ type: 'warning', message: 'Seleziona prima una cella della riga da mappare.' })
      return
    }
    const data = getActiveSheetData()
    if (!data || data.length === 0) return
    const r = activeRange.rowStart
    const rowData = data[r]
    if (!rowData) return
    const { nomeCol, idCol } = detectHeaderColumns(data)
    if (nomeCol === -1 || idCol === -1) {
      notificationStore.show({ type: 'error', message: 'Colonne prodotto non trovate in questo file' })
      return
    }
    const idVal = getCellText(rowData[idCol]).trim()
    if (!idVal) {
      notificationStore.show({ type: 'warning', message: 'La riga selezionata non ha un ID prodotto valido' })
      return
    }
    const nameVal = getCellText(rowData[nomeCol]).trim()
    if (!nameVal) {
      notificationStore.show({ type: 'warning', message: 'Il nome prodotto e vuoto' })
      return
    }
    if (templateStore.templates.length === 0) await templateStore.fetchAll()
    const existing = templateStore.templates.find((t) => String(t.id).trim() === idVal)
    if (existing) await templateStore.update(idVal, nameVal)
    else await templateStore.create(idVal, nameVal)
    notificationStore.show({ type: 'success', message: `Mappato in rubrica: ${idVal}` })
  } catch (err) {
    notificationStore.show({ type: 'error', message: `Errore salvataggio template: ${err.message}` })
  }
}
</script>

<style scoped>
.toolbar {
  height: var(--toolbar-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  gap: 10px;
  flex-shrink: 0;
}
.toolbar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }

/* Toolbar Group Container */
.toolbar-group {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 1px;
  transition: border-color var(--transition), background var(--transition);
}

:root[data-theme='light'] .toolbar-group {
  background: rgba(0, 0, 0, 0.015);
  border-color: var(--border);
}

.group-divider {
  width: 1px;
  height: 16px;
  background-color: var(--border);
  opacity: 0.6;
  align-self: center;
}

/* Override .btn styling inside a group to merge them together */
.toolbar-group .btn {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 6px 12px;
  box-shadow: none !important;
}

.toolbar-group .btn:hover:not(:disabled) {
  background: var(--bg-hover) !important;
  color: var(--accent) !important;
  transform: none; /* No translation inside group to keep it stable */
}

/* Smooth active feedback inside group */
.toolbar-group .btn:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.06) !important;
  transform: scale(0.97);
}

:root[data-theme='light'] .toolbar-group .btn:active:not(:disabled) {
  background: rgba(0, 0, 0, 0.04) !important;
}

/* Keep rounded corners on extreme buttons of the group */
.toolbar-group > *:first-child,
.toolbar-group > *:first-child .btn {
  border-top-left-radius: calc(var(--radius-md) - 2px) !important;
  border-bottom-left-radius: calc(var(--radius-md) - 2px) !important;
}

.toolbar-group > *:last-child,
.toolbar-group > *:last-child .btn,
.toolbar-group > .bulk-wrap:last-child .btn {
  border-top-right-radius: calc(var(--radius-md) - 2px) !important;
  border-bottom-right-radius: calc(var(--radius-md) - 2px) !important;
}

.status-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(92, 141, 246, 0.14);
  color: #dbe7ff;
}

.stats-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}
.stats-ok { background: var(--success-light); color: var(--success); }
.stats-warn { background: var(--warning-light); color: var(--warning); }



.bulk-wrap { position: relative; }
.bulk-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 250px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  z-index: 50;
  padding: 6px 0;
  animation: dropdownFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top left;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.bulk-menu-divider {
  height: 1px;
  background-color: var(--border);
  margin: 6px 0;
}

.bulk-item {
  width: 100%;
  text-align: left;
  padding: 8px 14px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition);
}
.bulk-item:hover {
  background: var(--bg-hover);
  color: var(--accent) !important;
}

.bulk-item-danger {
  color: var(--danger) !important;
}
.bulk-item-danger .bulk-icon {
  color: var(--danger);
}
.bulk-item-danger:hover {
  background: var(--danger-light);
  color: var(--danger) !important;
}
.bulk-item-danger:hover .bulk-icon {
  color: var(--danger) !important;
}

.bulk-icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  color: var(--text-muted);
  fill: none;
  stroke: currentColor;
  stroke-width: 2.0;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: color var(--transition);
}
.bulk-item:hover .bulk-icon { color: var(--accent); }

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  background: var(--bg-card);
  width: 90%;
  max-width: 620px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: 86vh;
}
.modal-wide { max-width: 1350px; width: 96%; }
.modal-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 { font-size: 16px; margin: 0; }
.modal-body { padding: 14px 16px; overflow-y: auto; }
.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.search-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr auto auto auto auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}
.ck { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; }
.preview-head { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
.diff-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.diff-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
}
.diff-group:hover {
  background: var(--bg-hover);
  border-color: var(--text-muted);
}
.diff-group.active {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
}
.diff-group-title {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.diff-group-count {
  min-width: 22px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 600;
  text-align: center;
}
.preview-list {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  max-height: 600px;
  overflow: auto;
}
.preview-row {
  display: grid;
  grid-template-columns: 180px 1fr 24px 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-light);
  font-size: 12px;
  transition: background var(--transition);
}
.preview-row:last-child { border-bottom: none; }
.preview-row.active {
  background: var(--accent-light) !important;
  border-left: 3px solid var(--accent);
}
.diff-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.diff-sheet {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.diff-coord {
  color: var(--text-muted);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.diff-val {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono, monospace);
  font-size: 11.5px;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.45;
  max-height: 100px;
  overflow-y: auto;
}
.diff-before {
  background: rgba(239, 68, 68, 0.04);
  border: 1px dashed rgba(239, 68, 68, 0.15);
}
.diff-after {
  background: rgba(34, 197, 94, 0.04);
  border: 1px dashed rgba(34, 197, 94, 0.15);
}
.diff-arrow {
  text-align: center;
  color: var(--text-muted);
  font-weight: bold;
}
.preview-header-row {
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 10;
  border-bottom: 1px solid var(--border) !important;
  font-weight: 600;
  color: var(--text-secondary);
}
.diff-header-col {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.diff-note-inline {
  margin-top: 4px;
  font-size: 10px;
  color: #b45309;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 4px;
  padding: 2px 6px;
  width: fit-content;
  font-weight: 500;
  white-space: normal;
  line-height: 1.2;
}

.compare-card {
  border-bottom: 1px solid var(--border-light);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compare-card:last-child {
  border-bottom: none;
}

.compare-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.compare-note {
  font-size: 12px;
  color: #b45309;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 8px;
  padding: 4px 8px;
  width: fit-content;
}

.compare-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.compare-col {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px;
  min-height: 72px;
}

.compare-before {
  background: rgba(239, 68, 68, 0.06);
}

.compare-after {
  background: rgba(34, 197, 94, 0.06);
}

.compare-label {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
}

.compare-text {
  font-size: 12px;
  line-height: 1.35;
  word-break: break-word;
}

.compare-style {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-muted);
}

:deep(.diff-chunk) {
  text-decoration: none;
}

:deep(.diff-removed) {
  color: #b91c1c;
  background: rgba(220, 38, 38, 0.15);
  text-decoration: none;
  border-radius: 4px;
  padding: 2px 4px;
  font-weight: 500;
}

:deep(.diff-added) {
  color: #166534;
  background: rgba(22, 163, 74, 0.15);
  text-decoration: none;
  border-radius: 4px;
  padding: 2px 4px;
  font-weight: 500;
}

.compare-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.missing-body p { color: var(--text-secondary); font-size: 13px; margin-bottom: 12px; }
.missing-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.missing-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
}
.missing-info { margin-bottom: 8px; }
.missing-info code {
  color: var(--warning);
  font-weight: 600;
  background: rgba(255,165,0,0.1);
  padding: 2px 6px;
  border-radius: 4px;
}
.current-name { color: var(--text-muted); font-size: 12px; margin-left: 6px; }
.quick-add-row { display: flex; gap: 6px; align-items: center; }
.quick-add-input { flex: 1; padding: 5px 10px; font-size: 12px; }
.btn-sm { padding: 5px 10px; font-size: 13px; }
.btn-bold {
  width: 30px;
  min-width: 30px;
  padding: 5px 0;
  line-height: 1;
}
.quick-add-preview {
  margin-top: 6px;
  padding: 6px 8px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 12px;
  line-height: 1.35;
  word-break: break-word;
}
.quick-add-done { color: var(--success); font-size: 12px; font-weight: 500; }
.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.suggestion-label {
  color: var(--text-muted);
  font-size: 11px;
}
.suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 260px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.suggestion-chip span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.suggestion-chip small {
  color: var(--accent);
  font-weight: 600;
}
.suggestion-chip:hover {
  border-color: rgba(92, 141, 246, 0.45);
  background: var(--accent-light);
}

.unsaved-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  background-color: var(--warning);
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  box-shadow: 0 0 5px rgba(245, 158, 11, 0.5);
}
</style>

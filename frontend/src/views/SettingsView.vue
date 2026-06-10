<template>
  <div class="catalog-view">
    <!-- Hero Header Card -->
    <div class="catalog-header">
      <div class="catalog-hero-card">
        <div class="hero-left">
          <div class="hero-icon-wrap">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="hero-copy">
            <h1 class="hero-title">Catalogo prodotti</h1>
            <p class="hero-desc">
              Mappa gli ID Prestashop ai nomi corretti. Puoi esportare il catalogo in CSV/JSON o ripristinarlo caricando un file di backup.
            </p>
          </div>
        </div>
        <div class="hero-stat" v-if="templateStore.templates.length > 0">
          <span class="stat-number">{{ templateStore.templates.length }}</span>
          <span class="stat-label">template</span>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="catalog-actions-bar">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="search"
            type="text"
            class="search-input"
            placeholder="Cerca per ID o nome prodotto..."
          />
          <button v-if="search" class="search-clear-btn" @click="search = ''" title="Azzera ricerca">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="actions-right">
          <div class="export-dropdown" v-if="templateStore.templates.length > 0">
            <button class="btn btn-secondary" @click="showExportMenu = !showExportMenu">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Esporta
            </button>
            <Transition name="dropdown-anim">
              <div v-if="showExportMenu" class="dropdown-menu">
                <button class="dropdown-item" @click="doExport('csv')">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Esporta CSV
                </button>
                <button class="dropdown-item" @click="doExport('json')">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                  </svg>
                  Esporta JSON
                </button>
              </div>
            </Transition>
          </div>

          <button class="btn btn-secondary btn-maintenance" @click="showCleaner = true" title="Analizza la salute del catalogo e risolvi errori o duplicati">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Manutenzione
            <span v-if="hasIssues" class="alert-badge-dot"></span>
          </button>

          <button class="btn btn-secondary" id="btn-import-templates" @click="showImport = true" title="Carica o ripristina un catalogo da backup CSV/JSON">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Importa
          </button>
          <button class="btn btn-primary" id="btn-add-template" @click="startAddRow">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Aggiungi
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="filters-row" v-if="templateStore.templates.length > 0">
        <div class="filter-chips">
          <button
            class="filter-chip"
            :class="{ active: currentFilter === 'all' }"
            @click="currentFilter = 'all'"
          >
            Tutti
            <span class="chip-count">{{ templateStore.templates.length }}</span>
          </button>
          <button
            class="filter-chip"
            :class="{ active: currentFilter === 'issues' }"
            @click="currentFilter = 'issues'"
          >
            Con anomalie
            <span class="chip-count count-danger" v-if="totalIssuesCount > 0">{{ totalIssuesCount }}</span>
            <span class="chip-count" v-else>0</span>
          </button>
          <button
            class="filter-chip"
            :class="{ active: currentFilter === 'modified' }"
            @click="currentFilter = 'modified'"
          >
            Modificati
            <span class="chip-count count-success" v-if="modifiedSessionIds.length > 0">{{ modifiedSessionIds.length }}</span>
            <span class="chip-count" v-else>0</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="catalog-table-card" v-if="filteredTemplates.length > 0 || addingRow">
      <table class="catalog-table">
        <thead>
          <tr>
            <th class="col-checkbox">
              <input
                type="checkbox"
                :checked="isAllPageSelected"
                :indeterminate="isSomePageSelected && !isAllPageSelected"
                @change="toggleSelectAllPage"
              />
            </th>
            <th class="col-id">ID prodotto</th>
            <th class="col-name">Nome corretto</th>
            <th class="col-actions">Azioni</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="table-list">
          <!-- Add New Row (animated) -->
          <Transition name="row-slide" key="new-row-transition">
            <tr v-if="addingRow" class="new-row" key="new-row-tr">
              <td class="col-checkbox"></td>
              <td class="col-id">
                <input
                  ref="newIdInput"
                  v-model="newRow.id"
                  class="inline-input"
                  placeholder="es. 601530"
                  @keyup.enter="saveNewRow"
                  @keyup.escape="addingRow = false"
                />
              </td>
              <td class="col-name">
                <div class="edit-row-wrapper">
                  <div class="edit-row">
                    <input
                      id="input-new-name"
                      v-model="newRow.name"
                      class="inline-input"
                      placeholder="Nome corretto del prodotto"
                      @keyup.enter="saveNewRow"
                      @keyup.escape="addingRow = false"
                    />
                    <button class="catalog-action-btn edit" @mousedown.prevent @click="makeBold('input-new-name', 'newRow')" title="Grassetto">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                      </svg>
                    </button>
                  </div>
                  <!-- Visual Bold Editor Preview -->
                  <div class="visual-bold-editor" v-if="newRow.name">
                    <span class="editor-label">Modifica rapida (fai click sulle parole):</span>
                    <div class="word-preview-container">
                      <template v-for="(tok, idx) in tokenize(newRow.name)" :key="idx">
                        <span
                          v-if="tok.isWord"
                          class="word-token"
                          :class="{ 'is-bold': tok.bold }"
                          @click="togglePreviewWord('newRow', idx)"
                        >{{ tok.text }}</span>
                        <span v-else class="space-token">{{ tok.text }}</span>
                      </template>
                    </div>
                  </div>
                  <!-- Inline Confirm Actions -->
                  <div class="editor-actions">
                    <button class="btn btn-success compact-btn" @click="saveNewRow">Salva modifiche</button>
                    <button class="btn btn-secondary compact-btn" @click="addingRow = false">Annulla</button>
                  </div>
                </div>
              </td>
              <td class="col-actions"></td>
            </tr>
          </Transition>

          <!-- Data Rows -->
          <tr v-for="t in paginatedTemplates" :key="t.id" class="data-row" :class="{ 'row-has-anomalies': templateIssuesMap[t.id], 'row-is-modified': modifiedSessionIds.includes(t.id), 'row-is-selected': selectedIds.includes(t.id) }">
            <td class="col-checkbox">
              <input
                type="checkbox"
                :value="t.id"
                v-model="selectedIds"
              />
            </td>
            <td class="col-id">
              <span class="id-badge" v-html="highlightText(t.id, search)"></span>
            </td>
            <td class="col-name">
              <div v-if="editingId === t.id" class="edit-row-wrapper">
                <div class="edit-row">
                  <input
                    :id="'edit-name-' + t.id"
                    v-model="editingName"
                    class="inline-input"
                    @keyup.enter="saveEdit(t)"
                    @keyup.escape="cancelEdit"
                  />
                  <button class="catalog-action-btn edit" @mousedown.prevent @click="makeBold('edit-name-' + t.id, 'editingName')" title="Grassetto">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                    </svg>
                  </button>
                </div>
                <!-- Visual Bold Editor Preview -->
                <div class="visual-bold-editor" v-if="editingName">
                  <span class="editor-label">Modifica rapida (fai click sulle parole):</span>
                  <div class="word-preview-container">
                    <template v-for="(tok, idx) in tokenize(editingName)" :key="idx">
                      <span
                        v-if="tok.isWord"
                        class="word-token"
                        :class="{ 'is-bold': tok.bold }"
                        @click="togglePreviewWord('editingName', idx)"
                      >{{ tok.text }}</span>
                      <span v-else class="space-token">{{ tok.text }}</span>
                    </template>
                  </div>
                </div>
                <!-- Inline Confirm Actions -->
                <div class="editor-actions">
                  <button class="btn btn-success compact-btn" @click="saveEdit(t)">Salva modifiche</button>
                  <button class="btn btn-secondary compact-btn" @click="cancelEdit">Annulla</button>
                </div>
              </div>
              <div v-else class="name-display-wrapper" @dblclick="startEdit(t)" title="Doppio clic per modificare rapidamente">
                <span class="name-text" v-html="highlightText(t.name, search)"></span>
                <!-- Anomaly Warning Icon with Tooltip -->
                <div class="anomaly-warning-wrapper" v-if="templateIssuesMap[t.id]">
                  <svg class="anomaly-warning-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div class="anomaly-tooltip">
                    <div class="tooltip-title">Anomalie rilevate:</div>
                    <ul class="tooltip-list">
                      <li v-for="(issue, idx) in templateIssuesMap[t.id]" :key="idx">{{ issue }}</li>
                    </ul>
                  </div>
                </div>
                <!-- Modified Badge -->
                <span class="session-modified-badge" v-if="modifiedSessionIds.includes(t.id)">Modificato</span>
              </div>
            </td>
            <td class="col-actions">
              <div class="action-btns-hover" v-if="editingId !== t.id">
                <button class="catalog-action-btn edit" :id="`btn-edit-${t.id}`" @click="startEdit(t)" title="Modifica">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="catalog-action-btn delete" :id="`btn-del-${t.id}`" @click="confirmDelete(t)" title="Elimina">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </TransitionGroup>
      </table>

      <!-- Pagination -->
      <div class="pagination-bar">
        <div class="pagination-left">
          <span class="pagination-range">
            Mostra {{ rangeStart }}–{{ rangeEnd }} di {{ filteredTemplates.length }}
          </span>
          <div class="pagination-density" v-if="filteredTemplates.length > 0">
            <span class="density-label">Elementi per pagina:</span>
            <select v-model="itemsPerPage" class="density-select">
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
              <option :value="250">250</option>
              <option :value="10000">Tutti</option>
            </select>
          </div>
        </div>
        <div class="pagination-controls" v-if="totalPages > 1">
          <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--" title="Pagina precedente">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span class="pagination-page">{{ currentPage }} / {{ totalPages }}</span>
          <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++" title="Pagina successiva">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="catalog-empty-state" v-else-if="!addingRow">
      <div class="empty-icon-wrap">
        <svg v-if="search" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="8" x2="14" y2="14" stroke-width="1.5"/><line x1="14" y1="8" x2="8" y2="14" stroke-width="1.5"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <p class="empty-title" v-if="search">Nessun risultato per "<em>{{ search }}</em>"</p>
      <p class="empty-title" v-else>Nessun template nel catalogo</p>
      <p class="empty-subtitle" v-if="search">Prova con un termine diverso oppure azzera il filtro.</p>
      <p class="empty-subtitle" v-else>Aggiungi il primo elemento per iniziare a costruire il tuo catalogo prodotti.</p>
      <div class="empty-actions">
        <button v-if="search" class="btn btn-secondary" @click="search = ''">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Azzera ricerca
        </button>
        <button v-else class="btn btn-primary" @click="startAddRow">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Aggiungi primo template
        </button>
      </div>
    </div>

    <!-- Floating Bulk Actions Bar -->
    <Transition name="slide-up">
      <div class="bulk-actions-bar" v-if="selectedIds.length > 0">
        <div class="bulk-info">
          <span class="bulk-count">{{ selectedIds.length }}</span>
          <span class="bulk-label">selezionati</span>
        </div>
        <div class="bulk-actions">
          <div class="bulk-export-wrapper">
            <button class="btn btn-secondary compact-btn" @click="showBulkExportMenu = !showBulkExportMenu">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Esporta selezionati
            </button>
            <Transition name="dropdown-anim">
              <div v-if="showBulkExportMenu" class="bulk-export-menu">
                <button class="dropdown-item" @click="exportSelected('csv')">CSV</button>
                <button class="dropdown-item" @click="exportSelected('json')">JSON</button>
              </div>
            </Transition>
          </div>
          <button class="btn btn-danger compact-btn" @click="deleteSelected">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            Elimina
          </button>
          <button class="bulk-cancel-btn" @click="selectedIds = []">Annulla</button>
        </div>
      </div>
    </Transition>

    <ImportModal v-if="showImport" @close="showImport = false" @imported="templateStore.fetchAll()" />
    <CleanerModal v-if="showCleaner" @close="showCleaner = false" @cleaned="templateStore.fetchAll()" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import ImportModal from '../components/ImportModal.vue'
import CleanerModal from '../components/CleanerModal.vue'
import { useTemplateStore } from '../stores/templates.js'
import { useNotificationStore } from '../stores/notification.js'

const templateStore = useTemplateStore()
const notificationStore = useNotificationStore()

const search = ref('')
const showImport = ref(false)
const showCleaner = ref(false)
const showExportMenu = ref(false)
const editingId = ref(null)
const editingName = ref('')
const addingRow = ref(false)
const newRow = ref({ id: '', name: '' })
const newIdInput = ref(null)

const currentFilter = ref('all')
const modifiedSessionIds = ref([])

const selectedIds = ref([])
const showBulkExportMenu = ref(false)

const templateIssuesMap = computed(() => {
  const templates = templateStore.templates
  const namesMap = {}
  const issues = {}

  for (const t of templates) {
    const key = String(t.name || '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .trim()
    if (key) {
      if (!namesMap[key]) {
        namesMap[key] = []
      }
      namesMap[key].push(t.id)
    }
  }

  for (const t of templates) {
    const localIssues = []
    
    const key = String(t.name || '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .trim()
    if (key && namesMap[key] && namesMap[key].length > 1) {
      localIssues.push('Nome duplicato nel catalogo')
    }

    const openCount = (t.name.match(/<b>/gi) || []).length
    const closeCount = (t.name.match(/<\/b>/gi) || []).length
    if (openCount !== closeCount) {
      localIssues.push('Tag <b> sbilanciati (apertura/chiusura)')
    } else if (/<b>\s*<\/b>/gi.test(t.name)) {
      localIssues.push('Tag <b> vuoto')
    }

    if (t.name !== t.name.trim() || /\s{2,}/g.test(t.name)) {
      localIssues.push('Spazi non normalizzati (multipli, iniziali o finali)')
    }

    if (t.id !== t.id.trim() || /\s/g.test(t.id) || !t.id) {
      localIssues.push('ID non valido (contiene spazi o è vuoto)')
    }

    if (localIssues.length > 0) {
      issues[t.id] = localIssues
    }
  }
  return issues
})

const hasIssues = computed(() => Object.keys(templateIssuesMap.value).length > 0)
const totalIssuesCount = computed(() => Object.keys(templateIssuesMap.value).length)

onMounted(() => templateStore.fetchAll())

const filteredTemplates = computed(() => {
  let list = templateStore.templates
  
  if (currentFilter.value === 'issues') {
    list = list.filter(t => templateIssuesMap.value[t.id])
  } else if (currentFilter.value === 'modified') {
    list = list.filter(t => modifiedSessionIds.value.includes(t.id))
  }
  
  const q = search.value.toLowerCase().trim()
  if (!q) return list
  
  return list.filter(
    (t) => t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
  )
})

const isAllPageSelected = computed(() => {
  const pageIds = paginatedTemplates.value.map(t => t.id)
  if (pageIds.length === 0) return false
  return pageIds.every(id => selectedIds.value.includes(id))
})

const isSomePageSelected = computed(() => {
  const pageIds = paginatedTemplates.value.map(t => t.id)
  return pageIds.some(id => selectedIds.value.includes(id))
})

function toggleSelectAllPage() {
  const pageIds = paginatedTemplates.value.map(t => t.id)
  if (isAllPageSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !pageIds.includes(id))
  } else {
    const toAdd = pageIds.filter(id => !selectedIds.value.includes(id))
    selectedIds.value.push(...toAdd)
  }
}

watch([search, currentFilter], () => {
  selectedIds.value = []
})

const currentPage = ref(1)
const itemsPerPage = ref(50)

const totalPages = computed(() => Math.ceil(filteredTemplates.value.length / itemsPerPage.value) || 1)

const rangeStart = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1)
const rangeEnd = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredTemplates.value.length))

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTemplates.value.slice(start, start + itemsPerPage.value)
})

watch([search, () => templateStore.templates.length, currentFilter, itemsPerPage], () => {
  currentPage.value = 1
})

function startEdit(t) {
  editingId.value = t.id
  editingName.value = t.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

function highlightText(text, query) {
  if (!text) return ''
  if (!query) return text
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  
  const parts = String(text).split(/(<\/?[^>]+>)/g)
  return parts.map(part => {
    if (part.startsWith('<') && part.endsWith('>')) {
      return part
    }
    return part.replace(regex, '<mark class="search-highlight">$1</mark>')
  }).join('')
}

function exportSelected(format) {
  showBulkExportMenu.value = false
  const selectedTemplates = templateStore.templates.filter(t => selectedIds.value.includes(t.id))
  if (selectedTemplates.length === 0) return

  if (format === 'json') {
    const content = JSON.stringify(selectedTemplates, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `templates_selezionati.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    let csvContent = 'ID prodotto,Nome corretto\n'
    for (const t of selectedTemplates) {
      const cleanedName = t.name.replace(/"/g, '""')
      csvContent += `"${t.id}","${cleanedName}"\n`
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `templates_selezionati.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  notificationStore.show({ type: 'success', message: `${selectedTemplates.length} template esportati` })
}

async function deleteSelected() {
  if (!window.confirm(`Eliminare i ${selectedIds.value.length} template selezionati?`)) return
  try {
    await Promise.all(selectedIds.value.map(id => templateStore.remove(id)))
    notificationStore.show({ type: 'success', message: `${selectedIds.value.length} template eliminati` })
    selectedIds.value = []
  } catch {}
}

function makeBold(inputId, target) {
  const el = document.getElementById(inputId)
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const val = el.value || ''
  if (start === end) {
    notificationStore.show({ type: 'warning', message: 'Seleziona prima una parola da mettere in grassetto' })
    return
  }
  
  const selectedText = val.slice(start, end)
  let result
  if (selectedText.startsWith('<b>') && selectedText.endsWith('</b>')) {
    result = `${val.slice(0, start)}${selectedText.slice(3, -4)}${val.slice(end)}`
  } else {
    result = `${val.slice(0, start)}<b>${selectedText}</b>${val.slice(end)}`
  }

  if (target === 'newRow') newRow.value.name = result
  if (target === 'editingName') editingName.value = result
}

function tokenize(text) {
  const str = text || ''
  const parts = str.split(/(<b>|<\/b>)/i)
  const tokens = []
  let isBold = false
  
  for (const part of parts) {
    if (part.toLowerCase() === '<b>') {
      isBold = true
    } else if (part.toLowerCase() === '</b>') {
      isBold = false
    } else if (part) {
      const innerRegex = /(\s+|[^\s\w\dÀ-ÿ]+|[\w\dÀ-ÿ]+)/g
      let match
      while ((match = innerRegex.exec(part)) !== null) {
        const tokenText = match[0]
        const isWord = /[\w\dÀ-ÿ]+/.test(tokenText)
        tokens.push({
          text: tokenText,
          bold: isBold,
          isWord
        })
      }
    }
  }
  return tokens
}

function cleanTokens(tokens) {
  for (let i = 1; i < tokens.length - 1; i++) {
    if (!tokens[i].isWord) {
      if (tokens[i - 1].bold && tokens[i + 1].bold) {
        tokens[i].bold = true
      }
    }
  }
}

function rebuildText(tokens) {
  let result = ''
  let inBold = false
  for (const token of tokens) {
    if (token.bold) {
      if (!inBold) {
        result += '<b>'
        inBold = true
      }
      result += token.text
    } else {
      if (inBold) {
        result += '</b>'
        inBold = false
      }
      result += token.text
    }
  }
  if (inBold) {
    result += '</b>'
  }
  return result
}

function togglePreviewWord(target, idx) {
  let val = ''
  if (target === 'newRow') val = newRow.value.name
  if (target === 'editingName') val = editingName.value
  
  const tokens = tokenize(val)
  if (idx < 0 || idx >= tokens.length) return
  if (!tokens[idx].isWord) return
  
  tokens[idx].bold = !tokens[idx].bold
  cleanTokens(tokens)
  
  const result = rebuildText(tokens)
  if (target === 'newRow') newRow.value.name = result
  if (target === 'editingName') editingName.value = result
}


async function saveEdit(t) {
  if (!editingName.value.trim()) return
  try {
    await templateStore.update(t.id, editingName.value.trim())
    notificationStore.show({ type: 'success', message: `Template ${t.id} aggiornato` })
    if (!modifiedSessionIds.value.includes(t.id)) {
      modifiedSessionIds.value.push(t.id)
    }
    cancelEdit()
  } catch {}
}

function startAddRow() {
  addingRow.value = true
  newRow.value = { id: '', name: '' }
  nextTick(() => {
    newIdInput.value?.focus()
  })
}

async function saveNewRow() {
  const id = newRow.value.id.trim()
  const name = newRow.value.name.trim()
  if (!id || !name) {
    notificationStore.show({ type: 'error', message: 'ID e nome sono obbligatori' })
    return
  }
  try {
    await templateStore.create(id, name)
    notificationStore.show({ type: 'success', message: `Template ${id} aggiunto` })
    if (!modifiedSessionIds.value.includes(id)) {
      modifiedSessionIds.value.push(id)
    }
    addingRow.value = false
  } catch {}
}

async function confirmDelete(t) {
  if (!window.confirm(`Eliminare il template ID ${t.id}?\n"${t.name}"`)) return
  try {
    await templateStore.remove(t.id)
    notificationStore.show({ type: 'success', message: `Template ${t.id} eliminato` })
  } catch {}
}

async function doExport(format) {
  showExportMenu.value = false
  try {
    await templateStore.exportAll(format)
    notificationStore.show({ type: 'success', message: `Template esportati in ${format.toUpperCase()}` })
  } catch {}
}
</script>

<style scoped>
.catalog-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 24px 32px;
  gap: 20px;
  max-width: 1300px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

/* Background glow */
.catalog-view::before {
  content: '';
  position: absolute;
  top: -10%;
  right: -5%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(92, 141, 246, 0.06) 0%, rgba(92, 141, 246, 0) 70%);
  pointer-events: none;
  z-index: 0;
}

/* ========== Hero Header ========== */
.catalog-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 2;
}

.catalog-hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 26px 32px;
  background: rgba(27, 32, 48, 0.45);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  z-index: 2;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

:root[data-theme='light'] .catalog-hero-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-left: 4px solid var(--accent);
  box-shadow: 0 8px 25px rgba(55, 104, 214, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.catalog-hero-card::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(92, 141, 246, 0.06) 0%, rgba(92, 141, 246, 0) 70%);
  pointer-events: none;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.hero-icon-wrap {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(92, 141, 246, 0.12);
  border-radius: var(--radius-md);
  color: var(--accent);
  box-shadow: 0 4px 10px rgba(92, 141, 246, 0.05);
}

.hero-copy {
  min-width: 0;
}

.hero-title {
  font-size: 20px;
  font-weight: 750;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, var(--text-primary) 50%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

:root[data-theme='light'] .hero-title {
  background: none;
  -webkit-text-fill-color: initial;
}

.hero-desc {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 580px;
}

.hero-stat {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 22px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:root[data-theme='light'] .hero-stat {
  background: #ffffff;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

.hero-stat:hover {
  transform: translateY(-2px);
  border-color: rgba(92, 141, 246, 0.25);
  box-shadow: 0 4px 12px rgba(92, 141, 246, 0.05);
}

.stat-number {
  font-size: 24px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -0.04em;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ========== Actions Bar ========== */
.catalog-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: 2;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-grow: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  pointer-events: none;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

:root[data-theme='light'] .search-input {
  background: #ffffff;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

.search-input:focus {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 0 0 3px rgba(92, 141, 246, 0.15);
}

:root[data-theme='light'] .search-input:focus {
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(55, 104, 214, 0.15);
}

.search-input:focus ~ .search-icon,
.search-wrapper:focus-within .search-icon {
  color: var(--accent);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-clear-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.search-clear-btn:hover {
  color: var(--danger);
  background: var(--danger-light);
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-maintenance {
  position: relative;
}

.btn-maintenance:hover {
  background: var(--accent-light);
  color: var(--accent);
  border-color: var(--accent);
}

.alert-badge-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border: 1.5px solid var(--bg-card);
  border-radius: 50%;
  animation: pulse-alert 2s infinite;
}

@keyframes pulse-alert {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

/* ========== Export Dropdown ========== */
.export-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 180px;
  overflow: hidden;
  background: rgba(27, 32, 48, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  z-index: 50;
  padding: 4px;
}

:root[data-theme='light'] .dropdown-menu {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 25px rgba(17, 24, 39, 0.08);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dropdown-item:hover {
  background: var(--bg-hover);
  color: var(--accent);
  padding-left: 18px;
}

.dropdown-item svg {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: color 0.18s ease;
}

.dropdown-item:hover svg {
  color: var(--accent);
}

.dropdown-anim-enter-active {
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-anim-leave-active {
  transition: all 0.12s ease;
}
.dropdown-anim-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}
.dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ========== Table Card ========== */
.catalog-table-card {
  display: flex;
  flex-direction: column;
  background: rgba(27, 32, 48, 0.45);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  min-height: 0;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

:root[data-theme='light'] .catalog-table-card {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(0, 0, 0, 0.06);
  box-shadow: 0 10px 25px rgba(17, 24, 39, 0.03);
}

.catalog-table {
  width: 100%;
  border-collapse: collapse;
  flex: 1;
}

.catalog-table thead {
  position: sticky;
  top: 0;
  z-index: 5;
}

.catalog-table th {
  padding: 14px 18px;
  background: rgba(21, 25, 38, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  text-align: left;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  user-select: none;
}

:root[data-theme='light'] .catalog-table th {
  background: rgba(241, 245, 249, 0.95);
  border-color: var(--border);
}

.catalog-table td {
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-primary);
  font-size: 13.5px;
  vertical-align: middle;
  transition: all 0.2s ease;
}

.catalog-table tr:last-child td {
  border-bottom: none;
}

.col-id { width: 140px; }
.col-actions { width: 110px; text-align: right; }
.col-actions .action-btns-hover,
.col-actions .action-btns-always {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  align-items: center;
}

/* ========== Row Hover ========== */
.data-row {
  transition: background-color 0.25s ease;
}

.data-row:hover {
  background: rgba(255, 255, 255, 0.025);
}

:root[data-theme='light'] .data-row:hover {
  background: rgba(0, 0, 0, 0.015);
}

.data-row:hover .name-text {
  color: var(--text-hover);
}

/* ========== Inline Action Buttons (show on hover) ========== */
.action-btns-hover {
  opacity: 0;
  transform: translateX(4px);
  transition: opacity 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.data-row:hover .action-btns-hover,
.action-btns-hover:focus-within {
  opacity: 1;
  transform: translateX(0);
}

.catalog-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.catalog-action-btn.edit:hover {
  background: var(--accent-light);
  color: var(--accent);
  border-color: rgba(92, 141, 246, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(92, 141, 246, 0.15);
}

.catalog-action-btn.delete:hover {
  background: var(--danger-light);
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.15);
  transform: translateY(-2px);
  box-shadow: var(--shadow-danger-glow);
}

.catalog-action-btn:active {
  transform: scale(0.92) translateY(0);
  transition-duration: 0.08s;
}

/* ========== ID Badge ========== */
.id-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--accent-light);
  color: var(--accent);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.name-text {
  color: var(--text-primary);
  transition: color 0.18s ease;
}

/* ========== Inline Edit Row ========== */
.edit-row-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.edit-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.visual-bold-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: rgba(15, 17, 23, 0.4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-top: 8px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

:root[data-theme='light'] .visual-bold-editor {
  background: rgba(0, 0, 0, 0.015);
}

.editor-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.2px;
}

.word-preview-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-top: 4px;
  border: 1px solid var(--border);
}

.word-token {
  display: inline-block;
  cursor: pointer;
  padding: 5px 12px;
  margin: 3px 2px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-secondary);
  font-size: 11.5px;
  font-weight: 550;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
}

:root[data-theme='light'] .word-token {
  background: #ffffff;
}

.word-token:hover {
  background: var(--bg-hover);
  color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-1.5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.word-token.is-bold, :root[data-theme='light'] .word-token.is-bold {
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(92, 141, 246, 0.25);
}

:root[data-theme='light'] .word-token.is-bold {
  color: #ffffff;
}

.word-token.is-bold:hover {
  background: var(--accent-hover);
  transform: translateY(-1.5px);
  box-shadow: 0 4px 12px rgba(92, 141, 246, 0.35);
}

.space-token {
  white-space: pre-wrap;
  display: inline-block;
}

.inline-input {
  width: 100%;
  padding: 9px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13.5px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:root[data-theme='light'] .inline-input {
  background: #ffffff;
}

.inline-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(92, 141, 246, 0.15);
  background: rgba(255, 255, 255, 0.03);
}

:root[data-theme='light'] .inline-input:focus {
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(55, 104, 214, 0.15);
}

.compact-btn {
  padding: 6px 14px;
  font-size: 11.5px;
  border-radius: var(--radius-sm);
}

/* ========== New Row (Animated) ========== */
.new-row td {
  background: rgba(92, 141, 246, 0.06);
  border-bottom-color: rgba(92, 141, 246, 0.15);
}

.new-row td:first-child {
  border-left: 3px solid var(--accent);
}

.row-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.row-slide-leave-active {
  transition: all 0.2s ease;
}
.row-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.row-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ========== Pagination ========== */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  background: rgba(21, 25, 38, 0.6);
  flex-shrink: 0;
  gap: 16px;
}

:root[data-theme='light'] .pagination-bar {
  background: rgba(241, 245, 249, 0.6);
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.pagination-range {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.pagination-density {
  display: flex;
  align-items: center;
  gap: 10px;
}

.density-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.density-select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 24px 4px 10px;
  outline: none;
  cursor: pointer;
  transition: all 0.25s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238893a8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 10px;
}

.density-select:hover,
.density-select:focus {
  border-color: var(--accent);
  color: var(--accent);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235c8df6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-page {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 650;
  min-width: 60px;
  text-align: center;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent-light);
  color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(92, 141, 246, 0.1);
}

.pagination-btn:active {
  transform: scale(0.92);
  transition-duration: 0.08s;
}

.pagination-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none !important;
}

/* ========== Empty State ========== */
.catalog-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 70px 24px;
  background: rgba(27, 32, 48, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

:root[data-theme='light'] .catalog-empty-state {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(0, 0, 0, 0.06);
}

.empty-icon-wrap {
  color: var(--border);
  opacity: 0.85;
  margin-bottom: 4px;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

.empty-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  max-width: 380px;
  line-height: 1.5;
}

.empty-actions {
  margin-top: 10px;
}

/* ========== Filters & Search Highlight ========== */
.filters-row {
  margin-top: 4px;
  display: flex;
  align-items: center;
}

.filter-chips {
  display: flex;
  gap: 10px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  outline: none;
}

:root[data-theme='light'] .filter-chip {
  background: #ffffff;
}

.filter-chip:hover {
  background: rgba(92, 141, 246, 0.08);
  color: var(--accent);
  border-color: rgba(92, 141, 246, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15), 0 0 10px rgba(92, 141, 246, 0.05);
}

:root[data-theme='light'] .filter-chip:hover {
  background: var(--accent-light);
  color: var(--accent);
  border-color: rgba(55, 104, 214, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(55, 104, 214, 0.08);
}

.filter-chip.active, :root[data-theme='light'] .filter-chip.active {
  background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(92, 141, 246, 0.2);
}

.filter-chip.active:hover, :root[data-theme='light'] .filter-chip.active:hover {
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.08) contrast(1.05);
}

.filter-chip.active:hover {
  box-shadow: 0 6px 20px rgba(92, 141, 246, 0.35);
}

:root[data-theme='light'] .filter-chip.active:hover {
  box-shadow: 0 6px 18px rgba(55, 104, 214, 0.35);
}


.chip-count {
  font-size: 10.5px;
  font-weight: 700;
  padding: 1.5px 6.5px;
  border-radius: 10px;
  background: var(--border-light);
  color: var(--text-muted);
  font-family: 'SF Mono', monospace;
  transition: all 0.2s ease;
}

.filter-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.chip-count.count-danger {
  background: var(--danger-light);
  color: var(--danger);
}

.filter-chip.active .chip-count.count-danger {
  background: var(--danger);
  color: #ffffff;
}

.chip-count.count-success {
  background: var(--success-light);
  color: var(--success);
}

.filter-chip.active .chip-count.count-success {
  background: var(--success);
  color: #ffffff;
}

.search-highlight {
  background: rgba(92, 141, 246, 0.28);
  color: inherit;
  border-radius: 3px;
  padding: 0 2px;
  box-shadow: 0 0 4px rgba(92, 141, 246, 0.2);
}

:root[data-theme='light'] .search-highlight {
  background: rgba(55, 104, 214, 0.18);
  font-weight: 600;
}

/* ========== Name Display & Anomalies ========== */
.name-display-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.anomaly-warning-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--warning);
  cursor: help;
}

.anomaly-warning-icon {
  stroke: var(--warning);
  fill: var(--warning-light);
  animation: pulse-warn 2s infinite;
}

@keyframes pulse-warn {
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

.anomaly-tooltip {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: rgba(27, 32, 48, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 100;
  width: 270px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:root[data-theme='light'] .anomaly-tooltip {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 25px rgba(17, 24, 39, 0.1);
}

.anomaly-warning-wrapper:hover .anomaly-tooltip {
  opacity: 1;
  pointer-events: all;
  transform: translateX(-50%) translateY(0);
}

.tooltip-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--warning);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tooltip-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-list li {
  font-size: 11.5px;
  color: var(--text-primary);
  line-height: 1.45;
  position: relative;
  padding-left: 10px;
}

.tooltip-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--warning);
}

/* ========== Session Modified Badge ========== */
.session-modified-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--success);
  background: var(--success-light);
  border: 1px solid rgba(34, 197, 94, 0.15);
  padding: 2px 7px;
  border-radius: 10px;
}

/* Custom row highlights */
.row-has-anomalies {
  background: rgba(245, 158, 11, 0.035) !important;
}

:root[data-theme='light'] .row-has-anomalies {
  background: rgba(245, 158, 11, 0.02) !important;
}

.row-is-modified {
  position: relative;
}

.row-is-modified td:first-of-type {
  border-left: 3.5px solid var(--success);
}

/* ========== Checkbox Column & Selections ========== */
.col-checkbox {
  width: 48px;
  text-align: center;
  user-select: none;
}

.catalog-table th.col-checkbox,
.catalog-table td.col-checkbox {
  padding: 10px 8px;
  text-align: center;
}

.catalog-table input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.row-is-selected {
  background: rgba(92, 141, 246, 0.06) !important;
}

.row-is-selected:hover {
  background: rgba(92, 141, 246, 0.09) !important;
}

/* ========== Floating Bulk Actions Bar ========== */
.bulk-actions-bar {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 28px;
  background: linear-gradient(135deg, rgba(27, 32, 48, 0.85) 0%, rgba(15, 19, 30, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45), 0 0 25px rgba(92, 141, 246, 0.15);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  z-index: 1000;
  width: min(680px, calc(100vw - 32px));
}

:root[data-theme='light'] .bulk-actions-bar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(244, 247, 252, 0.96) 100%);
  border: 1px solid rgba(55, 104, 214, 0.15);
  box-shadow: 0 12px 35px rgba(55, 104, 214, 0.15), 0 0 20px rgba(55, 104, 214, 0.05);
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bulk-count {
  font-size: 13.5px;
  font-weight: 800;
  color: #ffffff;
  background: var(--accent);
  padding: 3px 9px;
  border-radius: 12px;
  font-family: 'SF Mono', monospace;
  box-shadow: var(--shadow-accent-glow);
}

.bulk-label {
  font-size: 12.5px;
  font-weight: 650;
  color: var(--text-primary);
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bulk-export-wrapper {
  position: relative;
}

.bulk-export-menu {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  min-width: 130px;
  overflow: hidden;
  background: rgba(27, 32, 48, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 1050;
  display: flex;
  flex-direction: column;
  padding: 4px;
}

:root[data-theme='light'] .bulk-export-menu {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 25px rgba(17, 24, 39, 0.1);
}

.bulk-cancel-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.bulk-cancel-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

/* ========== Transitions ========== */
.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px) scale(0.97);
}

.editor-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

/* ========== Table Row Transitions ========== */
.table-list-enter-active,
.table-list-leave-active {
  transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.table-list-enter-from,
.table-list-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.table-list-move {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.name-display-wrapper {
  cursor: pointer;
  transition: background-color 0.16s ease;
}

.name-display-wrapper:hover .name-text {
  text-decoration: underline rgba(92, 141, 246, 0.3) 1.5px;
}
</style>
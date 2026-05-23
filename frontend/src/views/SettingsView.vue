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
    </div>

    <!-- Table Card -->
    <div class="catalog-table-card" v-if="filteredTemplates.length > 0 || addingRow">
      <table class="catalog-table">
        <thead>
          <tr>
            <th class="col-id">ID prodotto</th>
            <th class="col-name">Nome corretto</th>
            <th class="col-actions">Azioni</th>
          </tr>
        </thead>
        <tbody>
          <!-- Add New Row (animated) -->
          <Transition name="row-slide">
            <tr v-if="addingRow" class="new-row">
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
                </div>
              </td>
              <td class="col-actions">
                <div class="action-btns-always">
                  <button class="btn btn-success compact-btn" @click="saveNewRow">Salva</button>
                  <button class="catalog-action-btn delete" @click="addingRow = false" title="Annulla">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </Transition>

          <!-- Data Rows -->
          <tr v-for="t in paginatedTemplates" :key="t.id" class="data-row">
            <td class="col-id">
              <span class="id-badge">{{ t.id }}</span>
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
              </div>
              <span v-else class="name-text" v-html="t.name"></span>
            </td>
            <td class="col-actions">
              <div class="action-btns-always" v-if="editingId === t.id">
                <button class="btn btn-success compact-btn" @click="saveEdit(t)">Salva</button>
                <button class="catalog-action-btn delete" @click="cancelEdit" title="Annulla">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="action-btns-hover" v-else>
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
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-bar">
        <span class="pagination-range">
          Mostra {{ rangeStart }}–{{ rangeEnd }} di {{ filteredTemplates.length }}
        </span>
        <div class="pagination-controls">
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

const hasIssues = computed(() => {
  const templates = templateStore.templates
  const namesMap = {}
  let issues = 0
  for (const t of templates) {
    const key = String(t.name || '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .trim()
    if (key) {
      if (namesMap[key]) {
        issues++
      } else {
        namesMap[key] = true
      }
    }
    const openCount = (t.name.match(/<b>/gi) || []).length
    const closeCount = (t.name.match(/<\/b>/gi) || []).length
    if (openCount !== closeCount || /<b>\s*<\/b>/gi.test(t.name)) {
      issues++
    }
    if (t.name !== t.name.trim() || /\s{2,}/g.test(t.name)) {
      issues++
    }
    if (t.id !== t.id.trim() || /\s/g.test(t.id) || !t.id) {
      issues++
    }
  }
  return issues > 0
})

onMounted(() => templateStore.fetchAll())

const filteredTemplates = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return templateStore.templates
  return templateStore.templates.filter(
    (t) => t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
  )
})

const currentPage = ref(1)
const itemsPerPage = 50

const totalPages = computed(() => Math.ceil(filteredTemplates.value.length / itemsPerPage) || 1)

const rangeStart = computed(() => (currentPage.value - 1) * itemsPerPage + 1)
const rangeEnd = computed(() => Math.min(currentPage.value * itemsPerPage, filteredTemplates.value.length))

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTemplates.value.slice(start, start + itemsPerPage)
})

watch([search, () => templateStore.templates.length], () => {
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
  padding: 20px 24px;
  gap: 16px;
}

/* ========== Hero Header ========== */
.catalog-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.catalog-hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.hero-icon-wrap {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-light);
  border-radius: var(--radius-md);
  color: var(--accent);
}

.hero-copy {
  min-width: 0;
}

.hero-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.hero-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 560px;
}

.hero-stat {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.stat-number {
  font-size: 22px;
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
  gap: 12px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-grow: 1;
  max-width: 380px;
}

.search-icon {
  position: absolute;
  left: 10px;
  pointer-events: none;
  color: var(--text-muted);
  transition: color 0.18s ease;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 32px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  outline: none;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
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
  right: 6px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.18s ease;
}

.search-clear-btn:hover {
  color: var(--danger);
  background: var(--danger-light);
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 6px;
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
  top: calc(100% + 4px);
  right: 0;
  min-width: 170px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 50;
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
  font-size: 12px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s ease;
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  min-height: 0;
}

.catalog-table {
  width: 100%;
  border-collapse: collapse;
  flex: 1;
}

/* Wrap the table in a scrollable container */
.catalog-table-card {
  overflow-y: auto;
}

.catalog-table thead {
  position: sticky;
  top: 0;
  z-index: 5;
}

.catalog-table th {
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  user-select: none;
}

.catalog-table td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-primary);
  font-size: 13px;
  vertical-align: middle;
}

.catalog-table tr:last-child td {
  border-bottom: none;
}

.col-id { width: 130px; }
.col-actions { width: 100px; text-align: right; }
.col-actions .action-btns-hover,
.col-actions .action-btns-always {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  align-items: center;
}

/* ========== Row Hover ========== */
.data-row {
  transition: background-color 0.18s ease;
}

.data-row:hover {
  background: var(--bg-hover);
}

.data-row:hover .name-text {
  color: var(--text-hover);
}

/* ========== Inline Action Buttons (show on hover) ========== */
.action-btns-hover {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.data-row:hover .action-btns-hover {
  opacity: 1;
}

.catalog-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
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
  transform: translateY(-1.5px);
  box-shadow: 0 3px 8px rgba(92, 141, 246, 0.18);
}

.catalog-action-btn.delete:hover {
  background: var(--danger-light);
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.15);
  transform: translateY(-1.5px);
  box-shadow: var(--shadow-danger-glow);
}

.catalog-action-btn:active {
  transform: scale(0.9) translateY(0);
  transition-duration: 0.08s;
}

/* ========== ID Badge ========== */
.id-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--accent-light);
  color: var(--accent);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.name-text {
  color: var(--text-primary);
  transition: color 0.18s ease;
}

/* ========== Inline Edit Row ========== */
.edit-row-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.edit-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.visual-bold-editor {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(8px);
  margin-top: 4px;
}

.editor-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.2px;
}

.word-preview-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.6;
}

.word-token {
  display: inline-block;
  cursor: pointer;
  padding: 1px 4px;
  border-radius: 4px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.word-token:hover {
  background: rgba(99, 102, 241, 0.05);
  color: var(--accent);
  transform: translateY(-0.5px);
}

.word-token.is-bold {
  font-weight: 700;
  color: var(--accent);
  background: rgba(99, 102, 241, 0.09);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.12);
}

.word-token.is-bold:hover {
  background: rgba(99, 102, 241, 0.14);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
}

.space-token {
  white-space: pre-wrap;
  display: inline-block;
}


.inline-input {
  width: 100%;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.inline-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-light);
}

.compact-btn {
  padding: 5px 12px;
  font-size: 11px;
}

/* ========== New Row (Animated) ========== */
.new-row td {
  background: var(--accent-light);
  border-bottom-color: rgba(92, 141, 246, 0.12);
}

.new-row td:first-child {
  border-left: 3px solid var(--accent);
}

.row-slide-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.row-slide-leave-active {
  transition: all 0.18s ease;
}
.row-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.row-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ========== Pagination ========== */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.pagination-range {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-page {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
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
  transform: translateY(-1px);
}

.pagination-btn:active {
  transform: scale(0.92);
  transition-duration: 0.08s;
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

/* ========== Empty State ========== */
.catalog-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.empty-icon-wrap {
  color: var(--border);
  margin-bottom: 4px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.empty-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  max-width: 360px;
  line-height: 1.5;
}

.empty-actions {
  margin-top: 8px;
}
</style>

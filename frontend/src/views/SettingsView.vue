<template>
  <div class="settings-view">
    <div class="settings-header">
      <div class="settings-title-row">
        <div class="settings-copy">
          <h1 class="settings-title">Catalogo prodotti</h1>
          <p class="settings-desc">
            Mappa gli ID Prestashop ai nomi corretti usati dalla rinomina automatica nel file XLSX.
          </p>
        </div>

        <div class="settings-actions">
          <div class="export-dropdown" v-if="templateStore.templates.length > 0">
            <button class="btn btn-secondary" @click="showExportMenu = !showExportMenu">
              Esporta
            </button>
            <Transition name="fade">
              <div v-if="showExportMenu" class="dropdown-menu">
                <button class="dropdown-item" @click="doExport('csv')">CSV</button>
                <button class="dropdown-item" @click="doExport('json')">JSON</button>
              </div>
            </Transition>
          </div>

          <button class="btn btn-secondary" id="btn-import-templates" @click="showImport = true">
            Importa
          </button>
          <button class="btn btn-primary" id="btn-add-template" @click="startAddRow">
            Aggiungi
          </button>
        </div>
      </div>

      <div class="search-row">
        <input
          v-model="search"
          type="text"
          class="input search-input"
          placeholder="Cerca per ID o nome"
        />
        <span class="count-label">{{ filteredTemplates.length }} template</span>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px">ID prodotto</th>
            <th>Nome corretto</th>
            <th style="width: 140px; text-align: right">Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="addingRow" class="new-row">
            <td>
              <input
                v-model="newRow.id"
                class="input"
                placeholder="es. 601530"
                @keyup.enter="saveNewRow"
                @keyup.escape="addingRow = false"
              />
            </td>
            <td>
              <div class="edit-row">
                <input
                  id="input-new-name"
                  v-model="newRow.name"
                  class="input"
                  placeholder="Nome corretto del prodotto"
                  @keyup.enter="saveNewRow"
                  @keyup.escape="addingRow = false"
                />
                <button class="btn btn-icon" @click="makeBold('input-new-name', 'newRow')" title="Grassetto"><b>B</b></button>
              </div>
            </td>
            <td style="text-align: right">
              <div class="action-btns">
                <button class="btn btn-success compact-btn" @click="saveNewRow">Salva</button>
                <button class="btn btn-icon" @click="addingRow = false">x</button>
              </div>
            </td>
          </tr>

          <tr v-for="t in paginatedTemplates" :key="t.id">
            <td>
              <span class="id-badge">{{ t.id }}</span>
            </td>
            <td>
              <div v-if="editingId === t.id" class="edit-row">
                <input
                  :id="'edit-name-' + t.id"
                  v-model="editingName"
                  class="input"
                  @keyup.enter="saveEdit(t)"
                  @keyup.escape="cancelEdit"
                />
                <button class="btn btn-icon" @click="makeBold('edit-name-' + t.id, 'editingName')" title="Grassetto"><b>B</b></button>
              </div>
              <span v-else class="name-text" v-html="t.name"></span>
            </td>
            <td style="text-align: right">
              <div class="action-btns" v-if="editingId === t.id">
                <button class="btn btn-success compact-btn" @click="saveEdit(t)">Salva</button>
                <button class="btn btn-icon" @click="cancelEdit">x</button>
              </div>
              <div class="action-btns" v-else>
                <button class="btn btn-icon" :id="`btn-edit-${t.id}`" @click="startEdit(t)" title="Modifica">Modifica</button>
                <button class="btn btn-danger compact-btn" :id="`btn-del-${t.id}`" @click="confirmDelete(t)" title="Elimina">
                  Elimina
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredTemplates.length === 0 && !addingRow">
            <td colspan="3" class="empty-table-msg">
              <span v-if="search">Nessun risultato per "<em>{{ search }}</em>"</span>
              <span v-else>Nessun template. Aggiungi il primo elemento per iniziare.</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination-controls">
        <button class="btn btn-icon" :disabled="currentPage === 1" @click="currentPage--">Prec.</button>
        <span class="page-info">Pagina {{ currentPage }} di {{ totalPages }}</span>
        <button class="btn btn-icon" :disabled="currentPage === totalPages" @click="currentPage++">Succ.</button>
      </div>
    </div>

    <ImportModal v-if="showImport" @close="showImport = false" @imported="templateStore.fetchAll()" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ImportModal from '../components/ImportModal.vue'
import { useTemplateStore } from '../stores/templates.js'
import { useNotificationStore } from '../stores/notification.js'

const templateStore = useTemplateStore()
const notificationStore = useNotificationStore()

const search = ref('')
const showImport = ref(false)
const showExportMenu = ref(false)
const editingId = ref(null)
const editingName = ref('')
const addingRow = ref(false)
const newRow = ref({ id: '', name: '' })

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
  const result = `${val.slice(0, start)}<b>${val.slice(start, end)}</b>${val.slice(end)}`

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
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.settings-header {
  padding: 16px 16px 0;
  flex-shrink: 0;
}

.settings-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.settings-copy {
  min-width: 0;
}

.settings-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 4px;
}

.settings-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.settings-desc {
  max-width: 560px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.search-input {
  max-width: 320px;
}

.count-label {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.id-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(92, 141, 246, 0.08);
  color: var(--accent);
  font-family: monospace;
  font-size: 12px;
}

.name-text {
  color: var(--text-primary);
}

.edit-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.action-btns {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

.compact-btn {
  padding: 5px 10px;
}

.new-row td {
  background: rgba(92, 141, 246, 0.06);
}

.empty-table-msg {
  text-align: center;
  color: var(--text-muted);
  padding: 28px !important;
  font-size: 13px;
}

.export-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 100px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  z-index: 50;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: none;
  color: var(--text-primary);
  font-size: 12px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background var(--transition);
}

.dropdown-item:hover {
  background: var(--bg-hover);
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-light);
}

.page-info {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

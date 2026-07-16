<template>
  <div class="prestashop-view">
    <header class="page-header">
      <div>
        <span class="eyebrow">Importazione separata</span>
        <h1>Ordini PrestaShop</h1>
        <p>Seleziona gli ordini dal Webservice 1.7 e aprili nell’editor usando il template Excel predefinito.</p>
      </div>
      <button class="btn btn-secondary" @click="showConfig = !showConfig">
        {{ showConfig ? 'Chiudi configurazione' : 'Configura Webservice' }}
      </button>
    </header>

    <section v-if="showConfig || !configured" class="config-card">
      <div class="section-heading">
        <div>
          <h2>Connessione Webservice</h2>
          <p>La chiave rimane nel backend e viene usata esclusivamente in lettura.</p>
        </div>
        <span class="status-pill" :class="configured ? 'status-ok' : 'status-warn'">
          {{ configured ? 'Configurato' : 'Da configurare' }}
        </span>
      </div>
      <div class="config-grid">
        <label class="field field-wide">
          <span>URL negozio</span>
          <input v-model.trim="config.baseUrl" class="input" type="url" placeholder="https://shop.example.com" />
        </label>
        <label class="field">
          <span>Chiave Webservice</span>
          <input v-model="config.apiKey" class="input" type="password" autocomplete="new-password" placeholder="Chiave PrestaShop" />
        </label>
        <label class="field field-small">
          <span>ID lingua</span>
          <input v-model.number="config.languageId" class="input" type="number" min="1" />
        </label>
      </div>
      <div class="config-actions">
        <button class="btn btn-primary" :disabled="savingConfig" @click="saveConfiguration">
          {{ savingConfig ? 'Salvataggio...' : 'Salva configurazione' }}
        </button>
        <button class="btn btn-secondary" :disabled="testing || !configured" @click="testConnection">
          {{ testing ? 'Verifica...' : 'Test connessione' }}
        </button>
      </div>
    </section>

    <template v-if="configured">
      <section class="filters-card">
        <label class="field search-field">
          <span>Ricerca ordine</span>
          <div class="search-wrap">
            <input v-model.trim="filters.search" class="input" placeholder="Riferimento o ID ordine" @keyup.enter="applyFilters" />
            <button class="btn btn-primary" @click="applyFilters">Cerca</button>
          </div>
        </label>
        <label class="field">
          <span>Stato ordine</span>
          <select v-model="filters.state" class="input" @change="applyFilters">
            <option value="">Tutti gli stati</option>
            <option v-for="state in states" :key="state.id" :value="state.id">{{ state.name }}</option>
          </select>
        </label>
        <label class="field">
          <span>Dal</span>
          <input v-model="filters.dateFrom" class="input" type="date" @change="applyFilters" />
        </label>
        <label class="field">
          <span>Al</span>
          <input v-model="filters.dateTo" class="input" type="date" @change="applyFilters" />
        </label>
        <button class="btn btn-secondary reset-btn" @click="resetFilters">Reimposta</button>
      </section>

      <section class="orders-card">
        <div class="orders-toolbar">
          <div>
            <h2>Ordini disponibili</h2>
            <p aria-live="polite">{{ selectedIds.size }} selezionati · massimo 100 per importazione</p>
          </div>
          <button class="btn btn-success import-btn" :disabled="selectedIds.size === 0 || generating" @click="openInEditor">
            <span v-if="generating" class="spinner"></span>
            {{ generating ? operationText : `Apri ${selectedIds.size || ''} ordini nell’editor` }}
          </button>
        </div>

        <div v-if="selectedOrders.length" class="selection-tray" aria-label="Ordini selezionati">
          <div class="selection-tray-heading">
            <div>
              <strong>Selezione attiva</strong>
              <span>Rimuovi un singolo ordine con ×, anche se non è visibile nel filtro corrente.</span>
            </div>
            <span class="selection-count">{{ selectedOrders.length }}</span>
          </div>
          <div class="selection-list">
            <div
              v-for="order in selectedOrders"
              :key="order.id"
              class="selected-order-chip"
              :style="stateStyle(order.stateId)"
            >
              <span class="selection-state-dot" aria-hidden="true"></span>
              <span class="selected-order-main">
                <strong>#{{ order.id }}</strong>
                <span :title="order.reference || ''">{{ order.reference || 'Senza riferimento' }}</span>
              </span>
              <span class="selected-order-state" :title="stateName(order.stateId)">{{ stateName(order.stateId) }}</span>
              <button
                type="button"
                class="remove-selection"
                :aria-label="`Rimuovi ordine #${order.id} dalla selezione`"
                title="Rimuovi solo questo ordine"
                @click="removeSelectedOrder(order.id)"
              >×</button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading-state">Caricamento ordini da PrestaShop...</div>
        <div v-else-if="orders.length === 0" class="empty-orders">
          Nessun ordine trovato con i filtri selezionati.
        </div>
        <div v-else class="table-wrap">
          <table class="orders-table">
            <colgroup>
              <col class="col-select" />
              <col class="col-id" />
              <col class="col-reference" />
              <col class="col-date" />
              <col class="col-customer" />
              <col class="col-products" />
              <col class="col-state" />
              <col class="col-carrier" />
              <col class="col-total" />
            </colgroup>
            <thead>
              <tr>
                <th class="check-col"><input type="checkbox" :checked="pageFullySelected" @change="togglePageSelection" /></th>
                <th>ID</th>
                <th>Riferimento</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Prodotti</th>
                <th class="state-column">Stato</th>
                <th>Corriere</th>
                <th class="amount-col">Totale</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id" :class="{ selected: selectedIds.has(order.id) }" @click="toggleOrder(order.id)">
                <td class="check-col" @click.stop>
                  <input type="checkbox" :checked="selectedIds.has(order.id)" @change="toggleOrder(order.id)" />
                </td>
                <td class="muted-cell id-cell" :title="`#${order.id}`">#{{ order.id }}</td>
                <td class="reference-cell"><strong>{{ order.reference || '—' }}</strong></td>
                <td class="date-cell" :title="formatDate(order.dateAdd)">{{ formatDate(order.dateAdd) }}</td>
                <td class="customer-cell" :title="order.customer || ''">{{ order.customer || '—' }}</td>
                <td class="products-cell">
                  <template v-if="order.products?.length">
                    <div v-for="(product, index) in order.products.slice(0, 2)" :key="`${order.id}-${index}`" class="product-line">
                      <span class="product-quantity">{{ product.quantity || 0 }}×</span>
                      <span class="product-name" :title="product.name">{{ product.name || 'Prodotto senza nome' }}</span>
                      <span v-if="product.reference" class="product-reference" :title="product.reference">{{ product.reference }}</span>
                    </div>
                    <details v-if="order.products.length > 2" class="more-products" @click.stop>
                      <summary>+ {{ order.products.length - 2 }} altri prodotti</summary>
                      <div v-for="(product, index) in order.products.slice(2)" :key="`${order.id}-more-${index}`" class="product-line">
                        <span class="product-quantity">{{ product.quantity || 0 }}×</span>
                        <span class="product-name" :title="product.name">{{ product.name || 'Prodotto senza nome' }}</span>
                        <span v-if="product.reference" class="product-reference" :title="product.reference">{{ product.reference }}</span>
                      </div>
                    </details>
                  </template>
                  <span v-else class="muted-cell">Nessun prodotto</span>
                </td>
                <td class="state-cell">
                  <span class="order-state" :style="stateStyle(order.stateId)" :title="stateName(order.stateId)">
                    <span class="state-dot" aria-hidden="true"></span>
                    <span class="state-label">{{ stateName(order.stateId) }}</span>
                  </span>
                </td>
                <td class="carrier-cell" :title="order.carrier || ''">{{ order.carrier || '—' }}</td>
                <td class="amount-col">{{ formatAmount(order.totalPaid) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar">
          <button class="btn btn-secondary" :disabled="page <= 1 || loading" @click="changePage(page - 1)">Precedente</button>
          <span>Pagina {{ page }}</span>
          <button class="btn btn-secondary" :disabled="!hasMore || loading" @click="changePage(page + 1)">Successiva</button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/index.js'
import { useNotificationStore } from '../stores/notification.js'
import { useSpreadsheetStore } from '../stores/spreadsheet.js'

const router = useRouter()
const notificationStore = useNotificationStore()
const spreadsheetStore = useSpreadsheetStore()

const config = reactive({ baseUrl: '', apiKey: '', languageId: 1, hasApiKey: false })
const filters = reactive({ search: '', state: '', dateFrom: '', dateTo: '' })
const showConfig = ref(false)
const savingConfig = ref(false)
const testing = ref(false)
const loading = ref(false)
const generating = ref(false)
const operationText = ref('Generazione Excel...')
const states = ref([])
const orders = ref([])
const selectedIds = ref(new Set())
const selectedOrderDetails = ref(new Map())
const page = ref(1)
const hasMore = ref(false)

const configured = computed(() => Boolean(config.baseUrl && config.hasApiKey))
const pageFullySelected = computed(() => orders.value.length > 0 && orders.value.every((order) => selectedIds.value.has(order.id)))
const selectedOrders = computed(() => [...selectedIds.value].map((id) => selectedOrderDetails.value.get(id) || { id }))

function replaceSelection(next, details = selectedOrderDetails.value) {
  selectedIds.value = new Set(next)
  selectedOrderDetails.value = new Map(details)
}

function toggleOrder(id) {
  const next = new Set(selectedIds.value)
  const details = new Map(selectedOrderDetails.value)
  if (next.has(id)) {
    next.delete(id)
    details.delete(id)
  } else if (next.size < 100) {
    next.add(id)
    const order = orders.value.find((item) => item.id === id)
    if (order) details.set(id, order)
  }
  else notificationStore.show({ type: 'warning', message: 'Puoi selezionare al massimo 100 ordini.' })
  replaceSelection(next, details)
}

function removeSelectedOrder(id) {
  const next = new Set(selectedIds.value)
  const details = new Map(selectedOrderDetails.value)
  next.delete(id)
  details.delete(id)
  replaceSelection(next, details)
}

function togglePageSelection() {
  const next = new Set(selectedIds.value)
  const details = new Map(selectedOrderDetails.value)
  if (pageFullySelected.value) orders.value.forEach((order) => {
    next.delete(order.id)
    details.delete(order.id)
  })
  else {
    for (const order of orders.value) {
      if (next.size >= 100) break
      next.add(order.id)
      details.set(order.id, order)
    }
  }
  replaceSelection(next, details)
}

function stateFor(id) {
  return states.value.find((state) => String(state.id) === String(id))
}

function stateName(id) {
  return stateFor(id)?.name || `Stato ${id}`
}

function stateStyle(id) {
  const color = stateFor(id)?.color || '#64748b'
  return { '--state-color': color }
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function formatAmount(value) {
  const number = Number(value)
  return Number.isFinite(number) ? new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number) : '—'
}

async function loadConfiguration() {
  const { data } = await api.get('/prestashop/config')
  Object.assign(config, data)
  if (!configured.value) showConfig.value = true
}

async function saveConfiguration() {
  savingConfig.value = true
  try {
    const { data } = await api.put('/prestashop/config', {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      languageId: config.languageId,
    })
    Object.assign(config, data)
    notificationStore.show({ type: 'success', message: 'Configurazione PrestaShop salvata.' })
    await testConnection()
    await loadStates()
    await loadOrders()
  } finally {
    savingConfig.value = false
  }
}

async function testConnection() {
  testing.value = true
  try {
    await api.post('/prestashop/test')
    notificationStore.show({ type: 'success', message: 'Connessione PrestaShop riuscita.' })
  } finally {
    testing.value = false
  }
}

async function loadStates() {
  const { data } = await api.get('/prestashop/states')
  states.value = data.states || []
}

async function loadOrders() {
  if (!configured.value) return
  loading.value = true
  try {
    const { data } = await api.get('/prestashop/orders', {
      params: { page: page.value, pageSize: 30, ...filters },
    })
    orders.value = data.orders || []
    hasMore.value = Boolean(data.hasMore)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  loadOrders()
}

function resetFilters() {
  Object.assign(filters, { search: '', state: '', dateFrom: '', dateTo: '' })
  applyFilters()
}

function changePage(nextPage) {
  page.value = Math.max(1, nextPage)
  loadOrders()
}

function responseFilename(response) {
  const explicit = response.headers?.['x-orderedit-filename']
  if (explicit) return explicit
  const disposition = String(response.headers?.['content-disposition'] || '')
  const match = disposition.match(/filename="?([^";]+)"?/i)
  return match?.[1] || 'export_orders_prestashop.xlsx'
}

async function openInEditor() {
  if (selectedIds.value.size === 0 || generating.value) return
  if (spreadsheetStore.hasData) {
    const warning = spreadsheetStore.isUnsaved
      ? 'Il foglio corrente contiene modifiche non esportate. Sostituirlo con gli ordini PrestaShop?'
      : 'Sostituire il foglio corrente con gli ordini PrestaShop selezionati?'
    if (!window.confirm(warning)) return
  }

  generating.value = true
  operationText.value = 'Generazione Excel...'
  try {
    const response = await api.post('/prestashop/workbook', { orderIds: [...selectedIds.value] }, {
      responseType: 'blob',
      timeout: 90_000,
    })
    const filename = responseFilename(response)
    const form = new FormData()
    form.append('file', response.data, filename)
    operationText.value = 'Apertura editor...'
    const { data } = await api.post('/xlsx/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90_000,
    })
    spreadsheetStore.loadSheets(data.sheets || [], filename)
    notificationStore.show({
      type: 'success',
      message: `${response.headers?.['x-orderedit-orders'] || selectedIds.value.size} ordini importati da PrestaShop.`,
    })
    router.push('/editor')
  } finally {
    generating.value = false
    operationText.value = 'Generazione Excel...'
  }
}

onMounted(async () => {
  try {
    await loadConfiguration()
    if (configured.value) await Promise.all([loadStates(), loadOrders()])
  } catch {
    showConfig.value = true
  }
})
</script>

<style scoped>
.prestashop-view { height: 100%; overflow: auto; padding: clamp(14px, 1.6vw, 24px); color: var(--text-primary); }
.page-header, .section-heading, .orders-toolbar, .config-actions, .pagination-bar { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.page-header { margin: 0 auto 22px; max-width: 1680px; }
.page-header h1 { margin: 4px 0 6px; font-size: 30px; letter-spacing: -0.7px; }
.page-header p, .section-heading p, .orders-toolbar p { margin: 0; color: var(--text-secondary); }
.eyebrow { color: var(--accent); font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.config-card, .filters-card, .orders-card { max-width: 1680px; margin: 0 auto 18px; border: 1px solid var(--border); border-radius: 16px; background: var(--bg-card); box-shadow: var(--shadow-sm); }
.config-card, .orders-card { padding: 18px; }
.section-heading h2, .orders-toolbar h2 { margin: 0 0 4px; font-size: 18px; }
.status-pill { display: inline-flex; align-items: center; border: 1px solid; border-radius: 999px; font-size: 11px; font-weight: 750; padding: 4px 9px; white-space: nowrap; }
.status-ok { color: #15803d; border-color: #22c55e; background: rgba(34,197,94,.1); }
.status-warn { color: #b45309; border-color: #f59e0b; background: rgba(245,158,11,.1); }
.config-grid { display: grid; grid-template-columns: minmax(280px, 2fr) minmax(240px, 1fr) 110px; gap: 14px; margin: 20px 0; }
.field { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.field > span { font-size: 12px; font-weight: 750; color: var(--text-secondary); }
.config-actions { justify-content: flex-start; }
.filters-card { display: grid; grid-template-columns: minmax(280px, 2fr) minmax(190px, 1fr) 150px 150px auto; align-items: end; gap: 12px; padding: 16px; }
.search-wrap { display: flex; gap: 8px; }
.search-wrap .input { flex: 1; }
.reset-btn { align-self: end; }
.orders-toolbar { margin-bottom: 18px; }
.import-btn { min-width: 220px; }
.selection-tray {
  margin: -2px 0 16px;
  border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--border));
  border-radius: 12px;
  padding: 12px;
  background: color-mix(in srgb, var(--accent) 5%, var(--bg-card));
}
.selection-tray-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 10px; }
.selection-tray-heading > div { display: flex; align-items: baseline; gap: 9px; min-width: 0; }
.selection-tray-heading strong { flex: 0 0 auto; font-size: 13px; }
.selection-tray-heading span { color: var(--text-secondary); font-size: 11px; }
.selection-count {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  background: var(--accent);
  color: white !important;
  font-size: 11px !important;
  font-weight: 800;
}
.selection-list { display: flex; flex-wrap: wrap; gap: 7px; max-height: 146px; overflow-y: auto; scrollbar-gutter: stable; }
.selected-order-chip {
  --state-color: #64748b;
  display: grid;
  grid-template-columns: 7px minmax(110px, auto) minmax(0, 150px) 28px;
  align-items: center;
  gap: 7px;
  max-width: 100%;
  min-height: 36px;
  border: 1px solid color-mix(in srgb, var(--state-color) 38%, var(--border));
  border-radius: 9px;
  padding: 3px 3px 3px 9px;
  background: var(--bg-card);
  box-shadow: inset 3px 0 0 color-mix(in srgb, var(--state-color) 76%, transparent);
}
.selection-state-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--state-color); }
.selected-order-main { display: flex; min-width: 0; gap: 5px; font-size: 11px; }
.selected-order-main strong { flex: 0 0 auto; color: var(--text-primary); }
.selected-order-main span, .selected-order-state { overflow: hidden; color: var(--text-secondary); text-overflow: ellipsis; white-space: nowrap; }
.selected-order-state { padding-left: 7px; border-left: 1px solid var(--border); font-size: 10px; font-weight: 650; }
.remove-selection {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font: inherit;
  font-size: 19px;
  line-height: 1;
  transition: background .15s ease, color .15s ease, transform .15s ease;
}
.remove-selection:hover { background: rgba(239, 68, 68, .12); color: #dc2626; transform: scale(1.05); }
.remove-selection:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.table-wrap { overflow: auto; border: 1px solid var(--border); border-radius: 12px; }
.orders-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 13px; }
.col-select { width: 38px; }
.col-id { width: 86px; }
.col-reference { width: 105px; }
.col-date { width: 116px; }
.col-customer { width: 146px; }
.col-products { width: auto; }
.col-state { width: 202px; }
.col-carrier { width: 134px; }
.col-total { width: 92px; }
.orders-table th { position: sticky; top: 0; z-index: 1; background: var(--bg-secondary); color: var(--text-secondary); text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
.orders-table th, .orders-table td { padding: 11px 10px; border-bottom: 1px solid var(--border); white-space: nowrap; }
.orders-table tbody tr { cursor: pointer; transition: background .15s ease; }
.orders-table tbody tr:hover, .orders-table tbody tr.selected { background: rgba(92,141,246,.09); }
.orders-table tbody tr.selected td:first-child { box-shadow: inset 3px 0 0 var(--accent); }
.orders-table input[type='checkbox'] { accent-color: var(--accent); }
.orders-table tbody tr:last-child td { border-bottom: 0; }
.check-col { width: 36px; text-align: center !important; }
.amount-col { text-align: right !important; }
.muted-cell { color: var(--text-secondary); }
.reference-cell, .date-cell, .customer-cell, .carrier-cell, .amount-col { overflow: hidden; text-overflow: ellipsis; }
.id-cell { overflow: visible; font-variant-numeric: tabular-nums; white-space: nowrap; }
.reference-cell { letter-spacing: .01em; }
.state-cell { white-space: normal !important; }
.order-state {
  --state-color: #64748b;
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 100%;
  border: 1px solid color-mix(in srgb, var(--state-color) 48%, var(--border));
  border-radius: 9px;
  padding: 6px 10px 6px 8px;
  background: color-mix(in srgb, var(--state-color) 11%, var(--bg-card));
  color: var(--text-primary);
  box-shadow: inset 3px 0 0 color-mix(in srgb, var(--state-color) 82%, transparent), 0 1px 2px rgba(15, 23, 42, .05);
  font-size: 12px;
  font-weight: 720;
  line-height: 1.25;
  text-align: left;
  vertical-align: middle;
}
.state-dot {
  width: 7px;
  height: 7px;
  margin-top: 4px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--state-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--state-color) 16%, transparent);
}
.state-label { min-width: 0; overflow-wrap: anywhere; }
:global(:root[data-theme='dark']) .order-state {
  background: color-mix(in srgb, var(--state-color) 15%, var(--bg-card));
  border-color: color-mix(in srgb, var(--state-color) 55%, var(--border));
  box-shadow: inset 3px 0 0 color-mix(in srgb, var(--state-color) 90%, transparent), 0 1px 2px rgba(0, 0, 0, .22);
}
.products-cell { white-space: normal !important; }
.product-line { display: flex; align-items: baseline; gap: 6px; min-width: 0; line-height: 1.35; }
.product-line + .product-line { margin-top: 4px; }
.product-quantity { flex: 0 0 auto; color: var(--accent); font-size: 11px; font-weight: 800; }
.product-name { overflow: hidden; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; }
.product-reference { flex: 0 1 auto; max-width: 96px; overflow: hidden; border-radius: 5px; padding: 1px 5px; background: var(--accent-light); color: var(--accent); font-size: 10px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.more-products { margin-top: 5px; }
.more-products summary { width: max-content; cursor: pointer; color: var(--accent); font-size: 11px; font-weight: 750; }
.more-products[open] summary { margin-bottom: 5px; }
.loading-state, .empty-orders { min-height: 240px; display: grid; place-items: center; color: var(--text-secondary); border: 1px dashed var(--border); border-radius: 12px; }
.pagination-bar { justify-content: center; margin-top: 18px; }
.pagination-bar span { min-width: 90px; text-align: center; font-size: 12px; font-weight: 750; }
@media (max-width: 1180px) {
  .orders-table { min-width: 1100px; }
}
@media (max-width: 980px) {
  .prestashop-view { padding: 18px; }
  .page-header { align-items: flex-start; }
  .config-grid, .filters-card { grid-template-columns: 1fr 1fr; }
  .search-field, .field-wide { grid-column: 1 / -1; }
}
@media (max-width: 640px) {
  .page-header, .orders-toolbar { align-items: stretch; flex-direction: column; }
  .config-grid, .filters-card { grid-template-columns: 1fr; }
  .search-field, .field-wide { grid-column: auto; }
  .selection-tray-heading > div { align-items: flex-start; flex-direction: column; gap: 2px; }
  .selected-order-chip { width: 100%; grid-template-columns: 7px minmax(100px, 1fr) minmax(0, 120px) 28px; }
}
</style>

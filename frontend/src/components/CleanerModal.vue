<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-box cleaner-modal">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-title-area">
            <div class="header-icon-wrap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 8v4"/>
                <path d="M12 16h.01"/>
              </svg>
            </div>
            <h3 class="modal-title">Manutenzione & Pulizia Catalogo</h3>
          </div>
          <button class="btn btn-icon" @click="$emit('close')">X</button>
        </div>

        <!-- Health Score Widget -->
        <div class="health-widget-card">
          <div class="health-info">
            <span class="health-label">Punteggio di Salute del Catalogo</span>
            <div class="health-score-value" :style="{ color: healthColor }">
              {{ healthScore }}%
            </div>
          </div>
          <div class="health-progress-bar-bg">
            <div class="health-progress-bar" :style="{ width: `${healthScore}%`, backgroundColor: healthColor }"></div>
          </div>
          <div class="health-summary-text">
            <span v-if="healthScore === 100" class="good">✨ Il tuo catalogo è in perfetta salute! Nessuna anomalia rilevata.</span>
            <span v-else class="warn">⚠️ Rilevate {{ totalIssues }} anomalie che potrebbero causare allineamenti errati negli ordini.</span>
          </div>
        </div>

        <!-- Tab Bar -->
        <div class="tab-bar border-bottom">
          <button class="tab-btn" :class="{ active: activeTab === 'duplicates' }" @click="activeTab = 'duplicates'">
            Duplicati ({{ duplicateGroups.length }})
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'html' }" @click="activeTab = 'html'">
            Tag HTML ({{ htmlIssues.length }})
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'spaces' }" @click="activeTab = 'spaces'">
            Spazi & Testo ({{ spaceIssues.length }})
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'ids' }" @click="activeTab = 'ids'">
            ID Prodotto ({{ idIssues.length }})
          </button>
        </div>

        <!-- Scrollable Content Area -->
        <div class="cleaner-scroll-content">
          <!-- 1. DUPLICATES TAB -->
          <div v-if="activeTab === 'duplicates'" class="tab-content-pane">
            <div class="tab-actions-header" v-if="duplicateGroups.length > 0">
              <p class="tab-pane-desc">I seguenti prodotti hanno lo stesso nome ma ID differenti. Scegli quale ID mantenere o unisci in blocco.</p>
              <button class="btn btn-secondary compact-btn" @click="resolveAllDuplicates">Unisci tutti in blocco</button>
            </div>
            
            <div class="issues-list" v-if="duplicateGroups.length > 0">
              <div v-for="(group, gIdx) in duplicateGroups" :key="gIdx" class="issue-card duplicate-card">
                <div class="issue-card-title" v-html="group.name"></div>
                <div class="duplicate-ids-grid">
                  <div v-for="item in group.items" :key="item.id" class="duplicate-id-row">
                    <span class="id-badge">{{ item.id }}</span>
                    <button class="btn btn-success compact-btn outline-btn" @click="keepId(group, item.id)">
                      Mantieni questo ID
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="empty-tab-state" v-else>
              <div class="empty-tab-icon green">✓</div>
              <p class="empty-tab-title">Nessun nome duplicato rilevato</p>
              <p class="empty-tab-desc">Ogni nome prodotto corrisponde a un ID unico.</p>
            </div>
          </div>

          <!-- 2. HTML TAGS TAB -->
          <div v-if="activeTab === 'html'" class="tab-content-pane">
            <div class="tab-actions-header" v-if="htmlIssues.length > 0">
              <p class="tab-pane-desc">Rilevati tag <b> o </b> malformati, spaiati o vuoti che possono rompere la griglia o gli export.</p>
              <button class="btn btn-secondary compact-btn" @click="fixAllHtml">Correggi tutti i tag</button>
            </div>
            
            <div class="issues-list" v-if="htmlIssues.length > 0">
              <div v-for="item in htmlIssues" :key="item.id" class="issue-card fix-row-card">
                <div class="fix-row-info">
                  <span class="id-badge">{{ item.id }}</span>
                  <div class="text-comparison">
                    <div class="original-text text-danger">Originale: <span v-html="item.name"></span></div>
                    <div class="suggested-text text-success">Corretto: <span v-html="autoFixHtmlText(item.name)"></span></div>
                  </div>
                </div>
                <button class="btn btn-success compact-btn" @click="applyHtmlFix(item)">Applica</button>
              </div>
            </div>
            
            <div class="empty-tab-state" v-else>
              <div class="empty-tab-icon green">✓</div>
              <p class="empty-tab-title">Tutti i tag HTML sono corretti</p>
              <p class="empty-tab-desc">Nessuna anomalia riscontrata nella formattazione del grassetto.</p>
            </div>
          </div>

          <!-- 3. SPACES & TEXT TAB -->
          <div v-if="activeTab === 'spaces'" class="tab-content-pane">
            <div class="tab-actions-header" v-if="spaceIssues.length > 0">
              <p class="tab-pane-desc">Prodotti con spazi doppi, multipli o spazi bianchi iniziali/finali da normalizzare.</p>
              <button class="btn btn-secondary compact-btn" @click="normalizeAllSpaces">Normalizza tutti gli spazi</button>
            </div>
            
            <div class="issues-list" v-if="spaceIssues.length > 0">
              <div v-for="item in spaceIssues" :key="item.id" class="issue-card fix-row-card">
                <div class="fix-row-info">
                  <span class="id-badge">{{ item.id }}</span>
                  <div class="text-comparison">
                    <div class="original-text text-warn">Originale: <code>"{{ item.name }}"</code></div>
                    <div class="suggested-text text-success">Corretto: <code>"{{ autoFixSpacesText(item.name) }}"</code></div>
                  </div>
                </div>
                <button class="btn btn-success compact-btn" @click="applySpaceFix(item)">Applica</button>
              </div>
            </div>
            
            <div class="empty-tab-state" v-else>
              <div class="empty-tab-icon green">✓</div>
              <p class="empty-tab-title">Testi e spazi perfettamente allineati</p>
              <p class="empty-tab-desc">Nessuno spazio superfluo o non normalizzato.</p>
            </div>
          </div>

          <!-- 4. PRODUCT IDS TAB -->
          <div v-if="activeTab === 'ids'" class="tab-content-pane">
            <div class="tab-actions-header" v-if="idIssues.length > 0">
              <p class="tab-pane-desc">Rilevati ID vuoti, con spazi interni o caratteri non puliti.</p>
              <button class="btn btn-secondary compact-btn" @click="cleanAllIds">Ripulisci tutti gli ID</button>
            </div>
            
            <div class="issues-list" v-if="idIssues.length > 0">
              <div v-for="item in idIssues" :key="item.id" class="issue-card fix-row-card">
                <div class="fix-row-info">
                  <span class="id-badge warn-badge">{{ item.id }}</span>
                  <div class="text-comparison">
                    <div class="original-text text-warn">ID originale: <code>"{{ item.id }}"</code></div>
                    <div class="suggested-text text-success">ID corretto: <code>"{{ autoFixIdText(item.id) }}"</code></div>
                  </div>
                </div>
                <button class="btn btn-success compact-btn" @click="applyIdFix(item)">Applica</button>
              </div>
            </div>
            
            <div class="empty-tab-state" v-else>
              <div class="empty-tab-icon green">✓</div>
              <p class="empty-tab-title">Tutti gli ID prodotto sono puliti</p>
              <p class="empty-tab-desc">Nessuna anomalia o spazio vuoto riscontrato nelle chiavi identificative.</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <div class="footer-stats">
            Modifiche in memoria: <strong :class="{ 'text-success': pendingChanges > 0 }">{{ pendingChanges }}</strong>
          </div>
          <div class="footer-actions">
            <button class="btn btn-secondary" @click="$emit('close')">Annulla</button>
            <button class="btn btn-primary" :disabled="pendingChanges === 0 || saving" @click="saveChanges">
              <span v-if="saving">Salvataggio...</span>
              <span v-else>Applica e Salva ({{ pendingChanges }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTemplateStore } from '../stores/templates.js'
import { useNotificationStore } from '../stores/notification.js'

const emit = defineEmits(['close', 'cleaned'])
const templateStore = useTemplateStore()
const notificationStore = useNotificationStore()

const activeTab = ref('duplicates')
const saving = ref(false)
const pendingChanges = ref(0)

// Local copy of catalog data for simulation before save
const localTemplates = ref([])

onMounted(() => {
  localTemplates.value = JSON.parse(JSON.stringify(templateStore.templates))
})

// Helper functions for diagnostics
function stripHtmlAndSpaces(text) {
  return String(text || '')
    .replace(/<\/?[^>]+(>|$)/g, '') // strip HTML tags
    .toLowerCase()
    .replace(/\s+/g, '') // remove all spaces
    .trim()
}

// 1. DUPLICATES DETECTION
const duplicateGroups = computed(() => {
  const map = {}
  localTemplates.value.forEach((t) => {
    const key = stripHtmlAndSpaces(t.name)
    if (!key) return
    if (!map[key]) map[key] = []
    map[key].push(t)
  })
  
  return Object.values(map)
    .filter((group) => group.length > 1)
    .map((group) => {
      // Find clean readable name representation
      const bestRep = group.find((t) => t.name.includes('<b>')) || group[0]
      return {
        name: bestRep.name,
        normalizedKey: stripHtmlAndSpaces(bestRep.name),
        items: group
      }
    })
})

// 2. MALFORMED HTML DETECTION
const htmlIssues = computed(() => {
  return localTemplates.value.filter((t) => {
    const name = t.name || ''
    const openCount = (name.match(/<b>/gi) || []).length
    const closeCount = (name.match(/<\/b>/gi) || []).length
    const hasEmptyTag = /<b>\s*<\/b>/gi.test(name)
    return openCount !== closeCount || hasEmptyTag
  })
})

function autoFixHtmlText(name) {
  let val = String(name || '').trim()
  val = val.replace(/<b>\s*<\/b>/gi, '') // Remove empty tags
  const openCount = (val.match(/<b>/gi) || []).length
  const closeCount = (val.match(/<\/b>/gi) || []).length
  if (openCount === closeCount) return val
  if (openCount > closeCount) {
    return val + '</b>'.repeat(openCount - closeCount)
  }
  // More close than open tags: remove all to keep it clean
  return val.replace(/<\/b>/gi, '').replace(/<b>/gi, '')
}

// 3. UNNORMALIZED SPACES DETECTION
const spaceIssues = computed(() => {
  return localTemplates.value.filter((t) => {
    const name = t.name || ''
    const trimmed = name.trim()
    const hasDoubleSpaces = /\s{2,}/g.test(name)
    return name !== trimmed || hasDoubleSpaces
  })
})

function autoFixSpacesText(name) {
  return String(name || '').trim().replace(/\s{2,}/g, ' ')
}

// 4. INCONSISTENT IDS DETECTION
const idIssues = computed(() => {
  return localTemplates.value.filter((t) => {
    const id = t.id || ''
    const trimmed = id.trim()
    const hasSpaces = /\s/g.test(id)
    return id !== trimmed || hasSpaces || !id
  })
})

function autoFixIdText(id) {
  return String(id || '').trim().replace(/\s+/g, '')
}

// TOTAL ISSUES COUNT
const totalIssues = computed(() => {
  return duplicateGroups.value.length + htmlIssues.value.length + spaceIssues.value.length + idIssues.value.length
})

// HEALTH SCORE
const healthScore = computed(() => {
  const penalty = (duplicateGroups.value.length * 10) +
                  (htmlIssues.value.length * 5) +
                  (spaceIssues.value.length * 2) +
                  (idIssues.value.length * 3)
  return Math.max(0, 100 - penalty)
})

const healthColor = computed(() => {
  const score = healthScore.value
  if (score >= 95) return '#10b981' // emerald green
  if (score >= 80) return '#6366f1' // indigo
  if (score >= 60) return '#f59e0b' // amber orange
  return '#ef4444' // red
})

// RESOLUTION ACTIONS
function keepId(group, idToKeep) {
  // Remove all templates matching the normalized name except the one with idToKeep
  localTemplates.value = localTemplates.value.filter((t) => {
    if (stripHtmlAndSpaces(t.name) === group.normalizedKey) {
      return t.id === idToKeep
    }
    return true
  })
  pendingChanges.value++
  notificationStore.show({ type: 'info', message: 'Duplicati uniti. Mantenuto ID ' + idToKeep })
}

function resolveAllDuplicates() {
  if (duplicateGroups.value.length === 0) return
  duplicateGroups.value.forEach((group) => {
    const defaultId = group.items[0].id
    keepId(group, defaultId)
  })
  notificationStore.show({ type: 'success', message: 'Tutti i duplicati sono stati uniti mantenendo il primo ID' })
}

function applyHtmlFix(item) {
  const idx = localTemplates.value.findIndex((t) => t.id === item.id)
  if (idx !== -1) {
    localTemplates.value[idx].name = autoFixHtmlText(item.name)
    pendingChanges.value++
  }
}

function fixAllHtml() {
  if (htmlIssues.value.length === 0) return
  htmlIssues.value.forEach((item) => {
    applyHtmlFix(item)
  })
  notificationStore.show({ type: 'success', message: 'Tutti i tag HTML sono stati corretti automaticamente' })
}

function applySpaceFix(item) {
  const idx = localTemplates.value.findIndex((t) => t.id === item.id)
  if (idx !== -1) {
    localTemplates.value[idx].name = autoFixSpacesText(item.name)
    pendingChanges.value++
  }
}

function normalizeAllSpaces() {
  if (spaceIssues.value.length === 0) return
  spaceIssues.value.forEach((item) => {
    applySpaceFix(item)
  })
  notificationStore.show({ type: 'success', message: 'Spazi e testi normalizzati in tutto il catalogo' })
}

function applyIdFix(item) {
  const idx = localTemplates.value.findIndex((t) => t.id === item.id)
  if (idx !== -1) {
    const fixedId = autoFixIdText(item.id)
    // Check if the fixed ID already exists to avoid collisions
    const collision = localTemplates.value.find((t) => t.id === fixedId && t !== localTemplates.value[idx])
    if (collision) {
      notificationStore.show({ type: 'error', message: `Impossibile pulire ID "${item.id}" poiché il codice "${fixedId}" esiste già!` })
      return
    }
    localTemplates.value[idx].id = fixedId
    pendingChanges.value++
  }
}

function cleanAllIds() {
  if (idIssues.value.length === 0) return
  let fixedCount = 0
  idIssues.value.forEach((item) => {
    const oldId = item.id
    applyIdFix(item)
    const afterItem = localTemplates.value.find((t) => t.name === item.name)
    if (afterItem && afterItem.id !== oldId) {
      fixedCount++
    }
  })
  if (fixedCount > 0) {
    notificationStore.show({ type: 'success', message: `Ripuliti ${fixedCount} ID prodotto` })
  }
}

// SAVE BULK ACTION
async function saveChanges() {
  saving.value = true
  try {
    const cleanList = localTemplates.value.map((t) => ({ id: t.id, name: t.name }))
    await templateStore.importBulk({
      format: 'json',
      data: JSON.stringify(cleanList),
      mode: 'replace'
    })
    notificationStore.show({ type: 'success', message: 'Catalogo ottimizzato e salvato con successo!' })
    emit('cleaned')
    emit('close')
  } catch (err) {
    notificationStore.show({ type: 'error', message: 'Errore nel salvataggio: ' + err.message })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.cleaner-modal {
  max-width: 680px;
  width: 90%;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
}

.header-title-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent);
  border-radius: var(--radius-md);
}

/* ========== Health Score Widget ========== */
.health-widget-card {
  margin: 8px 0;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.health-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.health-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.health-score-value {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;
  transition: color 0.4s ease;
}

.health-progress-bar-bg {
  width: 100%;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.health-progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease;
}

.health-summary-text {
  font-size: 12px;
  font-weight: 500;
}

.health-summary-text .good { color: #10b981; }
.health-summary-text .warn { color: var(--text-secondary); }

/* ========== Scrollable List ========== */
.cleaner-scroll-content {
  flex: 1;
  overflow-y: auto;
  min-height: 280px;
  max-height: 400px;
  padding: 8px 4px;
}

.tab-content-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.tab-actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.tab-pane-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  margin: 0;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-card {
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  transition: all 0.2s ease;
}

.issue-card:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
}

/* Duplicates view */
.duplicate-card {
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.issue-card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.duplicate-ids-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.duplicate-id-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-light);
}

/* Auto fix row styling */
.fix-row-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.text-comparison {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.original-text,
.suggested-text {
  font-size: 12px;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
}

.original-text code,
.suggested-text code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px;
}

.text-danger { color: var(--danger); font-weight: 500; }
.text-warn { color: var(--warning); font-weight: 500; }
.text-success { color: var(--success); font-weight: 500; }

.warn-badge {
  background: rgba(245, 158, 11, 0.1) !important;
  color: #f59e0b !important;
}

/* ========== Empty Tab State ========== */
.empty-tab-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 24px;
  text-align: center;
}

.empty-tab-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.empty-tab-icon.green {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.empty-tab-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.empty-tab-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

/* ========== Footer Stats ========== */
.footer-stats {
  font-size: 12px;
  color: var(--text-secondary);
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.outline-btn {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
}

.outline-btn:hover {
  background: var(--accent-light);
  color: var(--accent);
}

/* ========== High Contrast Button Overrides ========== */
.issues-list .btn-success {
  background: var(--success);
  color: #ffffff !important;
  border-color: var(--success);
}

.issues-list .btn-success:hover {
  background: var(--success);
  filter: brightness(0.9);
  border-color: var(--success);
}

.cleaner-modal .btn:disabled {
  background: var(--border-light) !important;
  color: var(--text-muted) !important;
  border-color: var(--border) !important;
  opacity: 0.75 !important;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
</style>

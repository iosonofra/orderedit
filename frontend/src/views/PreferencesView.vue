<template>
  <div class="settings-view">
    <div class="settings-header">
      <div class="settings-copy">
        <h1 class="settings-title">Impostazioni</h1>
        <p class="settings-desc">
          Configura le opzioni generali dell'editor, i preset corriere e il formato del nome file in export.
        </p>
      </div>
    </div>

    <div class="courier-section">
      <div class="courier-header">
        <h2 class="courier-title">Aspetto</h2>
        <p class="courier-desc">Scegli il tema dell'interfaccia.</p>
      </div>

      <div class="export-name-grid">
        <label class="export-name-label">Tema</label>
        <select v-model="themeMode" class="input export-name-select" @change="saveThemeMode">
          <option value="light">Chiaro</option>
          <option value="dark">Scuro</option>
        </select>

        <label class="export-name-label">Blocca griglia</label>
        <label class="toggle-row">
          <input v-model="freezePanesEnabled" type="checkbox" @change="saveFreezePanes" />
          <span>Intestazione e prime colonne</span>
        </label>

        <label class="export-name-label">Recupero automatico</label>
        <label class="toggle-row">
          <input v-model="recoveryEnabled" type="checkbox" @change="saveRecoveryEnabled" />
          <span>Ripristina sessione dopo chiusura o refresh</span>
        </label>
      </div>
    </div>

    <div class="courier-section">
      <div class="courier-header">
        <h2 class="courier-title">Preset nome corriere</h2>
        <p class="courier-desc">
          Questi valori compaiono in “Imposta corriere” nell'editor e si applicano alla colonna corriere.
        </p>
      </div>

      <div class="courier-add-row">
        <input
          v-model="newCourierPreset"
          class="input courier-input"
          placeholder="es. Corriere Express"
          @keyup.enter="addCourierPreset"
        />
        <button class="btn btn-primary" @click="addCourierPreset">Aggiungi preset</button>
      </div>

      <table class="data-table courier-table">
        <thead>
          <tr>
            <th>Nome preset</th>
            <th style="width: 160px; text-align: right">Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(preset, idx) in courierPresetStore.presets" :key="`${preset}-${idx}`">
            <td>
              <div v-if="editingCourierIndex === idx" class="edit-row">
                <input
                  v-model="editingCourierName"
                  class="input"
                  @keyup.enter="saveCourierPreset"
                  @keyup.escape="cancelCourierEdit"
                />
              </div>
              <span v-else>{{ preset }}</span>
            </td>
            <td style="text-align: right">
              <div class="action-btns" v-if="editingCourierIndex === idx">
                <button class="btn btn-success compact-btn" @click="saveCourierPreset">Salva</button>
                <button class="btn btn-icon" @click="cancelCourierEdit">x</button>
              </div>
              <div class="action-btns" v-else>
                <button class="btn btn-icon" @click="startCourierEdit(idx, preset)" title="Modifica">Modifica</button>
                <button class="btn btn-danger compact-btn" @click="removeCourierPreset(idx)" title="Elimina">
                  Elimina
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="courierPresetStore.presets.length === 0">
            <td colspan="2" class="empty-table-msg">Nessun preset corriere configurato.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="courier-section">
      <div class="courier-header">
        <h2 class="courier-title">Nome file in export</h2>
        <p class="courier-desc">Scegli come nominare il file quando clicchi “Scarica Excel”.</p>
      </div>

      <div class="export-name-grid">
        <label class="export-name-label">Modalità nome</label>
        <select v-model="exportMode" class="input export-name-select" @change="saveExportMode">
          <option value="same">Nome identico</option>
          <option value="timestamp">Nome + data/ora</option>
          <option value="suffix">Nome + suffisso</option>
        </select>

        <label class="export-name-label">Suffisso</label>
        <div class="suffix-row">
          <input
            v-model="exportSuffix"
            class="input"
            placeholder="es. _finale"
            @keyup.enter="saveExportSuffix"
          />
          <button class="btn btn-secondary" @click="saveExportSuffix">Salva</button>
        </div>

        <label class="export-name-label">Riepilogo modifiche</label>
        <label class="toggle-row">
          <input v-model="showExportSummary" type="checkbox" @change="saveShowExportSummary" />
          <span>Mostra confronto prima di scaricare</span>
        </label>

        <label class="export-name-label">Salvataggio</label>
        <label class="toggle-row">
          <input v-model="askExportSaveLocation" type="checkbox" @change="saveAskExportSaveLocation" />
          <span>Chiedi dove salvare il file</span>
        </label>
      </div>

      <div class="courier-desc">
        Anteprima: <strong>{{ spreadsheetStore.computeExportFilename(spreadsheetStore.filename || 'export.xlsx') }}</strong>
      </div>
    </div>

    <div class="courier-section">
      <div class="courier-header">
        <h2 class="courier-title">Backup export</h2>
        <p class="courier-desc">Ogni export viene salvato anche come copia locale nella cartella backup del backend.</p>
      </div>

      <div class="backup-row">
        <div class="backup-info">
          <strong>{{ backupStats.count }}</strong> file
          <span>{{ formatBytes(backupStats.totalBytes) }}</span>
        </div>
        <button class="btn btn-secondary" @click="loadBackupStats" :disabled="backupLoading">Aggiorna</button>
        <button class="btn btn-danger" @click="deleteBackups" :disabled="backupLoading || backupStats.count === 0">
          Elimina backup
        </button>
      </div>

      <div class="export-name-grid backup-options">
        <label class="export-name-label">Backup automatico</label>
        <label class="toggle-row">
          <input v-model="backupEnabled" type="checkbox" @change="saveBackupEnabled" />
          <span>Salva una copia locale a ogni export</span>
        </label>

        <label class="export-name-label">Mantieni ultimi</label>
        <div class="suffix-row">
          <input
            v-model.number="backupLimit"
            class="input compact-number"
            type="number"
            min="1"
            max="500"
            :disabled="!backupEnabled"
            @keyup.enter="saveBackupLimit"
          />
          <button class="btn btn-secondary" :disabled="!backupEnabled" @click="saveBackupLimit">Salva</button>
        </div>
      </div>
    </div>

    <div class="courier-section">
      <div class="courier-header">
        <h2 class="courier-title">Notifiche</h2>
        <p class="courier-desc">Configura posizione, durata e filtro dei messaggi mostrati nell'app.</p>
      </div>

      <div class="export-name-grid">
        <label class="export-name-label">Posizione</label>
        <select v-model="notificationPosition" class="input export-name-select" @change="saveNotificationPosition">
          <option value="bottom-right">Basso destra</option>
          <option value="bottom-center">Basso centro</option>
        </select>

        <label class="export-name-label">Durata</label>
        <div class="suffix-row">
          <input
            v-model.number="notificationDuration"
            class="input compact-number"
            type="number"
            min="0"
            max="30000"
            step="500"
            @keyup.enter="saveNotificationDuration"
          />
          <button class="btn btn-secondary" @click="saveNotificationDuration">Salva</button>
        </div>

        <label class="export-name-label">Mostra</label>
        <select v-model="notificationLevel" class="input export-name-select" @change="saveNotificationLevel">
          <option value="all">Tutte</option>
          <option value="warning">Solo avvisi ed errori</option>
          <option value="error">Solo errori</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/index.js'
import { useCourierPresetStore } from '../stores/courierPresets.js'
import { useSpreadsheetStore } from '../stores/spreadsheet.js'
import { useNotificationStore } from '../stores/notification.js'

const notificationStore = useNotificationStore()
const courierPresetStore = useCourierPresetStore()
const spreadsheetStore = useSpreadsheetStore()

const newCourierPreset = ref('')
const editingCourierIndex = ref(-1)
const editingCourierName = ref('')
const exportMode = ref('same')
const exportSuffix = ref('_modified')
const showExportSummary = ref(true)
const askExportSaveLocation = ref(true)
const themeMode = ref('light')
const freezePanesEnabled = ref(true)
const recoveryEnabled = ref(true)
const backupLoading = ref(false)
const backupStats = ref({ count: 0, totalBytes: 0 })
const backupEnabled = ref(true)
const backupLimit = ref(50)
const notificationPosition = ref('bottom-right')
const notificationDuration = ref(5000)
const notificationLevel = ref('all')

onMounted(() => {
  courierPresetStore.load()
  spreadsheetStore.loadExportPrefs()
  spreadsheetStore.loadEditorPrefs()
  exportMode.value = spreadsheetStore.exportNamingMode
  exportSuffix.value = spreadsheetStore.exportSuffix
  showExportSummary.value = spreadsheetStore.showExportSummary
  askExportSaveLocation.value = spreadsheetStore.askExportSaveLocation
  freezePanesEnabled.value = spreadsheetStore.freezePanesEnabled
  recoveryEnabled.value = spreadsheetStore.recoveryEnabled
  backupEnabled.value = spreadsheetStore.backupEnabled
  backupLimit.value = spreadsheetStore.backupLimit
  notificationStore.loadPrefs()
  notificationPosition.value = notificationStore.position
  notificationDuration.value = notificationStore.duration
  notificationLevel.value = notificationStore.level
  try {
    const savedTheme = localStorage.getItem('orderedit:theme')
    themeMode.value = savedTheme === 'dark' ? 'dark' : 'light'
  } catch {
    themeMode.value = 'light'
  }
  loadBackupStats()
})

function addCourierPreset() {
  const value = newCourierPreset.value.trim()
  if (!value) {
    notificationStore.show({ type: 'warning', message: 'Inserisci un nome preset valido.' })
    return
  }
  if (!courierPresetStore.add(value)) {
    notificationStore.show({ type: 'warning', message: 'Preset già presente o non valido.' })
    return
  }
  newCourierPreset.value = ''
  notificationStore.show({ type: 'success', message: 'Preset corriere aggiunto.' })
}

function startCourierEdit(index, value) {
  editingCourierIndex.value = index
  editingCourierName.value = value
}

function cancelCourierEdit() {
  editingCourierIndex.value = -1
  editingCourierName.value = ''
}

function saveCourierPreset() {
  if (editingCourierIndex.value < 0) return
  if (!courierPresetStore.update(editingCourierIndex.value, editingCourierName.value)) {
    notificationStore.show({ type: 'warning', message: 'Valore non valido o duplicato.' })
    return
  }
  notificationStore.show({ type: 'success', message: 'Preset corriere aggiornato.' })
  cancelCourierEdit()
}

function removeCourierPreset(index) {
  if (!window.confirm('Eliminare questo preset corriere?')) return
  if (!courierPresetStore.remove(index)) return
  notificationStore.show({ type: 'success', message: 'Preset corriere eliminato.' })
  if (editingCourierIndex.value === index) cancelCourierEdit()
}

function saveExportMode() {
  spreadsheetStore.setExportNamingMode(exportMode.value)
  notificationStore.show({ type: 'success', message: 'Modalità nome export aggiornata.' })
}

function saveExportSuffix() {
  spreadsheetStore.setExportSuffix(exportSuffix.value)
  exportSuffix.value = spreadsheetStore.exportSuffix
  notificationStore.show({ type: 'success', message: 'Suffisso export aggiornato.' })
}

function saveShowExportSummary() {
  spreadsheetStore.setShowExportSummary(showExportSummary.value)
  notificationStore.show({
    type: 'success',
    message: showExportSummary.value ? 'Riepilogo export attivato.' : 'Riepilogo export disattivato.',
  })
}

function saveAskExportSaveLocation() {
  spreadsheetStore.setAskExportSaveLocation(askExportSaveLocation.value)
  notificationStore.show({
    type: 'success',
    message: askExportSaveLocation.value
      ? 'Scelta cartella export attivata.'
      : 'Download automatico export attivato.',
  })
}

function saveThemeMode() {
  const next = themeMode.value === 'dark' ? 'dark' : 'light'
  try {
    localStorage.setItem('orderedit:theme', next)
  } catch {}
  document.documentElement.setAttribute('data-theme', next)
  notificationStore.show({ type: 'success', message: `Tema ${next === 'dark' ? 'scuro' : 'chiaro'} attivato.` })
}

function saveFreezePanes() {
  spreadsheetStore.setFreezePanesEnabled(freezePanesEnabled.value)
  notificationStore.show({
    type: 'success',
    message: freezePanesEnabled.value ? 'Blocco griglia attivato.' : 'Blocco griglia disattivato.',
  })
}

function saveRecoveryEnabled() {
  spreadsheetStore.setRecoveryEnabled(recoveryEnabled.value)
  notificationStore.show({
    type: 'success',
    message: recoveryEnabled.value
      ? 'Recupero automatico attivato.'
      : 'Recupero automatico disattivato e sessione salvata rimossa.',
  })
}

function saveBackupEnabled() {
  spreadsheetStore.setBackupEnabled(backupEnabled.value)
  notificationStore.show({
    type: 'success',
    message: backupEnabled.value ? 'Backup export attivato.' : 'Backup export disattivato.',
  })
}

function saveBackupLimit() {
  spreadsheetStore.setBackupLimit(backupLimit.value)
  backupLimit.value = spreadsheetStore.backupLimit
  notificationStore.show({ type: 'success', message: `Verranno mantenuti gli ultimi ${backupLimit.value} backup.` })
}

function saveNotificationPosition() {
  notificationStore.setPosition(notificationPosition.value)
  notificationStore.show({ type: 'success', message: 'Posizione notifiche aggiornata.' })
}

function saveNotificationDuration() {
  notificationStore.setDuration(notificationDuration.value)
  notificationDuration.value = notificationStore.duration
  notificationStore.show({ type: 'success', message: 'Durata notifiche aggiornata.' })
}

function saveNotificationLevel() {
  notificationStore.setLevel(notificationLevel.value)
  notificationStore.show({ type: 'success', message: 'Filtro notifiche aggiornato.' })
}

function formatBytes(bytes) {
  const value = Number(bytes || 0)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

async function loadBackupStats() {
  backupLoading.value = true
  try {
    const { data } = await api.get('/xlsx/backups')
    backupStats.value = {
      count: Number(data?.count || 0),
      totalBytes: Number(data?.totalBytes || 0),
    }
  } finally {
    backupLoading.value = false
  }
}

async function deleteBackups() {
  if (!window.confirm('Eliminare tutti i backup degli export?')) return
  backupLoading.value = true
  try {
    const { data } = await api.delete('/xlsx/backups')
    backupStats.value = { count: 0, totalBytes: 0 }
    notificationStore.show({ type: 'success', message: `Backup eliminati: ${data?.deleted || 0}` })
  } finally {
    backupLoading.value = false
  }
}
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding: 16px;
  gap: 14px;
}

.settings-header {
  padding: 0;
}

.settings-copy {
  min-width: 0;
}

.settings-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 4px;
}

.settings-desc {
  max-width: 680px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
}

.courier-section {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-card);
}

.courier-header {
  margin-bottom: 10px;
}

.courier-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.courier-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.courier-add-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.courier-input {
  max-width: 420px;
}

.courier-table {
  margin-top: 0;
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

.empty-table-msg {
  text-align: center;
  color: var(--text-muted);
  padding: 28px !important;
  font-size: 13px;
}

.export-name-grid {
  display: grid;
  grid-template-columns: 130px minmax(220px, 320px);
  gap: 8px 10px;
  align-items: center;
  margin-bottom: 10px;
}

.export-name-label {
  font-size: 12px;
  color: var(--text-muted);
}

.export-name-select {
  max-width: 320px;
}

.suffix-row {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 420px;
}

.toggle-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 12px;
}

.backup-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.backup-options {
  margin-top: 12px;
}

.compact-number {
  max-width: 120px;
}

.backup-info {
  min-width: 160px;
  color: var(--text-secondary);
  font-size: 12px;
}

.backup-info span {
  margin-left: 8px;
  color: var(--text-muted);
}
</style>

import { defineStore } from 'pinia'

const RECOVERY_KEY = 'orderedit:recovery:v1'
const CHECKPOINT_LIMIT = 40
const EXPORT_PREFS_KEY = 'orderedit:export-filename:v1'
const EDITOR_PREFS_KEY = 'orderedit:editor-prefs:v1'
const LAYOUTS_KEY = 'orderedit:file-layouts:v1'

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function splitBaseAndExt(filename) {
  const raw = String(filename || '').trim()
  if (!raw) return { base: 'export', ext: '.xlsx' }
  if (/\.xlsx$/i.test(raw)) return { base: raw.slice(0, -5), ext: '.xlsx' }
  return { base: raw, ext: '.xlsx' }
}

function nowStamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
}

export const useSpreadsheetStore = defineStore('spreadsheet', {
  state: () => ({
    sheets: [],
    originalSheets: [],
    filename: null,
    exportFilename: null,
    activeSheetIndex: 0,
    selectedRange: null,
    structureChanges: [],
    exportNamingMode: 'same', // same | timestamp | suffix
    exportSuffix: '_modified',
    showExportSummary: true,
    askExportSaveLocation: true,
    backupEnabled: true,
    backupLimit: 50,
    freezePanesEnabled: true,
    recoveryEnabled: true,
    hasData: false,
    isUnsaved: false,
    checkpoints: [],
    checkpointIndex: -1,
    lastSavedAt: null,
    recoveryLoaded: false,
  }),
  actions: {
    loadExportPrefs() {
      try {
        const raw = localStorage.getItem(EXPORT_PREFS_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        const mode = parsed?.mode
        const suffix = String(parsed?.suffix ?? '').trim()
        if (mode === 'same' || mode === 'timestamp' || mode === 'suffix') this.exportNamingMode = mode
        if (suffix) this.exportSuffix = suffix
        if (typeof parsed?.showExportSummary === 'boolean') this.showExportSummary = parsed.showExportSummary
        if (typeof parsed?.askExportSaveLocation === 'boolean') this.askExportSaveLocation = parsed.askExportSaveLocation
        if (typeof parsed?.backupEnabled === 'boolean') this.backupEnabled = parsed.backupEnabled
        if (Number.isFinite(Number(parsed?.backupLimit))) this.backupLimit = Math.max(0, Math.min(500, Number(parsed.backupLimit)))
      } catch {}
      this.refreshExportFilename()
    },
    loadEditorPrefs() {
      try {
        const raw = localStorage.getItem(EDITOR_PREFS_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        if (typeof parsed?.freezePanesEnabled === 'boolean') {
          this.freezePanesEnabled = parsed.freezePanesEnabled
        }
        if (typeof parsed?.recoveryEnabled === 'boolean') {
          this.recoveryEnabled = parsed.recoveryEnabled
        }
      } catch {}
    },
    saveEditorPrefs() {
      try {
        localStorage.setItem(EDITOR_PREFS_KEY, JSON.stringify({
          freezePanesEnabled: this.freezePanesEnabled,
          recoveryEnabled: this.recoveryEnabled,
        }))
      } catch {}
    },
    setFreezePanesEnabled(enabled) {
      this.freezePanesEnabled = Boolean(enabled)
      this.saveEditorPrefs()
    },
    setRecoveryEnabled(enabled) {
      this.recoveryEnabled = Boolean(enabled)
      this.saveEditorPrefs()
      if (!this.recoveryEnabled) {
        this.clearRecovery()
        return
      }
      if (this.hasData && this.filename) this.persistRecovery()
    },
    saveExportPrefs() {
      try {
        localStorage.setItem(EXPORT_PREFS_KEY, JSON.stringify({
          mode: this.exportNamingMode,
          suffix: this.exportSuffix,
          showExportSummary: this.showExportSummary,
          askExportSaveLocation: this.askExportSaveLocation,
          backupEnabled: this.backupEnabled,
          backupLimit: this.backupLimit,
        }))
      } catch {}
    },
    setExportNamingMode(mode) {
      if (!['same', 'timestamp', 'suffix'].includes(mode)) return
      this.exportNamingMode = mode
      this.saveExportPrefs()
      this.refreshExportFilename()
    },
    setShowExportSummary(enabled) {
      this.showExportSummary = Boolean(enabled)
      this.saveExportPrefs()
    },
    setAskExportSaveLocation(enabled) {
      this.askExportSaveLocation = Boolean(enabled)
      this.saveExportPrefs()
    },
    setBackupEnabled(enabled) {
      this.backupEnabled = Boolean(enabled)
      this.saveExportPrefs()
    },
    setBackupLimit(limit) {
      const value = Math.max(0, Math.min(500, Number.parseInt(limit, 10) || 0))
      this.backupLimit = value
      this.saveExportPrefs()
    },
    setExportSuffix(suffix) {
      const next = String(suffix ?? '').trim()
      this.exportSuffix = next || '_modified'
      this.saveExportPrefs()
      this.refreshExportFilename()
    },
    computeExportFilename(sourceFilename) {
      const { base, ext } = splitBaseAndExt(sourceFilename || this.filename || 'export.xlsx')
      if (this.exportNamingMode === 'timestamp') return `${base}_${nowStamp()}${ext}`
      if (this.exportNamingMode === 'suffix') return `${base}${this.exportSuffix || '_modified'}${ext}`
      return `${base}${ext}`
    },
    refreshExportFilename() {
      this.exportFilename = this.computeExportFilename(this.filename || 'export.xlsx')
    },
    loadSheets(sheets, filename) {
      const originalCleanSheets = clone(sheets || [])
      const cleanSheets = clone(sheets || [])
      this.activeSheetIndex = 0
      this.applySavedLayout(cleanSheets, filename)
      this.sheets = cleanSheets
      this.originalSheets = originalCleanSheets
      this.filename = filename
      this.refreshExportFilename()
      this.hasData = cleanSheets && cleanSheets.length > 0
      this.selectedRange = null
      this.structureChanges = []
      this.isUnsaved = false
      this.lastSavedAt = Date.now()
      this.resetCheckpoints(cleanSheets)
      this.persistRecovery()
    },
    loadRecoveredState(payload) {
      if (!payload || !Array.isArray(payload.sheets) || !payload.filename) return false
      this.sheets = clone(payload.sheets)
      this.originalSheets = Array.isArray(payload.originalSheets) && payload.originalSheets.length > 0
        ? clone(payload.originalSheets)
        : clone(payload.sheets)
      this.filename = payload.filename
      this.refreshExportFilename()
      this.hasData = this.sheets.length > 0
      this.activeSheetIndex = Number.isInteger(payload.activeSheetIndex) ? payload.activeSheetIndex : 0
      if (this.activeSheetIndex >= this.sheets.length) this.activeSheetIndex = 0
      this.selectedRange = null
      this.structureChanges = Array.isArray(payload.structureChanges) ? clone(payload.structureChanges) : []
      this.isUnsaved = payload.isUnsaved !== false
      this.lastSavedAt = Date.now()
      this.checkpoints = Array.isArray(payload.checkpoints) ? clone(payload.checkpoints) : []
      this.checkpointIndex = Number.isInteger(payload.checkpointIndex) ? payload.checkpointIndex : this.checkpoints.length - 1
      if (this.checkpoints.length === 0 && this.sheets.length > 0) this.resetCheckpoints(this.sheets)
      this.recoveryLoaded = true
      return true
    },
    setActiveSheetIndex(index) {
      const next = Number.isInteger(index) ? index : 0
      if (next < 0 || next >= this.sheets.length) return
      this.activeSheetIndex = next
      this.selectedRange = null
      this.persistLayout()
    },
    setSelectedRange(range) {
      if (!range) {
        this.selectedRange = null
        return
      }
      const rowStart = Math.min(range.rowStart, range.rowEnd)
      const rowEnd = Math.max(range.rowStart, range.rowEnd)
      const colStart = Math.min(range.colStart, range.colEnd)
      const colEnd = Math.max(range.colStart, range.colEnd)
      this.selectedRange = { rowStart, rowEnd, colStart, colEnd }
    },
    updateCell(sheetIndex, rowIndex, colIndex, cell) {
      if (!Number.isInteger(sheetIndex) || !Number.isInteger(rowIndex) || !Number.isInteger(colIndex)) return
      if (!this.sheets[sheetIndex]) return
      const sheet = this.sheets[sheetIndex]
      if (!Array.isArray(sheet.data)) sheet.data = []
      if (!Array.isArray(sheet.data[rowIndex])) sheet.data[rowIndex] = []
      sheet.data[rowIndex][colIndex] = clone(cell)
      sheet.row = Math.max(Number(sheet.row || 0), rowIndex + 1)
      sheet.column = Math.max(Number(sheet.column || 0), colIndex + 1)
      this.hasData = true
      this.isUnsaved = true
    },
    recordStructureChange(change) {
      if (!change || typeof change !== 'object') return
      this.structureChanges.push(clone(change))
      this.isUnsaved = true
    },
    readRecovery() {
      if (!this.recoveryEnabled) return null
      try {
        const raw = localStorage.getItem(RECOVERY_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (!parsed || !Array.isArray(parsed.sheets) || !parsed.filename) return null
        return parsed
      } catch {
        return null
      }
    },
    persistRecovery() {
      if (!this.recoveryEnabled) {
        this.persistLayout()
        return
      }
      try {
        if (!this.hasData || !this.filename) return
        localStorage.setItem(RECOVERY_KEY, JSON.stringify({
          filename: this.filename,
          sheets: this.sheets,
          originalSheets: this.originalSheets,
          structureChanges: this.structureChanges,
          activeSheetIndex: this.activeSheetIndex,
          checkpoints: this.checkpoints,
          checkpointIndex: this.checkpointIndex,
          isUnsaved: this.isUnsaved,
          ts: Date.now(),
        }))
      } catch {}
      this.persistLayout()
    },
    persistRecoverySnapshot(sheetsSnapshot) {
      if (!this.recoveryEnabled) {
        this.persistLayout(sheetsSnapshot)
        return
      }
      try {
        if (!this.filename || !Array.isArray(sheetsSnapshot) || sheetsSnapshot.length === 0) return
        localStorage.setItem(RECOVERY_KEY, JSON.stringify({
          filename: this.filename,
          sheets: clone(sheetsSnapshot),
          originalSheets: this.originalSheets,
          structureChanges: this.structureChanges,
          activeSheetIndex: this.activeSheetIndex,
          checkpoints: this.checkpoints,
          checkpointIndex: this.checkpointIndex,
          isUnsaved: this.isUnsaved,
          ts: Date.now(),
        }))
      } catch {}
      this.persistLayout(sheetsSnapshot)
    },
    layoutKey(filename = this.filename) {
      return String(filename || '').trim().toLowerCase()
    },
    readLayouts() {
      try {
        const raw = localStorage.getItem(LAYOUTS_KEY)
        const parsed = raw ? JSON.parse(raw) : {}
        return parsed && typeof parsed === 'object' ? parsed : {}
      } catch {
        return {}
      }
    },
    writeLayouts(layouts) {
      try {
        localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts || {}))
      } catch {}
    },
    applySavedLayout(sheets, filename = this.filename) {
      const key = this.layoutKey(filename)
      if (!key || !Array.isArray(sheets)) return
      const layout = this.readLayouts()[key]
      if (!layout || typeof layout !== 'object') return
      if (Number.isInteger(layout.activeSheetIndex) && layout.activeSheetIndex >= 0 && layout.activeSheetIndex < sheets.length) {
        this.activeSheetIndex = layout.activeSheetIndex
      }
      const sheetLayouts = Array.isArray(layout.sheets) ? layout.sheets : []
      sheets.forEach((sheet, idx) => {
        const sheetLayout = sheetLayouts[idx]
        if (!sheetLayout || typeof sheetLayout !== 'object') return
        if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
        if (sheetLayout.manualColumnWidthsPx && typeof sheetLayout.manualColumnWidthsPx === 'object') {
          sheet.config.manualColumnWidthsPx = clone(sheetLayout.manualColumnWidthsPx)
        }
      })
    },
    persistLayout(sheetsSnapshot = this.sheets) {
      const key = this.layoutKey()
      if (!key || !Array.isArray(sheetsSnapshot) || sheetsSnapshot.length === 0) return
      const layouts = this.readLayouts()
      layouts[key] = {
        activeSheetIndex: this.activeSheetIndex,
        sheets: sheetsSnapshot.map((sheet) => ({
          manualColumnWidthsPx: sheet?.config?.manualColumnWidthsPx || {},
        })),
        ts: Date.now(),
      }
      this.writeLayouts(layouts)
    },
    clearRecovery() {
      try {
        localStorage.removeItem(RECOVERY_KEY)
      } catch {}
    },
    resetCheckpoints(sheets) {
      const first = this.createCheckpoint(sheets || [])
      this.checkpoints = first ? [first] : []
      this.checkpointIndex = this.checkpoints.length - 1
    },
    createCheckpoint(sheets = this.sheets) {
      const sheetSnapshot = clone(sheets || [])
      if (sheetSnapshot.length === 0) return null
      return {
        sheets: sheetSnapshot,
        structureChanges: clone(this.structureChanges || []),
      }
    },
    restoreCheckpoint(checkpoint) {
      if (Array.isArray(checkpoint)) {
        this.sheets = clone(checkpoint)
        this.structureChanges = []
        return
      }
      this.sheets = clone(checkpoint?.sheets || [])
      this.structureChanges = Array.isArray(checkpoint?.structureChanges) ? clone(checkpoint.structureChanges) : []
    },
    pushCheckpoint(sheets, { markUnsaved = true } = {}) {
      if (!Array.isArray(sheets) || sheets.length === 0) return
      const snap = this.createCheckpoint(sheets)
      const current = this.checkpoints[this.checkpointIndex]
      if (current && JSON.stringify(current) === JSON.stringify(snap)) return

      if (this.checkpointIndex < this.checkpoints.length - 1) {
        this.checkpoints = this.checkpoints.slice(0, this.checkpointIndex + 1)
      }

      this.checkpoints.push(snap)
      if (this.checkpoints.length > CHECKPOINT_LIMIT) {
        this.checkpoints.shift()
      }
      this.checkpointIndex = this.checkpoints.length - 1
      if (markUnsaved) this.isUnsaved = true
      this.persistRecovery()
    },
    undo() {
      if (this.checkpointIndex <= 0) return false
      this.checkpointIndex -= 1
      this.restoreCheckpoint(this.checkpoints[this.checkpointIndex])
      this.hasData = this.sheets.length > 0
      if (this.activeSheetIndex >= this.sheets.length) this.activeSheetIndex = 0
      this.selectedRange = null
      this.isUnsaved = true
      this.persistRecovery()
      return true
    },
    redo() {
      if (this.checkpointIndex >= this.checkpoints.length - 1) return false
      this.checkpointIndex += 1
      this.restoreCheckpoint(this.checkpoints[this.checkpointIndex])
      this.hasData = this.sheets.length > 0
      if (this.activeSheetIndex >= this.sheets.length) this.activeSheetIndex = 0
      this.selectedRange = null
      this.isUnsaved = true
      this.persistRecovery()
      return true
    },
    markExported(sheets) {
      if (Array.isArray(sheets) && sheets.length > 0) {
        this.sheets = clone(sheets)
        this.originalSheets = clone(sheets)
        this.structureChanges = []
        if (this.activeSheetIndex >= this.sheets.length) this.activeSheetIndex = 0
        this.selectedRange = null
        this.pushCheckpoint(this.sheets, { markUnsaved: false })
      }
      this.isUnsaved = false
      this.lastSavedAt = Date.now()
      this.persistRecovery()
    },
    setInstance(inst) {
      this.instance = inst
    },
    clear() {
      this.sheets = []
      this.originalSheets = []
      this.filename = null
      this.exportFilename = 'export.xlsx'
      this.activeSheetIndex = 0
      this.selectedRange = null
      this.structureChanges = []
      this.hasData = false
      this.isUnsaved = false
      this.checkpoints = []
      this.checkpointIndex = -1
      this.lastSavedAt = null
      this.clearRecovery()
    },
  },
})

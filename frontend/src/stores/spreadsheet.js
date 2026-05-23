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
    // Real-time search highlights
    searchQuery: '',
    searchRegex: false,
    searchCase: false,
    columnFilter: '',
    columnFilters: {},
    // Keyboard shortcuts legend
    showShortcutsOverlay: false,
    // Processing / loading state
    isProcessing: false,
    // Premium enhancements options
    showVisualDiff: false,
    autoFitOnLoad: true,
    highlightKeyColumns: false,
    // Custom column mappings
    idHeaderName: 'ID prodotto',
    nameHeaderName: 'Nome del prodotto',
    courierHeaderName: 'Nome corriere',
    eanHeaderName: 'EAN',
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
        if (typeof parsed?.showVisualDiff === 'boolean') {
          this.showVisualDiff = parsed.showVisualDiff
        }
        if (typeof parsed?.autoFitOnLoad === 'boolean') {
          this.autoFitOnLoad = parsed.autoFitOnLoad
        }
        if (typeof parsed?.highlightKeyColumns === 'boolean') {
          this.highlightKeyColumns = parsed.highlightKeyColumns
        }
        if (typeof parsed?.idHeaderName === 'string' && parsed.idHeaderName.trim()) {
          this.idHeaderName = parsed.idHeaderName.trim()
        }
        if (typeof parsed?.nameHeaderName === 'string' && parsed.nameHeaderName.trim()) {
          this.nameHeaderName = parsed.nameHeaderName.trim()
        }
        if (typeof parsed?.courierHeaderName === 'string' && parsed.courierHeaderName.trim()) {
          this.courierHeaderName = parsed.courierHeaderName.trim()
        }
        if (typeof parsed?.eanHeaderName === 'string' && parsed.eanHeaderName.trim()) {
          this.eanHeaderName = parsed.eanHeaderName.trim()
        }
      } catch {}
    },
    saveEditorPrefs() {
      try {
        localStorage.setItem(EDITOR_PREFS_KEY, JSON.stringify({
          freezePanesEnabled: this.freezePanesEnabled,
          recoveryEnabled: this.recoveryEnabled,
          showVisualDiff: this.showVisualDiff,
          autoFitOnLoad: this.autoFitOnLoad,
          highlightKeyColumns: this.highlightKeyColumns,
          idHeaderName: this.idHeaderName,
          nameHeaderName: this.nameHeaderName,
          courierHeaderName: this.courierHeaderName,
          eanHeaderName: this.eanHeaderName,
        }))
      } catch {}
    },
    updateColumnMappings(mappings) {
      if (mappings.idHeaderName) this.idHeaderName = mappings.idHeaderName.trim()
      if (mappings.nameHeaderName) this.nameHeaderName = mappings.nameHeaderName.trim()
      if (mappings.courierHeaderName) this.courierHeaderName = mappings.courierHeaderName.trim()
      if (mappings.eanHeaderName) this.eanHeaderName = mappings.eanHeaderName.trim()
      this.saveEditorPrefs()
    },
    setShowVisualDiff(val) {
      this.showVisualDiff = Boolean(val)
      this.saveEditorPrefs()
    },
    setAutoFitOnLoad(val) {
      this.autoFitOnLoad = Boolean(val)
      this.saveEditorPrefs()
    },
    setHighlightKeyColumns(val) {
      this.highlightKeyColumns = Boolean(val)
      this.saveEditorPrefs()
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
    adjustMergesForDeletedRows(sheet, start, count) {
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
      this.rebuildMergeMarkers(sheet)
    },
    adjustMergesForDeletedColumns(sheet, start, count) {
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
      this.rebuildMergeMarkers(sheet)
    },
    adjustMergesForInsertedRows(sheet, start, count) {
      const mergeCfg = sheet?.config?.merge
      if (!mergeCfg || typeof mergeCfg !== 'object') return
      const next = {}
      Object.values(mergeCfg).forEach((merge) => {
        if (!merge || !Number.isInteger(merge.r) || !Number.isInteger(merge.c)) return
        let r = merge.r
        let rs = merge.rs
        if (merge.r >= start) {
          r = merge.r + count
        } else if (merge.r + merge.rs > start) {
          rs = merge.rs + count
        }
        const shifted = { ...merge, r, rs }
        next[`${shifted.r}_${shifted.c}`] = shifted
      })
      sheet.config.merge = next
      this.rebuildMergeMarkers(sheet)
    },
    adjustMergesForInsertedColumns(sheet, start, count) {
      const mergeCfg = sheet?.config?.merge
      if (!mergeCfg || typeof mergeCfg !== 'object') return
      const next = {}
      Object.values(mergeCfg).forEach((merge) => {
        if (!merge || !Number.isInteger(merge.r) || !Number.isInteger(merge.c)) return
        let c = merge.c
        let cs = merge.cs
        if (merge.c >= start) {
          c = merge.c + count
        } else if (merge.c + merge.cs > start) {
          cs = merge.cs + count
        }
        const shifted = { ...merge, c, cs }
        next[`${shifted.r}_${shifted.c}`] = shifted
      })
      sheet.config.merge = next
      this.rebuildMergeMarkers(sheet)
    },
    clearCellMergeMarkers(sheet) {
      if (!sheet || !Array.isArray(sheet.data)) return
      sheet.data.forEach((row) => {
        if (!Array.isArray(row)) return
        row.forEach((cell) => {
          if (cell && typeof cell === 'object' && 'mc' in cell) delete cell.mc
        })
      })
    },
    applyMergeMarkers(sheet) {
      if (!sheet?.config?.merge || typeof sheet.config.merge !== 'object') return
      Object.entries(sheet.config.merge).forEach(([key, merge]) => {
        if (!merge || !Number.isInteger(merge.r) || !Number.isInteger(merge.c)) return
        if (!Array.isArray(sheet.data)) sheet.data = []
        for (let r = merge.r; r < merge.r + merge.rs; r++) {
          if (!Array.isArray(sheet.data[r])) sheet.data[r] = []
          for (let c = merge.c; c < merge.c + merge.cs; c++) {
            const cell = sheet.data[r][c] || { v: '', m: '', w: '', ct: { fa: '@', t: 's' } }
            sheet.data[r][c] = {
              ...cell,
              mc: r === merge.r && c === merge.c
                ? { r: merge.r, c: merge.c, rs: merge.rs, cs: merge.cs }
                : { r: merge.r, c: merge.c },
            }
          }
        }
      })
    },
    rebuildMergeMarkers(sheet) {
      this.clearCellMergeMarkers(sheet)
      this.applyMergeMarkers(sheet)
    },
    shiftColumnWidthConfig(config, start, count, isInsert = false) {
      if (!config || typeof config !== 'object') return {}
      const next = {}
      Object.entries(config).forEach(([key, value]) => {
        const idx = Number.parseInt(key, 10)
        if (!Number.isInteger(idx)) return
        if (isInsert) {
          if (idx >= start) {
            next[idx + count] = value
          } else {
            next[idx] = value
          }
        } else {
          if (idx >= start && idx < start + count) return
          const nextIdx = idx >= start + count ? idx - count : idx
          next[nextIdx] = value
        }
      })
      return next
    },
    insertRowsAction(sheetIndex, rowIndex, count = 1) {
      if (!this.sheets[sheetIndex]) return
      const sheet = this.sheets[sheetIndex]
      if (!Array.isArray(sheet.data)) sheet.data = []
      
      const newRows = Array.from({ length: count }, () => Array(sheet.column || 12).fill(null))
      sheet.data.splice(rowIndex, 0, ...newRows)
      sheet.row = Math.max(1, Number(sheet.row || 0) + count)
      
      if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
      this.adjustMergesForInsertedRows(sheet, rowIndex, count)
      
      this.recordStructureChange({
        sheetIndex,
        name: sheet.name,
        type: 'insertRows',
        index: rowIndex,
        count
      })
      this.isUnsaved = true
      this.pushCheckpoint(this.sheets)
      this.persistRecoverySnapshot(this.sheets)
    },
    deleteRowsAction(sheetIndex, rowIndex, count = 1) {
      if (!this.sheets[sheetIndex]) return
      const sheet = this.sheets[sheetIndex]
      if (!Array.isArray(sheet.data)) return
      
      sheet.data.splice(rowIndex, count)
      sheet.row = Math.max(1, Number(sheet.row || 0) - count)
      
      if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
      this.adjustMergesForDeletedRows(sheet, rowIndex, count)
      
      this.recordStructureChange({
        sheetIndex,
        name: sheet.name,
        type: 'deleteRows',
        index: rowIndex,
        count
      })
      this.isUnsaved = true
      this.pushCheckpoint(this.sheets)
      this.persistRecoverySnapshot(this.sheets)
    },
    insertColumnsAction(sheetIndex, colIndex, count = 1) {
      if (!this.sheets[sheetIndex]) return
      const sheet = this.sheets[sheetIndex]
      if (!Array.isArray(sheet.data)) return
      
      sheet.data.forEach((row) => {
        if (Array.isArray(row)) {
          row.splice(colIndex, 0, ...Array(count).fill(null))
        }
      })
      sheet.column = Math.max(1, Number(sheet.column || 0) + count)
      
      if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
      sheet.config.columnWidthsPx = this.shiftColumnWidthConfig(sheet.config.columnWidthsPx, colIndex, count, true)
      sheet.config.manualColumnWidthsPx = this.shiftColumnWidthConfig(sheet.config.manualColumnWidthsPx, colIndex, count, true)
      this.adjustMergesForInsertedColumns(sheet, colIndex, count)
      
      this.recordStructureChange({
        sheetIndex,
        name: sheet.name,
        type: 'insertColumns',
        index: colIndex,
        count
      })
      this.isUnsaved = true
      this.pushCheckpoint(this.sheets)
      this.persistRecoverySnapshot(this.sheets)
    },
    deleteColumnsAction(sheetIndex, colIndex, count = 1) {
      if (!this.sheets[sheetIndex]) return
      const sheet = this.sheets[sheetIndex]
      if (!Array.isArray(sheet.data)) return
      
      sheet.data.forEach((row) => {
        if (Array.isArray(row)) {
          row.splice(colIndex, count)
        }
      })
      sheet.column = Math.max(1, Number(sheet.column || 0) - count)
      
      if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
      sheet.config.columnWidthsPx = this.shiftColumnWidthConfig(sheet.config.columnWidthsPx, colIndex, count, false)
      sheet.config.manualColumnWidthsPx = this.shiftColumnWidthConfig(sheet.config.manualColumnWidthsPx, colIndex, count, false)
      this.adjustMergesForDeletedColumns(sheet, colIndex, count)
      
      this.recordStructureChange({
        sheetIndex,
        name: sheet.name,
        type: 'deleteColumns',
        index: colIndex,
        count
      })
      this.isUnsaved = true
      this.pushCheckpoint(this.sheets)
      this.persistRecoverySnapshot(this.sheets)
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
    exportSettingsData() {
      return {
        exportNamingMode: this.exportNamingMode,
        exportSuffix: this.exportSuffix,
        showExportSummary: this.showExportSummary,
        askExportSaveLocation: this.askExportSaveLocation,
        backupEnabled: this.backupEnabled,
        backupLimit: this.backupLimit,
        freezePanesEnabled: this.freezePanesEnabled,
        recoveryEnabled: this.recoveryEnabled,
        showVisualDiff: this.showVisualDiff,
        autoFitOnLoad: this.autoFitOnLoad,
        highlightKeyColumns: this.highlightKeyColumns,
        idHeaderName: this.idHeaderName,
        nameHeaderName: this.nameHeaderName,
        courierHeaderName: this.courierHeaderName,
        eanHeaderName: this.eanHeaderName,
      }
    },
    importSettingsData(data) {
      if (!data || typeof data !== 'object') return false
      
      // Import export naming prefs
      if (['same', 'timestamp', 'suffix'].includes(data.exportNamingMode)) {
        this.exportNamingMode = data.exportNamingMode
      }
      if (typeof data.exportSuffix === 'string' && data.exportSuffix.trim()) {
        this.exportSuffix = data.exportSuffix.trim()
      }
      if (typeof data.showExportSummary === 'boolean') {
        this.showExportSummary = data.showExportSummary
      }
      if (typeof data.askExportSaveLocation === 'boolean') {
        this.askExportSaveLocation = data.askExportSaveLocation
      }
      if (typeof data.backupEnabled === 'boolean') {
        this.backupEnabled = data.backupEnabled
      }
      if (Number.isFinite(Number(data.backupLimit))) {
        this.backupLimit = Math.max(0, Math.min(500, Number(data.backupLimit)))
      }
      
      // Import editor & layout prefs
      if (typeof data.freezePanesEnabled === 'boolean') {
        this.freezePanesEnabled = data.freezePanesEnabled
      }
      if (typeof data.recoveryEnabled === 'boolean') {
        this.recoveryEnabled = data.recoveryEnabled
      }
      if (typeof data.showVisualDiff === 'boolean') {
        this.showVisualDiff = data.showVisualDiff
      }
      if (typeof data.autoFitOnLoad === 'boolean') {
        this.autoFitOnLoad = data.autoFitOnLoad
      }
      if (typeof data.highlightKeyColumns === 'boolean') {
        this.highlightKeyColumns = data.highlightKeyColumns
      }
      
      // Import custom column mappings
      if (typeof data.idHeaderName === 'string' && data.idHeaderName.trim()) {
        this.idHeaderName = data.idHeaderName.trim()
      }
      if (typeof data.nameHeaderName === 'string' && data.nameHeaderName.trim()) {
        this.nameHeaderName = data.nameHeaderName.trim()
      }
      if (typeof data.courierHeaderName === 'string' && data.courierHeaderName.trim()) {
        this.courierHeaderName = data.courierHeaderName.trim()
      }
      if (typeof data.eanHeaderName === 'string' && data.eanHeaderName.trim()) {
        this.eanHeaderName = data.eanHeaderName.trim()
      }
      
      this.saveExportPrefs()
      this.saveEditorPrefs()
      this.refreshExportFilename()
      return true
    },
    resetToDefaults() {
      this.exportNamingMode = 'same'
      this.exportSuffix = '_modified'
      this.showExportSummary = true
      this.askExportSaveLocation = true
      this.backupEnabled = true
      this.backupLimit = 50
      this.freezePanesEnabled = true
      this.recoveryEnabled = true
      this.showVisualDiff = false
      this.autoFitOnLoad = true
      this.highlightKeyColumns = false
      this.idHeaderName = 'ID prodotto'
      this.nameHeaderName = 'Nome del prodotto'
      this.courierHeaderName = 'Nome corriere'
      this.eanHeaderName = 'EAN'
      
      this.saveExportPrefs()
      this.saveEditorPrefs()
      this.refreshExportFilename()
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

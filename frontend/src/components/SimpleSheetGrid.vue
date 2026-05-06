<template>
  <div class="sheet-shell">
    <div
      v-if="activeSheet"
      ref="gridRef"
      class="grid-wrap"
      tabindex="0"
      @keydown="handleGridKeydown"
    >
      <table class="sheet-table">
        <colgroup>
          <col class="corner-col" />
          <col
            v-for="col in columns"
            :key="`col-${col}`"
            class="sheet-col"
            :style="columnStyle(col)"
          />
        </colgroup>
        <thead>
          <tr>
            <th class="corner-cell"></th>
            <th
              v-for="col in columns"
              :key="col"
              class="column-head"
              :style="columnStyle(col)"
            >
              <span class="column-label">{{ columnName(col) }}</span>
              <span
                class="resize-handle"
                role="separator"
                aria-orientation="vertical"
                title="Trascina per ridimensionare. Doppio click per adattare al contenuto"
                @mousedown.stop.prevent="startColumnResize(col, $event)"
                @dblclick.stop.prevent="fitColumnToContent(col)"
              ></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row">
            <th class="row-head">{{ row + 1 }}</th>
            <template v-for="col in columns" :key="`${row}_${col}`">
              <td
                v-if="!isMergeCovered(row, col)"
                class="sheet-cell"
                :class="cellClasses(row, col)"
                :style="cellStyle(row, col)"
                :rowspan="mergeRowspan(row, col)"
                :colspan="mergeColspan(row, col)"
                @mousedown="selectCell(row, col, $event)"
              >
                <div
                  v-if="hasRichText(row, col) && !isEditing(row, col)"
                  class="cell-rich"
                  v-html="cellHtml(row, col)"
                ></div>
                <input
                  class="cell-input"
                  :class="{ ghost: hasRichText(row, col) && !isEditing(row, col) }"
                  :data-cell="`${row}_${col}`"
                  :value="cellDisplay(row, col)"
                  @focus="selectCell(row, col, $event)"
                  @input="updateCell(row, col, $event.target.value)"
                  @blur="commitManualEdit"
                />
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="sheets.length > 1" class="sheet-tabs">
      <button
        v-for="(sheet, idx) in sheets"
        :key="sheet.index ?? idx"
        class="sheet-tab"
        :class="{ active: idx === activeSheetIndex }"
        @click="spreadsheetStore.setActiveSheetIndex(idx)"
      >
        {{ sheet.name || `Sheet${idx + 1}` }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useSpreadsheetStore } from '../stores/spreadsheet.js'

const MIN_COLUMN_WIDTH = 72
const MAX_COLUMN_WIDTH = 1000
const DEFAULT_COLUMN_WIDTH = 110
const ROW_HEADER_WIDTH = 46
const COLUMN_HEADER_HEIGHT = 28
const FROZEN_COLUMN_COUNT = 2

const spreadsheetStore = useSpreadsheetStore()
const gridRef = ref(null)
const selectionAnchor = ref(null)
const editingCell = ref(null)
const manualColumnWidths = ref({})
let activeResize = null

const sheets = computed(() => Array.isArray(spreadsheetStore.sheets) ? spreadsheetStore.sheets : [])
const activeSheetIndex = computed(() => Math.min(spreadsheetStore.activeSheetIndex || 0, Math.max(sheets.value.length - 1, 0)))
const activeSheet = computed(() => sheets.value[activeSheetIndex.value] || null)
const sheetData = computed(() => Array.isArray(activeSheet.value?.data) ? activeSheet.value.data : [])

const rowCount = computed(() => {
  const configured = Number(activeSheet.value?.row || 0)
  return Math.max(configured, sheetData.value.length, 30)
})

const colCount = computed(() => {
  const configured = Number(activeSheet.value?.column || 0)
  const dataCols = sheetData.value.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0)
  return Math.max(configured, dataCols, 12)
})

const rows = computed(() => Array.from({ length: rowCount.value }, (_, i) => i))
const columns = computed(() => Array.from({ length: colCount.value }, (_, i) => i))

const autoColumnWidths = computed(() => {
  const widths = Array.from({ length: colCount.value }, (_, col) => measureTextWidth(columnName(col)) + 28)

  for (let r = 0; r < sheetData.value.length; r++) {
    const row = sheetData.value[r]
    if (!Array.isArray(row)) continue
    for (let c = 0; c < colCount.value; c++) {
      const text = stripTechnicalTextPrefix(readCellText(row[c]))
      if (!text) continue
      const merge = row[c]?.mc
      const divisor = merge?.rs && merge?.cs && merge.r === r && merge.c === c ? Math.max(1, Number(merge.cs || 1)) : 1
      widths[c] = Math.max(widths[c], Math.ceil(measureTextWidth(text) / divisor) + 18)
    }
  }

  return widths.map((width) => clampWidth(width))
})

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

function readCellText(cell, depth = 0) {
  if (cell === undefined || cell === null) return ''
  if (depth > 4) return ''
  if (typeof cell !== 'object') return String(cell)
  if (Array.isArray(cell.richText)) {
    return cell.richText.map((run) => stripTechnicalTextPrefix(String(run?.text ?? ''))).join('')
  }
  if (cell.ct && cell.ct.t === 'inlineStr' && Array.isArray(cell.ct.s)) {
    return cell.ct.s.map((run) => stripTechnicalTextPrefix(String(run?.v ?? ''))).join('')
  }
  if (cell.v !== undefined) return readCellText(cell.v, depth + 1)
  if (cell.m !== undefined) return readCellText(cell.m, depth + 1)
  if (cell.w !== undefined) return readCellText(cell.w, depth + 1)
  if (cell.text !== undefined) return readCellText(cell.text, depth + 1)
  if (cell.result !== undefined) return readCellText(cell.result, depth + 1)
  return ''
}

function cellRichRuns(cell) {
  if (!cell || typeof cell !== 'object') return []
  if (!cell.ct || cell.ct.t !== 'inlineStr' || !Array.isArray(cell.ct.s)) return []
  return cell.ct.s
    .map((run) => ({
      text: stripTechnicalTextPrefix(String(run?.v ?? '')),
      bold: run?.bl === 1 || run?.bl === '1' || run?.bl === true || run?.bl === 'true',
    }))
    .filter((run) => run.text)
}

function clampWidth(width) {
  const parsed = Number(width)
  if (!Number.isFinite(parsed)) return DEFAULT_COLUMN_WIDTH
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

function columnStorageKey(col) {
  return `${activeSheetIndex.value}:${col}`
}

function columnWidth(col) {
  const manual = manualColumnWidths.value[columnStorageKey(col)]
  if (Number.isFinite(manual)) return clampWidth(manual)
  const savedManual = activeSheet.value?.config?.manualColumnWidthsPx?.[col]
  if (Number.isFinite(savedManual)) return clampWidth(savedManual)
  return autoColumnWidths.value[col] || DEFAULT_COLUMN_WIDTH
}

function columnStyle(col) {
  const width = columnWidth(col)
  return {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
  }
}

function startColumnResize(col, event) {
  activeResize = {
    col,
    startX: event.clientX,
    startWidth: columnWidth(col),
  }
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', handleColumnResize)
  window.addEventListener('mouseup', stopColumnResize)
}

function handleColumnResize(event) {
  if (!activeResize) return
  const nextWidth = clampWidth(activeResize.startWidth + event.clientX - activeResize.startX)
  setSheetColumnWidth(activeResize.col, nextWidth)
  manualColumnWidths.value = {
    ...manualColumnWidths.value,
    [columnStorageKey(activeResize.col)]: nextWidth,
  }
}

function resetColumnWidth(col) {
  const key = columnStorageKey(col)
  if (!(key in manualColumnWidths.value)) return
  setSheetColumnWidth(col, null)
  const next = { ...manualColumnWidths.value }
  delete next[key]
  manualColumnWidths.value = next
}

function fitColumnToContent(col) {
  const nextWidth = autoColumnWidths.value[col] || DEFAULT_COLUMN_WIDTH
  setSheetColumnWidth(col, nextWidth)
  manualColumnWidths.value = {
    ...manualColumnWidths.value,
    [columnStorageKey(col)]: nextWidth,
  }
}

function setSheetColumnWidth(col, width) {
  const sheet = activeSheet.value
  if (!sheet) return
  if (!sheet.config || typeof sheet.config !== 'object') sheet.config = {}
  if (!sheet.config.manualColumnWidthsPx || typeof sheet.config.manualColumnWidthsPx !== 'object') {
    sheet.config.manualColumnWidthsPx = {}
  }
  if (width === null) delete sheet.config.manualColumnWidthsPx[col]
  else sheet.config.manualColumnWidthsPx[col] = clampWidth(width)
  spreadsheetStore.isUnsaved = true
  spreadsheetStore.persistRecoverySnapshot(spreadsheetStore.sheets)
}

function stopColumnResize() {
  if (!activeResize) return
  activeResize = null
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('mousemove', handleColumnResize)
  window.removeEventListener('mouseup', stopColumnResize)
}

onBeforeUnmount(() => {
  stopColumnResize()
})

function makePlainTextCell(value) {
  const text = stripTechnicalTextPrefix(String(value ?? ''))
  return { v: text, m: text, w: text, ct: { fa: '@', t: 's' } }
}

function getCell(row, col) {
  return sheetData.value[row]?.[col]
}

function cellDisplay(row, col) {
  return stripTechnicalTextPrefix(readCellText(getCell(row, col)))
}

function richRuns(row, col) {
  return cellRichRuns(getCell(row, col))
}

function hasRichText(row, col) {
  return richRuns(row, col).some((run) => run.bold)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function cellHtml(row, col) {
  return richRuns(row, col)
    .map((run) => (run.bold ? `<strong>${escapeHtml(run.text)}</strong>` : escapeHtml(run.text)))
    .join('')
}

function isEditing(row, col) {
  return editingCell.value === `${row}_${col}`
}

function getMerge(row, col) {
  const cellMerge = getCell(row, col)?.mc
  if (cellMerge) return cellMerge
  const configMerge = activeSheet.value?.config?.merge?.[`${row}_${col}`]
  return configMerge || null
}

function isMergeCovered(row, col) {
  const merge = getMerge(row, col)
  return Boolean(merge && (merge.r !== row || merge.c !== col))
}

function mergeRowspan(row, col) {
  const merge = getMerge(row, col)
  if (!merge || merge.r !== row || merge.c !== col) return 1
  return Math.max(1, Number(merge.rs || 1))
}

function mergeColspan(row, col) {
  const merge = getMerge(row, col)
  if (!merge || merge.r !== row || merge.c !== col) return 1
  return Math.max(1, Number(merge.cs || 1))
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

function selectCell(row, col, event) {
  editingCell.value = `${row}_${col}`
  if (event?.shiftKey && selectionAnchor.value) {
    spreadsheetStore.setSelectedRange({
      rowStart: selectionAnchor.value.row,
      rowEnd: row,
      colStart: selectionAnchor.value.col,
      colEnd: col,
    })
  } else {
    selectionAnchor.value = { row, col }
    spreadsheetStore.setSelectedRange({ rowStart: row, rowEnd: row, colStart: col, colEnd: col })
  }
}

function isSelected(row, col) {
  const range = spreadsheetStore.selectedRange
  if (!range) return false
  return row >= range.rowStart && row <= range.rowEnd && col >= range.colStart && col <= range.colEnd
}

function freezeEnabled() {
  return spreadsheetStore.freezePanesEnabled
}

function isFrozenColumn(col) {
  return freezeEnabled() && col < FROZEN_COLUMN_COUNT
}

function isFrozenTopRow(row) {
  return freezeEnabled() && row === 0
}

function frozenLeft(col) {
  let left = ROW_HEADER_WIDTH
  for (let c = 0; c < col; c++) left += columnWidth(c)
  return left
}

function cellClasses(row, col) {
  return {
    selected: isSelected(row, col),
    merged: mergeRowspan(row, col) > 1 || mergeColspan(row, col) > 1,
    frozen: isFrozenColumn(col) || isFrozenTopRow(row),
    'frozen-column': isFrozenColumn(col),
    'frozen-row': isFrozenTopRow(row),
  }
}

function cellStyle(row, col) {
  if (!isFrozenColumn(col) && !isFrozenTopRow(row)) return null
  const style = {}
  if (isFrozenColumn(col)) style.left = `${frozenLeft(col)}px`
  if (isFrozenTopRow(row)) style.top = `${COLUMN_HEADER_HEIGHT}px`
  if (isFrozenColumn(col) && isFrozenTopRow(row)) style.zIndex = 9
  else if (isFrozenColumn(col)) style.zIndex = 7
  else style.zIndex = 6
  return style
}

function updateCell(row, col, value) {
  const previousCell = getCell(row, col)
  const nextCell = makeEditedCell(previousCell, value)
  spreadsheetStore.updateCell(activeSheetIndex.value, row, col, nextCell)
  spreadsheetStore.persistRecoverySnapshot(spreadsheetStore.sheets)
}

function makeEditedCell(previousCell, nextValue) {
  const oldRuns = cellRichRuns(previousCell)
  if (!oldRuns.some((run) => run.bold)) return makePlainTextCell(nextValue)

  const oldChars = []
  const oldStyles = []
  oldRuns.forEach((run) => {
    Array.from(run.text).forEach((char) => {
      oldChars.push(char)
      oldStyles.push(run.bold)
    })
  })

  const newChars = Array.from(stripTechnicalTextPrefix(String(nextValue ?? '')))
  let prefix = 0
  while (prefix < oldChars.length && prefix < newChars.length && oldChars[prefix] === newChars[prefix]) {
    prefix++
  }

  let suffix = 0
  while (
    suffix < oldChars.length - prefix &&
    suffix < newChars.length - prefix &&
    oldChars[oldChars.length - 1 - suffix] === newChars[newChars.length - 1 - suffix]
  ) {
    suffix++
  }

  const insertedEnd = newChars.length - suffix
  const inheritedStyle = oldStyles[prefix] ?? oldStyles[prefix - 1] ?? false
  const nextRuns = []

  function pushRun(text, bold) {
    if (!text) return
    const last = nextRuns[nextRuns.length - 1]
    if (last && last.bold === bold) {
      last.text += text
    } else {
      nextRuns.push({ text, bold })
    }
  }

  for (let i = 0; i < prefix; i++) pushRun(newChars[i], Boolean(oldStyles[i]))
  for (let i = prefix; i < insertedEnd; i++) pushRun(newChars[i], Boolean(inheritedStyle))
  for (let i = insertedEnd; i < newChars.length; i++) {
    const oldIdx = oldChars.length - (newChars.length - i)
    pushRun(newChars[i], Boolean(oldStyles[oldIdx]))
  }

  const text = nextRuns.map((run) => run.text).join('')
  if (!nextRuns.some((run) => run.bold)) return makePlainTextCell(text)
  return {
    v: text,
    m: text,
    w: text,
    ct: {
      t: 'inlineStr',
      s: nextRuns.map((run) => ({ v: run.text, bl: run.bold ? 1 : 0 })),
    },
  }
}

function commitManualEdit() {
  editingCell.value = null
  spreadsheetStore.pushCheckpoint(spreadsheetStore.sheets)
}

function focusCell(row, col) {
  nextTick(() => {
    const el = gridRef.value?.querySelector(`[data-cell="${row}_${col}"]`)
    el?.focus()
  })
}

function moveSelection(deltaRow, deltaCol) {
  const range = spreadsheetStore.selectedRange
  const row = Math.min(Math.max((range?.rowStart ?? 0) + deltaRow, 0), rowCount.value - 1)
  const col = Math.min(Math.max((range?.colStart ?? 0) + deltaCol, 0), colCount.value - 1)
  selectionAnchor.value = { row, col }
  spreadsheetStore.setSelectedRange({ rowStart: row, rowEnd: row, colStart: col, colEnd: col })
  focusCell(row, col)
}

function handleGridKeydown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveSelection(-1, 0)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveSelection(1, 0)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    moveSelection(0, -1)
  } else if (event.key === 'ArrowRight' || event.key === 'Tab') {
    event.preventDefault()
    moveSelection(0, 1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    moveSelection(1, 0)
  }
}
</script>

<style scoped>
.sheet-shell {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.grid-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  outline: none;
}

.sheet-table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: max-content;
  min-width: max-content;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.corner-col {
  width: 46px;
  min-width: 46px;
}

.corner-cell,
.row-head,
.column-head {
  position: sticky;
  z-index: 2;
  background: var(--bg-card);
  color: var(--text-muted);
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.corner-cell {
  top: 0;
  left: 0;
  width: 46px;
  min-width: 46px;
  z-index: 4;
}

.column-head {
  top: 0;
  height: 28px;
  position: sticky;
  user-select: none;
}

.column-label {
  display: block;
  padding: 0 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 7px;
  height: 100%;
  cursor: col-resize;
  z-index: 5;
}

.resize-handle::after {
  content: '';
  position: absolute;
  top: 5px;
  right: 3px;
  width: 1px;
  height: 18px;
  background: transparent;
}

.resize-handle:hover::after {
  background: var(--accent);
}

.row-head {
  left: 0;
  width: 46px;
  min-width: 46px;
  height: 30px;
  z-index: 3;
}

.sheet-cell {
  position: relative;
  height: 30px;
  padding: 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  vertical-align: top;
}

.sheet-cell.merged {
  background: var(--bg-card);
}

.sheet-cell.selected {
  box-shadow: inset 0 0 0 2px var(--accent);
}

.sheet-cell.frozen {
  position: sticky;
  background: var(--bg-secondary);
}

.sheet-cell.frozen-row {
  background: var(--bg-card);
  border-bottom-color: var(--border);
}

.sheet-cell.frozen-column {
  border-right-color: var(--border);
}

.cell-input {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 29px;
  padding: 5px 8px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
  white-space: nowrap;
}

.cell-input.ghost {
  color: transparent;
  caret-color: var(--text-primary);
}

.cell-input:focus {
  background: var(--accent-light);
  color: var(--text-primary);
}

.cell-rich {
  position: absolute;
  inset: 0;
  z-index: 0;
  padding: 5px 8px;
  color: var(--text-primary);
  font-size: 12px;
  line-height: 19px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.sheet-tabs {
  display: flex;
  gap: 4px;
  height: 34px;
  padding: 4px 8px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  overflow-x: auto;
  flex-shrink: 0;
}

.sheet-tab {
  min-width: 90px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-muted);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.sheet-tab.active {
  color: var(--accent);
  border-color: rgba(92, 141, 246, 0.35);
  background: var(--accent-light);
}
</style>

<template>
  <div class="sheet-shell">
    <!-- Formula Bar (Excel-Style) -->
    <div v-if="activeSheet" class="sheet-formula-bar">
      <div class="formula-coord" title="Coordinate della cella selezionata">
        {{ activeCellCoordinate }}
      </div>
      <div class="formula-divider"></div>
      <div class="formula-fx" title="Valore inserito">fx</div>
      <input
        type="text"
        class="formula-input-field"
        :value="activeCellText"
        @input="updateActiveCellFromFormulaBar($event.target.value)"
        @keydown.enter="$event.target.blur(); commitManualEdit()"
        placeholder="Seleziona una cella per modificarne il contenuto..."
        :disabled="!spreadsheetStore.selectedRange"
      />
    </div>

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
              :class="[columnHeadClasses(col), { 'active-col-head': isColHeaderActive(col) }]"
              :style="columnStyle(col)"
              @contextmenu.prevent="openHeaderContextMenu($event, col)"
            >
              <div class="header-label-wrap">
                <span class="column-label">{{ columnName(col) }}</span>
                <svg v-if="getHeaderLabel(col).toLowerCase() === spreadsheetStore.eanHeaderName.toLowerCase()" class="padlock-icon" viewBox="0 0 24 24" aria-hidden="true" style="margin-left: 2px;">
                  <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
                </svg>
                
                <!-- Quick filter trigger funnel -->
                <button
                  class="column-filter-btn"
                  :class="{ 'filter-active': isColumnFiltered(col) }"
                  @click.stop.prevent="toggleColumnFilterPopover(col, $event)"
                  title="Filtra colonna"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                  </svg>
                  <span v-if="isColumnFiltered(col)" class="filter-active-indicator animate-pulse"></span>
                </button>
              </div>
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
          <tr v-for="row in filteredRows" :key="row">
            <th class="row-head" :class="{ 'active-row-head': isRowHeaderActive(row) }">{{ row + 1 }}</th>
            <template v-for="col in columns" :key="`${row}_${col}`">
              <td
                v-if="!isMergeCovered(row, col)"
                class="sheet-cell"
                :class="cellClasses(row, col)"
                :style="cellStyle(row, col)"
                :rowspan="mergeRowspan(row, col)"
                :colspan="mergeColspan(row, col)"
                :title="cellTooltip(row, col)"
                @mousedown="selectCell(row, col, $event)"
                @contextmenu.prevent="openCellContextMenu($event, row, col)"
                @mouseenter="hoveredRow = row; hoveredCol = col"
                @mouseleave="hoveredRow = -1; hoveredCol = -1"
              >
                <div
                  v-if="hasRichText(row, col) && !isEditing(row, col)"
                  class="cell-rich"
                  :class="{ 'cell-rich-editing': isEditing(row, col) }"
                  v-html="cellHtml(row, col)"
                ></div>
                <input
                  class="cell-input"
                  :class="{
                    ghost: hasRichText(row, col) && !isEditing(row, col),
                    'rich-editing': hasRichText(row, col) && isEditing(row, col)
                  }"
                  :data-cell="`${row}_${col}`"
                  :value="cellDisplay(row, col)"
                  @focus="handleCellFocus($event, row, col)"
                  @input="handleCellInput($event, row, col)"
                  @blur="handleCellBlur"
                  @keydown="handleCellInputKeydown($event, row, col)"
                  @click="adjustRichCursor(row, col, $event)"
                />
                
                <!-- Autocomplete Suggestion Dropdown -->
                <div
                  v-if="isEditing(row, col) && isAutocompleteActive(col) && matchingTemplates.length > 0"
                  class="autocomplete-dropdown"
                  @mousedown.stop.prevent
                >
                  <button
                    v-for="(t, idx) in matchingTemplates"
                    :key="t.id"
                    class="autocomplete-item"
                    :class="{ 'kbd-active': idx === activeSuggestionIndex }"
                    @click="selectAutocompleteSuggestion(row, col, t)"
                  >
                    <span class="suggestion-id-badge">{{ t.id }}</span>
                    <span class="suggestion-name-markup" v-html="templateMarkupPreview(t.name)"></span>
                  </button>
                </div>
                
                <!-- smart header alignment alert -->
                <div
                  v-if="row === 0 && detectHeaderAlignmentIssue(col)"
                  class="header-alert-badge"
                  style="position: absolute; right: 4px; top: 4px; z-index: 10;"
                  @click.stop="fixHeaderAlignment(detectHeaderAlignmentIssue(col))"
                  :title="`Clicca per allineare '${detectHeaderAlignmentIssue(col).current}' a '${detectHeaderAlignmentIssue(col).standard}'`"
                >
                  ⚠ Allinea
                </div>

                <!-- drag handle selection -->
                <div
                  v-if="row > 0 && isSelectionBottomRight(row, col)"
                  class="selection-drag-handle"
                  @mousedown.stop.prevent="startDragFill($event)"
                ></div>
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

    <!-- Popover per Filtri di Colonna -->
    <div
      v-if="activeFilterPopover.show"
      class="column-filter-popover animate-zoom-in"
      :style="{ top: `${activeFilterPopover.y}px`, left: `${activeFilterPopover.x}px` }"
      @click.stop
    >
      <div class="popover-header">
        <h4>Filtra Colonna {{ columnName(activeFilterPopover.col) }}</h4>
        <button class="close-btn" @click="activeFilterPopover.show = false">&times;</button>
      </div>
      <div class="popover-search">
        <input
          v-model="activeFilterPopover.searchQuery"
          type="text"
          placeholder="Cerca valore..."
          class="popover-search-input"
        />
      </div>
      <div class="popover-options">
        <label class="popover-option-item">
          <input
            type="checkbox"
            :checked="isAllSelectedForFilter(activeFilterPopover.col)"
            @change="toggleSelectAllFilter(activeFilterPopover.col)"
          />
          <span class="option-label"><em>(Seleziona tutto)</em></span>
        </label>
        <div class="divider-line"></div>
        <div class="options-scroll-list">
          <label
            v-for="opt in getFilteredUniqueValues(activeFilterPopover.col)"
            :key="opt.value"
            class="popover-option-item"
          >
            <input
              type="checkbox"
              :checked="isFilterChecked(activeFilterPopover.col, opt.value)"
              @change="toggleFilterValue(activeFilterPopover.col, opt.value)"
            />
            <span class="option-label" :title="opt.value || '(Vuoto)'">
              {{ opt.value || '(Vuoto)' }}
              <span class="option-count">({{ opt.count }})</span>
            </span>
          </label>
        </div>
      </div>
      <div class="popover-footer">
        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 10px;" @click="clearColumnFilter(activeFilterPopover.col)">Reimposta</button>
        <button class="btn btn-primary" style="padding: 4px 8px; font-size: 10px;" @click="activeFilterPopover.show = false">Chiudi</button>
      </div>
    </div>

    <!-- Footer Status Bar Sticky -->
    <div v-if="activeSheet" class="sheet-status-bar">
      <div class="status-left">
        <span class="status-item">Righe: <strong>{{ rowCount - 1 }}</strong></span>
        <span class="status-item">Colonne: <strong>{{ colCount }}</strong></span>
        <span class="status-item autosave-indicator" :class="{ 'save-pulse': isAutosavePulsing }">
          <span class="save-status-dot"></span>
          Autosalvato alle {{ lastSavedTimeText }}
        </span>
      </div>
      
      <div v-if="selectionStats" class="status-stats-badge animate-fade-in">
        <span class="stat-badge-item">Somma: <strong>{{ formatStat(selectionStats.sum) }}</strong></span>
        <span class="stat-badge-item">Media: <strong>{{ formatStat(selectionStats.avg) }}</strong></span>
        <span class="stat-badge-item">Conteggio: <strong>{{ selectionStats.count }}</strong></span>
      </div>

      <div class="status-right">
        <label class="visual-diff-toggle-wrap" title="Evidenzia tutte le modifiche">
          <input type="checkbox" :checked="spreadsheetStore.showVisualDiff" @change="spreadsheetStore.setShowVisualDiff($event.target.checked)" />
          <span>Evidenzia modifiche</span>
        </label>
        <span class="status-item ean-integrity" :class="{ 'warning': eanIntegrity.percentage < 100 }">
          Integrità EAN: <strong>{{ eanIntegrity.validCount }}/{{ eanIntegrity.totalCount }}</strong> ({{ eanIntegrity.percentage }}%)
        </span>
      </div>
    </div>

    <!-- Context Menu galleggiante Premium -->
    <div
      v-if="contextMenu.show"
      class="context-menu-floating animate-zoom-in"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      @click.stop
    >
      <template v-for="item in contextMenuItems" :key="item.id">
        <div v-if="item.isDivider" class="context-menu-divider"></div>
        
        <!-- Hoverable Submenu for Courier -->
        <div
          v-else-if="item.hasSubmenu && item.id === 'courier-submenu'"
          class="context-menu-item has-submenu"
          :class="{ 'kbd-active': isActionableItemActive(item.id) }"
        >
          <span class="item-label-wrap">
            <svg class="item-icon" viewBox="0 0 24 24" v-html="getIconSvgPath(item.icon)"></svg>
            <span>{{ item.label }}</span>
          </span>
          <svg class="submenu-arrow" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          
          <!-- Submenu floating panel -->
          <div class="submenu-floating">
            <button
              v-for="preset in courierPresetStore.presets"
              :key="preset"
              class="submenu-item"
              @click="setCourierPresetForCell(preset)"
            >
              <svg class="item-icon" viewBox="0 0 24 24" v-html="getIconSvgPath('truck')"></svg>
              <span>{{ preset }}</span>
            </button>
          </div>
        </div>

        <!-- Hoverable Submenu for Text operations -->
        <div
          v-else-if="item.hasSubmenu && item.id === 'text-submenu'"
          class="context-menu-item has-submenu"
          :class="{ 'kbd-active': isActionableItemActive(item.id) }"
        >
          <span class="item-label-wrap">
            <svg class="item-icon" viewBox="0 0 24 24" v-html="getIconSvgPath(item.icon)"></svg>
            <span>{{ item.label }}</span>
          </span>
          <svg class="submenu-arrow" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          
          <!-- Submenu floating panel -->
          <div class="submenu-floating">
            <button class="submenu-item" @click="normalizeContextCellSpaces">
              <svg class="item-icon" viewBox="0 0 24 24" v-html="getIconSvgPath('spaces')"></svg>
              <span>Normalizza spazi</span>
            </button>
            <button class="submenu-item" @click="trimContextCellSpaces">
              <svg class="item-icon" viewBox="0 0 24 24" v-html="getIconSvgPath('trim')"></svg>
              <span>Trim spazi</span>
            </button>
          </div>
        </div>

        <!-- Normal Item Button -->
        <button
          v-else
          class="context-menu-item"
          :class="{
            'context-item-danger': item.isDanger,
            'kbd-active': isActionableItemActive(item.id)
          }"
          @click="executeContextAction(item.id)"
        >
          <span class="item-label-wrap">
            <svg class="item-icon" viewBox="0 0 24 24" v-html="getIconSvgPath(item.icon)"></svg>
            <span>{{ item.label }}</span>
          </span>
          <kbd v-if="item.shortcut" class="menu-shortcut">{{ item.shortcut }}</kbd>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, onMounted, watch } from 'vue'
import { useSpreadsheetStore } from '../stores/spreadsheet.js'
import { useNotificationStore } from '../stores/notification.js'
import { useCourierPresetStore } from '../stores/courierPresets.js'
import { useTemplateStore } from '../stores/templates.js'

const MIN_COLUMN_WIDTH = 72
const MAX_COLUMN_WIDTH = 1000
const DEFAULT_COLUMN_WIDTH = 110
const ROW_HEADER_WIDTH = 46
const COLUMN_HEADER_HEIGHT = 28
const FROZEN_COLUMN_COUNT = 2

const spreadsheetStore = useSpreadsheetStore()
const courierPresetStore = useCourierPresetStore()
const templateStore = useTemplateStore()
const gridRef = ref(null)
const selectionAnchor = ref(null)
const editingCell = ref(null)
const manualColumnWidths = ref({})
let activeResize = null

const hoveredRow = ref(-1)
const hoveredCol = ref(-1)

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

onMounted(() => {
  window.addEventListener('cells-replaced', handleCellsReplaced)
})

onBeforeUnmount(() => {
  stopColumnResize()
  window.removeEventListener('cells-replaced', handleCellsReplaced)
})

function handleCellFocus(event, row, col) {
  selectCell(row, col, event)
  if (isAutocompleteActive(col)) {
    editingInputValue.value = cellDisplay(row, col) || ''
    activeSuggestionIndex.value = -1
  }
}

function handleCellInput(event, row, col) {
  const value = event.target.value
  updateCell(row, col, value)
  if (isAutocompleteActive(col)) {
    editingInputValue.value = value
    activeSuggestionIndex.value = -1
  }
}

function handleCellBlur() {
  commitManualEdit()
  setTimeout(() => {
    editingInputValue.value = ''
    activeSuggestionIndex.value = -1
  }, 180)
}

function handleCellInputKeydown(event, row, col) {
  if (!isAutocompleteActive(col) || matchingTemplates.value.length === 0) return
  
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % matchingTemplates.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + matchingTemplates.value.length) % matchingTemplates.value.length
  } else if (event.key === 'Enter') {
    if (activeSuggestionIndex.value >= 0 && activeSuggestionIndex.value < matchingTemplates.value.length) {
      event.preventDefault()
      const suggestion = matchingTemplates.value[activeSuggestionIndex.value]
      if (suggestion) {
        selectAutocompleteSuggestion(row, col, suggestion)
      }
    }
  } else if (event.key === 'Escape') {
    activeSuggestionIndex.value = -1
    editingInputValue.value = ''
  }
}

function selectAutocompleteSuggestion(row, col, suggestion) {
  const data = sheetData.value
  let nomeCol = -1
  let idCol = -1
  const headerRow = data?.[0] || []
  headerRow.forEach((cell, c) => {
    const val = readCellText(cell).trim()
    if (val === spreadsheetStore.nameHeaderName) nomeCol = c
    if (val === spreadsheetStore.idHeaderName) idCol = c
  })
  
  if (nomeCol !== -1 && idCol !== -1) {
    const idCell = makePlainTextCell(suggestion.id)
    const nameCell = makeTemplateCell(suggestion.name)
    
    spreadsheetStore.updateCell(activeSheetIndex.value, row, idCol, idCell)
    spreadsheetStore.updateCell(activeSheetIndex.value, row, nomeCol, nameCell)
    spreadsheetStore.pushCheckpoint(spreadsheetStore.sheets)
  }
  
  activeSuggestionIndex.value = -1
  editingInputValue.value = ''
  editingCell.value = null
}

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

function isFullyBold(row, col) {
  const runs = richRuns(row, col)
  if (runs.length === 0) return false
  return runs.every((run) => run.bold)
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

const originalSheetData = computed(() => {
  const origSheet = spreadsheetStore.originalSheets?.[activeSheetIndex.value]
  return Array.isArray(origSheet?.data) ? origSheet.data : []
})

function getHeaderLabel(col) {
  const row0 = sheetData.value[0]
  if (!row0) return ''
  return readCellText(row0[col]).trim()
}

function isCellModified(row, col) {
  if (!spreadsheetStore.hasData) return false
  const currentCell = getCell(row, col)
  const origCell = originalSheetData.value?.[row]?.[col]
  
  const currentText = readCellText(currentCell)
  const origText = readCellText(origCell)
  
  return currentText !== origText
}

function columnHeadClasses(col) {
  const label = getHeaderLabel(col).toLowerCase()
  return {
    'col-header-id': label === spreadsheetStore.idHeaderName.toLowerCase(),
    'col-header-name': label === spreadsheetStore.nameHeaderName.toLowerCase(),
    'col-header-ean': label === spreadsheetStore.eanHeaderName.toLowerCase(),
    'col-header-courier': label === spreadsheetStore.courierHeaderName.toLowerCase() || label === 'corriere'
  }
}

function cellClasses(row, col) {
  const label = row > 0 ? getHeaderLabel(col).toLowerCase() : ''
  const highlightEnabled = spreadsheetStore.highlightKeyColumns
  return {
    selected: isSelected(row, col),
    merged: mergeRowspan(row, col) > 1 || mergeColspan(row, col) > 1,
    frozen: isFrozenColumn(col) || isFrozenTopRow(row),
    'frozen-column': isFrozenColumn(col),
    'frozen-row': isFrozenTopRow(row),
    
    // Key column highlights
    'col-id-prod': highlightEnabled && label === spreadsheetStore.idHeaderName.toLowerCase(),
    'col-name-prod': highlightEnabled && label === spreadsheetStore.nameHeaderName.toLowerCase(),
    'col-courier': highlightEnabled && (label === spreadsheetStore.courierHeaderName.toLowerCase() || label === 'corriere'),
    'col-ean': highlightEnabled && label === spreadsheetStore.eanHeaderName.toLowerCase(),
    
    // Modified cell highlight
    'modified-cell': row > 0 && isCellModified(row, col),
    
    // Evidenziazione dei match in tempo reale
    'search-match-cell': row > 0 && isSearchMatch(row, col),
    
    // Texture Mesh Dotted per celle vuote
    'empty-mesh': row > 0 && !cellDisplay(row, col) && !isSelected(row, col),

    // Premium features classes
    'invalid-ean-cell': row > 0 && isInvalidEanCell(row, col),
    'drag-fill-preview': row > 0 && isInsideDragFillPreview(row, col),
    'flash-replaced': flashingCells.value.has(`${row}_${col}`),

    // Crosshair Guide classes
    'crosshair-row-active': row > 0 && row === hoveredRow.value,
    'crosshair-col-active': col === hoveredCol.value,
    'visual-diff-active-cell': row > 0 && spreadsheetStore.showVisualDiff && isCellModified(row, col)
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

function adjustRichCursor(row, col, event) {
  if (!hasRichText(row, col)) return
  if (isEditing(row, col)) return
  const td = event.target.closest('td')
  const richDiv = td?.querySelector('.cell-rich')
  if (!richDiv) return

  // Temporarily bring the rich div above the input so caretRangeFromPoint
  // hits the bold-rendered text nodes instead of the input's plain text
  richDiv.style.zIndex = '10'
  richDiv.style.pointerEvents = 'auto'

  const range = document.caretRangeFromPoint
    ? document.caretRangeFromPoint(event.clientX, event.clientY)
    : null

  // Restore immediately
  richDiv.style.zIndex = ''
  richDiv.style.pointerEvents = ''

  if (!range) return

  if (richDiv.contains(range.startContainer)) {
    const offset = getTextOffsetInElement(richDiv, range.startContainer, range.startOffset)
    const input = event.target
    const pos = Math.min(offset, input.value.length)
    input.setSelectionRange(pos, pos)
  }
}

function getTextOffsetInElement(root, targetNode, targetOffset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let total = 0
  while (walker.nextNode()) {
    if (walker.currentNode === targetNode) {
      return total + targetOffset
    }
    total += walker.currentNode.textContent.length
  }
  return total
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

// ------------------------------------------------------------
// Real-time Search Match Highlights
// ------------------------------------------------------------
const isMatch = computed(() => {
  const query = spreadsheetStore.searchQuery
  if (!query) return null
  const flags = spreadsheetStore.searchCase ? 'g' : 'gi'
  try {
    if (spreadsheetStore.searchRegex) {
      return new RegExp(query, flags)
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(escaped, flags)
    }
  } catch {
    return null
  }
})

function parseColumnFilter(headerRow, filter) {
  const f = (filter || '').trim()
  if (!f) return null
  if (/^[A-Za-z]+$/.test(f) && f.length <= 3) {
    let idx = 0
    for (let i = 0; i < f.length; i++) idx = idx * 26 + (f.toUpperCase().charCodeAt(i) - 64)
    return idx - 1
  }
  for (let c = 0; c < headerRow.length; c++) {
    if (readCellText(headerRow[c]).trim().toLowerCase() === f.toLowerCase()) return c
  }
  return null
}

function isSearchMatch(row, col) {
  const matcher = isMatch.value
  if (!matcher) return false
  const colFilter = parseColumnFilter(sheetData.value[0] || [], spreadsheetStore.columnFilter)
  if (colFilter !== null && col !== colFilter) return false
  const val = cellDisplay(row, col)
  if (!val) return false
  matcher.lastIndex = 0
  return matcher.test(val)
}

// ------------------------------------------------------------
// Smart Header Alignment
// ------------------------------------------------------------
function detectHeaderAlignmentIssue(col) {
  const rawLabel = getHeaderLabel(col).trim()
  if (!rawLabel) return null
  const label = rawLabel.toLowerCase()
  
  if (label !== 'ean' && (label === 'codice ean' || label === 'ean code' || label === 'codiceean' || label === 'eancode')) {
    return { col, standard: 'EAN', current: rawLabel }
  }
  if (label !== 'id prodotto' && (label === 'idprodotto' || label === 'id_prod' || label === 'codice prodotto' || label === 'codiceprodotto' || label === 'prod id' || label === 'id')) {
    return { col, standard: 'ID prodotto', current: rawLabel }
  }
  if (label !== 'nome del prodotto' && (label === 'nome prodotto' || label === 'nome_prodotto' || label === 'nome' || label === 'prodotto' || label === 'product name')) {
    return { col, standard: 'Nome del prodotto', current: rawLabel }
  }
  if (label !== 'corriere' && label !== 'nome corriere' && (label === 'nome_corriere' || label === 'tipo corriere' || label === 'corriere preset' || label === 'courier')) {
    return { col, standard: 'Nome corriere', current: rawLabel }
  }
  
  if (rawLabel !== 'ID prodotto' && label === 'id prodotto') {
    return { col, standard: 'ID prodotto', current: rawLabel }
  }
  if (rawLabel !== 'EAN' && label === 'ean') {
    return { col, standard: 'EAN', current: rawLabel }
  }
  if (rawLabel !== 'Nome del prodotto' && label === 'nome del prodotto') {
    return { col, standard: 'Nome del prodotto', current: rawLabel }
  }
  if (rawLabel !== 'Nome corriere' && rawLabel !== 'Corriere' && (label === 'corriere' || label === 'nome corriere')) {
    return { col, standard: 'Nome corriere', current: rawLabel }
  }
  
  return null
}

function fixHeaderAlignment(issue) {
  if (!issue) return
  const nextCell = makePlainTextCell(issue.standard)
  spreadsheetStore.updateCell(activeSheetIndex.value, 0, issue.col, nextCell)
  spreadsheetStore.pushCheckpoint(spreadsheetStore.sheets)
  spreadsheetStore.persistRecoverySnapshot(spreadsheetStore.sheets)
  
  const notificationStore = useNotificationStore()
  notificationStore.show({
    type: 'success',
    message: `Intestazione '${issue.current}' allineata correttamente a '${issue.standard}'`
  })
}

// ------------------------------------------------------------
// Custom Right-Click Context Menu State & Logic
// ------------------------------------------------------------
const contextMenu = ref({
  show: false,
  type: 'cell', // 'cell' | 'header'
  x: 0,
  y: 0,
  row: -1,
  col: -1
})

const activeContextItemIndex = ref(-1)
const editingInputValue = ref('')
const activeSuggestionIndex = ref(-1)

function isAutocompleteActive(col) {
  const label = getHeaderLabel(col).toLowerCase()
  return label === spreadsheetStore.idHeaderName.toLowerCase() || label === spreadsheetStore.nameHeaderName.toLowerCase()
}

const matchingTemplates = computed(() => {
  const cell = activeCell.value
  if (!cell || cell.row === 0) return []
  if (!isAutocompleteActive(cell.col)) return []
  
  const query = (editingInputValue.value || '').trim().toLowerCase()
  if (!query) return []
  
  if (templateStore.templates.length === 0) {
    templateStore.fetchAll()
  }
  
  return templateStore.templates
    .filter(t => {
      const id = String(t.id).toLowerCase()
      const name = String(t.name).toLowerCase()
      return id.includes(query) || name.includes(query)
    })
    .slice(0, 8)
})

const contextMenuItems = computed(() => {
  const row = contextMenu.value.row
  const col = contextMenu.value.col
  if (row === -1 || col === -1) return []
  
  if (contextMenu.value.type === 'header') {
    return [
      { id: 'fit', label: 'Adatta larghezza colonna', icon: 'fit', shortcut: 'Doppio click' },
      { id: 'filter', label: 'Filtra colonna...', icon: 'filter', shortcut: '' },
      { id: 'divider-1', isDivider: true },
      { id: 'insert-col-left', label: 'Inserisci colonna a sinistra', icon: 'spaces', shortcut: '' },
      { id: 'insert-col-right', label: 'Inserisci colonna a destra', icon: 'spaces', shortcut: '' },
      { id: 'delete-col', label: 'Elimina colonna', icon: 'delete', shortcut: '', isDanger: true },
    ]
  }
  
  const list = []
  const label = getHeaderLabel(col).toLowerCase()
  
  // 1. Content-aware actions
  if (label === 'nome del prodotto' || label === 'id prodotto') {
    list.push({ id: 'catalog-update', label: 'Aggiorna nome da catalogo', icon: 'magic', shortcut: 'Ctrl+Shift+R' })
    list.push({ id: 'divider-content-1', isDivider: true })
  }
  
  if (label === 'ean') {
    list.push({ id: 'ean-format', label: 'Formatta/Pulisci EAN', icon: 'padlock', shortcut: '' })
    list.push({ id: 'divider-content-2', isDivider: true })
  }
  
  if (label === 'nome corriere' || label === 'corriere') {
    list.push({ id: 'courier-submenu', label: 'Imposta corriere', icon: 'truck', shortcut: '', hasSubmenu: true })
    list.push({ id: 'divider-content-3', isDivider: true })
  }
  
  // 2. Standard cell actions
  list.push({ id: 'search', label: 'Cerca nel foglio', icon: 'search', shortcut: 'Ctrl+F' })
  list.push({ id: 'bold', label: hasRichText(row, col) ? 'Rimuovi Grassetto' : 'Rendi Grassetto', icon: 'bold', shortcut: 'B' })
  list.push({ id: 'text-submenu', label: 'Pulizia testo', icon: 'text', shortcut: '', hasSubmenu: true })
  
  list.push({ id: 'divider-standard', isDivider: true })
  
  // 3. Row structural actions
  list.push({ id: 'insert-row-above', label: 'Inserisci riga sopra', icon: 'spaces', shortcut: 'Ins' })
  list.push({ id: 'insert-row-below', label: 'Inserisci riga sotto', icon: 'spaces', shortcut: '' })
  list.push({ id: 'delete-row', label: 'Elimina riga', icon: 'delete', shortcut: 'Canc', isDanger: true })
  
  return list
})

const actionableMenuItems = computed(() => {
  return contextMenuItems.value.filter(item => !item.isDivider)
})

function isActionableItemActive(id) {
  const activeIdx = activeContextItemIndex.value
  const items = actionableMenuItems.value
  if (activeIdx < 0 || activeIdx >= items.length) return false
  return items[activeIdx].id === id
}

function openCellContextMenu(event, row, col) {
  if (row === 0) return // Skip header row
  selectCell(row, col, event)
  contextMenu.value = {
    show: true,
    type: 'cell',
    x: event.clientX,
    y: event.clientY,
    row,
    col
  }
  activeContextItemIndex.value = -1
  nextTick(() => {
    window.addEventListener('click', closeCellContextMenu)
    window.addEventListener('keydown', handleContextMenuKeydown)
  })
}

function openHeaderContextMenu(event, col) {
  contextMenu.value = {
    show: true,
    type: 'header',
    x: event.clientX,
    y: event.clientY,
    row: 0,
    col
  }
  activeContextItemIndex.value = -1
  nextTick(() => {
    window.addEventListener('click', closeCellContextMenu)
    window.addEventListener('keydown', handleContextMenuKeydown)
  })
}

function closeCellContextMenu() {
  contextMenu.value.show = false
  window.removeEventListener('click', closeCellContextMenu)
  window.removeEventListener('keydown', handleContextMenuKeydown)
}

function handleContextMenuKeydown(e) {
  if (e.key === 'Escape') {
    closeCellContextMenu()
    return
  }
  const items = actionableMenuItems.value
  if (items.length === 0) return
  
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeContextItemIndex.value = (activeContextItemIndex.value + 1) % items.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeContextItemIndex.value = (activeContextItemIndex.value - 1 + items.length) % items.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (activeContextItemIndex.value >= 0 && activeContextItemIndex.value < items.length) {
      const activeItem = items[activeContextItemIndex.value]
      if (activeItem && !activeItem.hasSubmenu) {
        executeContextAction(activeItem.id)
      }
    }
  }
}

function executeContextAction(id) {
  const row = contextMenu.value.row
  const col = contextMenu.value.col
  const sheetIdx = activeSheetIndex.value

  switch (id) {
    case 'fit':
      fitColumnToContent(col)
      break
    case 'filter':
      const targetEl = document.querySelector(`thead th:nth-child(${col + 2}) .column-filter-btn`)
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect()
        activeFilterPopover.value = {
          show: true,
          x: rect.left,
          y: rect.bottom + window.scrollY + 4,
          col,
          searchQuery: ''
        }
        nextTick(() => {
          window.addEventListener('click', closeColumnFilterPopover)
        })
      }
      break
    case 'insert-col-left':
      spreadsheetStore.insertColumnsAction(sheetIdx, col, 1)
      break
    case 'insert-col-right':
      spreadsheetStore.insertColumnsAction(sheetIdx, col + 1, 1)
      break
    case 'delete-col':
      deleteColumn(col)
      break
    case 'catalog-update':
      updateCellNameFromCatalog()
      break
    case 'ean-format':
      formatContextEan()
      break
    case 'search':
      searchCellInSheet()
      break
    case 'bold':
      toggleContextCellBold()
      break
    case 'insert-row-above':
      spreadsheetStore.insertRowsAction(sheetIdx, row, 1)
      break
    case 'insert-row-below':
      spreadsheetStore.insertRowsAction(sheetIdx, row + 1, 1)
      break
    case 'delete-row':
      deleteContextRow()
      break
  }
  closeCellContextMenu()
}

function deleteColumn(col) {
  const label = getHeaderLabel(col).trim().toLowerCase()
  if (label === 'ean' || label === 'id prodotto' || label === 'nome del prodotto') {
    if (!window.confirm(`Stai eliminando la colonna protetta "${getHeaderLabel(col)}". Vuoi procedere comunque?`)) {
      closeCellContextMenu()
      return
    }
  }
  spreadsheetStore.deleteColumnsAction(activeSheetIndex.value, col, 1)
  const notificationStore = useNotificationStore()
  notificationStore.show({ type: 'success', message: `Colonna ${columnName(col)} eliminata.` })
  closeCellContextMenu()
}

function searchCellInSheet() {
  const row = contextMenu.value.row
  const col = contextMenu.value.col
  const text = cellDisplay(row, col)
  spreadsheetStore.searchQuery = text
  window.dispatchEvent(new CustomEvent('open-search-modal'))
  closeCellContextMenu()
}

function toggleContextCellBold() {
  const row = contextMenu.value.row
  const col = contextMenu.value.col
  const text = cellDisplay(row, col)
  if (!text) return
  
  let nextCell
  const currentBold = hasRichText(row, col)
  if (currentBold) {
    nextCell = makePlainTextCell(text)
  } else {
    nextCell = {
      v: text,
      m: text,
      w: text,
      ct: {
        t: 'inlineStr',
        s: [{ v: text, bl: 1 }]
      }
    }
  }
  spreadsheetStore.updateCell(activeSheetIndex.value, row, col, nextCell)
  spreadsheetStore.pushCheckpoint(spreadsheetStore.sheets)
  spreadsheetStore.persistRecoverySnapshot(spreadsheetStore.sheets)
  closeCellContextMenu()
}

function normalizeContextCellSpaces() {
  const row = contextMenu.value.row
  const col = contextMenu.value.col
  if (row <= 0 || col === -1) return
  
  const range = spreadsheetStore.selectedRange
  let changed = 0
  
  if (range && row >= range.rowStart && row <= range.rowEnd && col >= range.colStart && col <= range.colEnd) {
    for (let r = Math.max(1, range.rowStart); r <= range.rowEnd; r++) {
      for (let c = range.colStart; c <= range.colEnd; c++) {
        const text = cellDisplay(r, c)
        if (!text) continue
        const normalized = text.replace(/\s+/g, ' ').trim()
        if (normalized !== text) {
          updateCell(r, c, normalized)
          changed++
        }
      }
    }
  } else {
    const text = cellDisplay(row, col)
    if (text) {
      const normalized = text.replace(/\s+/g, ' ').trim()
      if (normalized !== text) {
        updateCell(row, col, normalized)
        changed++
      }
    }
  }
  
  if (changed > 0) {
    spreadsheetStore.pushCheckpoint(spreadsheetStore.sheets)
  }
  closeCellContextMenu()
}

function trimContextCellSpaces() {
  const row = contextMenu.value.row
  const col = contextMenu.value.col
  if (row <= 0 || col === -1) return
  
  const range = spreadsheetStore.selectedRange
  let changed = 0
  
  if (range && row >= range.rowStart && row <= range.rowEnd && col >= range.colStart && col <= range.colEnd) {
    for (let r = Math.max(1, range.rowStart); r <= range.rowEnd; r++) {
      for (let c = range.colStart; c <= range.colEnd; c++) {
        const text = cellDisplay(r, c)
        if (!text) continue
        const trimmed = text.trim()
        if (trimmed !== text) {
          updateCell(r, c, trimmed)
          changed++
        }
      }
    }
  } else {
    const text = cellDisplay(row, col)
    if (text) {
      const trimmed = text.trim()
      if (trimmed !== text) {
        updateCell(row, col, trimmed)
        changed++
      }
    }
  }
  
  if (changed > 0) {
    spreadsheetStore.pushCheckpoint(spreadsheetStore.sheets)
  }
  closeCellContextMenu()
}

function formatContextEan() {
  const row = contextMenu.value.row
  const col = contextMenu.value.col
  if (row <= 0 || col === -1) return
  
  const range = spreadsheetStore.selectedRange
  let changed = 0
  const cleanEan = (val) => String(val ?? '').trim().replace(/\D/g, '')
  
  if (range && row >= range.rowStart && row <= range.rowEnd && col >= range.colStart && col <= range.colEnd) {
    for (let r = Math.max(1, range.rowStart); r <= range.rowEnd; r++) {
      for (let c = range.colStart; c <= range.colEnd; c++) {
        if (isEanColumn(c)) {
          const val = cellDisplay(r, c)
          const cleaned = cleanEan(val)
          if (cleaned !== val) {
            updateCell(r, c, cleaned)
            changed++
          }
        }
      }
    }
  } else {
    const val = cellDisplay(row, col)
    const cleaned = cleanEan(val)
    if (cleaned !== val) {
      updateCell(row, col, cleaned)
      changed++
    }
  }
  
  if (changed > 0) {
    spreadsheetStore.pushCheckpoint(spreadsheetStore.sheets)
  }
  closeCellContextMenu()
}

async function updateCellNameFromCatalog() {
  const row = contextMenu.value.row
  const col = contextMenu.value.col
  if (row <= 0 || col === -1) return
  
  const data = sheetData.value
  let nomeCol = -1
  let idCol = -1
  const headerRow = data?.[0] || []
  headerRow.forEach((cell, c) => {
    const val = readCellText(cell).trim()
    if (val === 'Nome del prodotto') nomeCol = c
    if (val === 'ID prodotto') idCol = c
  })
  
  if (nomeCol === -1 || idCol === -1) {
    const notificationStore = useNotificationStore()
    notificationStore.show({ type: 'error', message: 'Colonne Nome del prodotto / ID prodotto non trovate.' })
    closeCellContextMenu()
    return
  }
  
  if (templateStore.templates.length === 0) {
    await templateStore.fetchAll()
  }
  
  const templateMap = {}
  templateStore.templates.forEach((t) => { templateMap[String(t.id).trim()] = t.name })
  
  const range = spreadsheetStore.selectedRange
  let renamed = 0
  
  if (range && row >= range.rowStart && row <= range.rowEnd && col >= range.colStart && col <= range.colEnd) {
    for (let r = Math.max(1, range.rowStart); r <= range.rowEnd; r++) {
      const idVal = cellDisplay(r, idCol).trim()
      if (idVal && templateMap[idVal] !== undefined) {
        const nextCell = makeTemplateCell(templateMap[idVal])
        spreadsheetStore.updateCell(activeSheetIndex.value, r, nomeCol, nextCell)
        renamed++
      }
    }
  } else {
    const idVal = cellDisplay(row, idCol).trim()
    if (idVal && templateMap[idVal] !== undefined) {
      const nextCell = makeTemplateCell(templateMap[idVal])
      spreadsheetStore.updateCell(activeSheetIndex.value, row, nomeCol, nextCell)
      renamed++
    }
  }
  
  if (renamed > 0) {
    spreadsheetStore.pushCheckpoint(spreadsheetStore.sheets)
    const notificationStore = useNotificationStore()
    notificationStore.show({ type: 'success', message: `Aggiornato nome da catalogo per ${renamed} righe.` })
  } else {
    const notificationStore = useNotificationStore()
    notificationStore.show({ type: 'warning', message: 'Nessun template corrispondente trovato nel catalogo.' })
  }
  closeCellContextMenu()
}

function setCourierPresetForCell(preset) {
  const row = contextMenu.value.row
  const col = contextMenu.value.col
  if (row <= 0 || col === -1) return
  
  const range = spreadsheetStore.selectedRange
  let changed = 0
  
  if (range && row >= range.rowStart && row <= range.rowEnd && col >= range.colStart && col <= range.colEnd) {
    for (let r = Math.max(1, range.rowStart); r <= range.rowEnd; r++) {
      updateCell(r, col, preset)
      changed++
    }
  } else {
    updateCell(row, col, preset)
    changed++
  }
  
  spreadsheetStore.pushCheckpoint(spreadsheetStore.sheets)
  const notificationStore = useNotificationStore()
  notificationStore.show({ type: 'success', message: `Impostato corriere "${preset}" su ${changed} righe.` })
  closeCellContextMenu()
}

function makeTemplateCell(value) {
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
    const text = stripTechnicalTextPrefix(token.replace(/<[^>]+>/g, ''))
    if (!text) return
    const last = runs[runs.length - 1]
    if (last && Boolean(last.bold) === bold) {
      last.text += text
    } else {
      runs.push({ text, bold })
    }
  })

  const text = runs.map((run) => run.text).join('')
  if (!runs.some((run) => run.bold)) return makePlainTextCell(text)
  return {
    v: text,
    m: text,
    w: text,
    ct: {
      t: 'inlineStr',
      s: runs.map((run) => ({ v: run.text, bl: run.bold ? 1 : 0 })),
    },
  }
}

function templateMarkupPreview(value) {
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
    const text = stripTechnicalTextPrefix(token.replace(/<[^>]+>/g, ''))
    if (!text) return
    const last = runs[runs.length - 1]
    if (last && Boolean(last.bold) === bold) {
      last.text += text
    } else {
      runs.push({ text, bold })
    }
  })

  return runs
    .map((run) => (run.bold ? `<strong>${escapeHtml(run.text)}</strong>` : escapeHtml(run.text)))
    .join('')
}

function deleteContextRow() {
  const row = contextMenu.value.row
  if (row <= 0) return
  if (!window.confirm(`Eliminare la riga ${row + 1}?`)) return
  
  spreadsheetStore.deleteRowsAction(activeSheetIndex.value, row, 1)
  const notificationStore = useNotificationStore()
  notificationStore.show({ type: 'success', message: `Riga ${row + 1} eliminata con successo.` })
  closeCellContextMenu()
}

function getIconSvgPath(icon) {
  const paths = {
    search: '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>',
    bold: '<path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c1.1 0 2 .9 2 2s-.9 2-2 2h-3v-4zm3.5 9H10v-4h3.5c1.1 0 2 .9 2 2s-.9 2-2 2z"/>',
    fit: '<path d="M20 9H4v2h16V9zM4 15h16v-2H4v2zM9 5v4h2V5H9zm4 10v4h2v-4h-2z"/>',
    filter: '<path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>',
    'insert-left': '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>',
    'insert-right': '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>',
    'insert-row-above': '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>',
    'insert-row-below': '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>',
    delete: '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>',
    magic: '<path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8l-2.5-1.4 1.4 2.5-1.4 2.5 2.5-1.4 2.5 1.4-1.4-2.5zM19.3 2.2l-2.5 1.4 1.4 2.5-1.4 2.5 2.5-1.4 2.5 1.4-1.4-2.5zm-3.6 7.6L3.2 22.3c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L17.1 11.2l-1.4-1.4z"/>',
    padlock: '<path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>',
    truck: '<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm11.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM15 12H4V6h11v6z"/>',
    text: '<path d="M4 19h16v-2H4v2zm0-4h16v-2H4v2zm0-4h16V9H4v2zm0-6v2h16V5H4z"/>',
    spaces: '<path d="M4 7h16M4 12h10M4 17h16M16 12h4"/>',
    trim: '<path d="M5 5h14M12 5v14M8 19h8"/>'
  }
  return paths[icon] || ''
}

// ============================================================
// Premium spreadsheet features setup and additions
// ============================================================

const flashingCells = ref(new Set())

function handleCellsReplaced(event) {
  if (event.detail?.sheetIndex === activeSheetIndex.value && Array.isArray(event.detail?.cells)) {
    event.detail.cells.forEach(c => {
      flashingCells.value.add(`${c.row}_${c.col}`)
    })
    setTimeout(() => {
      event.detail.cells.forEach(c => {
        flashingCells.value.delete(`${c.row}_${c.col}`)
      })
    }, 1800)
  }
}

// 1. Formula Bar properties
const activeCell = computed(() => {
  const range = spreadsheetStore.selectedRange
  if (!range) return null
  return { row: range.rowStart, col: range.colStart }
})

const activeCellCoordinate = computed(() => {
  const cell = activeCell.value
  if (!cell) return '--'
  return `${columnName(cell.col)}${cell.row + 1}`
})

const activeCellText = computed(() => {
  const cell = activeCell.value
  if (!cell) return ''
  return cellDisplay(cell.row, cell.col)
})

function updateActiveCellFromFormulaBar(value) {
  const cell = activeCell.value
  if (!cell) return
  updateCell(cell.row, cell.col, value)
}

// 2. Active Header tracking
function isColHeaderActive(col) {
  if (col === hoveredCol.value) return true
  const range = spreadsheetStore.selectedRange
  if (!range) return false
  return col >= range.colStart && col <= range.colEnd
}

function isRowHeaderActive(row) {
  if (row === hoveredRow.value) return true
  const range = spreadsheetStore.selectedRange
  if (!range) return false
  return row >= range.rowStart && row <= range.rowEnd
}

// 3. EAN Checkers
function isEanColumn(col) {
  return getHeaderLabel(col).toLowerCase() === 'ean'
}

function isInvalidEanValue(val) {
  const cleaned = String(val ?? '').trim()
  if (!cleaned) return false
  if (!/^\d+$/.test(cleaned)) return true
  return cleaned.length !== 8 && cleaned.length !== 13
}

function isInvalidEanCell(row, col) {
  if (!isEanColumn(col)) return false
  return isInvalidEanValue(cellDisplay(row, col))
}

function cellTooltip(row, col) {
  if (row === 0) return null
  let tooltip = ''
  if (isCellModified(row, col)) {
    const origCell = originalSheetData.value?.[row]?.[col]
    const origVal = readCellText(origCell)
    tooltip += `Valore originale: "${origVal}"`
  }
  if (isInvalidEanCell(row, col)) {
    if (tooltip) tooltip += '\n'
    tooltip += `Attenzione: EAN non valido! Deve essere di 8 o 13 cifre numeriche.`
  }
  return tooltip || null
}

// 4. Autosave footer pulse and statistics
const isAutosavePulsing = ref(false)

const lastSavedTimeText = computed(() => {
  const ts = spreadsheetStore.lastSavedAt
  if (!ts) return '--:--:--'
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

watch(() => spreadsheetStore.lastSavedAt, () => {
  isAutosavePulsing.value = true
  setTimeout(() => {
    isAutosavePulsing.value = false
  }, 1500)
})

function fitAllColumnsToContent() {
  if (!spreadsheetStore.hasData) return
  columns.value.forEach(col => fitColumnToContent(col))
}

watch(() => spreadsheetStore.sheets, (newSheets, oldSheets) => {
  if (spreadsheetStore.autoFitOnLoad && newSheets?.length > 0 && (!oldSheets || oldSheets.length === 0)) {
    nextTick(() => fitAllColumnsToContent())
  }
}, { immediate: true })

const selectionStats = computed(() => {
  const range = spreadsheetStore.selectedRange
  if (!range) return null
  
  let sum = 0
  let count = 0
  let numberCount = 0
  
  const rowStart = Math.min(range.rowStart, range.rowEnd)
  const rowEnd = Math.max(range.rowStart, range.rowEnd)
  const colStart = Math.min(range.colStart, range.colEnd)
  const colEnd = Math.max(range.colStart, range.colEnd)
  
  const totalCells = (rowEnd - rowStart + 1) * (colEnd - colStart + 1)
  if (totalCells <= 1) return null
  
  for (let r = rowStart; r <= rowEnd; r++) {
    if (r === 0) continue
    for (let c = colStart; c <= colEnd; c++) {
      const valText = cellDisplay(r, c)
      count++
      if (valText && !isNaN(valText.replace(',', '.'))) {
        const num = parseFloat(valText.replace(',', '.'))
        if (isFinite(num)) {
          sum += num
          numberCount++
        }
      }
    }
  }
  
  if (numberCount === 0) return null
  const avg = sum / numberCount
  return { sum, avg, count }
})

function formatStat(val) {
  if (val === undefined || val === null) return ''
  if (Number.isInteger(val)) return val.toLocaleString()
  return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const eanIntegrity = computed(() => {
  let eanCol = -1
  for (let c = 0; c < colCount.value; c++) {
    if (isEanColumn(c)) {
      eanCol = c
      break
    }
  }
  
  if (eanCol === -1) return { validCount: 0, totalCount: 0, percentage: 100 }
  
  let totalCount = 0
  let validCount = 0
  
  for (let r = 1; r < rowCount.value; r++) {
    const val = cellDisplay(r, eanCol)
    if (val) {
      totalCount++
      if (!isInvalidEanValue(val)) {
        validCount++
      }
    }
  }
  
  const percentage = totalCount > 0 ? Math.round((validCount / totalCount) * 100) : 100
  return { validCount, totalCount, percentage }
})

// 5. Drag fill handle with Smart sequence auto-increment
function isSelectionBottomRight(row, col) {
  const range = spreadsheetStore.selectedRange
  if (!range) return false
  return row === Math.max(range.rowStart, range.rowEnd) && col === Math.max(range.colStart, range.colEnd)
}

const dragFillRange = ref(null)

function isInsideDragFillPreview(row, col) {
  if (!dragFillRange.value) return false
  return row >= dragFillRange.value.rowStart && row <= dragFillRange.value.rowEnd &&
         col >= dragFillRange.value.colStart && col <= dragFillRange.value.colEnd
}

let dragStartPos = null
let originRange = null

function startDragFill(event) {
  const range = spreadsheetStore.selectedRange
  if (!range) return
  originRange = { ...range }
  dragStartPos = { x: event.clientX, y: event.clientY }
  
  window.addEventListener('mousemove', handleDragFill)
  window.addEventListener('mouseup', stopDragFill)
}

function handleDragFill(event) {
  if (!originRange || !dragStartPos) return
  const el = document.elementFromPoint(event.clientX, event.clientY)
  const cellEl = el?.closest('.sheet-cell')
  if (!cellEl) return
  
  const cellInput = cellEl.querySelector('.cell-input')
  const cellDataAttr = cellInput?.getAttribute('data-cell')
  if (!cellDataAttr) return
  
  const [targetRow, targetCol] = cellDataAttr.split('_').map(Number)
  if (targetRow === 0) return // Skip header label row
  
  const rowStart = Math.min(originRange.rowStart, originRange.rowEnd)
  const rowEnd = Math.max(originRange.rowStart, originRange.rowEnd)
  const colStart = Math.min(originRange.colStart, originRange.colEnd)
  const colEnd = Math.max(originRange.colStart, originRange.colEnd)
  
  const deltaX = event.clientX - dragStartPos.x
  const deltaY = event.clientY - dragStartPos.y
  
  let nextRange = { ...originRange }
  
  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    if (targetRow < rowStart) {
      nextRange = { rowStart: targetRow, rowEnd, colStart, colEnd }
    } else if (targetRow > rowEnd) {
      nextRange = { rowStart, rowEnd: targetRow, colStart, colEnd }
    }
  } else {
    if (targetCol < colStart) {
      nextRange = { rowStart, rowEnd, colStart: targetCol, colEnd }
    } else if (targetCol > colEnd) {
      nextRange = { rowStart, rowEnd, colStart, colEnd: targetCol }
    }
  }
  
  dragFillRange.value = nextRange
}

function stopDragFill() {
  window.removeEventListener('mousemove', handleDragFill)
  window.removeEventListener('mouseup', stopDragFill)
  
  if (dragFillRange.value) {
    performDragFill()
    dragFillRange.value = null
  }
  dragStartPos = null
  originRange = null
}

function performDragFill() {
  if (!originRange || !dragFillRange.value) return
  
  const rStartOrig = Math.min(originRange.rowStart, originRange.rowEnd)
  const rEndOrig = Math.max(originRange.rowStart, originRange.rowEnd)
  const cStartOrig = Math.min(originRange.colStart, originRange.colEnd)
  const cEndOrig = Math.max(originRange.colStart, originRange.colEnd)
  
  const rStartFill = Math.min(dragFillRange.value.rowStart, dragFillRange.value.rowEnd)
  const rEndFill = Math.max(dragFillRange.value.rowStart, dragFillRange.value.rowEnd)
  const cStartFill = Math.min(dragFillRange.value.colStart, dragFillRange.value.colEnd)
  const cEndFill = Math.max(dragFillRange.value.colStart, dragFillRange.value.colEnd)
  
  const allSheets = JSON.parse(JSON.stringify(spreadsheetStore.sheets))
  const sheet = allSheets[activeSheetIndex.value]
  
  for (let c = cStartFill; c <= cEndFill; c++) {
    for (let r = rStartFill; r <= rEndFill; r++) {
      if (r >= rStartOrig && r <= rEndOrig && c >= cStartOrig && c <= cEndOrig) continue
      
      let fillVal = ''
      
      if (rStartFill < rStartOrig || rEndFill > rEndOrig) {
        const origVals = []
        for (let row = rStartOrig; row <= rEndOrig; row++) {
          origVals.push(cellDisplay(row, c))
        }
        
        const numVals = origVals.map(v => v && !isNaN(v.replace(',', '.')) ? parseFloat(v.replace(',', '.')) : null)
        const allNumeric = numVals.every(v => v !== null)
        
        if (allNumeric && numVals.length > 1) {
          const step = (numVals[numVals.length - 1] - numVals[0]) / (numVals.length - 1)
          if (r > rEndOrig) {
            const dist = r - rEndOrig
            fillVal = String(numVals[numVals.length - 1] + dist * step)
          } else {
            const dist = rStartOrig - r
            fillVal = String(numVals[0] - dist * step)
          }
        } else {
          if (r > rEndOrig) {
            const idx = (r - rEndOrig - 1) % origVals.length
            fillVal = origVals[idx]
          } else {
            const idx = (rStartOrig - r - 1) % origVals.length
            fillVal = origVals[origVals.length - 1 - idx]
          }
        }
      } else {
        const origVals = []
        for (let col = cStartOrig; col <= cEndOrig; col++) {
          origVals.push(cellDisplay(r, col))
        }
        
        const numVals = origVals.map(v => v && !isNaN(v.replace(',', '.')) ? parseFloat(v.replace(',', '.')) : null)
        const allNumeric = numVals.every(v => v !== null)
        
        if (allNumeric && numVals.length > 1) {
          const step = (numVals[numVals.length - 1] - numVals[0]) / (numVals.length - 1)
          if (c > cEndOrig) {
            const dist = c - cEndOrig
            fillVal = String(numVals[numVals.length - 1] + dist * step)
          } else {
            const dist = cStartOrig - c
            fillVal = String(numVals[0] - dist * step)
          }
        } else {
          if (c > cEndOrig) {
            const idx = (c - cEndOrig - 1) % origVals.length
            fillVal = origVals[idx]
          } else {
            const idx = (cStartOrig - c - 1) % origVals.length
            fillVal = origVals[origVals.length - 1 - idx]
          }
        }
      }
      
      const prevCell = sheet.data[r]?.[c]
      const nextCell = makeEditedCell(prevCell, fillVal)
      
      if (!Array.isArray(sheet.data[r])) sheet.data[r] = []
      sheet.data[r][c] = nextCell
      sheet.row = Math.max(Number(sheet.row || 0), r + 1)
      sheet.column = Math.max(Number(sheet.column || 0), c + 1)
    }
  }
  
  spreadsheetStore.sheets = allSheets
  spreadsheetStore.isUnsaved = true
  spreadsheetStore.pushCheckpoint(allSheets)
  spreadsheetStore.persistRecoverySnapshot(allSheets)
  
  spreadsheetStore.setSelectedRange({
    rowStart: rStartFill,
    rowEnd: rEndFill,
    colStart: cStartFill,
    colEnd: cEndFill
  })
}

// 6. Column Quick Filters
const activeFilterPopover = ref({
  show: false,
  x: 0,
  y: 0,
  col: -1,
  searchQuery: ''
})

function toggleColumnFilterPopover(col, event) {
  if (activeFilterPopover.value.show && activeFilterPopover.value.col === col) {
    activeFilterPopover.value.show = false
    return
  }
  const rect = event.currentTarget.getBoundingClientRect()
  activeFilterPopover.value = {
    show: true,
    x: rect.left,
    y: rect.bottom + window.scrollY + 4,
    col,
    searchQuery: ''
  }
  
  nextTick(() => {
    window.addEventListener('click', closeColumnFilterPopover)
  })
}

function closeColumnFilterPopover() {
  activeFilterPopover.value.show = false
  window.removeEventListener('click', closeColumnFilterPopover)
}

function getColumnUniqueValues(col) {
  const counts = {}
  for (let r = 1; r < rowCount.value; r++) {
    const val = cellDisplay(r, col)
    counts[val] = (counts[val] || 0) + 1
  }
  return Object.keys(counts).map(key => ({
    value: key,
    count: counts[key]
  })).sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true }))
}

function getFilteredUniqueValues(col) {
  const list = getColumnUniqueValues(col)
  const q = (activeFilterPopover.value.searchQuery || '').trim().toLowerCase()
  if (!q) return list
  return list.filter(item => item.value.toLowerCase().includes(q))
}

function isColumnFiltered(col) {
  return Array.isArray(spreadsheetStore.columnFilters[col])
}

function isFilterChecked(col, value) {
  const filter = spreadsheetStore.columnFilters[col]
  if (!Array.isArray(filter)) return true
  return filter.includes(value)
}

function toggleFilterValue(col, value) {
  if (!spreadsheetStore.columnFilters) spreadsheetStore.columnFilters = {}
  let filter = spreadsheetStore.columnFilters[col]
  const allVals = getColumnUniqueValues(col).map(item => item.value)
  
  if (!Array.isArray(filter)) {
    filter = [...allVals]
  }
  
  if (filter.includes(value)) {
    filter = filter.filter(v => v !== value)
  } else {
    filter.push(value)
  }
  
  if (filter.length === allVals.length) {
    delete spreadsheetStore.columnFilters[col]
  } else {
    spreadsheetStore.columnFilters[col] = filter
  }
  
  spreadsheetStore.persistRecoverySnapshot(spreadsheetStore.sheets)
}

function isAllSelectedForFilter(col) {
  const filter = spreadsheetStore.columnFilters[col]
  if (!Array.isArray(filter)) return true
  const allVals = getColumnUniqueValues(col).map(item => item.value)
  return filter.length === allVals.length
}

function toggleSelectAllFilter(col) {
  if (isAllSelectedForFilter(col)) {
    spreadsheetStore.columnFilters[col] = []
  } else {
    delete spreadsheetStore.columnFilters[col]
  }
  spreadsheetStore.persistRecoverySnapshot(spreadsheetStore.sheets)
}

function clearColumnFilter(col) {
  if (spreadsheetStore.columnFilters) {
    delete spreadsheetStore.columnFilters[col]
  }
  spreadsheetStore.persistRecoverySnapshot(spreadsheetStore.sheets)
}

const filteredRows = computed(() => {
  const allRows = rows.value
  if (!spreadsheetStore.columnFilters || Object.keys(spreadsheetStore.columnFilters).length === 0) return allRows
  
  return allRows.filter(row => {
    if (row === 0) return true
    
    for (const colStr of Object.keys(spreadsheetStore.columnFilters)) {
      const col = parseInt(colStr, 10)
      const allowed = spreadsheetStore.columnFilters[col]
      if (!Array.isArray(allowed)) continue
      
      const val = cellDisplay(row, col)
      if (!allowed.includes(val)) return false
    }
    return true
  })
})
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

.cell-input.rich-editing {
  font-weight: bold;
}

.cell-input.ghost {
  color: transparent;
  caret-color: var(--text-primary);
}

.cell-input:focus {
  background: var(--accent-light);
  color: var(--text-primary);
}

.cell-input.ghost:focus {
  color: transparent;
}

.cell-rich-editing {
  background: var(--accent-light);
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

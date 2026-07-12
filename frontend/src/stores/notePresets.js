import { defineStore } from 'pinia'
import api from '../api/index.js'

const STORAGE_KEY = 'orderedit:note-presets:v1'
const DEFAULT_PRESETS = ['Chiamare prima della consegna', 'Consegna al piano strada']

export const useNotePresetStore = defineStore('notePresets', {
  state: () => ({ presets: [], loaded: false }),
  actions: {
    async load() {
      if (this.loaded) return
      try {
        const res = await api.get('/notes')
        if (Array.isArray(res.data?.presets)) {
          this.presets = res.data.presets.map(v => String(v ?? '').trim()).filter((v, i, a) => v && a.indexOf(v) === i)
          this.saveLocalStorage()
          this.loaded = true
          return
        }
      } catch (e) {
        console.warn('[NotePresetStore] Failed to load from server, using localStorage fallback:', e)
      }
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
        this.presets = Array.isArray(parsed) && parsed.length
          ? parsed.map(v => String(v ?? '').trim()).filter((v, i, a) => v && a.indexOf(v) === i)
          : [...DEFAULT_PRESETS]
      } catch { this.presets = [...DEFAULT_PRESETS] }
      this.saveLocalStorage()
      this.loaded = true
    },
    saveLocalStorage() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.presets)) } catch {} },
    async save() {
      this.saveLocalStorage()
      try { await api.post('/notes', { presets: this.presets }) } catch (e) { console.error('[NotePresetStore] Failed to save to server:', e) }
    },
    add(value) { const next = String(value ?? '').trim(); if (!next || this.presets.includes(next)) return false; this.presets.push(next); this.save(); return true },
    update(index, value) { const next = String(value ?? '').trim(); if (!Number.isInteger(index) || index < 0 || index >= this.presets.length || !next || (this.presets.includes(next) && this.presets[index] !== next)) return false; this.presets[index] = next; this.save(); return true },
    remove(index) { if (!Number.isInteger(index) || index < 0 || index >= this.presets.length) return false; this.presets.splice(index, 1); this.save(); return true },
    async importPresets(values) { if (!Array.isArray(values)) return false; this.presets = values.map(v => String(v ?? '').trim()).filter((v, i, a) => v && a.indexOf(v) === i); await this.save(); return true },
    async resetToDefaults() { this.presets = [...DEFAULT_PRESETS]; await this.save(); return true },
  },
})

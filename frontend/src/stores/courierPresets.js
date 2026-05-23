import { defineStore } from 'pinia'
import api from '../api/index.js'

const STORAGE_KEY = 'orderedit:courier-presets:v1'
const DEFAULT_PRESETS = ['Corriere Express', 'GLS', 'BRT']

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export const useCourierPresetStore = defineStore('courierPresets', {
  state: () => ({
    presets: [],
    loaded: false,
  }),
  actions: {
    async load() {
      if (this.loaded) return
      
      // 1. Try to load from server first
      try {
        const res = await api.get('/couriers')
        if (res.data && Array.isArray(res.data.presets)) {
          this.presets = res.data.presets
            .map((v) => String(v ?? '').trim())
            .filter((v, i, arr) => v && arr.indexOf(v) === i)
          this.saveLocalStorage()
          this.loaded = true
          return
        }
      } catch (e) {
        console.warn('[CourierPresetStore] Failed to load from server, using localStorage fallback:', e)
      }

      // 2. Fallback to localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          this.presets = clone(DEFAULT_PRESETS)
          this.saveLocalStorage()
        } else {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.presets = parsed
              .map((v) => String(v ?? '').trim())
              .filter((v, i, arr) => v && arr.indexOf(v) === i)
          } else {
            this.presets = clone(DEFAULT_PRESETS)
            this.saveLocalStorage()
          }
        }
      } catch {
        this.presets = clone(DEFAULT_PRESETS)
      } finally {
        this.loaded = true
      }
    },
    saveLocalStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.presets))
      } catch {}
    },
    async save() {
      // Always save locally first for resilience
      this.saveLocalStorage()
      
      // Save to server
      try {
        await api.post('/couriers', { presets: this.presets })
      } catch (e) {
        console.error('[CourierPresetStore] Failed to save to server:', e)
      }
    },
    add(value) {
      const next = String(value ?? '').trim()
      if (!next) return false
      if (this.presets.includes(next)) return false
      this.presets.push(next)
      this.save()
      return true
    },
    update(index, value) {
      if (!Number.isInteger(index) || index < 0 || index >= this.presets.length) return false
      const next = String(value ?? '').trim()
      if (!next) return false
      const duplicateIdx = this.presets.findIndex((p) => p === next)
      if (duplicateIdx !== -1 && duplicateIdx !== index) return false
      this.presets[index] = next
      this.save()
      return true
    },
    remove(index) {
      if (!Number.isInteger(index) || index < 0 || index >= this.presets.length) return false
      this.presets.splice(index, 1)
      this.save()
      return true
    },
    async importPresets(presetsArray) {
      if (!Array.isArray(presetsArray)) return false
      const clean = presetsArray
        .map((v) => String(v ?? '').trim())
        .filter((v, i, arr) => v && arr.indexOf(v) === i)
      this.presets = clean
      await this.save()
      return true
    },
    async resetToDefaults() {
      this.presets = ['Corriere Express', 'GLS', 'BRT']
      await this.save()
      return true
    },
  },
})

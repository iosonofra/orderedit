import { defineStore } from 'pinia'

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
    load() {
      if (this.loaded) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          this.presets = clone(DEFAULT_PRESETS)
          this.save()
        } else {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.presets = parsed
              .map((v) => String(v ?? '').trim())
              .filter((v, i, arr) => v && arr.indexOf(v) === i)
          } else {
            this.presets = clone(DEFAULT_PRESETS)
            this.save()
          }
        }
      } catch {
        this.presets = clone(DEFAULT_PRESETS)
      } finally {
        this.loaded = true
      }
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.presets))
      } catch {}
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
  },
})

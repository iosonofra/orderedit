import { defineStore } from 'pinia'

const NOTIFICATION_PREFS_KEY = 'orderedit:notification-prefs:v1'
const LEVELS = { all: 0, info: 1, success: 1, warning: 2, error: 3 }

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    toasts: [],
    _nextId: 0,
    duration: 5000,
    position: 'bottom-right',
    level: 'all',
  }),
  actions: {
    loadPrefs() {
      try {
        const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        const duration = Number.parseInt(parsed?.duration, 10)
        if (Number.isFinite(duration)) this.duration = Math.max(0, Math.min(30000, duration))
        if (['bottom-right', 'bottom-center'].includes(parsed?.position)) this.position = parsed.position
        if (['all', 'warning', 'error'].includes(parsed?.level)) this.level = parsed.level
      } catch {}
    },
    savePrefs() {
      try {
        localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify({
          duration: this.duration,
          position: this.position,
          level: this.level,
        }))
      } catch {}
    },
    setDuration(duration) {
      this.duration = Math.max(0, Math.min(30000, Number.parseInt(duration, 10) || 0))
      this.savePrefs()
    },
    setPosition(position) {
      if (!['bottom-right', 'bottom-center'].includes(position)) return
      this.position = position
      this.savePrefs()
    },
    setLevel(level) {
      if (!['all', 'warning', 'error'].includes(level)) return
      this.level = level
      this.savePrefs()
    },
    shouldShow(type) {
      if (this.level === 'all') return true
      return (LEVELS[type] || 1) >= (LEVELS[this.level] || 0)
    },
    show({ type = 'info', message, duration = null }) {
      if (!this.shouldShow(type)) return
      const id = this._nextId++
      this.toasts.push({ id, type, message })
      const timeout = duration === null || duration === undefined ? this.duration : duration
      if (timeout > 0) {
        setTimeout(() => this.dismiss(id), timeout)
      }
    },
    dismiss(id) {
      const idx = this.toasts.findIndex((t) => t.id === id)
      if (idx !== -1) this.toasts.splice(idx, 1)
    },
  },
})

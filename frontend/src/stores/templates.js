import { defineStore } from 'pinia'
import api from '../api/index.js'

export const useTemplateStore = defineStore('templates', {
  state: () => ({
    templates: [],
    loading: false,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data } = await api.get('/templates')
        this.templates = data.templates || []
      } finally {
        this.loading = false
      }
    },
    async create(id, name) {
      const { data } = await api.post('/templates', { id, name })
      this.templates.push(data)
      this.templates.sort((a, b) =>
        String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
      )
      return data
    },
    async update(id, name) {
      const { data } = await api.put(`/templates/${id}`, { name })
      const idx = this.templates.findIndex((t) => t.id === id)
      if (idx !== -1) this.templates[idx] = data
      return data
    },
    async remove(id) {
      await api.delete(`/templates/${id}`)
      this.templates = this.templates.filter((t) => t.id !== id)
    },
    async importBulk(payload) {
      const { data } = await api.post('/templates/import', payload)
      await this.fetchAll()
      return data
    },
    async exportAll(format = 'csv') {
      const response = await api.get(`/templates/export/${format}`, { responseType: 'blob' })
      const ext = format === 'json' ? 'json' : 'csv'
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `templates_export.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  },
})

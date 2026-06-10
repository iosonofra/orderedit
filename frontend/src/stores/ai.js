import { defineStore } from 'pinia'
import api from '../api/index.js'

export const useAiStore = defineStore('ai', {
  state: () => ({
    enabled: true,
    provider: 'openrouter', // openrouter | nvidia | custom
    apiKey: '',
    hasApiKey: false,
    model: 'google/gemini-2.5-flash:free', // Default recommended free model
    customUrl: '',
    courierRules: '',
    temperature: 0.1,
    systemPrompt: '',
    maxTokens: 1500,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    concurrency: 3,
    logs: [],
    isProcessing: false,
    isConfigLoading: false,
    isConfigSaving: false,
    // SSE progress state
    progressPhase: '',      // 'rename' | 'ai' | 'applying' | 'done' | ''
    progressBatch: 0,
    progressTotal: 0,
    progressMessage: '',
    progressError: null,    // last error message from batch-error
  }),
  getters: {
    progressPercent(state) {
      if (!state.isProcessing || state.progressTotal === 0) return 0
      if (state.progressPhase === 'rename') return 5
      if (state.progressPhase === 'applying') return 95
      if (state.progressPhase === 'done') return 100
      // AI phase: map batch progress from 10% to 90%
      const ratio = state.progressBatch / state.progressTotal
      return Math.round(10 + ratio * 80)
    },
  },
  actions: {
    async load() {
      this.isConfigLoading = true
      try {
        const { data } = await api.get('/ai/config')
        if (data) {
          this.enabled = data.enabled !== undefined ? !!data.enabled : true
          this.provider = data.provider || 'openrouter'
          this.apiKey = data.apiKey || ''
          this.hasApiKey = !!data.hasApiKey
          this.model = data.model || 'google/gemini-2.5-flash:free'
          this.customUrl = data.customUrl || ''
          this.courierRules = data.courierRules || ''
          this.temperature = data.temperature !== undefined ? Number(data.temperature) : 0.1
          this.systemPrompt = data.systemPrompt || ''
          this.maxTokens = data.maxTokens !== undefined ? Number(data.maxTokens) : 1500
          this.frequencyPenalty = data.frequencyPenalty !== undefined ? Number(data.frequencyPenalty) : 0.0
          this.presencePenalty = data.presencePenalty !== undefined ? Number(data.presencePenalty) : 0.0
          this.concurrency = data.concurrency !== undefined ? Number(data.concurrency) : 3
        }
      } catch (err) {
        console.error('Errore caricamento impostazioni AI dal backend:', err)
      } finally {
        this.isConfigLoading = false
      }
    },
    async save() {
      this.isConfigSaving = true
      try {
        await api.post('/ai/config', {
          enabled: this.enabled,
          provider: this.provider,
          apiKey: this.apiKey,
          model: this.model,
          customUrl: this.customUrl,
          courierRules: this.courierRules,
          temperature: this.temperature,
          systemPrompt: this.systemPrompt,
          maxTokens: this.maxTokens,
          frequencyPenalty: this.frequencyPenalty,
          presencePenalty: this.presencePenalty,
          concurrency: this.concurrency,
        })
        // Refresh values after save (to get masked key updated if modified)
        await this.load()
      } catch (err) {
        console.error('Errore salvataggio impostazioni AI nel backend:', err)
        throw err
      } finally {
        this.isConfigSaving = false
      }
    },
    async fetchLogs() {
      try {
        const { data } = await api.get('/ai/logs')
        if (data && Array.isArray(data.logs)) {
          this.logs = data.logs
        }
      } catch (err) {
        console.error('Errore recupero log AI dal server:', err)
      }
    },
    resetProgress() {
      this.progressPhase = ''
      this.progressBatch = 0
      this.progressTotal = 0
      this.progressMessage = ''
      this.progressError = null
    },
    setProgress(phase, message) {
      this.progressPhase = phase
      this.progressMessage = message
    },
    /**
     * Stream-based AI processing via SSE.
     * Returns a promise that resolves with the processedRows array,
     * or rejects on fatal error.
     */
    processSheetStream(sheetData, columnsMapping, courierPresets) {
      return new Promise((resolve, reject) => {
        this.isProcessing = true
        this.resetProgress()
        this.setProgress('ai', 'Connessione al server AI...')

        const baseUrl = api.defaults.baseURL || '/api'
        const url = `${baseUrl}/ai/process-sheet-stream`

        const body = JSON.stringify({ sheetData, columnsMapping, courierPresets })

        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            if (!response.body) {
              throw new Error('ReadableStream non supportato dal browser.')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let processedRows = null
            let batchErrors = 0

            const pump = () => {
              reader.read().then(({ done, value }) => {
                if (done) {
                  // Stream finished
                  if (processedRows) {
                    resolve({ processedRows, batchErrors })
                  } else {
                    reject(new Error('Stream terminato senza risultati.'))
                  }
                  return
                }

                buffer += decoder.decode(value, { stream: true })

                // Parse SSE lines
                const lines = buffer.split('\n')
                buffer = lines.pop() // Keep incomplete line in buffer

                for (const line of lines) {
                  if (!line.startsWith('data: ')) continue
                  const jsonStr = line.slice(6).trim()
                  if (!jsonStr) continue

                  try {
                    const event = JSON.parse(jsonStr)

                    switch (event.type) {
                      case 'start':
                        this.progressTotal = event.totalBatches
                        this.progressBatch = 0
                        this.setProgress('ai', `Avvio elaborazione di ${event.totalRows} righe...`)
                        break

                      case 'progress':
                        this.progressBatch = event.batch
                        this.progressTotal = event.totalBatches
                        this.progressPhase = event.phase || 'ai'
                        this.progressMessage = event.message || `Batch ${event.batch}/${event.totalBatches}...`
                        break

                      case 'batch-error':
                        this.progressError = event.message
                        console.warn(`[AI] Batch #${event.batch} errore: ${event.message}`)
                        break

                      case 'result':
                        processedRows = event.processedRows || []
                        batchErrors = event.batchErrors || 0
                        this.setProgress('applying', 'Applicazione risultati...')
                        break

                      case 'error':
                        reject(new Error(event.message))
                        return

                      case 'done':
                        // Will be handled when stream closes
                        break
                    }
                  } catch (parseErr) {
                    console.warn('[AI SSE] Errore parsing evento:', parseErr, jsonStr)
                  }
                }

                pump()
              }).catch((readErr) => {
                reject(readErr)
              })
            }

            pump()
          })
          .catch((fetchErr) => {
            this.isProcessing = false
            this.resetProgress()
            reject(fetchErr)
          })
      })
    },
  }
})

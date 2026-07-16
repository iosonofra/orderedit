import axios from 'axios'
import { useNotificationStore } from '../stores/notification.js'
import { getWorkspaceId } from './workspace.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  config.headers['X-OrderEdit-Workspace'] = getWorkspaceId()
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Timeout della richiesta' : 'Errore di connessione al server')

    // Avoid using store before Pinia is ready (e.g. during init)
    try {
      const store = useNotificationStore()
      store.show({ type: 'error', message: msg })
    } catch { /* silent */ }

    return Promise.reject(err)
  }
)

export default api

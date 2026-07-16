const WORKSPACE_STORAGE_KEY = 'orderedit:workspace-id:v1'

function generateWorkspaceId() {
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID()

  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function getWorkspaceId() {
  let workspaceId = sessionStorage.getItem(WORKSPACE_STORAGE_KEY)
  if (!workspaceId) {
    workspaceId = generateWorkspaceId()
    sessionStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId)
  }
  return workspaceId
}

export function workspaceStorageKey(key) {
  return `${key}:${getWorkspaceId()}`
}

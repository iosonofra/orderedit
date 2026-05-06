<template>
  <div class="app-shell">
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-name">OrderEdit</span>
      </div>

      <div class="navbar-nav">
        <RouterLink to="/editor" class="nav-link" active-class="nav-link--active">
          Foglio
        </RouterLink>
        <RouterLink to="/catalog" class="nav-link" active-class="nav-link--active">
          Catalogo
        </RouterLink>
        <RouterLink to="/settings" class="nav-link" active-class="nav-link--active">
          Impostazioni
        </RouterLink>
      </div>

      <div class="navbar-meta">
        <span v-if="spreadsheetStore.filename" class="filename-badge" :class="{ 'has-unsaved': spreadsheetStore.isUnsaved }">
          <span class="filename-text">{{ spreadsheetStore.filename }}</span>
          <span v-if="spreadsheetStore.isUnsaved" class="unsaved-pill">Non salvato</span>
        </span>
      </div>
    </nav>

    <main class="app-main">
      <RouterView />
    </main>

    <Teleport to="body">
      <div :class="['toast-container', `toast-container-${notificationStore.position}`]">
        <TransitionGroup name="toast-anim">
          <div
            v-for="toast in notificationStore.toasts"
            :key="toast.id"
            :class="['toast', `toast-${toast.type}`]"
          >
            <span class="toast-icon">{{ toastIcon(toast.type) }}</span>
            <span class="toast-body">{{ toast.message }}</span>
            <button class="toast-close btn" @click="notificationStore.dismiss(toast.id)">x</button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useNotificationStore } from './stores/notification.js'
import { useSpreadsheetStore } from './stores/spreadsheet.js'

const notificationStore = useNotificationStore()
const spreadsheetStore = useSpreadsheetStore()

function toastIcon(type) {
  return { success: 'OK', error: 'ERR', warning: 'ATT', info: 'INFO' }[type] ?? 'INFO'
}

function handleBeforeUnload(e) {
  if (spreadsheetStore.isUnsaved) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  let savedTheme = null
  try {
    savedTheme = localStorage.getItem('orderedit:theme')
  } catch {}
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', initialTheme)
  try {
    if (!savedTheme) localStorage.setItem('orderedit:theme', 'light')
  } catch {}
  spreadsheetStore.loadExportPrefs()
  spreadsheetStore.loadEditorPrefs()
  notificationStore.loadPrefs()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.navbar {
  height: var(--navbar-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  flex-shrink: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.navbar-nav {
  display: flex;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--transition), background var(--transition);
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-link--active {
  color: var(--accent);
  background: var(--accent-light);
}

.navbar-meta {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filename-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 280px;
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-muted);
  background: transparent;
  font-size: 11px;
}

.filename-badge.has-unsaved {
  border-color: rgba(245, 158, 11, 0.3);
}

.filename-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unsaved-pill {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--warning-light);
  color: var(--warning);
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.app-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.toast-anim-enter-active {
  transition: all 0.18s ease;
}

.toast-anim-leave-active {
  transition: all 0.14s ease;
}

.toast-anim-enter-from,
.toast-anim-leave-to {
  transform: translateY(12px);
  opacity: 0;
}
</style>

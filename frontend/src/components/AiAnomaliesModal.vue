<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal ai-anomalies-modal animate-fade-in" @click.stop>

        <div class="modal-header">
          <div class="header-title-box">
            <svg class="header-icon warning-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3>Anomalie rilevate dall'AI</h3>
            <span class="anomaly-count-badge">{{ anomalies.length }}</span>
          </div>
          <button class="btn btn-icon" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <p class="intro-text">
            L'elaborazione AI è completata. Sono state rilevate le seguenti anomalie nei dati del foglio di calcolo. Verifica e correggi manualmente dove necessario.
          </p>

          <div class="anomalies-list-container">
            <div v-for="(anom, idx) in anomalies" :key="idx" class="anomaly-card">
              <div class="anomaly-card-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div class="anomaly-card-content">
                <p class="anomaly-card-desc">{{ anom.description }}</p>
                <div class="anomaly-card-badges">
                  <span class="anomaly-badge">Riga {{ anom.rowIndex + 1 }}</span>
                  <span class="anomaly-badge">ID: <code>{{ anom.id }}</code></span>
                  <span v-if="anom.destination" class="anomaly-badge truncate-badge" :title="anom.destination">
                    Dest: {{ anom.destination }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary btn-with-icon" @click="$emit('close')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            OK, capito
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: Boolean,
  anomalies: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['close'])
</script>

<style scoped>
.ai-anomalies-modal {
  max-width: 680px;
  width: 90vw;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: 75vh;
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.warning-icon {
  color: var(--warning, #f59e0b);
}

.modal-header h3 {
  font-size: 16px;
  margin: 0;
  color: var(--text-primary);
}

.anomaly-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  font-size: 12px;
  font-weight: 700;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: var(--bg-secondary);
}

.intro-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.anomalies-list-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.anomaly-card {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(245, 158, 11, 0.02);
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-left: 4px solid var(--warning, #f59e0b);
  border-radius: var(--radius-md, 6px);
  animation: anomalySlideIn 0.25s ease both;
}

@keyframes anomalySlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.anomaly-card:nth-child(n) {
  animation-delay: calc(0.04s * var(--i, 0));
}

:root[data-theme='light'] .anomaly-card {
  background: rgba(245, 158, 11, 0.03);
  border-color: rgba(245, 158, 11, 0.18);
}

.anomaly-card-icon {
  color: var(--warning, #f59e0b);
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.anomaly-card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.anomaly-card-desc {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.45;
}

.anomaly-card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.anomaly-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-hover, #f3f4f6);
  color: var(--text-secondary);
}

.anomaly-badge code {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--text-primary);
}

.truncate-badge {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

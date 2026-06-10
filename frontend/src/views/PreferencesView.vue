<template>
  <div class="settings-page">
    <!-- Sidebar Navigation -->
    <div class="settings-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Impostazioni</h2>
        <p class="sidebar-subtitle">Configura l'esperienza di OrderEdit</p>
      </div>
      <nav class="sidebar-nav">
        <button
          class="sidebar-tab-btn"
          :class="{ active: activeTab === 'general' }"
          @click="activeTab = 'general'"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Generali & Aspetto
        </button>

        <button
          class="sidebar-tab-btn"
          :class="{ active: activeTab === 'couriers' }"
          @click="activeTab = 'couriers'"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          Preset Corrieri
        </button>

        <button
          class="sidebar-tab-btn"
          :class="{ active: activeTab === 'backup' }"
          @click="activeTab = 'backup'"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
          </svg>
          Export & Backup
        </button>

        <button
          class="sidebar-tab-btn"
          :class="{ active: activeTab === 'notifications' }"
          @click="activeTab = 'notifications'"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          Notifiche
        </button>

        <button
          class="sidebar-tab-btn"
          :class="{ active: activeTab === 'mappings' }"
          @click="activeTab = 'mappings'"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
          </svg>
          Mappatura Colonne
        </button>

        <button
          class="sidebar-tab-btn"
          :class="{ active: activeTab === 'global-backup' }"
          @click="activeTab = 'global-backup'"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Backup & Ripristino
        </button>

        <button
          class="sidebar-tab-btn"
          :class="{ active: activeTab === 'ai' }"
          @click="activeTab = 'ai'"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
            <polyline points="7.5 19.79 7.5 14.6 12 12 16.5 14.6 16.5 19.79"></polyline>
            <polyline points="12 12 12 22"></polyline>
            <line x1="12" y1="6.81" x2="12" y2="12"></line>
          </svg>
          Integrazione AI
        </button>
      </nav>
    </div>

    <!-- Main Content Panel -->
    <div class="settings-content">
      <div class="settings-card-wrapper">
        
        <!-- SECTION 1: General & Appearance -->
        <div v-if="activeTab === 'general'" class="settings-card animate-fade-in">
          <div class="card-header">
            <h3 class="card-title">Generali & Aspetto</h3>
            <p class="card-subtitle">Personalizza il tema, il comportamento della griglia e l'evidenziazione delle colonne chiave.</p>
          </div>
          
          <div class="settings-form-grid">
            <div class="setting-row theme-setting-row" style="align-items: flex-start;">
              <div class="setting-info">
                <span class="setting-label">Tema dell'interfaccia</span>
                <span class="setting-desc">Seleziona tra tema chiaro e tema scuro ad alto contrasto.</span>
              </div>
              <div class="setting-control theme-options">
                <button
                  class="theme-card-btn light"
                  :class="{ active: themeMode === 'light' }"
                  @click="themeMode = 'light'; saveThemeMode()"
                  type="button"
                >
                  <div class="theme-preview-box light-preview">
                    <span class="preview-dot"></span>
                    <span class="preview-line"></span>
                    <span class="preview-line short"></span>
                  </div>
                  <span class="theme-label-text">Tema Chiaro</span>
                </button>
                <button
                  class="theme-card-btn dark"
                  :class="{ active: themeMode === 'dark' }"
                  @click="themeMode = 'dark'; saveThemeMode()"
                  type="button"
                >
                  <div class="theme-preview-box dark-preview">
                    <span class="preview-dot"></span>
                    <span class="preview-line"></span>
                    <span class="preview-line short"></span>
                  </div>
                  <span class="theme-label-text">Tema Scuro</span>
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Blocca intestazioni griglia</span>
                <span class="setting-desc">Mantieni bloccati la riga di intestazione e le prime colonne durante lo scorrimento.</span>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="freezePanesEnabled" type="checkbox" @change="saveFreezePanes" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Recupero automatico sessione</span>
                <span class="setting-desc">Ripristina automaticamente l'ultimo stato di lavoro a seguito di ricaricamenti imprevisti.</span>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="recoveryEnabled" type="checkbox" @change="saveRecoveryEnabled" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Adatta larghezza colonne</span>
                <span class="setting-desc">Regola automaticamente la larghezza delle colonne al caricamento di ogni file.</span>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="autoFitOnLoad" type="checkbox" @change="saveAutoFitOnLoad" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Evidenzia colonne chiave</span>
                <span class="setting-desc">Attiva sfondi soffici e bordi colorati sulle colonne ID, Nome, EAN e Corriere nella griglia.</span>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="highlightKeyColumns" type="checkbox" @change="saveHighlightKeyColumns" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: Courier Presets -->
        <div v-if="activeTab === 'couriers'" class="settings-card animate-fade-in">
          <div class="card-header">
            <h3 class="card-title">Preset Nomi Corrieri</h3>
            <p class="card-subtitle">Gestisci i nomi dei corrieri predefiniti. Salvati in tempo reale sul server e inclusi nel backup.</p>
          </div>

          <div class="couriers-manager">
            <div class="add-preset-box">
              <input
                v-model="newCourierPreset"
                class="input elegant-input"
                placeholder="es. DHL Express, GLS, BRT..."
                @keyup.enter="addCourierPreset"
              />
              <button class="btn btn-primary add-btn" @click="addCourierPreset">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Aggiungi
              </button>
            </div>

            <div class="presets-list-container" style="border: none; background: transparent;">
              <div class="courier-chips-grid">
                <div
                  v-for="(preset, idx) in courierPresetStore.presets"
                  :key="`${preset}-${idx}`"
                  class="courier-chip"
                  :class="{ editing: editingCourierIndex === idx }"
                >
                  <div v-if="editingCourierIndex === idx" class="chip-edit-wrapper">
                    <input
                      v-model="editingCourierName"
                      class="input chip-edit-input"
                      @keyup.enter="saveCourierPreset"
                      @keyup.escape="cancelCourierEdit"
                      autofocus
                    />
                    <button class="btn-chip-action check" @click="saveCourierPreset" title="Conferma">✓</button>
                    <button class="btn-chip-action cancel" @click="cancelCourierEdit" title="Annulla">×</button>
                  </div>
                  <div v-else class="chip-display-wrapper">
                    <span class="chip-name" @dblclick="startCourierEdit(idx, preset)">{{ preset }}</span>
                    <button class="chip-icon-btn edit" @click="startCourierEdit(idx, preset)" title="Modifica">✎</button>
                    <button class="chip-icon-btn delete" @click="removeCourierPreset(idx)" title="Elimina">×</button>
                  </div>
                </div>
                <div v-if="courierPresetStore.presets.length === 0" class="empty-presets-state" style="width: 100%;">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  </svg>
                  <p>Nessun preset corriere configurato sul server.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Export & Backup -->
        <div v-if="activeTab === 'backup'" class="settings-card animate-fade-in">
          <div class="card-header">
            <h3 class="card-title">Esportazione & Backup Locale</h3>
            <p class="card-subtitle">Definisci il nome dei file esportati e gestisci la memorizzazione dei backup fisici sul server.</p>
          </div>

          <div class="settings-form-grid">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Modalità nome file esportato</span>
                <span class="setting-desc">Regola la sintassi del nome del foglio di calcolo Excel generato.</span>
              </div>
              <div class="setting-control">
                <select v-model="exportMode" class="input elegant-select" @change="saveExportMode">
                  <option value="same">Identico all'originale</option>
                  <option value="timestamp">Nome originale + Data/Ora</option>
                  <option value="suffix">Nome originale + Suffisso fisso</option>
                </select>
              </div>
            </div>

            <div class="setting-row" v-if="exportMode === 'suffix'">
              <div class="setting-info">
                <span class="setting-label">Suffisso personalizzato</span>
                <span class="setting-desc">Inserisci il suffisso testuale da accodare al nome del file (es: _elaborato).</span>
              </div>
              <div class="setting-control suffix-input-box">
                <input
                  v-model="exportSuffix"
                  class="input elegant-input"
                  placeholder="es. _finale"
                  @keyup.enter="saveExportSuffix"
                />
                <button class="btn btn-secondary save-suffix-btn" @click="saveExportSuffix">Salva</button>
              </div>
            </div>

            <div class="setting-row preview-row">
              <div class="setting-info">
                <span class="setting-label">Anteprima nome file</span>
                <span class="setting-desc">Il nome del file salvato corrisponderà a questo pattern:</span>
              </div>
              <div class="setting-control preview-tag">
                <code>{{ spreadsheetStore.computeExportFilename(spreadsheetStore.filename || 'export.xlsx') }}</code>
              </div>
            </div>

            <hr class="settings-divider" />

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Mostra riepilogo modifiche</span>
                <span class="setting-desc">Mostra un report di confronto delle righe modificate prima di avviare il download del file.</span>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="showExportSummary" type="checkbox" @change="saveShowExportSummary" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Richiedi cartella di salvataggio</span>
                <span class="setting-desc">Mostra il selettore del file system del browser invece di scaricare direttamente nella cartella Download.</span>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="askExportSaveLocation" type="checkbox" @change="saveAskExportSaveLocation" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <hr class="settings-divider" />

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Salvataggio copie di backup sul server</span>
                <span class="setting-desc">Archivia in sicurezza sul server backend ogni file Excel esportato per prevenire perdite.</span>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="backupEnabled" type="checkbox" @change="saveBackupEnabled" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-row" v-if="backupEnabled">
              <div class="setting-info">
                <span class="setting-label">Limite copie di backup</span>
                <span class="setting-desc">Specifica il numero massimo di file di backup storici da mantenere su disco.</span>
              </div>
              <div class="setting-control suffix-input-box">
                <input
                  v-model.number="backupLimit"
                  class="input elegant-input compact-number"
                  type="number"
                  min="1"
                  max="500"
                  @keyup.enter="saveBackupLimit"
                />
                <button class="btn btn-secondary" @click="saveBackupLimit">Salva</button>
              </div>
            </div>

            <div class="backup-database-card">
              <div class="db-stats-box">
                <div class="db-stat-item">
                  <span class="db-stat-label">Copie Archiviate</span>
                  <span class="db-stat-value">{{ backupStats.count }}</span>
                </div>
                <div class="db-stat-item">
                  <span class="db-stat-label">Spazio Occupato</span>
                  <span class="db-stat-value">{{ formatBytes(backupStats.totalBytes) }}</span>
                </div>
              </div>
              <div class="db-progress-container" v-if="backupEnabled">
                <div class="db-progress-meta">
                  <span class="progress-text">Utilizzo archivio backup: <strong>{{ backupStats.count }}</strong> su <strong>{{ backupLimit }}</strong> copie</span>
                  <span class="progress-percentage">{{ Math.round((backupStats.count / Math.max(1, backupLimit)) * 100) }}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" :class="{ 'warning': (backupStats.count / Math.max(1, backupLimit)) >= 0.85 }" :style="{ width: `${Math.min(100, (backupStats.count / Math.max(1, backupLimit)) * 100)}%` }"></div>
                </div>
              </div>
              <div class="db-actions">
                <button class="btn btn-secondary btn-with-icon" @click="loadBackupStats" :disabled="backupLoading">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'animate-spin': backupLoading }">
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  Aggiorna Statistiche
                </button>
                <button class="btn btn-danger btn-with-icon" @click="deleteBackups" :disabled="backupLoading || backupStats.count === 0">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Elimina Tutti i Backup
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 4: Notifications -->
        <div v-if="activeTab === 'notifications'" class="settings-card animate-fade-in">
          <div class="card-header">
            <h3 class="card-title">Notifiche & Toast</h3>
            <p class="card-subtitle">Configura il posizionamento, la persistenza e il livello di dettaglio degli avvisi in-app.</p>
          </div>

          <div class="settings-form-grid">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Posizionamento delle notifiche</span>
                <span class="setting-desc">Seleziona dove visualizzare i messaggi a scomparsa sull'interfaccia.</span>
              </div>
              <div class="setting-control">
                <select v-model="notificationPosition" class="input elegant-select" @change="saveNotificationPosition">
                  <option value="bottom-right">In basso a destra</option>
                  <option value="bottom-center">In basso al centro</option>
                </select>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Durata di persistenza (ms)</span>
                <span class="setting-desc">Tempo in millisecondi prima che la notifica si dissolva automaticamente.</span>
              </div>
              <div class="setting-control suffix-input-box">
                <input
                  v-model.number="notificationDuration"
                  class="input elegant-input compact-number"
                  type="number"
                  min="0"
                  max="30000"
                  step="500"
                  @keyup.enter="saveNotificationDuration"
                />
                <button class="btn btn-secondary" @click="saveNotificationDuration">Salva</button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Filtro eventi di notifica</span>
                <span class="setting-desc">Scegli quali messaggi mostrare a schermo. I messaggi importanti verranno comunque registrati.</span>
              </div>
              <div class="setting-control">
                <select v-model="notificationLevel" class="input elegant-select" @change="saveNotificationLevel">
                  <option value="all">Tutte le notifiche (Consigliato)</option>
                  <option value="warning">Solo avvisi e messaggi di errore</option>
                  <option value="error">Solo messaggi di errore bloccanti</option>
                </select>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Testa le impostazioni</span>
                <span class="setting-desc">Invia una notifica di prova per verificare il posizionamento e la durata scelti.</span>
              </div>
              <div class="setting-control">
                <button class="btn btn-secondary btn-with-icon" @click="triggerTestNotification" type="button">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  Invia notifica di test
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 5: Column Mappings -->
        <div v-if="activeTab === 'mappings'" class="settings-card animate-fade-in">
          <div class="card-header">
            <h3 class="card-title">Mappatura Colonne Personalizzate</h3>
            <p class="card-subtitle">Configura i nomi degli header Excel attesi. Rende l'auto-rename e le evidenziazioni compatibili con i tuoi tracciati record personalizzati.</p>
          </div>

          <div class="settings-form-grid">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Header ID Prodotto</span>
                <span class="setting-desc">Il nome esatto della colonna usata come codice/identificativo prodotto.</span>
              </div>
              <div class="setting-control suffix-input-box">
                <input
                  v-model="idHeaderName"
                  class="input elegant-input"
                  placeholder="ID prodotto"
                  @keyup.enter="saveColumnMappings"
                />
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Header Nome Prodotto</span>
                <span class="setting-desc">Il nome esatto della colonna usata come descrizione/denominazione articolo.</span>
              </div>
              <div class="setting-control suffix-input-box">
                <input
                  v-model="nameHeaderName"
                  class="input elegant-input"
                  placeholder="Nome del prodotto"
                  @keyup.enter="saveColumnMappings"
                />
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Header Corriere</span>
                <span class="setting-desc">Il nome esatto della colonna usata per l'assegnazione del corriere spedizioni.</span>
              </div>
              <div class="setting-control suffix-input-box">
                <input
                  v-model="courierHeaderName"
                  class="input elegant-input"
                  placeholder="Nome corriere"
                  @keyup.enter="saveColumnMappings"
                />
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Header EAN (Protetto)</span>
                <span class="setting-desc">Il nome esatto della colonna contenente i codici a barre EAN (protetta contro modifiche export).</span>
              </div>
              <div class="setting-control suffix-input-box">
                <input
                  v-model="eanHeaderName"
                  class="input elegant-input"
                  placeholder="EAN"
                  @keyup.enter="saveColumnMappings"
                />
              </div>
            </div>

            <div class="setting-row preview-row" style="background: rgba(99, 102, 241, 0.03); border: 1px dashed var(--accent); border-radius: var(--radius-md); padding: 12px 16px; margin-top: 8px;">
              <div class="setting-info">
                <span class="setting-label" style="color: var(--accent);">💡 Come funziona la mappatura</span>
                <span class="setting-desc" style="color: var(--text-secondary); max-width: 480px; line-height: 1.5;">
                  Inserisci i nomi esatti delle intestazioni delle colonne del tuo file Excel. OrderEdit rileverà automaticamente gli indici di colonna per applicare evidenziazioni, autocomplete, controlli di sicurezza ed auto-rename su qualsiasi foglio di lavoro.
                </span>
              </div>
              <div class="setting-control" style="align-self: center;">
                <button class="btn btn-primary" @click="saveColumnMappings">Salva Mappatura</button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 6: Global Settings Backup -->
        <div v-if="activeTab === 'global-backup'" class="settings-card animate-fade-in">
          <div class="card-header">
            <h3 class="card-title">Salvataggio & Ripristino Globale</h3>
            <p class="card-subtitle">Gestisci l'esportazione e l'importazione dell'intera configurazione di OrderEdit, incluse le mappature colonne, i preset dei corrieri e le preferenze grafiche.</p>
          </div>

          <div class="settings-form-grid">
            <!-- Esporta Configurazione -->
            <div class="backup-section-card">
              <div class="section-card-info">
                <span class="section-card-title">Esporta Configurazione</span>
                <span class="section-card-desc">Scarica un file JSON sicuro contenente tutte le preferenze attuali, le mappature personalizzate e l'elenco dei corrieri da conservare o importare su un altro computer.</span>
              </div>
              <div class="section-card-action">
                <button class="btn btn-primary btn-with-icon" @click="handleExportConfig">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Esporta File JSON
                </button>
              </div>
            </div>

            <!-- Importa Configurazione -->
            <div class="backup-section-card" style="flex-direction: column; align-items: stretch; gap: 16px;">
              <div class="section-card-info" style="max-width: 100%;">
                <span class="section-card-title">Importa Configurazione</span>
                <span class="section-card-desc">Seleziona o trascina un file di backup JSON precedentemente esportato. Verrà applicato dopo la conferma dell'anteprima, sovrascrivendo le impostazioni locali e i preset dei corrieri sul server.</span>
              </div>
              
              <!-- Anteprima del backup caricato (conferma prima di applicare) -->
              <div v-if="pendingBackupData" class="pending-backup-card animate-fade-in">
                <div class="pending-header">
                  <span class="pending-title">Pronto per l'importazione</span>
                  <button class="btn btn-secondary btn-sm" @click="clearPendingBackup" type="button">Annulla</button>
                </div>
                <div class="pending-meta-grid">
                  <div class="pending-meta-item">
                    <span class="p-label">Nome File</span>
                    <span class="p-val">{{ pendingBackupFile.name }} ({{ formatBytes(pendingBackupFile.size) }})</span>
                  </div>
                  <div class="pending-meta-item">
                    <span class="p-label">Esportato il</span>
                    <span class="p-val">{{ formatDate(pendingBackupData.exportedAt) }}</span>
                  </div>
                  <div class="pending-meta-item">
                    <span class="p-label">Tema Rilevato</span>
                    <span class="p-val" style="text-transform: capitalize;">{{ pendingBackupData.theme === 'dark' ? 'Scuro' : 'Chiaro' }}</span>
                  </div>
                  <div class="pending-meta-item">
                    <span class="p-label">Preset Corrieri</span>
                    <span class="p-val">{{ pendingBackupData.courierPresets?.length || 0 }} elementi</span>
                  </div>
                </div>
                <button class="btn btn-success btn-apply-backup" @click="applyPendingBackup" type="button">
                  Conferma e Applica Configurazione
                </button>
              </div>

              <div 
                v-else
                class="drag-drop-zone"
                :class="{ active: isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleFileDrop"
                @click="$refs.backupFileInput.click()"
              >
                <input 
                  type="file" 
                  ref="backupFileInput" 
                  style="display: none" 
                  accept=".json" 
                  @change="handleFileSelect" 
                />
                <svg class="upload-cloud-icon" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span class="upload-label">Trascina qui il file JSON o <span class="browse-link">sfoglia i file</span></span>
                <span class="upload-sub">Supporta esclusivamente file di backup generati da OrderEdit (.json)</span>
              </div>
            </div>

            <!-- Ripristino di Fabbrica (Factory Reset) -->
            <div class="backup-section-card danger-card">
              <div class="section-card-info">
                <span class="section-card-title text-danger">Ripristino Dati di Fabbrica</span>
                <span class="section-card-desc text-danger-desc">Attenzione: Questa azione rimuoverà permanentemente tutte le mappature delle colonne, resetterà i nomi dei corrieri ai preset iniziali, pulirà la sessione e reimposterà il tema e le notifiche predefiniti. Non è possibile annullare questa operazione.</span>
              </div>
              <div class="section-card-action">
                <button class="btn btn-danger btn-with-icon" @click="handleFactoryReset">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Ripristina Stato Iniziale
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 7: AI Integration -->
        <div v-if="activeTab === 'ai'" class="ai-settings-tab-wrapper animate-fade-in">
          
          <!-- Card 0: Stato Integrazione -->
          <div class="settings-card">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Abilita Integrazione AI</span>
                <span class="setting-desc">Mostra o nascondi il Tasto Smart AI nella barra degli strumenti principale.</span>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input v-model="aiStore.enabled" type="checkbox" @change="toggleAiEnabled" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Card 1: Credenziali e Modello -->
          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">Credenziali & Connessione API</h3>
              <p class="card-subtitle">Configura il provider, le chiavi di autenticazione e il modello di riferimento per le chiamate esterne.</p>
            </div>

            <div class="settings-form-grid">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Provider API</span>
                  <span class="setting-desc">Seleziona il provider per la connessione al modello linguistico.</span>
                </div>
                <div class="setting-control">
                  <select v-model="aiStore.provider" class="input elegant-select" @change="handleProviderChange">
                    <option value="openrouter">OpenRouter (Consigliato)</option>
                    <option value="groq">Groq (Ultra-veloce)</option>
                    <option value="nvidia">Nvidia NIM</option>
                    <option value="custom">Endpoint Custom (compatibile OpenAI)</option>
                  </select>
                </div>
              </div>

              <div class="setting-row" v-if="aiStore.provider === 'custom'">
                <div class="setting-info">
                  <span class="setting-label">URL Endpoint Personalizzato</span>
                  <span class="setting-desc">Indirizzo base dell'API (es. http://localhost:11434/v1).</span>
                </div>
                <div class="setting-control suffix-input-box">
                  <input
                    v-model="aiStore.customUrl"
                    class="input elegant-input"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">API Key</span>
                  <span class="setting-desc">Inserisci la tua chiave API segreta (salvata in sicurezza).</span>
                </div>
                <div class="setting-control suffix-input-box api-key-control" style="position: relative; display: flex; gap: 8px;">
                  <input
                    v-model="aiStore.apiKey"
                    :type="showApiKey ? 'text' : 'password'"
                    class="input elegant-input"
                    placeholder="Inserisci la chiave API (es. sk-...)"
                    style="flex: 1; min-width: 220px;"
                  />
                  <button class="btn btn-secondary eye-btn" @click="showApiKey = !showApiKey" type="button" :title="showApiKey ? 'Nascondi chiave' : 'Mostra chiave'" style="padding: 0 10px; display: flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Modello di Riferimento</span>
                  <span class="setting-desc">Seleziona il modello LLM da utilizzare per l'analisi.</span>
                </div>
                <div class="setting-control" style="display: flex; flex-direction: column; gap: 6px;">
                  <select v-model="selectedModelOption" class="input elegant-select" @change="handleModelOptionChange">
                    <!-- Opzioni OpenRouter -->
                    <template v-if="aiStore.provider === 'openrouter'">
                      <option value="google/gemini-2.5-flash:free">Google Gemini 2.5 Flash (Free) - Consigliato</option>
                      <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                      <option value="meta-llama/llama-3.3-70b-instruct:free">Meta Llama 3.3 70B Instruct (Free) - Smart</option>
                      <option value="qwen/qwen-2.5-72b-instruct:free">Qwen 2.5 72B Instruct (Free) - Molto Smart</option>
                      <option value="meta-llama/llama-3.2-3b-instruct:free">Meta Llama 3.2 3B Instruct (Free) - Ultra-veloce</option>
                    </template>
                    
                    <!-- Opzioni Groq -->
                    <template v-else-if="aiStore.provider === 'groq'">
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile - Consigliato/Smart</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant - Ultra-veloce</option>
                      <option value="gemma2-9b-it">Gemma 2 9B</option>
                    </template>

                    <!-- Opzioni Nvidia -->
                    <template v-else-if="aiStore.provider === 'nvidia'">
                      <option value="nvidia/llama-3.1-nemotron-70b-instruct">Nvidia Llama 3.1 Nemotron 70B - Consigliato</option>
                    </template>

                    <option value="custom">Altro / Modello Personalizzato...</option>
                  </select>
                  <input
                    v-if="selectedModelOption === 'custom'"
                    v-model="customModelName"
                    class="input elegant-input"
                    placeholder="Inserisci l'ID del modello (es. openai/gpt-4o)..."
                    @input="handleCustomModelInput"
                    style="margin-top: 4px;"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Regole di Business per i Corrieri -->
          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">Regole di Business per i Corrieri</h3>
              <p class="card-subtitle">Descrivi in linguaggio naturale le regole che l'AI deve seguire per abbinare i corrieri agli ordini.</p>
            </div>

            <div class="settings-form-grid">
              <div class="setting-row" style="align-items: flex-start; flex-direction: column; gap: 12px;">
                <div class="setting-info" style="max-width: 100%;">
                  <span class="setting-label">Istruzioni di Assegnazione</span>
                  <span class="setting-desc">L'intelligenza artificiale leggerà queste regole riga per riga per decidere quale corriere assegnare ad ogni specifico ordine.</span>
                </div>
                <div class="setting-control" style="width: 100%;">
                  <textarea
                    v-model="aiStore.courierRules"
                    class="input elegant-textarea"
                    rows="6"
                    style="width: 100%; min-height: 120px; font-family: inherit; font-size: 13px; padding: 10px 14px; resize: vertical;"
                    placeholder="es. Assegna GLS a chi ordina accessori piccoli o risiede in Sardegna o Sicilia. Assegna BRT per climatizzatori o prodotti pesanti..."
                  ></textarea>
                </div>
              </div>

              <!-- Box informativo con esempi pratici -->
              <div class="example-rules-box">
                <div class="example-title">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Esempi di regole efficaci in linguaggio naturale:
                </div>
                <ul class="example-list">
                  <li><strong>Geografia:</strong> <code>"Se la destinazione è in Sicilia, Sardegna o isole minori, assegna GLS."</code></li>
                  <li><strong>Peso/Dimensione:</strong> <code>"Se il prodotto pesa più di 40 kg o contiene 'climatizzatore', assegna BRT."</code></li>
                  <li><strong>Valore articolo:</strong> <code>"Per prodotti di valore elevato come smartphone o notebook, assegna DHL Express."</code></li>
                  <li><strong>Scelta di Fallback:</strong> <code>"In tutti gli altri casi generici, assegna il corriere predefinito GLS."</code></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Card 3: Pannello Avanzato & System Prompt -->
          <div class="settings-card">
            <div class="card-header" @click="showAdvancedSettings = !showAdvancedSettings" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 class="card-title" style="display: flex; align-items: center; gap: 8px;">
                  <svg :style="{ transform: showAdvancedSettings ? 'rotate(90deg)' : 'rotate(0)' }" style="transition: transform 0.2s ease;" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  Pannello Avanzato & System Prompt
                </h3>
                <p class="card-subtitle">Regola la temperatura, il parallelismo e personalizza le istruzioni di sistema dell'AI.</p>
              </div>
              <span class="advanced-toggle-badge" :class="{ active: showAdvancedSettings }">
                {{ showAdvancedSettings ? 'Nascondi ✕' : 'Mostra ⚙️' }}
              </span>
            </div>

            <div v-show="showAdvancedSettings" class="settings-form-grid animate-fade-in" style="margin-top: 16px;">
              <!-- Temperatura -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    Temperatura (Determinismo)
                    <span :class="['badge-dinamico', temperatureBadge.class]">{{ temperatureBadge.label }}</span>
                  </span>
                  <span class="setting-desc">Valori bassi producono risposte costanti e precise (consigliato: 0.1).</span>
                </div>
                <div class="setting-control slider-control-wrapper">
                  <input
                    v-model.number="aiStore.temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    class="range-slider"
                  />
                  <code class="slider-value-preview">{{ aiStore.temperature.toFixed(2) }}</code>
                </div>
              </div>

              <!-- Max Tokens -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Max Tokens</span>
                  <span class="setting-desc">Limite massimo di token per singola risposta del modello.</span>
                </div>
                <div class="setting-control slider-control-wrapper">
                  <input
                    v-model.number="aiStore.maxTokens"
                    type="range"
                    min="100"
                    max="4000"
                    step="50"
                    class="range-slider"
                  />
                  <code class="slider-value-preview">{{ aiStore.maxTokens }}</code>
                </div>
              </div>

              <!-- Frequency Penalty -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Frequency Penalty</span>
                  <span class="setting-desc">Penalizza la ripetizione di parole identiche (da -2.0 a 2.0).</span>
                </div>
                <div class="setting-control slider-control-wrapper">
                  <input
                    v-model.number="aiStore.frequencyPenalty"
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    class="range-slider"
                  />
                  <code class="slider-value-preview">{{ aiStore.frequencyPenalty.toFixed(1) }}</code>
                </div>
              </div>

              <!-- Presence Penalty -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Presence Penalty</span>
                  <span class="setting-desc">Incoraggia il modello ad ampliare gli argomenti trattati (da -2.0 a 2.0).</span>
                </div>
                <div class="setting-control slider-control-wrapper">
                  <input
                    v-model.number="aiStore.presencePenalty"
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    class="range-slider"
                  />
                  <code class="slider-value-preview">{{ aiStore.presencePenalty.toFixed(1) }}</code>
                </div>
              </div>

              <!-- Concorrenza Richieste -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    Concorrenza Richieste (Parallelismo)
                    <span :class="['badge-dinamico', concurrencyBadge.class]">{{ concurrencyBadge.label }}</span>
                  </span>
                  <span class="setting-desc">Numero massimo di batch elaborati simultaneamente sul server.</span>
                </div>
                <div class="setting-control slider-control-wrapper">
                  <input
                    v-model.number="aiStore.concurrency"
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    class="range-slider"
                  />
                  <code class="slider-value-preview">{{ aiStore.concurrency }}</code>
                </div>
              </div>

              <hr class="settings-divider" />

              <!-- Preset System Prompt -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Preset System Prompt</span>
                  <span class="setting-desc">Seleziona un modello di prompt di partenza da personalizzare.</span>
                </div>
                <div class="setting-control">
                  <select v-model="selectedPromptPreset" class="input elegant-select" @change="applyPromptPreset">
                    <option value="custom">Personalizzato</option>
                    <option value="completo">Completo (Rinominazione, Corrieri, Anomalie)</option>
                    <option value="rename">Solo Rinominazione Prodotto</option>
                    <option value="courier">Solo Assegnazione Corrieri</option>
                  </select>
                </div>
              </div>

              <!-- Alert Box Sicurezza System Prompt -->
              <div class="warning-alert">
                <div class="alert-title">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Pericolo - Riservato a Utenti Esperti
                </div>
                <div class="alert-desc">
                  La modifica del System Prompt richiede di mantenere intatta la struttura dell'output JSON. Rimuovere o cambiare le chiavi attese (<code>index</code>, <code>suggestedName</code>, <code>suggestedCourier</code>, <code>courierReason</code>, <code>anomalies</code>) <strong>causerà il blocco completo dell'analizzatore AI</strong> all'interno dell'editor.
                </div>
              </div>

              <!-- System Prompt Textarea -->
              <div class="setting-row" style="align-items: flex-start; flex-direction: column; gap: 12px;">
                <div class="setting-info" style="max-width: 100%;">
                  <span class="setting-label">System Prompt</span>
                  <span class="setting-desc">Le istruzioni strutturate a basso livello inviate al LLM ad ogni chiamata.</span>
                </div>
                <div class="setting-control" style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
                  <textarea
                    v-model="aiStore.systemPrompt"
                    class="input elegant-textarea font-mono"
                    rows="8"
                    @input="selectedPromptPreset = 'custom'"
                    style="width: 100%; min-height: 160px; font-family: monospace; font-size: 11px; padding: 10px 14px; resize: vertical;"
                  ></textarea>
                  <button class="btn btn-secondary btn-sm" @click="resetSystemPromptToDefault" type="button" style="align-self: flex-start;">
                    Ripristina Prompt di Default
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Azioni della pagina -->
          <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; width: 100%;">
            <button class="btn btn-secondary btn-with-icon" @click="testAiConnection" :disabled="testingConnection" type="button">
              <span v-if="testingConnection" class="spinner" style="margin-right: 8px;"></span>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              {{ testingConnection ? 'Test in corso...' : 'Testa Connessione' }}
            </button>
            <button class="btn btn-primary btn-with-icon" @click="saveAiSettings" :disabled="aiStore.isConfigSaving" type="button">
              <span v-if="aiStore.isConfigSaving" class="spinner" style="margin-right: 8px;"></span>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Salva Configurazione AI
            </button>
          </div>

          <!-- Card 4: Cronologia Chiamate AI -->
          <div class="settings-card" style="margin-top: 24px;">
            <div class="ai-logs-section">
              <div class="logs-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                  Cronologia Chiamate AI (Ultime 10)
                </h4>
                <button class="btn btn-secondary btn-xs btn-with-icon" @click="refreshLogs" type="button">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  Aggiorna
                </button>
              </div>

              <div v-if="aiStore.logs.length === 0" class="empty-logs-state">
                Nessuna chiamata registrata in questa sessione.
              </div>

              <div v-else class="logs-list" style="display: flex; flex-direction: column; gap: 8px;">
                <div v-for="(log, idx) in aiStore.logs" :key="idx" class="log-item" style="border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-secondary); overflow: hidden; font-size: 12px;">
                  <div class="log-summary" @click="toggleLogExpand(idx)" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; cursor: pointer; user-select: none;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                      <span :class="['status-badge', log.error ? 'badge-error' : 'badge-success']" style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">
                        {{ log.error ? 'Error' : 'OK' }}
                      </span>
                      <strong style="color: var(--text-primary);">{{ log.model }}</strong>
                      <span style="color: var(--text-muted); font-size: 11px;">({{ log.provider }})</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; color: var(--text-muted); font-size: 11px;">
                      <span>{{ formatTime(log.timestamp) }}</span>
                      <span style="font-weight: 500; color: var(--accent);">{{ log.latency }} ms</span>
                      <svg :style="{ transform: expandedLogIndex === idx ? 'rotate(90deg)' : 'rotate(0)' }" style="transition: transform 0.2s ease;" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 6 15 12 9 18"></polyline>
                      </svg>
                    </div>
                  </div>

                  <div v-if="expandedLogIndex === idx" class="log-details animate-fade-in" style="padding: 14px; border-top: 1px solid var(--border); background: var(--bg-card); display: flex; flex-direction: column; gap: 10px;">
                    <div v-if="log.error" style="color: var(--danger); background: var(--danger-light); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid rgba(239,68,68,0.2); font-weight: 500;">
                      <strong>Errore API:</strong> {{ log.error }}
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      <span style="font-weight: 600; color: var(--text-secondary);">Messaggi Inviati (Input):</span>
                      <pre style="margin: 0; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow-x: auto; font-family: monospace; font-size: 11px; max-height: 150px; white-space: pre-wrap; word-break: break-all;">{{ JSON.stringify(log.messages, null, 2) }}</pre>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      <span style="font-weight: 600; color: var(--text-secondary);">Risposta Ricevuta (Output):</span>
                      <pre style="margin: 0; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow-x: auto; font-family: monospace; font-size: 11px; max-height: 150px; white-space: pre-wrap; word-break: break-all;">{{ log.response || 'nessuna risposta o errore' }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api/index.js'
import { useCourierPresetStore } from '../stores/courierPresets.js'
import { useSpreadsheetStore } from '../stores/spreadsheet.js'
import { useNotificationStore } from '../stores/notification.js'
import { useAiStore } from '../stores/ai.js'

const notificationStore = useNotificationStore()
const courierPresetStore = useCourierPresetStore()
const spreadsheetStore = useSpreadsheetStore()
const aiStore = useAiStore()

const activeTab = ref('general')

const temperatureBadge = computed(() => {
  const t = aiStore.temperature ?? 0.1
  if (t <= 0.25) {
    return { label: 'Preciso 🎯', class: 'badge-info' }
  } else if (t <= 0.70) {
    return { label: 'Equilibrato ⚖️', class: 'badge-success' }
  } else {
    return { label: 'Creativo 🎨', class: 'badge-warning' }
  }
})

const concurrencyBadge = computed(() => {
  const c = aiStore.concurrency ?? 3
  if (c <= 1) {
    return { label: 'Sicuro 🐢', class: 'badge-info' }
  } else if (c <= 3) {
    return { label: 'Ottimale 🚀', class: 'badge-success' }
  } else {
    return { label: 'Aggressivo ⚡', class: 'badge-danger' }
  }
})

const testingConnection = ref(false)
const showApiKey = ref(false)
const showAdvancedSettings = ref(false)
const selectedModelOption = ref('google/gemini-2.5-flash')
const customModelName = ref('')
const selectedPromptPreset = ref('custom')
const expandedLogIndex = ref(-1)

const RENAME_ONLY_PROMPT = `Sei un assistente AI integrato in OrderEdit, un'applicazione gestionale per l'editing di ordini Excel.
Il tuo compito è analizzare un elenco di ordini in formato JSON e per ciascuno:
1. Se "isTemplateMissing" è true, genera un "suggestedName" pulito ed elegante per il catalogo partendo da "originalName".
   - Identifica la marca e il modello nel testo del prodotto originale e racchiudili con il tag HTML <b>...</b> (es. "<b>Daikin ATXC35D</b> Climatizzatore monosplit 12000Btu").
   - Mantieni un tono professionale e pulito, rimuovi le abbreviazioni disordinate o caratteri spuri.
   - Se "isTemplateMissing" è false, mantieni lo stesso esatto valore indicato in "resolvedName".
2. NON toccare il corriere né rilevare anomalie. Restituisci "" in "suggestedCourier", "" in "courierReason" e un array vuoto [] in "anomalies".

Rispondi ESCLUSIVAMENTE con un array JSON valido, rispettando questa struttura esatta, senza spiegazioni testuali fuori dal JSON:
[
  {
    "index": number,
    "suggestedName": "string",
    "suggestedCourier": "",
    "courierReason": "",
    "anomalies": []
  },
  ...
]`

const COURIER_ONLY_PROMPT = `Sei un assistente AI integrato in OrderEdit, un'applicazione gestionale per l'editing di ordini Excel.
Il tuo compito è analizzare un elenco di ordini in formato JSON e per ciascuno:
1. Assegna il corriere migliore ("suggestedCourier") scegliendolo RIGOROSAMENTE tra i corrieri ammessi.
   - Basati su queste regole fornite dall'utente:
     <RULES>
     [COURIER_RULES]
     </RULES>
   - Se nessuna regola si applica chiaramente, seleziona il corriere più opportuno.
   - Fornisci una breve spiegazione tecnica in italiano per la tua scelta in "courierReason".
2. Mantieni lo stesso nome originale in "suggestedName" (cioè "resolvedName" se presente, altrimenti "originalName"). Non rilevare anomalie (lascia "anomalies" vuoto []).

Rispondi ESCLUSIVAMENTE con un array JSON valido, rispettando questa struttura esatta, senza spiegazioni testuali fuori dal JSON:
[
  {
    "index": number,
    "suggestedName": "string",
    "suggestedCourier": "string",
    "courierReason": "string",
    "anomalies": []
  },
  ...
]`

const DEFAULT_SYSTEM_PROMPT = `Sei un assistente AI integrato in OrderEdit, un'applicazione gestionale per l'editing di ordini Excel.
Il tuo compito è analizzare un elenco di ordini in formato JSON e per ciascuno:
1. Se "isTemplateMissing" è true, genera un "suggestedName" pulito ed elegante per il catalogo partendo da "originalName".
   - Identifica la marca e il modello nel testo del prodotto originale e racchiudili con il tag HTML <b>...</b> (es. "<b>Daikin ATXC35D</b> Climatizzatore monosplit 12000Btu").
   - Mantieni un tono professionale e pulito, rimuovi le abbreviazioni disordinate o caratteri spuri.
   - Se "isTemplateMissing" è false, mantieni lo stesso esatto valore indicato in "resolvedName".
2. Assegna il corriere migliore ("suggestedCourier") scegliendolo RIGOROSAMENTE tra i corrieri ammessi.
   - Basati su queste regole fornite dall'utente:
     <RULES>
     [COURIER_RULES]
     </RULES>
   - Se nessuna regola si applica chiaramente, seleziona il corriere più opportuno.
   - Fornisci una breve spiegazione tecnica in italiano per la tua scelta in "courierReason".
3. Rileva eventuali anomalie o avvertimenti nel campo "anomalies" (un array di stringhe):
   - Ad esempio: se il CAP ha un formato non valido, se mancano dati critici come la città di destinazione, o se ci sono indicazioni strane. Se non ci sono anomalie, lascia l'array vuoto.

Rispondi ESCLUSIVAMENTE con un array JSON valido, rispettando questa struttura esatta, senza spiegazioni testuali fuori dal JSON:
[
  {
    "index": number,
    "suggestedName": "string",
    "suggestedCourier": "string",
    "courierReason": "string",
    "anomalies": ["string", ...]
  },
  ...
]`

function resetSystemPromptToDefault() {
  aiStore.systemPrompt = DEFAULT_SYSTEM_PROMPT
  selectedPromptPreset.value = 'completo'
  notificationStore.show({ type: 'info', message: 'System Prompt ripristinato al default. Salva per confermare.' })
}

function applyPromptPreset() {
  if (selectedPromptPreset.value === 'completo') {
    aiStore.systemPrompt = DEFAULT_SYSTEM_PROMPT
  } else if (selectedPromptPreset.value === 'rename') {
    aiStore.systemPrompt = RENAME_ONLY_PROMPT
  } else if (selectedPromptPreset.value === 'courier') {
    aiStore.systemPrompt = COURIER_ONLY_PROMPT
  }
}

function toggleLogExpand(index) {
  if (expandedLogIndex.value === index) {
    expandedLogIndex.value = -1
  } else {
    expandedLogIndex.value = index
  }
}

function formatTime(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return isoString
  }
}

async function refreshLogs() {
  await aiStore.fetchLogs()
}

function handleModelOptionChange() {
  if (selectedModelOption.value !== 'custom') {
    aiStore.model = selectedModelOption.value
  } else {
    aiStore.model = customModelName.value || (aiStore.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'google/gemini-2.5-flash:free')
  }
}

function handleProviderChange() {
  if (aiStore.provider === 'openrouter') {
    aiStore.model = 'google/gemini-2.5-flash:free'
    selectedModelOption.value = 'google/gemini-2.5-flash:free'
  } else if (aiStore.provider === 'groq') {
    aiStore.model = 'llama-3.3-70b-versatile'
    selectedModelOption.value = 'llama-3.3-70b-versatile'
  } else if (aiStore.provider === 'nvidia') {
    aiStore.model = 'nvidia/llama-3.1-nemotron-70b-instruct'
    selectedModelOption.value = 'nvidia/llama-3.1-nemotron-70b-instruct'
  } else {
    aiStore.model = ''
    selectedModelOption.value = 'custom'
    customModelName.value = ''
  }
}

function handleCustomModelInput() {
  aiStore.model = customModelName.value
}

async function saveAiSettings() {
  try {
    await aiStore.save()
    notificationStore.show({ type: 'success', message: 'Configurazione AI salvata con successo sul server!' })
  } catch (err) {
    notificationStore.show({ type: 'error', message: `Salvataggio fallito: ${err.message}` })
  }
}

async function toggleAiEnabled() {
  try {
    await aiStore.save()
    notificationStore.show({
      type: 'success',
      message: aiStore.enabled ? 'Integrazione AI abilitata con successo!' : 'Integrazione AI disattivata!'
    })
  } catch (err) {
    notificationStore.show({ type: 'error', message: `Errore salvataggio stato AI: ${err.message}` })
  }
}

async function testAiConnection() {
  testingConnection.value = true
  try {
    const res = await api.post('/api/ai/test', {
      provider: aiStore.provider,
      apiKey: aiStore.apiKey,
      model: aiStore.model,
      customUrl: aiStore.customUrl,
    })
    if (res.data && res.data.status === 'ok') {
      notificationStore.show({ type: 'success', message: 'Connessione AI riuscita con successo!' })
    } else {
      notificationStore.show({ type: 'error', message: `Errore: ${res.data?.error || 'Risposta inattesa'}` })
    }
  } catch (err) {
    notificationStore.show({ type: 'error', message: `Connessione fallita: ${err.response?.data?.error || err.message}` })
  } finally {
    testingConnection.value = false
  }
}

const newCourierPreset = ref('')
const editingCourierIndex = ref(-1)
const editingCourierName = ref('')
const exportMode = ref('same')
const exportSuffix = ref('_modified')
const showExportSummary = ref(true)
const askExportSaveLocation = ref(true)
const themeMode = ref('light')
const freezePanesEnabled = ref(true)
const recoveryEnabled = ref(true)
const autoFitOnLoad = ref(true)
const highlightKeyColumns = ref(false)
const backupLoading = ref(false)
const backupStats = ref({ count: 0, totalBytes: 0 })
const backupEnabled = ref(true)
const backupLimit = ref(50)
const notificationPosition = ref('bottom-right')
const notificationDuration = ref(5000)
const notificationLevel = ref('all')
const idHeaderName = ref('ID prodotto')
const nameHeaderName = ref('Nome del prodotto')
const courierHeaderName = ref('Nome corriere')
const eanHeaderName = ref('EAN')

const isDragging = ref(false)
const backupFileInput = ref(null)
const pendingBackupData = ref(null)
const pendingBackupFile = ref(null)

onMounted(() => {
  courierPresetStore.load()
  spreadsheetStore.loadExportPrefs()
  spreadsheetStore.loadEditorPrefs()
  exportMode.value = spreadsheetStore.exportNamingMode
  exportSuffix.value = spreadsheetStore.exportSuffix
  showExportSummary.value = spreadsheetStore.showExportSummary
  askExportSaveLocation.value = spreadsheetStore.askExportSaveLocation
  freezePanesEnabled.value = spreadsheetStore.freezePanesEnabled
  recoveryEnabled.value = spreadsheetStore.recoveryEnabled
  autoFitOnLoad.value = spreadsheetStore.autoFitOnLoad
  highlightKeyColumns.value = spreadsheetStore.highlightKeyColumns
  backupEnabled.value = spreadsheetStore.backupEnabled
  backupLimit.value = spreadsheetStore.backupLimit
  notificationStore.loadPrefs()
  notificationPosition.value = notificationStore.position
  notificationDuration.value = notificationStore.duration
  notificationLevel.value = notificationStore.level
  
  idHeaderName.value = spreadsheetStore.idHeaderName
  nameHeaderName.value = spreadsheetStore.nameHeaderName
  courierHeaderName.value = spreadsheetStore.courierHeaderName
  eanHeaderName.value = spreadsheetStore.eanHeaderName

  try {
    const savedTheme = localStorage.getItem('orderedit:theme')
    themeMode.value = savedTheme === 'dark' ? 'dark' : 'light'
  } catch {
    themeMode.value = 'light'
  }
  aiStore.load().then(async () => {
    const predefined = [
      'google/gemini-2.5-flash:free',
      'google/gemini-2.5-flash',
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
      'nvidia/llama-3.1-nemotron-70b-instruct'
    ]
    if (predefined.includes(aiStore.model)) {
      selectedModelOption.value = aiStore.model
    } else {
      selectedModelOption.value = 'custom'
      customModelName.value = aiStore.model
    }

    // Match preset system prompt
    const cleanPrompt = (str) => (str || '').replace(/\r\n/g, '\n').trim()
    const currentPrompt = cleanPrompt(aiStore.systemPrompt)
    
    if (currentPrompt === cleanPrompt(DEFAULT_SYSTEM_PROMPT)) {
      selectedPromptPreset.value = 'completo'
    } else if (currentPrompt === cleanPrompt(RENAME_ONLY_PROMPT)) {
      selectedPromptPreset.value = 'rename'
    } else if (currentPrompt === cleanPrompt(COURIER_ONLY_PROMPT)) {
      selectedPromptPreset.value = 'courier'
    } else {
      selectedPromptPreset.value = 'custom'
    }

    await aiStore.fetchLogs()
  })
  loadBackupStats()
})

function saveColumnMappings() {
  spreadsheetStore.updateColumnMappings({
    idHeaderName: idHeaderName.value,
    nameHeaderName: nameHeaderName.value,
    courierHeaderName: courierHeaderName.value,
    eanHeaderName: eanHeaderName.value,
  })
  notificationStore.show({ type: 'success', message: 'Mappatura delle colonne salvata con successo!' })
}

function handleExportConfig() {
  try {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      theme: themeMode.value,
      editor: spreadsheetStore.exportSettingsData(),
      notifications: {
        duration: notificationStore.duration,
        position: notificationStore.position,
        level: notificationStore.level
      },
      courierPresets: courierPresetStore.presets
    }
    
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    a.href = url
    a.download = `orderedit_backup_${stamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    notificationStore.show({ type: 'success', message: 'Configurazione esportata correttamente!' })
  } catch (err) {
    notificationStore.show({ type: 'error', message: `Errore durante l'esportazione: ${err.message}` })
  }
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return
  processBackupFile(file)
}

function handleFileDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  processBackupFile(file)
}

function clearPendingBackup() {
  pendingBackupData.value = null
  pendingBackupFile.value = null
  if (backupFileInput.value) backupFileInput.value.value = ''
}

function processBackupFile(file) {
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    notificationStore.show({ type: 'warning', message: 'Formato file non valido. Carica solo file .json.' })
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target.result)
      if (!backup || typeof backup !== 'object') {
        notificationStore.show({ type: 'warning', message: 'Il file di backup caricato non è valido.' })
        return
      }
      pendingBackupData.value = backup
      pendingBackupFile.value = {
        name: file.name,
        size: file.size
      }
    } catch (err) {
      notificationStore.show({ type: 'error', message: `Errore durante il parsing del backup: ${err.message}` })
    }
  }
  reader.readAsText(file)
}

async function applyPendingBackup() {
  if (!pendingBackupData.value) return
  const backup = pendingBackupData.value
  try {
    let importedSomething = false
    
    // 1. Theme
    if (backup.theme === 'light' || backup.theme === 'dark') {
      themeMode.value = backup.theme
      saveThemeMode()
      importedSomething = true
    }
    
    // 2. Editor & Spreadsheet settings
    if (backup.editor && typeof backup.editor === 'object') {
      spreadsheetStore.importSettingsData(backup.editor)
      
      // Update local ref values to reflect instantly
      exportMode.value = spreadsheetStore.exportNamingMode
      exportSuffix.value = spreadsheetStore.exportSuffix
      showExportSummary.value = spreadsheetStore.showExportSummary
      askExportSaveLocation.value = spreadsheetStore.askExportSaveLocation
      freezePanesEnabled.value = spreadsheetStore.freezePanesEnabled
      recoveryEnabled.value = spreadsheetStore.recoveryEnabled
      autoFitOnLoad.value = spreadsheetStore.autoFitOnLoad
      highlightKeyColumns.value = spreadsheetStore.highlightKeyColumns
      backupEnabled.value = spreadsheetStore.backupEnabled
      backupLimit.value = spreadsheetStore.backupLimit
      
      idHeaderName.value = spreadsheetStore.idHeaderName
      nameHeaderName.value = spreadsheetStore.nameHeaderName
      courierHeaderName.value = spreadsheetStore.courierHeaderName
      eanHeaderName.value = spreadsheetStore.eanHeaderName
      importedSomething = true
    }
    
    // 3. Notifications settings
    if (backup.notifications && typeof backup.notifications === 'object') {
      notificationStore.importPrefsData(backup.notifications)
      notificationPosition.value = notificationStore.position
      notificationDuration.value = notificationStore.duration
      notificationLevel.value = notificationStore.level
      importedSomething = true
    }
    
    // 4. Courier Presets
    if (Array.isArray(backup.courierPresets)) {
      await courierPresetStore.importPresets(backup.courierPresets)
      importedSomething = true
    }
    
    if (importedSomething) {
      notificationStore.show({ type: 'success', message: 'Backup importato e applicato correttamente!' })
    } else {
      notificationStore.show({ type: 'warning', message: 'Nessun dato di configurazione valido trovato nel file.' })
    }
    clearPendingBackup()
  } catch (err) {
    notificationStore.show({ type: 'error', message: `Errore durante il ripristino: ${err.message}` })
  }
}

function formatDate(isoString) {
  if (!isoString) return '-'
  try {
    const d = new Date(isoString)
    if (Number.isNaN(d.getTime())) return isoString
    return d.toLocaleString('it-IT')
  } catch {
    return isoString
  }
}

function triggerTestNotification() {
  notificationStore.show({
    type: 'success',
    message: 'Test notifica riuscito! OrderEdit è configurato correttamente.'
  })
}

async function handleFactoryReset() {
  const confirm1 = window.confirm(
    'ATTENZIONE: Questa azione ripristinerà TUTTE le impostazioni dello spreadsheet, dei corrieri e delle notifiche ai valori di fabbrica.\n\nVuoi davvero procedere?'
  )
  if (!confirm1) return
  
  const confirm2 = window.confirm(
    'SEI SICURO? Tutti i preset personalizzati dei corrieri saranno cancellati dal server e le mappature delle colonne verranno reimpostate.\n\nPremere OK per confermare definitivamente il ripristino di fabbrica.'
  )
  if (!confirm2) return
  
  try {
    // 1. Reset theme to light
    themeMode.value = 'light'
    try {
      localStorage.setItem('orderedit:theme', 'light')
    } catch {}
    document.documentElement.setAttribute('data-theme', 'light')
    
    // 2. Reset spreadsheet and editor
    spreadsheetStore.resetToDefaults()
    exportMode.value = spreadsheetStore.exportNamingMode
    exportSuffix.value = spreadsheetStore.exportSuffix
    showExportSummary.value = spreadsheetStore.showExportSummary
    askExportSaveLocation.value = spreadsheetStore.askExportSaveLocation
    freezePanesEnabled.value = spreadsheetStore.freezePanesEnabled
    recoveryEnabled.value = spreadsheetStore.recoveryEnabled
    autoFitOnLoad.value = spreadsheetStore.autoFitOnLoad
    highlightKeyColumns.value = spreadsheetStore.highlightKeyColumns
    backupEnabled.value = spreadsheetStore.backupEnabled
    backupLimit.value = spreadsheetStore.backupLimit
    idHeaderName.value = spreadsheetStore.idHeaderName
    nameHeaderName.value = spreadsheetStore.nameHeaderName
    courierHeaderName.value = spreadsheetStore.courierHeaderName
    eanHeaderName.value = spreadsheetStore.eanHeaderName
    
    // 3. Reset notifications
    notificationStore.resetToDefaults()
    notificationPosition.value = notificationStore.position
    notificationDuration.value = notificationStore.duration
    notificationLevel.value = notificationStore.level
    
    // 4. Reset courier presets
    await courierPresetStore.resetToDefaults()
    
    notificationStore.show({ type: 'success', message: 'Ripristino di fabbrica completato con successo!' })
  } catch (err) {
    notificationStore.show({ type: 'error', message: `Errore durante il ripristino: ${err.message}` })
  }
}

function addCourierPreset() {
  const value = newCourierPreset.value.trim()
  if (!value) {
    notificationStore.show({ type: 'warning', message: 'Inserisci un nome preset valido.' })
    return
  }
  if (!courierPresetStore.add(value)) {
    notificationStore.show({ type: 'warning', message: 'Preset già presente o non valido.' })
    return
  }
  newCourierPreset.value = ''
  notificationStore.show({ type: 'success', message: 'Preset corriere aggiunto.' })
}

function startCourierEdit(index, value) {
  editingCourierIndex.value = index
  editingCourierName.value = value
}

function cancelCourierEdit() {
  editingCourierIndex.value = -1
  editingCourierName.value = ''
}

function saveCourierPreset() {
  if (editingCourierIndex.value < 0) return
  if (!courierPresetStore.update(editingCourierIndex.value, editingCourierName.value)) {
    notificationStore.show({ type: 'warning', message: 'Valore non valido o duplicato.' })
    return
  }
  notificationStore.show({ type: 'success', message: 'Preset corriere aggiornato.' })
  cancelCourierEdit()
}

function removeCourierPreset(index) {
  if (!window.confirm('Eliminare questo preset corriere?')) return
  if (!courierPresetStore.remove(index)) return
  notificationStore.show({ type: 'success', message: 'Preset corriere eliminato.' })
  if (editingCourierIndex.value === index) cancelCourierEdit()
}

function saveExportMode() {
  spreadsheetStore.setExportNamingMode(exportMode.value)
  notificationStore.show({ type: 'success', message: 'Modalità nome export aggiornata.' })
}

function saveExportSuffix() {
  spreadsheetStore.setExportSuffix(exportSuffix.value)
  exportSuffix.value = spreadsheetStore.exportSuffix
  notificationStore.show({ type: 'success', message: 'Suffisso export aggiornato.' })
}

function saveShowExportSummary() {
  spreadsheetStore.setShowExportSummary(showExportSummary.value)
  notificationStore.show({
    type: 'success',
    message: showExportSummary.value ? 'Riepilogo export attivato.' : 'Riepilogo export disattivato.',
  })
}

function saveAskExportSaveLocation() {
  spreadsheetStore.setAskExportSaveLocation(askExportSaveLocation.value)
  notificationStore.show({
    type: 'success',
    message: askExportSaveLocation.value
      ? 'Scelta cartella export attivata.'
      : 'Download automatico export attivato.',
  })
}

function saveThemeMode() {
  const next = themeMode.value === 'dark' ? 'dark' : 'light'
  try {
    localStorage.setItem('orderedit:theme', next)
  } catch {}
  document.documentElement.setAttribute('data-theme', next)
  notificationStore.show({ type: 'success', message: `Tema ${next === 'dark' ? 'scuro' : 'chiaro'} attivato.` })
}

function saveFreezePanes() {
  spreadsheetStore.setFreezePanesEnabled(freezePanesEnabled.value)
  notificationStore.show({
    type: 'success',
    message: freezePanesEnabled.value ? 'Blocco griglia attivato.' : 'Blocco griglia disattivato.',
  })
}

function saveRecoveryEnabled() {
  spreadsheetStore.setRecoveryEnabled(recoveryEnabled.value)
  notificationStore.show({
    type: 'success',
    message: recoveryEnabled.value
      ? 'Recupero automatico attivato.'
      : 'Recupero automatico disattivato e sessione salvata rimossa.',
  })
}

function saveAutoFitOnLoad() {
  spreadsheetStore.setAutoFitOnLoad(autoFitOnLoad.value)
  notificationStore.show({
    type: 'success',
    message: autoFitOnLoad.value
      ? 'Adattamento automatico colonne attivato.'
      : 'Adattamento automatico colonne disattivato.',
  })
}

function saveHighlightKeyColumns() {
  spreadsheetStore.setHighlightKeyColumns(highlightKeyColumns.value)
  notificationStore.show({
    type: 'success',
    message: highlightKeyColumns.value
      ? 'Evidenziazione colonne griglia attivata.'
      : 'Evidenziazione colonne griglia disattivata (griglia pulita).',
  })
}

function saveBackupEnabled() {
  spreadsheetStore.setBackupEnabled(backupEnabled.value)
  notificationStore.show({
    type: 'success',
    message: backupEnabled.value ? 'Backup export attivato.' : 'Backup export disattivato.',
  })
}

function saveBackupLimit() {
  spreadsheetStore.setBackupLimit(backupLimit.value)
  backupLimit.value = spreadsheetStore.backupLimit
  notificationStore.show({ type: 'success', message: `Verranno mantenuti gli ultimi ${backupLimit.value} backup.` })
}

function saveNotificationPosition() {
  notificationStore.setPosition(notificationPosition.value)
  notificationStore.show({ type: 'success', message: 'Posizione notifiche aggiornata.' })
}

function saveNotificationDuration() {
  notificationStore.setDuration(notificationDuration.value)
  notificationDuration.value = notificationStore.duration
  notificationStore.show({ type: 'success', message: 'Durata notifiche aggiornata.' })
}

function saveNotificationLevel() {
  notificationStore.setLevel(notificationLevel.value)
  notificationStore.show({ type: 'success', message: 'Filtro notifiche aggiornato.' })
}

function formatBytes(bytes) {
  const value = Number(bytes || 0)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

async function loadBackupStats() {
  backupLoading.value = true
  try {
    const { data } = await api.get('/xlsx/backups')
    backupStats.value = {
      count: Number(data?.count || 0),
      totalBytes: Number(data?.totalBytes || 0),
    }
  } finally {
    backupLoading.value = false
  }
}

async function deleteBackups() {
  if (!window.confirm('Eliminare tutti i backup degli export?')) return
  backupLoading.value = true
  try {
    const { data } = await api.delete('/xlsx/backups')
    backupStats.value = { count: 0, totalBytes: 0 }
    notificationStore.show({ type: 'success', message: `Backup eliminati: ${data?.deleted || 0}` })
  } finally {
    backupLoading.value = false
  }
}
</script>

<style scoped>
.settings-page {
  display: flex;
  height: 100%;
  background: var(--bg-primary);
  overflow: hidden;
  position: relative;
}

/* Background ambient glow effect */
.settings-page::before {
  content: '';
  position: absolute;
  top: -10%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(92, 141, 246, 0.08) 0%, rgba(92, 141, 246, 0) 70%);
  pointer-events: none;
  z-index: 0;
}

/* Sidebar Styling */
.settings-sidebar {
  width: 290px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 28px 24px;
  flex-shrink: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: relative;
}

.sidebar-header {
  margin-bottom: 32px;
}

.sidebar-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-tab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  user-select: none;
  outline: none;
  position: relative;
  overflow: hidden;
}

/* Inactive button hover style with smooth color changes and micro-translation */
.sidebar-tab-btn:not(.active):hover {
  background: rgba(92, 141, 246, 0.05);
  color: var(--text-hover);
  border-color: rgba(92, 141, 246, 0.1);
  transform: translateX(4px);
}

:root[data-theme='light'] .sidebar-tab-btn:not(.active):hover {
  background: rgba(55, 104, 214, 0.05);
  color: var(--text-hover);
  border-color: rgba(55, 104, 214, 0.1);
}

.sidebar-tab-btn:active {
  transform: scale(0.97) translateX(2px);
  transition-duration: 0.08s;
}

/* Active button style - glassy gradient */
.sidebar-tab-btn.active {
  background: linear-gradient(135deg, rgba(92, 141, 246, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
  color: var(--accent);
  border-color: rgba(92, 141, 246, 0.2);
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(92, 141, 246, 0.05);
}

:root[data-theme='light'] .sidebar-tab-btn.active {
  background: linear-gradient(135deg, rgba(55, 104, 214, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
  border-color: rgba(55, 104, 214, 0.25);
  box-shadow: 0 4px 15px rgba(55, 104, 214, 0.05);
}

/* Active button hover - richer gradient, increased border accentuation, more translation */
.sidebar-tab-btn.active:hover {
  background: linear-gradient(135deg, rgba(92, 141, 246, 0.18) 0%, rgba(139, 92, 246, 0.12) 100%);
  border-color: rgba(92, 141, 246, 0.35);
  box-shadow: 0 6px 20px rgba(92, 141, 246, 0.1);
  transform: translateX(6px);
}

:root[data-theme='light'] .sidebar-tab-btn.active:hover {
  background: linear-gradient(135deg, rgba(55, 104, 214, 0.18) 0%, rgba(139, 92, 246, 0.12) 100%);
  border-color: rgba(55, 104, 214, 0.35);
  box-shadow: 0 6px 20px rgba(55, 104, 214, 0.1);
}

/* Active indicator vertical expansion micro-interaction */
.sidebar-tab-btn.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 4px;
  background: linear-gradient(to bottom, var(--accent), #8b5cf6);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 8px var(--accent);
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sidebar-tab-btn.active:hover::before {
  top: 6px;
  bottom: 6px;
  box-shadow: 0 0 12px var(--accent);
}

.tab-icon {
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), color 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  color: var(--text-muted);
}

.sidebar-tab-btn.active .tab-icon {
  color: var(--accent);
  transform: scale(1.1);
}

.sidebar-tab-btn.active:hover .tab-icon {
  transform: scale(1.18);
}

.sidebar-tab-btn:not(.active):hover .tab-icon {
  transform: scale(1.15);
  color: var(--text-primary);
}

/* Content Area */
.settings-content {
  flex-grow: 1;
  padding: 40px 48px;
  overflow-y: auto;
  background: var(--bg-primary);
  z-index: 5;
}

.settings-card-wrapper {
  max-width: 860px;
  margin: 0 auto;
}

/* Glassmorphism Card Style */
.settings-card {
  background: rgba(27, 32, 48, 0.45);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25), 
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

:root[data-theme='light'] .settings-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.card-header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 20px;
  position: relative;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.card-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Forms Grid */
.settings-form-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
}

:root[data-theme='light'] .setting-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.02);
}

.setting-row:last-of-type {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-grow: 1;
  max-width: 520px;
}

.setting-label {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.5;
}

.setting-control {
  flex-shrink: 0;
}

/* Custom Styled Select */
.elegant-select {
  padding: 9px 14px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 13px;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.elegant-select:hover {
  border-color: rgba(92, 141, 246, 0.4);
}

.elegant-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(92, 141, 246, 0.15);
}

/* Toggle Switch Styling */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 26px;
}

:root[data-theme='light'] .slider {
  background-color: rgba(0, 0, 0, 0.03);
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.25, 1.25, 0.5, 1);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.switch:hover .slider:before {
  transform: scale(1.08);
}

input:checked + .slider, :root[data-theme='light'] input:checked + .slider {
  background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
  border-color: transparent;
  box-shadow: 0 0 12px rgba(92, 141, 246, 0.25);
}

input:checked + .slider:before {
  transform: translateX(22px);
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(92, 141, 246, 0.2);
}

.switch:hover input:checked + .slider:before {
  transform: translateX(22px) scale(1.08);
}

/* Theme Visual Cards Selection */
.theme-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.theme-card-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  cursor: pointer;
  width: 140px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  outline: none;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.theme-card-btn:hover {
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.03);
}

:root[data-theme='light'] .theme-card-btn:hover {
  border-color: rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.01);
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.05);
}

.theme-card-btn.active {
  border-color: var(--accent);
  background: rgba(92, 141, 246, 0.04);
  box-shadow: 0 0 16px rgba(92, 141, 246, 0.15);
}

.theme-preview-box {
  width: 100px;
  height: 60px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.light-preview {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.dark-preview {
  background: #1e293b;
  border-color: #334155;
}

.preview-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}

.dark-preview .preview-dot {
  background: #38bdf8;
}

.preview-line {
  height: 5px;
  border-radius: 2px;
  width: 100%;
}

.light-preview .preview-line {
  background: #e2e8f0;
}

.dark-preview .preview-line {
  background: #334155;
}

.preview-line.short {
  width: 60%;
}

.theme-label-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Couriers Manager Styling */
.couriers-manager {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.add-preset-box {
  display: flex;
  gap: 12px;
  align-items: center;
}

.elegant-input {
  flex-grow: 1;
  padding: 11px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

:root[data-theme='light'] .elegant-input {
  background: #ffffff;
  box-shadow: inset 0 1px 2px rgba(17, 24, 39, 0.02);
}

.elegant-input:hover {
  border-color: rgba(92, 141, 246, 0.4);
}

.elegant-input:focus {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 0 0 3px rgba(92, 141, 246, 0.15);
  outline: none;
}

:root[data-theme='light'] .elegant-input:focus {
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(55, 104, 214, 0.15);
}

.elegant-textarea {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

:root[data-theme='light'] .elegant-textarea {
  background: #ffffff;
}

.elegant-textarea:hover {
  border-color: rgba(92, 141, 246, 0.4);
}

.elegant-textarea:focus {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 0 0 3px rgba(92, 141, 246, 0.15);
  outline: none;
}

:root[data-theme='light'] .elegant-textarea:focus {
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(55, 104, 214, 0.15);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-md);
}

/* Courier Chips Grid Styling */
.courier-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.015);
  backdrop-filter: blur(4px);
  min-height: 120px;
}

:root[data-theme='light'] .courier-chips-grid {
  border-color: rgba(0, 0, 0, 0.05);
  background: rgba(0, 0, 0, 0.01);
}

.courier-chip {
  background: rgba(27, 32, 48, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:root[data-theme='light'] .courier-chip {
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.courier-chip:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(92, 141, 246, 0.15);
  background: rgba(255, 255, 255, 0.03);
}

:root[data-theme='light'] .courier-chip:hover {
  background: #ffffff;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.06);
}

.courier-chip.editing, :root[data-theme='light'] .courier-chip.editing {
  border-color: var(--accent);
  background: var(--bg-secondary);
}

.chip-display-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chip-name {
  cursor: pointer;
  color: var(--text-primary);
}

.chip-icon-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}

.chip-icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.chip-icon-btn.delete:hover {
  background: var(--danger-light);
  color: var(--danger);
}

.chip-edit-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chip-edit-input {
  border: 1px solid var(--accent);
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 4px 8px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  width: 130px;
  outline: none;
}

.btn-chip-action {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.btn-chip-action.check {
  color: var(--success);
  border-color: var(--success);
}

.btn-chip-action.check:hover {
  background: var(--success-light);
}

.btn-chip-action.cancel {
  color: var(--danger);
  border-color: var(--danger);
}

.btn-chip-action.cancel:hover {
  background: var(--danger-light);
}

.empty-presets-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: var(--text-muted);
  width: 100%;
}

.empty-icon {
  color: var(--border);
  opacity: 0.7;
}

/* Suffix & Save Controls */
.suffix-input-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compact-number {
  max-width: 110px;
  text-align: center;
}

.preview-row {
  background: rgba(255, 255, 255, 0.02);
  margin: 8px 0;
  padding: 14px 20px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--border);
}

:root[data-theme='light'] .preview-row {
  background: rgba(0, 0, 0, 0.015);
}

.preview-tag {
  color: var(--accent);
}

.preview-tag code {
  font-family: monospace;
  font-size: 13px;
  background: var(--bg-primary);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.settings-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 12px 0;
}

/* Backup Database Section */
.backup-database-card {
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.db-stats-box {
  display: flex;
  gap: 40px;
}

.db-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.db-stat-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.db-stat-value {
  font-size: 24px;
  font-weight: 750;
  color: var(--text-primary);
}

.db-actions {
  display: flex;
  gap: 12px;
}

.btn-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Transitions */
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Backup Section Cards */
.backup-section-card {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.backup-section-card:hover {
  border-color: rgba(92, 141, 246, 0.3);
  box-shadow: 0 4px 15px rgba(92, 141, 246, 0.05);
  transform: translateY(-2px);
}

.section-card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-grow: 1;
  max-width: 520px;
}

.section-card-title {
  font-size: 15.5px;
  font-weight: 650;
  color: var(--text-primary);
}

.section-card-desc {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.5;
}

.section-card-action {
  flex-shrink: 0;
}

/* Drag & Drop Area */
.drag-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: 36px 24px;
  background: rgba(92, 141, 246, 0.01);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-align: center;
  margin-top: 8px;
  user-select: none;
}

.drag-drop-zone:hover {
  border-color: var(--accent);
  background: rgba(92, 141, 246, 0.04);
  box-shadow: 0 0 15px rgba(92, 141, 246, 0.05);
}

.drag-drop-zone.active {
  border-color: var(--accent);
  background: rgba(92, 141, 246, 0.08);
  transform: scale(0.98);
}

.upload-cloud-icon {
  color: var(--text-muted);
  margin-bottom: 12px;
  transition: transform 0.3s ease, color 0.3s ease;
}

.drag-drop-zone:hover .upload-cloud-icon {
  transform: translateY(-4px) scale(1.1);
  color: var(--accent);
}

.upload-label {
  font-size: 13.5px;
  color: var(--text-primary);
  font-weight: 550;
  margin-bottom: 4px;
}

.browse-link {
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
}

.upload-sub {
  font-size: 11.5px;
  color: var(--text-muted);
}

/* Danger Card */
.danger-card {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.01);
}

.danger-card:hover {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.08);
}

.text-danger {
  color: var(--danger) !important;
}

.text-danger-desc {
  color: var(--danger);
  opacity: 0.85;
}

/* Responsive Stack */
@media (max-width: 768px) {
  .settings-page {
    flex-direction: column;
    overflow-y: auto;
  }
  .settings-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding: 20px 16px;
  }
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
    gap: 8px;
  }
  .sidebar-tab-btn {
    white-space: nowrap;
    padding: 10px 14px;
  }
  .settings-content {
    padding: 24px 16px;
  }
  .settings-card {
    padding: 24px;
  }
}

/* Backup Database Progress Bar */
.db-progress-container {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.db-progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.progress-text {
  color: var(--text-secondary);
}

.progress-percentage {
  font-weight: 600;
  color: var(--accent);
}

.progress-bar-bg {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent) 0%, #8b5cf6 100%);
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.progress-bar-fill.warning {
  background: linear-gradient(90deg, #f97316 0%, #ef4444 100%);
}

/* Pending Backup Card preview */
.pending-backup-card {
  background: rgba(255, 255, 255, 0.015);
  border: 2px solid var(--accent);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  text-align: left;
}

.pending-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}

.pending-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
}

.pending-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pending-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.p-label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.p-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-apply-backup {
  width: 100%;
  padding: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* AI Logs Viewer */
.status-badge.badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-badge.badge-error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 11px;
}

.empty-logs-state {
  text-align: center;
  padding: 28px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 12.5px;
}

/* AI Restructuring Styles */
.ai-settings-tab-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.example-rules-box {
  background: rgba(15, 17, 23, 0.4);
  border: 1px solid rgba(92, 141, 246, 0.2);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-top: 8px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

:root[data-theme='light'] .example-rules-box {
  background: rgba(0, 0, 0, 0.015);
  border-color: rgba(55, 104, 214, 0.15);
}

.example-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.example-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-secondary);
}

.example-list li code {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

:root[data-theme='light'] .example-list li code {
  background: rgba(255, 255, 255, 0.9);
}

.advanced-toggle-badge {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-weight: 600;
  transition: all 0.25s ease;
}

.advanced-toggle-badge.active {
  background: var(--accent-light);
  color: var(--accent);
  border-color: rgba(92, 141, 246, 0.2);
}

.badge-dinamico {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-dinamico.badge-info {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.badge-dinamico.badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.badge-dinamico.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.badge-dinamico.badge-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.warning-alert {
  background: rgba(245, 158, 11, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-left: 4px solid #f59e0b;
  border-radius: var(--radius-md);
  padding: 16px 20px;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.03);
}

.alert-title {
  font-size: 13.5px;
  font-weight: 650;
  color: #d97706;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.55;
}

.slider-control-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 260px;
}

/* Custom styled range slider */
.range-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: var(--border);
  outline: none;
  transition: background 0.3s ease;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: var(--accent-hover);
}

.slider-value-preview {
  font-size: 13.5px;
  font-weight: 600;
  width: 38px;
  text-align: right;
  font-family: monospace;
  color: var(--text-primary);
}
</style>

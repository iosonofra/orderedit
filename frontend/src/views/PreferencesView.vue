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
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Tema dell'interfaccia</span>
                <span class="setting-desc">Seleziona tra tema chiaro e tema scuro ad alto contrasto.</span>
              </div>
              <div class="setting-control">
                <select v-model="themeMode" class="input elegant-select" @change="saveThemeMode">
                  <option value="light">Tema Chiaro</option>
                  <option value="dark">Tema Scuro</option>
                </select>
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

            <div class="presets-list-container">
              <table class="data-table elegant-table">
                <thead>
                  <tr>
                    <th>Nome preset</th>
                    <th style="width: 180px; text-align: right">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(preset, idx) in courierPresetStore.presets" :key="`${preset}-${idx}`">
                    <td>
                      <div v-if="editingCourierIndex === idx" class="elegant-edit-row">
                        <input
                          v-model="editingCourierName"
                          class="input elegant-input compact-input"
                          @keyup.enter="saveCourierPreset"
                          @keyup.escape="cancelCourierEdit"
                        />
                      </div>
                      <span v-else class="preset-name-tag">
                        <span class="tag-bullet"></span>
                        {{ preset }}
                      </span>
                    </td>
                    <td style="text-align: right">
                      <div class="elegant-action-btns" v-if="editingCourierIndex === idx">
                        <button class="btn btn-success compact-btn" @click="saveCourierPreset">Salva</button>
                        <button class="btn btn-secondary compact-btn" @click="cancelCourierEdit">Annulla</button>
                      </div>
                      <div class="elegant-action-btns" v-else>
                        <button class="btn btn-icon-only" @click="startCourierEdit(idx, preset)" title="Modifica">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button class="btn btn-icon-only danger" @click="removeCourierPreset(idx)" title="Elimina">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="courierPresetStore.presets.length === 0">
                    <td colspan="2" class="empty-state-row">
                      <div class="empty-presets-state">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        </svg>
                        <p>Nessun preset corriere configurato sul server.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                <span class="section-card-desc">Seleziona o trascina un file di backup JSON precedentemente esportato. Verrà applicato immediatamente sovrascrivendo le impostazioni locali e i preset dei corrieri sul server.</span>
              </div>
              
              <div 
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

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/index.js'
import { useCourierPresetStore } from '../stores/courierPresets.js'
import { useSpreadsheetStore } from '../stores/spreadsheet.js'
import { useNotificationStore } from '../stores/notification.js'

const notificationStore = useNotificationStore()
const courierPresetStore = useCourierPresetStore()
const spreadsheetStore = useSpreadsheetStore()

const activeTab = ref('general')

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

function processBackupFile(file) {
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    notificationStore.show({ type: 'warning', message: 'Formato file non valido. Carica solo file .json.' })
    return
  }
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const backup = JSON.parse(e.target.result)
      if (!backup || typeof backup !== 'object') {
        notificationStore.show({ type: 'warning', message: 'Il file di backup caricato non è valido.' })
        return
      }
      
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
    } catch (err) {
      notificationStore.show({ type: 'error', message: `Errore durante il parsing del backup: ${err.message}` })
    }
  }
  reader.readAsText(file)
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
}

/* Sidebar Styling */
.settings-sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.sidebar-header {
  margin-bottom: 28px;
}

.sidebar-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.sidebar-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  outline: none;
}

.sidebar-tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-hover);
  transform: translateX(3px) translateY(-0.5px);
}

.sidebar-tab-btn:active {
  transform: scale(0.97) translateX(1px);
  transition-duration: 0.08s;
}

.sidebar-tab-btn.active {
  background: var(--accent-light);
  color: var(--accent);
  border-color: rgba(92, 141, 246, 0.18);
  font-weight: 600;
}

.tab-icon {
  flex-shrink: 0;
  transition: transform var(--transition);
}

.sidebar-tab-btn:hover .tab-icon {
  transform: scale(1.08);
}

/* Content Area */
.settings-content {
  flex-grow: 1;
  padding: 32px 40px;
  overflow-y: auto;
  background: var(--bg-primary);
}

.settings-card-wrapper {
  max-width: 820px;
  margin: 0 auto;
}

.settings-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 18px;
}

.card-title {
  font-size: 18px;
  font-weight: 650;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.card-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Forms Grid */
.settings-form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 8px 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-grow: 1;
  max-width: 520px;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.setting-control {
  flex-shrink: 0;
}

/* Custom Styled Select */
.elegant-select {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 13px;
  min-width: 180px;
  cursor: pointer;
  transition: all var(--transition);
}

.elegant-select:hover {
  border-color: var(--accent);
}

.elegant-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-light);
  outline: none;
}

/* Toggle Switch Styling */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
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
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  transition: .2s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-secondary);
  transition: .2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent);
  border-color: var(--accent);
}

input:checked + .slider:before {
  transform: translateX(20px);
  background-color: #ffffff;
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--accent);
}

/* Couriers Manager Styling */
.couriers-manager {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.add-preset-box {
  display: flex;
  gap: 12px;
  align-items: center;
}

.elegant-input {
  flex-grow: 1;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  transition: all var(--transition);
}

.elegant-input:hover {
  border-color: var(--accent);
}

.elegant-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-light);
  outline: none;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
}

.presets-list-container {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-secondary);
}

.elegant-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  font-size: 13px;
}

.elegant-table th {
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-weight: 650;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.elegant-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
  color: var(--text-primary);
}

.elegant-table tr:last-child td {
  border-bottom: none;
}

.preset-name-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.tag-bullet {
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
}

.elegant-edit-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.compact-input {
  width: 100%;
  padding: 6px 10px;
}

.elegant-action-btns {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.btn-icon-only {
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.btn-icon-only:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-1.5px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.btn-icon-only:active {
  transform: scale(0.92) translateY(0);
  transition-duration: 0.08s;
}

.btn-icon-only.danger:hover {
  background: var(--danger-light);
  color: var(--danger);
  transform: translateY(-1.5px);
  box-shadow: var(--shadow-danger-glow);
}

.empty-state-row {
  padding: 0 !important;
}

.empty-presets-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: var(--text-muted);
}

.empty-icon {
  color: var(--border);
}

/* Suffix & Save Controls */
.suffix-input-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-suffix-btn {
  padding: 8px 14px;
}

.compact-number {
  max-width: 100px;
  text-align: center;
}

.preview-row {
  background: var(--bg-secondary);
  margin: 4px 0;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--border);
}

.preview-tag {
  color: var(--accent);
}

.preview-tag code {
  font-family: monospace;
  font-size: 13px;
  background: var(--bg-primary);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.settings-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 10px 0;
}

/* Backup Database Section */
.backup-database-card {
  margin-top: 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.db-stats-box {
  display: flex;
  gap: 32px;
}

.db-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.db-stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.db-stat-value {
  font-size: 20px;
  font-weight: 700;
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
  animation: fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Backup Section Cards */
.backup-section-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  transition: all var(--transition);
}

.backup-section-card:hover {
  border-color: rgba(99, 102, 241, 0.25);
  box-shadow: var(--shadow-sm);
}

.section-card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-grow: 1;
  max-width: 520px;
}

.section-card-title {
  font-size: 15px;
  font-weight: 650;
  color: var(--text-primary);
}

.section-card-desc {
  font-size: 12px;
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
  padding: 32px 24px;
  background: rgba(99, 102, 241, 0.01);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  margin-top: 8px;
  user-select: none;
}

.drag-drop-zone:hover {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.04);
}

.drag-drop-zone.active {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.08);
  transform: scale(0.99);
}

.upload-cloud-icon {
  color: var(--text-muted);
  margin-bottom: 12px;
  transition: transform var(--transition), color var(--transition);
}

.drag-drop-zone:hover .upload-cloud-icon {
  transform: translateY(-2px) scale(1.05);
  color: var(--accent);
}

.upload-label {
  font-size: 13px;
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
  font-size: 11px;
  color: var(--text-muted);
}

/* Danger Card */
.danger-card {
  border-color: rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.01);
}

.danger-card:hover {
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.06);
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
    padding: 16px;
  }
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .sidebar-tab-btn {
    white-space: nowrap;
  }
  .settings-content {
    padding: 20px 16px;
  }
}
</style>

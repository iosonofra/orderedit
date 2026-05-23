# Guida ai File e Cartelle da Caricare su GitHub — OrderEdit

Questa guida fornisce un quadro chiaro e dettagliato di quali file e cartelle del progetto **OrderEdit** devono essere tracciati e caricati sul tuo repository GitHub, e quali invece devono essere rigorosamente esclusi (in quanto gestiti localmente o autogenerati).

Grazie ai file `.gitignore` preconfigurati nel progetto, Git escluderà automaticamente i file non necessari. Di seguito trovi l'elenco completo per tua verifica.

---

## 📁 Albero delle Risorse da Caricare

Ecco come si presenta la struttura del repository pulita che deve risiedere su GitHub:

```text
orderedit/
├── .gitignore                      # Regole di esclusione di Git (fondamentale)
├── package.json                    # Script principali di avvio e orchestrazione
├── package-lock.json               # Lockfile delle dipendenze root
├── FUNZIONAMENTO_APP.md            # Documentazione di funzionamento
├── INSTALLAZIONE_ALPINE.md         # Guida per l'installazione su Proxmox/Alpine
├── GUIDA_GITHUB.md                 # Questa guida
│
├── backend/                        # --- CARTELLA BACKEND ---
│   ├── server.js                   # Entry-point del server Express
│   ├── package.json                # Dipendenze del backend NodeJS
│   ├── package-lock.json           # Lockfile del backend
│   ├── routes/                     # Gestione delle rotte API
│   │   ├── couriers.js
│   │   ├── templates.js
│   │   └── xlsx.js
│   ├── services/                   # Servizi e logica di sanificazione dati
│   │   ├── db.js
│   │   ├── excelService.js
│   │   └── templateService.js
│   └── data/                       # Database locale
│       ├── couriers.json           # Lista dei corrieri attivi
│       └── templates.json          # Database dei template prodotti (da conservare!)
│
├── frontend/                       # --- CARTELLA FRONTEND ---
│   ├── index.html                  # File HTML di ingresso principale
│   ├── vite.config.js              # Configurazione del bundler Vite
│   ├── package.json                # Dipendenze dell'app Vue 3
│   ├── package-lock.json           # Lockfile del frontend
│   ├── .gitignore                  # Regole di esclusione specifiche per il frontend
│   ├── public/                     # Asset grafici pubblici statici
│   │   ├── favicon.svg             # Nuova favicon premium
│   │   └── icons.svg               # Risorse per le icone dell'editor
│   └── src/                        # Codice sorgente dell'interfaccia Vue
│       ├── main.js
│       ├── App.vue                 # Layout principale (con navbar premium)
│       ├── style.css               # Design system globale
│       ├── api/                    # Client di chiamata al backend
│       ├── components/             # Componenti riutilizzabili (griglia, barre)
│       ├── router/                 # Rotte dell'interfaccia grafica
│       ├── stores/                 # Gestione dello stato dell'app (Pinia)
│       └── views/                  # Viste dell'applicazione
│
└── scripts/                        # --- UTILITY SCRIPTS ---
    └── free-dev-ports.ps1          # Script per liberare le porte su Windows
```

---

## 🛑 File ed Elementi da ESCLUDERE (Già ignorati)

Questi elementi **non** devono mai essere caricati su GitHub perché rendono il repository pesante e causano conflitti di sistema:

1.  **Cartelle `node_modules/`** (situate nella root, in `backend/` e in `frontend/`):
    *   *Perché*: Contengono decine di migliaia di file di librerie esterne. Vengono ricreate da zero sul server Alpine Linux lanciando il comando `npm run install:all`.
2.  **Cartella `frontend/dist/`** (generata dopo la compilazione):
    *   *Perché*: Contiene il codice frontend minimizzato per la produzione. Viene generata direttamente sul server di destinazione tramite `npm run build`.
3.  **Cartelle `backend/data/uploads/` e `backend/data/exports/`**:
    *   *Perché*: Contengono i file Excel caricati o esportati dagli utenti durante l'uso dell'app.
4.  **Eventuali file `.env`**:
    *   *Perché*: Contengono variabili d'ambiente locali specifiche per la tua macchina di sviluppo.

---

## ⚡ Prontuario Git per il caricamento (da Windows)

Se hai apportato modifiche sul tuo PC Windows e vuoi caricarle su GitHub per poi scaricarle sul server Alpine, apri il terminale di Windows (PowerShell o Git Bash) nella cartella `/ORDEREDIT` ed esegui:

```bash
# 1. Verifica lo stato dei file modificati (vedrai che node_modules e dist sono ignorati)
git status

# 2. Aggiungi tutte le modifiche legittime all'area di staging
git add .

# 3. Registra le modifiche con un messaggio chiaro
git commit -m "feat: restyling premium barra di navigazione e nuovo logo"

# 4. Invia le modifiche al tuo repository GitHub remoto
git push origin main
```

Una volta completato il push, ti basterà accedere al terminale di Alpine Linux e digitare `git pull` per aggiornare all'istante l'applicazione in produzione!

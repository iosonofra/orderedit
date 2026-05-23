# Guida all'Installazione di OrderEdit su Alpine Linux (Proxmox)

Questa guida spiega come installare l'applicazione **OrderEdit** su un container LXC basato su Alpine Linux all'interno di Proxmox.

L'installazione è stata ottimizzata e semplificata: un solo comando si occuperà di installare le dipendenze, e il backend NodeJS servirà in automatico anche l'interfaccia web senza bisogno di Nginx.

## Prerequisiti

1. Un container LXC su Proxmox con **Alpine Linux** installato e avviato.
2. Aver caricato le modifiche dal proprio PC Windows verso GitHub (usando `git push`).

---

## 🚀 1. Installazione Iniziale (Da zero)

Accedi alla console (shell) del tuo container Alpine come utente `root` ed esegui questi passaggi:

### Passaggio 1: Installazione dei requisiti base
Aggiorna i pacchetti del sistema e installa Node.js, NPM e Git:
```bash
apk update
apk add git nodejs npm
```

### Passaggio 2: Download del codice
Spostati nella cartella `/opt` (ideale per applicazioni web) e scarica il repository:
```bash
cd /opt
# Se il tuo repository è diverso, sostituisci il link qui sotto
git clone https://github.com/iosonofra/orderedit.git
cd orderedit
```

### Passaggio 3: Installazione e Compilazione
Grazie agli script automatici, questo comando installerà tutto ciò che serve in un colpo solo e preparerà l'app per la produzione:
```bash
# Installa tutte le dipendenze (sia del frontend che del backend)
npm run install:all

# Compila l'interfaccia grafica
npm run build
```

### Passaggio 4: Avvio in background tramite PM2
Per evitare che l'app si spenga quando chiudi il terminale, usiamo il process manager PM2.
```bash
# Installa PM2 nel sistema operativo
npm install -g pm2

# Avvia l'applicazione chiamandola "orderedit"
pm2 start npm --name "orderedit" -- run start:prod

# Salva la configurazione
pm2 save

# Imposta il riavvio automatico all'accensione del server
pm2 startup
```
*(⚠️ IMPORTANTE: Il comando `pm2 startup` potrebbe stamperti a schermo un'altra riga di comando. Copiala, incollala nel terminale e premi Invio).*

---

## 🎉 2. Accesso all'Applicazione

Tutto fatto! L'applicazione adesso è attiva e girerà silenziosamente sul server.
Per usarla, apri il browser del tuo PC e vai all'indirizzo IP del tuo server Alpine sulla porta **3001**:

👉 **`http://<INDIRIZZO-IP-SERVER-ALPINE>:3001`**

---

## 🔄 3. Come aggiornare l'applicazione (Git Pull)

Ogni volta che fai modifiche e lanci `git push` sul tuo computer Windows, puoi aggiornare il server in pochissimi passaggi:

```bash
# Vai nella cartella dell'app
cd /opt/orderedit

# Scarica le ultime novità
git pull

# Aggiorna i file e compila il codice
npm run install:all
npm run build

# Riavvia il processo in background
pm2 restart orderedit
```

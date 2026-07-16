# Guida all'Installazione e Aggiornamento di OrderEdit

## 1. Aggiornamento (Senza perdere catalogo e impostazioni)
Per aggiornare un'installazione esistente mantenendo i dati salvati:
1. Chiudere l'applicazione OrderEdit (fermare i terminali di node/npm).
2. Estrarre il contenuto di questo archivio ZIP direttamente sopra la cartella dell'applicazione esistente.
3. Rispondere **Sì / Sovrascrivi** a tutte le richieste di sovrascrittura.
   *(Nota: Il file ZIP non contiene i database ackend/data/templates.json e ackend/data/couriers.json, quindi i tuoi dati correnti rimarranno al sicuro).*
4. Aprire il terminale nella cartella dell'app ed eseguire 
pm run install:all per installare eventuali nuove dipendenze.
5. Avviare l'app con 
pm start.

## 2. Nuova Installazione (Pulita)
Per installare l'applicazione per la prima volta:
1. Estrarre il contenuto di questo file ZIP in una cartella vuota (es. C:\OrderEdit).
2. Assicurarsi di aver installato Node.js (versione 18 o superiore).
3. Aprire una finestra del terminale (PowerShell o Prompt) nella cartella dell'app ed eseguire:
   `ash
   npm run install:all
   `
4. Al termine dell'installazione, avviare l'applicazione eseguendo:
   `ash
   npm start
   `
5. L'applicazione creerà automaticamente i database vuoti necessari all'avvio.

## 3. Configurazione PickCSV
1. Aprire OrderEdit e andare in **Impostazioni > Integrazione Picking**.
2. Inserire il token API PickCSV e premere **Salva token**.
3. Il pulsante **Genera Picking** invierà il file come **Upload automatico** con canale **OrderEdit**.

## 4. Configurazione PrestaShop 1.7
1. Nel Back Office PrestaShop abilitare il Webservice e creare una chiave con permessi GET su orders, customers, carriers, order_states e order_details.
2. Aprire la voce **PrestaShop** in OrderEdit e selezionare **Configura Webservice**.
3. Inserire URL del negozio, chiave e ID lingua, quindi salvare ed eseguire il test connessione.
4. La configurazione viene salvata solo in ackend/data/prestashop_config.json, che non e incluso negli aggiornamenti ZIP.

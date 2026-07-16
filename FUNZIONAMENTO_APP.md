# OrderEdit - Funzionamento e note tecniche

Questo documento descrive come funziona OrderEdit, quali funzioni espone
l'interfaccia e quali elementi tecnici vengono usati nel frontend e nel backend.

## Scopo dell'app

OrderEdit e una web app locale per caricare file Excel `.xlsx` di ordini,
modificare rapidamente i dati principali e scaricare un nuovo file Excel senza
alterare il file originale caricato.

Il caso d'uso principale e aggiornare la colonna `Nome del prodotto` usando una
rubrica/catalogo basata su `ID prodotto`, mantenendo dove previsto il grassetto
parziale del nome prodotto. L'app include anche strumenti rapidi per sistemare
testi, corrieri, righe unite, larghezze colonne e impostazioni di export.

## Avvio

Dalla cartella principale:

```bash
npm start
```

Lo script principale libera le porte di sviluppo e avvia:

- backend Express su `http://localhost:3001`
- frontend Vite/Vue su `http://localhost:5173`

E presente anche il collegamento Windows `Avvia OrderEdit.lnk`, pensato per
lanciare l'app in modo piu immediato.

## Flusso operativo

1. Aprire l'app nel browser.
2. Caricare un file `.xlsx` tramite import.
3. Verificare i dati nella griglia tipo Excel.
4. Usare `Aggiorna nomi` per applicare i nomi prodotto dal catalogo.
5. Usare eventualmente strumenti rapidi, ricerca/sostituzione, corrieri o merge.
6. Premere `Scarica Excel`.
7. Controllare il riepilogo modifiche.
8. Confermare l'export e salvare il file generato.

## Struttura Excel attesa

L'app rileva le colonne dal testo degli header. La struttura tipica e:

| Colonna | Header |
| --- | --- |
| A | Riferimento ordine |
| B | Cliente |
| C | Nome del prodotto |
| D | Quantita del prodotto |
| E | Note |
| F | EAN |
| G | Nome corriere |
| H | ID prodotto |

Le colonne fondamentali per l'auto-rename sono:

- `Nome del prodotto`: colonna aggiornata con il nome del catalogo.
- `ID prodotto`: chiave usata per cercare il template corretto.

La colonna `EAN` viene trattata come colonna protetta in export, per evitare
conversioni o modifiche accidentali.

## Funzioni principali dell'interfaccia

### Import Excel

Il file viene inviato al backend con `POST /api/xlsx/upload`.
Il frontend assegna a ogni scheda del browser un workspace casuale e lo invia
tramite l'header `X-OrderEdit-Workspace`. Il backend salva una copia persistente
separata per workspace in:

```text
backend/data/uploads/<workspace-id>/last_upload.xlsx
```

Questa copia originale viene poi riaperta in fase di export, cosi ExcelJS puo
preservare il piu possibile struttura, fogli, larghezze, merge e formattazione,
senza usare il file caricato da un altro utente.

### Griglia Excel web

La griglia e implementata nel componente:

```text
frontend/src/components/SimpleSheetGrid.vue
```

Funzioni gestite:

- visualizzazione dei fogli Excel in tabella HTML;
- selezione celle;
- modifica diretta dei valori;
- mantenimento visivo del grassetto nell'input durante la fase di editing attivo (tramite la classe `.rich-editing` e `font-weight: bold`), che garantisce una precisione assoluta della selezione del testo al pixel coerente al browser nativo;
- larghezze colonne automatiche;
- ridimensionamento manuale trascinando l'header;
- doppio click sull'header per adattare la colonna al contenuto;
- blocco opzionale di riga header e prime colonne;
- tab per cambiare foglio se il file contiene piu worksheet.

Le celle rich text sono rappresentate lato frontend con una struttura simile:

```js
{
  v: 'testo completo',
  m: 'testo completo',
  w: 'testo completo',
  ct: {
    t: 'inlineStr',
    s: [
      { v: 'parte bold', bl: 1 },
      { v: ' parte normale', bl: 0 }
    ]
  }
}
```

### Aggiorna nomi

Il comando `Aggiorna nomi` si trova in:

```text
frontend/src/components/AppToolbar.vue
```

Funzionamento:

1. legge la colonna `ID prodotto`;
2. cerca ogni ID nel catalogo template;
3. aggiorna la colonna `Nome del prodotto`;
4. mantiene eventuali tag `<b>...</b>` presenti nel template;
5. segnala gli ID mancanti;
6. propone suggerimenti per template simili quando possibile;
7. il pulsante "Aggiorna nomi" nella barra degli strumenti è dotato di un hover di design (colore indaco brillante `#6366f1` / `#4f46e5` con translateY e soft shadow glow) lasciando intatto lo stato disabilitato per pulsanti non attivi.

Esempio template con grassetto parziale:

```html
<b>Daikin ATXC60D</b> Condizionatore climatizzatore 21000Btu
```

In interfaccia e in export Excel viene mantenuto solo il grassetto della parte
compresa tra `<b>` e `</b>`.

### Catalogo template

La pagina catalogo e disponibile su:

```text
/catalog
```

Componente:

```text
frontend/src/views/SettingsView.vue
```

Store frontend:

```text
frontend/src/stores/templates.js
```

API backend:

```text
backend/routes/templates.js
```

File dati:

```text
backend/data/templates.json
```

Operazioni disponibili:

- lista template;
- aggiunta template;
- modifica template;
- eliminazione template;
- import CSV;
- import JSON;
- export CSV;
- export JSON.

Formato CSV supportato:

```csv
601530,Nome prodotto
601528,Altro nome prodotto
```

Sono accettati come separatori anche tab e punto e virgola in fase di import.

Formato JSON supportato:

```json
[
  { "id": "601530", "name": "Nome prodotto" },
  { "id": "601528", "name": "Altro nome prodotto" }
]
```

### Strumenti rapidi

Gli strumenti rapidi sono nel menu `Strumenti rapidi` della toolbar.

Funzioni principali:

- `Applica template a selezione`: applica il template sulle righe selezionate.
- `Normalizza spazi`: riduce spazi multipli e ripulisce i testi.
- `Trim colonne testuali`: elimina spazi iniziali/finali dalle celle testuali.
- `Unisci righe per ordine`: applica merge su righe con stesso riferimento ordine.
- `Separa righe unite`: rimuove merge applicati sulle colonne gestite.
- `Confronta con originale`: mostra differenze tra stato attuale e file caricato.

Queste funzioni lavorano sui dati presenti nello store frontend e poi aggiornano
checkpoint, recovery e griglia.

### Imposta corriere

Il menu `Imposta corriere` applica rapidamente un corriere alle righe del file.
I preset sono gestiti nello store:

```text
frontend/src/stores/courierPresets.js
```

La funzione cerca la colonna `Nome corriere` e aggiorna i valori presenti.

### Trova e sostituisci

La funzione permette di cercare testo nelle celle e sostituirlo, con opzioni
come case-sensitive. Prima dell'applicazione viene mostrata un'anteprima dei
match trovati.

### Undo e redo

Lo store `spreadsheet` mantiene checkpoint locali fino a un limite configurato.
Le azioni `Annulla` e `Ripeti` ripristinano snapshot precedenti o successivi.

File:

```text
frontend/src/stores/spreadsheet.js
```

Costante principale:

```js
const CHECKPOINT_LIMIT = 40
```

### Recovery locale

Lo stato di lavoro viene salvato in `localStorage`, cosi l'app puo recuperare
una sessione anche dopo refresh o chiusura del browser.

Chiavi principali:

```text
orderedit:recovery:v1
orderedit:export-filename:v1
orderedit:editor-prefs:v1
orderedit:file-layouts:v1
```

### Impostazioni

La pagina impostazioni e disponibile su:

```text
/settings
```

Componente:

```text
frontend/src/views/PreferencesView.vue
```

Impostazioni gestite:

- modalita nome file export;
- suffisso export;
- blocco riga/colonne nella griglia;
- gestione backup export;
- cancellazione backup generati.

### Notifiche

Le notifiche sono gestite da:

```text
frontend/src/stores/notification.js
```

Sono visualizzate in basso, con messaggi piu grandi, per non coprire gli header
o il testo della griglia.

### Branding e Navigazione Superiore (Redesign Premium)

La barra di navigazione in alto e l'identità visiva dell'applicazione sono state riprogettate secondo standard premium e moderni:

- **Segmented Control Glassmorphic**: I tab di navigazione principali sono racchiusi all'interno di un'unica capsula con sfondo semi-trasparente ed effetto vetro sfocato (`backdrop-filter: blur(12px)`). La voce selezionata galleggia con uno sfondo semi-trasparente basato sul colore d'accento (`--accent`) arricchito da un bagliore soffuso (`box-shadow: var(--shadow-accent-glow)`).
- **Micro-Icone SVG Minimal**: Ogni voce ha un'icona minimalista ad alta precisione integrata. Al passaggio del mouse, l'icona compie una micro-interazione dinamica (rotazione ed espansione) come feedback visivo.
- **Logo e Favicon Vettoriali**: Il logo rappresenta la metafora di un foglio ordini (tabella) con una scintilla di editing (l'auto-rename intelligente). Il logo, presente anche nella favicon del browser, compie una rotazione elastica e si ingrandisce all'hover sull'intestazione del brand `OrderEdit` in `App.vue`. Il brand non è cliccabile ma preserva l'effetto hover.

## Export Excel

L'export passa da:

```text
POST /api/xlsx/export
```

Implementazione:

```text
backend/routes/xlsx.js
```

Il frontend non invia tutto il file Excel ricostruito da zero. Invia invece:

- `patches`: celle cambiate;
- `merges`: modifiche alle celle unite;
- `columns`: larghezze colonne cambiate;
- `filename`: nome finale del file.

Il backend:

1. ricarica `backend/data/uploads/<workspace-id>/last_upload.xlsx`;
2. applica solo le patch ricevute;
3. applica merge e larghezze colonne;
4. ripulisce testi e stili problematici;
5. genera un nuovo `.xlsx`;
6. salva una copia backup;
7. invia il file al browser.

### Backup export

Ogni export viene salvato anche in:

```text
backend/data/exports/<workspace-id>/
```

La lista, il limite e la cancellazione dei backup agiscono solo sul workspace
della richiesta corrente.

### Import ordini PrestaShop 1.7

La voce **PrestaShop** apre un flusso separato dall'upload manuale. Il backend
usa il Webservice esclusivamente in lettura e mantiene la chiave API fuori dal
browser. Sono richiesti i permessi `GET` sulle risorse `orders`, `customers`,
`carriers`, `order_states` e `order_details`.

Flusso:

1. configurazione URL negozio, chiave Webservice e ID lingua;
2. ricerca per riferimento o ID, filtro stato e intervallo date, con anteprima prodotti e quantità;
3. selezione persistente degli ordini, fino a 100 per importazione;
4. una riga Excel per ogni prodotto dell'ordine;
5. generazione del template grafico predefinito con Note vuote;
6. caricamento del workbook generato nel normale editor OrderEdit.

Il template viene ricreato senza dati cliente incorporati. Mantiene le otto
colonne del modello, font, colori alternati, bordi, larghezze, altezze e valori
EAN/ID in formato testo. Dopo l'apertura sono disponibili le stesse operazioni
del flusso file, inclusa l'unione righe per ordine.

La selezione degli ordini vive esclusivamente nella memoria della singola pagina
e non viene salvata in uno stato globale del server. Generazione, successivo
upload ed export usano l'header workspace: due utenti contemporanei possono
selezionare ordini differenti senza condividere righe o workbook.

### Genera Picking

Il comando genera prima l'Excel usando esclusivamente l'originale del workspace
corrente, quindi inoltra quel buffer direttamente a PickCSV senza salvarlo in un
file temporaneo condiviso. Il proxy usa inoltre un `X-PickCSV-Client-Id` distinto
per workspace: due utenti che avviano il picking nello stesso momento restano
identificabili come richieste e batch separati anche dal servizio di destinazione.

Endpoint:

```text
GET /api/xlsx/backups
DELETE /api/xlsx/backups
```

La cancellazione backup e disponibile dalla pagina impostazioni.

## Gestione degli stili Excel

La parte piu delicata riguarda gli stili Excel, soprattutto rich text,
grassetto, barrato, corsivo e sottolineato.

Il backend usa ExcelJS per preservare il workbook originale, ma durante le
patch evita di trascinare stili indesiderati da celle, righe o colonne.

Regole attuali:

- il grassetto parziale del catalogo viene mantenuto come `richText`;
- il grassetto globale della cella viene rimosso dalle righe dati quando viene
  scritto un valore aggiornato;
- `strike`, `italic` e `underline` vengono rimossi dagli export gestiti;
- la riga header puo mantenere il grassetto originale;
- la colonna `EAN` e protetta dal cambio testo.

Funzioni tecniche rilevanti:

```text
sanitizeExcelFont()
sanitizeExcelTextValue()
sanitizeCellTextStyle()
writeSafeCellValue()
luckyCellToExcelBoldRichText()
luckyCellToExcelTextValue()
sanitizeWorksheetTextPrefixes()
```

Questa logica serve a evitare problemi gia osservati:

- testo barrato applicato casualmente in colonne non previste;
- grassetto esteso a tutta la cella invece che solo a una parte del nome;
- perdita del grassetto parziale dopo modifiche manuali;
- export senza modifiche effettive nonostante la griglia fosse aggiornata.

## Architettura frontend

Tecnologie:

- Vue 3;
- Vite;
- Pinia;
- Vue Router;
- Axios.

Entry point:

```text
frontend/src/main.js
```

Router:

```text
frontend/src/router/index.js
```

Rotte:

| Rotta | Vista |
| --- | --- |
| `/` | redirect a `/editor` |
| `/editor` | editor Excel |
| `/catalog` | catalogo template |
| `/settings` | impostazioni |

Componenti principali:

| File | Responsabilita |
| --- | --- |
| `App.vue` | layout generale applicazione |
| `EditorView.vue` | pagina editor |
| `ImportModal.vue` | caricamento file Excel |
| `AppToolbar.vue` | comandi principali, export, auto-rename |
| `SimpleSheetGrid.vue` | griglia Excel custom |
| `SettingsView.vue` | gestione catalogo |
| `PreferencesView.vue` | preferenze app |

Store Pinia:

| Store | Responsabilita |
| --- | --- |
| `spreadsheet.js` | fogli, celle, checkpoint, recovery, layout |
| `templates.js` | catalogo ID prodotto -> nome |
| `notification.js` | toast/notifiche |
| `courierPresets.js` | preset corrieri |

Client API:

```text
frontend/src/api/index.js
```

## Architettura backend

Tecnologie:

- Node.js;
- Express;
- Multer;
- ExcelJS;
- file JSON per catalogo template.

Entry point:

```text
backend/server.js
```

Responsabilita:

- crea cartelle `backend/data/uploads` e `backend/data/exports`;
- configura CORS verso frontend;
- abilita payload JSON grandi fino a 50 MB;
- monta route `/api/xlsx`;
- monta route `/api/templates`;
- monta route `/api/prestashop`;
- espone health check `/api/health`.

Route principali:

| Endpoint | Metodo | Descrizione |
| --- | --- | --- |
| `/api/health` | GET | verifica backend attivo |
| `/api/xlsx/upload` | POST | carica file Excel |
| `/api/xlsx/export` | POST | genera export Excel |
| `/api/xlsx/backups` | GET | lista backup export |
| `/api/xlsx/backups` | DELETE | elimina backup export |
| `/api/templates` | GET | lista template |
| `/api/templates` | POST | crea template |
| `/api/templates/:id` | PUT | aggiorna template |
| `/api/templates/:id` | DELETE | elimina template |
| `/api/templates/import` | POST | importa CSV/JSON |
| `/api/templates/export/:format` | GET | esporta CSV/JSON |
| `/api/prestashop/config` | GET/PUT | legge o salva la connessione mascherando la chiave |
| `/api/prestashop/test` | POST | verifica connessione e permessi ordini |
| `/api/prestashop/states` | GET | elenca gli stati ordine |
| `/api/prestashop/orders` | GET | ricerca e filtra gli ordini |
| `/api/prestashop/workbook` | POST | genera il template XLSX dagli ordini selezionati |

## File e cartelle dati

```text
backend/data/templates.json
backend/data/prestashop_config.json
backend/data/uploads/<workspace-id>/last_upload.xlsx
backend/data/exports/<workspace-id>/
```

Significato:

- `templates.json`: catalogo locale dei nomi prodotto;
- `prestashop_config.json`: URL, chiave Webservice e lingua; escluso dai pacchetti release;
- `last_upload.xlsx`: ultimo file Excel caricato nel singolo workspace, usato come base export;
- `exports/<workspace-id>/`: backup isolati dei file esportati nel singolo workspace.

## Protezioni e limiti

Upload:

- accetta solo `.xlsx`;
- limite file 50 MB.

Export:

- massimo 50 fogli nel payload completo;
- massimo 200 gruppi patch;
- massimo 50 patch merge;
- massimo 50 patch colonne.

Questi limiti evitano payload troppo grandi o export anomali.

## Note su Luckysheet/FortuneSheet

Il README storico cita FortuneSheet/Luckysheet, ma l'interfaccia attuale usa una
griglia custom Vue (`SimpleSheetGrid.vue`). Questa scelta e stata introdotta per
avere piu controllo su:

- aggiornamento celle;
- export patch-based;
- stili rich text;
- larghezze colonne;
- blocco righe/colonne;
- comportamento stabile senza dipendere da un componente spreadsheet esterno.

Nel codice restano nomi di funzioni con prefisso `lucky...` per compatibilita
con la vecchia forma dati e per non riscrivere completamente il flusso di export.

## Comandi utili

Avvio completo:

```bash
npm start
```

Backend:

```bash
npm --prefix backend run start
npm --prefix backend run dev
```

Frontend:

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
```

Controllo sintassi backend:

```bash
node --check backend/routes/xlsx.js
node --check backend/routes/templates.js
```

## Manutenzione consigliata

Quando si modifica la logica Excel:

1. testare upload di un file reale;
2. applicare `Aggiorna nomi`;
3. esportare;
4. riaprire il file in Excel;
5. verificare `Nome del prodotto`, `Nome corriere`, `EAN` e larghezze colonne;
6. controllare che il grassetto sia solo dove previsto;
7. controllare che non compaiano barrato, corsivo o sottolineato indesiderati.

Quando si modifica la UI:

1. verificare editor desktop;
2. verificare griglia con molte colonne;
3. verificare menu strumenti rapidi;
4. verificare notifiche in basso;
5. verificare impostazioni e catalogo.

## Glossario interno

- Template: mappatura tra `ID prodotto` e nome prodotto finale.
- Auto-rename: applicazione automatica dei template alla colonna prodotto.
- Patch: modifica minima inviata al backend invece dell'intero file.
- Rich text: testo con stili parziali, per esempio una sola parte in grassetto.
- Protected column: colonna da non modificare in export, attualmente `EAN`.
- Recovery: salvataggio locale dello stato di lavoro nel browser.
- Backup export: copia lato server del file Excel scaricato.

const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { loadTemplates } = require('./templates');

const CONFIG_PATH = path.join(__dirname, '../data/ai_config.json');

// In-memory array to store the last 10 AI request/response logs
const aiLogs = [];

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
]`;

const DEFAULT_COURIER_RULES = `GLS per le isole o pesi ridotti.
BRT per climatizzatori, stufe o colli pesanti.
DHL per spedizioni espresse o con indicazione urgente nelle note.
SDA per tutti gli altri casi.`;

// Helper: load config from disk
function loadAiConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      const dir = path.dirname(CONFIG_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const defaults = {
        enabled: true,
        provider: 'openrouter',
        apiKey: '',
        model: 'google/gemini-2.5-flash:free',
        customUrl: '',
        courierRules: DEFAULT_COURIER_RULES,
        temperature: 0.1,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        maxTokens: 1500,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        concurrency: 3,
      };
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaults, null, 2), 'utf8');
      return defaults;
    }
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    // Ensure standard properties exist
    if (config.enabled === undefined) config.enabled = true;
    if (!config.model) config.model = 'google/gemini-2.5-flash:free';
    if (config.temperature === undefined) config.temperature = 0.1;
    if (!config.systemPrompt) config.systemPrompt = DEFAULT_SYSTEM_PROMPT;
    if (!config.courierRules) config.courierRules = DEFAULT_COURIER_RULES;
    if (config.maxTokens === undefined) config.maxTokens = 1500;
    if (config.frequencyPenalty === undefined) config.frequencyPenalty = 0.0;
    if (config.presencePenalty === undefined) config.presencePenalty = 0.0;
    if (config.concurrency === undefined) config.concurrency = 3;
    return config;
  } catch (err) {
    console.error('Errore lettura config AI:', err);
    return {
      enabled: true,
      provider: 'openrouter',
      apiKey: '',
      model: 'google/gemini-2.5-flash:free',
      customUrl: '',
      courierRules: DEFAULT_COURIER_RULES,
      temperature: 0.1,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      maxTokens: 1500,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      concurrency: 3,
    };
  }
}

// Helper: save config to disk
function saveAiConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Errore scrittura config AI:', err);
    return false;
  }
}

// Helper to clean, repair, and parse JSON array from LLM response (handling truncation and escaping issues)
function cleanAndParseJsonArray(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  // Helper to repair truncated JSON arrays
  const repairTruncatedJson = (str) => {
    let s = str.trim();
    if (!s.startsWith('[')) {
      const start = s.indexOf('[');
      if (start === -1) return s;
      s = s.slice(start);
    }
    if (s.endsWith(']')) return s;

    const lastBraceIdx = s.lastIndexOf('}');
    if (lastBraceIdx === -1) return s + ']';
    
    let sliced = s.slice(0, lastBraceIdx + 1);
    sliced = sliced.replace(/,\s*$/g, '');
    return sliced + ']';
  };

  // Clean raw newlines inside string values
  cleaned = cleaned.replace(/"([^"]*)"/g, (match, p1) => {
    return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
  });

  // Clean trailing commas
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  // Try standard parse
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Try to repair truncation
    try {
      const repaired = repairTruncatedJson(cleaned);
      return JSON.parse(repaired);
    } catch (repairErr) {
      // Slicing strategy as last resort
      const startIdx = cleaned.indexOf('[');
      const endIdx = cleaned.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const arrayStr = cleaned.slice(startIdx, endIdx + 1);
        try {
          return JSON.parse(arrayStr);
        } catch (innerErr) {
          try {
            const repairedSlice = repairTruncatedJson(arrayStr);
            return JSON.parse(repairedSlice);
          } catch (sliceRepairErr) {
            throw new Error('La risposta del modello non contiene un array JSON valido: ' + innerErr.message + ' (tentato ripristino fallito)');
          }
        }
      }
      throw new Error('La risposta del modello non contiene un array JSON valido: ' + err.message);
    }
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Call completion API (compatible with OpenAI format) with automatic retries on rate limit (429) & temp errors (5xx)
async function callChatCompletions({ provider, apiKey, model, customUrl, temperature, maxTokens, frequencyPenalty, presencePenalty, messages }) {
  let endpoint = '';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    headers['HTTP-Referer'] = 'http://localhost:3001';
    headers['X-Title'] = 'OrderEdit';
  } else if (provider === 'groq') {
    endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  } else if (provider === 'nvidia') {
    endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';
  } else if (provider === 'custom') {
    endpoint = customUrl ? `${customUrl.replace(/\/$/, '')}/chat/completions` : '';
  }

  if (!endpoint) {
    throw new Error('Endpoint URL non valido o mancante per il provider selezionato.');
  }

  const requestBody = {
    model,
    messages,
    temperature: Number(temperature ?? 0.1),
    max_tokens: Number(maxTokens ?? 1500),
    frequency_penalty: Number(frequencyPenalty ?? 0.0),
    presence_penalty: Number(presencePenalty ?? 0.0),
  };

  const startTime = Date.now();
  let content = '';
  let apiError = null;
  const maxAttempts = 4;

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const status = response.status;

          if (status === 429 || (status >= 500 && status <= 504)) {
            // Default exponential backoff delay
            let delay = 1000 * Math.pow(2, attempt) + Math.random() * 500;

            if (status === 429) {
              const retryAfterHeader = response.headers.get('retry-after');
              if (retryAfterHeader) {
                const seconds = parseInt(retryAfterHeader, 10);
                if (!isNaN(seconds)) {
                  delay = seconds * 1000 + 500;
                }
              } else {
                // Try parsing Retry-After / retry_after_seconds from the JSON error message
                const match = errorText.match(/"retry_after_seconds"\s*:\s*([\d.]+)/) || 
                              errorText.match(/retry_after_seconds":\s*([\d.]+)/) ||
                              errorText.match(/retry-after:\s*([\d.]+)/i);
                if (match && match[1]) {
                  const seconds = parseFloat(match[1]);
                  if (!isNaN(seconds)) {
                    delay = Math.ceil(seconds) * 1000 + 500;
                  }
                }
              }
            }

            console.warn(`[AI Attempt ${attempt}/${maxAttempts}] Status ${status}. Retrying in ${Math.round(delay)}ms...`);

            if (attempt < maxAttempts) {
              await sleep(delay);
              continue;
            }
          }

          throw new Error(`API Error (${status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        content = data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Nessun contenuto ricevuto nella risposta del modello.');
        }
        return content;
      } catch (err) {
        const isNetworkError = err.message.includes('fetch') || err.message.includes('network') || err.message.includes('timeout') || err.code === 'ECONNRESET';
        if (isNetworkError && attempt < maxAttempts) {
          const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500;
          console.warn(`[AI Attempt ${attempt}/${maxAttempts}] Network error. Retrying in ${Math.round(delay)}ms... Error: ${err.message}`);
          await sleep(delay);
          continue;
        }
        throw err;
      }
    }
  } catch (err) {
    apiError = err.message;
    throw err;
  } finally {
    const latency = Date.now() - startTime;
    // Push the log entry in-memory
    aiLogs.unshift({
      timestamp: new Date().toISOString(),
      model,
      provider,
      messages,
      response: content || '',
      latency,
      error: apiError,
    });
    // Cap logs at 10 items
    if (aiLogs.length > 10) {
      aiLogs.pop();
    }
  }
}

// GET /api/ai/config - Fetch configurations
router.get('/config', (req, res) => {
  const config = loadAiConfig();
  res.json({
    enabled: config.enabled !== undefined ? config.enabled : true,
    provider: config.provider,
    apiKey: config.apiKey || '',
    hasApiKey: !!config.apiKey,
    model: config.model,
    customUrl: config.customUrl,
    courierRules: config.courierRules,
    temperature: config.temperature,
    systemPrompt: config.systemPrompt,
    maxTokens: config.maxTokens,
    frequencyPenalty: config.frequencyPenalty,
    presencePenalty: config.presencePenalty,
    concurrency: config.concurrency,
  });
});

// POST /api/ai/config - Save configurations
router.post('/config', (req, res) => {
  const { enabled, provider, apiKey, model, customUrl, courierRules, temperature, systemPrompt, maxTokens, frequencyPenalty, presencePenalty, concurrency } = req.body;
  const current = loadAiConfig();

  // Update apiKey only if a new one is sent (different from placeholder and not empty)
  let nextApiKey = current.apiKey;
  if (apiKey !== undefined && apiKey !== '••••••••••••••••') {
    nextApiKey = String(apiKey).trim();
  }

  const updated = {
    enabled: enabled !== undefined ? !!enabled : current.enabled,
    provider: provider || current.provider,
    apiKey: nextApiKey,
    model: model || current.model,
    customUrl: customUrl !== undefined ? customUrl.trim() : current.customUrl,
    courierRules: courierRules !== undefined ? courierRules : current.courierRules,
    temperature: temperature !== undefined ? Number(temperature) : current.temperature,
    systemPrompt: systemPrompt !== undefined ? systemPrompt : current.systemPrompt,
    maxTokens: maxTokens !== undefined ? Number(maxTokens) : current.maxTokens,
    frequencyPenalty: frequencyPenalty !== undefined ? Number(frequencyPenalty) : current.frequencyPenalty,
    presencePenalty: presencePenalty !== undefined ? Number(presencePenalty) : current.presencePenalty,
    concurrency: concurrency !== undefined ? Number(concurrency) : current.concurrency,
  };

  if (saveAiConfig(updated)) {
    res.json({ status: 'ok' });
  } else {
    res.status(500).json({ error: 'Impossibile salvare la configurazione sul disco.' });
  }
});

// GET /api/ai/logs - Fetch request/response logs
router.get('/logs', (req, res) => {
  res.json({ logs: aiLogs });
});

// POST /api/ai/test - Test connection
router.post('/test', async (req, res) => {
  const { provider, apiKey, model, customUrl } = req.body;
  const current = loadAiConfig();

  // Determine API key to use
  let keyToUse = '';
  if (apiKey === '••••••••••••••••') {
    keyToUse = current.apiKey;
  } else if (apiKey) {
    keyToUse = String(apiKey).trim();
  } else {
    keyToUse = current.apiKey;
  }

  if (!keyToUse) {
    return res.status(400).json({ error: 'La chiave API è assente o non configurata.' });
  }

  try {
    const content = await callChatCompletions({
      provider: provider || current.provider,
      apiKey: keyToUse,
      model: model || current.model,
      customUrl: customUrl !== undefined ? customUrl : current.customUrl,
      temperature: 0.1,
      maxTokens: 100,
      messages: [
        { role: 'user', content: 'Rispondi esattamente con la parola "OK".' }
      ]
    });

    if (content.trim().toUpperCase().includes('OK')) {
      res.json({ status: 'ok' });
    } else {
      res.json({ status: 'error', error: `Risposta inattesa dal modello: ${content}` });
    }
  } catch (err) {
    console.error('AI Test error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/process-sheet - Process sheet in batches using server-side config
router.post('/process-sheet', async (req, res) => {
  const { sheetData, columnsMapping, courierPresets } = req.body;
  
  if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
    return res.status(400).json({ error: 'Nessun dato del foglio fornito.' });
  }

  // Load backend configuration directly (no keys sent over network from client!)
  const aiConfig = loadAiConfig();
  if (!aiConfig.apiKey) {
    return res.status(400).json({ error: 'Configurazione AI non completata: chiave API mancante sul server.' });
  }

  try {
    // 1. Identify columns in header row
    const headers = sheetData[0].map(cell => {
      if (!cell) return '';
      if (typeof cell === 'string') return cell.trim().toLowerCase();
      if (cell.v !== undefined) return String(cell.v).trim().toLowerCase();
      return '';
    });

    const idHeader = (columnsMapping?.id || 'ID prodotto').toLowerCase();
    const nameHeader = (columnsMapping?.name || 'Nome del prodotto').toLowerCase();
    const courierHeader = (columnsMapping?.courier || 'Nome corriere').toLowerCase();

    const idIndex = headers.indexOf(idHeader);
    const nameIndex = headers.indexOf(nameHeader);
    const courierIndex = headers.indexOf(courierHeader);
    
    // Fallback notes column search
    let noteIndex = headers.indexOf('note');
    if (noteIndex === -1) noteIndex = headers.indexOf('notes');

    // Fallback location info search
    let cityIndex = headers.indexOf('città');
    if (cityIndex === -1) cityIndex = headers.indexOf('citta');
    if (cityIndex === -1) cityIndex = headers.indexOf('comune');
    if (cityIndex === -1) cityIndex = headers.indexOf('destinazione');
    
    let provIndex = headers.indexOf('provincia');
    if (provIndex === -1) provIndex = headers.indexOf('prov');
    
    let capIndex = headers.indexOf('cap');
    if (capIndex === -1) capIndex = headers.indexOf('codice postale');

    if (idIndex === -1 || nameIndex === -1) {
      return res.status(400).json({ error: `Impossibile trovare le colonne fondamentali per ID prodotto ("${idHeader}") o Nome del prodotto ("${nameHeader}").` });
    }

    const getCellVal = (cell) => {
      if (cell === null || cell === undefined) return '';
      if (typeof cell !== 'object') return String(cell).trim();
      return String(cell.v !== undefined ? cell.v : (cell.m !== undefined ? cell.m : '')).trim();
    };

    // 2. Load templates database to check for local resolutions
    const localTemplates = loadTemplates();

    // 3. Collect rows needing processing
    const rowsToProcess = [];
    for (let r = 1; r < sheetData.length; r++) {
      const row = sheetData[r];
      if (!row) continue;

      const idVal = getCellVal(row[idIndex]);
      const nameVal = getCellVal(row[nameIndex]);
      const courierVal = courierIndex !== -1 ? getCellVal(row[courierIndex]) : '';
      const notesVal = noteIndex !== -1 ? getCellVal(row[noteIndex]) : '';
      const cityVal = cityIndex !== -1 ? getCellVal(row[cityIndex]) : '';
      const provVal = provIndex !== -1 ? getCellVal(row[provIndex]) : '';
      const capVal = capIndex !== -1 ? getCellVal(row[capIndex]) : '';

      if (!idVal && !nameVal) continue;

      const resolvedName = localTemplates[idVal] || '';

      rowsToProcess.push({
        rowIndex: r,
        id: idVal,
        originalName: nameVal,
        resolvedName: resolvedName,
        isTemplateMissing: !resolvedName,
        currentCourier: courierVal,
        notes: notesVal,
        destination: `${cityVal} ${provVal} ${capVal}`.trim(),
      });
    }

    if (rowsToProcess.length === 0) {
      return res.json({ processedRows: [] });
    }

    // 4. Batch items (e.g. 25 at a time) to prevent API timeouts or output truncation
    const BATCH_SIZE = 25;
    const allResults = [];

    const allowedCouriers = Array.isArray(courierPresets) && courierPresets.length > 0 
      ? courierPresets 
      : ['GLS', 'BRT', 'DHL', 'SDA'];

    // Inietta corrieri ammessi e regole corriere nel prompt di sistema
    const systemPromptBase = aiConfig.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    const finalSystemPrompt = systemPromptBase
      .replace('[COURIER_LIST]', allowedCouriers.join(', '))
      .replace('[COURIER_RULES]', aiConfig.courierRules || DEFAULT_COURIER_RULES);

    const concurrency = Number(aiConfig.concurrency || 3);
    const batches = [];
    for (let i = 0; i < rowsToProcess.length; i += BATCH_SIZE) {
      batches.push(rowsToProcess.slice(i, i + BATCH_SIZE));
    }

    for (let i = 0; i < batches.length; i += concurrency) {
      const batchSlice = batches.slice(i, i + concurrency);
      
      const promises = batchSlice.map(async (batch) => {
        try {
          const userContent = JSON.stringify(batch.map(item => ({
            index: item.rowIndex,
            id: item.id,
            originalName: item.originalName,
            resolvedName: item.resolvedName,
            isTemplateMissing: item.isTemplateMissing,
            notes: item.notes,
            destination: item.destination,
          })));

          const responseText = await callChatCompletions({
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            model: aiConfig.model,
            customUrl: aiConfig.customUrl,
            temperature: aiConfig.temperature,
            maxTokens: aiConfig.maxTokens,
            frequencyPenalty: aiConfig.frequencyPenalty,
            presencePenalty: aiConfig.presencePenalty,
            messages: [
              { role: 'system', content: finalSystemPrompt },
              { role: 'user', content: userContent }
            ]
          });

          const parsedBatchResults = cleanAndParseJsonArray(responseText);

          // Map results back to original batch items
          batch.forEach(item => {
            const match = parsedBatchResults.find(r => r.index === item.rowIndex);
            allResults.push({
              rowIndex: item.rowIndex,
              id: item.id,
              originalName: item.originalName,
              suggestedName: match ? match.suggestedName : (item.resolvedName || item.originalName),
              currentCourier: item.currentCourier,
              suggestedCourier: match ? match.suggestedCourier : item.currentCourier,
              courierReason: match ? match.courierReason : '',
              anomalies: match ? match.anomalies : [],
              isNewTemplate: item.isTemplateMissing,
            });
          });
        } catch (batchErr) {
          console.error('Errore elaborazione batch AI:', batchErr);
          batch.forEach(item => {
            allResults.push({
              rowIndex: item.rowIndex,
              id: item.id,
              originalName: item.originalName,
              suggestedName: item.resolvedName || item.originalName,
              currentCourier: item.currentCourier,
              suggestedCourier: item.currentCourier,
              courierReason: `Errore chiamata AI: ${batchErr.message}`,
              anomalies: [`Errore elaborazione AI: ${batchErr.message}`],
              isNewTemplate: item.isTemplateMissing,
            });
          });
        }
      });

      await Promise.all(promises);
    }

    allResults.sort((a, b) => a.rowIndex - b.rowIndex);

    res.json({ processedRows: allResults });
  } catch (err) {
    console.error('AI Processing error:', err);
    res.status(500).json({ error: `Errore durante l'elaborazione AI: ${err.message}` });
  }
});

// POST /api/ai/process-sheet-stream - SSE streaming version of process-sheet
router.post('/process-sheet-stream', async (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const { sheetData, columnsMapping, courierPresets } = req.body;

  if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
    sendEvent({ type: 'error', message: 'Nessun dato del foglio fornito.' });
    sendEvent({ type: 'done' });
    res.end();
    return;
  }

  const aiConfig = loadAiConfig();
  if (!aiConfig.apiKey) {
    sendEvent({ type: 'error', message: 'Configurazione AI non completata: chiave API mancante sul server.' });
    sendEvent({ type: 'done' });
    res.end();
    return;
  }

  try {
    // 1. Identify columns (same logic as process-sheet)
    const headers = sheetData[0].map(cell => {
      if (!cell) return '';
      if (typeof cell === 'string') return cell.trim().toLowerCase();
      if (cell.v !== undefined) return String(cell.v).trim().toLowerCase();
      return '';
    });

    const idHeader = (columnsMapping?.id || 'ID prodotto').toLowerCase();
    const nameHeader = (columnsMapping?.name || 'Nome del prodotto').toLowerCase();
    const courierHeader = (columnsMapping?.courier || 'Nome corriere').toLowerCase();

    const idIndex = headers.indexOf(idHeader);
    const nameIndex = headers.indexOf(nameHeader);
    const courierIndex = headers.indexOf(courierHeader);

    let noteIndex = headers.indexOf('note');
    if (noteIndex === -1) noteIndex = headers.indexOf('notes');

    let cityIndex = headers.indexOf('città');
    if (cityIndex === -1) cityIndex = headers.indexOf('citta');
    if (cityIndex === -1) cityIndex = headers.indexOf('comune');
    if (cityIndex === -1) cityIndex = headers.indexOf('destinazione');

    let provIndex = headers.indexOf('provincia');
    if (provIndex === -1) provIndex = headers.indexOf('prov');

    let capIndex = headers.indexOf('cap');
    if (capIndex === -1) capIndex = headers.indexOf('codice postale');

    if (idIndex === -1 || nameIndex === -1) {
      sendEvent({ type: 'error', message: `Impossibile trovare le colonne fondamentali per ID prodotto ("${idHeader}") o Nome del prodotto ("${nameHeader}").` });
      sendEvent({ type: 'done' });
      res.end();
      return;
    }

    const getCellVal = (cell) => {
      if (cell === null || cell === undefined) return '';
      if (typeof cell !== 'object') return String(cell).trim();
      return String(cell.v !== undefined ? cell.v : (cell.m !== undefined ? cell.m : '')).trim();
    };

    // 2. Load templates
    const localTemplates = loadTemplates();

    // 3. Collect rows
    const rowsToProcess = [];
    for (let r = 1; r < sheetData.length; r++) {
      const row = sheetData[r];
      if (!row) continue;

      const idVal = getCellVal(row[idIndex]);
      const nameVal = getCellVal(row[nameIndex]);
      const courierVal = courierIndex !== -1 ? getCellVal(row[courierIndex]) : '';
      const notesVal = noteIndex !== -1 ? getCellVal(row[noteIndex]) : '';
      const cityVal = cityIndex !== -1 ? getCellVal(row[cityIndex]) : '';
      const provVal = provIndex !== -1 ? getCellVal(row[provIndex]) : '';
      const capVal = capIndex !== -1 ? getCellVal(row[capIndex]) : '';

      if (!idVal && !nameVal) continue;

      const resolvedName = localTemplates[idVal] || '';

      rowsToProcess.push({
        rowIndex: r,
        id: idVal,
        originalName: nameVal,
        resolvedName: resolvedName,
        isTemplateMissing: !resolvedName,
        currentCourier: courierVal,
        notes: notesVal,
        destination: `${cityVal} ${provVal} ${capVal}`.trim(),
      });
    }

    if (rowsToProcess.length === 0) {
      sendEvent({ type: 'result', processedRows: [] });
      sendEvent({ type: 'done' });
      res.end();
      return;
    }

    // 4. Build batches
    const BATCH_SIZE = 25;
    const allResults = [];

    const allowedCouriers = Array.isArray(courierPresets) && courierPresets.length > 0
      ? courierPresets
      : ['GLS', 'BRT', 'DHL', 'SDA'];

    const systemPromptBase = aiConfig.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    const finalSystemPrompt = systemPromptBase
      .replace('[COURIER_LIST]', allowedCouriers.join(', '))
      .replace('[COURIER_RULES]', aiConfig.courierRules || DEFAULT_COURIER_RULES);

    const concurrency = Number(aiConfig.concurrency || 3);
    const batches = [];
    for (let i = 0; i < rowsToProcess.length; i += BATCH_SIZE) {
      batches.push(rowsToProcess.slice(i, i + BATCH_SIZE));
    }

    const totalBatches = batches.length;

    // Send start event
    sendEvent({
      type: 'start',
      totalBatches,
      totalRows: rowsToProcess.length,
    });

    let completedBatches = 0;
    let batchErrors = 0;

    // Process batches with concurrency control
    for (let i = 0; i < batches.length; i += concurrency) {
      const batchSlice = batches.slice(i, i + concurrency);

      const promises = batchSlice.map(async (batch, sliceIdx) => {
        const batchNum = i + sliceIdx + 1;
        try {
          const userContent = JSON.stringify(batch.map(item => ({
            index: item.rowIndex,
            id: item.id,
            originalName: item.originalName,
            resolvedName: item.resolvedName,
            isTemplateMissing: item.isTemplateMissing,
            notes: item.notes,
            destination: item.destination,
          })));

          const responseText = await callChatCompletions({
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            model: aiConfig.model,
            customUrl: aiConfig.customUrl,
            temperature: aiConfig.temperature,
            maxTokens: aiConfig.maxTokens,
            frequencyPenalty: aiConfig.frequencyPenalty,
            presencePenalty: aiConfig.presencePenalty,
            messages: [
              { role: 'system', content: finalSystemPrompt },
              { role: 'user', content: userContent }
            ]
          });

          const parsedBatchResults = cleanAndParseJsonArray(responseText);

          batch.forEach(item => {
            const match = parsedBatchResults.find(r => r.index === item.rowIndex);
            allResults.push({
              rowIndex: item.rowIndex,
              id: item.id,
              originalName: item.originalName,
              suggestedName: match ? match.suggestedName : (item.resolvedName || item.originalName),
              currentCourier: item.currentCourier,
              suggestedCourier: match ? match.suggestedCourier : item.currentCourier,
              courierReason: match ? match.courierReason : '',
              anomalies: match ? match.anomalies : [],
              isNewTemplate: item.isTemplateMissing,
            });
          });

          completedBatches++;
          sendEvent({
            type: 'progress',
            batch: completedBatches,
            totalBatches,
            phase: 'ai',
            message: `Elaborazione AI batch ${completedBatches}/${totalBatches}...`,
          });

        } catch (batchErr) {
          console.error(`Errore elaborazione batch AI #${batchNum}:`, batchErr);
          batchErrors++;
          completedBatches++;

          // Send batch-error event
          sendEvent({
            type: 'batch-error',
            batch: batchNum,
            message: batchErr.message,
          });

          // Add fallback results with error in anomalies
          batch.forEach(item => {
            allResults.push({
              rowIndex: item.rowIndex,
              id: item.id,
              originalName: item.originalName,
              suggestedName: item.resolvedName || item.originalName,
              currentCourier: item.currentCourier,
              suggestedCourier: item.currentCourier,
              courierReason: '',
              anomalies: [`Errore elaborazione AI batch: ${batchErr.message}`],
              isNewTemplate: item.isTemplateMissing,
            });
          });

          sendEvent({
            type: 'progress',
            batch: completedBatches,
            totalBatches,
            phase: 'ai',
            message: `Elaborazione AI batch ${completedBatches}/${totalBatches}...`,
          });
        }
      });

      await Promise.all(promises);
    }

    allResults.sort((a, b) => a.rowIndex - b.rowIndex);

    // Send final result
    sendEvent({
      type: 'result',
      processedRows: allResults,
      batchErrors,
    });

    sendEvent({ type: 'done' });

  } catch (err) {
    console.error('AI SSE Processing error:', err);
    sendEvent({ type: 'error', message: `Errore durante l'elaborazione AI: ${err.message}` });
    sendEvent({ type: 'done' });
  } finally {
    res.end();
  }
});

module.exports = router;

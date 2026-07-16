const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireWorkspace } = require('../lib/workspace');

const router = express.Router();
const CONFIG_PATH = path.join(__dirname, '../data/picking_config.json');
const DEFAULT_PICKING_URL = 'https://pick.iosonofra.click/api/import/auto';

function loadPickingConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
  } catch (error) {
    console.error('Errore lettura configurazione PickCSV:', error.message);
    return {};
  }
}

function loadPickingToken() {
  if (process.env.PICKING_AUTO_TOKEN) return process.env.PICKING_AUTO_TOKEN;
  return String(loadPickingConfig().token || '').trim();
}

function loadPickingUrl() {
  return String(process.env.PICKING_IMPORT_URL || loadPickingConfig().url || DEFAULT_PICKING_URL).trim();
}

function savePickingConfig({ token, url }) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token, url }, null, 2), 'utf8');
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.originalname && /\.xlsx$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Solo file .xlsx sono accettati'), false);
    }
  },
});

router.post('/upload', requireWorkspace, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File Excel mancante' });
  }
  const pickingToken = loadPickingToken();
  const pickingUrl = loadPickingUrl();
  if (!pickingToken) {
    return res.status(503).json({
      error: 'Token PickCSV non configurato nel backend (variabile PICKING_AUTO_TOKEN).',
    });
  }

  try {
    const form = new FormData();
    form.append('file', new Blob([req.file.buffer]), req.file.originalname);

    const response = await fetch(pickingUrl, {
      method: 'POST',
      body: form,
      headers: {
        Authorization: `Bearer ${pickingToken}`,
        'X-PickCSV-Computer-Name': `OrderEdit-${req.workspaceId.slice(0, 12)}`,
        'X-PickCSV-User-Name': `OrderEdit-${req.workspaceId.slice(0, 12)}`,
        'X-PickCSV-Client-Id': `OrderEdit-${req.workspaceId}`,
      },
      signal: AbortSignal.timeout(60_000),
    });

    const text = await response.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text || `Risposta non valida da PickCSV (${response.status})` };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: payload.error || payload.message || 'Upload picking non riuscito',
      });
    }

    return res.json(payload);
  } catch (error) {
    console.error('Picking upload error:', error.message);
    return res.status(502).json({ error: `Impossibile raggiungere PickCSV: ${error.message}` });
  }
});

router.get('/config', (req, res) => {
  const token = loadPickingToken();
  res.json({
    hasToken: Boolean(token),
    token: token ? '••••••••••••••••' : '',
    url: loadPickingUrl(),
  });
});

router.put('/config', (req, res) => {
  const current = loadPickingConfig();
  const incoming = String(req.body?.token || '').trim();
  const token = incoming && incoming !== '••••••••••••••••' ? incoming : String(current.token || '').trim();
  const url = String(req.body?.url || current.url || DEFAULT_PICKING_URL).trim();
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'L’URL PickCSV deve iniziare con http:// o https://' });
  }
  try {
    savePickingConfig({ token, url });
  } catch (error) {
    return res.status(500).json({ error: `Impossibile salvare la configurazione: ${error.message}` });
  }
  res.json({ status: 'ok', hasToken: Boolean(token), url });
});

module.exports = router;

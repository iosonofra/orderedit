const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const TEMPLATES_PATH = path.join(__dirname, '../data/templates.json');

// Helper: load templates from disk
function loadTemplates() {
  try {
    if (!fs.existsSync(TEMPLATES_PATH)) {
      fs.writeFileSync(TEMPLATES_PATH, '{}', 'utf8');
    }
    return JSON.parse(fs.readFileSync(TEMPLATES_PATH, 'utf8'));
  } catch {
    return {};
  }
}

// Helper: save templates to disk
function saveTemplates(templates) {
  fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2), 'utf8');
}

// GET /api/templates
router.get('/', (req, res) => {
  const templates = loadTemplates();
  const list = Object.entries(templates).map(([id, name]) => ({ id, name }));
  list.sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
  res.json({ templates: list });
});

// POST /api/templates
router.post('/', (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Campi "id" e "name" sono obbligatori' });
  }
  const templates = loadTemplates();
  const strId = String(id).trim();
  if (templates[strId] !== undefined) {
    return res.status(409).json({ error: `Template con ID ${strId} già presente` });
  }
  templates[strId] = String(name).trim();
  saveTemplates(templates);
  res.status(201).json({ id: strId, name: templates[strId] });
});

// PUT /api/templates/:id
router.put('/:id', (req, res) => {
  const strId = String(req.params.id).trim();
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Campo "name" è obbligatorio' });

  const templates = loadTemplates();
  if (templates[strId] === undefined) {
    return res.status(404).json({ error: `Template con ID ${strId} non trovato` });
  }
  templates[strId] = String(name).trim();
  saveTemplates(templates);
  res.json({ id: strId, name: templates[strId] });
});

// DELETE /api/templates/:id
router.delete('/:id', (req, res) => {
  const strId = String(req.params.id).trim();
  const templates = loadTemplates();
  if (templates[strId] === undefined) {
    return res.status(404).json({ error: `Template con ID ${strId} non trovato` });
  }
  delete templates[strId];
  saveTemplates(templates);
  res.json({ message: 'Eliminato' });
});

// POST /api/templates/import
router.post('/import', (req, res) => {
  const { format, data, mode } = req.body;
  if (!format || !data) {
    return res.status(400).json({ error: 'Campi "format" e "data" sono obbligatori' });
  }

  let incoming = {};
  try {
    if (format === 'json') {
      const arr = JSON.parse(data);
      if (!Array.isArray(arr)) throw new Error('Il JSON deve essere un array');
      arr.forEach((item) => {
        if (item.id && item.name) incoming[String(item.id).trim()] = String(item.name).trim();
      });
    } else if (format === 'csv') {
      data.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        // Split on first comma, or fallback to tab or semicolon
        let splitIdx = trimmed.indexOf(',');
        if (splitIdx === -1) splitIdx = trimmed.indexOf('\t');
        if (splitIdx === -1) splitIdx = trimmed.indexOf(';');
        if (splitIdx === -1) return;
        
        const id = trimmed.slice(0, splitIdx).trim();
        const name = trimmed.slice(splitIdx + 1).trim();
        if (id && name) incoming[id] = name;
      });
    } else {
      return res.status(400).json({ error: 'Formato non supportato. Usa "csv" o "json"' });
    }
  } catch (err) {
    return res.status(400).json({ error: `Errore nel parsing dei dati: ${err.message}` });
  }

  const existing = mode === 'replace' ? {} : loadTemplates();
  let imported = 0;
  let skipped = 0;

  Object.entries(incoming).forEach(([id, name]) => {
    if (mode !== 'replace' && existing[id] !== undefined && existing[id] === name) {
      skipped++;
    } else {
      existing[id] = name;
      imported++;
    }
  });

  saveTemplates(existing);
  res.json({ imported, skipped, total: Object.keys(incoming).length });
});

// GET /api/templates/export/:format
router.get('/export/:format', (req, res) => {
  const format = req.params.format;
  const templates = loadTemplates();
  const entries = Object.entries(templates);

  if (format === 'json') {
    const jsonArr = entries.map(([id, name]) => ({ id, name }));
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="templates_export.json"');
    res.send(JSON.stringify(jsonArr, null, 2));
  } else if (format === 'csv') {
    const csvLines = entries.map(([id, name]) => `${id},${name}`);
    const csv = 'ID,Nome\n' + csvLines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="templates_export.csv"');
    res.send(csv);
  } else {
    res.status(400).json({ error: 'Formato non supportato. Usa "csv" o "json".' });
  }
});

module.exports = router;
module.exports.loadTemplates = loadTemplates;

const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const fileDir = path.join(__dirname, '..', 'data');
const filePath = path.join(fileDir, 'couriers.json');

const DEFAULT_PRESETS = ['Corriere Express', 'GLS', 'BRT'];

function loadCouriers() {
  try {
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_PRESETS, null, 2), 'utf8');
      return DEFAULT_PRESETS;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_PRESETS;
  } catch (e) {
    console.error('Error reading couriers file:', e);
    return DEFAULT_PRESETS;
  }
}

function saveCouriers(presets) {
  try {
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    // sanitize
    const sanitized = Array.isArray(presets)
      ? presets.map(v => String(v ?? '').trim()).filter((v, i, arr) => v && arr.indexOf(v) === i)
      : DEFAULT_PRESETS;
    fs.writeFileSync(filePath, JSON.stringify(sanitized, null, 2), 'utf8');
    return sanitized;
  } catch (e) {
    console.error('Error writing couriers file:', e);
    return null;
  }
}

router.get('/', (req, res) => {
  const presets = loadCouriers();
  res.json({ presets });
});

router.post('/', (req, res) => {
  const { presets } = req.body;
  if (!presets || !Array.isArray(presets)) {
    return res.status(400).json({ error: 'La richiesta deve contenere un array "presets"' });
  }
  const saved = saveCouriers(presets);
  if (!saved) {
    return res.status(500).json({ error: 'Impossibile salvare i preset sul server' });
  }
  res.json({ presets: saved, message: 'Preset salvati con successo sul server' });
});

module.exports = router;

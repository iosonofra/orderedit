const express = require('express')
const path = require('path')
const fs = require('fs')

const router = express.Router()
const fileDir = path.join(__dirname, '..', 'data')
const filePath = path.join(fileDir, 'notes.json')
const DEFAULT_PRESETS = ['Chiamare prima della consegna', 'Consegna al piano strada']

function load() {
  try {
    if (!fs.existsSync(filePath)) { fs.writeFileSync(filePath, JSON.stringify(DEFAULT_PRESETS, null, 2)); return DEFAULT_PRESETS }
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return Array.isArray(parsed) ? parsed : DEFAULT_PRESETS
  } catch { return DEFAULT_PRESETS }
}

router.get('/', (req, res) => res.json({ presets: load() }))
router.post('/', (req, res) => {
  if (!Array.isArray(req.body?.presets)) return res.status(400).json({ error: 'La richiesta deve contenere un array "presets"' })
  const presets = req.body.presets.map(v => String(v ?? '').trim()).filter((v, i, a) => v && a.indexOf(v) === i)
  try { fs.writeFileSync(filePath, JSON.stringify(presets, null, 2)); res.json({ presets, message: 'Preset note salvati con successo sul server' }) }
  catch { res.status(500).json({ error: 'Impossibile salvare i preset note sul server' }) }
})

module.exports = router

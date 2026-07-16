const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.ORDEREDIT_DATA_DIR
  ? path.resolve(process.env.ORDEREDIT_DATA_DIR)
  : path.join(__dirname, '..', 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'prestashop_config.json');
const MASKED_KEY = '••••••••••••••••';

function normalizeBaseUrl(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '').replace(/\/api$/i, '');
  if (!/^https?:\/\//i.test(raw)) throw new Error('L’URL PrestaShop deve iniziare con http:// o https://');
  const parsed = new URL(raw);
  if (parsed.username || parsed.password) throw new Error('Non inserire credenziali direttamente nell’URL PrestaShop');
  return parsed.toString().replace(/\/$/, '');
}

function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return { baseUrl: '', apiKey: '', languageId: 1 };
    const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
    return {
      baseUrl: String(parsed.baseUrl || '').trim(),
      apiKey: String(parsed.apiKey || '').trim(),
      languageId: Math.max(1, Number.parseInt(parsed.languageId, 10) || 1),
    };
  } catch (error) {
    console.error('Errore lettura configurazione PrestaShop:', error.message);
    return { baseUrl: '', apiKey: '', languageId: 1 };
  }
}

function publicConfig() {
  const config = loadConfig();
  return {
    baseUrl: config.baseUrl,
    apiKey: config.apiKey ? MASKED_KEY : '',
    hasApiKey: Boolean(config.apiKey),
    languageId: config.languageId,
  };
}

function saveConfig(input) {
  const current = loadConfig();
  const incomingKey = String(input?.apiKey || '').trim();
  const baseUrl = normalizeBaseUrl(input?.baseUrl);
  const baseChanged = Boolean(current.baseUrl) && normalizeBaseUrl(current.baseUrl) !== baseUrl;
  const canReuseKey = incomingKey === MASKED_KEY && !baseChanged;
  const next = {
    baseUrl,
    apiKey: incomingKey && incomingKey !== MASKED_KEY ? incomingKey : (canReuseKey ? current.apiKey : ''),
    languageId: Math.max(1, Number.parseInt(input?.languageId, 10) || 1),
  };
  if (!next.apiKey) {
    throw new Error(baseChanged
      ? 'Inserisci nuovamente la chiave Webservice quando cambi URL negozio'
      : 'Chiave Webservice PrestaShop mancante');
  }
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2), 'utf8');
  return publicConfig();
}

function normalizeList(payload, pluralKey, singularKey) {
  const root = payload?.[pluralKey];
  if (Array.isArray(root)) return root;
  if (root && Array.isArray(root[singularKey])) return root[singularKey];
  if (root && root[singularKey]) return [root[singularKey]];
  if (payload?.[singularKey]) return [payload[singularKey]];
  return [];
}

function localizedText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const languages = Array.isArray(value) ? value : value.language;
  const first = Array.isArray(languages) ? languages[0] : languages;
  if (first == null) return '';
  if (typeof first === 'string' || typeof first === 'number') return String(first);
  return String(first.value ?? first._ ?? first.content ?? '');
}

async function requestResource(resource, params = {}, configOverride = null) {
  const config = configOverride || loadConfig();
  if (!config.baseUrl || !config.apiKey) throw new Error('Configura URL e chiave Webservice PrestaShop');

  const url = new URL(`${normalizeBaseUrl(config.baseUrl)}/api/${String(resource).replace(/^\/+/, '')}`);
  const query = { output_format: 'JSON', language: config.languageId, ...params };
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    method: 'GET',
    redirect: 'error',
    headers: {
      Accept: 'application/json',
      'Output-Format': 'JSON',
      Authorization: `Basic ${Buffer.from(`${config.apiKey}:`).toString('base64')}`,
    },
    signal: AbortSignal.timeout(25_000),
  });

  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : {}; } catch {}
  if (!response.ok) {
    const message = payload?.errors?.[0]?.message || payload?.error || payload?.message || text || `HTTP ${response.status}`;
    const error = new Error(`PrestaShop: ${String(message).slice(0, 500)}`);
    error.status = response.status;
    throw error;
  }
  if (!payload) throw new Error('PrestaShop ha restituito una risposta non JSON');
  return payload;
}

async function fetchResourceMap(resource, pluralKey, singularKey, ids, fields) {
  const uniqueIds = [...new Set((ids || []).map(String).filter((id) => /^\d+$/.test(id)))];
  if (uniqueIds.length === 0) return new Map();
  const payload = await requestResource(resource, {
    display: `[${fields.join(',')}]`,
    'filter[id]': `[${uniqueIds.join('|')}]`,
    limit: uniqueIds.length,
  });
  return new Map(normalizeList(payload, pluralKey, singularKey).map((item) => [String(item.id), item]));
}

function orderRows(order) {
  const rows = order?.associations?.order_rows;
  if (Array.isArray(rows)) return rows;
  if (Array.isArray(rows?.order_row)) return rows.order_row;
  if (rows?.order_row) return [rows.order_row];
  return [];
}

module.exports = {
  MASKED_KEY,
  fetchResourceMap,
  loadConfig,
  localizedText,
  normalizeBaseUrl,
  normalizeList,
  orderRows,
  publicConfig,
  requestResource,
  saveConfig,
};

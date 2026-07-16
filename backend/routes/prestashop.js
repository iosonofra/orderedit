const express = require('express');
const { requireWorkspace } = require('../lib/workspace');
const {
  fetchResourceMap,
  localizedText,
  normalizeList,
  orderRows,
  publicConfig,
  requestResource,
  saveConfig,
} = require('../services/prestashop-client');
const { createPrestashopWorkbookBuffer, exportFilename } = require('../services/prestashop-workbook');

const router = express.Router();
router.use(requireWorkspace);

function positiveInt(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

function isoDate(value) {
  const raw = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : '';
}

function customerLabel(customer) {
  if (!customer) return '';
  const name = `${customer.firstname || ''} ${customer.lastname || ''}`.trim();
  return name || String(customer.email || '');
}

async function loadOrderRelations(orders) {
  const [customers, carriers] = await Promise.all([
    fetchResourceMap('customers', 'customers', 'customer', orders.map((item) => item.id_customer), ['id', 'firstname', 'lastname', 'email']),
    fetchResourceMap('carriers', 'carriers', 'carrier', orders.map((item) => item.id_carrier), ['id', 'name']),
  ]);
  return { customers, carriers };
}

async function loadOrderProducts(orders) {
  const orderIds = [...new Set(orders.map((item) => String(item.id)).filter((id) => /^\d+$/.test(id)))];
  const productsByOrder = new Map(orderIds.map((id) => [id, []]));
  if (orderIds.length === 0) return productsByOrder;
  const payload = await requestResource('order_details', {
    display: '[id_order,product_name,product_quantity,product_reference]',
    'filter[id_order]': `[${orderIds.join('|')}]`,
    limit: Math.min(2000, Math.max(100, orderIds.length * 20)),
  });
  normalizeList(payload, 'order_details', 'order_detail').forEach((detail) => {
    const orderId = String(detail.id_order || '');
    if (!productsByOrder.has(orderId)) return;
    productsByOrder.get(orderId).push({
      name: String(detail.product_name || ''),
      quantity: String(detail.product_quantity || ''),
      reference: String(detail.product_reference || ''),
    });
  });
  return productsByOrder;
}

router.get('/config', (req, res) => res.json(publicConfig()));

router.put('/config', (req, res) => {
  try {
    res.json({ status: 'ok', ...saveConfig(req.body) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/test', async (req, res) => {
  try {
    await requestResource('orders', { display: '[id]', limit: 1 });
    res.json({ status: 'ok', apiAvailable: true });
  } catch (error) {
    res.status(error.status === 401 || error.status === 403 ? error.status : 502).json({ error: error.message });
  }
});

router.get('/states', async (req, res) => {
  try {
    const payload = await requestResource('order_states', { display: '[id,name,color]', limit: 200 });
    const states = normalizeList(payload, 'order_states', 'order_state').map((state) => ({
      id: String(state.id),
      name: localizedText(state.name) || `Stato ${state.id}`,
      color: /^#[0-9a-f]{6}$/i.test(String(state.color || '')) ? state.color : '#64748b',
    }));
    res.json({ states });
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

router.get('/orders', async (req, res) => {
  const page = positiveInt(req.query.page, 1, 100000);
  const pageSize = positiveInt(req.query.pageSize, 30, 100);
  const search = String(req.query.search || '').trim().slice(0, 64);
  const state = String(req.query.state || '').trim();
  const dateFrom = isoDate(req.query.dateFrom);
  const dateTo = isoDate(req.query.dateTo);
  const params = {
    display: '[id,reference,current_state,id_customer,id_carrier,date_add,total_paid]',
    sort: '[date_add_DESC]',
    date: 1,
    limit: `${(page - 1) * pageSize},${pageSize + 1}`,
  };
  if (/^\d+$/.test(state)) params['filter[current_state]'] = `[${state}]`;
  if (search) params[/^\d+$/.test(search) ? 'filter[id]' : 'filter[reference]'] = /^\d+$/.test(search) ? `[${search}]` : `%[${search}]%`;
  if (dateFrom || dateTo) params['filter[date_add]'] = `[${dateFrom || '1970-01-01'} 00:00:00,${dateTo || '2099-12-31'} 23:59:59]`;

  try {
    const payload = await requestResource('orders', params);
    const allOrders = normalizeList(payload, 'orders', 'order');
    const hasMore = allOrders.length > pageSize;
    const orders = allOrders.slice(0, pageSize);
    const [{ customers, carriers }, productsByOrder] = await Promise.all([
      loadOrderRelations(orders),
      loadOrderProducts(orders),
    ]);
    res.json({
      page,
      pageSize,
      hasMore,
      orders: orders.map((order) => ({
        id: String(order.id),
        reference: String(order.reference || ''),
        stateId: String(order.current_state || ''),
        customer: customerLabel(customers.get(String(order.id_customer))),
        products: productsByOrder.get(String(order.id)) || [],
        carrier: String(carriers.get(String(order.id_carrier))?.name || ''),
        dateAdd: String(order.date_add || ''),
        totalPaid: String(order.total_paid || ''),
      })),
    });
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

router.post('/workbook', async (req, res) => {
  const orderIds = [...new Set((Array.isArray(req.body?.orderIds) ? req.body.orderIds : []).map(String).filter((id) => /^\d+$/.test(id)))];
  if (orderIds.length === 0) return res.status(400).json({ error: 'Seleziona almeno un ordine' });
  if (orderIds.length > 100) return res.status(400).json({ error: 'Puoi importare al massimo 100 ordini per volta' });

  try {
    const orders = [];
    for (let index = 0; index < orderIds.length; index += 5) {
      const chunk = orderIds.slice(index, index + 5);
      const results = await Promise.all(chunk.map(async (id) => {
        const payload = await requestResource(`orders/${id}`);
        return normalizeList(payload, 'orders', 'order')[0] || payload.order;
      }));
      orders.push(...results.filter(Boolean));
    }
    if (orders.length === 0) return res.status(404).json({ error: 'Nessun ordine trovato' });

    const { customers, carriers } = await loadOrderRelations(orders);
    const rows = [];
    orders.forEach((order) => {
      const customer = customerLabel(customers.get(String(order.id_customer)));
      const carrier = String(carriers.get(String(order.id_carrier))?.name || '');
      const details = orderRows(order);
      (details.length > 0 ? details : [{}]).forEach((detail) => {
        rows.push({
          reference: order.reference,
          customer,
          productName: detail.product_name,
          quantity: detail.product_quantity,
          ean: detail.product_ean13,
          carrier,
          productId: detail.product_id,
        });
      });
    });

    const filename = exportFilename();
    const buffer = await createPrestashopWorkbookBuffer(rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-OrderEdit-Filename', filename);
    res.setHeader('X-OrderEdit-Orders', String(orders.length));
    res.setHeader('X-OrderEdit-Rows', String(rows.length));
    res.send(buffer);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

module.exports = router;

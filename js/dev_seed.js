// js/dev_seed.js
// Módulo para generar datos de prueba en localStorage

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randRUC() {
  // 11 dígitos
  let s = '';
  for (let i = 0; i < 11; i++) s += randInt(0, 9);
  return s;
}

function randName() {
  const names = ['Inversiones Globales S.A.', 'Tech Solutions Inc.', 'Constructora ABC', 'Restaurante El Faro', 'Distribuciones Lima'];
  return names[randInt(0, names.length - 1)];
}

function randAddress() {
  const streets = ['Av. Las Palmas 123', 'Jr. Amazonas 456', 'Calle Falsa 789', 'Av. Central 101'];
  return streets[randInt(0, streets.length - 1)];
}

function generateClient(i) {
  const razonSocial = randName() + (i ? ` ${i}` : '');
  return {
    id: `client_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
    ruc: randRUC(),
    razonSocial,
    direccion: randAddress(),
    contacto1: { nombre: 'Contacto ' + (i + 1), celular: `9${randInt(10000000,99999999)}`, email: `contacto${i+1}@example.com` },
    contacto2: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function generateInvoice(client, idx, status, issueOffsetDays = 0, dueOffsetDays = 30) {
  const issueDate = new Date();
  issueDate.setDate(issueDate.getDate() + issueOffsetDays);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueOffsetDays);

  return {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
    clientId: client.id,
    clientName: client.razonSocial,
    clientRuc: client.ruc,
    invoiceNumber: String(100 + idx),
    amount: Number((Math.random() * 5000 + 100).toFixed(2)),
    currency: 'PEN',
    issueDate: issueDate.toISOString().slice(0,10),
    dueDate: dueDate.toISOString().slice(0,10),
    status: status,
    followups: [],
    createdAt: new Date().toISOString()
  };
}

export function seedDemoData(options = {}) {
  const { clients = 5, invoices = 20, overdueRatio = 0.15, paidRatio = 0.35 } = options;

  const clientsArr = [];
  for (let i = 0; i < clients; i++) {
    clientsArr.push(generateClient(i));
  }

  const invoicesArr = [];
  for (let i = 0; i < invoices; i++) {
    const client = clientsArr[randInt(0, clientsArr.length - 1)];

    // decidir status
    const r = Math.random();
    let status = 'PENDIENTE';
    if (r < paidRatio) status = 'PAGADA';
    else if (r < paidRatio + 0.1) status = 'CANCELADA';

    // decidir vencimiento: algunos vencidos
    const dueOffsetBase = randInt(1, 40);
    const isOverdue = Math.random() < overdueRatio && status === 'PENDIENTE';
    const dueOffsetDays = isOverdue ? -randInt(1, 15) : randInt(1, 40);

    const inv = generateInvoice(client, i, status, -randInt(0, 60), dueOffsetDays);
    invoicesArr.push(inv);
  }

  // Guardar en localStorage
  localStorage.setItem('awfacturas_clientes', JSON.stringify(clientsArr));
  localStorage.setItem('invoices_fx', JSON.stringify(invoicesArr));

  console.info(`Seeded ${clientsArr.length} clients and ${invoicesArr.length} invoices into localStorage.`);
  return { clients: clientsArr, invoices: invoicesArr };
}

// Helper for direct execution from console: import and call seedDemoData()
// Ejemplo en consola del navegador:
// import('/js/dev_seed.js').then(m => m.seedDemoData({clients:6,invoices:30}));

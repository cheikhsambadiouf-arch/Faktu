const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;

const DATA_DIR = './data';
const CLIENTS_FILE = `${DATA_DIR}/clients.json`;

app.use(express.json());
app.use(express.static('public'));

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(CLIENTS_FILE)) {
  fs.writeFileSync(CLIENTS_FILE, '[]');
}

function getClients() {
  try {
    return JSON.parse(
      fs.readFileSync(CLIENTS_FILE, 'utf8')
    );
  } catch (error) {
    return [];
  }
}

function saveClients(clients) {
  fs.writeFileSync(
    CLIENTS_FILE,
    JSON.stringify(clients, null, 2)
  );
}


// ==============================
// API CLIENTS
// ==============================

// Liste des clients
app.get('/api/clients', (req, res) => {
  res.json(getClients());
});


// Ajouter un client
app.post('/api/clients', (req, res) => {
  const clients = getClients();

  const nouveauClient = {
    id: Date.now(),
    nom: req.body.nom || '',
    telephone: req.body.telephone || '',
    email: req.body.email || '',
    adresse: req.body.adresse || '',
    createdAt: new Date().toISOString()
  };

  clients.push(nouveauClient);
  saveClients(clients);

  res.status(201).json(nouveauClient);
});


// Modifier un client
app.put('/api/clients/:id', (req, res) => {
  const clients = getClients();
  const id = Number(req.params.id);

  const index = clients.findIndex(client => client.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: 'Client introuvable'
    });
  }

  clients[index] = {
    ...clients[index],
    nom: req.body.nom ?? clients[index].nom,
    telephone: req.body.telephone ?? clients[index].telephone,
    email: req.body.email ?? clients[index].email,
    adresse: req.body.adresse ?? clients[index].adresse
  };

  saveClients(clients);

  res.json(clients[index]);
});


// Supprimer un client
app.delete('/api/clients/:id', (req, res) => {
  const clients = getClients();
  const id = Number(req.params.id);

  const nouveauxClients = clients.filter(
    client => client.id !== id
  );

  if (nouveauxClients.length === clients.length) {
    return res.status(404).json({
      error: 'Client introuvable'
    });
  }

  saveClients(nouveauxClients);

  res.json({
    success: true
  });
});


// ==============================
// SERVEUR
// ==============================

app.listen(PORT, () => {
  console.log(`Faktu démarré sur http://localhost:${PORT}`);
});

/* =========================================
   API FACTURES
   ========================================= */

const FACTURES_FILE = `${DATA_DIR}/factures.json`;

if (!fs.existsSync(FACTURES_FILE)) {
  fs.writeFileSync(FACTURES_FILE, '[]');
}

function getFactures() {
  try {
    return JSON.parse(
      fs.readFileSync(FACTURES_FILE, 'utf8')
    );
  } catch (error) {
    return [];
  }
}

function saveFactures(factures) {
  fs.writeFileSync(
    FACTURES_FILE,
    JSON.stringify(factures, null, 2)
  );
}

// Liste des factures
app.get('/api/factures', (req, res) => {
  res.json(getFactures());
});

// Créer une facture
app.post('/api/factures', (req, res) => {
  const factures = getFactures();
  const clients = getClients();

  const clientId = req.body.clientId;
  const client = clients.find(
    c => String(c.id) === String(clientId)
  );

  if (!client) {
    return res.status(400).json({
      error: 'Client introuvable'
    });
  }

  const numero = `FAC-${new Date().getFullYear()}-${String(
    factures.length + 1
  ).padStart(4, '0')}`;

  const nouvelleFacture = {
    id: Date.now(),
    numero,
    clientId: client.id,
    clientNom: client.nom,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    objet: req.body.objet || '',
    montant: Number(req.body.montant) || 0,
    statut: req.body.statut || 'Brouillon',
    createdAt: new Date().toISOString()
  };

  factures.push(nouvelleFacture);
  saveFactures(factures);

  res.status(201).json(nouvelleFacture);
});

// Modifier une facture
app.put('/api/factures/:id', (req, res) => {
  const factures = getFactures();
  const id = Number(req.params.id);

  const index = factures.findIndex(
    facture => facture.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: 'Facture introuvable'
    });
  }

  factures[index] = {
    ...factures[index],
    ...req.body,
    montant: Number(req.body.montant ?? factures[index].montant)
  };

  saveFactures(factures);

  res.json(factures[index]);
});

// Supprimer une facture
app.delete('/api/factures/:id', (req, res) => {
  const factures = getFactures();
  const id = Number(req.params.id);

  const nouvellesFactures = factures.filter(
    facture => facture.id !== id
  );

  if (nouvellesFactures.length === factures.length) {
    return res.status(404).json({
      error: 'Facture introuvable'
    });
  }

  saveFactures(nouvellesFactures);

  res.json({
    success: true
  });
});


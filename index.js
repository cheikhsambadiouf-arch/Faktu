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



/* =========================================
   API PRODUITS
   ========================================= */

const PRODUITS_FILE = `${DATA_DIR}/produits.json`;

if (!fs.existsSync(PRODUITS_FILE)) {
  fs.writeFileSync(PRODUITS_FILE, '[]');
}

function getProduits() {
  try {
    return JSON.parse(
      fs.readFileSync(PRODUITS_FILE, 'utf8')
    );
  } catch (error) {
    return [];
  }
}

function saveProduits(produits) {
  fs.writeFileSync(
    PRODUITS_FILE,
    JSON.stringify(produits, null, 2)
  );
}

// Liste des produits
app.get('/api/produits', (req, res) => {
  res.json(getProduits());
});

// Ajouter un produit
app.post('/api/produits', (req, res) => {
  const produits = getProduits();

  const nom = String(req.body.nom || '').trim();

  if (!nom) {
    return res.status(400).json({
      error: 'Le nom du produit est obligatoire'
    });
  }

  const prix = Number(req.body.prix);

  if (!Number.isFinite(prix) || prix < 0) {
    return res.status(400).json({
      error: 'Le prix est invalide'
    });
  }

  const stock = Number(req.body.stock ?? 0);

  if (!Number.isFinite(stock) || stock < 0) {
    return res.status(400).json({
      error: 'Le stock est invalide'
    });
  }

  const nouveauProduit = {
    id: Date.now(),
    nom,
    description: String(req.body.description || ''),
    prix,
    stock,
    unite: String(req.body.unite || 'unité'),
    categorie: String(req.body.categorie || ''),
    photo: String(req.body.photo || ''),
    actif: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  produits.push(nouveauProduit);
  saveProduits(produits);

  res.status(201).json(nouveauProduit);
});

// Modifier un produit
app.put('/api/produits/:id', (req, res) => {
  const produits = getProduits();
  const id = Number(req.params.id);

  const index = produits.findIndex(
    produit => produit.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: 'Produit introuvable'
    });
  }

  const produit = produits[index];

  const prix = req.body.prix !== undefined
    ? Number(req.body.prix)
    : produit.prix;

  const stock = req.body.stock !== undefined
    ? Number(req.body.stock)
    : produit.stock;

  if (!Number.isFinite(prix) || prix < 0) {
    return res.status(400).json({
      error: 'Le prix est invalide'
    });
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return res.status(400).json({
      error: 'Le stock est invalide'
    });
  }

  produits[index] = {
    ...produit,
    nom: req.body.nom !== undefined
      ? String(req.body.nom).trim()
      : produit.nom,
    description: req.body.description !== undefined
      ? String(req.body.description)
      : produit.description,
    prix,
    stock,
    unite: req.body.unite !== undefined
      ? String(req.body.unite)
      : produit.unite,
    categorie: req.body.categorie !== undefined
      ? String(req.body.categorie)
      : produit.categorie,
    photo: req.body.photo !== undefined
      ? String(req.body.photo)
      : produit.photo,
    actif: req.body.actif !== undefined
      ? Boolean(req.body.actif)
      : produit.actif,
    updatedAt: new Date().toISOString()
  };

  saveProduits(produits);

  res.json(produits[index]);
});

// Désactiver / réactiver un produit
app.patch('/api/produits/:id/statut', (req, res) => {
  const produits = getProduits();
  const id = Number(req.params.id);

  const index = produits.findIndex(
    produit => produit.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: 'Produit introuvable'
    });
  }

  produits[index].actif = req.body.actif !== false;
  produits[index].updatedAt = new Date().toISOString();

  saveProduits(produits);

  res.json(produits[index]);
});

// Supprimer définitivement un produit
app.delete('/api/produits/:id', (req, res) => {
  const produits = getProduits();
  const id = Number(req.params.id);

  const nouveauxProduits = produits.filter(
    produit => produit.id !== id
  );

  if (nouveauxProduits.length === produits.length) {
    return res.status(404).json({
      error: 'Produit introuvable'
    });
  }

  saveProduits(nouveauxProduits);

  res.json({
    success: true
  });
});

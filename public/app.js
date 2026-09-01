document.addEventListener('DOMContentLoaded', () => {

  const main = document.querySelector('main');
  const navItems = document.querySelectorAll('nav > div');

navItems.forEach((item) => { console.log("NAVIGATION ACTIVE", item.textContent);
  item.addEventListener('click', () => {
    const texte = item.textContent.trim();
    if (texte.includes('Clients')) afficherClients();
    else if (texte.includes('Factures')) afficherFactures();
    else if (texte.includes('Accueil')) location.reload();
  });
});
    const nouveauClientAccueil = document.getElementById("nouveauClientAccueil");
    if (nouveauClientAccueil) {
        nouveauClientAccueil.addEventListener("click", () => afficherFormulaire());
    }

  window.afficherClients = async function afficherClients() {
    const response = await fetch('/api/clients');
    const clients = await response.json();
    const totalClients = document.getElementById("totalClients");
    if (totalClients) totalClients.textContent = clients.length;

    document.querySelector('main').innerHTML = `
      <section class="clients-page">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:25px;">
          <div>
            <h1>👥 Clients</h1>
            <p>Gérez facilement vos clients.</p>
          </div>

          <button id="nouveauClient"
            style="padding:14px 18px;border:0;border-radius:12px;background:#2563eb;color:white;font-weight:bold;">
            + Nouveau client
          </button>
        </div>

        <input
          id="rechercheClient"
          type="search"
          placeholder="🔎 Rechercher un client..."
          style="width:100%;box-sizing:border-box;padding:15px;border:1px solid #ddd;border-radius:12px;margin-bottom:20px;"
        >

        <div id="listeClients"></div>
      </section>
    `;

    afficherListe(clients);

    document
      .getElementById('nouveauClient')
      .addEventListener('click', () => afficherFormulaire());

    document
      .getElementById('rechercheClient')
      .addEventListener('input', (event) => {
        const recherche = event.target.value.toLowerCase();

        const resultat = clients.filter(client =>
          `${client.nom} ${client.telephone} ${client.email}`
            .toLowerCase()
            .includes(recherche)
        );

        afficherListe(resultat);
      });
  }

  function afficherListe(clients) {
    const liste = document.getElementById('listeClients');

    if (!clients.length) {
      liste.innerHTML = `
        <div style="background:white;padding:30px;border-radius:18px;text-align:center;">
          <div style="font-size:50px;">👥</div>
          <h2>Aucun client</h2>
          <p>Commencez par ajouter votre premier client.</p>
        </div>
      `;
      return;
    }

    liste.innerHTML = clients.map(client => `
      <div style="background:white;padding:20px;border-radius:18px;margin-bottom:15px;box-shadow:0 3px 12px rgba(0,0,0,.06);">
        <h2 style="margin:0 0 8px;">👤 ${client.nom || 'Sans nom'}</h2>
        <p>📞 ${client.telephone || '—'}</p>
        <p>✉️ ${client.email || '—'}</p>
        <p>📍 ${client.adresse || '—'}</p>

        <div style="display:flex;gap:10px;margin-top:15px;">
          <button onclick="window.modifierClient(${client.id})"
            style="padding:10px 15px;border:0;border-radius:10px;background:#e8f0ff;">
            ✏️ Modifier
          </button>

          <button onclick="supprimerClient(${client.id})"
            style="padding:10px 15px;border:0;border-radius:10px;background:#ffe8e8;color:#c00;">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    `).join('');
  }

  function afficherFormulaire(client = null) {
    document.querySelector('main').innerHTML = `
      <section>
        <h1>${client ? '✏️ Modifier le client' : '👤 Nouveau client'}</h1>
        <p>Renseignez les informations du client.</p>

        <form id="clientForm"
          style="background:white;padding:25px;border-radius:18px;max-width:600px;">

          <label>Nom complet</label>
          <input id="nom" required
            value="${client?.nom || ''}"
            placeholder="Ex : Jean Dupont"
            style="width:100%;box-sizing:border-box;padding:14px;margin:8px 0 18px;border:1px solid #ddd;border-radius:10px;">

          <label>Téléphone</label>
          <input id="telephone"
            value="${client?.telephone || ''}"
            placeholder="Ex : 77 123 45 67"
            style="width:100%;box-sizing:border-box;padding:14px;margin:8px 0 18px;border:1px solid #ddd;border-radius:10px;">

          <label>Email</label>
          <input id="email" type="email"
            value="${client?.email || ''}"
            placeholder="Ex : client@email.com"
            style="width:100%;box-sizing:border-box;padding:14px;margin:8px 0 18px;border:1px solid #ddd;border-radius:10px;">

          <label>Adresse</label>
          <input id="adresse"
            value="${client?.adresse || ''}"
            placeholder="Adresse du client"
            style="width:100%;box-sizing:border-box;padding:14px;margin:8px 0 25px;border:1px solid #ddd;border-radius:10px;">

          <button type="submit"
            style="padding:14px 20px;border:0;border-radius:10px;background:#2563eb;color:white;font-weight:bold;">
            💾 ${client ? 'Enregistrer les modifications' : 'Enregistrer le client'}
          </button>

          <button type="button" id="annuler"
            style="padding:14px 20px;border:0;border-radius:10px;margin-left:8px;">
            Annuler
          </button>
        </form>
      </section>
    `;

    document.getElementById('annuler').onclick = afficherClients;

    document.getElementById('clientForm').onsubmit = async (event) => {
      event.preventDefault();

      const donnees = {
        nom: document.getElementById('nom').value,
        telephone: document.getElementById('telephone').value,
        email: document.getElementById('email').value,
        adresse: document.getElementById('adresse').value
      };

      const url = client
        ? `/api/clients/${client.id}`
        : '/api/clients';

      const method = client ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(donnees)
      });

      afficherClients();
    };
  }

  window.modifierClient = async (id) => {
    const response = await fetch('/api/clients');
    const clients = await response.json();

    const client = clients.find(c => String(c.id) === String(id));

    if (client) {
      afficherFormulaire(client);
    }
  };

  window.supprimerClient = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce client ?')) {
      return;
    }

    await fetch(`/api/clients/${id}`, {
      method: 'DELETE'
    });

    afficherClients();
  };

});
async function actualiserCompteurClients() {
    const compteur = document.getElementById("totalClients");

    if (!compteur) return;

    try {
        const response = await fetch("/api/clients");
        const clients = await response.json();

        compteur.textContent = clients.length;
    } catch (erreur) {
        console.error("Erreur compteur clients :", erreur);
    }
}

actualiserCompteurClients();

async function actualiserCompteurClients() {
    const compteur = document.getElementById("totalClients");

    if (!compteur) return;

    try {
        const response = await fetch("/api/clients");
        const clients = await response.json();
        compteur.textContent = clients.length;
    } catch (erreur) {
        console.error("Erreur compteur clients :", erreur);
    }
}

actualiserCompteurClients();

async function actualiserCompteurFactures() {
    const compteur = document.getElementById("totalFactures");

    if (!compteur) return;

    try {
        const response = await fetch("/api/factures");
        const factures = await response.json();
        compteur.textContent = factures.length;
    } catch (erreur) {
        console.error("Erreur compteur factures :", erreur);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    actualiserCompteurFactures();
});

window.afficherFactures = async function() {
    const response = await fetch("/api/factures");
    const factures = await response.json();

    document.querySelector('main').innerHTML = `
        <section class="factures-page">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:25px;">
                <div>
                    <h1>🧾 Factures</h1>
                    <p>Gérez facilement vos factures.</p>
                </div>

                <button
                    id="nouvelleFacture"
                    style="padding:14px 18px;border:0;border-radius:12px;background:#2563eb;color:white;font-weight:bold;">
                    + Nouvelle facture
                </button>
            </div>

            <input
                id="rechercheFacture"
                type="search"
                placeholder="🔎 Rechercher une facture..."
                style="width:100%;box-sizing:border-box;padding:16px;border:1px solid #ddd;border-radius:14px;font-size:16px;margin-bottom:20px;"
            >

            <div id="listeFactures"></div>
        </section>
    `;

    const liste = document.getElementById("listeFactures");

    function afficherListeFactures(texte = "") {
        const recherche = texte.toLowerCase().trim();

        const resultats = factures.filter(facture =>
            String(facture.numero || "").toLowerCase().includes(recherche) ||
            String(facture.clientNom || "").toLowerCase().includes(recherche) ||
            String(facture.objet || "").toLowerCase().includes(recherche) ||
            String(facture.statut || "").toLowerCase().includes(recherche)
        );

        if (resultats.length === 0) {
            liste.innerHTML = `
                <div style="background:white;border-radius:18px;padding:30px;text-align:center;">
                    <div style="font-size:45px;">🧾</div>
                    <h3>Aucune facture trouvée</h3>
                    <p>Les nouvelles factures apparaîtront ici.</p>
                </div>
            `;
            return;
        }

        liste.innerHTML = resultats.map(facture => `
            <div style="background:white;border-radius:18px;padding:20px;margin-bottom:15px;box-shadow:0 4px 15px rgba(0,0,0,.06);">

                <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div>
                        <h2 style="margin:0 0 8px;">
                            ${facture.numero || "Sans numéro"}
                        </h2>

                        <div style="font-size:17px;font-weight:bold;">
                            👤 ${facture.clientNom || "Client inconnu"}
                        </div>

                        <div style="margin-top:8px;">
                            📅 ${facture.date || ""}
                        </div>

                        <div style="margin-top:8px;">
                            📦 ${facture.objet || "Aucun objet"}
                        </div>
                    </div>

                    <div style="text-align:right;">
                        <div style="font-size:22px;font-weight:bold;">
                            ${Number(facture.montant || 0).toLocaleString("fr-FR")} FCFA
                        </div>

                        <span style="
                            display:inline-block;
                            margin-top:10px;
                            padding:7px 12px;
                            border-radius:20px;
                            background:#eef2ff;
                            color:#2563eb;
                            font-weight:bold;">
                            ${facture.statut || "Brouillon"}
                        </span>
                    </div>
                </div>

                <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;">
                    <button
                        onclick="voirFacture(${facture.id})"
                        style="padding:10px 15px;border:0;border-radius:10px;background:#e8f0ff;">
                        👁️ Voir
                    </button>

                    <button
                        onclick="modifierFacture(${facture.id})"
                        style="padding:10px 15px;border:0;border-radius:10px;background:#fff4d6;">
                        ✏️ Modifier
                    </button>

                    <button
                        onclick="supprimerFacture(${facture.id})"
                        style="padding:10px 15px;border:0;border-radius:10px;background:#ffe5e5;color:#c00;">
                        🗑️ Supprimer
                    </button>
                </div>

            </div>
        `).join("");
    }

    afficherListeFactures();

    document.getElementById("rechercheFacture").addEventListener("input", e => {
        afficherListeFactures(e.target.value);
    });

    document.getElementById("nouvelleFacture").addEventListener("click", () => {
        afficherFormulaireFacture();
    });
};

window.voirFacture = async function(id) {
    try {
        const response = await fetch("/api/factures");
        const factures = await response.json();

        const facture = factures.find(f => String(f.id) === String(id));

        if (!facture) {
            alert("❌ Facture introuvable.");
            return;
        }

        const main = document.querySelector("main");

        main.innerHTML = `
            <section style="padding:30px;max-width:800px;margin:auto;">
                
                <button
                    onclick="afficherFactures()"
                    style="
                        padding:12px 18px;
                        border:0;
                        border-radius:10px;
                        background:#eef2ff;
                        font-weight:bold;
                        margin-bottom:20px;
                    ">
                    ← Retour aux factures
                </button>

                <div style="
                    background:white;
                    padding:30px;
                    border-radius:20px;
                    box-shadow:0 4px 20px rgba(0,0,0,.08);
                ">

                    <h1 style="margin-top:0;">
                        🧾 ${facture.numero}
                    </h1>

                    <hr>

                    <p><strong>👤 Client</strong></p>
                    <p>${facture.clientId}</p>

                    <p><strong>📅 Date</strong></p>
                    <p>${facture.date}</p>

                    <p><strong>📦 Objet</strong></p>
                    <p>${facture.objet}</p>

                    <p><strong>💰 Montant</strong></p>
                    <p style="font-size:28px;font-weight:bold;">
                        ${Number(facture.montant).toLocaleString("fr-FR")} FCFA
                    </p>

                    <p><strong>📌 Statut</strong></p>
                    <p>
                        <span style="
                            display:inline-block;
                            padding:8px 16px;
                            border-radius:20px;
                            background:#eef2ff;
                            color:#2563eb;
                            font-weight:bold;
                        ">
                            ${facture.statut}
                        </span>
                    </p>

                    <div style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:30px;
                    ">

                        <button
                            onclick="window.print()"
                            style="
                                padding:14px 20px;
                                border:0;
                                border-radius:10px;
                                background:#2563eb;
                                color:white;
                                font-weight:bold;
                            ">
                            🖨️ Imprimer
                        </button>

                        <button
                            onclick="modifierFacture(${facture.id})"
                            style="
                                padding:14px 20px;
                                border:0;
                                border-radius:10px;
                                background:#fff4d6;
                                font-weight:bold;
                            ">
                            ✏️ Modifier
                        </button>

                    </div>

                </div>
            </section>
        `;

    } catch (erreur) {
        console.error(erreur);
        alert("❌ Impossible d'afficher la facture.");
    }
};window.voirFacture = function(id) {
    alert("Affichage de la facture : " + id);
};

window.modifierFacture = function(id) {
    alert("Modification de la facture : " + id);
};

window.supprimerFacture = async function(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette facture ?")) return;

    const response = await fetch("/api/factures/" + id, {
        method: "DELETE"
    });

    if (response.ok) {
        alert("Facture supprimée.");
        afficherFactures();
    } else {
        alert("Impossible de supprimer la facture.");
    }
};

window.afficherFormulaireFacture = async function() {
    const main = document.querySelector("main");

    try {
        const response = await fetch("/api/clients");
        const clients = await response.json();

        main.innerHTML = `
            <section class="factures-page">
                <div style="display:flex;align-items:center;gap:15px;margin-bottom:25px;">
                    <button
                        onclick="afficherFactures()"
                        style="padding:10px 15px;border:0;border-radius:10px;background:#eef2ff;">
                        ← Retour
                    </button>

                    <div>
                        <h1>🧾 Nouvelle facture</h1>
                        <p>Créez une nouvelle facture.</p>
                    </div>
                </div>

                <form id="factureForm"
                    style="background:white;padding:25px;border-radius:18px;box-shadow:0 5px 20px rgba(0,0,0,.08);">

                    <label style="display:block;font-weight:bold;margin-bottom:8px;">
                        👤 Client
                    </label>

                    <select id="factureClient"
                        required
                        style="width:100%;box-sizing:border-box;padding:14px;border:1px solid #ddd;border-radius:12px;margin-bottom:20px;font-size:16px;">

                        <option value="">Sélectionner un client</option>

                        ${clients.map(client => `
                            <option value="${client.id}">
                                ${client.nom}
                            </option>
                        `).join("")}
                    </select>

                    <label style="display:block;font-weight:bold;margin-bottom:8px;">
                        📅 Date
                    </label>

                    <input
                        id="factureDate"
                        type="date"
                        value="${new Date().toISOString().slice(0,10)}"
                        required
                        style="width:100%;box-sizing:border-box;padding:14px;border:1px solid #ddd;border-radius:12px;margin-bottom:20px;font-size:16px;"
                    >

                    <label style="display:block;font-weight:bold;margin-bottom:8px;">
                        📦 Objet
                    </label>

                    <input
                        id="factureObjet"
                        type="text"
                        placeholder="Ex : Création d'un site web"
                        required
                        style="width:100%;box-sizing:border-box;padding:14px;border:1px solid #ddd;border-radius:12px;margin-bottom:20px;font-size:16px;"
                    >

                    <label style="display:block;font-weight:bold;margin-bottom:8px;">
                        💰 Montant (FCFA)
                    </label>

                    <input
                        id="factureMontant"
                        type="number"
                        min="0"
                        placeholder="Ex : 25000"
                        required
                        style="width:100%;box-sizing:border-box;padding:14px;border:1px solid #ddd;border-radius:12px;margin-bottom:20px;font-size:16px;"
                    >

                    <label style="display:block;font-weight:bold;margin-bottom:8px;">
                        📌 Statut
                    </label>

                    <select
                        id="factureStatut"
                        style="width:100%;box-sizing:border-box;padding:14px;border:1px solid #ddd;border-radius:12px;margin-bottom:25px;font-size:16px;">

                        <option value="Brouillon">Brouillon</option>
                        <option value="Envoyée">Envoyée</option>
                        <option value="Payée">Payée</option>
                        <option value="Annulée">Annulée</option>

                    </select>

                    <div style="display:flex;gap:10px;flex-wrap:wrap;">

                        <button
                            type="button"
                            onclick="afficherFactures()"
                            style="padding:14px 20px;border:0;border-radius:12px;background:#eee;font-weight:bold;">
                            Annuler
                        </button>

                        <button
                            type="submit"
                            style="padding:14px 20px;border:0;border-radius:12px;background:#2563eb;color:white;font-weight:bold;">
                            💾 Enregistrer la facture
                        </button>

                    </div>

                </form>
            </section>
        `;

        document.getElementById("factureForm").addEventListener("submit", async (event) => {
            event.preventDefault();

            const bouton = event.target.querySelector('button[type="submit"]');
            bouton.disabled = true;
            bouton.textContent = "⏳ Enregistrement...";

            const donnees = {
                clientId: document.getElementById("factureClient").value,
                date: document.getElementById("factureDate").value,
                objet: document.getElementById("factureObjet").value,
                montant: Number(document.getElementById("factureMontant").value),
                statut: document.getElementById("factureStatut").value
            };

            try {
                const response = await fetch("/api/factures", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(donnees)
                });

                const resultat = await response.json();

                if (!response.ok) {
                    throw new Error(resultat.error || "Erreur lors de la création");
                }

                alert("✅ Facture créée avec succès : " + resultat.numero);

                afficherFactures();

            } catch (erreur) {

                console.error(erreur);

                alert("❌ Impossible de créer la facture : " + erreur.message);

                bouton.disabled = false;
                bouton.textContent = "💾 Enregistrer la facture";
            }
        });

    } catch (erreur) {

        console.error(erreur);

        main.innerHTML = `
            <section style="padding:30px;">
                <h1>❌ Erreur</h1>
                <p>Impossible de récupérer les clients.</p>
                <button onclick="afficherFactures()">
                    ← Retour aux factures
                </button>
            </section>
        `;
    }
};


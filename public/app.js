document.addEventListener('DOMContentLoaded', () => {

  const main = document.querySelector('main');
  const navItems = document.querySelectorAll('nav > div');

navItems.forEach((item) => { console.log("NAVIGATION ACTIVE", item.textContent);
  item.addEventListener('click', () => {
    const texte = item.textContent.trim();
    if (texte.includes('Clients')) afficherClients();
    else if (texte.includes('Factures')) afficherFactures();
    else if (texte.includes('Accueil')) window.location.href = '/';
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
};

window.modifierFacture = async function(id) {
    try {
        const response = await fetch("/api/factures");
        const factures = await response.json();

        if (!response.ok) {
            throw new Error("Impossible de récupérer les factures");
        }

        const facture = factures.find(
            f => String(f.id) === String(id)
        );

        if (!facture) {
            alert("❌ Facture introuvable.");
            return;
        }

        const clientsResponse = await fetch("/api/clients");
        const clients = await clientsResponse.json();

        if (!clientsResponse.ok) {
            throw new Error("Impossible de récupérer les clients");
        }

        const main = document.querySelector("main");

        main.innerHTML = `
            <section style="padding:30px;max-width:800px;margin:auto;">

                <button
                    id="retourFactures"
                    type="button"
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

                    <h1>✏️ Modifier la facture</h1>

                    <form id="formModifierFacture">

                        <label><strong>👤 Client</strong></label>
                        <select id="editClient"
                            required
                            style="
                                width:100%;
                                box-sizing:border-box;
                                padding:14px;
                                margin:8px 0 20px;
                                border:1px solid #ddd;
                                border-radius:10px;
                            ">
                        </select>

                        <label><strong>📅 Date</strong></label>
                        <input
                            id="editDate"
                            type="date"
                            required
                            style="
                                width:100%;
                                box-sizing:border-box;
                                padding:14px;
                                margin:8px 0 20px;
                                border:1px solid #ddd;
                                border-radius:10px;
                            ">

                        <label><strong>📦 Objet</strong></label>
                        <input
                            id="editObjet"
                            type="text"
                            required
                            style="
                                width:100%;
                                box-sizing:border-box;
                                padding:14px;
                                margin:8px 0 20px;
                                border:1px solid #ddd;
                                border-radius:10px;
                            ">

                        <label><strong>💰 Montant (FCFA)</strong></label>
                        <input
                            id="editMontant"
                            type="number"
                            min="0"
                            required
                            style="
                                width:100%;
                                box-sizing:border-box;
                                padding:14px;
                                margin:8px 0 20px;
                                border:1px solid #ddd;
                                border-radius:10px;
                            ">

                        <label><strong>📌 Statut</strong></label>
                        <select
                            id="editStatut"
                            style="
                                width:100%;
                                box-sizing:border-box;
                                padding:14px;
                                margin:8px 0 25px;
                                border:1px solid #ddd;
                                border-radius:10px;
                            ">
                            <option value="Brouillon">Brouillon</option>
                            <option value="Envoyée">Envoyée</option>
                            <option value="Payée">Payée</option>
                            <option value="Annulée">Annulée</option>
                        </select>

                        <div style="
                            display:flex;
                            gap:10px;
                            flex-wrap:wrap;
                        ">

                            <button
                                id="annulerModification"
                                type="button"
                                style="
                                    padding:14px 20px;
                                    border:0;
                                    border-radius:10px;
                                    background:#eee;
                                    font-weight:bold;
                                ">
                                Annuler
                            </button>

                            <button
                                id="enregistrerModification"
                                type="submit"
                                style="
                                    padding:14px 20px;
                                    border:0;
                                    border-radius:10px;
                                    background:#2563eb;
                                    color:white;
                                    font-weight:bold;
                                ">
                                💾 Enregistrer les modifications
                            </button>

                        </div>

                    </form>
                </div>
            </section>
        `;

        const selectClient = document.getElementById("editClient");

        clients.forEach(client => {
            const option = document.createElement("option");
            option.value = client.id;
            option.textContent = client.nom;

            if (String(client.id) === String(facture.clientId)) {
                option.selected = true;
            }

            selectClient.appendChild(option);
        });

        document.getElementById("editDate").value =
            facture.date || "";

        document.getElementById("editObjet").value =
            facture.objet || "";

        document.getElementById("editMontant").value =
            Number(facture.montant || 0);

        document.getElementById("editStatut").value =
            facture.statut || "Brouillon";

        document.getElementById("retourFactures").onclick =
            () => afficherFactures();

        document.getElementById("annulerModification").onclick =
            () => afficherFactures();

        document.getElementById("formModifierFacture")
            .addEventListener("submit", async function(event) {

                event.preventDefault();

                const bouton =
                    document.getElementById("enregistrerModification");

                bouton.disabled = true;
                bouton.textContent = "⏳ Enregistrement...";

                const clientId =
                    document.getElementById("editClient").value;

                const clientSelectionne =
                    clients.find(
                        client => String(client.id) === String(clientId)
                    );

                const donnees = {
                    clientId: clientId,
                    clientNom: clientSelectionne
                        ? clientSelectionne.nom
                        : facture.clientNom,
                    date: document.getElementById("editDate").value,
                    objet: document.getElementById("editObjet").value,
                    montant: Number(
                        document.getElementById("editMontant").value
                    ),
                    statut: document.getElementById("editStatut").value
                };

                try {
                    const updateResponse = await fetch(
                        "/api/factures/" + id,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(donnees)
                        }
                    );

                    const resultat = await updateResponse.json();

                    if (!updateResponse.ok) {
                        throw new Error(
                            resultat.error ||
                            "Erreur lors de la modification"
                        );
                    }

                    alert("✅ Facture modifiée avec succès.");

                    voirFacture(id);

                } catch (erreur) {

                    console.error(erreur);

                    alert(
                        "❌ Impossible de modifier la facture : " +
                        erreur.message
                    );

                    bouton.disabled = false;
                    bouton.textContent =
                        "💾 Enregistrer les modifications";
                }
            });

    } catch (erreur) {

        console.error(erreur);

        alert(
            "❌ Impossible d'ouvrir la modification : " +
            erreur.message
        );
    }
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



/* =========================================
   MODULE PRODUITS — INTERFACE
   ========================================= */

window.afficherProduits = async function afficherProduits() {
    const main = document.querySelector("main");

    if (!main) return;

    main.innerHTML = `
        <section style="padding:20px;max-width:1100px;margin:auto;">

            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
                <div>
                    <h1 style="margin:0 0 5px;">📦 Mes produits</h1>
                    <p style="color:#667085;margin:0;">
                        Gérez vos produits simplement.
                    </p>
                </div>

                <button
                    type="button"
                    onclick="afficherFormulaireProduit()"
                    style="padding:13px 18px;border:0;border-radius:12px;background:#2563eb;color:white;font-weight:bold;cursor:pointer;">
                    ＋ Ajouter un produit
                </button>
            </div>

            <div style="margin-bottom:20px;">
                <input
                    id="rechercheProduits"
                    type="search"
                    placeholder="🔎 Rechercher un produit..."
                    style="width:100%;padding:14px;border:1px solid #ddd;border-radius:12px;font-size:15px;">
            </div>

            <div id="listeProduits">
                <p style="text-align:center;padding:30px;">⏳ Chargement...</p>
            </div>

        </section>
    `;

    document
        .getElementById("rechercheProduits")
        .addEventListener("input", afficherListeProduits);

    await afficherListeProduits();
};


let produitsFaktu = [];


async function afficherListeProduits() {
    const conteneur = document.getElementById("listeProduits");

    if (!conteneur) return;

    try {
        const response = await fetch("/api/produits");

        if (!response.ok) {
            throw new Error("Impossible de récupérer les produits");
        }

        produitsFaktu = await response.json();

        const recherche = (
            document.getElementById("rechercheProduits")?.value || ""
        ).toLowerCase().trim();

        const produits = produitsFaktu.filter(produit => {
            return (
                produit.nom.toLowerCase().includes(recherche) ||
                (produit.categorie || "").toLowerCase().includes(recherche)
            );
        });

        if (produits.length === 0) {
            conteneur.innerHTML = `
                <div style="background:white;border-radius:16px;padding:40px;text-align:center;box-shadow:0 4px 15px #0000000d;">
                    <div style="font-size:45px;margin-bottom:10px;">📦</div>
                    <h3>Aucun produit trouvé</h3>
                    <p style="color:#667085;margin:10px 0 20px;">
                        Ajoutez votre premier produit ou modifiez votre recherche.
                    </p>
                    <button
                        onclick="afficherFormulaireProduit()"
                        style="padding:12px 18px;border:0;border-radius:10px;background:#2563eb;color:white;font-weight:bold;">
                        ＋ Ajouter un produit
                    </button>
                </div>
            `;
            return;
        }

        conteneur.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;">
                ${produits.map(produit => `
                    <article style="background:white;border-radius:16px;padding:16px;box-shadow:0 4px 15px #0000000d;">

                        ${
                            produit.photo
                            ? `<img src="${produit.photo}" alt=""
                                style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:12px;">`
                            : `<div style="height:180px;background:#f2f4f7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:55px;margin-bottom:12px;">
                                📦
                              </div>`
                        }

                        <h3 style="margin-bottom:7px;">
                            ${produit.nom}
                        </h3>

                        <strong style="font-size:21px;">
                            ${Number(produit.prix).toLocaleString("fr-FR")} FCFA
                        </strong>

                        <p style="margin:8px 0;color:#667085;">
                            Stock : ${produit.stock} ${produit.unite || ""}
                        </p>

                        <p style="margin-bottom:12px;">
                            ${
                                produit.actif
                                ? '<span style="color:#15803d;font-weight:bold;">🟢 Disponible</span>'
                                : '<span style="color:#dc2626;font-weight:bold;">🔴 Désactivé</span>'
                            }
                        </p>

                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <button
                                onclick="modifierProduit(${produit.id})"
                                style="flex:1;padding:10px;border:0;border-radius:10px;background:#eee;font-weight:bold;">
                                ✏️ Modifier
                            </button>

                            <button
                                onclick="changerStatutProduit(${produit.id}, ${!produit.actif})"
                                style="flex:1;padding:10px;border:0;border-radius:10px;background:#eee;font-weight:bold;">
                                ${produit.actif ? "⏸️ Désactiver" : "▶️ Activer"}
                            </button>
                        </div>

                        <button
                            onclick="supprimerProduit(${produit.id})"
                            style="width:100%;margin-top:8px;padding:10px;border:0;border-radius:10px;background:#fee2e2;color:#b91c1c;font-weight:bold;">
                            🗑️ Supprimer
                        </button>

                    </article>
                `).join("")}
            </div>
        `;

    } catch (erreur) {
        console.error(erreur);

        conteneur.innerHTML = `
            <div style="padding:25px;background:#fee2e2;border-radius:14px;">
                ❌ Impossible de charger les produits.
            </div>
        `;
    }
}


window.afficherFormulaireProduit = function afficherFormulaireProduit(produit = null) {

    const main = document.querySelector("main");

    const modification = produit !== null;

    main.innerHTML = `
        <section style="padding:20px;max-width:650px;margin:auto;">

            <h1 style="margin-bottom:20px;">
                ${modification ? "✏️ Modifier le produit" : "➕ Nouveau produit"}
            </h1>

            <form id="produitForm"
                style="background:white;padding:20px;border-radius:16px;box-shadow:0 4px 15px #0000000d;">

                <label style="display:block;margin-bottom:15px;">
                    <strong>Nom du produit *</strong>
                    <input
                        id="produitNom"
                        required
                        value="${modification ? produit.nom : ""}"
                        placeholder="Ex : Poulet entier"
                        style="width:100%;padding:13px;margin-top:6px;border:1px solid #ddd;border-radius:10px;">
                </label>

                <label style="display:block;margin-bottom:15px;">
                    <strong>Prix *</strong>
                    <input
                        id="produitPrix"
                        type="number"
                        min="0"
                        required
                        value="${modification ? produit.prix : ""}"
                        placeholder="Ex : 5000"
                        style="width:100%;padding:13px;margin-top:6px;border:1px solid #ddd;border-radius:10px;">
                </label>

                <label style="display:block;margin-bottom:15px;">
                    <strong>Stock</strong>
                    <input
                        id="produitStock"
                        type="number"
                        min="0"
                        value="${modification ? produit.stock : 0}"
                        style="width:100%;padding:13px;margin-top:6px;border:1px solid #ddd;border-radius:10px;">
                </label>

                <label style="display:block;margin-bottom:15px;">
                    <strong>Catégorie</strong>
                    <input
                        id="produitCategorie"
                        value="${modification ? produit.categorie || "" : ""}"
                        placeholder="Ex : Volaille"
                        style="width:100%;padding:13px;margin-top:6px;border:1px solid #ddd;border-radius:10px;">
                </label>

                <label style="display:block;margin-bottom:15px;">
                    <strong>Unité</strong>
                    <input
                        id="produitUnite"
                        value="${modification ? produit.unite || "unité" : "unité"}"
                        placeholder="unité, kg, litre..."
                        style="width:100%;padding:13px;margin-top:6px;border:1px solid #ddd;border-radius:10px;">
                </label>

                <label style="display:block;margin-bottom:15px;">
                    <strong>Photo</strong>
                    <input
                        id="produitPhoto"
                        type="url"
                        value="${modification ? produit.photo || "" : ""}"
                        placeholder="URL de la photo (facultatif)"
                        style="width:100%;padding:13px;margin-top:6px;border:1px solid #ddd;border-radius:10px;">
                </label>

                <label style="display:block;margin-bottom:20px;">
                    <strong>Description</strong>
                    <textarea
                        id="produitDescription"
                        rows="3"
                        placeholder="Description facultative"
                        style="width:100%;padding:13px;margin-top:6px;border:1px solid #ddd;border-radius:10px;">${modification ? produit.description || "" : ""}</textarea>
                </label>

                <div style="display:flex;gap:10px;">
                    <button
                        type="button"
                        onclick="afficherProduits()"
                        style="flex:1;padding:14px;border:0;border-radius:10px;background:#eee;font-weight:bold;">
                        Annuler
                    </button>

                    <button
                        type="submit"
                        style="flex:1;padding:14px;border:0;border-radius:10px;background:#2563eb;color:white;font-weight:bold;">
                        💾 Enregistrer
                    </button>
                </div>

            </form>
        </section>
    `;

    document
        .getElementById("produitForm")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const donnees = {
                nom: document.getElementById("produitNom").value.trim(),
                prix: Number(document.getElementById("produitPrix").value),
                stock: Number(document.getElementById("produitStock").value || 0),
                categorie: document.getElementById("produitCategorie").value.trim(),
                unite: document.getElementById("produitUnite").value.trim() || "unité",
                photo: document.getElementById("produitPhoto").value.trim(),
                description: document.getElementById("produitDescription").value.trim()
            };

            try {

                const response = await fetch(
                    modification
                        ? `/api/produits/${produit.id}`
                        : "/api/produits",
                    {
                        method: modification ? "PUT" : "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(donnees)
                    }
                );

                const resultat = await response.json();

                if (!response.ok) {
                    throw new Error(resultat.error || "Erreur");
                }

                alert(
                    modification
                        ? "✅ Produit modifié"
                        : "✅ Produit ajouté"
                );

                afficherProduits();

            } catch (erreur) {
                console.error(erreur);
                alert("❌ " + erreur.message);
            }
        });
};


window.modifierProduit = function modifierProduit(id) {

    const produit = produitsFaktu.find(
        p => p.id === id
    );

    if (!produit) {
        alert("❌ Produit introuvable");
        return;
    }

    afficherFormulaireProduit(produit);
};


window.changerStatutProduit = async function changerStatutProduit(id, actif) {

    try {

        const response = await fetch(
            `/api/produits/${id}/statut`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ actif })
            }
        );

        if (!response.ok) {
            throw new Error("Impossible de modifier le statut");
        }

        await afficherListeProduits();

    } catch (erreur) {
        console.error(erreur);
        alert("❌ " + erreur.message);
    }
};


window.supprimerProduit = async function supprimerProduit(id) {

    if (!confirm("Supprimer définitivement ce produit ?")) {
        return;
    }

    try {

        const response = await fetch(
            `/api/produits/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            const resultat = await response.json();
            throw new Error(resultat.error || "Erreur");
        }

        alert("✅ Produit supprimé");

        await afficherListeProduits();

    } catch (erreur) {
        console.error(erreur);
        alert("❌ " + erreur.message);
    }
};

/* =========================================================
   CORRECTION NAVIGATION ACCUEIL
   ========================================================= */
window.allerAccueil = function () {
    window.location.href = '/';
};

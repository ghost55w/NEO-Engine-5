const fs = require('fs');
const path = require('path');
const { delay, DisconnectReason } = require("@whiskeysockets/baileys");
const config = require("../set");
let evt = require("../lib/ovlcmd"); // Contient les commandes du bot

/**
 * Gestion des changements de connexion Baileys
 * @param {Object} con - Objet connection_update de Baileys
 * @param {import('@whiskeysockets/baileys').AnyWASocket} ovl - Instance Baileys
 * @param {Function} main - Fonction principale pour relancer le bot
 */
async function connection_update(con, ovl, main) {
  const { connection, lastDisconnect } = con;

  switch (connection) {
    case "connecting":
      console.log("🌍 Connexion en cours...");
      break;

    case "open":
      console.log(`
╭──────────────────────────╮
│                          │
│   🎉 NEO ENGINE 5 ONLINE 🎉   │
│                          │
╰──────────────────────────╯
`);

      // Chargement des commandes
      try {
        const commandes = fs.readdirSync(path.join(__dirname, "../cmd"))
          .filter(f => path.extname(f).toLowerCase() === ".js");

        console.log("📂 Chargement des commandes :");
        for (const fichier of commandes) {
          try {
            require(path.join(__dirname, "../cmd", fichier));
            console.log(`  ✓ ${fichier}`);
          } catch (e) {
            console.log(`  ✗ ${fichier} — erreur : ${e.message}`);
          }
        }
      } catch (err) {
        console.error("Erreur lecture dossier commandes :", err.message);
      }

      // Message de démarrage
      const start_msg = `╭───〔 🤖 𝙉𝙀𝙊 𝙀𝙉𝙂𝙄𝙉𝙀 5 〕───⬣
│ ߷ *Etat*       ➜ Connecté ✅
│ ߷ *Préfixe*    ➜ ${config.PREFIX}
│ ߷ *Mode*       ➜ ${config.MODE}
│ ߷ *Commandes*  ➜ ${evt?.cmd?.length || 0}
│ ߷ *Développeur*➜ Neo
╰──────────────⬣`;

      console.log(start_msg + "\n");

      // Envoi du message à l'utilisateur principal
      try {
        await delay(2000);
        if (ovl?.user?.id) await ovl.sendMessage(ovl.user.id, { text: start_msg });
      } catch (err) {
        console.error("Erreur envoi message de démarrage:", err.message);
      }

      break;

    case "close":
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log("⛔ Déconnecté : Session terminée. Veuillez vous reconnecter manuellement.");
      } else {
        console.log("⚠️ Connexion perdue, tentative de reconnexion dans 5s...");
        await delay(5000);
        try {
          await main(); // relance de la fonction principale
        } catch (err) {
          console.error("Erreur lors de la reconnexion automatique:", err.message);
        }
      }
      break;

    case "unavailable":
      console.log("⚠️ Serveur WhatsApp temporairement indisponible...");
      break;

    default:
      console.log("ℹ️ État de connexion :", connection);
  }
}

module.exports = connection_update;

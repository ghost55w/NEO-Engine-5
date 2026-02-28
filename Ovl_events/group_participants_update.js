const config = require('../set');

// Message par défaut pour le "quoted"
const ms_badge = {
  key: {
    fromMe: false,
    participant: '0@s.whatsapp.net',
    remoteJid: '0@s.whatsapp.net',
  },
  message: {
    extendedTextMessage: {
      text: 'NEO ᴇɴɢɪɴᴇ 5 by NEO',
      contextInfo: { mentionedJid: [] },
    },
  },
};

/**
 * Gestion des mises à jour des participants d'un groupe
 * @param {Object} data - Contient l'action et les participants
 * @param {import('@whiskeysockets/baileys').AnyWASocket} ovl - Instance Baileys
 */
async function group_participants_update(data, ovl) {
  try {
    if (!data || !data.participants) return;

    for (const participant of data.participants) {
      const jidSimple = participant.split("@")[0];

      // Cas ajout et WELCOME activé
      if (data.action === 'add' && config.WELCOME === 'oui') {
        const welcomeMessage = `*🎮 WELCOME 🔷 NEOVERSE*
Bienvenue @${jidSimple} dans le nouveau monde du roleplay, NEO ENGINE 5 PLAY 🎮. 
Veuillez respecter les règles et profiter de l'aventure ! 😃`;

        try {
          await ovl.sendMessage(
            data.id, // ID du groupe
            {
              image: { url: "https://files.catbox.moe/o2acuc.jpg" },
              caption: welcomeMessage,
              mentions: [participant]
            },
            { quoted: ms_badge }
          );
        } catch (err) {
          console.error("Erreur envoi message de bienvenue:", err.message);
        }
      }

      // Ici tu peux ajouter d'autres actions: "remove", "promote", "demote" si nécessaire
    }
  } catch (err) {
    console.error("Erreur dans group_participants_update:", err.message);
  }
}

module.exports = group_participants_update;

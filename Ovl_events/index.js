// Import des fonctions utilitaires principales
const { dl_save_media_ms, recup_msg } = require('./fonctions');

// Export des événements et fonctions pour NEO ENGINE 5
module.exports = {
  // Gestion des nouveaux messages
  message_upsert: require('./message_upsert'),

  // Gestion des mises à jour des participants de groupes
  group_participants_update: require('./group_participants_update'),

  // Gestion des mises à jour de connexion (open, close, reconnect)
  connection_update: require('./connection_update'),

  // Fonctions utilitaires média & messages
  dl_save_media_ms,
  recup_msg,
};

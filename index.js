const fs = require('fs');
const path = require('path');
const pino = require('pino');
const axios = require('axios');
const express = require('express');
const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  Browsers,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys');

const config = require('./set'); // NEO ENGINE 5 config
const { get_session, restoreAuth } = require('./Database/session');
const {
  message_upsert,
  group_participants_update,
  connection_update,
  dl_save_media_ms,
  recup_msg
} = require('./Ov_events');

async function main() {
  try {
    const instanceId = 'principale';

    // 🔹 Restaurer la session si elle existe
    const sessionData = await get_session(config.SESSION_ID);
    if (sessionData) await restoreAuth(instanceId, sessionData.creds, sessionData.keys);

    // 🔹 Auth Baileys
    const { state, saveCreds } = await useMultiFileAuthState(`./auth/${instanceId}`);
    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          pino({ level: 'silent' }).child({ level: 'silent' })
        )
      },
      logger: pino({ level: 'silent' }),
      browser: Browsers.ubuntu('NEO ENGINE 5'),
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true
    });

    // 🔹 Events
    sock.ev.on('messages.upsert', async (m) => message_upsert(m, sock));
    sock.ev.on('group-participants.update', async (data) => group_participants_update(data, sock));
    sock.ev.on('connection.update', (update) => connection_update(update, sock, main));
    sock.ev.on('creds.update', saveCreds);

    // 🔹 Méthodes utilitaires attachées au sock
    sock.dl_save_media_ms = (msg, filename = '', attachExt = true, dir = './downloads') =>
      dl_save_media_ms(sock, msg, filename, attachExt, dir);

    sock.recup_msg = (params = {}) => recup_msg({ sock, ...params });

    console.log('✅ Session principale NEO ENGINE 5 démarrée');
    return sock;

  } catch (err) {
    console.error('❌ Erreur au lancement :', err.message || err);
  }
}

main().catch((err) => console.error('❌ Erreur inattendue :', err));

// 🔹 Serveur web pour ping auto et monitoring
const app = express();
const port = process.env.PORT || 3000;
let dernierPingRecu = Date.now();

app.get('/', (req, res) => {
  dernierPingRecu = Date.now();
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>NEO ENGINE 5</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { display:flex; justify-content:center; align-items:center; height:100vh; background:#121212; color:#fff; font-family:Arial,sans-serif; }
.content { text-align:center; padding:30px; background:#1e1e1e; border-radius:12px; box-shadow:0 8px 20px rgba(255,255,255,0.1); transition:0.3s; }
.content:hover { transform:translateY(-5px); box-shadow:0 12px 30px rgba(255,255,255,0.15); }
h1 { font-size:2em; margin-bottom:15px; color:#f0f0f0; }
p { color:#d3d3d3; font-size:1.1em; }
</style>
</head>
<body>
<div class="content">
<h1>NEO ENGINE 5 Online 🚀</h1>
<p>Votre assistant WhatsApp</p>
</div>
</body>
</html>`);
});

app.listen(port, () => {
  console.log('🌐 Serveur web démarré sur le port : ' + port);
  const publicURL = process.env.RENDER_EXTERNAL_URL || process.env.KOYEB_PUBLIC_DOMAIN
    ? `https://${process.env.RENDER_EXTERNAL_URL || process.env.KOYEB_PUBLIC_DOMAIN}`
    : `http://localhost:${port}`;
  setupAutoPing(publicURL);
});

// 🔹 Ping automatique pour garder le bot actif
function setupAutoPing(url) {
  setInterval(async () => {
    try {
      const res = await axios.get(url);
      if (res.data) console.log(`Ping: NEO ENGINE 5 ✅`);
    } catch (err) {
      console.error('Erreur lors du ping', err.message);
    }
  }, 30000);
}

// 🔹 Gestion erreurs globales
process.on('uncaughtException', (e) => console.error('Une erreur inattendue :', e));
process.on('unhandledRejection', (e) => console.error('Rejet non géré :', e));

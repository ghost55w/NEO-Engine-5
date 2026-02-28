const fs = require("fs");
const path = require("path");

// Chemin du cache JSON
const filePath = path.join(__dirname, "../lib/cache_jid.json");

// Crée le fichier si inexistant
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}

// --------------------
// Fonctions de lecture / écriture du cache
// --------------------
function readCache() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Erreur lecture cache_jid:", err.message);
    return {};
  }
}

function writeCache(cache) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.error("Erreur écriture cache_jid:", err.message);
  }
}

// --------------------
// Récupère le JID d’un participant
// --------------------
async function getJid(lid, ms_org, ovl, attempt = 0) {
  try {
    if (!lid || typeof lid !== "string") return null;

    // Si c’est déjà un JID complet
    if (lid.endsWith("@s.whatsapp.net")) return lid;

    const cache = readCache();
    if (cache[lid]) return cache[lid];

    // Récupère les participants du groupe
    const metadata = await ovl.groupMetadata(ms_org);
    if (!metadata || !Array.isArray(metadata.participants)) return null;

    const participant = metadata.participants.find(p => p.id == lid);
    if (!participant) return null;

    const jid = participant.jid || participant.id;

    // Sauvegarde dans le cache
    cache[lid] = jid;
    writeCache(cache);

    return jid;

  } catch (e) {
    if (attempt < 2) {
      // retry automatique
      return getJid(lid, ms_org, ovl, attempt + 1);
    }
    console.error(`❌ getJid échoué après 3 tentatives pour ${lid}:`, e.message);
    return null;
  }
}

module.exports = getJid;

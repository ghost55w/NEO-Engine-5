const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../set');

// --------------------
// Connexion PostgreSQL
// --------------------
const sequelize = new Sequelize(
  config.DATABASE,
  {
    dialect: 'postgres',
    ssl: true,
    protocol: 'postgres',
    dialectOptions: {
      native: true,
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// --------------------
// Définition du modèle Session
// --------------------
const Session = sequelize.define('Session', {
  id: { type: DataTypes.STRING, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  keys: { type: DataTypes.TEXT, allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'sessions',
  timestamps: false,
});

// --------------------
// Synchronisation table
// --------------------
async function initSessions() {
  try {
    await Session.sync();
    console.log("Table 'sessions' synchronisée avec succès.");
  } catch (err) {
    console.error("Erreur lors de la synchronisation des sessions:", err.message);
  }
}

// --------------------
// Récupérer une session par ID
// --------------------
async function get_session(id) {
  const session = await Session.findByPk(id);
  if (!session) return null;

  session.createdAt = new Date(); // mise à jour de la dernière activité
  await session.save();

  return {
    creds: JSON.parse(session.content),
    keys: JSON.parse(session.keys),
  };
}

// --------------------
// Restaure la session dans les fichiers auth pour Baileys
// --------------------
async function restaureAuth(instanceId, creds, keys) {
  const authDir = path.join(__dirname, '../auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const sessionDir = path.join(authDir, instanceId);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  // Sauvegarde des credentials
  fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(creds, null, 2));

  // Sauvegarde de chaque key individuellement
  if (keys && Object.keys(keys).length > 0) {
    for (const keyFile in keys) {
      fs.writeFileSync(
        path.join(sessionDir, `${keyFile}.json`),
        JSON.stringify(keys[keyFile], null, 2)
      );
    }
  }
}

// --------------------
// Exports
// --------------------
module.exports = { Session, initSessions, get_session, restaureAuth, sequelize };

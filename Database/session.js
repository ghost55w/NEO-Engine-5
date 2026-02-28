const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// ⚠️ Corrigé : mot de passe encodé (%40 pour @)
const sequelize = new Sequelize(
  'postgres://postgres.mkvywsrvpbngcaabihlb:database%40passWord1@aws-0-eu-north-1.pooler.supabase.com:6543/postgres',
  {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      native: true,
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
  }
);

// Définition de la table sessions
const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  keys: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'sessions',
  timestamps: false,
});

// ⚡ Synchronisation DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la DB réussie !');
    await Session.sync();
    console.log('Table sessions prête !');
  } catch (err) {
    console.error('Erreur de connexion DB :', err);
  }
})();

// Récupère une session depuis la DB
async function get_session(id) {
  const session = await Session.findByPk(id);
  if (!session) return null;

  session.createdAt = new Date();
  await session.save();

  return {
    creds: JSON.parse(session.content),
    keys: JSON.parse(session.keys),
  };
}

// Restaure les fichiers d’auth
async function restaureAuth(instanceId, creds, keys) {
  const authDir = path.join(__dirname, '../auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const sessionDir = path.join(authDir, instanceId);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(creds, null, 2));

  if (keys && Object.keys(keys).length > 0) {
    for (const keyFile in keys) {
      fs.writeFileSync(
        path.join(sessionDir, `${keyFile}.json`),
        JSON.stringify(keys[keyFile], null, 2)
      );
    }
  }
}

module.exports = {
  get_session,
  restaureAuth,
};

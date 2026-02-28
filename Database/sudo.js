const { Sequelize, DataTypes } = require('sequelize');
const config = require('../set');
const db = config.DATABASE;

let sequelize;

// --------------------
// Connexion DB (PostgreSQL / SQLite fallback)
// --------------------
if (!db) { 
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.db',
    logging: false,
  });
} else {
  sequelize = new Sequelize(db, {
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
  });
}

// --------------------
// Définition du modèle Sudo
// --------------------
const Sudo = sequelize.define('Sudo', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
}, {
  tableName: 'sudo',
  timestamps: false,
});

// --------------------
// Synchronisation table
// --------------------
async function initSudo() {
  try {
    await Sudo.sync();
    console.log("Table 'Sudo' synchronisée avec succès.");
  } catch (err) {
    console.error("Erreur lors de la synchronisation de Sudo:", err.message);
  }
}

// --------------------
// Fonctions utilitaires
// --------------------
async function addSudo(id) {
  return await Sudo.create({ id });
}

async function removeSudo(id) {
  return await Sudo.destroy({ where: { id } });
}

async function isSudo(id) {
  const user = await Sudo.findByPk(id);
  return !!user;
}

// --------------------
// Exports
// --------------------
module.exports = { Sudo, initSudo, addSudo, removeSudo, isSudo, sequelize };

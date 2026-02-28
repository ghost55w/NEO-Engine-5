const { Sequelize, DataTypes } = require('sequelize');
const config = require('../set');
const db = config.DATABASE;

let sequelize;

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

// Définition de la table Bans
const Bans = sequelize.define('Bans', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('user', 'group'),
    allowNull: false,
  },
}, {
  tableName: 'bans',
  timestamps: false,
});

// Synchronisation de la table
async function initBans() {
  try {
    await Bans.sync();
    console.log("Table 'Bans' synchronisée avec succès.");
  } catch (err) {
    console.error("Erreur lors de la synchronisation de Bans:", err.message);
  }
}

// Fonctions utilitaires
async function addBan(id, type) {
  return await Bans.create({ id, type });
}

async function removeBan(id) {
  return await Bans.destroy({ where: { id } });
}

async function isBanned(id) {
  const ban = await Bans.findOne({ where: { id } });
  return !!ban;
}

module.exports = { Bans, initBans, addBan, removeBan, isBanned, sequelize };

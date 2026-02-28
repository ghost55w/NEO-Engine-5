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

// Définition du modèle AllStarsDivsFiche
const AllStarsDivsFiche = sequelize.define('AllStarsDivsFiche', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pseudo: { type: DataTypes.STRING, defaultValue: 'aucun' },
  classement: { type: DataTypes.STRING, defaultValue: 'aucun' },
  niveu_xp: { type: DataTypes.INTEGER, defaultValue: 1 },
  division: { type: DataTypes.STRING, defaultValue: 'aucun' },
  rang: { type: DataTypes.STRING, defaultValue: 'aucun' },
  classe: { type: DataTypes.STRING, defaultValue: 'aucun' },
  saison_pro: { type: DataTypes.INTEGER, defaultValue: 0 },
  golds: { type: DataTypes.INTEGER, defaultValue: 0 },
  fans: { type: DataTypes.INTEGER, defaultValue: 0 },
  archetype: { type: DataTypes.STRING, defaultValue: 'aucun' },
  commentaire: { type: DataTypes.TEXT, defaultValue: 'aucun' },
  victoires: { type: DataTypes.INTEGER, defaultValue: 0 },
  defaites: { type: DataTypes.INTEGER, defaultValue: 0 },
  championnants: { type: DataTypes.INTEGER, defaultValue: 0 },
  neo_cup: { type: DataTypes.INTEGER, defaultValue: 0 },
  evo: { type: DataTypes.INTEGER, defaultValue: 0 },
  grandslam: { type: DataTypes.INTEGER, defaultValue: 0 },
  tos: { type: DataTypes.INTEGER, defaultValue: 0 },
  the_best: { type: DataTypes.INTEGER, defaultValue: 0 },
  laureat: { type: DataTypes.INTEGER, defaultValue: 0 },
  sigma: { type: DataTypes.INTEGER, defaultValue: 0 },
  neo_globes: { type: DataTypes.INTEGER, defaultValue: 0 },
  golden_boy: { type: DataTypes.INTEGER, defaultValue: 0 },
  cleans: { type: DataTypes.INTEGER, defaultValue: 0 },
  erreurs: { type: DataTypes.INTEGER, defaultValue: 0 },
  note: { type: DataTypes.INTEGER, defaultValue: 0 },
  talent: { type: DataTypes.INTEGER, defaultValue: 0 },
  intelligence: { type: DataTypes.INTEGER, defaultValue: 0 },
  speed: { type: DataTypes.INTEGER, defaultValue: 0 },
  close_fight: { type: DataTypes.INTEGER, defaultValue: 0 },
  attaques: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_cards: { type: DataTypes.INTEGER, defaultValue: 0 },
  cards: { type: DataTypes.TEXT, defaultValue: 'aucune' },
  source: { type: DataTypes.STRING, defaultValue: 'inconnu' },
  jid: { type: DataTypes.STRING, defaultValue: 'aucun', unique: true },
  oc_url: { type: DataTypes.STRING, defaultValue: 'https://files.catbox.moe/4quw3r.jpg' },
  code_fiche: { type: DataTypes.STRING, defaultValue: 'aucun', unique: true },
}, {
  tableName: 'allstars_divs_fiches',
  timestamps: false,
});

// ----------------------
// Fonctions utilitaires
// ----------------------

// Retourne toutes les fiches
async function getAllFiches() { 
  return await AllStarsDivsFiche.findAll(); 
}

// Retourne une fiche si elle existe, sinon null
async function getData(where = {}) {
  return await AllStarsDivsFiche.findOne({ where });
}

// Crée une fiche uniquement via add_id
async function add_id(jid, data = {}) {
  if (!jid) throw new Error("JID requis");
  const exists = await AllStarsDivsFiche.findOne({ where: { jid } });
  if (exists) return null;
  return await AllStarsDivsFiche.create({ jid, ...data });
}

// Met à jour une colonne pour un JID existant
async function setfiche(colonne, valeur, jid) {
  try {
    const updateData = {}; 
    updateData[colonne] = valeur;

    const [updated] = await AllStarsDivsFiche.update(updateData, { where: { jid } });
    if (!updated) throw new Error(`❌ Aucun joueur trouvé pour jid : ${jid}`);
    console.log(`✔ ${colonne} mis à jour → ${valeur}`);
  } catch (err) {
    console.error(`Erreur setfiche: ${err.message}`);
  }
}

// Supprime une fiche via code_fiche
async function del_fiche(code_fiche) { 
  return await AllStarsDivsFiche.destroy({ where: { code_fiche } }); 
}

module.exports = { getAllFiches, getData, add_id, setfiche, del_fiche, sequelize };

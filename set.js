module.exports = { 
    // ID de la session principale pour restaurer la connexion
    SESSION_ID: process.env.SESSION_ID || 'neo_engine_5',

    // Préfixe des commandes
    PREFIX: process.env.PREFIX || "+",

    // Mode du bot : public ou privé
    MODE: process.env.MODE_PUBLIC || "public",

    // Numéro du propriétaire (owner) du bot
    OWNER: process.env.NUMERO_OWNER ? process.env.NUMERO_OWNER.split(",") : ["242055759975"],

    // Base de données (PostgreSQL, SQLite, etc.)
    DATABASE: process.env.DATABASE || 'postgresql://postgres:S7gZWH#kVFz8V-G@aws-0-eu-west-1.pooler.supabase.com:5432/neo_engine_5' , 
    // Activation du message de bienvenue
    WELCOME: process.env.WELCOME || 'oui',

    // Nombre de cartes, ou valeur personnalisée pour certaines fonctionnalités
    CARDS_NOMBRE: process.env.CARDS_NOMBRE || '10',

    // Version du bot
    VERSION: "5.0.0"
};

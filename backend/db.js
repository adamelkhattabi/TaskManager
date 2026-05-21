// Importer le module better-sqlite3 qui permet de parler à SQLite
const Database = require('better-sqlite3');

// Importer le module path pour manipuler les chemins de fichiers
const path = require('path');

// Créer une connexion à la base de données
// __dirname = dossier courant (backend)
// On remonte d'un niveau (..) puis on va dans database/db.sqlite
const db = new Database(path.join(__dirname, 'database/db.sqlite'));

// exec() exécute une ou plusieurs requêtes SQL
db.exec(`

  -- Créer la table 'users' si elle n'existe pas
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- ID auto-incrémenté, clé primaire
    username TEXT UNIQUE NOT NULL,          -- Nom unique et obligatoire
    password TEXT NOT NULL,                 -- Mot de passe haché, obligatoire
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Date d'inscription automatique
  );

  -- Créer la table 'tasks' si elle n'existe pas
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- ID auto-incrémenté
    title TEXT NOT NULL,                    -- Titre de la tâche, obligatoire
    description TEXT,                       -- Description (optionnelle)
    status TEXT DEFAULT 'pending',          -- 'pending' ou 'completed'
    user_id INTEGER NOT NULL,               -- ID de l'utilisateur propriétaire
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    -- La clé étrangère lie chaque tâche à un utilisateur
    -- ON DELETE CASCADE : si l'utilisateur est supprimé, ses tâches aussi
  );
`);

// Exporter la connexion pour l'utiliser dans d'autres fichiers
module.exports = db;
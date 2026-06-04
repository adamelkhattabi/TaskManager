const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Détecter si on est sur Zeabur (présence de la variable d'environnement)
const isZeabur = process.env.ZEABUR === 'true' || process.env.RAILWAY === undefined;

// Déterminer le chemin de la base de données
let dbPath;
if (isZeabur) {
    // Sur Zeabur, on utilise le répertoire /data (point de montage du Volume)
    const dataDir = '/data';
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    dbPath = path.join(dataDir, 'db.sqlite');
    console.log(`✅ Zeabur mode: using database at ${dbPath}`);
} else {
    // Mode développement local
    dbPath = path.join(__dirname, 'database', 'db.sqlite');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    console.log(`✅ Local mode: using database at ${dbPath}`);
}

// Connexion à SQLite
const db = new Database(dbPath);

// Création des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

console.log('✅ Database initialized');
module.exports = db;
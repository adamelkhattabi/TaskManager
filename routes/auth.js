// Importer Express pour créer un routeur
const express = require('express');

// Importer bcrypt pour hasher les mots de passe
const bcrypt = require('bcrypt');

// Importer la base de données
const db = require('../db');

// Créer un routeur (mini-application Express)
const router = express.Router();

// ----- ROUTE D'INSCRIPTION (POST /api/auth/register) -----
router.post('/register', async (req, res) => {
    // Extraire username et password du corps de la requête (JSON)
    const { username, password } = req.body;
    
    // Validation : les deux champs sont requis
    if (!username || !password) {
        return res.status(400).json({ error: 'Username et mot de passe requis' });
    }
    
    try {
        // Hasher le mot de passe avec bcrypt
        // 10 = nombre de "tours" (plus c'est haut, plus c'est sécurisé mais lent)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Préparer la requête SQL d'insertion
        // Le ? sont des placeholders pour éviter les injections SQL
        const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        
        // Exécuter la requête avec les vraies valeurs
        const result = stmt.run(username, hashedPassword);
        
        // Stocker l'ID et le nom dans la session (connexion automatique)
        req.session.userId = result.lastInsertRowid;  // Dernier ID inséré
        req.session.username = username;
        
        // Répondre avec succès (201 = Created)
        res.status(201).json({ 
            message: 'Inscription réussie', 
            user: { id: result.lastInsertRowid, username } 
        });
        
    } catch (error) {
        // Si l'erreur contient 'UNIQUE', c'est que le username existe déjà
        if (error.message.includes('UNIQUE')) {
            res.status(400).json({ error: 'Ce nom d\'utilisateur existe déjà' });
        } else {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
});

// ----- ROUTE DE CONNEXION (POST /api/auth/login) -----
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Chercher l'utilisateur dans la base
    // .get() retourne une ligne ou undefined
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    // Si l'utilisateur n'existe pas
    if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    // Comparer le mot de passe envoyé avec le hash stocké
    // bcrypt.compare retourne true ou false
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    // Stocker l'utilisateur dans la session (il est maintenant connecté)
    req.session.userId = user.id;
    req.session.username = user.username;
    
    // Répondre avec succès
    res.json({ 
        message: 'Connexion réussie', 
        user: { id: user.id, username: user.username } 
    });
});

// ----- ROUTE DE DÉCONNEXION (POST /api/auth/logout) -----
router.post('/logout', (req, res) => {
    // destroy() supprime toutes les données de la session
    req.session.destroy();
    res.json({ message: 'Déconnecté' });
});

// ----- ROUTE POUR VÉRIFIER L'ÉTAT DE CONNEXION (GET /api/auth/me) -----
router.get('/me', (req, res) => {
    // Si l'utilisateur est connecté (session.userId existe)
    if (req.session.userId) {
        res.json({ 
            authenticated: true, 
            user: { id: req.session.userId, username: req.session.username } 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Exporter le routeur pour l'utiliser dans server.js
module.exports = router;
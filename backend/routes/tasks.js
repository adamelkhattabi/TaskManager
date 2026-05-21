const express = require('express');
const db = require('../db');
const { requireAuth, requireTaskOwner } = require('../middleware/auth');
const router = express.Router();

// Toutes les routes après cette ligne nécessitent une authentification
router.use(requireAuth);

// ----- LIRE TOUTES LES TÂCHES DE L'UTILISATEUR (GET /api/tasks) -----
router.get('/', (req, res) => {
    // SELECT ... WHERE user_id = ? ne retourne que les tâches de l'utilisateur connecté
    const tasks = db.prepare(`
        SELECT * FROM tasks 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    `).all(req.session.userId);  // .all() retourne toutes les lignes
    
    res.json(tasks);
});

// ----- CRÉER UNE TÂCHE (POST /api/tasks) -----
router.post('/', (req, res) => {
    const { title, description, status } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Le titre est requis' });
    }
    
    // Insérer la nouvelle tâche avec l'ID de l'utilisateur connecté
    const stmt = db.prepare(`
        INSERT INTO tasks (title, description, status, user_id) 
        VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(title, description || '', status || 'pending', req.session.userId);
    
    // Récupérer la tâche fraîchement créée pour la retourner
    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newTask);
});

// ----- MODIFIER UNE TÂCHE (PUT /api/tasks/:id) -----
// requireTaskOwner vérifie que l'utilisateur est propriétaire AVANT d'exécuter la route
router.put('/:id', requireTaskOwner, (req, res) => {
    const { title, description, status } = req.body;
    const taskId = req.params.id;
    
    // COALESCE(?, title) signifie : si la nouvelle valeur est null, garde l'ancienne
    const stmt = db.prepare(`
        UPDATE tasks 
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            status = COALESCE(?, status)
        WHERE id = ?
    `);
    
    stmt.run(title, description, status, taskId);
    
    // Retourner la tâche mise à jour
    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.json(updatedTask);
});

// ----- SUPPRIMER UNE TÂCHE (DELETE /api/tasks/:id) -----
router.delete('/:id', requireTaskOwner, (req, res) => {
    const taskId = req.params.id;
    
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(taskId);
    
    res.json({ message: 'Tâche supprimée' });
});

module.exports = router;
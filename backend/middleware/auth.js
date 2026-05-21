// Un middleware est une fonction qui s'exécute avant la route
// Il peut modifier la requête, vérifier des conditions, ou bloquer l'accès

// Middleware qui vérifie si l'utilisateur est connecté
function requireAuth(req, res, next) {
    // req.session.userId est stocké quand l'utilisateur se connecte
    if (!req.session.userId) {
        // 401 = Non autorisé
        return res.status(401).json({ error: 'Non authentifié' });
    }
    // Si connecté, on passe à la fonction suivante (la route)
    next();
}

// Middleware qui vérifie que l'utilisateur est propriétaire de la tâche
async function requireTaskOwner(req, res, next) {
    // Récupérer la base de données
    const db = require('../db');
    
    // Récupérer l'ID de la tâche depuis l'URL (ex: /api/tasks/5)
    const taskId = req.params.id;
    
    // Récupérer l'ID de l'utilisateur depuis la session
    const userId = req.session.userId;
    
    // Requête SQL : trouver la tâche par son ID
    // .get() retourne une seule ligne
    const task = db.prepare('SELECT user_id FROM tasks WHERE id = ?').get(taskId);
    
    // Si la tâche n'existe pas
    if (!task) {
        return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    
    // Si l'utilisateur n'est pas le propriétaire
    if (task.user_id !== userId) {
        // 403 = Interdit (forbidden)
        return res.status(403).json({ error: 'Accès non autorisé à cette tâche' });
    }
    
    // Tout est bon, on continue
    next();
}

// Exporter les deux middlewares
module.exports = { requireAuth, requireTaskOwner };
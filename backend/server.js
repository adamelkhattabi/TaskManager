const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Sessions
app.use(session({
    secret: 'votre_clé_secrète_très_longue_et_aléatoire',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Routes HTML - LA PARTIE IMPORTANTE
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } else {
        res.sendFile(path.join(__dirname, '../frontend/login.html'));
    }
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/index.html', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } else {
        res.redirect('/login.html');
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
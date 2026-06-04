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

const cors = require('cors');

// Allow requests from your Netlify frontend
app.use(cors({
    origin: 'https://your-frontend.netlify.app',  // Replace later
    credentials: true  // Important for session cookies
}));


// Sessions
app.use(session({
    secret: 'votre_clé_secrète_très_longue_et_aléatoire',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true,
        httpOnly: true,
        sameSite: 'none',
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
app.listen(PORT,'0.0.0.0', () => {
    console.log(`Serveur démarré sur http://0.0.0.0:${PORT}`);
});
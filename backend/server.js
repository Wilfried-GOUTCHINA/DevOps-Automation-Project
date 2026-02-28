const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'app Express
const app = express();

// Middleware
// Configuration CORS pour autoriser le frontend et le worker
const corsOptions = {
  origin: [
    'https://devops-automation-project-1.onrender.com',
    'https://freshmarket.workers.dev'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
// Connexion à MongoDB avec options améliorées
console.log('🚀 Tentative de connexion à MongoDB Atlas...');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Attend 30 secondes au lieu de 10
  socketTimeoutMS: 45000,          // Timeout de socket à 45 secondes
  connectTimeoutMS: 30000,         // Timeout de connexion initial à 30 secondes
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10
})
.then(() => console.log('✅ Connecté à MongoDB Atlas avec succès !'))
.catch(err => {
  console.error('❌ ÉCHEC DE CONNEXION DÉTAILLÉ :', {
    name: err.name,
    code: err.code,
    message: err.message
  });
});

// Routes (UNE SEULE FOIS !)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/webhooks', require('./routes/webhook'));
// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Fresh Market' });
});
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payments', require('./routes/payments'));
// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});

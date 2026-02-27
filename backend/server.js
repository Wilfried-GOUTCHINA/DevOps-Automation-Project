const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'app Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

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

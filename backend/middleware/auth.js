const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Récupérer le token
      token = req.headers.authorization.split(' ')[1];
      
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Ajouter l'utilisateur à la requête
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Vérifier si c'est un fournisseur
const fournisseur = (req, res, next) => {
  if (req.user && req.user.role === 'fournisseur') {
    next();
  } else {
    res.status(403).json({ message: 'Accès réservé aux fournisseurs' });
  }
};

// Vérifier si c'est un acheteur
const acheteur = (req, res, next) => {
  if (req.user && req.user.role === 'acheteur') {
    next();
  } else {
    res.status(403).json({ message: 'Accès réservé aux acheteurs' });
  }
};

module.exports = { protect, fournisseur, acheteur };

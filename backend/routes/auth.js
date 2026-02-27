const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    console.log('📥 Données reçues:', req.body);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [
        { email: req.body.email },
        { telephone: req.body.telephone }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ou téléphone déjà utilisé' 
      });
    }
    
    // Hasher le mot de passe ICI (pas dans le modèle)
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    
    // Créer l'utilisateur avec le mot de passe hashé
    const user = new User({
      nom: req.body.nom,
      telephone: req.body.telephone,
      email: req.body.email,
      password: hashedPassword,  // ← Mot de passe déjà hashé
      role: req.body.role,
      'localisation.ville': req.body.localisation.ville,
      'localisation.quartier': req.body.localisation.quartier,
      typeProduit: req.body.typeProduit
    });
    
    await user.save();
    console.log('✅ Utilisateur créé avec ID:', user._id);
    
    // Générer le token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ ERREUR:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});
// @route   POST /api/auth/login
// @desc    Connexion
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 Tentative de connexion:', req.body.email);
    
    const { email, password } = req.body;
    
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Générer le token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('✅ Connexion réussie pour:', user.email);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        telephone: user.telephone
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});
module.exports = router;

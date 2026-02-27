const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, fournisseur } = require('../middleware/auth');

// @route   POST /api/products
// @desc    Créer un nouveau produit (fournisseur uniquement)
// @access  Privé (fournisseur)
router.post('/', protect, fournisseur, async (req, res) => {
  try {
    console.log('📦 Création produit - Données reçues:', req.body);
    
    const productData = {
      ...req.body,
      fournisseurId: req.user._id,
      localisation: req.user.localisation // Utiliser la localisation du fournisseur
    };
    
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Produit créé avec ID:', product._id);
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
});

// @route   GET /api/products
// @desc    Récupérer tous les produits disponibles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, categorie, ville, prixMin, prixMax, search } = req.query;
    
    // Construire le filtre
    let filter = { disponible: true };
    
    if (type) filter.type = type;
    if (categorie) filter.categorie = categorie;
    if (ville) filter['localisation.ville'] = ville;
    
    if (prixMin || prixMax) {
      filter.prix = {};
      if (prixMin) filter.prix.$gte = Number(prixMin);
      if (prixMax) filter.prix.$lte = Number(prixMax);
    }
    
    // Recherche textuelle
    if (search) {
      filter.$text = { $search: search };
    }
    
    const products = await Product.find(filter)
      .populate('fournisseurId', 'nom telephone photoProfil')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits'
    });
  }
});

// @route   GET /api/products/fournisseur/:fournisseurId
// @desc    Récupérer les produits d'un fournisseur spécifique
// @access  Public
router.get('/fournisseur/:fournisseurId', async (req, res) => {
  try {
    const products = await Product.find({
      fournisseurId: req.params.fournisseurId,
      disponible: true
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits'
    });
  }
});

// @route   GET /api/products/mes-produits
// @desc    Récupérer les produits du fournisseur connecté
// @access  Privé (fournisseur)
router.get('/mes-produits', protect, fournisseur, async (req, res) => {
  try {
    const products = await Product.find({
      fournisseurId: req.user._id
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos produits'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Récupérer un produit par son ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('fournisseurId', 'nom telephone email localisation photoProfil');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Mettre à jour un produit (uniquement par son fournisseur)
// @access  Privé (fournisseur)
router.put('/:id', protect, fournisseur, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    // Vérifier que le fournisseur connecté est bien le propriétaire
    if (product.fournisseurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce produit'
      });
    }
    
    // Mettre à jour les champs
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });
    
    product.updatedAt = Date.now();
    await product.save();
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit (uniquement par son fournisseur)
// @access  Privé (fournisseur)
router.delete('/:id', protect, fournisseur, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    // Vérifier que le fournisseur connecté est bien le propriétaire
    if (product.fournisseurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce produit'
      });
    }
    
    await product.deleteOne();
    
    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit'
    });
  }
});

// @route   PATCH /api/products/:id/disponibilite
// @desc    Changer la disponibilité d'un produit
// @access  Privé (fournisseur)
router.patch('/:id/disponibilite', protect, fournisseur, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    if (product.fournisseurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    product.disponible = req.body.disponible;
    await product.save();
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de disponibilité'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, fournisseur, acheteur } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Créer une nouvelle commande (acheteur uniquement)
// @access  Privé (acheteur)
router.post('/', protect, acheteur, async (req, res) => {
  try {
    console.log('📦 Création commande - Données reçues:', req.body);
    
    const { produits, adresseLivraison } = req.body;
    
    if (!produits || produits.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La commande doit contenir au moins un produit'
      });
    }
    
    // Vérifier que tous les produits existent et sont disponibles
    let sousTotal = 0;
    const produitsDetails = [];
    const fournisseurIds = new Set();
    
    for (const item of produits) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produit ${item.productId} non trouvé`
        });
      }
      
      if (!product.disponible) {
        return res.status(400).json({
          success: false,
          message: `Le produit ${product.nom} n'est pas disponible`
        });
      }
      
      if (product.quantite < item.quantite) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour ${product.nom} (dispo: ${product.quantite})`
        });
      }
      
      const totalProduit = product.prix * item.quantite;
      sousTotal += totalProduit;
      
      produitsDetails.push({
        productId: product._id,
        nom: product.nom,
        prixUnitaire: product.prix,
        quantite: item.quantite,
        total: totalProduit
      });
      
      fournisseurIds.add(product.fournisseurId.toString());
    }
    
    // Vérifier que tous les produits viennent du même fournisseur
    if (fournisseurIds.size > 1) {
      return res.status(400).json({
        success: false,
        message: 'Tous les produits doivent venir du même fournisseur'
      });
    }
    
    const fournisseurId = Array.from(fournisseurIds)[0];
    const fraisLivraison = 1000; // Frais fixes pour l'exemple
    const total = sousTotal + fraisLivraison;
    
    // Créer la commande
    const order = new Order({
      acheteurId: req.user._id,
      fournisseurId,
      produits: produitsDetails,
      sousTotal,
      fraisLivraison,
      total,
      adresseLivraison: {
        ...adresseLivraison,
        telephone: req.user.telephone
      }
    });
    
    await order.save();
    
    // Mettre à jour les stocks
    for (const item of produits) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantite: -item.quantite }
      });
    }
    
    console.log('✅ Commande créée avec ID:', order._id);
    
    res.status(201).json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error('❌ Erreur création commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message
    });
  }
});

// @route   GET /api/orders/acheteur
// @desc    Récupérer les commandes de l'acheteur connecté
// @access  Privé (acheteur)
router.get('/acheteur', protect, acheteur, async (req, res) => {
  try {
    const orders = await Order.find({ acheteurId: req.user._id })
      .populate('fournisseurId', 'nom telephone')
      .populate('produits.productId', 'nom photos')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
});

// @route   GET /api/orders/fournisseur
// @desc    Récupérer les commandes reçues par le fournisseur
// @access  Privé (fournisseur)
router.get('/fournisseur', protect, fournisseur, async (req, res) => {
  try {
    const orders = await Order.find({ fournisseurId: req.user._id })
      .populate('acheteurId', 'nom telephone')
      .populate('produits.productId', 'nom photos')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Récupérer une commande par son ID
// @access  Privé (acheteur ou fournisseur concerné)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('acheteurId', 'nom telephone email')
      .populate('fournisseurId', 'nom telephone email localisation')
      .populate('produits.productId', 'nom photos description');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur est concerné par la commande
    const estAcheteur = order.acheteurId._id.toString() === req.user._id.toString();
    const estFournisseur = order.fournisseurId._id.toString() === req.user._id.toString();
    
    if (!estAcheteur && !estFournisseur) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir cette commande'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande'
    });
  }
});

// @route   PUT /api/orders/:id/statut
// @desc    Mettre à jour le statut d'une commande (fournisseur)
// @access  Privé (fournisseur)
router.put('/:id/statut', protect, fournisseur, async (req, res) => {
  try {
    const { statut, commentaire } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }
    
    // Vérifier que le fournisseur connecté est bien celui de la commande
    if (order.fournisseurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier cette commande'
      });
    }
    
    order.statut = statut;
    if (commentaire) {
      order.historiqueStatuts.push({
        statut,
        commentaire
      });
    }
    
    await order.save();
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
});

// @route   POST /api/orders/:id/annuler
// @desc    Annuler une commande (acheteur)
// @access  Privé (acheteur)
router.post('/:id/annuler', protect, acheteur, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }
    
    // Vérifier que l'acheteur connecté est bien celui de la commande
    if (order.acheteurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à annuler cette commande'
      });
    }
    
    // Vérifier que la commande peut être annulée
    if (order.statut !== 'en_attente' && order.statut !== 'payee') {
      return res.status(400).json({
        success: false,
        message: `Impossible d'annuler une commande avec le statut: ${order.statut}`
      });
    }
    
    order.statut = 'annulee';
    await order.save();
    
    // Restaurer les stocks
    for (const item of order.produits) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantite: item.quantite }
      });
    }
    
    res.json({
      success: true,
      message: 'Commande annulée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la commande'
    });
  }
});

module.exports = router;

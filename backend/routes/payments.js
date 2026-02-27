const express = require('express');
const router = express.Router();
const { protect, acheteur } = require('../middleware/auth');
const Order = require('../models/Order');
const fedapay = require('../services/fedapayService');

// @route   POST /api/payments/initier/:orderId
// @desc    Initier un paiement pour une commande
router.post('/initier/:orderId', protect, acheteur, async (req, res) => {
  try {
    const { modePaiement, telephone } = req.body; // 'mtn' ou 'moov'
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Commande non trouvée' 
      });
    }
    
    // Vérifier que l'acheteur est bien le propriétaire
    if (order.acheteurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé' 
      });
    }
    
    // Vérifier que la commande est en attente
    if (order.statut !== 'en_attente') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette commande ne peut plus être payée' 
      });
    }
    
    // Initier le paiement avec FedaPay
    const paiement = await fedapay.createTransaction({
      amount: order.total,
      telephone,
      orderId: order._id,
      mode: modePaiement
    });
    
    if (paiement.success) {
      // Mettre à jour la commande
      order.paiement = {
        mode: modePaiement,
        reference: paiement.transactionId,
        statut: 'en_attente'
      };
      await order.save();
      
      res.json({
        success: true,
        message: 'Paiement initié, veuillez confirmer sur votre téléphone',
        transactionId: paiement.transactionId
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: paiement.error 
      });
    }
  } catch (error) {
    console.error('❌ Erreur route paiement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// @route   GET /api/payments/statut/:transactionId
// @desc    Vérifier le statut d'un paiement
router.get('/statut/:transactionId', protect, async (req, res) => {
  try {
    const statut = await fedapay.checkTransaction(req.params.transactionId);
    
    if (statut.success) {
      // Si le paiement est réussi, mettre à jour la commande
      if (statut.status === 'approved' || statut.status === 'successful') {
        const order = await Order.findOne({ 
          'paiement.reference': req.params.transactionId 
        });
        
        if (order) {
          order.paiement.statut = 'reussi';
          order.paiement.datePaiement = new Date();
          order.statut = 'payee';
          await order.save();
        }
      }
    }
    
    res.json(statut);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @route   POST /api/webhooks/fedapay
// @desc    Webhook pour confirmer les paiements FedaPay
router.post('/fedapay', async (req, res) => {
  try {
    console.log('📩 Webhook reçu:', req.body);
    
    const { event, data } = req.body;
    
    // Vérifier que c'est un événement de paiement réussi
    if (event === 'transaction.approved' || event === 'transaction.successful') {
      const transactionId = data.id;
      // Essayer d'extraire l'ID de commande de la description
      const description = data.description || '';
      const orderIdMatch = description.match(/#([a-f0-9]+)/i);
      
      if (orderIdMatch && orderIdMatch[1]) {
        const orderId = orderIdMatch[1];
        console.log('🔍 Recherche commande:', orderId);
        
        const order = await Order.findById(orderId);
        
        if (order) {
          order.paiement.statut = 'reussi';
          order.paiement.datePaiement = new Date();
          order.paiement.reference = transactionId;
          order.statut = 'payee';
          await order.save();
          
          console.log(`✅ Commande ${orderId} marquée comme payée`);
        } else {
          console.log('❌ Commande non trouvée:', orderId);
        }
      }
    }
    
    // Toujours répondre 200 OK à FedaPay
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

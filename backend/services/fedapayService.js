const axios = require('axios');
require('dotenv').config();

class FedaPayService {
  constructor() {
    console.log('🔧 Initialisation FedaPay avec:');
    console.log('- Environnement:', process.env.FEDAPAY_ENVIRONMENT);
    
    this.baseURL = process.env.FEDAPAY_ENVIRONMENT === 'sandbox' 
      ? 'https://sandbox-api.fedapay.com/v1' 
      : 'https://api.fedapay.com/v1';
    this.apiKey = process.env.FEDAPAY_PRIVATE_KEY;
  }

  // Créer une transaction
  async createTransaction({ amount, telephone, orderId, mode }) {
    try {
      console.log('💰 Initiation paiement FedaPay:', {
        amount,
        telephone,
        orderId,
        mode
      });

      // Déterminer le mode de paiement FedaPay
      const modePaiement = mode === 'mtn' ? 'mtn_benin' : 'moov_benin';

      // Utiliser un email valide pour le test
      const email = `client${Date.now()}@test.com`;

      const response = await axios.post(
        `${this.baseURL}/transactions`,
        {
          description: `Commande Fresh Market #${orderId}`,
          amount: amount,
          currency: { iso: 'XOF' },
          callback_url: 'https://ton-site.com/callback', // À remplacer plus tard
          customer: {
            firstname: 'Client',
            lastname: 'Fresh',
            email: email, // ← Email valide obligatoire
            phone_number: {
              number: telephone,
              country: 'BJ'
            }
          },
          mode: modePaiement
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Api-Version': 'v1'
          }
        }
      );

      console.log('✅ Réponse FedaPay:', response.data);

      return {
        success: true,
        transactionId: response.data.id,
        status: response.data.status,
        paymentUrl: response.data.payment_url
      };
    } catch (error) {
      console.error('❌ Erreur FedaPay:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Vérifier le statut d'une transaction
  async checkTransaction(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Api-Version': 'v1'
          }
        }
      );

      return {
        success: true,
        status: response.data.status,
        transaction: response.data
      };
    } catch (error) {
      console.error('❌ Erreur vérification:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new FedaPayService();

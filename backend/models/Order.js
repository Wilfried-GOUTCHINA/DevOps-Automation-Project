const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  acheteurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fournisseurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  produits: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    nom: String,
    prixUnitaire: Number,
    quantite: Number,
    total: Number
  }],
  sousTotal: Number,
  fraisLivraison: {
    type: Number,
    default: 0
  },
  total: Number,
  adresseLivraison: {
    ville: String,
    quartier: String,
    instructions: String,
    telephone: String
  },
  statut: {
    type: String,
    enum: ['en_attente', 'payee', 'en_preparation', 'expediee', 'livree', 'annulee'],
    default: 'en_attente'
  },
  paiement: {
    mode: {
      type: String,
      enum: ['mtn', 'moov', 'cartes', 'especes']
    },
    reference: String,
    statut: {
      type: String,
      enum: ['en_attente', 'reussi', 'echoue'],
      default: 'en_attente'
    },
    montant: Number,
    transactionId: String,
    datePaiement: Date
  },
  historiqueStatuts: [{
    statut: String,
    date: {
      type: Date,
      default: Date.now
    },
    commentaire: String
  }],
  noteAcheteur: Number,
  commentaireAcheteur: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// PAS DE MIDDLEWARE PRE('SAVE') !

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  fournisseurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  categorie: {
    type: String,
    required: true,
    enum: [
      'ananas', 'mangue', 'banane', 'canne', 'orange', 'papaye',
      'tomate', 'oignon', 'gombo', 'aubergine', 'piment', 'concombre'
    ]
  },
  type: {
    type: String,
    enum: ['fruits', 'legumes'],
    required: true
  },
  description: String,
  prix: {
    type: Number,
    required: true,
    min: 0
  },
  unite: {
    type: String,
    enum: ['kg', 'pièce', 'tas', 'botte'],
    default: 'kg'
  },
  quantite: {
    type: Number,
    required: true,
    min: 0
  },
  photos: [String],
  disponible: {
    type: Boolean,
    default: true
  },
  localisation: {
    ville: String,
    quartier: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// PAS DE MIDDLEWARE pre('save') !

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  fournisseurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le fournisseur est requis']
  },
  nom: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: [
      // Fruits
      'ananas', 'mangue', 'banane', 'canne', 'orange', 'papaye', 'pastèque', 'citron',
      // Légumes
      'tomate', 'oignon', 'gombo', 'aubergine', 'piment', 'concombre', 'carotte', 'chou',
      'salade', 'haricot', 'poivron', 'courgette'
    ]
  },
  type: {
    type: String,
    enum: ['fruits', 'legumes'],
    required: [true, 'Le type (fruits/légumes) est requis']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: 500
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  unite: {
    type: String,
    enum: ['kg', 'pièce', 'tas', 'botte', 'sac'],
    default: 'kg'
  },
  quantite: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [0, 'La quantité ne peut pas être négative']
  },
  photos: [{
    type: String,
    required: [true, 'Au moins une photo est requise']
  }],
  disponible: {
    type: Boolean,
    default: true
  },
  localisation: {
    ville: { type: String, required: true },
    quartier: { type: String, required: true }
  },
  notes: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  nombreAvis: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mettre à jour la date de modification automatiquement
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index pour la recherche
productSchema.index({ nom: 'text', description: 'text' });
productSchema.index({ fournisseurId: 1 });
productSchema.index({ categorie: 1 });
productSchema.index({ type: 1 });
productSchema.index({ prix: 1 });
productSchema.index({ localisation: 1 });

module.exports = mongoose.model('Product', productSchema);


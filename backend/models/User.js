const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: String,
  telephone: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: String,
  'localisation.ville': String,
  'localisation.quartier': String,
  typeProduit: String
});

// Ajout de la méthode comparePassword
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

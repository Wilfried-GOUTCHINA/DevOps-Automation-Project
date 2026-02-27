import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    password: '',
    role: 'acheteur',
    localisation: {
      ville: '',
      quartier: ''
    },
    typeProduit: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Gestion des champs imbriqués (localisation.ville)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Préparer les données pour l'API
      const userData = {
        ...formData,
        typeProduit: formData.role === 'fournisseur' ? formData.typeProduit : null
      };
      
      const result = await register(userData);
      
      if (result.success) {
        // Rediriger selon le rôle
        if (formData.role === 'fournisseur') {
          navigate('/fournisseur/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-green-600">Fresh Market</Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Créer un compte</h2>
          <p className="text-gray-600">Rejoignez Fresh Market en tant qu'acheteur ou fournisseur</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Type de compte */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">Je suis *</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="acheteur"
                    checked={formData.role === 'acheteur'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Acheteur</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="fournisseur"
                    checked={formData.role === 'fournisseur'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Fournisseur / Producteur</span>
                </label>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Nom complet *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Téléphone *</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Mot de passe *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                  required
                  minLength="6"
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="mb-4">
              <h3 className="font-bold text-gray-700 mb-2">Localisation *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1">Ville</label>
                  <input
                    type="text"
                    name="localisation.ville"
                    value={formData.localisation.ville}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Quartier</label>
                  <input
                    type="text"
                    name="localisation.quartier"
                    value={formData.localisation.quartier}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Champ spécifique fournisseur */}
            {formData.role === 'fournisseur' && (
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Type de produits *</label>
                <select
                  name="typeProduit"
                  value={formData.typeProduit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                  required
                >
                  <option value="">Sélectionnez...</option>
                  <option value="fruits">Fruits</option>
                  <option value="legumes">Légumes</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Inscription en cours...' : "S'inscrire"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

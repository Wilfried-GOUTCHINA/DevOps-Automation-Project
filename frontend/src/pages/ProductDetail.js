import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAcheteur } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [modePaiement, setModePaiement] = useState('mtn');
  const [telephone, setTelephone] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');

  // Charger les détails du produit
  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Erreur chargement produit:', error);
      setError('Produit non trouvé');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer le paiement et la commande
  const handlePaiement = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAcheteur) {
      alert('Seuls les acheteurs peuvent passer commande');
      return;
    }

    if (!telephone) {
      alert('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setOrderLoading(true);
    setError('');

    try {
      // 1. Créer la commande
      const orderData = {
        produits: [
          {
            productId: product._id,
            quantite: quantity
          }
        ],
        adresseLivraison: {
          ville: user?.localisation?.ville || 'Cotonou',
          quartier: user?.localisation?.quartier || 'Centre',
          instructions: 'Sonner avant de livrer'
        }
      };

      const token = localStorage.getItem('token');
      const orderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (orderResponse.data.success) {
        const orderId = orderResponse.data.order._id;
        
        // 2. Initier le paiement
        const paymentResponse = await axios.post(`http://localhost:5000/api/payments/initier/${orderId}`, {
          modePaiement,
          telephone
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (paymentResponse.data.success) {
          setOrderSuccess(true);
          setTimeout(() => {
            navigate('/acheteur/dashboard');
          }, 2000);
        } else {
          setError(paymentResponse.data.message);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Produit non trouvé'}</h2>
          <Link to="/" className="text-green-600 hover:text-green-700">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Navigation */}
      <nav className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-green-600">Fresh Market</Link>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Galerie d'images */}
            <div className="md:w-1/2">
              {product.photos && product.photos.length > 0 ? (
                <img 
                  src={product.photos[0]} 
                  alt={product.nom}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <img 
                  src="https://via.placeholder.com/600x400?text=Fresh+Market" 
                  alt={product.nom}
                  className="w-full h-96 object-cover"
                />
              )}
            </div>

            {/* Détails du produit */}
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mb-2">
                  {product.type === 'fruits' ? '🍎 Fruits' : '🥕 Légumes'}
                </span>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.nom}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>
              </div>

              {/* Informations fournisseur */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Producteur</h3>
                <p className="text-gray-600">{product.fournisseurId?.nom || 'Non spécifié'}</p>
                <p className="text-gray-600">
                  📍 {product.localisation?.ville}, {product.localisation?.quartier}
                </p>
                {product.fournisseurId?.telephone && (
                  <p className="text-gray-600">📞 {product.fournisseurId.telephone}</p>
                )}
              </div>

              {/* Prix et stock */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-3xl font-bold text-green-600">{product.prix} FCFA</span>
                  <span className="text-gray-500 text-sm ml-1">/{product.unite}</span>
                </div>
                <div className={`font-semibold ${product.quantite > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantite > 0 ? `✓ ${product.quantite} ${product.unite} disponibles` : 'Rupture de stock'}
                </div>
              </div>

              {/* Zone de commande et paiement */}
              {product.quantite > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Passer une commande</h3>
                  
                  {orderSuccess ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                      ✅ Commande réussie ! Redirection vers votre dashboard...
                    </div>
                  ) : (
                    <>
                      {/* Sélection quantité */}
                      <div className="flex items-center mb-4">
                        <label className="mr-4 font-medium">Quantité :</label>
                        <input
                          type="number"
                          min="1"
                          max={product.quantite}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded text-center"
                        />
                        <span className="ml-2 text-gray-600">{product.unite}</span>
                      </div>

                      {/* Total */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between">
                          <span>Prix unitaire</span>
                          <span>{product.prix} FCFA</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-2">
                          <span>Total</span>
                          <span className="text-green-600">{product.prix * quantity} FCFA</span>
                        </div>
                      </div>

                      {/* Formulaire de paiement */}
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Mode de paiement</label>
                        <div className="flex space-x-4 mb-4">
                          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="modePaiement"
                              value="mtn"
                              checked={modePaiement === 'mtn'}
                              onChange={(e) => setModePaiement(e.target.value)}
                              className="mr-2"
                            />
                            <span>📱 MTN Money</span>
                          </label>
                          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="modePaiement"
                              value="moov"
                              checked={modePaiement === 'moov'}
                              onChange={(e) => setModePaiement(e.target.value)}
                              className="mr-2"
                            />
                            <span>📞 Moov Money</span>
                          </label>
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 font-medium mb-2">Numéro de téléphone</label>
                          <input
                            type="tel"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            placeholder="Ex: 66000001"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                            required
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Numéro MTN ou Moov pour recevoir la demande de paiement
                          </p>
                        </div>
                      </div>

                      {/* Message d'erreur */}
                      {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                          {error}
                        </div>
                      )}

                      {/* Bouton commander */}
                      <button
                        onClick={handlePaiement}
                        disabled={orderLoading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {orderLoading ? 'Traitement...' : 'Payer et commander'}
                      </button>

                      {!isAuthenticated && (
                        <p className="text-center text-sm text-gray-500 mt-4">
                          <Link to="/login" className="text-green-600 hover:text-green-700">
                            Connectez-vous
                          </Link> pour passer une commande
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

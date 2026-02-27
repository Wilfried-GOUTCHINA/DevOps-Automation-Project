import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardAcheteur = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const token = localStorage.getItem('token');

  // Configuration d'axios avec le token
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  // Charger les commandes
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders/acheteur');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour annuler une commande
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Voulez-vous vraiment annuler cette commande ?')) {
      try {
        await api.post(`/orders/${orderId}/annuler`);
        loadOrders(); // Recharger la liste
      } catch (error) {
        alert('Erreur lors de l\'annulation');
      }
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'payee': 'bg-blue-100 text-blue-800',
      'en_preparation': 'bg-purple-100 text-purple-800',
      'expediee': 'bg-indigo-100 text-indigo-800',
      'livree': 'bg-green-100 text-green-800',
      'annulee': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Fonction pour traduire le statut
  const getStatusText = (status) => {
    const texts = {
      'en_attente': 'En attente de paiement',
      'payee': 'Payée',
      'en_preparation': 'En préparation',
      'expediee': 'Expédiée',
      'livree': 'Livrée',
      'annulee': 'Annulée'
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-600">Fresh Market</Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Bonjour, {user?.nom}</span>
            <Link to="/" className="text-green-600 hover:text-green-700">Accueil</Link>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Mes commandes</h1>
        
        {loading ? (
          <div className="text-center py-12">Chargement de vos commandes...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Vous n'avez pas encore de commandes.</p>
            <Link 
              to="/" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-block"
            >
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm text-gray-500">
                      Commande du {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <p className="font-semibold mt-1">
                      Fournisseur: {order.fournisseurId?.nom}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.statut)}`}>
                      {getStatusText(order.statut)}
                    </span>
                    <p className="text-xl font-bold text-green-600 mt-2">
                      {order.total} FCFA
                    </p>
                  </div>
                </div>

                {/* Liste des produits */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Produits commandés :</h3>
                  {order.produits.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm mb-2">
                      <span>
                        {item.nom} x {item.quantite} {item.unite || 'pièce'}
                      </span>
                      <span className="font-medium">{item.total} FCFA</span>
                    </div>
                  ))}
                </div>

                {/* Adresse de livraison */}
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm text-gray-600">
                    📍 Livraison: {order.adresseLivraison.quartier}, {order.adresseLivraison.ville}
                  </p>
                  {order.adresseLivraison.instructions && (
                    <p className="text-sm text-gray-500 mt-1">
                      Note: {order.adresseLivraison.instructions}
                    </p>
                  )}
                </div>

                {/* Bouton d'annulation (si commande en attente) */}
                {order.statut === 'en_attente' && (
                  <div className="border-t pt-4 mt-2">
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Annuler la commande
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAcheteur;

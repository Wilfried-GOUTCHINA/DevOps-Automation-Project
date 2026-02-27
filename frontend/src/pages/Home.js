import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated, user, logout } = useAuth();

  // Charger les produits au démarrage
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    // Filtre par type (fruits/légumes)
    if (filter !== 'all' && product.type !== filter) return false;
    
    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return product.nom.toLowerCase().includes(search) ||
             product.description.toLowerCase().includes(search) ||
             product.categorie.toLowerCase().includes(search);
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation avec bouton de déconnexion */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-600">Fresh Market</Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">Bonjour, {user?.nom}</span>
                {user?.role === 'fournisseur' && (
                  <Link 
                    to="/fournisseur/dashboard" 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Dashboard
                  </Link>
                )}
                {user?.role === 'acheteur' && (
                  <Link 
                    to="/acheteur/dashboard" 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Mes commandes
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-green-600 hover:text-green-700">Connexion</Link>
                <Link 
                  to="/register" 
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Barre de recherche */}
      <div className="bg-green-600 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Fresh Market</h1>
          <p className="text-xl text-green-100 mb-8">
            Les meilleurs fruits et légumes frais directement des producteurs
          </p>
          
          {/* Barre de recherche */}
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Rechercher un produit (ananas, tomate, etc.)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full transition ${
              filter === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('fruits')}
            className={`px-6 py-2 rounded-full transition ${
              filter === 'fruits' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Fruits
          </button>
          <button
            onClick={() => setFilter('legumes')}
            className={`px-6 py-2 rounded-full transition ${
              filter === 'legumes' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Légumes
          </button>
        </div>

        {/* Grille de produits */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Chargement des produits...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link 
                to={`/product/${product._id}`} 
                key={product._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1"
              >
                <div className="relative pb-2/3">
                  <img 
                    src={product.photos && product.photos[0] ? product.photos[0] : 'https://via.placeholder.com/300x200?text=Fresh+Market'} 
                    alt={product.nom}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{product.nom}</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {product.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green-600 font-bold text-xl">
                        {product.prix} FCFA
                      </span>
                      <span className="text-gray-500 text-sm">/{product.unite}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.localisation?.ville}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Par {product.fournisseurId?.nom || 'Producteur'}
                    </span>
                    <span className={`font-medium ${
                      product.quantite > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.quantite > 0 ? `${product.quantite} dispo` : 'Rupture'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500">
          <p>© 2026 Fresh Market - Des fruits et légumes frais directement du producteur</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

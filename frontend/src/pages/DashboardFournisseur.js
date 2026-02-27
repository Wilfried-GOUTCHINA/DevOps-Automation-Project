import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardFournisseur = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    categorie: '',
    type: 'fruits',
    description: '',
    prix: '',
    unite: 'kg',
    quantite: '',
    photos: [],
    disponible: true
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Configuration d'axios avec le token
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  // Charger les produits du fournisseur
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products/mes-produits');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gérer la sélection de fichier
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  // Uploader l'image
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          photos: [response.data.imageUrl, ...prev.photos]
        }));
        setSelectedFile(null);
        setPreviewUrl('');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: '',
      categorie: '',
      type: 'fruits',
      description: '',
      prix: '',
      unite: 'kg',
      quantite: '',
      photos: [],
      disponible: true
    });
    setEditingProduct(null);
    setShowAddForm(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setSuccess('');
  };

  // Ajouter ou modifier un produit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const productData = {
        ...formData,
        prix: parseFloat(formData.prix),
        quantite: parseInt(formData.quantite)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productData);
        setSuccess('Produit modifié avec succès !');
      } else {
        await api.post('/products', productData);
        setSuccess('Produit ajouté avec succès !');
      }

      loadProducts();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  // Éditer un produit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom,
      categorie: product.categorie,
      type: product.type,
      description: product.description,
      prix: product.prix,
      unite: product.unite,
      quantite: product.quantite,
      photos: product.photos || [],
      disponible: product.disponible
    });
    setShowAddForm(true);
  };

  // Supprimer un produit
  const handleDelete = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await api.delete(`/products/${productId}`);
        setSuccess('Produit supprimé avec succès !');
        loadProducts();
      } catch (error) {
        setError(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  // Changer la disponibilité
  const toggleDisponibilite = async (product) => {
    try {
      await api.patch(`/products/${product._id}/disponibilite`, {
        disponible: !product.disponible
      });
      loadProducts();
    } catch (error) {
      setError('Erreur lors du changement de disponibilité');
    }
  };

  // Catégories disponibles
  const categories = {
    fruits: ['ananas', 'mangue', 'banane', 'canne', 'orange', 'papaye', 'pastèque', 'citron'],
    legumes: ['tomate', 'oignon', 'gombo', 'aubergine', 'piment', 'concombre', 'carotte', 'chou']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-600">Fresh Market</Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Fournisseur: {user?.nom}</span>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Mon Dashboard Fournisseur</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {showAddForm ? 'Annuler' : '+ Ajouter un produit'}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Formulaire d'ajout/modification */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
            </h2>
            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nom du produit *</label>
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
                  <label className="block text-gray-700 font-medium mb-2">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    required
                  >
                    <option value="fruits">Fruits</option>
                    <option value="legumes">Légumes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Catégorie *</label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    required
                  >
                    <option value="">Sélectionnez</option>
                    {categories[formData.type]?.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Prix (FCFA) *</label>
                  <input
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Unité *</label>
                  <select
                    name="unite"
                    value={formData.unite}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                  >
                    <option value="kg">Kilogramme (kg)</option>
                    <option value="pièce">Pièce</option>
                    <option value="tas">Tas</option>
                    <option value="botte">Botte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Quantité *</label>
                  <input
                    type="number"
                    name="quantite"
                    value={formData.quantite}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    required
                  />
                </div>

                {/* Upload d'image */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Photos du produit
                  </label>
                  
                  {/* Prévisualisation */}
                  {previewUrl && (
                    <div className="mb-4">
                      <img 
                        src={previewUrl} 
                        alt="Prévisualisation" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Sélection de fichier */}
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploading ? 'Upload...' : 'Uploader'}
                    </button>
                  </div>

                  {/* Liste des photos existantes */}
                  {formData.photos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Photos uploadées :</p>
                      <div className="flex space-x-2 flex-wrap gap-2">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={photo} 
                              alt={`Produit ${index + 1}`} 
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  photos: prev.photos.filter((_, i) => i !== index)
                                }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Formats acceptés : JPG, PNG, GIF. Max 5MB.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="disponible"
                      checked={formData.disponible}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Produit disponible à la vente</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  {editingProduct ? 'Modifier' : 'Ajouter'} le produit
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des produits */}
        {loading ? (
          <div className="text-center py-12">Chargement de vos produits...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-4">Vous n'avez pas encore de produits</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Ajouter votre premier produit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={product.photos?.[0] || 'https://via.placeholder.com/400x300?text=Produit'}
                  alt={product.nom}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{product.nom}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.type === 'fruits' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {product.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{product.categorie}</p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-600 font-bold">{product.prix} FCFA</span>
                    <span className="text-sm text-gray-500">{product.quantite} {product.unite}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={product.disponible}
                        onChange={() => toggleDisponibilite(product)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Disponible</span>
                    </label>
                    <span className={`text-sm font-medium ${
                      product.quantite > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Stock: {product.quantite}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFournisseur;

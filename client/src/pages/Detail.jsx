import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ModelViewer from '../components/ModelViewer';
import { Heart, ChevronLeft, Layers, Sparkles, Check, AlertCircle } from 'lucide-react';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, toggleWishlist, isInWishlist } = useAuth();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.furniture.getById(id);
        if (res.success) {
          setItem(res.data);
        } else {
          setError(res.message || 'Furniture not found');
        }
      } catch (err) {
        setError('Could not connect to database furniture detail API.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleWishlist = async () => {
    if (!user) {
      alert('Please sign in to wishlist items.');
      return;
    }
    await toggleWishlist(item._id);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading furniture details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Product</h3>
        <p className="text-slate-400 mb-6">{error || 'Product not found'}</p>
        <Link to="/catalog" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isFav = isInWishlist(item._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/catalog"
        className="inline-flex items-center space-x-1.5 text-sm text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: 3D Preview Canvas */}
        <div className="h-[400px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl relative border border-slate-900">
          <ModelViewer modelUrl={item.modelUrl} dimensions={item.dimensions} />
          
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center space-x-1 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-primary-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">
                Interactive 3D Preview
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Actions */}
        <div className="flex flex-col justify-between p-2">
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <span className="bg-primary-600/20 text-primary-400 border border-primary-500/25 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                {item.category}
              </span>
              <span className="text-xs text-slate-500">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white mb-4">
              {item.name}
            </h1>

            <div className="font-outfit text-3xl font-extrabold text-primary-400 mb-6">
              ${item.price.toFixed(2)}
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {item.description}
            </p>

            {/* Dimensions Grid info */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-850 mb-8">
              <h3 className="text-slate-200 text-xs font-semibold uppercase tracking-wider mb-4">
                Furniture Dimensions
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/60">
                  <div className="text-xs text-slate-500 mb-1">Width</div>
                  <div className="text-sm font-bold text-white">{item.dimensions.width} m</div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/60">
                  <div className="text-xs text-slate-500 mb-1">Height</div>
                  <div className="text-sm font-bold text-white">{item.dimensions.height} m</div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/60">
                  <div className="text-xs text-slate-500 mb-1">Depth</div>
                  <div className="text-sm font-bold text-white">{item.dimensions.depth} m</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-900/60">
            <button
              onClick={() => navigate('/workspace', { state: { placeItem: item } })}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-600/20 hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Layers className="w-5 h-5" />
              <span>Place in Room (AR)</span>
            </button>

            <button
              onClick={handleWishlist}
              className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-xl border font-semibold transition-all cursor-pointer ${
                isFav
                  ? 'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/15'
                  : 'border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
              <span>{isFav ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;

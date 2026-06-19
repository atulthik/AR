import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Search, Heart, Eye, Layers, AlertCircle, ShoppingBag } from 'lucide-react';

const Catalog = () => {
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState(['All', 'Sofa', 'Chair', 'Table', 'Bed', 'Lighting', 'Decor']);
  const [error, setError] = useState('');

  const { user, toggleWishlist, isInWishlist } = useAuth();

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await api.furniture.getAll(search, category);
      if (res.success) {
        setFurniture(res.data);
      } else {
        setError(res.message || 'Failed to fetch catalog');
      }
    } catch (err) {
      setError('Could not connect to backend server catalog API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCatalog();
    }, 300); // Debounce search changes

    return () => clearTimeout(delayDebounce);
  }, [search, category]);

  const handleWishlist = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }
    await toggleWishlist(id);
  };

  const getFallbackGradient = (cat) => {
    switch (cat) {
      case 'Sofa': return 'from-indigo-600/40 to-purple-600/20';
      case 'Chair': return 'from-violet-600/40 to-fuchsia-600/20';
      case 'Table': return 'from-blue-600/40 to-cyan-600/20';
      case 'Bed': return 'from-emerald-600/40 to-teal-600/20';
      case 'Lighting': return 'from-amber-500/40 to-yellow-600/20';
      case 'Decor': return 'from-rose-500/40 to-orange-500/20';
      default: return 'from-slate-700/40 to-slate-800/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Furniture Catalog
          </h1>
          <p className="text-slate-400 text-sm">
            Browse premium 3D furniture models designed for direct camera visual overlay
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search catalog by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-primary-500 text-white rounded-xl pl-10.5 pr-4 py-2.5 text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* Category Pills Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-all duration-200 ${
              category === cat
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25 scale-102'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat}s
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card h-80 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : furniture.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl border border-slate-800">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-outfit text-xl font-bold text-slate-300">No items found</h3>
          <p className="text-slate-500 text-sm mt-1">Try tweaking your search or category filters.</p>
        </div>
      ) : (
        /* Catalog Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {furniture.map((item) => {
            const isFav = isInWishlist(item._id);
            const isLocalUpload = item.image && item.image.startsWith('/uploads/');
            const resolvedImgUrl = isLocalUpload ? `http://localhost:5000${item.image}` : item.image;

            return (
              <div key={item._id} className="group glass-card rounded-3xl overflow-hidden flex flex-col justify-between">
                <div className="relative">
                  {/* Image/Fallback Box */}
                  {item.image ? (
                    <div className="w-full h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
                      <img
                        src={resolvedImgUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className={`w-full h-48 bg-gradient-to-tr ${getFallbackGradient(item.category)} flex flex-col items-center justify-center relative`}>
                      <span className="font-outfit font-bold text-white/40 tracking-wider text-xl uppercase">
                        {item.category}
                      </span>
                      <span className="text-xs text-white/30 mt-1 uppercase tracking-widest">
                        {item.dimensions.width}m x {item.dimensions.height}m x {item.dimensions.depth}m
                      </span>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-slate-950/80 backdrop-blur-md text-primary-400 border border-slate-800 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => handleWishlist(item._id, e)}
                    className="absolute top-4 right-4 p-2.5 bg-slate-950/80 backdrop-blur-md rounded-full border border-slate-800 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                  </button>
                </div>

                {/* Content Card Info */}
                <div className="p-6">
                  <h3 className="font-outfit text-xl font-bold text-white mb-2 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-900/60">
                    <span className="font-outfit text-xl font-extrabold text-white">
                      ${item.price.toFixed(2)}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/furniture/${item._id}`}
                        className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/workspace"
                        state={{ placeItem: item }}
                        className="flex items-center space-x-1.5 bg-primary-600 hover:bg-primary-500 text-white px-4.5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-primary-600/15 hover:shadow-primary-600/25 transition-all"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Try in Room</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;

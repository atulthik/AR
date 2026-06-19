import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, ClipboardList, Heart, Share2, Play, Trash, AlertCircle, Sparkles, Copy, Check } from 'lucide-react';

const Dashboard = () => {
  const { user, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  
  const [designs, setDesigns] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  
  const fetchDesigns = async () => {
    try {
      const res = await api.designs.getAll();
      if (res.success) {
        setDesigns(res.data);
      }
    } catch (err) {
      console.error('Error fetching designs:', err);
    } finally {
      setLoadingDesigns(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.auth.getWishlist();
      if (res.success) {
        setWishlistItems(res.wishlist);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDesigns();
      fetchWishlist();
    }
  }, [user]);

  const handleRemoveWishlist = async (id, e) => {
    e.preventDefault();
    await toggleWishlist(id);
    // Refresh local list
    setWishlistItems(prev => prev.filter(item => item._id !== id));
  };

  const handleCopyLink = (designId) => {
    const shareUrl = `${window.location.origin}/share/${designId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(designId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadDesign = (design) => {
    navigate('/workspace', { state: { loadDesign: design } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Header Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-900 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center space-x-5">
          <div className="bg-gradient-to-tr from-primary-600 to-indigo-500 p-4.5 rounded-2xl shadow-xl shadow-primary-500/10">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">
              {user?.name}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
            <div className="inline-flex items-center space-x-1.5 mt-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs text-slate-300 capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
              <span>Account type: {user?.role}</span>
            </div>
          </div>
        </div>

        <Link
          to="/workspace"
          className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-center"
        >
          Open Empty Workspace
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Room Designs */}
        <div>
          <div className="flex items-center space-x-2.5 mb-6">
            <ClipboardList className="w-5 h-5 text-primary-400" />
            <h2 className="font-outfit text-xl font-bold text-white">Saved Room Designs</h2>
          </div>

          {loadingDesigns ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="glass-card h-24 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 border border-slate-900 rounded-3xl">
              <p className="text-slate-500 text-sm">No saved layout configurations yet.</p>
              <Link to="/workspace" className="text-primary-400 text-sm hover:underline mt-2 inline-block">
                Start layout design
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {designs.map((design) => (
                <div
                  key={design._id}
                  className="glass-card p-5 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-outfit font-bold text-white text-base leading-snug">
                      {design.roomName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Contains {design.furniture.length} placed items •{' '}
                      {new Date(design.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => loadDesign(design)}
                      className="p-2 bg-primary-600/10 text-primary-400 hover:bg-primary-600 hover:text-white rounded-xl border border-primary-500/25 transition-all cursor-pointer"
                      title="Load design in workspace"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleCopyLink(design._id)}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                      title="Copy shareable link"
                    >
                      {copiedId === design._id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Wishlist Items */}
        <div>
          <div className="flex items-center space-x-2.5 mb-6">
            <Heart className="w-5 h-5 text-rose-500" />
            <h2 className="font-outfit text-xl font-bold text-white">Your Wishlist</h2>
          </div>

          {loadingWishlist ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="glass-card h-24 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 border border-slate-900 rounded-3xl">
              <p className="text-slate-500 text-sm">Your wishlist is currently empty.</p>
              <Link to="/catalog" className="text-primary-400 text-sm hover:underline mt-2 inline-block">
                View furniture items
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => {
                const isLocalUpload = item.image && item.image.startsWith('/uploads/');
                const resolvedImg = isLocalUpload ? `http://localhost:5000${item.image}` : item.image;
                
                return (
                  <div
                    key={item._id}
                    className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Image Preview Thumbnail */}
                      {item.image ? (
                        <img
                          src={resolvedImg}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl bg-slate-900"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {item.category}
                        </div>
                      )}
                      <div>
                        <h3 className="font-outfit font-bold text-white text-sm leading-snug line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-primary-400 font-semibold mt-0.5">
                          ${item.price.toFixed(2)}
                        </p>
                        <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-1 inline-block">
                          {item.dimensions.width}m x {item.dimensions.height}m x {item.dimensions.depth}m
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/furniture/${item._id}`}
                        className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all"
                        title="View product detail"
                      >
                        <Play className="w-4 h-4 rotate-90" />
                      </Link>
                      <button
                        onClick={(e) => handleRemoveWishlist(item._id, e)}
                        className="p-2 bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-rose-400 hover:bg-rose-500/15 rounded-xl transition-all cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

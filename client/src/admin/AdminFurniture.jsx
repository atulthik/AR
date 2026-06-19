import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PackagePlus, Edit, Trash2, ArrowLeft, Image, Box, Check, AlertCircle } from 'lucide-react';

const AdminFurniture = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [editId, setEditId] = useState(null); // null if adding
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Chair');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [width, setWidth] = useState('0.8');
  const [height, setHeight] = useState('0.9');
  const [depth, setDepth] = useState('0.8');
  const [imageFile, setImageFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.furniture.getAll();
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      setError('Could not retrieve catalog items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName('');
    setCategory('Chair');
    setPrice('');
    setDescription('');
    setWidth('0.8');
    setHeight('0.9');
    setDepth('0.8');
    setImageFile(null);
    setModelFile(null);
    // Reset file inputs manually
    document.getElementById('imageInput').value = '';
    document.getElementById('modelInput').value = '';
  };

  const handleEditSelect = (item) => {
    setEditId(item._id);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setDescription(item.description);
    setWidth(item.dimensions.width.toString());
    setHeight(item.dimensions.height.toString());
    setDepth(item.dimensions.depth.toString());
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      const res = await api.furniture.delete(id);
      if (res.success) {
        setSuccess('Furniture item successfully deleted!');
        fetchItems();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Delete failed');
      }
    } catch (err) {
      setError('Connection failed. Could not delete.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name || !price || !description || !width || !height || !depth) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('width', width);
      formData.append('height', height);
      formData.append('depth', depth);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (modelFile) {
        formData.append('model', modelFile);
      }

      let res;
      if (editId) {
        res = await api.furniture.update(editId, formData);
      } else {
        res = await api.furniture.create(formData);
      }

      if (res.success) {
        setSuccess(editId ? 'Item updated successfully!' : 'Item added successfully!');
        resetForm();
        fetchItems();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Submission failed');
      }
    } catch (err) {
      setError('Server upload failed. Check file limits or credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation header */}
      <div className="flex items-center space-x-2.5 mb-10">
        <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white">Catalog Management</h1>
          <p className="text-slate-400 text-sm">Add, modify, and upload items to AuraSpace catalog</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm mb-8 flex items-center space-x-2">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-8 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Form Section */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-900 h-fit">
          <h2 className="font-outfit text-xl font-bold text-white mb-6">
            {editId ? 'Modify Furniture Item' : 'Add New Furniture'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Item Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Nordic Lounge Armchair"
                className="w-full bg-slate-950 border border-slate-900 focus:border-primary-500 text-white rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-primary-500 text-white rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer"
                >
                  <option value="Chair" className="bg-slate-950">Chair</option>
                  <option value="Sofa" className="bg-slate-950">Sofa</option>
                  <option value="Table" className="bg-slate-950">Table</option>
                  <option value="Bed" className="bg-slate-950">Bed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="249.99"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-primary-500 text-white rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Description *</label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product descriptions..."
                className="w-full bg-slate-950 border border-slate-900 focus:border-primary-500 text-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
              ></textarea>
            </div>

            {/* Dimensions Section */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900/60">
              <span className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">Dimensions (meters) *</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Width</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 text-center text-sm py-1.5 rounded-lg text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Height</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 text-center text-sm py-1.5 rounded-lg text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Depth</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 text-center text-sm py-1.5 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* Media Uploads */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Image className="w-3.5 h-3.5" />
                <span>Thumbnail Image (.png/.jpg)</span>
              </label>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-slate-400 text-xs file:bg-slate-900 file:border-slate-800 file:text-slate-300 file:px-3 file:py-1.5 file:rounded-xl file:mr-3 file:hover:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Box className="w-3.5 h-3.5" />
                <span>3D GLB Model File (.glb)</span>
              </label>
              <input
                id="modelInput"
                type="file"
                accept=".glb"
                onChange={(e) => setModelFile(e.target.files[0])}
                className="w-full text-slate-400 text-xs file:bg-slate-900 file:border-slate-800 file:text-slate-300 file:px-3 file:py-1.5 file:rounded-xl file:mr-3 file:hover:bg-slate-800"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-grow bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{editId ? 'Update Catalog' : 'Publish Furniture'}</span>
                )}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Columns: Current Catalog List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-900">
          <h2 className="font-outfit text-xl font-bold text-white mb-6">Catalog Listings</h2>

          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading catalog items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-slate-500">Catalog is empty. Add items using the form.</div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-950 border border-slate-900 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                      {item.category[0]}
                    </div>
                    <div>
                      <h4 className="font-outfit font-bold text-sm text-white line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-primary-400 mt-0.5">${item.price.toFixed(2)}</p>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block">
                        Dim: {item.dimensions.width}m x {item.dimensions.height}m x {item.dimensions.depth}m
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditSelect(item)}
                      className="p-2 bg-slate-950 border border-slate-900 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                      title="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-rose-400 hover:bg-rose-500/15 rounded-xl transition-all cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFurniture;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Layout, Tag, DollarSign, ArrowRight, ShieldAlert, Award, PackagePlus } from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.admin.getAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        } else {
          setError(res.message || 'Failed to retrieve analytics');
        }
      } catch (err) {
        setError('Failed to fetch admin telemetry stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading admin analytics data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white flex items-center space-x-2.5">
            <ShieldAlert className="w-8 h-8 text-primary-400" />
            <span>Admin Portal Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Catalog insights, wishlist trends, and database telemetry metrics
          </p>
        </div>

        <div className="flex space-x-3">
          <Link
            to="/admin/furniture"
            className="flex items-center space-x-1.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Manage Catalog</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-8">
          {error}
        </div>
      )}

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-extrabold text-white mt-1">{analytics?.totalUsers}</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Catalog Items</div>
            <div className="text-2xl font-extrabold text-white mt-1">{analytics?.totalFurniture}</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Categories</div>
            <div className="text-2xl font-extrabold text-white mt-1">{analytics?.totalCategories}</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg Catalog Price</div>
            <div className="text-2xl font-extrabold text-white mt-1">${analytics?.averagePrice?.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Category Breakdown Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-900">
          <h2 className="font-outfit text-lg font-bold text-white mb-6">Category Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-900/60 text-slate-500">
                  <th className="pb-3 font-semibold uppercase tracking-wider">Category</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider">Total Items</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.categories?.map((cat, idx) => (
                  <tr key={idx} className="border-b border-slate-900/40 text-slate-300">
                    <td className="py-3.5 font-medium text-white">{cat.category}s</td>
                    <td className="py-3.5">{cat.count}</td>
                    <td className="py-3.5">${cat.avgPrice?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Wishlisted Items */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-900">
          <h2 className="font-outfit text-lg font-bold text-white mb-6 flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span>Popular Items (Top Wishlisted)</span>
          </h2>
          {analytics?.popularFurniture?.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No items wishlisted yet.</p>
          ) : (
            <div className="space-y-4">
              {analytics?.popularFurniture?.map((pop, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
                  <div>
                    <h4 className="font-outfit font-bold text-sm text-white">{pop.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-1 inline-block">
                      {pop.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-primary-600/10 border border-primary-500/20 text-primary-400 font-bold px-2.5 py-1 rounded-full">
                      {pop.wishlistCount} saves
                    </span>
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

export default AdminDashboard;

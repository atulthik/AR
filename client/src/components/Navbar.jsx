import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Layout, ShieldAlert, LogOut, User, Menu, X, Layers } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Catalog', path: '/catalog', icon: Compass },
    { name: 'AR Workspace', path: '/workspace', icon: Layers },
  ];

  if (user) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard', icon: User });
    if (user.role === 'admin') {
      navLinks.push({ name: 'Admin Portal', path: '/admin', icon: ShieldAlert });
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800 px-4 py-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-gradient-to-tr from-primary-600 to-indigo-400 p-2 rounded-xl shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="font-outfit font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Aura<span className="text-primary-500">Space</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Desktop Action Button */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-medium text-slate-300">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:brightness-110 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            {user ? (
              <>
                <div className="px-4 py-2.5 text-sm font-medium text-slate-400">
                  Logged in as <span className="text-white">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-4 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 text-center text-sm font-medium text-slate-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 text-center bg-primary-600 text-white rounded-xl text-sm font-medium shadow-md shadow-primary-600/15"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

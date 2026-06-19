import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.auth.getProfile();
          if (res.success) {
            setUser(res);
            // Fetch wishlist
            const wRes = await api.auth.getWishlist();
            if (wRes.success) {
              setWishlist(wRes.wishlist.map(item => item._id || item));
            }
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Failed to load user profile:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser({
          _id: res._id,
          name: res.name,
          email: res.email,
          role: res.role,
        });
        
        // Fetch wishlist
        const wRes = await api.auth.getWishlist();
        if (wRes.success) {
          setWishlist(wRes.wishlist.map(item => item._id || item));
        }
        return { success: true };
      } else {
        return { success: false, message: res.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Server error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'user') => {
    setLoading(true);
    try {
      const res = await api.auth.register({ name, email, password, role });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser({
          _id: res._id,
          name: res.name,
          email: res.email,
          role: res.role,
        });
        setWishlist([]);
        return { success: true };
      } else {
        return { success: false, message: res.message || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Server error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setWishlist([]);
  };

  const toggleWishlist = async (furnitureId) => {
    if (!user) return { success: false, message: 'Please login to use wishlist' };

    const isFav = wishlist.includes(furnitureId);
    try {
      if (isFav) {
        const res = await api.auth.removeFromWishlist(furnitureId);
        if (res.success) {
          setWishlist(prev => prev.filter(id => id !== furnitureId));
          return { success: true, added: false };
        }
      } else {
        const res = await api.auth.addToWishlist(furnitureId);
        if (res.success) {
          setWishlist(prev => [...prev, furnitureId]);
          return { success: true, added: true };
        }
      }
      return { success: false, message: 'Wishlist sync failed' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const isInWishlist = (furnitureId) => {
    return wishlist.includes(furnitureId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wishlist,
        loading,
        login,
        register,
        logout,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

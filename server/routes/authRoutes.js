const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

router.route('/wishlist')
  .get(protect, getWishlist);

router.route('/wishlist/:id')
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

module.exports = router;

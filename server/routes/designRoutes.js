const express = require('express');
const router = express.Router();
const {
  saveDesign,
  getSavedDesigns,
  getDesignById,
} = require('../controllers/designController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, saveDesign)
  .get(protect, getSavedDesigns);

router.route('/:id')
  .get(getDesignById); // Publicly accessible to enable design sharing links

module.exports = router;

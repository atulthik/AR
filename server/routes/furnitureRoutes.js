const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getFurniture,
  getFurnitureById,
  createFurniture,
  updateFurniture,
  deleteFurniture,
} = require('../controllers/furnitureController');
const { protect, admin } = require('../middleware/auth');

// Multer memory storage configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB upload limit to handle GLB models
  },
});

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'model', maxCount: 1 },
]);

router.route('/')
  .get(getFurniture)
  .post(protect, admin, uploadFields, createFurniture);

router.route('/:id')
  .get(getFurnitureById)
  .put(protect, admin, uploadFields, updateFurniture)
  .delete(protect, admin, deleteFurniture);

module.exports = router;

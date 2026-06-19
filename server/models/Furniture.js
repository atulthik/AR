const mongoose = require('mongoose');

const FurnitureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a furniture name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    trim: true,
  },
  image: {
    type: String,
    default: '', // Cloudinary or local file URL
  },
  modelUrl: {
    type: String,
    default: '', // Cloudinary or local GLB URL
  },
  dimensions: {
    width: {
      type: Number,
      required: [true, 'Please specify width in meters'],
    },
    height: {
      type: Number,
      required: [true, 'Please specify height in meters'],
    },
    depth: {
      type: Number,
      required: [true, 'Please specify depth in meters'],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Furniture', FurnitureSchema);

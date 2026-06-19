const mongoose = require('mongoose');

const DesignItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Furniture',
    required: true,
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  rotation: {
    type: Number,
    default: 0, // Rotation around Y axis in radians
  },
  scale: {
    type: Number,
    default: 1, // Uniform scale multiplier
  },
});

const SavedDesignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roomName: {
    type: String,
    required: [true, 'Please add a name for this room layout'],
    trim: true,
  },
  furniture: [DesignItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SavedDesign', SavedDesignSchema);

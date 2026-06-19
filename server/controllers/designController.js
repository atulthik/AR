const SavedDesign = require('../models/SavedDesign');

// @desc    Save or Update a room design
// @route   POST /api/designs
// @access  Private
exports.saveDesign = async (req, res) => {
  try {
    const { roomName, furniture, designId } = req.body;
    const userId = req.user._id;

    if (!roomName) {
      return res.status(400).json({ success: false, message: 'Please provide a room name' });
    }

    let design;

    if (designId) {
      // Update existing design
      design = await SavedDesign.findOne({ _id: designId, userId });
      if (design) {
        design.roomName = roomName;
        design.furniture = furniture;
        await design.save();
      } else {
        return res.status(404).json({ success: false, message: 'Design not found' });
      }
    } else {
      // Create new design
      design = await SavedDesign.create({
        userId,
        roomName,
        furniture,
      });
    }

    res.status(201).json({ success: true, data: design });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all saved designs for logged-in user
// @route   GET /api/designs
// @access  Private
exports.getSavedDesigns = async (req, res) => {
  try {
    const designs = await SavedDesign.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: designs.length, data: designs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get design detail by ID (Publicly readable for share links)
// @route   GET /api/designs/:id
// @access  Public
exports.getDesignById = async (req, res) => {
  try {
    const design = await SavedDesign.findById(req.params.id)
      .populate('userId', 'name')
      .populate('furniture.itemId');

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    res.json({ success: true, data: design });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Furniture = require('../models/Furniture');
const User = require('../models/User');
const { isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Helper to upload a file to Cloudinary
const uploadToCloudinary = (file, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      return reject(new Error('Cloudinary not configured'));
    }

    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
    };

    // For glb raw files, specify resource_type raw
    if (file.originalname.endsWith('.glb') || file.originalname.endsWith('.gltf')) {
      uploadOptions.resource_type = 'raw';
    }

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result.secure_url);
    }).end(file.buffer);
  });
};

// Helper to save a file locally
const saveFileLocally = (file, folder) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const filename = file.fieldname + '-' + uniqueSuffix + ext;
  const filePath = path.join(uploadsDir, filename);

  fs.writeFileSync(filePath, file.buffer);
  return `/uploads/${folder}/${filename}`;
};

// @desc    Get all furniture
// @route   GET /api/furniture
// @access  Public
exports.getFurniture = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const furniture = await Furniture.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: furniture.length, data: furniture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single furniture detail
// @route   GET /api/furniture/:id
// @access  Public
exports.getFurnitureById = async (req, res) => {
  try {
    const item = await Furniture.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Furniture not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create furniture (Admin only)
// @route   POST /api/furniture
// @access  Private/Admin
exports.createFurniture = async (req, res) => {
  try {
    const { name, description, price, category, width, height, depth } = req.body;
    let imageUrl = '';
    let modelUrl = '';

    // Handle files
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const imgFile = req.files.image[0];
        if (isCloudinaryConfigured) {
          imageUrl = await uploadToCloudinary(imgFile, 'furniture_images', 'image');
        } else {
          imageUrl = saveFileLocally(imgFile, 'images');
        }
      }

      if (req.files.model && req.files.model[0]) {
        const modelFile = req.files.model[0];
        if (isCloudinaryConfigured) {
          modelUrl = await uploadToCloudinary(modelFile, 'furniture_models', 'raw');
        } else {
          modelUrl = saveFileLocally(modelFile, 'models');
        }
      }
    }

    const furniture = await Furniture.create({
      name,
      description,
      price: Number(price),
      category,
      image: imageUrl,
      modelUrl: modelUrl,
      dimensions: {
        width: Number(width),
        height: Number(height),
        depth: Number(depth),
      },
    });

    res.status(201).json({ success: true, data: furniture });
  } catch (error) {
    console.error('Error creating furniture:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update furniture (Admin only)
// @route   PUT /api/furniture/:id
// @access  Private/Admin
exports.updateFurniture = async (req, res) => {
  try {
    const { name, description, price, category, width, height, depth } = req.body;
    let item = await Furniture.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Furniture not found' });
    }

    let imageUrl = item.image;
    let modelUrl = item.modelUrl;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const imgFile = req.files.image[0];
        if (isCloudinaryConfigured) {
          imageUrl = await uploadToCloudinary(imgFile, 'furniture_images', 'image');
        } else {
          imageUrl = saveFileLocally(imgFile, 'images');
        }
      }

      if (req.files.model && req.files.model[0]) {
        const modelFile = req.files.model[0];
        if (isCloudinaryConfigured) {
          modelUrl = await uploadToCloudinary(modelFile, 'furniture_models', 'raw');
        } else {
          modelUrl = saveFileLocally(modelFile, 'models');
        }
      }
    }

    item.name = name || item.name;
    item.description = description || item.description;
    item.price = price !== undefined ? Number(price) : item.price;
    item.category = category || item.category;
    item.image = imageUrl;
    item.modelUrl = modelUrl;
    item.dimensions = {
      width: width !== undefined ? Number(width) : item.dimensions.width,
      height: height !== undefined ? Number(height) : item.dimensions.height,
      depth: depth !== undefined ? Number(depth) : item.dimensions.depth,
    };

    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete furniture (Admin only)
// @route   DELETE /api/furniture/:id
// @access  Private/Admin
exports.deleteFurniture = async (req, res) => {
  try {
    const item = await Furniture.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Furniture not found' });
    }

    // Attempt to delete files locally if local paths
    if (item.image && item.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    if (item.modelUrl && item.modelUrl.startsWith('/uploads/')) {
      const modelPath = path.join(__dirname, '..', item.modelUrl);
      if (fs.existsSync(modelPath)) fs.unlinkSync(modelPath);
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Furniture item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard analytics (Admin only)
// @route   GET /api/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalFurniture = await Furniture.countDocuments();
    const categoriesList = await Furniture.distinct('category');
    
    // Category Breakdown
    const categoryBreakdown = await Furniture.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } }
    ]);

    // Average price of all catalog items
    const avgPriceResult = await Furniture.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);
    const overallAvgPrice = avgPriceResult.length > 0 ? avgPriceResult[0].avgPrice : 0;

    // Wishlist telemetry
    const wishlistStats = await User.aggregate([
      { $unwind: '$wishlist' },
      { $group: { _id: '$wishlist', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'furnitures',
          localField: '_id',
          foreignField: '_id',
          as: 'details'
        }
      },
      { $unwind: '$details' },
      {
        $project: {
          name: '$details.name',
          category: '$details.category',
          wishlistCount: '$count'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalFurniture,
        totalCategories: categoriesList.length,
        averagePrice: Math.round(overallAvgPrice * 100) / 100,
        categories: categoryBreakdown.map(c => ({
          category: c._id,
          count: c.count,
          avgPrice: Math.round(c.avgPrice * 100) / 100
        })),
        popularFurniture: wishlistStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Furniture = require('./models/Furniture');
const SavedDesign = require('./models/SavedDesign');

dotenv.config();

const users = [
  {
    name: 'Default User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
];

const furnitureList = [
  {
    name: 'Modern Lounge Chair',
    description: 'An elegant, ergonomic armchair with premium fabric and natural wood legs. Fits beautifully in modern living rooms.',
    price: 249.99,
    category: 'Chair',
    image: '/images/lounge_chair.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    dimensions: {
      width: 0.8,
      height: 0.9,
      depth: 0.8,
    },
  },
  {
    name: 'Chesterfield Sofa',
    description: 'Classic button-tufted leather sofa in deep brown. Features scrolled arms and comfortable foam cushions.',
    price: 899.99,
    category: 'Sofa',
    image: '/images/chesterfield_sofa.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenWoodLeatherSofa/glTF-Binary/SheenWoodLeatherSofa.glb',
    dimensions: {
      width: 2.2,
      height: 0.85,
      depth: 0.95,
    },
  },
  {
    name: 'Scandi Coffee Table',
    description: 'Minimalist Scandinavian style coffee table with a birch wood top and solid oak tapered legs.',
    price: 129.99,
    category: 'Table',
    image: '/images/scandi_coffee_table.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ABeautifulGame/glTF-Binary/ABeautifulGame.glb',
    dimensions: {
      width: 1.2,
      height: 0.45,
      depth: 0.6,
    },
  },
  {
    name: 'Minimalist Bookshelf',
    description: 'Five-tier wooden shelving unit with open metal frame. Perfect for displaying books, plants, and art.',
    price: 189.99,
    category: 'Decor',
    image: '/images/bookshelf.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Barometer/glTF-Binary/Barometer.glb',
    dimensions: {
      width: 1.0,
      height: 1.8,
      depth: 0.35,
    },
  },
  {
    name: 'Luxury Velvet Bed',
    description: 'Double bed frame with high tufted wingback headboard upholstered in deep blue luxury velvet.',
    price: 649.99,
    category: 'Bed',
    image: '/images/luxury_velvet_bed.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenWoodLeatherSofa/glTF-Binary/SheenWoodLeatherSofa.glb',
    dimensions: {
      width: 1.6,
      height: 1.2,
      depth: 2.1,
    },
  },
  {
    name: 'Warm Floor Lamp',
    description: 'Minimalist brass floor lamp that glows automatically at night, spreading warm light across your room.',
    price: 99.99,
    category: 'Lighting',
    image: '/images/floor_lamp.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/LightsPunctualLamp/glTF-Binary/LightsPunctualLamp.glb',
    dimensions: {
      width: 0.45,
      height: 1.65,
      depth: 0.45,
    },
  },
  {
    name: 'Potted Monstera Plant',
    description: 'Vibrant indoor Swiss cheese plant in a white ceramic pot. Adds natural color and fresh vibes to any corner.',
    price: 59.99,
    category: 'Decor',
    image: '/images/monstera_plant.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb',
    dimensions: {
      width: 0.6,
      height: 1.20,
      depth: 0.6,
    },
  },
  {
    name: 'Cozy Accent Rug',
    description: 'Thick pile woven geometric rug with natural fibers. Perfect for anchoring sofas and coffee tables together.',
    price: 179.99,
    category: 'Decor',
    image: '/images/accent_rug.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb',
    dimensions: {
      width: 2.0,
      height: 0.01,
      depth: 3.0,
    },
  },
  {
    name: 'Retro Bar Stool',
    description: 'High counter height bar stool with bent wood backrest and black metal legs. Fits tables and countertops.',
    price: 89.99,
    category: 'Chair',
    image: '/images/bar_stool.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    dimensions: {
      width: 0.45,
      height: 0.95,
      depth: 0.45,
    },
  },
  {
    name: 'Sleek Sideboard Cabinet',
    description: 'Mid-century modern credenza featuring dark walnut panels, four spacious drawers, and metal tapered feet.',
    price: 349.99,
    category: 'Table',
    image: '/images/sideboard_cabinet.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Barometer/glTF-Binary/Barometer.glb',
    dimensions: {
      width: 1.6,
      height: 0.75,
      depth: 0.45,
    },
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'High-back mesh workspace chair with adjustable headrest, lumber support, 3D armrests, and smooth casters.',
    price: 189.99,
    category: 'Chair',
    image: '/images/office_chair.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    dimensions: {
      width: 0.65,
      height: 1.15,
      depth: 0.65,
    },
  },
  {
    name: 'Minimalist Wardrobe',
    description: 'Tall double door wardrobe in matte white. Features internal clothes rail and adjustable organizer shelves.',
    price: 549.99,
    category: 'Decor',
    image: '/images/wardrobe.png',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb',
    dimensions: {
      width: 1.2,
      height: 2.0,
      depth: 0.6,
    },
  },
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ar_furniture', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Furniture.deleteMany();
    await SavedDesign.deleteMany();

    console.log('Seeding user profiles...');
    // We create users one by one to trigger the password pre-save hook
    for (const u of users) {
      await User.create(u);
    }

    console.log('Seeding furniture catalog...');
    await Furniture.insertMany(furnitureList);

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ar_furniture', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await User.deleteMany();
    await Furniture.deleteMany();
    await SavedDesign.deleteMany();

    console.log('Data completely cleared!');
    process.exit(0);
  } catch (error) {
    console.error(`Error destroying database: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

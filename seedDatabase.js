const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

// Sample products data
const sampleProducts = [
  {
    name: "Classic White T-Shirt",
    description: "A comfortable and stylish white t-shirt made from 100% cotton. Perfect for everyday wear.",
    price: 29.99,
    originalPrice: 39.99,
    discount: 25,
    images: [
      {
        public_id: "sample_tshirt_1",
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop"
      }
    ],
    category: "men",
    subcategory: "t-shirts",
    brand: "Goodluck Fashion",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 15 },
      { size: "L", stock: 12 },
      { size: "XL", stock: 8 }
    ],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Gray", hex: "#808080" }
    ],
    stock: 45,
    isActive: true
  },
  {
    name: "Elegant Black Dress",
    description: "A sophisticated black dress perfect for formal occasions. Made from premium quality fabric.",
    price: 89.99,
    originalPrice: 120.00,
    discount: 25,
    images: [
      {
        public_id: "sample_dress_1",
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=600&fit=crop"
      }
    ],
    category: "women",
    subcategory: "dresses",
    brand: "Goodluck Fashion",
    sizes: [
      { size: "XS", stock: 5 },
      { size: "S", stock: 8 },
      { size: "M", stock: 10 },
      { size: "L", stock: 7 },
      { size: "XL", stock: 4 }
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#000080" },
      { name: "Red", hex: "#FF0000" }
    ],
    stock: 34,
    isActive: true
  },
  {
    name: "Denim Jeans",
    description: "Classic blue denim jeans with a comfortable fit. Perfect for casual outings.",
    price: 59.99,
    originalPrice: 79.99,
    discount: 25,
    images: [
      {
        public_id: "sample_jeans_1",
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=600&fit=crop"
      }
    ],
    category: "men",
    subcategory: "pants",
    brand: "Goodluck Fashion",
    sizes: [
      { size: "28", stock: 6 },
      { size: "30", stock: 8 },
      { size: "32", stock: 10 },
      { size: "34", stock: 12 },
      { size: "36", stock: 8 }
    ],
    colors: [
      { name: "Blue", hex: "#0000FF" },
      { name: "Dark Blue", hex: "#000080" },
      { name: "Black", hex: "#000000" }
    ],
    stock: 44,
    isActive: true
  },
  {
    name: "Summer Blouse",
    description: "Light and airy summer blouse perfect for warm weather. Made from breathable fabric.",
    price: 39.99,
    originalPrice: 49.99,
    discount: 20,
    images: [
      {
        public_id: "sample_blouse_1",
        url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop"
      }
    ],
    category: "women",
    subcategory: "tops",
    brand: "Goodluck Fashion",
    sizes: [
      { size: "XS", stock: 4 },
      { size: "S", stock: 6 },
      { size: "M", stock: 8 },
      { size: "L", stock: 6 },
      { size: "XL", stock: 3 }
    ],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Pink", hex: "#FFC0CB" },
      { name: "Yellow", hex: "#FFFF00" }
    ],
    stock: 27,
    isActive: true
  },
  {
    name: "Leather Jacket",
    description: "Premium quality leather jacket with a classic design. Perfect for adding style to any outfit.",
    price: 149.99,
    originalPrice: 199.99,
    discount: 25,
    images: [
      {
        public_id: "sample_jacket_1",
        url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop"
      }
    ],
    category: "men",
    subcategory: "jackets",
    brand: "Goodluck Fashion",
    sizes: [
      { size: "S", stock: 3 },
      { size: "M", stock: 5 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 2 }
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Brown", hex: "#8B4513" }
    ],
    stock: 14,
    isActive: true
  },
  {
    name: "Silk Scarf",
    description: "Luxurious silk scarf with beautiful patterns. Perfect accessory for any outfit.",
    price: 24.99,
    originalPrice: 34.99,
    discount: 29,
    images: [
      {
        public_id: "sample_scarf_1",
        url: "https://images.unsplash.com/photo-1601925260369-1b5a4b5b5b5b?w=500&h=600&fit=crop"
      }
    ],
    category: "accessories",
    subcategory: "scarves",
    brand: "Goodluck Fashion",
    sizes: [
      { size: "One Size", stock: 20 }
    ],
    colors: [
      { name: "Red", hex: "#FF0000" },
      { name: "Blue", hex: "#0000FF" },
      { name: "Green", hex: "#008000" },
      { name: "Purple", hex: "#800080" }
    ],
    stock: 20,
    isActive: true
  },
  {
    name: "Kids T-Shirt",
    description: "Comfortable and colorful t-shirt for kids. Made from soft, child-friendly materials.",
    price: 19.99,
    originalPrice: 24.99,
    discount: 20,
    images: [
      {
        public_id: "sample_kids_tshirt_1",
        url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=600&fit=crop"
      }
    ],
    category: "kids",
    subcategory: "t-shirts",
    brand: "Goodluck Fashion",
    sizes: [
      { size: "2T", stock: 8 },
      { size: "3T", stock: 10 },
      { size: "4T", stock: 12 },
      { size: "5T", stock: 8 }
    ],
    colors: [
      { name: "Red", hex: "#FF0000" },
      { name: "Blue", hex: "#0000FF" },
      { name: "Yellow", hex: "#FFFF00" },
      { name: "Green", hex: "#008000" }
    ],
    stock: 38,
    isActive: true
  },
  {
    name: "Wool Sweater",
    description: "Warm and cozy wool sweater perfect for cold weather. High-quality wool blend.",
    price: 79.99,
    originalPrice: 99.99,
    discount: 20,
    images: [
      {
        public_id: "sample_sweater_1",
        url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=600&fit=crop"
      }
    ],
    category: "women",
    subcategory: "sweaters",
    brand: "Goodluck Fashion",
    sizes: [
      { size: "XS", stock: 3 },
      { size: "S", stock: 5 },
      { size: "M", stock: 7 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 3 }
    ],
    colors: [
      { name: "Gray", hex: "#808080" },
      { name: "Navy", hex: "#000080" },
      { name: "Cream", hex: "#F5F5DC" }
    ],
    stock: 23,
    isActive: true
  }
];

// Sample admin user
const adminUser = {
  name: "Admin User",
  email: "admin@goodluckfashion.com",
  password: "admin123456",
  role: "admin",
  isEmailVerified: true
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Clear existing users (optional - be careful in production)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const admin = new User(adminUser);
    await admin.save();
    console.log('Admin user created:', admin.email);

    // Create sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Created ${products.length} sample products`);

    console.log('Database seeded successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@goodluckfashion.com');
    console.log('Password: admin123456');
    console.log('\nYou can now test the cart functionality with these products!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeder
seedDatabase();

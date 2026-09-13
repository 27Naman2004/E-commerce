const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const users = [
  {
    name: 'Admin User',
    email: 'admin@kanhacollection.in',
    password: 'Admin@123',
    phone: '9999999999',
    role: 'admin',
  },
  {
    name: 'Test Customer',
    email: 'customer@example.com',
    password: 'Customer@123',
    phone: '8888888888',
    role: 'user',
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await User.deleteMany();
    console.log('Existing users cleared');

    await User.insertMany(users);
    console.log(`✅ ${users.length} users seeded successfully`);
    console.log('Admin: admin@kanhacollection.in / Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();

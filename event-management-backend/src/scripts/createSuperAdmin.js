import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: 'admin@unievents.com' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Create super admin user
    const superAdmin = await User.create({
      name: 'Super Administrator',
      email: 'admin@unievents.com',
      password: 'superadmin123',
      role: 'superadmin'
    });

    console.log('Super admin created successfully:');
    console.log('Email: admin@unievents.com');
    console.log('Password: superadmin123');
    console.log('Role: superadmin');
    console.log('User ID:', superAdmin._id);

    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();

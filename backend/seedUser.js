// backend/seedUser.js
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

// Check if MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

async function seedUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // User data to insert
    const userData = {
      email: 'admin@gmail.com',
      password: 'admin1234' 
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log('User already exists');
      await mongoose.connection.close();
      return;
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    console.log('User created successfully');
    console.log('Email:', user.email);
    console.log('Hashed Password:', user.password);

  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedUser();
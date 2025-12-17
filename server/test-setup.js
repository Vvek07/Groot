// Quick test to verify setup
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('Testing Groot1 Setup...\n');

// Test 1: Environment Variables
console.log('✓ Environment Variables:');
console.log('  - PORT:', process.env.PORT);
console.log('  - MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('  - CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
console.log('  - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Missing');

// Test 2: MongoDB Connection
console.log('\n✓ Testing MongoDB Connection...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('  ✓ MongoDB Connected Successfully!');
    mongoose.connection.close();
    console.log('\n✅ All tests passed! Ready to start the application.');
    console.log('\nRun: npm run dev');
  })
  .catch(err => {
    console.error('  ✗ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });

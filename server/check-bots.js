const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function checkBots() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    const bots = await User.find({
      $or: [
        { username: 'mizo' },
        { username: 'vivek_ai_assistant' }
      ]
    });

    console.log(`Found ${bots.length} bot(s):\n`);
    
    bots.forEach((bot, index) => {
      console.log(`Bot ${index + 1}:`);
      console.log('  ID:', bot._id);
      console.log('  Username:', bot.username);
      console.log('  Email:', bot.email);
      console.log('  Bio:', bot.bio);
      console.log('  Friends:', bot.friends.length);
      console.log('  Image:', bot.image.url);
      console.log();
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBots();

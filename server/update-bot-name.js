const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function updateBotName() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Find the old bot
    const oldBot = await User.findOne({ username: 'vivek_ai_assistant' });
    
    if (oldBot) {
      console.log('Found old bot:', oldBot.username);
      console.log('Updating to: Mizo\n');
      
      oldBot.username = 'mizo';
      oldBot.email = 'mizo@groot1.vivek.com';
      oldBot.bio = '🤖 Hi! I\'m Mizo, your AI assistant. Ask me anything and I\'ll help you out!';
      oldBot.image = {
        public_id: 'ai_bot_avatar',
        url: 'https://api.dicebear.com/7.x/bottts/svg?seed=mizo&backgroundColor=e94560'
      };
      
      await oldBot.save();
      console.log('✓ Bot updated successfully!');
      console.log('  New username:', oldBot.username);
      console.log('  New bio:', oldBot.bio);
      console.log('  Friends:', oldBot.friends.length);
    } else {
      console.log('Old bot not found. Creating new Mizo bot...');
      
      const newBot = new User({
        username: 'mizo',
        email: 'mizo@groot1.vivek.com',
        password: 'ai_bot_secure_password_12345',
        bio: '🤖 Hi! I\'m Mizo, your AI assistant. Ask me anything and I\'ll help you out!',
        image: {
          public_id: 'ai_bot_avatar',
          url: 'https://api.dicebear.com/7.x/bottts/svg?seed=mizo&backgroundColor=e94560'
        }
      });
      
      await newBot.save();
      console.log('✓ Mizo bot created successfully!');
    }

    await mongoose.connection.close();
    console.log('\n✓ Done! Restart your server and refresh browser.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateBotName();

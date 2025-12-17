const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function updateAIBot() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected\n');

    const aiBot = await User.findOne({ username: 'vivek_ai_assistant' });
    
    if (!aiBot) {
      console.error('✗ AI Bot not found!');
      console.log('Run: node add-ai-bot-to-users.js');
      process.exit(1);
    }

    console.log('Current AI Bot:');
    console.log('  Username:', aiBot.username);
    console.log('  Bio:', aiBot.bio);
    console.log('  Image:', aiBot.image.url);
    console.log('  Friends:', aiBot.friends.length);

    // Update AI bot
    aiBot.bio = '🤖 Hi! I\'m Vivek\'s AI Assistant. Ask me anything and I\'ll help you out!';
    aiBot.image = {
      public_id: 'ai_bot_avatar',
      url: 'https://api.dicebear.com/7.x/bottts/svg?seed=vivek-ai&backgroundColor=e94560'
    };

    await aiBot.save();

    console.log('\n✓ AI Bot Updated!');
    console.log('  New Bio:', aiBot.bio);
    console.log('  New Image:', aiBot.image.url);
    console.log('\n✅ Restart server and refresh browser to see changes!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAIBot();

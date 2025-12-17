const User = require('../models/User');

const AI_BOT_DATA = {
  username: 'mizo',
  email: 'mizo@groot1.vivek.com',
  password: 'ai_bot_secure_password_12345',
  bio: '🤖 Hi! I\'m Mizo, your AI assistant. Ask me anything and I\'ll help you out!',
  image: {
    public_id: 'ai_bot_avatar',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=mizo&backgroundColor=e94560'
  }
};

const getOrCreateAIBot = async () => {
  try {
    // Try to find by new username first
    let aiBot = await User.findOne({ username: AI_BOT_DATA.username });
    
    // If not found, try old username and update it
    if (!aiBot) {
      aiBot = await User.findOne({ username: 'vivek_ai_assistant' });
      if (aiBot) {
        aiBot.username = AI_BOT_DATA.username;
        aiBot.email = AI_BOT_DATA.email;
        aiBot.bio = AI_BOT_DATA.bio;
        aiBot.image = AI_BOT_DATA.image;
        await aiBot.save();
        console.log('✓ AI Bot updated to Mizo');
      }
    }
    
    // If still not found, create new
    if (!aiBot) {
      aiBot = new User(AI_BOT_DATA);
      await aiBot.save();
      console.log('✓ AI Bot (Mizo) created successfully');
    }
    
    return aiBot;
  } catch (error) {
    console.error('Error creating AI bot:', error);
    return null;
  }
};

module.exports = { getOrCreateAIBot, AI_BOT_DATA };

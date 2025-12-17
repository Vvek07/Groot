// Script to add AI bot to all existing users
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const { getOrCreateAIBot } = require('./utils/createAIBot');

dotenv.config();

async function addAIBotToAllUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get or create AI bot
    console.log('Getting AI bot...');
    const aiBot = await getOrCreateAIBot();
    
    if (!aiBot) {
      console.error('✗ Failed to create AI bot');
      process.exit(1);
    }
    
    console.log('✓ AI Bot:', aiBot.username);
    console.log('  ID:', aiBot._id);
    console.log('  Bio:', aiBot.bio);
    console.log('  Image:', aiBot.image.url);
    console.log();

    // Get all users except the AI bot
    const users = await User.find({ 
      username: { $ne: 'vivek_ai_assistant' } 
    });

    console.log(`Found ${users.length} users\n`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if AI bot is already a friend
      if (user.friends.includes(aiBot._id)) {
        console.log(`⊘ ${user.username} - Already has AI bot`);
        skipped++;
        continue;
      }

      // Add AI bot to user's friends
      user.friends.push(aiBot._id);
      await user.save();

      // Add user to AI bot's friends
      if (!aiBot.friends.includes(user._id)) {
        aiBot.friends.push(user._id);
      }

      console.log(`✓ ${user.username} - AI bot added`);
      updated++;
    }

    // Save AI bot with all new friends
    await aiBot.save();

    console.log('\n=================================');
    console.log('Summary:');
    console.log(`  Updated: ${updated} users`);
    console.log(`  Skipped: ${skipped} users`);
    console.log(`  AI Bot has ${aiBot.friends.length} friends`);
    console.log('=================================\n');

    await mongoose.connection.close();
    console.log('✓ Done! Restart your server to see changes.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addAIBotToAllUsers();

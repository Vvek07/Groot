const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

async function testDeepSeek() {
  try {
    console.log('Testing DeepSeek API...\n');
    console.log('API Key:', DEEPSEEK_API_KEY ? '✓ Set' : '✗ Missing');
    
    if (!DEEPSEEK_API_KEY) {
      console.error('✗ DEEPSEEK_API_KEY not found in .env');
      process.exit(1);
    }

    const deepseek = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: DEEPSEEK_API_KEY,
    });

    console.log('\nSending test message...');
    
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant." 
        },
        {
          role: "user",
          content: "Say hello in one sentence"
        }
      ],
    });

    const reply = completion.choices[0].message.content;
    console.log('\n✓ DeepSeek API is working!');
    console.log('Response:', reply);
    console.log('\n✅ AI Bot will work correctly with DeepSeek!');
    
  } catch (error) {
    console.error('\n✗ DeepSeek API Error:');
    console.error('Message:', error.message);
    console.error('\n❌ AI Bot will NOT work. Check your API key.');
  }
}

testDeepSeek();

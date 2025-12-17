const { OpenRouter } = require("@openrouter/sdk");
const dotenv = require('dotenv');

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function testOpenRouter() {
  try {
    console.log('Testing OpenRouter API with DeepSeek R1...\n');
    console.log('API Key:', OPENROUTER_API_KEY ? '✓ Set' : '✗ Missing');
    
    if (!OPENROUTER_API_KEY) {
      console.error('✗ OPENROUTER_API_KEY not found in .env');
      process.exit(1);
    }

    const openrouter = new OpenRouter({
      apiKey: OPENROUTER_API_KEY
    });

    console.log('\nSending test message to DeepSeek R1...');
    
    const stream = await openrouter.chat.send({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        {
          role: "user",
          content: "Say hello in one sentence"
        }
      ],
      stream: true
    });

    console.log('\n✓ OpenRouter API is working!');
    console.log('Response: ');
    
    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
        fullResponse += content;
      }
    }

    console.log('\n\n✅ AI Bot will work correctly with OpenRouter + DeepSeek R1!');
    console.log('Model: deepseek/deepseek-r1-0528:free (FREE)');
    
  } catch (error) {
    console.error('\n✗ OpenRouter API Error:');
    console.error('Message:', error.message);
    console.error('\n❌ Check your API key or try again.');
  }
}

testOpenRouter();

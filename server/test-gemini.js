const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

async function testGemini() {
  try {
    console.log('Testing Gemini API...\n');
    console.log('API Key:', GEMINI_API_KEY ? '✓ Set' : '✗ Missing');
    
    if (!GEMINI_API_KEY) {
      console.error('✗ GEMINI_API_KEY not found in .env');
      process.exit(1);
    }

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: 'Say hello in one sentence'
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    console.log('\n✓ Gemini API is working!');
    console.log('Response:', reply);
    console.log('\n✅ AI Bot will work correctly!');
    
  } catch (error) {
    console.error('\n✗ Gemini API Error:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.error?.message || error.message);
    console.error('\n❌ AI Bot will NOT work. Check your API key.');
  }
}

testGemini();

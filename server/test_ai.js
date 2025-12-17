const dotenv = require('dotenv');
dotenv.config();

const aiService = require('./services/aiService');

async function test() {
    console.log('--- AI Service Test ---');
    console.log('Checking API Key visibility...');
    if (process.env.OPENROUTER_API_KEY) {
        console.log('✅ OPENROUTER_API_KEY is present (Length: ' + process.env.OPENROUTER_API_KEY.length + ')');
    } else {
        console.error('❌ OPENROUTER_API_KEY is MISSING in process.env');
        return;
    }

    console.log('Testing AI Response...');
    const response = await aiService.getBotResponse('Hello Mizo, are you working?');
    console.log('AI Response:', response);
}

test();

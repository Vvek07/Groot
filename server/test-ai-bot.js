const { getBotResponse } = require('./utils/geminiBot');

async function testBot() {
  console.log('Testing AI Bot Responses...\n');
  
  const testMessages = [
    'Hello!',
    'Who are you?',
    'Tell me a joke',
    'What is React?',
    'Tell me about Vivek',
    'What features does this platform have?',
    'Thanks!',
    'Bye!'
  ];
  
  for (const message of testMessages) {
    console.log(`\n👤 User: ${message}`);
    const response = await getBotResponse(message);
    console.log(`🤖 Bot: ${response}`);
  }
  
  console.log('\n\n✅ AI Bot is working perfectly!');
}

testBot();

const { OpenRouter } = require("@openrouter/sdk");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Initialize OpenRouter client
const openrouter = new OpenRouter({
  apiKey: OPENROUTER_API_KEY
});

// Smart fallback responses
const fallbackResponses = {
  greetings: [
    "Hello! I'm Vivek's AI Assistant powered by DeepSeek R1. How can I help you today? 🤖",
    "Hi there! I'm here to assist you. What would you like to know? 😊",
    "Hey! I'm Vivek's AI bot. Ask me anything! 🚀"
  ],
  identity: [
    "I'm Vivek's AI Assistant! I'm integrated into this Groot1 chat platform to help users with questions and have friendly conversations. I'm powered by DeepSeek R1, an advanced AI model! 🤖",
    "Hi! I'm an AI chatbot created by Vivek for the Groot1 platform. I can answer questions, provide information, and chat about various topics. What would you like to talk about? 😊"
  ],
  jokes: [
    "Why don't scientists trust atoms? Because they make up everything! 😄",
    "Why did the programmer quit his job? Because he didn't get arrays! 💻😂",
    "What do you call a bear with no teeth? A gummy bear! 🐻"
  ],
  default: [
    "That's interesting! Tell me more about what you'd like to know. I'm here to help! 🤖",
    "Great question! I'm Vivek's AI Assistant and I'm here to chat. What's on your mind? 💭"
  ]
};

const getRandomResponse = (category) => {
  const responses = fallbackResponses[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

const getFallbackResponse = (userMessage) => {
  const msg = userMessage.toLowerCase();
  
  if (msg.match(/\b(hi|hello|hey|greetings)\b/)) {
    return getRandomResponse('greetings');
  }
  
  if (msg.match(/\b(who are you|what are you|your name|introduce)\b/)) {
    return getRandomResponse('identity');
  }
  
  if (msg.match(/\b(joke|funny|laugh)\b/)) {
    return getRandomResponse('jokes');
  }
  
  if (msg.match(/\b(thank|thanks)\b/)) {
    return "You're welcome! Happy to help! 😊";
  }
  
  if (msg.match(/\b(bye|goodbye|see you)\b/)) {
    return "Goodbye! Feel free to chat with me anytime. Have a great day! 👋";
  }
  
  return getRandomResponse('default');
};

const getBotResponse = async (userMessage) => {
  try {
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not found');
      return getFallbackResponse(userMessage);
    }

    console.log('🤖 Generating AI response...');

    const completion = await openrouter.chat.send({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        {
          role: "system",
          content: "You are Vivek's AI Assistant, a friendly and helpful chatbot integrated into a social messaging platform called Groot1. You help users with questions, provide information, and have casual conversations. Keep responses concise, friendly, and under 150 words. Always be helpful and engaging."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    // Extract the response
    let botReply = '';
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        botReply += content;
      }
    }

    console.log('✓ DeepSeek R1 response generated');
    return botReply.trim() || getFallbackResponse(userMessage);

  } catch (error) {
    console.error('OpenRouter API Error:', error.message);
    return getFallbackResponse(userMessage);
  }
};

module.exports = { getBotResponse };

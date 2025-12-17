const { OpenRouter } = require("@openrouter/sdk");
const User = require('../models/User');

// API Key is accessed via process.env dynamically

// AI Bot Configuration
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

class AIService {
    constructor() {
        // Initialize lazily or check on first request
        this.openrouter = null;
    }

    _initOpenRouter() {
        if (!this.openrouter && process.env.OPENROUTER_API_KEY) {
            this.openrouter = new OpenRouter({
                apiKey: process.env.OPENROUTER_API_KEY
            });
        }
        return this.openrouter;
    }

    async getOrCreateBot() {
        try {
            // Try to find by new username first
            let aiBot = await User.findOne({ username: AI_BOT_DATA.username });

            // If not found, try old username and update it (Legacy migration)
            if (!aiBot) {
                aiBot = await User.findOne({ username: 'vivek_ai_assistant' });
                if (aiBot) {
                    aiBot.username = AI_BOT_DATA.username;
                    aiBot.email = AI_BOT_DATA.email;
                    aiBot.bio = AI_BOT_DATA.bio;
                    aiBot.image = AI_BOT_DATA.image;
                    await aiBot.save();
                }
            }

            // If still not found, create new
            if (!aiBot) {
                aiBot = new User(AI_BOT_DATA);
                await aiBot.save();
            }

            return aiBot;
        } catch (error) {
            console.error('Error creating/fetching AI bot:', error);
            return null;
        }
    }

    isBot(userId) {
        // This is a helper, but we might need to fetch the user to be sure. 
        // For now, we rely on checking username in the caller or passing the user object.
        // Or we can cache the Bot ID.
        return false;
    }

    async getBotResponse(userMessage) {
        try {
            const client = this._initOpenRouter();

            if (!client) {
                console.error('❌ OpenRouter API key missing in process.env');
                return this.getFallbackResponse(userMessage);
            }

            const models = [
                "google/gemini-2.0-flash-exp:free",
                "meta-llama/llama-3.2-3b-instruct:free",
                "mistralai/mistral-7b-instruct:free"
            ];

            let lastError = null;

            for (const model of models) {
                try {
                    console.log(`🤖 Trying AI Model: ${model}`);
                    const completion = await client.chat.send({
                        model: model,
                        messages: [
                            {
                                role: "system",
                                content: "You are Mizo, a helpful and friendly AI assistant on the Groot1 platform. You are knowledgeable and act like a smart friend. Keep answers concise but informative."
                            },
                            {
                                role: "user",
                                content: userMessage
                            }
                        ]
                    });

                    let botReply = '';
                    if (completion?.choices?.[0]?.message?.content) {
                        botReply = completion.choices[0].message.content;
                    } else {
                        // Handle potential simple string or other formats
                        botReply = completion.choices?.[0]?.text || "";
                    }

                    if (botReply) {
                        console.log('🤖 AI Response generated successfully');
                        return botReply.trim();
                    }
                } catch (err) {
                    console.warn(`⚠️ Model ${model} failed:`, err.message);
                    lastError = err;
                    // Continue to next model
                }
            }

            console.error('❌ All AI models failed. Last error:', lastError);
            return "I'm having a bit of trouble connecting to my servers right now. Please try again in a moment! 🔌";

        } catch (error) {
            console.error('OpenRouter API Error (outside model loop):', error);
            // Fallback for 401/402 or other API errors
            return this.getFallbackResponse(userMessage);
        }
    }

    getFallbackResponse(userMessage) {
        const msg = userMessage.toLowerCase();

        // Greetings
        if (msg.match(/\b(hi|hello|hey|greetings)\b/)) {
            return "Hello! I'm Mizo, Vivek's AI Assistant. How can I help you today? 🤖";
        }

        // Identity
        if (msg.match(/\b(who are you|what are you|your name|introduce)\b/)) {
            return "I'm Mizo, an AI Assistant for Groot1! I'm here to chat and help you out. 🤖";
        }

        // Jokes
        if (msg.match(/\b(joke|funny|laugh)\b/)) {
            return "Why did the developer go broke? Because he used up all his cache! 😄";
        }

        // Farewell
        if (msg.match(/\b(bye|goodbye|see you)\b/)) {
            return "Goodbye! Have a great day! 👋";
        }

        return "That's interesting! Tell me more about what you'd like to know. I'm here to help! 🤖";
    }
}

module.exports = new AIService();

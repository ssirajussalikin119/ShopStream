const OpenAI = require('openai');
const sendResponse = require('../utils/sendResponse');

const createOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }

  return new OpenAI({ apiKey });
};

const chat = async (req, res, next) => {
  try {
    const openai = createOpenAIClient();
    if (!openai) {
      return sendResponse(res, 500, false, 'OpenAI API key is missing or invalid.');
    }

    const { message } = req.body;

    if (!message || !message.trim()) {
      return sendResponse(res, 400, false, 'Message is required');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are ShopStream AI, a helpful assistant for an online product store. Answer user questions concisely and help them find products, deals, or store information.',
        },
        { role: 'user', content: message.trim() },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return sendResponse(res, 500, false, 'Unable to generate a response from the AI service');
    }

    return sendResponse(res, 200, true, 'AI response generated', { reply });
  } catch (error) {
    const errorMessage =
      error?.response?.data?.error?.message || error?.message || 'AI service request failed';
    return sendResponse(res, error?.status || 500, false, errorMessage);
  }
};

module.exports = { chat };

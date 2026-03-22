import axios from 'axios';

export const getAIResponse = async (message: string, context?: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are Nexora AI assistant. Be helpful and concise.' },
          { role: 'user', content: message }
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI service error', error);
    return 'Sorry, I am having trouble right now.';
  }
};

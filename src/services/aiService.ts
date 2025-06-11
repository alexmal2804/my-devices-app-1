import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const AI_TUNNEL_KEY = process.env.REACT_APP_AI_TUNNEL_KEY;
const AI_TUNNEL_URL = process.env.REACT_APP_AI_TUNNEL_URL || 'https://api.aitunnel.ru/v1';

const client = new OpenAI({
  apiKey: AI_TUNNEL_KEY,
  baseURL: AI_TUNNEL_URL,
  dangerouslyAllowBrowser: true,
});

export async function sendMessageToAI(
  message: string,
  history: { sender: string; text: string }[],
  employee: any,
  device: any
): Promise<string> {
 const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `\nТы — AI-помощник по ИТ-оборудованию.\nСначала поприветствуй пользователя и кратко расскажи, что ты можешь помочь по вопросам, связанным с этим оборудованием.\nИнформация о сотруднике: ${JSON.stringify(employee)}\nИнформация об оборудовании: ${JSON.stringify(device)}\nЕсли в ответе нужно упомянуть CTC, всегда используй формулировку 'Коэффициент технического состояния'. Не используй сокращения или другие варианты.\nЕсли вопрос не по этому оборудованию — вежливо сообщи, что можешь помочь только по нему, укажи реквизиты.\nЕсли ctc < 20 — сообщи о необходимости плановой замены.\nЕсли status != "исправен" — кратко опиши ситуацию.\nЕсли нужно создать обращение, выведи текст обращения с маркером [TICKET] в начале строки.\nВсегда используй базовое форматирование markdown: *курсив*, **жирный**, списки, разделители, чтобы ответы выглядели структурированно и современно.\n`
    },
    ...history.map((msg) => {
      const role = msg.sender === 'user' ? 'user' : 'assistant';
      const message: ChatCompletionMessageParam = { role, content: msg.text };
      return message;
    }),
    {
      role: 'user',
      content: message,
    }
  ];

  const response = await client.chat.completions.create({
    model:"deepseek-chat",
    messages,
    max_tokens: 2000,
    temperature: 0.8,
});

  return response.choices?.[0]?.message?.content || 'Ошибка ответа от AI';
}

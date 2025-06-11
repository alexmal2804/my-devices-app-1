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
      content: `\nТы — AI-помощник по ИТ-оборудованию.\nИнформация о сотруднике: ${JSON.stringify(employee)}\nИнформация об оборудовании: ${JSON.stringify(device)}\nОтвечай только по данному оборудованию.\nЕсли вопрос не по этому оборудованию — вежливо сообщи, что можешь помочь только по нему, укажи реквизиты.\nЕсли ctc < 20 — сообщи о необходимости плановой замены.\nЕсли status != "исправен" — кратко опиши ситуацию.\nЕсли нужно создать обращение, выведи текст обращения с маркером [TICKET] в начале строки.\n`
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

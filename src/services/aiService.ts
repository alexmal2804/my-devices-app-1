import { OpenAI } from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/chat'
import { createRAGContext } from './ragService'
import { checkDocumentsAvailability } from './supabaseClient'

const VITE_AI_TUNNEL_KEY = import.meta.env.VITE_AI_TUNNEL_KEY
const VITE_AI_TUNNEL_URL =
  import.meta.env.VITE_VITE_AI_TUNNEL_URL || 'https://api.aitunnel.ru/v1'

// Создаем клиент OpenAI
const client = new OpenAI({
  apiKey: VITE_AI_TUNNEL_KEY,
  baseURL: VITE_AI_TUNNEL_URL,
  dangerouslyAllowBrowser: true,
})

export async function sendMessageToAI(
  message: string,
  history: { sender: string; text: string }[],
  employee: any,
  device: any
): Promise<string> {
  console.log(
    '🚀 AI Service: Начинаем обработку сообщения:',
    message.substring(0, 100)
  )

  // Получаем контекст из документов через RAG
  let ragContext = ''
  try {
    // Сначала проверим, есть ли документы в базе
    console.log('📊 AI Service: Проверяем наличие документов в базе...')
    const docStatus = await checkDocumentsAvailability()
    console.log(
      '📊 AI Service: Статус документов - документов:',
      docStatus.documentsCount,
      'чанков:',
      docStatus.chunksCount
    )

    if (docStatus.chunksCount === 0) {
      console.log('⚠️ AI Service: В базе нет чанков для поиска')
    } else {
      console.log(
        '🔍 AI Service: Запрашиваем RAG контекст для сообщения:',
        message.substring(0, 100)
      )
      ragContext = await createRAGContext(message)
      console.log('🔄 AI Service: RAG функция вернула результат')

      if (ragContext && ragContext.trim()) {
        console.log(
          '✅ AI Service: RAG контекст получен, длина:',
          ragContext.length,
          'символов'
        )
        console.log(
          '📝 AI Service: Превью контекста:',
          ragContext.substring(0, 300) + '...'
        )
      } else {
        console.log('⚠️ AI Service: RAG контекст пустой или не найден')
      }
    }
  } catch (error) {
    console.error('❌ AI Service: RAG поиск завершился с ошибкой:', error)
  }

  // Извлекаем имя и отчество из ФИО
  const getNameAndPatronymic = (fio: string) => {
    if (!fio) return ''
    const parts = fio.trim().split(/\s+/)
    if (parts.length >= 3) {
      // Формат: Фамилия Имя Отчество
      return `${parts[1]} ${parts[2]}`
    } else if (parts.length >= 2) {
      // Формат: Фамилия Имя
      return parts[1]
    }
    return fio
  }

  const nameAndPatronymic = employee?.fio
    ? getNameAndPatronymic(employee.fio)
    : ''
  const isFirstMessage = history.length === 0

  // Формируем системный промпт с учетом RAG контекста
  const systemPrompt = `
Ты — AI-помощник по ИТ-оборудованию.
${
  isFirstMessage && nameAndPatronymic
    ? `В первом сообщении ОБЯЗАТЕЛЬНО поприветствуй пользователя по имени и отчеству: "${nameAndPatronymic}". Используй формат: "Здравствуйте, ${nameAndPatronymic}!" или "Добро пожаловать, ${nameAndPatronymic}!". Затем кратко представься как AI-помощник и расскажи, что можешь помочь по вопросам данного оборудования.`
    : 'Отвечай на вопросы пользователя по оборудованию.'
}

Информация о сотруднике: ${JSON.stringify(employee)}
Информация об оборудовании: ${JSON.stringify(device)}

${
  ragContext && ragContext.trim()
    ? `\n=== ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ ИЗ ДОКУМЕНТОВ ===\n${ragContext}\n=== КОНЕЦ ДОПОЛНИТЕЛЬНОЙ ИНФОРМАЦИИ ===\n\nИСПОЛЬЗУЙ ЭТУ ИНФОРМАЦИЮ для более точных ответов. Если в загруженных документах есть релевантная информация, обязательно используй её в ответе.`
    : ''
}

ИНСТРУКЦИИ:
- Если в ответе нужно упомянуть CTC, всегда используй формулировку 'Коэффициент технического состояния'. Не используй сокращения или другие варианты.
- Если вопрос не по этому оборудованию — вежливо сообщи, что можешь помочь только по нему, укажи реквизиты.
- Если ctc < 20 — сообщи о необходимости плановой замены.
- Если status != "исправен" — кратко опиши ситуацию.
- Если нужно создать обращение, выведи текст обращения с маркером [TICKET] в начале строки.
- Всегда используй базовое форматирование markdown: *курсив*, **жирный**, списки, разделители, чтобы ответы выглядели структурированно и современно.
- Если есть информация из загруженных документов, используй её для более точных ответов.
- Будь дружелюбным, но профессиональным. Используй вежливые обращения.
${
  isFirstMessage && nameAndPatronymic
    ? `- КРИТИЧЕСКИ ВАЖНО: Первое сообщение должно начинаться с персонального приветствия: "Здравствуйте, ${nameAndPatronymic}!" Это обязательное требование.`
    : ''
}
`

  console.log(
    '📋 AI Service: Системный промпт подготовлен, длина:',
    systemPrompt.length
  )
  if (ragContext && ragContext.trim()) {
    console.log('🎯 AI Service: В промпт включен RAG контекст!')
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...history.map((msg) => {
      const role = msg.sender === 'user' ? 'user' : 'assistant'
      const message: ChatCompletionMessageParam = { role, content: msg.text }
      return message
    }),
    {
      role: 'user',
      content: message,
    },
  ]

  console.log('🤖 AI Service: Отправляем запрос к AI модели...')
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    max_tokens: 2000,
    temperature: 0.8,
  })

  const result =
    response.choices?.[0]?.message?.content || 'Ошибка ответа от AI'
  console.log('📨 AI Service: Получен ответ от AI, длина:', result.length)

  return result
}

// Тестовая функция для проверки экспорта
export function testFunction(): string {
  return 'Test function works!'
}

// Отладочная информация
console.log(
  '🔧 aiService.ts загружен, функция sendMessageToAI экспортирована:',
  typeof sendMessageToAI
)

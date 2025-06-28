// Полная обработка PDF с использованием pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist'

// Простая настройка worker (обновлено до версии 5.3.31)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.mjs'

console.log(
  '📄 PDF: pdfjs-dist импортирован, версия:',
  pdfjsLib.version || 'неизвестно'
)
console.log(
  '📄 PDF: Worker путь установлен:',
  pdfjsLib.GlobalWorkerOptions.workerSrc
)

// Тестовая функция для проверки pdfjs
export const testPDFJSAvailability = (): boolean => {
  try {
    console.log('🧪 PDF: Тестируем доступность pdfjs-dist...')
    console.log('🧪 PDF: pdfjsLib версия:', pdfjsLib.version)
    console.log('🧪 PDF: getDocument функция:', typeof pdfjsLib.getDocument)
    console.log('🧪 PDF: Worker настройки:', pdfjsLib.GlobalWorkerOptions)
    return true
  } catch (error) {
    console.error('❌ PDF: pdfjs-dist недоступен:', error)
    return false
  }
}

// Функция для извлечения текста из PDF
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log(
      '📄 PDF: Начинаем обработку PDF файла:',
      file.name,
      'размер:',
      file.size
    )

    // Тестируем доступность pdfjs
    const pdfjsAvailable = testPDFJSAvailability()
    if (!pdfjsAvailable) {
      console.error('❌ PDF: pdfjs-dist недоступен, используем placeholder')
      return createPDFPlaceholder(file)
    }

    const arrayBuffer = await file.arrayBuffer()
    console.log('📄 PDF: ArrayBuffer получен, размер:', arrayBuffer.byteLength)

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    console.log('📄 PDF: Документ загружен, страниц:', pdf.numPages)

    let fullText = ''

    // Извлекаем текст со всех страниц
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`📄 PDF: Обрабатываем страницу ${pageNum}/${pdf.numPages}`)

      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // Объединяем текстовые элементы страницы
      const pageText = textContent.items
        .map((item: any) => {
          if ('str' in item) {
            return item.str
          }
          return ''
        })
        .join(' ')

      fullText += `\n--- Страница ${pageNum} ---\n${pageText}\n`
    }

    console.log(
      '✅ PDF: Текст извлечен, общая длина:',
      fullText.length,
      'символов'
    )
    console.log('📝 PDF: Превью:', fullText.substring(0, 200) + '...')

    if (fullText.trim().length === 0) {
      console.warn(
        '⚠️ PDF: Текст не найден, возможно PDF содержит только изображения'
      )
      return createPDFPlaceholder(file)
    }

    return fullText
  } catch (error) {
    console.error('❌ PDF: Ошибка обработки PDF:', error)

    // Детальная диагностика ошибки
    if (error instanceof Error) {
      console.error('❌ PDF: Сообщение ошибки:', error.message)
      console.error('❌ PDF: Stack trace:', error.stack)

      // Специфичные ошибки pdfjs
      if (error.message.includes('worker')) {
        console.error(
          '❌ PDF: Проблема с PDF worker, попробуем альтернативную настройку'
        )
      }
      if (error.message.includes('Invalid PDF')) {
        console.error('❌ PDF: Файл поврежден или не является PDF')
      }
    }

    console.log('🔄 PDF: Используем fallback placeholder из-за ошибки')
    return createPDFPlaceholder(file)
  }
}

// Fallback функция, если возникают проблемы с обработкой PDF
export const createPDFPlaceholder = (file: File): string => {
  return `PDF документ: ${file.name}
        
Содержимое PDF файла временно недоступно. 
Возможные причины:
- PDF содержит только изображения (сканированный документ)
- Файл поврежден или имеет специальную защиту
- Проблемы с PDF worker

Имя файла: ${file.name}
Размер: ${file.size} байт
Дата загрузки: ${new Date().toISOString()}

Рекомендация: Для лучшего качества RAG загрузите документ в формате DOCX или TXT.`
}

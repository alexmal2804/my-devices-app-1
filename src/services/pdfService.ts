// Расширенная обработка PDF (опционально)
// Для использования установите: npm install pdfjs-dist

// Простая функция для извлечения текста из PDF
// В будущем можно заменить на полную реализацию с pdfjs-dist
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Пока используем fallback, так как pdfjs-dist требует дополнительной настройки
    console.info('Обработка PDF файла:', file.name)
    return createPDFPlaceholder(file)

    // TODO: Реализовать полную обработку PDF с pdfjs-dist
    // const arrayBuffer = await file.arrayBuffer();
    // const pdf = await getDocument({ data: arrayBuffer }).promise;
    // ... извлечение текста ...
  } catch (error) {
    console.error('Ошибка обработки PDF:', error)
    return createPDFPlaceholder(file)
  }
}

// Fallback функция, если pdfjs-dist не установлен
export const createPDFPlaceholder = (file: File): string => {
  return `PDF документ: ${file.name}
        
Содержимое PDF файла будет обработано позже. 
Для полной поддержки PDF установите библиотеку pdfjs-dist:
npm install pdfjs-dist

Имя файла: ${file.name}
Размер: ${file.size} байт
Дата загрузки: ${new Date().toISOString()}

Рекомендация: Для лучшего качества RAG загрузите документ в формате DOCX или TXT.`
}

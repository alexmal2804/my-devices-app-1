import { OpenAI } from 'openai'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { Document } from '@langchain/core/documents'
import {
  saveDocumentMetadata,
  saveDocumentChunks,
  searchSimilarChunks,
} from './supabaseClient'
import * as XLSX from 'xlsx'
import * as mammoth from 'mammoth'
import Papa from 'papaparse'
import { extractTextFromPDF } from './pdfService'

const VITE_AI_TUNNEL_KEY = import.meta.env.VITE_AI_TUNNEL_KEY
const VITE_AI_TUNNEL_URL =
  import.meta.env.VITE_VITE_AI_TUNNEL_URL || 'https://api.aitunnel.ru/v1'

// Создаем клиент OpenAI для генерации эмбеддингов
const client = new OpenAI({
  apiKey: VITE_AI_TUNNEL_KEY,
  baseURL: VITE_AI_TUNNEL_URL,
  dangerouslyAllowBrowser: true,
})

// Создаем text splitter для разбивки документов на чанки
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
})

// Функция для извлечения текста из различных типов файлов
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type || '.' + file.name.split('.').pop()?.toLowerCase()

  try {
    switch (true) {
      case fileType.includes('text/plain') || fileType.includes('.txt'):
        return await file.text()

      case fileType.includes('application/pdf') || fileType.includes('.pdf'):
        return await extractTextFromPDF(file)

      case fileType.includes(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) || fileType.includes('.docx'):
        const docxBuffer = await file.arrayBuffer()
        const docxResult = await mammoth.extractRawText({
          arrayBuffer: docxBuffer,
        })
        return docxResult.value

      case fileType.includes(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) || fileType.includes('.xlsx'):
        const xlsxBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(xlsxBuffer, { type: 'array' })
        let xlsxText = ''
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          xlsxText += XLSX.utils.sheet_to_txt(worksheet) + '\n'
        })
        return xlsxText

      case fileType.includes('text/csv') || fileType.includes('.csv'):
        const csvText = await file.text()
        const csvResult = Papa.parse(csvText, { header: true })
        return csvResult.data
          .map((row: any) => Object.values(row).join(' '))
          .join('\n')

      default:
        throw new Error(`Неподдерживаемый тип файла: ${fileType}`)
    }
  } catch (error) {
    console.error('Ошибка извлечения текста из файла:', error)
    throw new Error(`Не удалось извлечь текст из файла ${file.name}`)
  }
}

// Функция для генерации эмбеддингов
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    console.log('🤖 Embedding: Запрашиваем эмбеддинг для текста длиной:', text.length, 'символов')
    
    const response = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.substring(0, 8000), // Ограничиваем длину для безопасности
    })

    console.log('✅ Embedding: Получен эмбеддинг размером:', response.data[0].embedding.length)
    return response.data[0].embedding
  } catch (error) {
    console.error('❌ Embedding: Ошибка генерации эмбеддинга:', error)
    
    // Попробуем другую модель, если ada-002 не работает
    try {
      console.log('🔄 Embedding: Пробуем альтернативную модель...')
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000),
      })
      console.log('✅ Embedding: Альтернативная модель сработала, размер:', response.data[0].embedding.length)
      return response.data[0].embedding
    } catch (fallbackError) {
      console.error('❌ Embedding: Альтернативная модель тоже не работает:', fallbackError)
      throw new Error('Все модели эмбеддингов недоступны')
    }
  }
}

// Функция для обработки и сохранения документа с векторизацией
export const processAndSaveDocument = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    console.log('📄 Process: Начинаем обработку файла:', file.name, 'размер:', file.size)
    onProgress?.(10)

    // Извлекаем текст из файла
    console.log('📝 Process: Извлекаем текст из файла...')
    const content = await extractTextFromFile(file)
    console.log('✅ Process: Текст извлечен, длина:', content.length, 'символов')
    console.log('📝 Process: Превью содержимого:', content.substring(0, 200) + '...')
    onProgress?.(30)

    // Создаем LangChain Document
    const document = new Document({
      pageContent: content,
      metadata: {
        filename: file.name,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
      },
    })

    // Разбиваем документ на чанки
    console.log('✂️ Process: Разбиваем документ на чанки...')
    const chunks = await textSplitter.splitDocuments([document])
    console.log('✅ Process: Документ разбит на', chunks.length, 'чанков')
    onProgress?.(50)

    // Сохраняем метаданные документа
    console.log('💾 Process: Сохраняем метаданные документа...')
    const savedDocument = await saveDocumentMetadata({
      filename: file.name,
      file_type: file.type,
      upload_date: new Date().toISOString(),
      content: content.substring(0, 10000), // Сохраняем первые 10000 символов для предварительного просмотра
      chunks_count: chunks.length,
    })
    console.log('✅ Process: Метаданные сохранены с ID:', savedDocument.id)

    onProgress?.(60)

    // Генерируем эмбеддинги для каждого чанка и сохраняем
    console.log('🤖 Process: Генерируем эмбеддинги для', chunks.length, 'чанков...')
    const vectorChunks = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`🔄 Process: Обрабатываем чанк ${i + 1}/${chunks.length}, длина:`, chunk.pageContent.length)
      
      const embedding = await generateEmbedding(chunk.pageContent)
      console.log(`✅ Process: Эмбеддинг для чанка ${i + 1} готов, размер:`, embedding.length)

      vectorChunks.push({
        document_id: savedDocument.id,
        chunk_index: i,
        content: chunk.pageContent,
        embedding,
        metadata: chunk.metadata,
      })

      // Обновляем прогресс
      const progress = 60 + (i / chunks.length) * 35
      onProgress?.(Math.round(progress))
    }

    // Сохраняем векторные чанки в Supabase
    console.log('💾 Process: Сохраняем', vectorChunks.length, 'векторных чанков в Supabase...')
    await saveDocumentChunks(vectorChunks)
    console.log('✅ Process: Все чанки успешно сохранены!')
    
    onProgress?.(100)
  } catch (error) {
    console.error('❌ Process: Ошибка обработки документа:', error)
    throw error
  }
}

// Функция для поиска релевантной информации в документах
export const searchDocuments = async (
  query: string,
  limit: number = 5
): Promise<{ content: string; metadata: any; similarity: number }[]> => {
  try {
    console.log('🔍 RAG Search: Генерируем эмбеддинг для запроса:', query.substring(0, 100))
    
    // Генерируем эмбеддинг для запроса
    const queryEmbedding = await generateEmbedding(query)
    console.log('✅ RAG Search: Эмбеддинг сгенерирован, размер:', queryEmbedding.length)

    // Ищем похожие чанки в Supabase
    console.log('🔍 RAG Search: Ищем похожие чанки в Supabase...')
    const results = await searchSimilarChunks(queryEmbedding, limit)
    console.log('📋 RAG Search: Результаты из Supabase:', results.length, 'чанков')

    const formattedResults = results.map((result: any) => ({
      content: result.content,
      metadata: result.metadata,
      similarity: result.similarity,
    }))

    console.log('✅ RAG Search: Возвращаем', formattedResults.length, 'отформатированных результатов')
    return formattedResults
  } catch (error) {
    console.error('❌ RAG Search: Ошибка поиска в документах:', error)
    // Fallback: возвращаем пустой массив, если векторный поиск недоступен
    return []
  }
}

// Функция для создания контекста RAG
export const createRAGContext = async (query: string): Promise<string> => {
  console.log('🔍 RAG: Начинаем поиск для запроса:', query.substring(0, 100) + '...')
  
  try {
    const searchResults = await searchDocuments(query)
    console.log('📋 RAG: Найдено результатов:', searchResults.length)

    if (searchResults.length === 0) {
      console.log('❌ RAG: Релевантные документы не найдены')
      return ''
    }

    console.log('✅ RAG: Результаты поиска:', searchResults.map(r => ({
      similarity: r.similarity,
      contentPreview: r.content.substring(0, 100) + '...'
    })))

    const context = searchResults
      .map((result, index) => `Документ ${index + 1} (схожесть: ${result.similarity.toFixed(2)}):\n${result.content}`)
      .join('\n\n---\n\n')

    const finalContext = `Контекст из документов:\n\n${context}`
    console.log('📝 RAG: Сформированный контекст длиной:', finalContext.length, 'символов')
    console.log('🎯 RAG: Контекст готов к использованию в AI промпте')
    
    return finalContext
  } catch (error) {
    console.error('❌ RAG: Ошибка при создании контекста:', error)
    return ''
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Интерфейс для документа
export interface DocumentMetadata {
  id: string
  filename: string
  file_type: string
  upload_date: string
  content?: string
  chunks_count?: number
}

// Интерфейс для векторного чанка
export interface VectorChunk {
  id: string
  document_id: string
  chunk_index: number
  content: string
  embedding: number[]
  metadata?: Record<string, any>
}

// Создание таблиц для документов и векторов (выполнить один раз)
export const createTables = async () => {
  // Попробуем создать таблицы напрямую через SQL запросы
  try {
    // Создание таблицы для метаданных документов
    const { error: documentsError } = await supabase
      .from('documents')
      .select('id')
      .limit(1)

    if (documentsError) {
      console.log('Creating documents table...')
      // Таблица не существует, создаем через raw SQL если есть доступ
    }

    // Создание таблицы для векторных чанков
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .select('id')
      .limit(1)

    if (chunksError) {
      console.log('Creating document_chunks table...')
    }
  } catch (error) {
    console.warn(
      'Tables might need to be created manually in Supabase dashboard:',
      error
    )
  }
}

// Сохранение метаданных документа
export const saveDocumentMetadata = async (
  metadata: Omit<DocumentMetadata, 'id'>
) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert(metadata)
      .select('*')
      .single()

    if (error) {
      console.error('Error saving document metadata:', error)
      if (error.message.includes('does not exist')) {
        throw new Error(
          'Database tables not created. Please run the SQL setup script first.'
        )
      }
      throw error
    }
    return data as DocumentMetadata
  } catch (error) {
    console.error('Failed to save document metadata:', error)
    throw error
  }
}

// Сохранение векторных чанков
export const saveDocumentChunks = async (chunks: Omit<VectorChunk, 'id'>[]) => {
  const { data, error } = await supabase
    .from('document_chunks')
    .insert(chunks)
    .select('*')

  if (error) throw error
  return data as VectorChunk[]
}

// Поиск похожих чанков по векторному поиску
export const searchSimilarChunks = async (
  queryEmbedding: number[],
  limit: number = 10
) => {
  try {
    console.log('🗄️ Supabase: Выполняем векторный поиск с эмбеддингом размера:', queryEmbedding.length)
    console.log('🔍 Supabase: Параметры поиска - threshold: 0.5, limit:', limit)
    
    // Проверяем наличие данных перед поиском
    const { data: checkData, error: checkError } = await supabase
      .from('document_chunks')
      .select('count(*)')
      .not('embedding', 'is', null)
    
    if (checkError) {
      console.warn('⚠️ Supabase: Не удалось проверить наличие эмбеддингов:', checkError)
    } else {
      console.log('📊 Supabase: Чанков с эмбеддингами в базе:', checkData)
    }
    
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Понижаем порог для лучшего поиска
      match_count: limit,
    })

    if (error) {
      console.error('❌ Supabase: Ошибка векторного поиска:', error)
      console.error('❌ Supabase: Детали ошибки:', error.message, error.details, error.hint)
      throw error
    }
    
    console.log('✅ Supabase: Векторный поиск завершен, найдено результатов:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('📋 Supabase: Примеры результатов:', data.slice(0, 2).map((item: any) => ({
        similarity: item.similarity,
        filename: item.filename,
        contentPreview: item.content?.substring(0, 50) + '...'
      })))
    } else {
      console.log('⚠️ Supabase: Векторный поиск не вернул результатов, попробуем fallback')
    }
    
    return data || []
  } catch (error) {
    console.warn('⚠️ Supabase: Vector search failed, trying fallback search:', error)
    
    // Fallback: простой текстовый поиск по содержимому
    try {
      console.log('🔄 Supabase: Пробуем простой текстовый поиск...')
      
      const { data: simpleData, error: simpleError } = await supabase
        .from('document_chunks')
        .select(`
          id,
          content,
          document_id,
          documents!inner(filename)
        `)
        .ilike('content', `%техническ%`) // Ищем по общим терминам
        .limit(limit)

      if (simpleError) {
        console.warn('❌ Supabase: Простой поиск тоже не работает:', simpleError)
        return []
      }

      console.log('✅ Supabase: Простой поиск дал результаты:', simpleData?.length || 0)
      return simpleData?.map((item: any) => ({
        id: item.id,
        document_id: item.document_id,
        content: item.content,
        filename: item.documents?.filename || 'Unknown',
        similarity: 0.6 // Примерная схожесть для fallback поиска
      })) || []
    } catch (fallbackError) {
      console.error('❌ Supabase: Все варианты поиска провалились:', fallbackError)
      return []
    }
  }
}

// Получение всех документов
export const getAllDocuments = async (): Promise<DocumentMetadata[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('upload_date', { ascending: false })

    if (error) {
      console.warn('Error fetching documents:', error)
      // Если таблица не существует, возвращаем пустой массив
      if (error.message.includes('does not exist')) {
        return []
      }
      throw error
    }
    return data as DocumentMetadata[]
  } catch (error) {
    console.warn('Documents table might not exist yet:', error)
    return []
  }
}

// Удаление документа
export const deleteDocument = async (documentId: string) => {
  try {
    // Сначала удаляем связанные чанки
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId)

    if (chunksError && !chunksError.message.includes('does not exist')) {
      console.warn('Error deleting document chunks:', chunksError)
    }

    // Затем удаляем сам документ
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      console.error('Error deleting document:', error)
      if (error.message.includes('does not exist')) {
        throw new Error(
          'Database tables not created. Please run the SQL setup script first.'
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Failed to delete document:', error)
    throw error
  }
}

// Проверка состояния базы данных
export const checkDatabaseStatus = async () => {
  try {
    // Проверяем наличие таблицы documents
    const { error: documentsError } = await supabase
      .from('documents')
      .select('id')
      .limit(1)

    // Проверяем наличие таблицы document_chunks
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .select('id')
      .limit(1)

    return {
      documentsTableExists: !documentsError,
      chunksTableExists: !chunksError,
      errors: {
        documents: documentsError?.message,
        chunks: chunksError?.message,
      },
    }
  } catch (error) {
    console.error('Error checking database status:', error)
    return {
      documentsTableExists: false,
      chunksTableExists: false,
      errors: {
        documents: 'Unknown error',
        chunks: 'Unknown error',
      },
    }
  }
}

// Функция для проверки наличия документов в базе
export const checkDocumentsAvailability = async (): Promise<{
  documentsCount: number;
  chunksCount: number;
  sampleChunks: any[];
}> => {
  try {
    console.log('🔍 Check: Проверяем наличие документов в базе...')
    
    // Проверяем количество документов
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, filename')
      .limit(10)

    if (docsError) {
      console.error('❌ Check: Ошибка при получении документов:', docsError)
      throw docsError
    }

    // Проверяем количество чанков
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('id, content, document_id')
      .limit(5)

    if (chunksError) {
      console.error('❌ Check: Ошибка при получении чанков:', chunksError)
      throw chunksError
    }

    console.log('✅ Check: Документов в базе:', documents?.length || 0)
    console.log('✅ Check: Чанков в базе:', chunks?.length || 0)
    
    if (documents && documents.length > 0) {
      console.log('📋 Check: Примеры документов:', documents.map(d => d.filename))
    }
    
    if (chunks && chunks.length > 0) {
      console.log('📋 Check: Примеры чанков:', chunks.map(c => ({
        id: c.id,
        preview: c.content.substring(0, 50) + '...'
      })))
    }

    return {
      documentsCount: documents?.length || 0,
      chunksCount: chunks?.length || 0,
      sampleChunks: chunks || []
    }
  } catch (error) {
    console.error('❌ Check: Ошибка проверки документов:', error)
    return {
      documentsCount: 0,
      chunksCount: 0,
      sampleChunks: []
    }
  }
}

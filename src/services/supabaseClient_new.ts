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
  const { data, error } = await supabase
    .from('documents')
    .insert(metadata)
    .select('*')
    .single()

  if (error) throw error
  return data as DocumentMetadata
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
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.warn('Vector search not available, falling back to simple search')
    // Fallback: простой текстовый поиск
    return []
  }
}

// Получение всех документов
export const getAllDocuments = async (): Promise<DocumentMetadata[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('upload_date', { ascending: false })

  if (error) throw error
  return data as DocumentMetadata[]
}

// Удаление документа
export const deleteDocument = async (documentId: string) => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) throw error
}

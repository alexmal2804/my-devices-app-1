-- SQL команды для настройки RAG в Supabase
-- Выполните эти команды в Supabase SQL Editor

-- 1. Включение расширения для векторных операций
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Создание таблицы для метаданных документов
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT,
  chunks_count INTEGER DEFAULT 0
);

-- 3. Создание таблицы для векторных чанков
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Создание индекса для векторного поиска
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- 5. Создание функции для семантического поиска
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 6. Настройка RLS (Row Level Security) если требуется
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- 7. Создание политик доступа (опционально)
-- CREATE POLICY "Users can view own documents" ON documents
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own documents" ON documents
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own documents" ON documents
--   FOR DELETE USING (auth.uid() = user_id);

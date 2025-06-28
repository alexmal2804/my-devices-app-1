-- SQL скрипт для создания таблиц в Supabase
-- Выполните этот скрипт в SQL Editor в панели управления Supabase

-- Включаем расширение pgvector для векторного поиска
CREATE EXTENSION IF NOT EXISTS vector;

-- Создание таблицы для метаданных документов
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  content TEXT,
  chunks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание таблицы для векторных чанков
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding размер 1536
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Функция для векторного поиска похожих документов
-- Сначала удаляем существующую функцию, если она есть
DROP FUNCTION IF EXISTS match_documents(vector, double precision, integer);
DROP FUNCTION IF EXISTS match_documents(vector, float, int);

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  filename text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    d.filename,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  LEFT JOIN documents d ON dc.document_id = d.id
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Политики безопасности (если используется RLS)
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Разрешить всем читать и записывать (настройте по своим требованиям)
-- CREATE POLICY "Enable read access for all users" ON documents FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON documents FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON documents FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete access for all users" ON documents FOR DELETE USING (true);

-- То же самое для document_chunks
-- CREATE POLICY "Enable read access for all users" ON document_chunks FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON document_chunks FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON document_chunks FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete access for all users" ON document_chunks FOR DELETE USING (true);

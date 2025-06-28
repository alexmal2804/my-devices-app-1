-- Скрипт для исправления существующих функций в Supabase
-- Используйте этот скрипт если получаете ошибку "cannot change return type of existing function"

-- Удаляем все существующие версии функции match_documents
DROP FUNCTION IF EXISTS match_documents(vector);
DROP FUNCTION IF EXISTS match_documents(vector, double precision);
DROP FUNCTION IF EXISTS match_documents(vector, float);
DROP FUNCTION IF EXISTS match_documents(vector, double precision, integer);
DROP FUNCTION IF EXISTS match_documents(vector, float, int);
DROP FUNCTION IF EXISTS match_documents(vector, real, integer);

-- Также удаляем функцию с любыми другими возможными сигнатурами
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid) as args
        FROM pg_catalog.pg_proc p
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname = 'match_documents'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.match_documents(' || func_record.args || ')';
    END LOOP;
END $$;

-- Теперь создаем правильную функцию
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

-- Добавляем вспомогательную функцию для проверки данных
CREATE OR REPLACE FUNCTION check_rag_data()
RETURNS TABLE (
  documents_count bigint,
  chunks_count bigint,
  sample_chunk text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM documents),
    (SELECT COUNT(*) FROM document_chunks),
    (SELECT content FROM document_chunks LIMIT 1);
END;
$$;

-- Функция для тестирования векторного поиска
CREATE OR REPLACE FUNCTION test_vector_search()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    result_count integer;
BEGIN
    -- Проверяем наличие данных
    SELECT COUNT(*) INTO result_count FROM document_chunks WHERE embedding IS NOT NULL;
    
    IF result_count = 0 THEN
        RETURN 'Нет чанков с эмбеддингами в базе данных';
    ELSE
        RETURN format('Найдено %s чанков с эмбеддингами', result_count);
    END IF;
END;
$$;

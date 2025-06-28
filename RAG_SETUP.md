# Настройка RAG в приложении с Supabase

## 1. Создание таблиц в Supabase

Выполните следующие SQL команды в Supabase SQL Editor:

```sql
-- Создание таблицы для метаданных документов
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT,
  chunks_count INTEGER DEFAULT 0
);

-- Создание таблицы для векторных чанков
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Создание индекса для векторного поиска
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Создание функции для семантического поиска
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
```

## 2. Включение расширения pgvector

В Supabase SQL Editor выполните:

```sql
-- Включение расширения для векторных операций
CREATE EXTENSION IF NOT EXISTS vector;
```

## 3. Настройка переменных окружения

Убедитесь, что в файле `.env.local` указаны правильные параметры подключения к Supabase:

```
VITE_NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_TUNNEL_KEY=your_ai_tunnel_key
VITE_AI_TUNNEL_URL=https://api.aitunnel.ru/v1
```

## 4. Функциональность RAG

Реализованный функционал включает:

### Загрузка документов

- Поддержка форматов: PDF (базовая поддержка), DOCX, XLSX, CSV, TXT
- Извлечение текста из файлов
- Разбивка на чанки с помощью LangChain
- Генерация эмбеддингов через OpenAI API
- Сохранение в векторную базу Supabase

**Примечание по PDF:** В текущей реализации PDF файлы обрабатываются с базовой поддержкой (сохраняются метаданные). Для полной обработки PDF установите `npm install pdfjs-dist` и обновите сервис.

### Семантический поиск

- Поиск релевантных чанков по запросу пользователя
- Использование косинусного сходства
- Интеграция с AI-помощником

### Интеграция с чатом

- Автоматическое получение контекста из документов
- Улучшенные ответы AI на основе загруженных документов
- Сохранение существующего функционала

## 5. Использование

1. Нажмите кнопку "Загрузить документы" в правом верхнем углу Dashboard
2. Перетащите файлы или выберите их через диалог
3. Дождитесь завершения обработки (векторизации)
4. Задавайте вопросы в AI-помощнике - он будет использовать информацию из документов для более точных ответов

## 6. Компоненты системы

- **RAG Service** (`ragService.ts`) - обработка документов и векторный поиск
- **Supabase Client** (`supabaseClient.ts`) - работа с базой данных
- **Documents Slice** (`documentsSlice.ts`) - управление состоянием документов
- **AI Service** (`aiService.ts`) - интеграция RAG с LLM
- **Document Upload Modal** - интерфейс загрузки документов

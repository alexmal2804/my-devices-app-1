# 🗄️ Настройка базы данных Supabase для RAG

## Проблема

Если вы видите ошибку `column documents.upload_date does not exist`, это означает, что таблицы в Supabase еще не созданы.

## Решение

### Шаг 1: Откройте панель управления Supabase

1. Перейдите на [https://app.supabase.com](https://app.supabase.com)
2. Войдите в свой аккаунт
3. Выберите ваш проект

### Шаг 2: Выполните SQL-скрипт

#### Для новой установки:

1. В левом меню выберите **SQL Editor**
2. Нажмите **New Query**
3. Скопируйте содержимое файла `supabase_tables.sql` и вставьте в редактор
4. Нажмите **Run** для выполнения скрипта

#### Если получили ошибку функции:

Если видите ошибку `cannot change return type of existing function`:

1. Сначала выполните код из файла `fix_functions.sql`
2. Затем выполните код из файла `supabase_tables.sql`

#### Возможные ошибки:

- **"extension vector does not exist"** → Включите расширение в Database → Extensions
- **"permission denied"** → Проверьте права API ключа
- **"function already exists"** → Используйте `fix_functions.sql`

### Шаг 3: Проверьте создание таблиц

1. В левом меню выберите **Table Editor**
2. Вы должны увидеть две новые таблицы:
   - `documents` - для метаданных документов
   - `document_chunks` - для векторных чанков

### Структура таблиц

#### Таблица `documents`

- `id` (UUID) - уникальный идентификатор
- `filename` (TEXT) - имя файла
- `file_type` (TEXT) - тип файла (docx, pdf, txt и т.д.)
- `upload_date` (TIMESTAMPTZ) - дата загрузки
- `content` (TEXT) - полное содержимое документа
- `chunks_count` (INTEGER) - количество чанков
- `created_at` (TIMESTAMPTZ) - дата создания
- `updated_at` (TIMESTAMPTZ) - дата обновления

#### Таблица `document_chunks`

- `id` (UUID) - уникальный идентификатор
- `document_id` (UUID) - ссылка на документ
- `chunk_index` (INTEGER) - порядковый номер чанка
- `content` (TEXT) - содержимое чанка
- `embedding` (VECTOR) - векторное представление
- `metadata` (JSONB) - дополнительные метаданные
- `created_at` (TIMESTAMPTZ) - дата создания

### Шаг 4: Настройка переменных окружения

Убедитесь, что у вас настроены переменные окружения:

```env
VITE_NEXT_PUBLIC_SUPABASE_URL=ваш_url_supabase
VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key
```

### Шаг 5: Настройка безопасности (опционально)

Если вы используете Row Level Security (RLS), раскомментируйте соответствующие строки в SQL-скрипте.

## Функции

### Векторный поиск

Скрипт создает функцию `match_documents()` для поиска похожих документов:

```sql
SELECT * FROM match_documents(
  query_embedding,
  match_threshold := 0.7,
  match_count := 10
);
```

### Автоматические триггеры

- Автоматическое обновление `updated_at` при изменении документа
- Каскадное удаление чанков при удалении документа

## Устранение неполадок

### Ошибка: "extension vector does not exist"

Если видите ошибку о расширении pgvector:

1. Перейдите в **Database** → **Extensions**
2. Найдите и включите расширение **vector**

### Ошибка: "permission denied"

Проверьте права доступа вашего API ключа в настройках проекта.

### Ошибка: "relation does not exist"

Убедитесь, что SQL-скрипт выполнился без ошибок и таблицы созданы.

## Проверка работы

После создания таблиц приложение должно:

1. Успешно загружать документы
2. Отображать список загруженных документов
3. Использовать векторный поиск в AI-чате

## Мониторинг

В панели Supabase вы можете:

- Просматривать содержимое таблиц в **Table Editor**
- Проверять логи в **Logs**
- Анализировать производительность в **Database** → **Reports**

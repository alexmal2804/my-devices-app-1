# 🚨 Быстрое исправление ошибки "does not exist"

## Проблема

Ошибка: `column documents.upload_date does not exist`

## Быстрое решение (2 минуты)

### 1. Откройте Supabase

- Перейдите на https://app.supabase.com
- Войдите в ваш проект

### 2. Выполните SQL-скрипт

#### Вариант A: Новая установка

- В левом меню: **SQL Editor**
- Нажмите **New Query**
- Скопируйте и вставьте код из файла `supabase_tables.sql`
- Нажмите **Run**

#### Вариант B: Если получили ошибку функции

Если видите ошибку `cannot change return type of existing function`:

- Сначала выполните код из файла `fix_functions.sql`
- Затем выполните `supabase_tables.sql`

### 3. Перезапустите приложение

```bash
npm run dev
```

## Возможные ошибки и решения

### ❌ "cannot change return type of existing function"

**Решение:** Выполните сначала `fix_functions.sql`, затем `supabase_tables.sql`

### ❌ "extension vector does not exist"

**Решение:**

1. Перейдите в **Database** → **Extensions**
2. Найдите и включите **vector**
3. Повторите выполнение скрипта

### ❌ "permission denied"

**Решение:** Проверьте права доступа API ключа в настройках проекта

## Что создается

- Таблица `documents` - для хранения файлов
- Таблица `document_chunks` - для векторного поиска
- Функция `match_documents()` - для RAG поиска

## Проверка

После выполнения скрипта:

1. Попробуйте загрузить документ
2. Ошибка должна исчезнуть
3. Документы должны отображаться в списке

## Дополнительная помощь

Полная инструкция: `SUPABASE_SETUP.md`

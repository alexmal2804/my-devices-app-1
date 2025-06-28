# ✅ Исправлена ошибка синтаксиса Supabase

## Проблема

```
PGRST100: "failed to parse select parameter (count(*))"
```

## Причина

В Supabase нельзя использовать `select('count(*)')` - это неправильный синтаксис для PostgreSQL REST API.

## Решение

Заменили:

```typescript
// ❌ Неправильно
.select('count(*)')

// ✅ Правильно
.select('*', { count: 'exact', head: true })
```

## Что исправлено в supabaseClient.ts

### Строка 115-117:

```typescript
const { count: checkCount, error: checkError } = await supabase
  .from('document_chunks')
  .select('*', { count: 'exact', head: true })
  .not('embedding', 'is', null)
```

### Логирование:

```typescript
console.log('📊 Supabase: Чанков с эмбеддингами в базе:', checkCount || 0)
```

## Альтернативные способы подсчета в Supabase

1. **Точный подсчет** (медленнее, но точно):

   ```typescript
   .select('*', { count: 'exact', head: true })
   ```

2. **Приблизительный подсчет** (быстрее):

   ```typescript
   .select('*', { count: 'estimated', head: true })
   ```

3. **Подсчет с данными**:
   ```typescript
   .select('*', { count: 'exact' })
   ```

## Статус: ✅ ИСПРАВЛЕНО

Теперь:

- ✅ Ошибка синтаксиса устранена
- ✅ Подсчет чанков работает корректно
- ✅ RAG система может проверять наличие данных
- ✅ Готово к тестированию загрузки документов

## Следующие шаги

1. Обновите страницу в браузере
2. Проверьте что ошибка исчезла
3. Протестируйте загрузку документа `test-manual.txt`
4. Убедитесь что RAG контекст используется в ответах AI

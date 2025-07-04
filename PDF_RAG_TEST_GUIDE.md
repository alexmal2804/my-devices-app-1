# 🎯 ТЕСТИРОВАНИЕ PDF RAG СИСТЕМЫ

## Что исправлено

✅ **Полная поддержка PDF** - теперь PDF файлы корректно обрабатываются и содержимое извлекается для RAG

## Как протестировать PDF RAG

### Шаг 1: Подготовка

1. Найдите любой PDF документ с текстом (инструкции, руководства, отчеты)
2. Убедитесь, что приложение запущено: http://localhost:3000

### Шаг 2: Загрузка PDF

1. Войдите в Dashboard
2. Нажмите "Загрузить документ"
3. Выберите PDF файл
4. **Следите за логами в консоли браузера (F12)**

### Шаг 3: Проверка логов

Должны появиться сообщения:

```
📁 Extract: Определен тип файла: application/pdf
📄 PDF: Начинаем обработку PDF файла
📄 PDF: Документ загружен, страниц: X
✅ PDF: Текст извлечен, общая длина: XXX символов
🤖 Process: Генерируем эмбеддинги для X чанков
💾 Process: Все чанки успешно сохранены!
```

### Шаг 4: Тестирование RAG

1. Откройте AI-помощник
2. Задайте вопросы по содержимому PDF:
   - "О чем этот документ?"
   - "Какая основная информация в файле?"
   - Конкретные вопросы по тексту

### Шаг 5: Проверка результата

AI должен:

- ✅ Использовать информацию из PDF в ответах
- ✅ Ссылаться на конкретные детали из документа
- ✅ Отвечать релевантно содержимому

## Диагностика проблем

### Если PDF не обрабатывается:

1. **Проверьте тип файла** - должен быть `application/pdf`
2. **Проверьте размер** - очень большие PDF могут тормозить
3. **Проверьте содержимое** - PDF только с картинками не даст текста

### Если текст не извлекается:

- PDF может содержать только изображения (сканы)
- Попробуйте PDF с реальным текстом
- Проверьте логи на ошибки

### Если RAG не работает:

- Убедитесь что чанки сохранились в Supabase
- Проверьте логи генерации эмбеддингов
- Проверьте API ключи

## Альтернатива для тестирования

Если нет PDF под рукой, используйте `test-manual.txt` - он уже готов для тестирования RAG.

## Результат

✅ PDF документы теперь полностью поддерживаются в RAG системе!

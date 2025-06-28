# 🔧 Техническая документация: Режим загрузки

## Архитектура решения

### Компоненты

1. **DeviceForm.tsx** - основная форма логина с кнопкой "Режим загрузки"
2. **Dashboard.tsx** - страница с функционалом загрузки документов
3. **App.tsx** - маршрутизация между компонентами

### Реализация перехода

```typescript
const handleUploadMode = () => {
  // Переход в Dashboard без логина для режима загрузки документов
  navigate('/dashboard')
}
```

### Кнопка в UI

```typescript
{
  !employee && (
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        onClick={handleUploadMode}
        sx={{
          minWidth: 200,
          height: 44,
          fontWeight: 600,
          fontSize: '0.95rem',
          color: SBER_GREEN,
          borderColor: SBER_GREEN,
          // ... стили
        }}
      >
        📚 Режим загрузки документов
      </Button>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, maxWidth: 300, mx: 'auto' }}
      >
        Перейти в режим загрузки документов для RAG без привязки к сотруднику
      </Typography>
    </Box>
  )
}
```

## Маршрутизация

### React Router v5 (текущая версия)

```typescript
// App.tsx
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

;<Router>
  <Switch>
    <Route path="/" exact component={Login} />
    <Route path="/dashboard" component={Dashboard} />
  </Switch>
</Router>
```

### Навигация

```typescript
// DeviceForm.tsx
import { useHistory } from 'react-router-dom'

const history = useHistory()
// Использование: history.push('/dashboard')
```

## Логика отображения

### Условие показа кнопки

Кнопка "Режим загрузки" показывается только если:

- Пользователь НЕ авторизован (`!employee`)
- Находится на форме логина

### Состояния интерфейса

1. **Не авторизован**: показывается форма логина + кнопка "Режим загрузки"
2. **Авторизован**: показывается информация о сотруднике + устройства
3. **Режим загрузки**: Dashboard с функционалом RAG

## Интеграция с Redux

### Состояние авторизации

```typescript
const auth = useSelector((state: any) => state.auth)
const employee = auth.employee
```

### Состояние документов

```typescript
const documentsState = useSelector((state: any) => state.documents)
```

## Стилизация

### Цветовая схема Сбербанка

```typescript
const SBER_GREEN = '#21A038'
const SBER_LIGHT = '#F4F7F6'
const SBER_ACCENT = '#00C95F'
```

### Адаптивность

- Кнопка адаптируется под разные размеры экранов
- Используется Material-UI breakpoints
- Минимальная ширина 200px

## Файлы для изменения

При модификации функционала учитывайте:

1. **DeviceForm.tsx** - логика и UI кнопки
2. **Dashboard.tsx** - функционал загрузки документов
3. **App.tsx** - маршрутизация
4. **documentsSlice.ts** - состояние документов
5. **ragService.ts** - обработка документов

## Зависимости

### Обязательные пакеты

- `react-router-dom` (v5.3.4 - текущая версия)
- `@mui/material`
- `@mui/icons-material`
- `@reduxjs/toolkit`
- `react-redux`

### Рекомендации

- Используйте синтаксис React Router v5 (Switch, useHistory)
- Следуйте паттернам Redux Toolkit
- Соблюдайте цветовую схему Сбербанка
- Обеспечивайте адаптивность интерфейса

### Примечание о версиях

Проект использует React Router v5.3.4. При обновлении до v6+ потребуется:

- Замена `Switch` на `Routes`
- Замена `useHistory` на `useNavigate`
- Обновление синтаксиса Route (`component` → `element`)

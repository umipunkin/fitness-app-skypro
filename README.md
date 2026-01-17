# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# Fitness App - Документация проекта

## Описание
Веб-приложение для фитнес-тренировок с возможностью просмотра курсов, отслеживания прогресса и управления профилем.

## Структура проекта

### Директории
- `assets/` - Статические ресурсы (стили, изображения, шрифты)
- `components/` - Vue компоненты
- `composables/` - Vue композаблы для повторной логики
- `layouts/` - Layout компоненты
- `pages/` - Страницы приложения
  - `course/` - Страницы курсов
- `stores/` - Pinia хранилища состояния
- `utils/` - Вспомогательные утилиты

### Маршрутизация

## Основные компоненты

### 1. AppAuthForm (`components/AppAuthForm.vue`)
Компонент формы авторизации/регистрации с валидацией и обработкой ошибок.

**Пропсы:**
- `isLogin: Boolean` - Режим формы (вход/регистрация)
- `isVisible: Boolean` - Видимость компонента
- `isModal: Boolean` - Модальный режим

### 2. CourseCardComponent (`components/CourseCardComponent.vue`)
Карточка курса с изображением, описанием и действиями.

**Составные компоненты:**
- `CourseImageSection` - Изображение и кнопка добавления
- `CourseMetaInfo` - Мета-информация о курсе

### 3. UserProfileComponent (`components/UserProfileComponent.vue`)
Компонент профиля пользователя с отображением данных и списком курсов.

## Хранилища (Pinia)

### 1. user (`stores/user.js`)
Управление аутентификацией и данными пользователя.

**Состояние:**
- `userData` - Данные пользователя
- `token` - JWT токен
- `isLoading` - Флаг загрузки
- `error` - Ошибки

**Действия:**
- `register(email, password)` - Регистрация
- `login(email, password)` - Вход
- `fetchUserData()` - Загрузка данных пользователя
- `logout()` - Выход

### 2. courses (`stores/courses.js`)
Управление курсами и курсами пользователя.

**Состояние:**
- `courses` - Все курсы
- `userCourses` - Курсы пользователя
- `loading` - Флаг загрузки
- `_cache` - Кэш курсов

**Действия:**
- `fetchCourses()` - Загрузка всех курсов
- `getCourseById(id)` - Получение курса по ID
- `addCourse(courseId)` - Добавление курса пользователю
- `removeCourse(courseId)` - Удаление курса

### 3. workouts (`stores/workouts.js`)
Управление тренировками и прогрессом.

**Действия:**
- `fetchWorkout(workoutId)` - Загрузка тренировки
- `fetchCourseProgress(courseId)` - Загрузка прогресса курса
- `saveWorkoutProgress(courseId, workoutId, progressData)` - Сохранение прогресса

## Обработка ошибок

### Уровни обработки:
1. **UI уровень** - Понятные сообщения для пользователя
2. **Хранилища** - Логирование и восстановление состояния
3. **API уровень** - Централизованная обработка HTTP ошибок

### Типы ошибок:
- Валидационные (email, пароль)
- Сетевые ошибки
- Ошибки авторизации
- Ошибки сервера

## Code Style

### Конвенции именования:
- **Компоненты**: PascalCase (CourseCardComponent)
- **Хранилища**: camelCase (useCoursesStore)
- **Файлы**: kebab-case (course-card-component.vue)
- **Переменные**: camelCase (userCourses)
- **Константы**: UPPER_SNAKE_CASE (API_BASE_URL)

### Структура компонентов:
```vue
<template>
  <!-- HTML разметка -->
</template>

<script setup>
  // Логика компонента
</script>

<style scoped>
  /* Стили компонента */
</style>
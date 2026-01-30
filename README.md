# Публикация на Render.com (быстро)

> Подходит для проекта, где фронтенд (`index.html`, `admin.html`) и API (эндпоинты вида `/api/results`) обслуживаются одним Node/Express‑приложением.

## 1) Подготовьте репозиторий
В репозитории должны быть:
- `package.json` со скриптами:
  - `start` — запуск сервера (Express)
- Папка со статикой (например `public/`) где лежат `index.html`, `admin.html` (и любые `assets_*`).

Если у вас Express, типовой минимум:
- `app.use(express.static('public'))`
- `app.get('/api/results', ...)` и т.п.

## 2) Создайте Web Service на Render
1. Зайдите в Dashboard Render → **New** → **Web Service**
2. Подключите GitHub репозиторий
3. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## 3) Переменные окружения
В Render → Settings → **Environment** добавьте:

- `DATABASE_URL` = ваша строка подключения Postgres  
  Пример (ваша):  
  `postgresql://rosseti_test_db_user:ltgq2VgHxtmUSHxfA2VMxcahDJ54Jnd4@dpg-d5qg8e7pm1nc738qfov0-a/rosseti_test_db`

Рекомендуется также:
- `ADMIN_PASSWORD` — пароль админ‑панели (чтобы не хранить в HTML/коде)
- `NODE_ENV` = `production`

> Если в вашем коде пароль админа сейчас «захардкожен» в `admin.html`, лучше перенести проверку на сервер (API), а в админке хранить только сессию/токен.

## 4) Проверка после деплоя
- Откройте главную страницу сервиса: `https://<ваш-сервис>.onrender.com/`
- Админка: `https://<ваш-сервис>.onrender.com/admin.html`
- Проверьте, что запросы к `/api/results` проходят (в DevTools → Network).

## 5) Частые проблемы
- **Админка «не реагирует»**: откройте DevTools → Console. Обычно это синтаксическая ошибка JS.
- **404 на файлы**: убедитесь, что Express раздаёт статику из правильной папки.
- **Ошибка подключения к БД**: проверьте `DATABASE_URL`, доступность хоста и SSL‑настройки драйвера (некоторые Postgres требуют SSL).

---

Если ваш проект *только статический* (без API), на Render лучше создать **Static Site** и указать папку публикации (Publish Directory), но тогда админке негде брать `/api/results`.

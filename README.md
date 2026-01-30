# Rosseti Test System (Postgres)

## Запуск локально
```bash
export DATABASE_URL="postgres://user:pass@localhost:5432/rosseti"
export ADMIN_PASSWORD="admin123"
npm install
npm start
```
Открыть: http://localhost:3000

## Деплой на Render
1. Создайте PostgreSQL в Render и возьмите `DATABASE_URL`.
2. Создайте Web Service из репозитория.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Env Vars:
   - `DATABASE_URL` = (из Render Postgres)
   - `ADMIN_PASSWORD` = admin123

Админка: `/admin.html` (пароль admin123).

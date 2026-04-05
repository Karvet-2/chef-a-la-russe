# Цифровая система оценивания кулинарного чемпионата "Chef a la Russe"

Next.js 14, Prisma, PostgreSQL, JWT.

## Структура репозитория

| Папка / файл | Содержимое |
|--------------|------------|
| **`frontend/`** | Next.js: `app/`, `components/`, `lib/api.ts`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `next-env.d.ts`, **`.eslintrc.json`** |
| **`backend/`** | Prisma (`prisma/schema.prisma`), `lib/`, `services/` |
| **`docker/`** | **`Dockerfile`**, **`docker-compose.yml`**, **`docker-compose.dev.yml`** |
| **`scripts/`** | Утилиты, `move-layout.js`, **`SYNC.cmd`** (перенос UI в `frontend/`) |
| **`docs/`** | Документация, например **`STRUCTURE.md`** |
| **`secrets/`** | Локальные секреты (например перенесённый `admin-credentials.txt`) — не коммитятся |
| **`uploads/`** | Загруженные файлы; в репозитории закреплены только пустые `files/`, `documents/`, `violations/` (`.gitkeep`) |
| **Корень** | `package.json`, `package-lock.json`, **`tsconfig.json`**, `.gitignore`, `.env`, **`README.md`**, **`SYNC.cmd`** (ярлык → `scripts\SYNC.cmd`) |

Подробнее: [`docs/STRUCTURE.md`](docs/STRUCTURE.md).

Схема БД: **`backend/prisma/schema.prisma`**.

## Первый шаг / синхронизация UI

Если нужно перенести `app/` из корня в `frontend/`:

```bat
SYNC.cmd
```

или: `node scripts/move-layout.js`  
(основной сценарий: **`scripts\SYNC.cmd`**)

## Запуск

```bash
npm install
# .env в корне: DATABASE_URL, JWT_SECRET
npm run db:generate
npm run db:push
npm run dev
```

Судья: `npm run create-organizer <email> <пароль> "<ФИО>"`

## Docker

Команды из **`package.json`** используют файлы в **`docker/`** (запускать из **корня** репозитория):

```bash
npm run docker:db:up
npm run docker:up
```

Или явно:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

См. [`docker/README.md`](docker/README.md).

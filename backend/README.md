# Backend

Серверная логика для API Next.js (`frontend/app/api/**` импортирует через `@backend/*`).

| Путь | Назначение |
|------|------------|
| `prisma/schema.prisma` | Схема БД (корневой `package.json`: `"prisma": { "schema": "backend/prisma/schema.prisma" }`) |
| `lib/prisma.ts` | Prisma Client |
| `lib/auth.ts` | bcrypt, JWT |
| `lib/middleware.ts` | `requireAuth`, `requireRole` |
| `lib/upload-paths.ts` | `getUploadsRoot()` для каталога `uploads/` |
| `services/` | Сервисы (например, вход) |

Миграции и `prisma generate` выполняются из **корня** репозитория (`npm run db:*`).

# Расположение файлов

| Где | Что |
|-----|-----|
| **`frontend/`** | Next.js: `app/`, `components/`, конфиги (`next.config.js`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `next-env.d.ts`), `.eslintrc.json` |
| **`backend/`** | Prisma (`prisma/schema.prisma`), `lib/`, `services/` |
| **`docker/`** | `Dockerfile`, `docker-compose.yml`, `docker-compose.dev.yml` |
| **`scripts/`** | Утилиты, `move-layout.js`, `ensure-frontend.js`, `SYNC.cmd` |
| **`secrets/`** | Локальные пароли/ключи (не в git) |
| **Корень** | `package.json`, `tsconfig.json` (workspace), `.gitignore`, `.env`, `README.md` |

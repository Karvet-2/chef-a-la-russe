# Docker

Запуск из **корня репозитория**:

```bash
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.dev.yml up -d postgres
```

Том `uploads` монтируется из `../uploads` относительно этой папки (= корень проекта).

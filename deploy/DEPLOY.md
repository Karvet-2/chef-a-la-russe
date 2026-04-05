# Деплой на VPS (Timeweb) по SSH

Локальный Docker на Windows не нужен: всё собирается и крутится на сервере.

## 0. Подготовка

- Репозиторий на **GitHub / GitLab / Gitea** (чтобы с сервера сделать `git clone`).
- В панели **managed PostgreSQL**: разрешён доступ с **IP вашего VPS**; скопирована строка подключения (при необходимости добавьте `sslmode=require` в URL).

## 1. Зайти по SSH

```bash
ssh root@ВАШ_IP
```

## 2. Установить Docker (Ubuntu)

```bash
apt update && apt install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

Проверка: `docker compose version`

*(Если на Timeweb уже стоит Docker из образа — шаг можно пропустить.)*

## 3. Клонировать проект

```bash
cd /opt
git clone https://github.com/ВАШ_АККАУНТ/Diplom.git chef
cd chef
```

Подставьте свой URL репозитория.

## 4. Окружение

```bash
cp .env.production.example .env.production
nano .env.production
```

Заполните **`DATABASE_URL`** (из панели БД) и **`JWT_SECRET`** (длинная случайная строка). Сохраните (в nano: Ctrl+O, Enter, Ctrl+X).

Папка для загрузок:

```bash
mkdir -p uploads/documents uploads/violations uploads/files
chmod -R 755 uploads
```

## 5. Сборка и запуск

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Проверка логов: `docker compose -f docker-compose.prod.yml logs -f`

Приложение слушает **`127.0.0.1:3000`** внутри сервера.

## 6. Nginx и домен

- DNS: **A-запись** домена на IP VPS.
- Скопируйте пример `deploy/nginx.chef.conf.example` в `/etc/nginx/sites-available/`, замените `server_name`, включите сайт и перезагрузите nginx.
- SSL: **certbot** (`certbot --nginx`) или сертификат в панели Timeweb.

## Обновление версии

```bash
cd /opt/chef
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Без Docker (PM2)

cd /opt/chef
git pull
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml up -d
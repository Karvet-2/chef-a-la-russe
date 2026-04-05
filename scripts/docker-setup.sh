#!/bin/bash
# Скрипт для первоначальной настройки Docker окружения

echo "====================================="
echo "  Настройка Docker для проекта"
echo "====================================="
echo ""

# Проверка наличия Docker
echo "Проверка Docker..."
if command -v docker &> /dev/null; then
    echo "✓ Docker установлен: $(docker --version)"
else
    echo "✗ Docker не установлен!"
    echo "Установите Docker с https://www.docker.com/"
    exit 1
fi

# Проверка наличия docker-compose
echo "Проверка Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✓ Docker Compose установлен: $(docker-compose --version)"
else
    echo "✗ Docker Compose не установлен!"
    exit 1
fi

echo ""

# Проверка .env файла
echo "Проверка .env файла..."
if [ -f .env ]; then
    echo "✓ Файл .env существует"
else
    echo "✗ Файл .env не найден. Создаю..."
    
    cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chef_championship?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
EOF
    
    echo "✓ Файл .env создан"
    echo "⚠ ВАЖНО: Измените JWT_SECRET на безопасный ключ!"
fi

echo ""

# Выбор режима работы
echo "Выберите режим работы:"
echo "1. Разработка (только PostgreSQL в Docker, приложение локально)"
echo "2. Продакшен (полный стек в Docker)"
echo ""

read -p "Введите номер (1 или 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "Запуск PostgreSQL в Docker..."
    docker-compose -f docker-compose.dev.yml up -d postgres
    
    echo ""
    echo "Ожидание инициализации PostgreSQL..."
    sleep 5
    
    echo ""
    echo "✓ PostgreSQL запущен!"
    echo ""
    echo "Следующие шаги:"
    echo "1. npm install"
    echo "2. npm run db:generate"
    echo "3. npm run db:push"
    echo "4. npm run dev"
    echo ""
    echo "Для Prisma Studio: npm run docker:studio"
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "Запуск полного стека в Docker..."
    docker-compose up -d --build
    
    echo ""
    echo "✓ Все сервисы запущены!"
    echo ""
    echo "Приложение доступно на: http://localhost:3000"
    echo ""
    echo "Полезные команды:"
    echo "- npm run docker:logs - просмотр логов"
    echo "- npm run docker:down - остановка"
    echo "- npm run docker:restart - перезапуск"
    
else
    echo "Неверный выбор!"
    exit 1
fi

echo ""
echo "====================================="
echo "  Настройка завершена!"
echo "====================================="

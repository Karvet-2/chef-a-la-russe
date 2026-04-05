# Скрипт для первоначальной настройки Docker окружения

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Настройка Docker для проекта" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия Docker
Write-Host "Проверка Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker установлен: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker не установлен!" -ForegroundColor Red
    Write-Host "Установите Docker Desktop с https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Проверка наличия docker-compose
Write-Host "Проверка Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose установлен: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose не установлен!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Проверка .env файла
Write-Host "Проверка .env файла..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "✓ Файл .env существует" -ForegroundColor Green
} else {
    Write-Host "✗ Файл .env не найден. Создаю..." -ForegroundColor Yellow
    
    $envContent = @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chef_championship?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
"@
    
    Set-Content -Path .env -Value $envContent
    Write-Host "✓ Файл .env создан" -ForegroundColor Green
    Write-Host "⚠ ВАЖНО: Измените JWT_SECRET на безопасный ключ!" -ForegroundColor Yellow
}

Write-Host ""

# Выбор режима работы
Write-Host "Выберите режим работы:" -ForegroundColor Cyan
Write-Host "1. Разработка (только PostgreSQL в Docker, приложение локально)" -ForegroundColor White
Write-Host "2. Продакшен (полный стек в Docker)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Введите номер (1 или 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Запуск PostgreSQL в Docker..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d postgres
    
    Write-Host ""
    Write-Host "Ожидание инициализации PostgreSQL..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "✓ PostgreSQL запущен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Следующие шаги:" -ForegroundColor Cyan
    Write-Host "1. npm install" -ForegroundColor White
    Write-Host "2. npm run db:generate" -ForegroundColor White
    Write-Host "3. npm run db:push" -ForegroundColor White
    Write-Host "4. npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Для Prisma Studio: npm run docker:studio" -ForegroundColor Cyan
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "Запуск полного стека в Docker..." -ForegroundColor Yellow
    docker-compose up -d --build
    
    Write-Host ""
    Write-Host "✓ Все сервисы запущены!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Приложение доступно на: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Полезные команды:" -ForegroundColor Cyan
    Write-Host "- npm run docker:logs - просмотр логов" -ForegroundColor White
    Write-Host "- npm run docker:down - остановка" -ForegroundColor White
    Write-Host "- npm run docker:restart - перезапуск" -ForegroundColor White
    
} else {
    Write-Host "Неверный выбор!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Настройка завершена!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

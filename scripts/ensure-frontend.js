const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.join(__dirname, '..')
const marker = path.join(root, 'frontend', 'app', 'layout.tsx')

if (!fs.existsSync(marker)) {
  if (!fs.existsSync(path.join(root, 'app', 'layout.tsx'))) {
    console.error(
      '[ensure-frontend] Нет frontend/app и нет корневого app/ для копирования.\n' +
        '  Запустите один раз: SYNC.cmd   или   node scripts/move-layout.js'
    )
    process.exit(1)
  }
  console.log('[ensure-frontend] Заполняю frontend/ (копия app, components, … + импорты @backend)…')
  execSync(`node "${path.join(__dirname, 'move-layout.js')}"`, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })
}

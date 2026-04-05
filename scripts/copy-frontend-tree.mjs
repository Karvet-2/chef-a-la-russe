import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function cp(from, to) {
  fs.cpSync(path.join(root, from), path.join(root, to), { recursive: true })
}

for (const d of ['app', 'components', 'contexts']) {
  const src = path.join(root, d)
  if (fs.existsSync(src)) {
    cp(d, path.join('frontend', d))
    console.log('copied', d)
  }
}

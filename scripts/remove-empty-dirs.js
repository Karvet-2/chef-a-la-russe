const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

function tryRemoveEmpty(rel) {
  const dir = path.join(root, rel)
  if (!fs.existsSync(dir)) return
  try {
    if (fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir)
      console.log('removed', rel)
    }
  } catch {}
}

tryRemoveEmpty('database/prisma')
tryRemoveEmpty('database')
console.log('done')

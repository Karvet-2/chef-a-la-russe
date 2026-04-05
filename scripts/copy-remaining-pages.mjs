import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true })
  for (const name of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, name.name)
    const d = path.join(dst, name.name)
    if (name.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

copyDir(path.join(root, 'components'), path.join(root, 'frontend', 'components'))
copyDir(path.join(root, 'public'), path.join(root, 'frontend', 'public'))
console.log('ok components + public')

const pairs = [
  ['app/uploads/page.tsx', 'frontend/app/uploads/page.tsx'],
  ['app/uploads/documents/page.tsx', 'frontend/app/uploads/documents/page.tsx'],
  ['app/results/page.tsx', 'frontend/app/results/page.tsx'],
  ['app/admin/page.tsx', 'frontend/app/admin/page.tsx'],
  ['app/admin/statistics/page.tsx', 'frontend/app/admin/statistics/page.tsx'],
  ['app/admin/users/page.tsx', 'frontend/app/admin/users/page.tsx'],
  ['app/admin/teams/page.tsx', 'frontend/app/admin/teams/page.tsx'],
  ['app/admin/teams/[id]/page.tsx', 'frontend/app/admin/teams/[id]/page.tsx'],
  ['app/organizer/page.tsx', 'frontend/app/organizer/page.tsx'],
  ['app/organizer/participants/page.tsx', 'frontend/app/organizer/participants/page.tsx'],
  ['app/organizer/results/page.tsx', 'frontend/app/organizer/results/page.tsx'],
  ['app/organizer/teams/page.tsx', 'frontend/app/organizer/teams/page.tsx'],
  ['app/organizer/teams/[id]/page.tsx', 'frontend/app/organizer/teams/[id]/page.tsx'],
  ['app/organizer/teams/[id]/judges/[judgeId]/page.tsx', 'frontend/app/organizer/teams/[id]/judges/[judgeId]/page.tsx'],
  ['app/organizer/documents/page.tsx', 'frontend/app/organizer/documents/page.tsx'],
]

for (const [relSrc, relDst] of pairs) {
  const src = path.join(root, relSrc)
  const dst = path.join(root, relDst)
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.copyFileSync(src, dst)
  console.log('ok', relDst)
}

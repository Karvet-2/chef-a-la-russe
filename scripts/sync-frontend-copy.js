const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const files = [
  'app/globals.css',
  'app/layout.tsx',
  'components/organizer/OrganizerHeader.tsx',
  'components/organizer/JudgeSheetFeedback.tsx',
  'app/organizer/page.tsx',
  'app/organizer/teams/page.tsx',
  'app/organizer/results/page.tsx',
  'app/organizer/participants/page.tsx',
  'app/organizer/teams/[id]/page.tsx',
  'app/organizer/teams/[id]/judges/[judgeId]/page.tsx',
]
for (const f of files) {
  const from = path.join(root, f)
  const to = path.join(root, 'frontend', f)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
  console.log('copied', f)
}

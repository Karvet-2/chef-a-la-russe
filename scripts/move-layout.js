const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const preserveRoot = process.env.PRESERVE_ROOT === '1'

function cp(from, to) {
  fs.cpSync(path.join(root, from), path.join(root, to), { recursive: true })
}

const dirs = ['app', 'components', 'contexts', 'public']
for (const d of dirs) {
  if (!fs.existsSync(path.join(root, d))) {
    console.warn('skip', d)
    continue
  }
  cp(d, path.join('frontend', d))
  console.log('copied', d)
}

fs.mkdirSync(path.join(root, 'frontend', 'lib'), { recursive: true })
if (fs.existsSync(path.join(root, 'lib', 'api.ts'))) {
  fs.copyFileSync(path.join(root, 'lib', 'api.ts'), path.join(root, 'frontend', 'lib', 'api.ts'))
  console.log('copied lib/api.ts')
}

for (const f of ['next.config.js', 'tailwind.config.js', 'postcss.config.js']) {
  if (fs.existsSync(path.join(root, f))) {
    fs.copyFileSync(path.join(root, f), path.join(root, 'frontend', f))
    console.log('copied', f)
  }
}
if (fs.existsSync(path.join(root, 'next-env.d.ts'))) {
  fs.copyFileSync(path.join(root, 'next-env.d.ts'), path.join(root, 'frontend', 'next-env.d.ts'))
}
const frontendTsPath = path.join(root, 'frontend', 'tsconfig.json')
const frontendTsconfig = {
  compilerOptions: {
    target: 'es5',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'react-jsx',
    incremental: true,
    plugins: [{ name: 'next' }],
    paths: {
      '@/*': ['./*'],
      '@backend/*': ['../backend/*'],
    },
  },
  include: [
    'next-env.d.ts',
    '**/*.ts',
    '**/*.tsx',
    '.next/types/**/*.ts',
    '.next/dev/types/**/*.ts',
  ],
  exclude: ['node_modules'],
}
fs.writeFileSync(frontendTsPath, JSON.stringify(frontendTsconfig, null, 2) + '\n')
console.log('written frontend/tsconfig.json (Next + @backend/*)')

function walk(dir, fn) {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, fn)
    else if (/\.(ts|tsx)$/.test(name)) fn(p)
  }
}

const apiRoot = path.join(root, 'frontend', 'app', 'api')
walk(apiRoot, (p) => {
  let s = fs.readFileSync(p, 'utf8')
  s = s.replace(/@\/lib\/prisma/g, '@backend/lib/prisma')
  s = s.replace(/@\/lib\/middleware/g, '@backend/lib/middleware')
  s = s.replace(/@\/lib\/auth/g, '@backend/lib/auth')
  if (s.includes("join(process.cwd(), 'uploads'") || s.includes('join(process.cwd(), "uploads"')) {
    if (!s.includes('getUploadsRoot')) {
      s = s.replace(
        /import \{ join \} from 'path'\n/,
        "import { join } from 'path'\nimport { getUploadsRoot } from '@backend/lib/upload-paths'\n"
      )
    }
    s = s.replace(/join\(process\.cwd\(\), ['"]uploads['"], ['"]files['"]\)/g, "join(getUploadsRoot(), 'files')")
    s = s.replace(/join\(process\.cwd\(\), ['"]uploads['"], ['"]documents['"]\)/g, "join(getUploadsRoot(), 'documents')")
    s = s.replace(/join\(process\.cwd\(\), ['"]uploads['"], ['"]violations['"]\)/g, "join(getUploadsRoot(), 'violations')")
  }
  fs.writeFileSync(p, s)
})

const loginPath = path.join(root, 'frontend', 'app', 'api', 'auth', 'login', 'route.ts')
if (fs.existsSync(loginPath)) {
  let s = fs.readFileSync(loginPath, 'utf8')
  if (!s.includes('loginWithEmailPassword')) {
    s = `import { NextRequest, NextResponse } from 'next/server'
import { loginWithEmailPassword } from '@backend/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await loginWithEmailPassword(email, password)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json({
      token: result.token,
      user: result.user,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
`
    fs.writeFileSync(loginPath, s)
    console.log('updated login route')
  }
}

if (!preserveRoot) {
  for (const d of dirs) {
    const p = path.join(root, d)
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true })
      console.log('removed root', d)
    }
  }
  if (fs.existsSync(path.join(root, 'lib'))) {
    fs.rmSync(path.join(root, 'lib'), { recursive: true, force: true })
    console.log('removed root lib')
  }
  for (const f of ['next.config.js', 'tailwind.config.js', 'postcss.config.js', 'next-env.d.ts']) {
    const fp = path.join(root, f)
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp)
      console.log('removed root', f)
    }
  }
  const rootTs = path.join(root, 'tsconfig.json')
  if (fs.existsSync(rootTs)) {
    fs.unlinkSync(rootTs)
  }
  fs.writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'react-jsx',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: {
            '@/*': ['./frontend/*', './*'],
            '@backend/*': ['./backend/*'],
            '@/lib/prisma': ['./backend/lib/prisma.ts'],
            '@/lib/middleware': ['./backend/lib/middleware.ts'],
            '@/lib/auth': ['./backend/lib/auth.ts'],
          },
        },
        include: [
          'app/**/*.ts',
          'app/**/*.tsx',
          'frontend/**/*.ts',
          'frontend/**/*.tsx',
          'backend/**/*.ts',
          'scripts/**/*.ts',
        ],
        exclude: ['node_modules', 'frontend/.next'],
      },
      null,
      2
    ) + '\n'
  )
  console.log('written root tsconfig.json (workspace: frontend + backend)')
  console.log('Корень очищен от дубликатов UI.')
} else {
  console.log('PRESERVE_ROOT=1 — папки в корне не удалялись.')
}

console.log('Done.')

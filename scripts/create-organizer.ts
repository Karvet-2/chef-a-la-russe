import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'organizer@example.com'
  const password = process.argv[3] || 'admin123'
  const fio = process.argv[4] || 'Organizer Admin'

  if (!email || email === 'organizer@example.com') {
    console.error('❌ Ошибка: Укажите email судьи')
    console.error('\nИспользование:')
    console.error('  npm run create-organizer [email] [password] [fio]')
    console.error('\nПример:')
    console.error('  npm run create-organizer organizer@example.com admin123 "Иван Иванов"')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const organizer = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'organizer',
      status: 'confirmed',
      password: hashedPassword,
      fio,
    },
    create: {
      email,
      password: hashedPassword,
      fio,
      role: 'organizer',
      status: 'confirmed',
    },
  })

  console.log('✅ Судья создан/обновлен:')
  console.log({
    id: organizer.id,
    email: organizer.email,
    fio: organizer.fio,
    role: organizer.role,
    status: organizer.status,
  })
  console.log('\n💡 Теперь можно войти в систему с этими учетными данными')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

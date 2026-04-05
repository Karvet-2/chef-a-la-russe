import { prisma } from '../lib/prisma'
import { comparePassword, generateToken } from '../lib/auth'

export async function loginWithEmailPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { ok: false as const, error: 'Invalid email or password' as const }
  }

  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    return { ok: false as const, error: 'Invalid email or password' as const }
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    ok: true as const,
    token,
    user: {
      id: user.id,
      email: user.email,
      fio: user.fio,
      phone: user.phone,
      city: user.city,
      organization: user.organization,
      role: user.role,
      status: user.status,
    },
  }
}

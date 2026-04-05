import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { comparePassword, generateToken, hashPassword } from '../lib/auth'

export async function loginWithEmailPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { ok: false as const, error: 'Неверный email или пароль' as const }
  }

  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    return { ok: false as const, error: 'Неверный email или пароль' as const }
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

const RESET_TTL_MS = 60 * 60 * 1000 // 1 ч.

export async function requestPasswordReset(email: string) {
  const trimmed = email.trim()
  const user = await prisma.user.findFirst({
    where: { email: { equals: trimmed, mode: 'insensitive' } },
  })
  if (!user) {
    return { ok: true as const, token: null, email: null }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + RESET_TTL_MS)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expires,
    },
  })

  return { ok: true as const, token, userId: user.id, email: user.email }
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!token || !newPassword || newPassword.length < 6) {
    return { ok: false as const, error: 'Неверные данные' as const }
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  })

  if (!user) {
    return { ok: false as const, error: 'Ссылка недействительна или истекла. Запросите новую.' as const }
  }

  const hashed = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  })

  return { ok: true as const }
}

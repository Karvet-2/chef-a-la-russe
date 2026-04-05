import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@backend/services/auth.service'

function publicOrigin(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  return `${proto}://${host}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email : ''
    if (!email.trim()) {
      return NextResponse.json({ error: 'Укажите email' }, { status: 400 })
    }

    const result = await requestPasswordReset(email)
    const origin = publicOrigin(request)
    const showLink = process.env.PASSWORD_RESET_RETURN_LINK === '1'

    if (result.token) {
      const resetLink = `${origin}/reset-password?token=${encodeURIComponent(result.token)}`
      console.log(`[password-reset] ${email.trim()} -> ${resetLink}`)
      if (showLink) {
        return NextResponse.json({
          ok: true,
          message: 'Перейдите по ссылке для нового пароля.',
          resetLink,
        })
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        'Если такой email зарегистрирован, откройте ссылку для сброса из письма. Если почта на сервере не настроена — ссылка записана в лог контейнера (docker compose logs).',
    })
  } catch (e: unknown) {
    console.error('forgot-password', e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

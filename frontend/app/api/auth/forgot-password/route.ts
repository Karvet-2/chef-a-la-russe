import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@backend/services/auth.service'
import { isSmtpConfigured, sendPasswordResetEmail } from '@backend/lib/mail'

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

    if (result.token && result.email) {
      const resetLink = `${origin}/reset-password?token=${encodeURIComponent(result.token)}`

      if (isSmtpConfigured()) {
        try {
          await sendPasswordResetEmail(result.email, resetLink)
          return NextResponse.json({
            ok: true,
            message: 'Письмо со ссылкой для сброса пароля отправлено на ваш email.',
          })
        } catch (mailErr: unknown) {
          console.error('[password-reset] SMTP error:', mailErr)
          return NextResponse.json(
            {
              error:
                'Не удалось отправить письмо. Проверьте SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS в .env.production.',
            },
            { status: 500 }
          )
        }
      }

      console.log(`[password-reset] SMTP не настроен. Ссылка для ${result.email}: ${resetLink}`)
      if (showLink) {
        return NextResponse.json({
          ok: true,
          message: 'Почта не настроена — откройте ссылку ниже.',
          resetLink,
        })
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        'Если такой email зарегистрирован, мы отправили инструкции. Проверьте почту и папку «Спам».',
    })
  } catch (e: unknown) {
    console.error('forgot-password', e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

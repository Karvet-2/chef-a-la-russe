import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordWithToken } from '@backend/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = typeof body.token === 'string' ? body.token : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!token || !password) {
      return NextResponse.json({ error: 'Токен и новый пароль обязательны' }, { status: 400 })
    }

    const result = await resetPasswordWithToken(token, password)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error('reset-password', e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

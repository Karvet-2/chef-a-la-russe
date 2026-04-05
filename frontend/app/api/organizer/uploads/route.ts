import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@backend/lib/prisma'
import { requireRole } from '@backend/lib/middleware'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined

    const uploads = await prisma.upload.findMany({
      where: userId ? { userId } : undefined,
      include: {
        user: { select: { id: true, fio: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(uploads)
  } catch (error: any) {
    console.error('Get organizer uploads error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


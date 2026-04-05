import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const organizers = await prisma.user.findMany({
      where: {
        role: 'organizer',
      },
      select: {
        id: true,
        fio: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    return NextResponse.json(organizers)
  } catch (error: any) {
    console.error('Get organizers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

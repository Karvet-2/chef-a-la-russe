import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    let whereClause: any = {}
    
    if (userId) {
      whereClause.userId = userId
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fio: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    return NextResponse.json(documents)
  } catch (error: any) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

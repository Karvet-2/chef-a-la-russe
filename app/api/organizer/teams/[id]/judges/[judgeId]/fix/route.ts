import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; judgeId: string }> | { id: string; judgeId: string } }
) {
  const authResult = await requireRole(request, ['organizer', 'admin', 'participant'])
  if (authResult.error) return authResult.error

  try {
    const resolved = await Promise.resolve(params)
    const teamId = resolved.id
    const judgeId = resolved.judgeId
    const requester = authResult.user
    const canEditAny = requester.role === 'organizer' || requester.role === 'admin'
    if (!canEditAny && requester.id !== judgeId) {
      return NextResponse.json(
        { error: 'Forbidden: judge can fix only own sheet' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const stage = (searchParams.get('stage') as 'qualifier' | 'final') || 'qualifier'

    const results = await prisma.result.findMany({
      where: {
        teamId,
        judgeId,
        stage,
      }
    })

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No results found to fix' },
        { status: 400 }
      )
    }

    await prisma.result.updateMany({
      where: {
        teamId,
        judgeId,
        stage,
      },
      data: {
        status: 'fixed',
      }
    })

    return NextResponse.json({ message: 'Sheet fixed successfully' })
  } catch (error: any) {
    console.error('Fix result sheet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

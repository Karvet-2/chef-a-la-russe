import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; judgeId: string }> | { id: string; judgeId: string } }
) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const resolved = await Promise.resolve(params)
    const teamId = resolved.id
    const judgeId = resolved.judgeId
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
        { error: 'No results found to unfix' },
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
        status: 'draft',
      }
    })

    return NextResponse.json({ message: 'Sheet unfixed successfully' })
  } catch (error: any) {
    console.error('Unfix result sheet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

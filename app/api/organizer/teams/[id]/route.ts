import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const resolvedParams = await Promise.resolve(params)
    const teamId = resolvedParams.id
    
    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      )
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fio: true,
                email: true,
                phone: true,
                city: true,
                organization: true,
                status: true,
              }
            }
          }
        },
        results: {
          orderBy: {
            createdAt: 'desc',
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(team)
  } catch (error: any) {
    console.error('Get team error:', error)
    const errorMessage = error?.message || 'Internal server error'
    console.error('Error details:', {
      teamId,
      error: errorMessage,
      stack: error?.stack,
    })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

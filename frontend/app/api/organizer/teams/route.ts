import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@backend/lib/prisma'
import { requireRole } from '@backend/lib/middleware'

function resolveChampionshipType(explicit: unknown, category: string): 'adult' | 'junior' {
  if (explicit === 'junior') return 'junior'
  if (explicit === 'adult') return 'adult'
  if (/юниор|junior/i.test(category)) return 'junior'
  return 'adult'
}

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const teams = await prisma.team.findMany({
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
              }
            }
          }
        },
        results: {
          select: {
            id: true,
            judgeId: true,
            dishNumber: true,
            total: true,
            stage: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    const teamsWithAvgScore = teams.map(team => {
      const stage = (team.stage as 'qualifier' | 'final') || 'qualifier'
      const results = team.results.filter((r: any) => (r.stage || 'qualifier') === stage)
      let avgScore = 0
      
      if (results.length > 0) {
        const totalScore = results.reduce((sum, r) => sum + r.total, 0)
        avgScore = totalScore / results.length
      }

      return {
        ...team,
        stage,
        avgScore: avgScore.toFixed(2),
      }
    })

    return NextResponse.json(teamsWithAvgScore)
  } catch (error: any) {
    console.error('Get teams error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const body = await request.json()
    const { name, category, coachName, userIds, championshipType: rawType } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: 'name and category are required' },
        { status: 400 }
      )
    }

    const championshipType = resolveChampionshipType(rawType, String(category))

    let membersNested: { create: { userId: string; status: string }[] } | undefined
    if (userIds && userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, status: true },
      })
      membersNested = {
        create: userIds.map((userId: string) => {
          const u = users.find((x) => x.id === userId)
          return {
            userId,
            status: u?.status === 'confirmed' ? 'confirmed' : 'pending',
          }
        }),
      }
    }

    const team = await prisma.team.create({
      data: {
        name,
        category,
        championshipType,
        coachName: coachName || null,
        status: 'confirmed',
        members: membersNested,
      },
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
              }
            }
          }
        }
      }
    })

    return NextResponse.json(team)
  } catch (error: any) {
    console.error('Create team error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const body = await request.json()
    const { teamId, status } = body

    if (!teamId || !status) {
      return NextResponse.json(
        { error: 'teamId and status are required' },
        { status: 400 }
      )
    }

    if (!['pending', 'confirmed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: { status },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fio: true,
                email: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(team)
  } catch (error: any) {
    console.error('Update team status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

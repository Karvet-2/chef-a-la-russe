import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const teams = await prisma.team.findMany({
      include: {
        results: {
          select: {
            id: true,
            judgeId: true,
            dishNumber: true,
            total: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    const teamsWithScores = teams.map(team => {
      const results = team.results
      let avgScore = 0
      
      if (results.length > 0) {
        const totalScore = results.reduce((sum, r) => sum + r.total, 0)
        avgScore = totalScore / results.length
      }

      return {
        id: team.id,
        name: team.name,
        category: team.category,
        avgScore: avgScore,
        totalScore: avgScore,
      }
    }).sort((a, b) => b.avgScore - a.avgScore)
    .map((team, index) => ({
      ...team,
      place: index + 1,
    }))

    return NextResponse.json(teamsWithScores)
  } catch (error: any) {
    console.error('Get results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

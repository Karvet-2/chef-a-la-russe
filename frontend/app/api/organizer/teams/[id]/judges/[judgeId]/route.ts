import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@backend/lib/prisma'
import { requireRole } from '@backend/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; judgeId: string }> | { id: string; judgeId: string } }
) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const { id: teamId, judgeId } = await Promise.resolve(params)
    const { searchParams } = new URL(request.url)
    const stage = (searchParams.get('stage') as 'qualifier' | 'final') || 'qualifier'

    const results = await prisma.result.findMany({
      where: {
        teamId,
        judgeId,
        stage,
      },
      include: {
        violationPhotos: true,
      },
      orderBy: {
        dishNumber: 'asc',
      }
    })

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Get judge results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; judgeId: string }> | { id: string; judgeId: string } }
) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const { id: teamId, judgeId } = await Promise.resolve(params)
    const body = await request.json()
    const { dishNumber, taste, presentation, workSkills, hygiene, miseEnPlace, penalties, stage } = body
    const stageVal: 'qualifier' | 'final' = ['qualifier', 'final'].includes(stage) ? stage : 'qualifier'

    const dishNum = parseInt(dishNumber, 10)
    const tasteVal = Number(taste)
    const presentationVal = Number(presentation)
    const workSkillsVal = Number(workSkills)
    const hygieneVal = Number(hygiene)
    const miseEnPlaceVal = Number(miseEnPlace)
    const penaltiesVal = Number(penalties) || 0

    if (!dishNum || isNaN(tasteVal) || isNaN(presentationVal) || isNaN(workSkillsVal) ||
        isNaN(hygieneVal) || isNaN(miseEnPlaceVal)) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const teamData = await prisma.team.findUnique({
      where: { id: teamId },
      select: { category: true },
    })
    const dishCount = teamData?.category && /юниор|junior/i.test(teamData.category) ? 2 : 3
    if (dishNum < 1 || dishNum > dishCount) {
      return NextResponse.json(
        { error: `dishNumber must be 1..${dishCount}` },
        { status: 400 }
      )
    }
    if (tasteVal < 0 || tasteVal > 50 || presentationVal < 0 || presentationVal > 15 || workSkillsVal < 0 || workSkillsVal > 20 || hygieneVal < 0 || hygieneVal > 10 || miseEnPlaceVal < 0 || miseEnPlaceVal > 5 || penaltiesVal < 0) {
      return NextResponse.json(
        { error: 'Invalid score range' },
        { status: 400 }
      )
    }

    const total = Math.max(0, tasteVal + presentationVal + workSkillsVal + hygieneVal + miseEnPlaceVal - penaltiesVal)

    const existing = await prisma.result.findFirst({
      where: { teamId, judgeId, dishNumber: dishNum, stage: stageVal },
      select: { id: true },
    })

    const hasFixedSheet = await prisma.result.findFirst({
      where: { teamId, judgeId, stage: stageVal, status: 'fixed' },
      select: { id: true },
    })
    if (hasFixedSheet) {
      return NextResponse.json(
        { error: 'Result sheet is fixed and cannot be edited' },
        { status: 400 }
      )
    }

    const result = existing
      ? await prisma.result.update({
          where: { id: existing.id },
          data: {
            taste: tasteVal,
            presentation: presentationVal,
            workSkills: workSkillsVal,
            hygiene: hygieneVal,
            miseEnPlace: miseEnPlaceVal,
            penalties: penaltiesVal,
            total,
            status: 'draft',
            stage: stageVal,
          },
        })
      : await prisma.result.create({
          data: {
            teamId,
            judgeId,
            dishNumber: dishNum,
            taste: tasteVal,
            presentation: presentationVal,
            workSkills: workSkillsVal,
            hygiene: hygieneVal,
            miseEnPlace: miseEnPlaceVal,
            penalties: penaltiesVal,
            total,
            status: 'draft',
            stage: stageVal,
          },
        })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Create/update result error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { readFile } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'files')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const authResult = await requireAuth(request)
  if (authResult.error) return authResult.error

  try {
    const resolvedParams = await Promise.resolve(params)
    const uploadId = resolvedParams.id

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID is required' }, { status: 400 })
    }

    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      select: { id: true, teamId: true, fileName: true },
    })

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    const isStaff = ['admin', 'organizer'].includes(authResult.user.role)
    const inTeam = isStaff
      ? true
      : !!(await prisma.teamMember.findFirst({
          where: { teamId: upload.teamId, userId: authResult.user.id },
        }))

    if (!inTeam) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const filePath = join(UPLOAD_DIR, upload.fileName)
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(upload.fileName)}"`,
      },
    })
  } catch (error: any) {
    console.error('Download upload error:', error)
    const errorMessage = error?.message || 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}


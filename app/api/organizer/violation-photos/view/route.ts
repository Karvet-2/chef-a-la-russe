import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/middleware'
import { readFile } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'violations')

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('id')

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    const photo = await prisma.violationPhoto.findUnique({
      where: { id: photoId }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const filePath = join(UPLOAD_DIR, photo.fileName)
    const fileBuffer = await readFile(filePath)

    const ext = photo.fileName.split('.').pop()?.toLowerCase()
    const contentType = ext === 'jpg' || ext === 'jpeg' 
      ? 'image/jpeg' 
      : ext === 'png' 
      ? 'image/png' 
      : ext === 'gif'
      ? 'image/gif'
      : 'image/jpeg'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${photo.fileName}"`,
      },
    })
  } catch (error: any) {
    console.error('View violation photo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

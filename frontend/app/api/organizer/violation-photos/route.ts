import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@backend/lib/prisma'
import { requireRole } from '@backend/lib/middleware'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { getUploadsRoot } from '@backend/lib/upload-paths'

const UPLOAD_DIR = join(getUploadsRoot(), 'violations')

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['organizer', 'admin'])
  if (authResult.error) return authResult.error

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const resultId = formData.get('resultId') as string
    const criterionKey = formData.get('criterionKey') as string

    if (!file || !resultId || !criterionKey) {
      return NextResponse.json(
        { error: 'File, resultId and criterionKey are required' },
        { status: 400 }
      )
    }

    if (!['taste', 'presentation', 'workSkills', 'hygiene', 'miseEnPlace'].includes(criterionKey)) {
      return NextResponse.json(
        { error: 'Invalid criterionKey' },
        { status: 400 }
      )
    }

    const result = await prisma.result.findUnique({
      where: { id: resultId }
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      )
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(UPLOAD_DIR, fileName)

    await writeFile(filePath, buffer)

    const violationPhoto = await prisma.violationPhoto.create({
      data: {
        resultId,
        criterionKey,
        fileName: fileName,
        fileSize: file.size,
      }
    })

    return NextResponse.json(violationPhoto)
  } catch (error: any) {
    console.error('Upload violation photo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    try {
      const filePath = join(UPLOAD_DIR, photo.fileName)
      await unlink(filePath)
    } catch (error) {
      console.warn('File not found:', photo.fileName)
    }

    await prisma.violationPhoto.delete({
      where: { id: photoId }
    })

    return NextResponse.json({ message: 'Photo deleted successfully' })
  } catch (error: any) {
    console.error('Delete violation photo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

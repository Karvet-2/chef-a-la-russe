import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@backend/lib/prisma'
import { requireAuth } from '@backend/lib/middleware'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { getUploadsRoot } from '@backend/lib/upload-paths'

const UPLOAD_DIR = join(getUploadsRoot(), 'documents')
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passport: 'Паспорт',
  medbook: 'Медицинская книжка',
  consent: 'Согласие на обработку данных',
  admission: 'Допуск',
  certificate: 'Справка',
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult.error) return authResult.error

  try {
    const documents = await prisma.document.findMany({
      where: {
        userId: authResult.user.id,
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

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult.error) return authResult.error

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = String(formData.get('documentType') || '')

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }
    if (!DOCUMENT_TYPE_LABELS[documentType]) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(UPLOAD_DIR, fileName)

    await writeFile(filePath, buffer)

    const label = DOCUMENT_TYPE_LABELS[documentType]
    const prefix = `${label}: `
    const prevDocs = await prisma.document.findMany({
      where: {
        userId: authResult.user.id,
        name: { startsWith: prefix },
      },
    })
    for (const prev of prevDocs) {
      try {
        await unlink(join(UPLOAD_DIR, prev.fileName))
      } catch {}
    }
    if (prevDocs.length > 0) {
      await prisma.document.deleteMany({
        where: { id: { in: prevDocs.map((d) => d.id) } },
      })
    }

    const document = await prisma.document.create({
      data: {
        userId: authResult.user.id,
        name: `${label}: ${file.name}`,
        fileName: fileName,
        fileSize: file.size,
        status: 'pending',
      }
    })

    return NextResponse.json(document)
  } catch (error: any) {
    console.error('Upload document error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

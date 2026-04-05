import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['admin'])
  if (authResult.error) return authResult.error

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fio: true,
        phone: true,
        city: true,
        organization: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['admin'])
  if (authResult.error) return authResult.error

  try {
    const body = await request.json()
    const { email, password, fio, phone, city, organization, role, status } = body

    if (!email || !password || !fio || !role) {
      return NextResponse.json(
        { error: 'Email, password, FIO and role are required' },
        { status: 400 }
      )
    }

    const allowedRoles = ['participant', 'organizer', 'admin']
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}` },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fio,
        phone: phone || null,
        city: city || null,
        organization: organization || null,
        role,
        status: status || 'pending',
      },
      select: {
        id: true,
        email: true,
        fio: true,
        phone: true,
        city: true,
        organization: true,
        role: true,
        status: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user,
    })
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

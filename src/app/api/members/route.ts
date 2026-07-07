import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() { return NextResponse.json(await prisma.member.findMany({ orderBy: { name: 'asc' } })) }
export async function POST(req: NextRequest) {
  const b = await req.json()
  return NextResponse.json(await prisma.member.create({ data: { name: b.name, title: b.title, email: b.email, color: b.color ?? '#3b82f6' } }), { status: 201 })
}

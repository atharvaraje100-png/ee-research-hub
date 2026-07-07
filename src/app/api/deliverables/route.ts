import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() { return NextResponse.json(await prisma.deliverable.findMany({ include: { owner: true, reviewer: true }, orderBy: { dueDate: 'asc' } })) }
export async function POST(req: NextRequest) {
  const b = await req.json()
  const data: any = { ...b }
  if (b.dueDate) data.dueDate = new Date(b.dueDate)
  return NextResponse.json(await prisma.deliverable.create({ data, include: { owner: true, reviewer: true } }), { status: 201 })
}

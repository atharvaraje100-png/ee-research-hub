import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  return NextResponse.json(await prisma.group.findMany({ include: { tasks: { include: { assignee: true, timeLogs: true, predecessors: { include: { predecessor: true } }, successors: { include: { successor: true } } }, orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }))
}
export async function POST(req: NextRequest) {
  const b = await req.json()
  const count = await prisma.group.count()
  const g = await prisma.group.create({ data: { name: b.name, color: b.color ?? '#3b82f6', order: count }, include: { tasks: true } })
  return NextResponse.json(g, { status: 201 })
}

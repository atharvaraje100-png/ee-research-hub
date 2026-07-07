import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  return NextResponse.json(await prisma.timeLog.findMany({ include: { member: true, task: true }, orderBy: { date: 'desc' } }))
}
export async function POST(req: NextRequest) {
  const b = await req.json()
  const log = await prisma.timeLog.create({ data: { taskId: b.taskId, memberId: b.memberId, hours: Number(b.hours), description: b.description ?? null, date: b.date ? new Date(b.date) : new Date() }, include: { member: true, task: true } })
  return NextResponse.json(log, { status: 201 })
}

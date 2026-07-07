import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() { return NextResponse.json(await prisma.interview.findMany({ include: { stakeholder: true, interviewer: true }, orderBy: { createdAt: 'desc' } })) }
export async function POST(req: NextRequest) {
  const b = await req.json()
  const data: any = { stakeholderId: b.stakeholderId, interviewerId: b.interviewerId, keyThemes: b.keyThemes ?? [], barriersFound: b.barriersFound ?? [], notes: b.notes ?? null, followUpNeeded: b.followUpNeeded ?? false, durationMinutes: b.durationMinutes ? Number(b.durationMinutes) : null }
  if (b.scheduledDate) data.scheduledDate = new Date(b.scheduledDate)
  if (b.completedDate) data.completedDate = new Date(b.completedDate)
  return NextResponse.json(await prisma.interview.create({ data, include: { stakeholder: true, interviewer: true } }), { status: 201 })
}

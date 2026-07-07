import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const b = await req.json()
  const data: any = { ...b }
  if (b.scheduledDate) data.scheduledDate = new Date(b.scheduledDate)
  if (b.completedDate) data.completedDate = new Date(b.completedDate)
  return NextResponse.json(await prisma.interview.update({ where: { id: params.id }, data, include: { stakeholder: true, interviewer: true } }))
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.interview.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const b = await req.json()
  const data: any = { ...b }
  if (b.dueDate) data.dueDate = new Date(b.dueDate)
  return NextResponse.json(await prisma.deliverable.update({ where: { id: params.id }, data, include: { owner: true, reviewer: true } }))
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.deliverable.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

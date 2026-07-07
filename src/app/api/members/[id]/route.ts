import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(await prisma.member.update({ where: { id: params.id }, data: await req.json() }))
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.task.updateMany({ where: { assigneeId: params.id }, data: { assigneeId: null } })
  await prisma.member.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

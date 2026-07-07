import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const b = await req.json()
  return NextResponse.json(await prisma.group.update({ where: { id: params.id }, data: b }))
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.group.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

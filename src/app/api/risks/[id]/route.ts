import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(await prisma.risk.update({ where: { id: params.id }, data: await req.json(), include: { owner: true } }))
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.risk.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

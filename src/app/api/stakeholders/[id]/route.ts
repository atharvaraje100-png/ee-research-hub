import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(await prisma.stakeholder.update({ where: { id: params.id }, data: await req.json() }))
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.stakeholder.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

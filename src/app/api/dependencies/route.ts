import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function POST(req: NextRequest) {
  const b = await req.json()
  try {
    const dep = await prisma.taskDependency.create({ data: { predecessorId: b.predecessorId, successorId: b.successorId } })
    return NextResponse.json(dep, { status: 201 })
  } catch { return NextResponse.json({ error: 'Dependency already exists or invalid' }, { status: 400 }) }
}
export async function DELETE(req: NextRequest) {
  const b = await req.json()
  await prisma.taskDependency.deleteMany({ where: { predecessorId: b.predecessorId, successorId: b.successorId } })
  return NextResponse.json({ ok: true })
}

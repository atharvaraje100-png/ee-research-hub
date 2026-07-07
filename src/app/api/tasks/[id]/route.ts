import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({ where: { id: params.id }, include: { assignee: true, group: true, timeLogs: { include: { member: true } }, predecessors: { include: { predecessor: true } }, successors: { include: { successor: true } } } })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const b = await req.json()
  const data: any = {}
  if (b.name !== undefined) data.name = b.name
  if (b.status !== undefined) data.status = b.status
  if (b.priority !== undefined) data.priority = b.priority
  if (b.assigneeId !== undefined) data.assigneeId = b.assigneeId || null
  if (b.groupId !== undefined) data.groupId = b.groupId
  if (b.startDate !== undefined) data.startDate = b.startDate ? new Date(b.startDate) : null
  if (b.dueDate !== undefined) data.dueDate = b.dueDate ? new Date(b.dueDate) : null
  if (b.estimatedHours !== undefined) data.estimatedHours = Number(b.estimatedHours)
  if (b.notes !== undefined) data.notes = b.notes
  const task = await prisma.task.update({ where: { id: params.id }, data, include: { assignee: true, group: true, timeLogs: { include: { member: true } }, predecessors: { include: { predecessor: true } }, successors: { include: { successor: true } } } })
  return NextResponse.json(task)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.task.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

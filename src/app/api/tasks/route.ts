import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: { assignee: true, group: true, timeLogs: { include: { member: true } }, predecessors: { include: { predecessor: true } }, successors: { include: { successor: true } } },
    orderBy: [{ group: { order: 'asc' } }, { order: 'asc' }],
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  const count = await prisma.task.count({ where: { groupId: b.groupId } })
  const task = await prisma.task.create({
    data: { name: b.name, status: b.status ?? 'Not Started', priority: b.priority ?? 'Medium', assigneeId: b.assigneeId ?? null, groupId: b.groupId, startDate: b.startDate ? new Date(b.startDate) : null, dueDate: b.dueDate ? new Date(b.dueDate) : null, estimatedHours: b.estimatedHours ?? 0, notes: b.notes ?? null, order: count },
    include: { assignee: true, group: true, timeLogs: true, predecessors: { include: { predecessor: true } }, successors: { include: { successor: true } } },
  })
  return NextResponse.json(task, { status: 201 })
}

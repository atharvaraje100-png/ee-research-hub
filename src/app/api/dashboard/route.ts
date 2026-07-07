import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [tasks, interviews, deliverables, risks, snapshots] = await Promise.all([
    prisma.task.findMany({ include: { group: true } }),
    prisma.interview.findMany(),
    prisma.deliverable.findMany(),
    prisma.risk.findMany(),
    prisma.progressSnapshot.findMany({ orderBy: { date: 'asc' } }),
  ])

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'Done').length
  const tasksPct = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0

  const TARGET_INTERVIEWS = 25
  const completedInterviews = interviews.filter(i => i.completedDate).length
  const interviewsPct = Math.min((completedInterviews / TARGET_INTERVIEWS) * 100, 100)

  const totalDeliverables = deliverables.length
  const deliverablesPct = totalDeliverables > 0
    ? deliverables.reduce((s, d) => s + d.completionPct, 0) / totalDeliverables
    : 0

  const openRisks = risks.filter(r => r.status === 'Open' && (r.impact === 'Critical' || r.impact === 'High')).length
  const riskPenalty = Math.min(openRisks * 3, 15)

  const actualPct = Math.max(0,
    tasksPct * 0.40 +
    interviewsPct * 0.25 +
    deliverablesPct * 0.25 +
    (100 - riskPenalty) * 0.10 - 10
  )

  // planned % based on calendar position Jun 1 – Oct 31 2026
  const start = new Date('2026-06-01').getTime()
  const end   = new Date('2026-10-31').getTime()
  const now   = Date.now()
  const plannedPct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))

  // Save daily snapshot if none today
  const today = new Date(); today.setHours(0,0,0,0)
  const todaySnap = snapshots.find(s => { const d = new Date(s.date); d.setHours(0,0,0,0); return d.getTime() === today.getTime() })
  if (!todaySnap) {
    await prisma.progressSnapshot.create({ data: { plannedPct, actualPct, tasksPct, interviewsPct, deliverablesPct, riskPenalty } })
    snapshots.push({ id: 'new', date: new Date(), plannedPct, actualPct, tasksPct, interviewsPct, deliverablesPct, riskPenalty })
  }

  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length
  const blocked = tasks.filter(t => t.status === 'Blocked').length

  return NextResponse.json({
    tasksPct, interviewsPct, deliverablesPct, riskPenalty, actualPct, plannedPct,
    totalTasks, doneTasks, overdue, blocked,
    completedInterviews, totalDeliverables,
    openRisks: risks.filter(r => r.status === 'Open').length,
    snapshots,
  })
}

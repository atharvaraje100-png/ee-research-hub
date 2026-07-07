'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData)
  }, [])

  if (!data) return (
    <div style={{ marginLeft: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b' }}>Loading dashboard…</div>
  )

  const metrics = [
    { label: 'Overall Completion', value: `${Math.round(data.actualPct)}%`, sub: 'Weighted score', color: '#3b82f6' },
    { label: 'Tasks Done', value: `${data.doneTasks}/${data.totalTasks}`, sub: `${data.overdue} overdue`, color: data.overdue > 0 ? '#ef4444' : '#10b981' },
    { label: 'Interviews', value: `${data.completedInterviews}/25`, sub: 'Target 25', color: '#f59e0b' },
    { label: 'Blocked Tasks', value: data.blocked, sub: 'Need attention', color: data.blocked > 0 ? '#ef4444' : '#10b981' },
    { label: 'Open Risks', value: data.openRisks, sub: 'High/Critical', color: data.openRisks > 0 ? '#f59e0b' : '#10b981' },
    { label: 'Deliverables', value: `${Math.round(data.deliverablesPct)}%`, sub: `${data.totalDeliverables} total`, color: '#8b5cf6' },
  ]

  const chartData = (data.snapshots ?? []).map((s: any) => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Planned: Math.round(s.plannedPct),
    Actual: Math.round(s.actualPct),
  }))

  const breakdown = [
    { label: 'Tasks (40%)',        value: Math.round(data.tasksPct),        color: '#3b82f6' },
    { label: 'Interviews (25%)',   value: Math.round(data.interviewsPct),   color: '#f59e0b' },
    { label: 'Deliverables (25%)',value: Math.round(data.deliverablesPct), color: '#8b5cf6' },
    { label: 'Risk Penalty (10%)',value: -Math.round(data.riskPenalty),    color: '#ef4444' },
  ]

  return (
    <div style={{ marginLeft: 220, padding: 28, minHeight: '100vh' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Barriers to EE Adoption in Public Housing · ComEd Territory · Jun–Oct 2026</p>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: 'white', borderRadius: 10, padding: '16px 20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 2 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Chart */}
        <div style={{ background: 'white', borderRadius: 10, padding: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Planned vs Actual Progress</h3>
          {chartData.length < 2 ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>More data will appear as the project progresses. Visit daily to build the chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Planned" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Actual" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weighted breakdown */}
        <div style={{ background: 'white', borderRadius: 10, padding: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Completion Breakdown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {breakdown.map(b => (
              <div key={b.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{b.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: b.color }}>{b.value > 0 ? b.value : b.value}%</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(0, b.value)}%`, background: b.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '12px 14px', background: '#f8fafc', borderRadius: 8, borderLeft: `4px solid ${data.actualPct >= data.plannedPct ? '#10b981' : data.plannedPct - data.actualPct > 10 ? '#ef4444' : '#f59e0b'}` }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Forecast</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              {data.actualPct >= data.plannedPct ? '✅ On Track' : data.plannedPct - data.actualPct > 10 ? '🔴 Behind Schedule' : '🟡 At Risk'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{Math.round(data.actualPct)}% actual vs {Math.round(data.plannedPct)}% planned</div>
          </div>
        </div>
      </div>
    </div>
  )
}

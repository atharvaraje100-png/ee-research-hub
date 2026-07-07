'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

const START = new Date('2026-06-01')
const END   = new Date('2026-10-31')
const TOTAL_DAYS = Math.ceil((END.getTime()-START.getTime())/(1000*60*60*24))

const MONTHS = ['Jun','Jul','Aug','Sep','Oct']
const MONTH_STARTS = [0,30,61,92,122]
const MONTH_DAYS   = [30,31,31,30,31]

const STATUS_BG: Record<string,string> = { 'Not Started':'#94a3b8', 'In Progress':'#3b82f6', 'Blocked':'#ef4444', 'In Review':'#f59e0b', 'Done':'#10b981' }

export default function Gantt() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const todayOffset = Math.max(0,Math.min(TOTAL_DAYS, Math.ceil((today.getTime()-START.getTime())/(1000*60*60*24))))

  useEffect(() => { fetch('/api/groups').then(r=>r.json()).then(g=>{ setGroups(Array.isArray(g)?g:[]); setLoading(false) }) }, [])

  const dayPct = (d: string|null) => {
    if (!d) return null
    const diff = Math.ceil((new Date(d).getTime()-START.getTime())/(1000*60*60*24))
    return Math.max(0,Math.min(100,(diff/TOTAL_DAYS)*100))
  }

  if (loading) return <div style={{ marginLeft:220, display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#64748b' }}>Loading…</div>

  return (
    <div style={{ marginLeft:220, padding:24, minHeight:'100vh' }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a', marginBottom:4 }}>Gantt Timeline</h1>
      <p style={{ color:'#64748b', fontSize:13, marginBottom:20 }}>Jun 1 – Oct 31, 2026 · Edit task dates on the Task Board</p>

      <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
        {/* Month headers */}
        <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', borderBottom:'2px solid #e2e8f0' }}>
          <div style={{ padding:'10px 16px', fontWeight:700, fontSize:12, color:'#64748b', borderRight:'1px solid #e2e8f0' }}>Task</div>
          <div style={{ position:'relative', height:36 }}>
            {MONTHS.map((m,i)=>(
              <div key={m} style={{ position:'absolute', top:0, bottom:0, left:`${(MONTH_STARTS[i]/TOTAL_DAYS)*100}%`, width:`${(MONTH_DAYS[i]/TOTAL_DAYS)*100}%`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#64748b', borderRight:'1px solid #f1f5f9' }}>{m}</div>
            ))}
            {/* Today line */}
            <div style={{ position:'absolute', top:0, bottom:0, left:`${(todayOffset/TOTAL_DAYS)*100}%`, width:2, background:'#ef4444', opacity:0.7 }} />
          </div>
        </div>

        {/* Groups & tasks */}
        {groups.map(group => (
          <div key={group.id}>
            <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
              <div style={{ padding:'8px 16px', display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:8,height:8,borderRadius:2,background:group.color,flexShrink:0 }} />
                <span style={{ fontWeight:700, fontSize:12, color:'#374151' }}>{group.name}</span>
              </div>
              <div style={{ position:'relative', height:32 }}>
                <div style={{ position:'absolute', top:0, bottom:0, left:`${(todayOffset/TOTAL_DAYS)*100}%`, width:2, background:'#ef4444', opacity:0.4 }} />
              </div>
            </div>
            {group.tasks?.map((task: any) => {
              const s = dayPct(task.startDate)
              const e = dayPct(task.dueDate)
              const w = s!==null && e!==null ? Math.max(1, e-s) : null
              const loggedH = task.timeLogs?.reduce((a:number,l:any)=>a+l.hours,0) ?? 0
              const hasDeps = task.predecessors?.length>0 || task.successors?.length>0
              return (
                <div key={task.id} style={{ display:'grid', gridTemplateColumns:'240px 1fr', borderBottom:'1px solid #f1f5f9', minHeight:36 }}>
                  <div style={{ padding:'8px 16px 8px 24px', display:'flex', alignItems:'center', gap:4, borderRight:'1px solid #f1f5f9' }}>
                    <span style={{ fontSize:12, color:'#374151', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{task.name}</span>
                    {hasDeps && <span style={{ fontSize:10, color:'#6366f1' }}>🔗</span>}
                    {task.assignee && <div style={{ width:18,height:18,borderRadius:'50%',background:task.assignee.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:'white',flexShrink:0 }}>{task.assignee.name.split(' ').map((x:string)=>x[0]).join('').slice(0,2)}</div>}
                  </div>
                  <div style={{ position:'relative' }}>
                    {s!==null && w!==null && (
                      <div title={`${task.name} · ${task.status}`} style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', left:`${s}%`, width:`${w}%`, minWidth:4, height:16, borderRadius:4, background:STATUS_BG[task.status]??'#94a3b8', opacity: task.status==='Done'?0.6:0.85, display:'flex', alignItems:'center', paddingLeft:4, overflow:'hidden' }}>
                        {task.estimatedHours>0 && <div style={{ height:'100%', background:'rgba(255,255,255,0.3)', width:`${Math.min(100,(loggedH/(task.estimatedHours||1))*100)}%`, borderRadius:4 }} />}
                      </div>
                    )}
                    <div style={{ position:'absolute', top:0, bottom:0, left:`${(todayOffset/TOTAL_DAYS)*100}%`, width:2, background:'#ef4444', opacity:0.3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginTop:16, flexWrap:'wrap' }}>
        {Object.entries(STATUS_BG).map(([s,c])=>(
          <div key={s} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#64748b' }}>
            <div style={{ width:16,height:8,borderRadius:2,background:c }} />
            {s}
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#64748b' }}>
          <div style={{ width:2,height:16,background:'#ef4444' }} /> Today
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#64748b' }}>
          <span style={{ color:'#6366f1' }}>🔗</span> Has dependencies
        </div>
      </div>
    </div>
  )
}

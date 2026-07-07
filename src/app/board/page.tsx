'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import Modal from '@/components/Modal'

const STATUSES = ['Not Started', 'In Progress', 'Blocked', 'In Review', 'Done']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const COLORS = ['#6366f1','#3b82f6','#0891b2','#059669','#d97706','#dc2626','#db2777','#7c3aed']

const STATUS_BG: Record<string,string> = { 'Not Started':'#f1f5f9', 'In Progress':'#dbeafe', 'Blocked':'#fee2e2', 'In Review':'#fef3c7', 'Done':'#d1fae5' }
const STATUS_TX: Record<string,string> = { 'Not Started':'#64748b', 'In Progress':'#1d4ed8', 'Blocked':'#dc2626', 'In Review':'#d97706', 'Done':'#059669' }
const PRIO_TX: Record<string,string> = { 'Low':'#94a3b8', 'Medium':'#3b82f6', 'High':'#f59e0b', 'Critical':'#ef4444' }

interface Member { id: string; name: string; title: string; color: string }
interface TimeLog { id: string; hours: number; description: string | null; date: string; member: Member }
interface Dep { id: string; predecessorId: string; successorId: string; predecessor?: { id: string; name: string }; successor?: { id: string; name: string } }
interface Task { id: string; name: string; status: string; priority: string; assigneeId: string | null; assignee: Member | null; groupId: string; startDate: string | null; dueDate: string | null; estimatedHours: number; notes: string | null; timeLogs: TimeLog[]; predecessors: Dep[]; successors: Dep[] }
interface Group { id: string; name: string; color: string; collapsed: boolean; tasks: Task[] }

function Av({ m, size = 24 }: { m: Member; size?: number }) {
  return <div style={{ width: size, height: size, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: 'white', flexShrink: 0 }}>{m.name.split(' ').map(x => x[0]).join('').slice(0,2)}</div>
}

function DD({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, marginTop: 4 }}>{children}</div>}
    </div>
  )
}

export default function Board() {
  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<Task | null>(null)
  const [newTaskGid, setNewTaskGid] = useState<string|null>(null)
  const [newTaskName, setNewTaskName] = useState('')
  const [editGid, setEditGid] = useState<string|null>(null)
  const [editGname, setEditGname] = useState('')
  const [addGroup, setAddGroup] = useState(false)
  const [newGname, setNewGname] = useState('')
  const [newGcolor, setNewGcolor] = useState('#3b82f6')
  const [filterPerson, setFilterPerson] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [logHours, setLogHours] = useState('')
  const [logDesc, setLogDesc] = useState('')
  const [addDepSuccId, setAddDepSuccId] = useState('')

  const fetch2 = async () => {
    const [g, m] = await Promise.all([fetch('/api/groups').then(r=>r.json()), fetch('/api/members').then(r=>r.json())])
    setGroups(Array.isArray(g)?g:[]); setMembers(Array.isArray(m)?m:[]); setLoading(false)
  }
  useEffect(() => { fetch2() }, [])

  const patchTask = async (id: string, data: any) => {
    const res = await fetch(`/api/tasks/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
    const updated = await res.json()
    setGroups(prev => prev.map(g => ({ ...g, tasks: g.tasks.map(t => t.id===id ? updated : t) })))
    if (detail?.id===id) setDetail(updated)
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${id}`, { method:'DELETE' })
    setGroups(prev => prev.map(g => ({ ...g, tasks: g.tasks.filter(t => t.id!==id) })))
    if (detail?.id===id) setDetail(null)
  }

  const addTask = async (groupId: string) => {
    if (!newTaskName.trim()) { setNewTaskGid(null); return }
    const res = await fetch('/api/tasks', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: newTaskName.trim(), groupId }) })
    const task = await res.json()
    setGroups(prev => prev.map(g => g.id===groupId ? { ...g, tasks: [...g.tasks, task] } : g))
    setNewTaskName(''); setNewTaskGid(null)
  }

  const addGroup2 = async () => {
    if (!newGname.trim()) return
    const res = await fetch('/api/groups', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: newGname.trim(), color: newGcolor }) })
    const g = await res.json()
    setGroups(prev => [...prev, { ...g, tasks: [] }])
    setNewGname(''); setAddGroup(false)
  }

  const patchGroup = async (id: string, data: any) => {
    await fetch(`/api/groups/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
    setGroups(prev => prev.map(g => g.id===id ? { ...g, ...data } : g))
  }

  const deleteGroup = async (id: string) => {
    if (!confirm('Delete group and all tasks?')) return
    await fetch(`/api/groups/${id}`, { method:'DELETE' })
    setGroups(prev => prev.filter(g => g.id!==id))
  }

  const logTime = async () => {
    if (!detail || !logHours) return
    const meId = members[0]?.id
    if (!meId) return
    await fetch('/api/timelogs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ taskId: detail.id, memberId: meId, hours: Number(logHours), description: logDesc || null }) })
    setLogHours(''); setLogDesc('')
    const updated = await fetch(`/api/tasks/${detail.id}`).then(r=>r.json())
    setGroups(prev => prev.map(g => ({ ...g, tasks: g.tasks.map(t => t.id===detail.id ? updated : t) })))
    setDetail(updated)
  }

  const deleteLog = async (logId: string) => {
    await fetch(`/api/timelogs/${logId}`, { method:'DELETE' })
    const updated = await fetch(`/api/tasks/${detail!.id}`).then(r=>r.json())
    setGroups(prev => prev.map(g => ({ ...g, tasks: g.tasks.map(t => t.id===detail!.id ? updated : t) })))
    setDetail(updated)
  }

  const addDep = async () => {
    if (!detail || !addDepSuccId) return
    await fetch('/api/dependencies', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ predecessorId: detail.id, successorId: addDepSuccId }) })
    setAddDepSuccId('')
    const updated = await fetch(`/api/tasks/${detail.id}`).then(r=>r.json())
    setGroups(prev => prev.map(g => ({ ...g, tasks: g.tasks.map(t => t.id===detail.id ? updated : t) })))
    setDetail(updated)
  }

  const removeDep = async (predId: string, succId: string) => {
    await fetch('/api/dependencies', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ predecessorId: predId, successorId: succId }) })
    const updated = await fetch(`/api/tasks/${detail!.id}`).then(r=>r.json())
    setGroups(prev => prev.map(g => ({ ...g, tasks: g.tasks.map(t => t.id===detail!.id ? updated : t) })))
    setDetail(updated)
  }

  const allTasks = groups.flatMap(g => g.tasks)
  const filteredGroups = groups.map(g => ({ ...g, tasks: g.tasks.filter(t => (!filterPerson || t.assigneeId===filterPerson) && (!filterStatus || t.status===filterStatus)) }))
  const totalDone = groups.reduce((s,g) => s + g.tasks.filter(t=>t.status==='Done').length, 0)
  const total = groups.reduce((s,g) => s + g.tasks.length, 0)

  if (loading) return <div style={{ marginLeft: 220, display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#64748b' }}>Loading…</div>

  return (
    <div style={{ marginLeft: 220, padding: 24, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Task Board</h1>
          <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>{totalDone}/{total} tasks done</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select value={filterPerson} onChange={e=>setFilterPerson(e.target.value)} style={{ fontSize:12, padding:'6px 10px', border:'1px solid #e2e8f0', borderRadius:6, background:'white' }}>
            <option value="">All people</option>
            {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ fontSize:12, padding:'6px 10px', border:'1px solid #e2e8f0', borderRadius:6, background:'white' }}>
            <option value="">All statuses</option>
            {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display:'grid', gridTemplateColumns:'32px 3fr 1.5fr 1fr 1fr 1fr 28px', gap:0, padding:'0 0 6px 0', borderBottom:'2px solid #e2e8f0', marginBottom:8 }}>
        {['','Task','Assignee','Status','Priority','Due Date',''].map((h,i)=>(
          <div key={i} style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', padding:'0 8px' }}>{h}</div>
        ))}
      </div>

      {/* Groups */}
      {filteredGroups.map(group => (
        <div key={group.id} style={{ marginBottom:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 0 4px' }}>
            <button onClick={()=>patchGroup(group.id, {collapsed:!group.collapsed})} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, color:'#64748b', width:24, flexShrink:0 }}>{group.collapsed?'▶':'▼'}</button>
            <div style={{ width:10, height:10, borderRadius:2, background:group.color, flexShrink:0 }} />
            {editGid===group.id ? (
              <input autoFocus value={editGname} onChange={e=>setEditGname(e.target.value)}
                onBlur={()=>{patchGroup(group.id,{name:editGname});setEditGid(null)}}
                onKeyDown={e=>{if(e.key==='Enter'){patchGroup(group.id,{name:editGname});setEditGid(null)}if(e.key==='Escape')setEditGid(null)}}
                style={{ fontWeight:700, fontSize:13, border:'1px solid #3b82f6', borderRadius:4, padding:'2px 6px', outline:'none' }} />
            ) : (
              <span onDoubleClick={()=>{setEditGid(group.id);setEditGname(group.name)}} style={{ fontWeight:700, fontSize:13, color:'#1e293b', cursor:'pointer' }}>{group.name}</span>
            )}
            <span style={{ fontSize:11, color:'#94a3b8', marginLeft:4 }}>{group.tasks.length}</span>
            <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
              <button onClick={()=>{setEditGid(group.id);setEditGname(group.name)}} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#94a3b8', padding:'2px 4px', borderRadius:4 }}>✏️</button>
              <button onClick={()=>deleteGroup(group.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#94a3b8', padding:'2px 4px', borderRadius:4 }}>🗑️</button>
            </div>
          </div>

          {!group.collapsed && (
            <div style={{ background:'white', border:'1px solid #e2e8f0', borderLeft:`3px solid ${group.color}`, borderRadius:'0 8px 8px 8px', overflow:'hidden' }}>
              {group.tasks.map((task, idx) => {
                const loggedH = task.timeLogs?.reduce((s,l)=>s+l.hours,0) ?? 0
                const isOverdue = task.dueDate && new Date(task.dueDate)<new Date() && task.status!=='Done'
                return (
                  <div key={task.id} style={{ display:'grid', gridTemplateColumns:'32px 3fr 1.5fr 1fr 1fr 1fr 28px', alignItems:'center', borderBottom: idx<group.tasks.length-1?'1px solid #f8fafc':'none', transition:'background 0.1s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#fafafa'}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
                    <div style={{ padding:'10px 0 10px 10px', color:'#d1d5db', fontSize:11 }}>⊙</div>
                    <div style={{ padding:'10px 8px', cursor:'pointer' }} onClick={()=>setDetail(task)}>
                      <div style={{ fontSize:13, color:'#1e293b', fontWeight:500 }}>{task.name}</div>
                      {task.estimatedHours > 0 && <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>{loggedH}h / {task.estimatedHours}h logged</div>}
                      {(task.predecessors?.length>0||task.successors?.length>0) && <div style={{ fontSize:10, color:'#6366f1', marginTop:1 }}>🔗 {task.predecessors?.length} before · {task.successors?.length} after</div>}
                    </div>
                    <div style={{ padding:'10px 8px' }}>
                      <DD trigger={
                        <div style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                          {task.assignee ? <><Av m={task.assignee} size={22}/><span style={{ fontSize:12, color:'#374151' }}>{task.assignee.name.split(' ')[0]}</span></> : <span style={{ fontSize:12, color:'#d1d5db' }}>— Assign</span>}
                        </div>
                      }>
                        <div style={{ padding:4 }}>
                          <div onClick={()=>patchTask(task.id,{assigneeId:null})} style={{ padding:'6px 10px', fontSize:12, cursor:'pointer', color:'#94a3b8', borderRadius:4 }}>Unassign</div>
                          {members.map(m=>(
                            <div key={m.id} onClick={()=>patchTask(task.id,{assigneeId:m.id})} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', cursor:'pointer', borderRadius:4, background:task.assigneeId===m.id?'#eff6ff':'transparent' }}>
                              <Av m={m} size={20}/><div><div style={{ fontSize:12, fontWeight:500 }}>{m.name}</div><div style={{ fontSize:10, color:'#94a3b8' }}>{m.title}</div></div>
                            </div>
                          ))}
                        </div>
                      </DD>
                    </div>
                    <div style={{ padding:'10px 8px' }}>
                      <DD trigger={<span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, cursor:'pointer', background:STATUS_BG[task.status], color:STATUS_TX[task.status] }}>{task.status}</span>}>
                        <div style={{ padding:4 }}>{STATUSES.map(s=><div key={s} onClick={()=>patchTask(task.id,{status:s})} style={{ padding:'6px 10px', cursor:'pointer', borderRadius:4 }}><span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:STATUS_BG[s], color:STATUS_TX[s] }}>{s}</span></div>)}</div>
                      </DD>
                    </div>
                    <div style={{ padding:'10px 8px' }}>
                      <DD trigger={<span style={{ fontSize:11, fontWeight:600, color:PRIO_TX[task.priority], cursor:'pointer' }}>▲ {task.priority}</span>}>
                        <div style={{ padding:4 }}>{PRIORITIES.map(p=><div key={p} onClick={()=>patchTask(task.id,{priority:p})} style={{ padding:'6px 10px', fontSize:12, cursor:'pointer', borderRadius:4, color:PRIO_TX[p], fontWeight:600 }}>▲ {p}</div>)}</div>
                      </DD>
                    </div>
                    <div style={{ padding:'10px 8px' }}>
                      <input type="date" value={task.dueDate?task.dueDate.slice(0,10):''} onChange={e=>patchTask(task.id,{dueDate:e.target.value})}
                        style={{ fontSize:11, border:'none', background:'transparent', cursor:'pointer', color:isOverdue?'#ef4444':'#64748b', outline:'none', width:'100%' }} />
                    </div>
                    <div style={{ padding:'10px 8px 10px 0' }}>
                      <button onClick={()=>deleteTask(task.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#e2e8f0', fontSize:14, padding:2, borderRadius:4 }}>×</button>
                    </div>
                  </div>
                )
              })}
              {newTaskGid===group.id ? (
                <div style={{ display:'flex', gap:8, padding:'10px 12px', alignItems:'center' }}>
                  <input autoFocus value={newTaskName} onChange={e=>setNewTaskName(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter')addTask(group.id);if(e.key==='Escape'){setNewTaskGid(null);setNewTaskName('')}}}
                    onBlur={()=>{if(newTaskName.trim())addTask(group.id);else{setNewTaskGid(null);setNewTaskName('')}}}
                    placeholder="Task name…" style={{ flex:1, border:'1px solid #3b82f6', borderRadius:6, padding:'6px 10px', fontSize:13, outline:'none' }} />
                  <button onClick={()=>addTask(group.id)} style={{ padding:'6px 14px', background:'#3b82f6', color:'white', border:'none', borderRadius:6, fontSize:12, cursor:'pointer' }}>Add</button>
                  <button onClick={()=>{setNewTaskGid(null);setNewTaskName('')}} style={{ padding:'6px 10px', background:'none', border:'1px solid #e2e8f0', borderRadius:6, fontSize:12, cursor:'pointer' }}>Cancel</button>
                </div>
              ) : (
                <button onClick={()=>setNewTaskGid(group.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 12px', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:12, width:'100%' }}>
                  + Add task
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {addGroup ? (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 0' }}>
          <div style={{ display:'flex', gap:4 }}>{COLORS.map(c=><div key={c} onClick={()=>setNewGcolor(c)} style={{ width:16,height:16,borderRadius:3,background:c,cursor:'pointer',outline:newGcolor===c?'2px solid #111':'none',outlineOffset:1 }} />)}</div>
          <input autoFocus value={newGname} onChange={e=>setNewGname(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addGroup2();if(e.key==='Escape')setAddGroup(false)}} placeholder="Group name…" style={{ border:'1px solid #3b82f6', borderRadius:6, padding:'7px 12px', fontSize:13, outline:'none', width:200 }} />
          <button onClick={addGroup2} style={{ padding:'7px 16px', background:'#3b82f6', color:'white', border:'none', borderRadius:6, fontSize:13, cursor:'pointer' }}>Add group</button>
          <button onClick={()=>setAddGroup(false)} style={{ padding:'7px 12px', background:'none', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, cursor:'pointer' }}>Cancel</button>
        </div>
      ) : (
        <button onClick={()=>setAddGroup(true)} style={{ display:'flex', alignItems:'center', gap:6, marginTop:12, padding:'10px 14px', background:'white', border:'1px dashed #d1d5db', borderRadius:8, cursor:'pointer', color:'#64748b', fontSize:13 }}>
          + Add group
        </button>
      )}

      {/* Task detail panel */}
      {detail && (
        <div style={{ position:'fixed', top:0, right:0, width:420, height:'100vh', background:'white', borderLeft:'1px solid #e2e8f0', boxShadow:'-4px 0 24px rgba(0,0,0,0.08)', zIndex:200, display:'flex', flexDirection:'column', overflowY:'auto' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#374151' }}>Task Details</span>
            <button onClick={()=>setDetail(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#94a3b8' }}>×</button>
          </div>
          <div style={{ padding:20, flex:1 }}>
            <textarea defaultValue={detail.name} onBlur={e=>patchTask(detail.id,{name:e.target.value})}
              style={{ width:'100%', fontSize:17, fontWeight:700, border:'none', outline:'none', resize:'none', color:'#0f172a', fontFamily:'inherit', lineHeight:1.4, marginBottom:16, boxSizing:'border-box' }} rows={2} />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              {[
                { label:'Status', el: <select value={detail.status} onChange={e=>patchTask(detail.id,{status:e.target.value})} style={{ width:'100%', padding:'7px 8px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:12 }}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select> },
                { label:'Priority', el: <select value={detail.priority} onChange={e=>patchTask(detail.id,{priority:e.target.value})} style={{ width:'100%', padding:'7px 8px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:12 }}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select> },
                { label:'Assignee', el: <select value={detail.assigneeId??''} onChange={e=>patchTask(detail.id,{assigneeId:e.target.value||null})} style={{ width:'100%', padding:'7px 8px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:12 }}><option value=''>Unassigned</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select> },
                { label:'Start Date', el: <input type="date" value={detail.startDate?detail.startDate.slice(0,10):''} onChange={e=>patchTask(detail.id,{startDate:e.target.value})} style={{ width:'100%', padding:'7px 8px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:12, boxSizing:'border-box' }} /> },
                { label:'Due Date', el: <input type="date" value={detail.dueDate?detail.dueDate.slice(0,10):''} onChange={e=>patchTask(detail.id,{dueDate:e.target.value})} style={{ width:'100%', padding:'7px 8px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:12, boxSizing:'border-box' }} /> },
                { label:'Est. Hours', el: <input type="number" min={0} value={detail.estimatedHours} onChange={e=>patchTask(detail.id,{estimatedHours:Number(e.target.value)})} style={{ width:'100%', padding:'7px 8px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:12, boxSizing:'border-box' }} /> },
              ].map(f=>(
                <div key={f.label}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:5 }}>{f.label}</div>
                  {f.el}
                </div>
              ))}
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:5 }}>Notes</div>
              <textarea defaultValue={detail.notes??''} onBlur={e=>patchTask(detail.id,{notes:e.target.value})} placeholder="Add notes…" rows={4}
                style={{ width:'100%', padding:'8px 10px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:13, resize:'vertical', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
            </div>

            {/* Dependencies */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8 }}>Dependencies</div>
              {detail.predecessors?.length > 0 && <div style={{ marginBottom:6 }}>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>Blocked by:</div>
                {detail.predecessors.map(d=>(
                  <div key={d.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 8px', background:'#fef3c7', borderRadius:6, marginBottom:3, fontSize:12 }}>
                    <span style={{ flex:1 }}>{d.predecessor?.name}</span>
                    <button onClick={()=>removeDep(d.predecessorId, d.successorId)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:14, lineHeight:1 }}>×</button>
                  </div>
                ))}
              </div>}
              {detail.successors?.length > 0 && <div style={{ marginBottom:6 }}>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>Blocks:</div>
                {detail.successors.map(d=>(
                  <div key={d.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 8px', background:'#dbeafe', borderRadius:6, marginBottom:3, fontSize:12 }}>
                    <span style={{ flex:1 }}>{d.successor?.name}</span>
                    <button onClick={()=>removeDep(d.predecessorId, d.successorId)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:14, lineHeight:1 }}>×</button>
                  </div>
                ))}
              </div>}
              <div style={{ display:'flex', gap:6, marginTop:6 }}>
                <select value={addDepSuccId} onChange={e=>setAddDepSuccId(e.target.value)} style={{ flex:1, padding:'6px 8px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:12 }}>
                  <option value="">This task must complete before…</option>
                  {allTasks.filter(t=>t.id!==detail.id).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button onClick={addDep} style={{ padding:'6px 12px', background:'#6366f1', color:'white', border:'none', borderRadius:6, fontSize:12, cursor:'pointer' }}>Add</button>
              </div>
            </div>

            {/* Time tracking */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8 }}>Time Tracking</div>
              <div style={{ fontSize:12, color:'#374151', marginBottom:8 }}>
                Logged: <strong>{detail.timeLogs?.reduce((s,l)=>s+l.hours,0).toFixed(1)}h</strong> / Est: <strong>{detail.estimatedHours}h</strong>
              </div>
              {detail.timeLogs?.map(l=>(
                <div key={l.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 8px', background:'#f8fafc', borderRadius:6, marginBottom:4, fontSize:12 }}>
                  <Av m={l.member} size={18}/>
                  <span style={{ fontWeight:600 }}>{l.hours}h</span>
                  <span style={{ color:'#64748b', flex:1 }}>{l.description || '—'}</span>
                  <button onClick={()=>deleteLog(l.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:14 }}>×</button>
                </div>
              ))}
              <div style={{ display:'flex', gap:6, marginTop:8 }}>
                <input type="number" value={logHours} onChange={e=>setLogHours(e.target.value)} placeholder="Hours" min={0.5} step={0.5} style={{ width:70, padding:'6px 8px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:12 }} />
                <input value={logDesc} onChange={e=>setLogDesc(e.target.value)} placeholder="Description (optional)" style={{ flex:1, padding:'6px 8px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:12 }} />
                <button onClick={logTime} style={{ padding:'6px 12px', background:'#059669', color:'white', border:'none', borderRadius:6, fontSize:12, cursor:'pointer' }}>Log</button>
              </div>
            </div>

            <button onClick={()=>deleteTask(detail.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', border:'1px solid #fee2e2', borderRadius:6, background:'#fef2f2', color:'#dc2626', cursor:'pointer', fontSize:12 }}>
              🗑️ Delete task
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

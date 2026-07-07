'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Modal from '@/components/Modal'

const TARGET = 25

export default function Interviews() {
  const [items, setItems] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [stakeholders, setStakeholders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [expanded, setExpanded] = useState<string|null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ stakeholderId:'', interviewerId:'', scheduledDate:'', completedDate:'', durationMinutes:'', keyThemes:'', barriersFound:'', notes:'', followUpNeeded:false })

  const load = async () => {
    const [iv, m, s] = await Promise.all([fetch('/api/interviews').then(r=>r.json()), fetch('/api/members').then(r=>r.json()), fetch('/api/stakeholders').then(r=>r.json())])
    setItems(Array.isArray(iv)?iv:[]); setMembers(Array.isArray(m)?m:[]); setStakeholders(Array.isArray(s)?s:[]); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const open = (item?: any) => {
    setEditing(item||null)
    setForm(item ? { stakeholderId:item.stakeholderId, interviewerId:item.interviewerId, scheduledDate:item.scheduledDate?item.scheduledDate.slice(0,10):'', completedDate:item.completedDate?item.completedDate.slice(0,10):'', durationMinutes:item.durationMinutes||'', keyThemes:(item.keyThemes||[]).join(', '), barriersFound:(item.barriersFound||[]).join(', '), notes:item.notes||'', followUpNeeded:!!item.followUpNeeded } : { stakeholderId:'', interviewerId:'', scheduledDate:'', completedDate:'', durationMinutes:'', keyThemes:'', barriersFound:'', notes:'', followUpNeeded:false })
    setModal(true)
  }
  const save = async () => {
    setSaving(true)
    const body = { ...form, keyThemes: form.keyThemes.split(',').map((s:string)=>s.trim()).filter(Boolean), barriersFound: form.barriersFound.split(',').map((s:string)=>s.trim()).filter(Boolean), durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null }
    const url = editing ? `/api/interviews/${editing.id}` : '/api/interviews'
    await fetch(url, { method:editing?'PATCH':'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    setSaving(false); setModal(false); load()
  }
  const del = async (id: string) => { if(!confirm('Delete?'))return; await fetch(`/api/interviews/${id}`,{method:'DELETE'}); load() }
  const f = (k: string) => (e: any) => setForm((p:any)=>({...p,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value}))

  const done = items.filter(i=>i.completedDate).length
  const pct = Math.min(100, Math.round((done/TARGET)*100))

  return (
    <div style={{ marginLeft:220, padding:24, minHeight:'100vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a' }}>Interview Tracker</h1>
          <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>{done} completed · {items.length-done} scheduled · target {TARGET}</p>
        </div>
        <button onClick={()=>open()} style={{ padding:'9px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>+ Log Interview</button>
      </div>

      <div style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', padding:'16px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Progress to target ({done}/{TARGET})</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#3b82f6' }}>{pct}%</span>
        </div>
        <div style={{ height:10, background:'#f1f5f9', borderRadius:5, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'#3b82f6', borderRadius:5, transition:'width 0.4s' }} />
        </div>
      </div>

      {loading ? <p style={{ color:'#94a3b8', textAlign:'center', padding:40 }}>Loading…</p> : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {items.map(item => {
            const isDone = !!item.completedDate
            const isOpen = expanded===item.id
            return (
              <div key={item.id} style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:isDone?'#d1fae5':'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{isDone?'✅':'🎤'}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{item.stakeholder?.organization ?? 'Unknown'}</div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>By {item.interviewer?.name ?? '—'} · {isDone ? `Completed ${item.completedDate?.slice(0,10)}` : item.scheduledDate ? `Scheduled ${item.scheduledDate?.slice(0,10)}` : 'Not scheduled'}</div>
                  </div>
                  {item.followUpNeeded && <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:'#fef3c7', color:'#d97706' }}>Follow-up</span>}
                  <div style={{ display:'flex', gap:4 }}>
                    <button onClick={()=>open(item)} style={{ padding:'5px 10px', border:'1px solid #e2e8f0', borderRadius:6, background:'white', cursor:'pointer', fontSize:12 }}>✏️</button>
                    <button onClick={()=>del(item.id)} style={{ padding:'5px 10px', border:'1px solid #fee2e2', borderRadius:6, background:'#fef2f2', cursor:'pointer', fontSize:12 }}>🗑️</button>
                    <button onClick={()=>setExpanded(isOpen?null:item.id)} style={{ padding:'5px 10px', border:'1px solid #e2e8f0', borderRadius:6, background:'white', cursor:'pointer', fontSize:12 }}>{isOpen?'▲':'▼'}</button>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop:'1px solid #f1f5f9', padding:'12px 16px', background:'#f8fafc', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {item.keyThemes?.length>0 && <div><div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:6 }}>KEY THEMES</div><div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>{item.keyThemes.map((t:string,i:number)=><span key={i} style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#dbeafe', color:'#1d4ed8' }}>{t}</span>)}</div></div>}
                    {item.barriersFound?.length>0 && <div><div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:6 }}>BARRIERS FOUND</div><div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>{item.barriersFound.map((b:string,i:number)=><span key={i} style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#fee2e2', color:'#dc2626' }}>{b}</span>)}</div></div>}
                    {item.notes && <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:4 }}>NOTES</div><p style={{ fontSize:13, color:'#374151' }}>{item.notes}</p></div>}
                    {item.durationMinutes && <div style={{ fontSize:12, color:'#64748b' }}>Duration: {item.durationMinutes} min</div>}
                  </div>
                )}
              </div>
            )
          })}
          {items.length===0 && <p style={{ textAlign:'center', padding:40, color:'#94a3b8', fontSize:13 }}>No interviews logged yet.</p>}
        </div>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Interview':'Log Interview'} width={540}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[
            { label:'Stakeholder', key:'stakeholderId', type:'select', opts:stakeholders, optLabel:(s:any)=>s.organization, optVal:(s:any)=>s.id },
            { label:'Interviewer', key:'interviewerId', type:'select', opts:members, optLabel:(m:any)=>m.name, optVal:(m:any)=>m.id },
          ].map((fi:any) => (
            <div key={fi.key}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>{fi.label}</div>
              <select value={(form as any)[fi.key]} onChange={f(fi.key)} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}>
                <option value="">Select…</option>
                {fi.opts.map((o:any)=><option key={fi.optVal(o)} value={fi.optVal(o)}>{fi.optLabel(o)}</option>)}
              </select>
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Scheduled Date</div><input type="date" value={form.scheduledDate} onChange={f('scheduledDate')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Completed Date</div><input type="date" value={form.completedDate} onChange={f('completedDate')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Duration (min)</div><input type="number" value={form.durationMinutes} onChange={f('durationMinutes')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
          </div>
          {[
            { label:'Key themes (comma-separated)', key:'keyThemes', ph:'e.g. split incentives, funding gaps' },
            { label:'Barriers found (comma-separated)', key:'barriersFound', ph:'e.g. aging infrastructure, procurement' },
            { label:'Notes', key:'notes', ph:'Additional notes…' },
          ].map(fi=>(
            <div key={fi.key}><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>{fi.label}</div><textarea value={(form as any)[fi.key]} onChange={f(fi.key)} placeholder={fi.ph} rows={fi.key==='notes'?3:2} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, resize:'vertical', boxSizing:'border-box' }} /></div>
          ))}
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
            <input type="checkbox" checked={form.followUpNeeded} onChange={f('followUpNeeded')} /> Follow-up needed
          </label>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <button onClick={()=>setModal(false)} style={{ padding:'8px 16px', border:'1px solid #e2e8f0', borderRadius:6, background:'white', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding:'8px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', fontWeight:600 }}>{saving?'Saving…':editing?'Save':'Log'}</button>
        </div>
      </Modal>
    </div>
  )
}

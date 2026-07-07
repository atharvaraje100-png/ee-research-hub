'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Modal from '@/components/Modal'

const TYPES = ['Planning','Research','Analysis','Report','Presentation','Other']
const STATUSES = ['Not Started','In Progress','In Review','Revision Needed','Approved','Complete']
const STATUS_COLOR: Record<string,string> = { 'Not Started':'#94a3b8','In Progress':'#3b82f6','In Review':'#f59e0b','Revision Needed':'#ef4444','Approved':'#8b5cf6','Complete':'#10b981' }

export default function Deliverables() {
  const [items, setItems] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', type:'Report', status:'Not Started', completionPct:0, ownerId:'', reviewerId:'', dueDate:'', reviewerComments:'' })

  const load = async () => {
    const [d, m] = await Promise.all([fetch('/api/deliverables').then(r=>r.json()), fetch('/api/members').then(r=>r.json())])
    setItems(Array.isArray(d)?d:[]); setMembers(Array.isArray(m)?m:[])
  }
  useEffect(() => { load() }, [])

  const open = (item?: any) => {
    setEditing(item||null)
    setForm(item ? { name:item.name, type:item.type, status:item.status, completionPct:item.completionPct, ownerId:item.ownerId||'', reviewerId:item.reviewerId||'', dueDate:item.dueDate?item.dueDate.slice(0,10):'', reviewerComments:item.reviewerComments||'' } : { name:'', type:'Report', status:'Not Started', completionPct:0, ownerId:'', reviewerId:'', dueDate:'', reviewerComments:'' })
    setModal(true)
  }
  const save = async () => {
    if(!form.name.trim())return; setSaving(true)
    const body: any = { ...form, completionPct: Number(form.completionPct) }
    if(!body.ownerId) delete body.ownerId; if(!body.reviewerId) delete body.reviewerId; if(!body.dueDate) delete body.dueDate
    const url = editing ? `/api/deliverables/${editing.id}` : '/api/deliverables'
    await fetch(url, { method:editing?'PATCH':'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    setSaving(false); setModal(false); load()
  }
  const del = async (id:string) => { if(!confirm('Delete?'))return; await fetch(`/api/deliverables/${id}`,{method:'DELETE'}); load() }
  const f = (k:string) => (e:any) => setForm((p:any)=>({...p,[k]:e.target.value}))

  const overall = items.length > 0 ? Math.round(items.reduce((s,d)=>s+d.completionPct,0)/items.length) : 0

  return (
    <div style={{ marginLeft:220, padding:24, minHeight:'100vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a' }}>Deliverables</h1>
          <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>{items.filter(d=>d.status==='Complete').length}/{items.length} complete</p>
        </div>
        <button onClick={()=>open()} style={{ padding:'9px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>+ Add Deliverable</button>
      </div>

      <div style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', padding:'16px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Overall completion</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#3b82f6' }}>{overall}%</span>
        </div>
        <div style={{ height:10, background:'#f1f5f9', borderRadius:5, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${overall}%`, background:'#3b82f6', borderRadius:5, transition:'width 0.4s' }} />
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {items.map(item => {
          const isOverdue = item.dueDate && new Date(item.dueDate)<new Date() && item.status!=='Complete'
          return (
            <div key={item.id} style={{ background:'white', borderRadius:10, border:`1px solid ${isOverdue?'#fee2e2':'#e2e8f0'}`, padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:8, background:(STATUS_COLOR[item.status]||'#94a3b8')+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:18 }}>{item.status==='Complete'?'✅':item.status==='In Review'?'👁':item.status==='Revision Needed'?'🔄':'📄'}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>{item.name}</span>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:(STATUS_COLOR[item.status]||'#94a3b8')+'22', color:STATUS_COLOR[item.status]||'#94a3b8' }}>{item.status}</span>
                    <span style={{ fontSize:11, color:'#94a3b8' }}>{item.type}</span>
                  </div>
                  <div style={{ height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden', marginBottom:6, maxWidth:300 }}>
                    <div style={{ height:'100%', width:`${item.completionPct}%`, background:STATUS_COLOR[item.status]||'#94a3b8', borderRadius:3 }} />
                  </div>
                  <div style={{ display:'flex', gap:16, fontSize:11, color:'#94a3b8', flexWrap:'wrap' }}>
                    {item.owner && <span>Owner: <strong style={{ color:'#374151' }}>{item.owner.name}</strong></span>}
                    {item.reviewer && <span>Reviewer: <strong style={{ color:'#374151' }}>{item.reviewer.name}</strong></span>}
                    {item.dueDate && <span style={{ color:isOverdue?'#ef4444':'#94a3b8' }}>Due: <strong>{item.dueDate.slice(0,10)}</strong>{isOverdue?' ⚠️':''}</span>}
                    <span>{item.completionPct}% complete</span>
                  </div>
                  {item.reviewerComments && <p style={{ fontSize:12, color:'#f59e0b', marginTop:6, fontStyle:'italic' }}>💬 "{item.reviewerComments}"</p>}
                </div>
                <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                  <button onClick={()=>open(item)} style={{ padding:'6px 10px', border:'1px solid #e2e8f0', borderRadius:6, background:'white', cursor:'pointer', fontSize:12 }}>✏️</button>
                  <button onClick={()=>del(item.id)} style={{ padding:'6px 10px', border:'1px solid #fee2e2', borderRadius:6, background:'#fef2f2', cursor:'pointer', fontSize:12 }}>🗑️</button>
                </div>
              </div>
            </div>
          )
        })}
        {items.length===0 && <p style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No deliverables yet.</p>}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Deliverable':'New Deliverable'} width={520}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Name *</div><input value={form.name} onChange={f('name')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Type</div><select value={form.type} onChange={f('type')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Status</div><select value={form.status} onChange={f('status')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Completion %</div><input type="number" min={0} max={100} value={form.completionPct} onChange={f('completionPct')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Due Date</div><input type="date" value={form.dueDate} onChange={f('dueDate')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Owner</div><select value={form.ownerId} onChange={f('ownerId')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}><option value=''>None</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Reviewer</div><select value={form.reviewerId} onChange={f('reviewerId')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}><option value=''>None</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          </div>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Reviewer comments</div><textarea value={form.reviewerComments} onChange={f('reviewerComments')} rows={2} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, resize:'vertical', boxSizing:'border-box' }} /></div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <button onClick={()=>setModal(false)} style={{ padding:'8px 16px', border:'1px solid #e2e8f0', borderRadius:6, background:'white', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button onClick={save} disabled={saving||!form.name.trim()} style={{ padding:'8px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', fontWeight:600 }}>{saving?'Saving…':editing?'Save':'Create'}</button>
        </div>
      </Modal>
    </div>
  )
}

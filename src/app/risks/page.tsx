'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Modal from '@/components/Modal'

const PROBS = ['Low','Medium','High']
const IMPACTS = ['Low','Medium','High','Critical']
const STATUSES = ['Open','Monitoring','Mitigated','Closed']
const HEAT: Record<string,string> = { Low:'#10b981', Medium:'#f59e0b', High:'#ef4444', Critical:'#7f1d1d' }

export default function Risks() {
  const [items, setItems] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', description:'', probability:'Medium', impact:'Medium', status:'Open', mitigationPlan:'', ownerId:'' })

  const load = async () => {
    const [r, m] = await Promise.all([fetch('/api/risks').then(r=>r.json()), fetch('/api/members').then(r=>r.json())])
    setItems(Array.isArray(r)?r:[]); setMembers(Array.isArray(m)?m:[])
  }
  useEffect(() => { load() }, [])

  const open = (item?: any) => {
    setEditing(item||null)
    setForm(item ? { name:item.name, description:item.description||'', probability:item.probability, impact:item.impact, status:item.status, mitigationPlan:item.mitigationPlan||'', ownerId:item.ownerId||'' } : { name:'', description:'', probability:'Medium', impact:'Medium', status:'Open', mitigationPlan:'', ownerId:'' })
    setModal(true)
  }
  const save = async () => {
    if(!form.name.trim())return; setSaving(true)
    const body: any = { ...form }; if(!body.ownerId) delete body.ownerId
    const url = editing ? `/api/risks/${editing.id}` : '/api/risks'
    await fetch(url, { method:editing?'PATCH':'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    setSaving(false); setModal(false); load()
  }
  const del = async (id:string) => { if(!confirm('Delete?'))return; await fetch(`/api/risks/${id}`,{method:'DELETE'}); load() }
  const f = (k:string) => (e:any) => setForm((p:any)=>({...p,[k]:e.target.value}))

  const open2 = items.filter(r=>r.status==='Open')
  const heatScore = (r:any) => { const pm: Record<string,number>={Low:1,Medium:2,High:3,Critical:4}; return (pm[r.probability]||1)*(pm[r.impact]||1) }

  return (
    <div style={{ marginLeft:220, padding:24, minHeight:'100vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a' }}>Risk Register</h1>
          <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>{items.length} risks · {open2.length} open</p>
        </div>
        <button onClick={()=>open()} style={{ padding:'9px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>+ Add Risk</button>
      </div>

      {open2.filter(r=>r.impact==='Critical'||r.impact==='High').length>0 && (
        <div style={{ display:'flex', gap:10, alignItems:'center', padding:'12px 16px', background:'#fef2f2', border:'1px solid #fee2e2', borderRadius:8, marginBottom:16, fontSize:13, color:'#dc2626' }}>
          ⚠️ <strong>{open2.filter(r=>r.impact==='Critical'||r.impact==='High').length} high-impact risks</strong> are currently open — review mitigation plans.
        </div>
      )}

      <div style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['Risk','Probability','Impact','Score','Status','Owner','Mitigation',''].map(h=><th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid #e2e8f0', whiteSpace:'nowrap' }}>{h}</th>)}
          </tr></thead>
          <tbody>{[...items].sort((a,b)=>heatScore(b)-heatScore(a)).map(item=>(
            <tr key={item.id} style={{ borderBottom:'1px solid #f8fafc' }}
              onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#fafafa'}
              onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background='transparent'}>
              <td style={{ padding:'10px 14px' }}><div style={{ fontWeight:600, color:'#1e293b', fontSize:13 }}>{item.name}</div>{item.description&&<div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{item.description}</div>}</td>
              <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:(HEAT[item.probability]||'#94a3b8')+'22', color:HEAT[item.probability]||'#94a3b8' }}>{item.probability}</span></td>
              <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:(HEAT[item.impact]||'#94a3b8')+'22', color:HEAT[item.impact]||'#94a3b8' }}>{item.impact}</span></td>
              <td style={{ padding:'10px 14px', fontWeight:700, fontSize:14, color:heatScore(item)>=9?'#dc2626':heatScore(item)>=4?'#f59e0b':'#10b981' }}>{heatScore(item)}</td>
              <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{item.status}</td>
              <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{item.owner?.name||'—'}</td>
              <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b', maxWidth:200 }}><div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.mitigationPlan||'—'}</div></td>
              <td style={{ padding:'10px 14px' }}><div style={{ display:'flex', gap:4 }}>
                <button onClick={()=>open(item)} style={{ padding:'4px 8px', border:'1px solid #e2e8f0', borderRadius:4, background:'white', cursor:'pointer', fontSize:12 }}>✏️</button>
                <button onClick={()=>del(item.id)} style={{ padding:'4px 8px', border:'1px solid #fee2e2', borderRadius:4, background:'#fef2f2', cursor:'pointer', fontSize:12 }}>🗑️</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
        {items.length===0 && <p style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No risks logged.</p>}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Risk':'New Risk'}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Risk name *</div><input value={form.name} onChange={f('name')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Description</div><textarea value={form.description} onChange={f('description')} rows={2} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, resize:'vertical', boxSizing:'border-box' }} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Probability</div><select value={form.probability} onChange={f('probability')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}>{PROBS.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Impact</div><select value={form.impact} onChange={f('impact')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}>{IMPACTS.map(i=><option key={i}>{i}</option>)}</select></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Status</div><select value={form.status} onChange={f('status')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Owner</div><select value={form.ownerId} onChange={f('ownerId')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}><option value=''>None</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Mitigation plan</div><textarea value={form.mitigationPlan} onChange={f('mitigationPlan')} rows={3} placeholder="How will this risk be managed?" style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, resize:'vertical', boxSizing:'border-box' }} /></div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <button onClick={()=>setModal(false)} style={{ padding:'8px 16px', border:'1px solid #e2e8f0', borderRadius:6, background:'white', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button onClick={save} disabled={saving||!form.name.trim()} style={{ padding:'8px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', fontWeight:600 }}>{saving?'Saving…':editing?'Save':'Add risk'}</button>
        </div>
      </Modal>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Modal from '@/components/Modal'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CATS = ['Financial','Technical','Administrative','Informational','Capacity','Social','Regulatory']

export default function Barriers() {
  const [items, setItems] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', category:'Financial', description:'', frequency:5, severity:5, stakeholders:'' })

  const load = () => fetch('/api/barriers').then(r=>r.json()).then(d=>setItems(Array.isArray(d)?d:[]))
  useEffect(() => { load() }, [])

  const open = (item?: any) => {
    setEditing(item||null)
    setForm(item ? { ...item, stakeholders:(item.stakeholders||[]).join(', ') } : { name:'', category:'Financial', description:'', frequency:5, severity:5, stakeholders:'' })
    setModal(true)
  }
  const save = async () => {
    if(!form.name.trim())return; setSaving(true)
    const body = { ...form, stakeholders: form.stakeholders.split(',').map((s:string)=>s.trim()).filter(Boolean) }
    const url = editing ? `/api/barriers/${editing.id}` : '/api/barriers'
    await fetch(url, { method:editing?'PATCH':'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    setSaving(false); setModal(false); load()
  }
  const del = async (id:string) => { if(!confirm('Delete?'))return; await fetch(`/api/barriers/${id}`,{method:'DELETE'}); load() }
  const f = (k:string) => (e:any) => setForm((p:any)=>({...p,[k]:e.target.type==='number'?Number(e.target.value):e.target.value}))

  const CAT_COLOR: Record<string,string> = { Financial:'#ef4444', Technical:'#f59e0b', Administrative:'#8b5cf6', Informational:'#3b82f6', Capacity:'#10b981', Social:'#06b6d4', Regulatory:'#ec4899' }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:12, boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}><div style={{ fontWeight:700, marginBottom:4 }}>{d.name}</div><div style={{ color:'#64748b' }}>Frequency: {d.frequency}/10 · Severity: {d.severity}/10</div><div style={{ color:CAT_COLOR[d.category]||'#64748b', marginTop:2 }}>{d.category}</div></div>
  }

  return (
    <div style={{ marginLeft:220, padding:24, minHeight:'100vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a' }}>Barrier Analysis</h1>
          <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>{items.length} barriers identified</p>
        </div>
        <button onClick={()=>open()} style={{ padding:'9px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>+ Add Barrier</button>
      </div>

      {/* Scatter plot */}
      <div style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', padding:20, marginBottom:20 }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:4 }}>Frequency × Severity Matrix</h3>
        <p style={{ fontSize:12, color:'#94a3b8', marginBottom:16 }}>Top-right quadrant = highest priority barriers</p>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top:10, right:30, bottom:20, left:10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="frequency" domain={[0,10]} name="Frequency" label={{ value:'Frequency →', position:'insideBottomRight', offset:-10, fontSize:11 }} tick={{ fontSize:11 }} />
            <YAxis type="number" dataKey="severity" domain={[0,10]} name="Severity" label={{ value:'Severity →', angle:-90, position:'insideLeft', fontSize:11 }} tick={{ fontSize:11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={items} name="Barriers">
              {items.map((b,i)=><Cell key={i} fill={CAT_COLOR[b.category]||'#64748b'} opacity={0.85} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:8 }}>
          {Object.entries(CAT_COLOR).map(([cat,color])=>(
            <div key={cat} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#64748b' }}>
              <div style={{ width:10,height:10,borderRadius:'50%',background:color }} />{cat}
            </div>
          ))}
        </div>
      </div>

      {/* Barrier list */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {items.map(item => (
          <div key={item.id} style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:8, background:(CAT_COLOR[item.category]||'#64748b')+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:15, fontWeight:800, color:CAT_COLOR[item.category]||'#64748b' }}>{item.severity}</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                <span style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>{item.name}</span>
                <span style={{ fontSize:11, padding:'1px 8px', borderRadius:20, background:(CAT_COLOR[item.category]||'#64748b')+'22', color:CAT_COLOR[item.category]||'#64748b' }}>{item.category}</span>
              </div>
              {item.description && <p style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>{item.description}</p>}
              <div style={{ display:'flex', gap:12, fontSize:11, color:'#94a3b8' }}>
                <span>Frequency: <strong style={{ color:'#374151' }}>{item.frequency}/10</strong></span>
                <span>Severity: <strong style={{ color:'#374151' }}>{item.severity}/10</strong></span>
                <span>Score: <strong style={{ color:'#374151' }}>{((item.frequency+item.severity)/2).toFixed(1)}</strong></span>
              </div>
            </div>
            <div style={{ display:'flex', gap:4, flexShrink:0 }}>
              <button onClick={()=>open(item)} style={{ padding:'6px 10px', border:'1px solid #e2e8f0', borderRadius:6, background:'white', cursor:'pointer', fontSize:12 }}>✏️</button>
              <button onClick={()=>del(item.id)} style={{ padding:'6px 10px', border:'1px solid #fee2e2', borderRadius:6, background:'#fef2f2', cursor:'pointer', fontSize:12 }}>🗑️</button>
            </div>
          </div>
        ))}
        {items.length===0 && <p style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No barriers yet.</p>}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Barrier':'Add Barrier'}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Name *</div><input value={form.name} onChange={f('name')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Category</div><select value={form.category} onChange={f('category')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Frequency (1–10)</div><input type="number" min={1} max={10} value={form.frequency} onChange={f('frequency')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Severity (1–10)</div><input type="number" min={1} max={10} value={form.severity} onChange={f('severity')} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
          </div>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Description</div><textarea value={form.description} onChange={f('description')} rows={3} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, resize:'vertical', boxSizing:'border-box' }} /></div>
          <div><div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Affected stakeholders (comma-separated)</div><input value={form.stakeholders} onChange={f('stakeholders')} placeholder="e.g. CHA, Aurora HA" style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} /></div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <button onClick={()=>setModal(false)} style={{ padding:'8px 16px', border:'1px solid #e2e8f0', borderRadius:6, background:'white', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button onClick={save} disabled={saving||!form.name.trim()} style={{ padding:'8px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', fontWeight:600 }}>{saving?'Saving…':editing?'Save':'Add'}</button>
        </div>
      </Modal>
    </div>
  )
}

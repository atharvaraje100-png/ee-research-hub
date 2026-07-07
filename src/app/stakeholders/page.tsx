'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Modal from '@/components/Modal'

const TYPES = ['Housing Authority','Utility','Implementer','Program Administrator','HUD / Public Agency','Internal Team']
const OUTREACH = ['Not Contacted','Contacted','Responded','Scheduled','Declined','Complete']
const INT_STATUS = ['Not Scheduled','Outreach Sent','Scheduled','Completed','Declined']

export default function Stakeholders() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ organization:'', type:'Housing Authority', contactName:'', title:'', email:'', phone:'', territory:'', outreachStatus:'Not Contacted', interviewStatus:'Not Scheduled', consentObtained:false, notes:'' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  const load = () => fetch('/api/stakeholders').then(r=>r.json()).then(d=>{ setItems(Array.isArray(d)?d:[]); setLoading(false) })
  useEffect(() => { load() }, [])

  const open = (item?: any) => { setEditing(item||null); setForm(item ? { ...item, consentObtained: !!item.consentObtained } : { organization:'', type:'Housing Authority', contactName:'', title:'', email:'', phone:'', territory:'', outreachStatus:'Not Contacted', interviewStatus:'Not Scheduled', consentObtained:false, notes:'' }); setModal(true) }
  const save = async () => {
    if (!form.organization.trim()) return; setSaving(true)
    const url = editing ? `/api/stakeholders/${editing.id}` : '/api/stakeholders'
    await fetch(url, { method: editing?'PATCH':'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    setSaving(false); setModal(false); load()
  }
  const del = async (id: string) => { if (!confirm('Delete stakeholder?')) return; await fetch(`/api/stakeholders/${id}`,{method:'DELETE'}); load() }
  const f = (k: string) => (e: any) => setForm(p=>({...p,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value}))

  const filtered = items.filter(i => (!filterType||i.type===filterType) && (!search||i.organization.toLowerCase().includes(search.toLowerCase())||( i.contactName??'').toLowerCase().includes(search.toLowerCase())))
  const OUTREACH_COLOR: Record<string,string> = { 'Not Contacted':'#94a3b8','Contacted':'#3b82f6','Responded':'#f59e0b','Scheduled':'#8b5cf6','Declined':'#ef4444','Complete':'#10b981' }

  return (
    <div style={{ marginLeft:220, padding:24, minHeight:'100vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a' }}>Stakeholder CRM</h1>
          <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>{items.length} stakeholders · {items.filter(i=>i.consentObtained).length} consented</p>
        </div>
        <button onClick={()=>open()} style={{ padding:'9px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>+ Add Stakeholder</button>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ padding:'7px 12px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, width:220 }} />
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ padding:'7px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}>
          <option value="">All types</option>
          {TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['Organization','Type','Contact','Territory','Outreach','Interview','Consent',''].map(h=><th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid #e2e8f0' }}>{h}</th>)}
          </tr></thead>
          <tbody>{filtered.map(item=>(
            <tr key={item.id} style={{ borderBottom:'1px solid #f8fafc' }}
              onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#fafafa'}
              onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background='transparent'}>
              <td style={{ padding:'10px 14px', fontWeight:600, color:'#1e293b' }}>{item.organization}</td>
              <td style={{ padding:'10px 14px', color:'#64748b', fontSize:12 }}>{item.type}</td>
              <td style={{ padding:'10px 14px' }}><div style={{ fontSize:12, color:'#374151' }}>{item.contactName||'—'}</div>{item.email&&<div style={{ fontSize:11, color:'#94a3b8' }}>{item.email}</div>}</td>
              <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{item.territory||'—'}</td>
              <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:OUTREACH_COLOR[item.outreachStatus]+'22', color:OUTREACH_COLOR[item.outreachStatus] }}>{item.outreachStatus}</span></td>
              <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{item.interviewStatus}</td>
              <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:item.consentObtained?'#d1fae5':'#f1f5f9', color:item.consentObtained?'#059669':'#94a3b8' }}>{item.consentObtained?'Yes':'No'}</span></td>
              <td style={{ padding:'10px 14px' }}><div style={{ display:'flex', gap:4 }}>
                <button onClick={()=>open(item)} style={{ padding:'4px 8px', border:'1px solid #e2e8f0', borderRadius:4, background:'white', cursor:'pointer', fontSize:12 }}>✏️</button>
                <button onClick={()=>del(item.id)} style={{ padding:'4px 8px', border:'1px solid #fee2e2', borderRadius:4, background:'#fef2f2', cursor:'pointer', fontSize:12 }}>🗑️</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length===0&&<p style={{ textAlign:'center', padding:'40px', color:'#94a3b8', fontSize:13 }}>No stakeholders found.</p>}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Stakeholder':'New Stakeholder'} width={560}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { label:'Organization *', key:'organization', full:true },
            { label:'Type', key:'type', type:'select', opts:TYPES },
            { label:'Contact Name', key:'contactName' },
            { label:'Title', key:'title' },
            { label:'Email', key:'email', type:'email' },
            { label:'Phone', key:'phone' },
            { label:'Territory', key:'territory' },
            { label:'Outreach Status', key:'outreachStatus', type:'select', opts:OUTREACH },
            { label:'Interview Status', key:'interviewStatus', type:'select', opts:INT_STATUS },
          ].map((f:any)=>(
            <div key={f.key} style={{ gridColumn: f.full?'1 / -1':'auto' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>{f.label}</div>
              {f.type==='select' ? (
                <select value={(form as any)[f.key]} onChange={((e:any)=>setForm((p:any)=>({...p,[f.key]:e.target.value})))} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13 }}>
                  {f.opts.map((o:string)=><option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type||'text'} value={(form as any)[f.key]} onChange={f2(f.key)} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, boxSizing:'border-box' }} />
              )}
            </div>
          ))}
          <div style={{ gridColumn:'1 / -1' }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={form.consentObtained} onChange={f('consentObtained')} /> Consent obtained
            </label>
          </div>
          <div style={{ gridColumn:'1 / -1' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:4 }}>Notes</div>
            <textarea value={form.notes} onChange={f('notes')} rows={3} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, resize:'vertical', boxSizing:'border-box' }} />
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <button onClick={()=>setModal(false)} style={{ padding:'8px 16px', border:'1px solid #e2e8f0', borderRadius:6, background:'white', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button onClick={save} disabled={saving||!form.organization.trim()} style={{ padding:'8px 18px', background:'#3b82f6', color:'white', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', fontWeight:600, opacity:saving?0.6:1 }}>{saving?'Saving…':editing?'Save':'Add'}</button>
        </div>
      </Modal>
    </div>
  )

  function f2(k: string) { return (e: any) => setForm((p:any)=>({...p,[k]:e.target.value})) }
}

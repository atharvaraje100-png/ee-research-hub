'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',      icon: '📊' },
  { href: '/board',        label: 'Task Board',      icon: '📋' },
  { href: '/gantt',        label: 'Gantt Timeline',  icon: '📅' },
  { href: '/stakeholders', label: 'Stakeholders',    icon: '🏢' },
  { href: '/interviews',   label: 'Interviews',      icon: '🎤' },
  { href: '/barriers',     label: 'Barriers',        icon: '🚧' },
  { href: '/deliverables', label: 'Deliverables',    icon: '📄' },
  { href: '/risks',        label: 'Risk Register',   icon: '⚠️' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#1e293b', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40 }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: 'white' }}>EE</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>EE Research Hub</span>
        </div>
        <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>ComEd Territory<br />Barriers to EE Adoption</p>
      </div>
      <nav style={{ flex: 1, padding: '8px 8px' }}>
        {NAV.map(n => {
          const active = path.startsWith(n.href)
          return (
            <Link key={n.href} href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginBottom: 2, textDecoration: 'none', background: active ? '#3b82f6' : 'transparent', color: active ? 'white' : '#94a3b8', fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
              <span style={{ fontSize: 15 }}>{n.icon}</span>
              {n.label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #334155', fontSize: 11, color: '#64748b' }}>
        Jun – Oct 2026 · v3.0
      </div>
    </aside>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
export const metadata: Metadata = { title: 'EE Research Hub' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: 220 }}>
          {children}
        </div>
      </body>
    </html>
  )
}
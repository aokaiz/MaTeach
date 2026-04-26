import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hello World App',
  description: 'Next.js + PostgreSQL Hello World',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}

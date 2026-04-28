import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MaTeach - 材料科学AI答题系统',
  description: 'Materials Science AI Q&A System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}

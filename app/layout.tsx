import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Mentora — Study Abroad Consultancy',
  description: 'Pakistan\'s premier study abroad management platform',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!font-sans !text-sm !rounded-xl !shadow-lg',
            success: { className: '!font-sans !text-sm !rounded-xl !border !border-emerald-200 !bg-emerald-50 !text-emerald-900' },
            error:   { className: '!font-sans !text-sm !rounded-xl !border !border-red-200 !bg-red-50 !text-red-900' },
          }}
        />
      </body>
    </html>
  )
}

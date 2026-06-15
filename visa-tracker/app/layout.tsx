import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Visa Tracker',
  description: 'Manage your visa clients',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex bg-gray-50">
        {/* Sidebar */}
        <aside className="w-56 bg-slate-900 text-white flex flex-col shrink-0">
          <div className="px-6 py-5 border-b border-slate-700">
            <h1 className="text-lg font-bold tracking-tight">Visa Tracker</h1>
            <p className="text-slate-400 text-xs mt-0.5">Client Management</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>📊</span> Dashboard
            </Link>
            <Link
              href="/clients"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>👥</span> Clients
            </Link>
            <Link
              href="/clients/new"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>➕</span> Add Client
            </Link>
            <Link
              href="/import"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>📥</span> Import CSV
            </Link>
          </nav>
          <div className="px-6 py-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs">Telegram reminders active</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  )
}

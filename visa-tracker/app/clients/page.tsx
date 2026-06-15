import { prisma } from '@/lib/db'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'Submitted': 'bg-yellow-100 text-yellow-700',
  'Approved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
  'On Hold': 'bg-gray-100 text-gray-600',
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q, status } = await searchParams

  const clients = await prisma.client.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      _count: { select: { tasks: { where: { completed: false } } } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Clients</h2>
        <Link
          href="/clients/new"
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Client
        </Link>
      </div>

      {/* Filters */}
      <form className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          name="status"
          defaultValue={status}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All statuses</option>
          {['In Progress', 'Submitted', 'Approved', 'Rejected', 'On Hold'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          Filter
        </button>
        {(q || status) && (
          <Link href="/clients" className="text-sm text-slate-500 px-3 py-2 hover:text-slate-700">
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {clients.length === 0 ? (
          <p className="px-6 py-12 text-center text-slate-400">No clients found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Name', 'Visa Type', 'Nationality', 'Status', 'Open Tasks', 'Last Updated'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client: (typeof clients)[0]) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium text-slate-800 hover:text-blue-600">
                      {client.name}
                    </Link>
                    {client.email && <p className="text-xs text-slate-400">{client.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{client.visaType || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{client.nationality || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[client.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{client._count.tasks || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(client.updatedAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

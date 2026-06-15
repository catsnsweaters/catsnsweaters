import { prisma } from '@/lib/db'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'Submitted': 'bg-yellow-100 text-yellow-700',
  'Approved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
  'On Hold': 'bg-gray-100 text-gray-600',
}

export default async function DashboardPage() {
  const [clients, upcomingTasks] = await Promise.all([
    prisma.client.findMany({
      include: { _count: { select: { tasks: { where: { completed: false } } } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.task.findMany({
      where: {
        completed: false,
        dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
      include: { client: true },
      orderBy: { dueDate: 'asc' },
      take: 20,
    }),
  ])

  const stats = {
    total: clients.length,
    inProgress: clients.filter((c: (typeof clients)[0]) => c.status === 'In Progress').length,
    approved: clients.filter((c: (typeof clients)[0]) => c.status === 'Approved').length,
    tasksDue: upcomingTasks.length,
  }

  const now = new Date()

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Clients', value: stats.total, color: 'border-slate-200' },
          { label: 'In Progress', value: stats.inProgress, color: 'border-blue-300' },
          { label: 'Approved', value: stats.approved, color: 'border-green-300' },
          { label: 'Tasks Due (7 days)', value: stats.tasksDue, color: 'border-orange-300' },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl border-2 ${s.color} p-5`}>
            <p className="text-3xl font-bold text-slate-800">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Upcoming Tasks (next 7 days)</h3>
        </div>
        {upcomingTasks.length === 0 ? (
          <p className="px-6 py-8 text-center text-slate-400">No upcoming tasks</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcomingTasks.map((task) => {
              const due = task.dueDate ? new Date(task.dueDate) : null
              const overdue = due && due < now
              return (
                <li key={task.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <Link href={`/clients/${task.clientId}`} className="font-medium text-slate-800 hover:text-blue-600">
                      {task.title}
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5">Client: {task.client.name}</p>
                  </div>
                  {due && (
                    <span className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-orange-500'}`}>
                      {overdue ? 'Overdue · ' : ''}{formatDistanceToNow(due, { addSuffix: true })}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700">Recent Clients</h3>
          <Link href="/clients" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {clients.length === 0 ? (
          <p className="px-6 py-8 text-center text-slate-400">
            No clients yet.{' '}
            <Link href="/clients/new" className="text-blue-600 hover:underline">Add one</Link>
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {clients.slice(0, 5).map((client: (typeof clients)[0]) => (
              <li key={client.id} className="px-6 py-4 flex items-center justify-between">
                <Link href={`/clients/${client.id}`} className="font-medium text-slate-800 hover:text-blue-600">
                  {client.name}
                </Link>
                <div className="flex items-center gap-3">
                  {client._count.tasks > 0 && (
                    <span className="text-xs text-orange-600 font-medium">{client._count.tasks} open tasks</span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[client.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {client.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

const STATUSES = ['In Progress', 'Submitted', 'Approved', 'Rejected', 'On Hold']

const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'Submitted': 'bg-yellow-100 text-yellow-700',
  'Approved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
  'On Hold': 'bg-gray-100 text-gray-600',
}

type Task = {
  id: string
  title: string
  description: string | null
  dueDate: string | Date | null
  completed: boolean
  createdAt: string | Date
}

type Update = {
  id: string
  content: string
  createdAt: string | Date
}

type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  nationality: string | null
  passportNumber: string | null
  visaType: string | null
  status: string
  notes: string | null
  tasks: Task[]
  updates: Update[]
}

export default function ClientDetail({ client: initial }: { client: Client }) {
  const router = useRouter()
  const [client, setClient] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: initial.name,
    email: initial.email || '',
    phone: initial.phone || '',
    nationality: initial.nationality || '',
    passportNumber: initial.passportNumber || '',
    visaType: initial.visaType || '',
    status: initial.status,
    notes: initial.notes || '',
  })
  const [newTask, setNewTask] = useState({ title: '', dueDate: '' })
  const [newUpdate, setNewUpdate] = useState('')
  const [saving, setSaving] = useState(false)

  const now = new Date()

  async function saveEdit() {
    setSaving(true)
    const res = await fetch(`/api/clients/${client.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const updated = await res.json()
    setClient({ ...client, ...updated })
    setEditing(false)
    setSaving(false)
  }

  async function deleteClient() {
    if (!confirm(`Delete ${client.name}? This cannot be undone.`)) return
    await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
    router.push('/clients')
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.title.trim()) return
    const res = await fetch(`/api/clients/${client.id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    })
    const task = await res.json()
    setClient({ ...client, tasks: [task, ...client.tasks] })
    setNewTask({ title: '', dueDate: '' })
  }

  async function toggleTask(taskId: string, completed: boolean) {
    const res = await fetch(`/api/clients/${client.id}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    const updated = await res.json()
    setClient({
      ...client,
      tasks: client.tasks.map((t) => (t.id === taskId ? updated : t)),
    })
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/clients/${client.id}/tasks/${taskId}`, { method: 'DELETE' })
    setClient({ ...client, tasks: client.tasks.filter((t) => t.id !== taskId) })
  }

  async function addUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!newUpdate.trim()) return
    const res = await fetch(`/api/clients/${client.id}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newUpdate }),
    })
    const update = await res.json()
    setClient({ ...client, updates: [update, ...client.updates] })
    setNewUpdate('')
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{client.name}</h2>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[client.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {client.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={deleteClient}
            className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-slate-700 mb-3">Edit Client</h3>
          <div className="grid grid-cols-2 gap-4">
            {([
              ['name', 'Full Name', 'text'],
              ['email', 'Email', 'email'],
              ['phone', 'Phone', 'text'],
              ['nationality', 'Nationality', 'text'],
              ['passportNumber', 'Passport Number', 'text'],
              ['visaType', 'Visa Type', 'text'],
            ] as const).map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={editForm[field]}
                  onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          <button
            onClick={saveEdit}
            disabled={saving}
            className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      ) : (
        /* Info card */
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[
              ['Email', client.email],
              ['Phone', client.phone],
              ['Nationality', client.nationality],
              ['Passport', client.passportNumber],
              ['Visa Type', client.visaType],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-slate-700 mt-0.5">{value || '—'}</p>
              </div>
            ))}
          </div>
          {client.notes && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Tasks</h3>
          </div>
          <form onSubmit={addTask} className="px-5 py-3 border-b border-slate-100 flex gap-2">
            <input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="New task..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button type="submit" className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700">
              Add
            </button>
          </form>
          <ul className="divide-y divide-slate-100 max-h-80 overflow-auto">
            {client.tasks.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-slate-400">No tasks yet</li>
            )}
            {client.tasks.map((task) => {
              const due = task.dueDate ? new Date(task.dueDate) : null
              const overdue = due && due < now && !task.completed
              const dueSoon = due && !overdue && due < new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) && !task.completed
              return (
                <li key={task.id} className="px-5 py-3 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => toggleTask(task.id, e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {task.title}
                    </p>
                    {due && (
                      <p className={`text-xs mt-0.5 ${overdue ? 'text-red-500' : dueSoon ? 'text-orange-500' : 'text-slate-400'}`}>
                        {due.toLocaleDateString('en-GB')}
                        {overdue && ' · Overdue'}
                        {dueSoon && ' · Due soon'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-300 hover:text-red-500 text-xs shrink-0"
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Updates */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Activity Log</h3>
          </div>
          <form onSubmit={addUpdate} className="px-5 py-3 border-b border-slate-100 flex gap-2">
            <textarea
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Type an update..."
              rows={2}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
            <button type="submit" className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 self-end">
              Post
            </button>
          </form>
          <ul className="divide-y divide-slate-100 max-h-80 overflow-auto">
            {client.updates.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-slate-400">No updates yet</li>
            )}
            {client.updates.map((update) => (
              <li key={update.id} className="px-5 py-3">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{update.content}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

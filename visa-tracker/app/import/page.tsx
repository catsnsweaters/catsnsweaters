'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const COLUMN_MAP: Record<string, string> = {
  'Клиент (ФИО)': 'name',
  'Актуальные задачи': 'task',
  'Тип (найм / ИП)': 'visaType',
  'Членов семьи (0, 1, 2...)': 'familyMembers',
  'Статус кейса': 'status',
  'Предп. дата подачи': 'submissionDate',
  'Комментарии': 'notes',
}

const STATUS_MAP: Record<string, string> = {
  'Собираем документы': 'In Progress',
  'Готов к подаче': 'Submitted',
  'Ожидание решения': 'On Hold',
  'Отказ': 'Rejected',
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function stripEmoji(str: string): string {
  return str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim()
}

function parseSheet(text: string) {
  const lines = text.trim().split('\n').filter(Boolean)
  // Row 0 is the title, row 1 is headers, rows 2+ are data
  if (lines.length < 3) return []
  const headers = parseCSVLine(lines[1])

  return lines.slice(2).map((line) => {
    const values = parseCSVLine(line)
    const raw: Record<string, string> = {}
    headers.forEach((h, i) => {
      const key = COLUMN_MAP[h.trim()]
      if (key) raw[key] = values[i] || ''
    })

    const statusRaw = stripEmoji(raw.status || '')
    const status = STATUS_MAP[statusRaw] ?? 'In Progress'

    const notesParts = [
      raw.notes,
      raw.submissionDate ? `Предп. дата подачи: ${raw.submissionDate}` : '',
      raw.familyMembers ? `Членов семьи: ${raw.familyMembers}` : '',
    ].filter(Boolean)

    return {
      name: raw.name || '',
      visaType: raw.visaType || null,
      status,
      notes: notesParts.join(' | ') || null,
      task: raw.task || null,
    }
  }).filter((r) => r.name)
}

type ParsedRow = ReturnType<typeof parseSheet>[number]

export default function ImportPage() {
  const router = useRouter()
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    setPreview([])
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = parseSheet(text)
      if (rows.length === 0) { setError('No client rows found. Make sure row 1 is a title, row 2 has column headers including "Клиент (ФИО)".'); return }
      setPreview(rows)
    }
    reader.readAsText(file, 'utf-8')
  }

  async function handleImport() {
    setImporting(true)
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clients: preview }),
    })
    const data = await res.json()
    setResult(`Successfully imported ${data.imported} clients.`)
    setImporting(false)
    setTimeout(() => router.push('/clients'), 1500)
  }

  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Import from Google Sheets</h2>
      <p className="text-slate-500 text-sm mb-6">
        Export your Nomad Digital tracker as CSV and upload it here. Client name, visa type, status, comments, and current tasks will be imported.
      </p>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">Select CSV file</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {preview.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Preview ({preview.length} clients)</h3>
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${preview.length} clients`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Name', 'Visa Type', 'Status', 'Task', 'Notes'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.slice(0, 8).map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-medium text-slate-800">{row.name}</td>
                    <td className="px-4 py-2 text-slate-600">{row.visaType || '—'}</td>
                    <td className="px-4 py-2 text-slate-600">{row.status}</td>
                    <td className="px-4 py-2 text-slate-600 max-w-48 truncate">{row.task || '—'}</td>
                    <td className="px-4 py-2 text-slate-500 max-w-48 truncate text-xs">{row.notes || '—'}</td>
                  </tr>
                ))}
                {preview.length > 8 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-slate-400 text-xs">...and {preview.length - 8} more</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-green-700 text-sm font-medium">
          {result}
        </div>
      )}

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mt-6">
        <h4 className="font-semibold text-slate-700 text-sm mb-2">How to export</h4>
        <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
          <li>Open your Google Sheet</li>
          <li>Go to <strong>File → Download → Comma Separated Values (.csv)</strong></li>
          <li>Upload the downloaded file above</li>
        </ol>
      </div>
    </div>
  )
}

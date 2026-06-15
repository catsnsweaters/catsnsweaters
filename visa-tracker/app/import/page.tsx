'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EXPECTED_COLUMNS = ['name', 'email', 'phone', 'nationality', 'passportNumber', 'visaType', 'status', 'notes']

function parseCSV(text: string) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row
  })
}

export default function ImportPage() {
  const router = useRouter()
  const [preview, setPreview] = useState<Record<string, string>[]>([])
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
      const rows = parseCSV(text)
      if (rows.length === 0) { setError('No data found in CSV'); return }
      if (!rows[0].name) { setError('CSV must have a "name" column'); return }
      setPreview(rows)
    }
    reader.readAsText(file)
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
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Import from CSV</h2>
      <p className="text-slate-500 text-sm mb-6">
        Upload a CSV exported from Google Sheets. Required column: <code className="bg-slate-100 px-1 rounded">name</code>.
        Optional: {EXPECTED_COLUMNS.slice(1).join(', ')}.
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
            <h3 className="font-semibold text-slate-700">Preview ({preview.length} rows)</h3>
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
                  {Object.keys(preview[0]).map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-4 py-2 text-slate-600 truncate max-w-32">{v || '—'}</td>
                    ))}
                  </tr>
                ))}
                {preview.length > 5 && (
                  <tr>
                    <td colSpan={Object.keys(preview[0]).length} className="px-4 py-2 text-slate-400 text-xs">
                      ...and {preview.length - 5} more rows
                    </td>
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
        <h4 className="font-semibold text-slate-700 text-sm mb-2">How to export from Google Sheets</h4>
        <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
          <li>Open your Google Sheet</li>
          <li>Go to <strong>File → Download → Comma Separated Values (.csv)</strong></li>
          <li>Make sure the first row contains column headers</li>
          <li>Upload the downloaded file above</li>
        </ol>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { authenticatedFetch } from '@/lib/api-client'

interface PatientProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  created_at: string
  patient_profile?: any
  user?: { email?: string | null; mobile_number?: string | null }
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authenticatedFetch('/api/doctor/patients')
      if (res.ok) {
        const data = await res.json()
        setPatients(data.data || [])
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setError(err.error || 'Failed to load patients')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const filtered = patients.filter(p => {
    const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase()
    const email = (p.user?.email || '').toLowerCase()
    const mobile = (p.user?.mobile_number || '').toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q) || mobile.includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">View patients and their profiles</p>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or mobile" className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64" />
          <button onClick={loadPatients} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Refresh</button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No patients found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{p.first_name} {p.last_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{p.user?.email || '—'}</div>
                    <div className="text-xs text-gray-500">{p.user?.mobile_number || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
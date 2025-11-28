'use client'

import { useEffect, useState } from 'react'
import { authenticatedFetch } from '@/lib/api-client'

interface PatientProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  user?: { email?: string | null; mobile_number?: string | null }
}

export default function NewPrescriptionPage() {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    profile_id: '',
    title: 'Prescription',
    description: '',
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    setLoadingPatients(true)
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
      setLoadingPatients(false)
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.profile_id || !form.title) return
    setSaving(true)
    setError('')
    try {
      const res = await authenticatedFetch('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          profile_id: form.profile_id,
          title: form.title,
          description: form.description,
          recorded_date: new Date().toISOString(),
        })
      })
      if (res.ok) {
        setForm({ profile_id: '', title: 'Prescription', description: '' })
        alert('Prescription created')
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setError(err.error || 'Failed to create prescription')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>
        <p className="text-gray-600">Create a prescription for a patient</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
          <select name="profile_id" value={form.profile_id} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required>
            <option value="" disabled>{loadingPatients ? 'Loading patients...' : 'Select patient'}</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {(p.first_name || '') + ' ' + (p.last_name || '')} {(p.user?.email ? `• ${p.user.email}` : '')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input name="title" value={form.title} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
          <textarea name="description" value={form.description} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Prescription details, dosage, etc." />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button>
          <button type="button" onClick={() => setForm({ profile_id: '', title: 'Prescription', description: '' })} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Reset</button>
        </div>
      </form>
    </div>
  )
}
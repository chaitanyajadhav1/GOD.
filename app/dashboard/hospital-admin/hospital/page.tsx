'use client'

import { useEffect, useState } from 'react'
import { authenticatedFetch } from '@/lib/api-client'

interface Hospital {
  id: string
  name: string
  address?: string | null
  contact_number?: string | null
  email?: string | null
  website?: string | null
}

export default function ManageHospitalPage() {
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadHospital()
  }, [])

  const loadHospital = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authenticatedFetch('/api/hospital-admin/hospital')
      if (res.ok) {
        const data = await res.json()
        setHospital(data.data)
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setError(err.error || 'Failed to load hospital')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!hospital) return
    const { name, value } = e.target
    setHospital({ ...hospital, [name]: value })
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospital) return
    setSaving(true)
    setError('')
    try {
      const res = await authenticatedFetch('/api/hospital-admin/hospital', {
        method: 'PUT',
        body: JSON.stringify({
          name: hospital.name,
          address: hospital.address,
          contact_number: hospital.contact_number,
          email: hospital.email,
          website: hospital.website,
        })
      })
      if (res.ok) {
        loadHospital()
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setError(err.error || 'Failed to save changes')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hospital) {
    return <div className="text-gray-500">No hospital found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Hospital</h1>
        <p className="text-gray-600">Update hospital details</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <form onSubmit={onSave} className="bg-white rounded-lg shadow-sm p-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" value={hospital.name || ''} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea name="address" value={hospital.address || ''} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input name="contact_number" value={hospital.contact_number || ''} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={hospital.email || ''} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input name="website" value={hospital.website || ''} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={loadHospital} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Reset</button>
        </div>
      </form>
    </div>
  )
}
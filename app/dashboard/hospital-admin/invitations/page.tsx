'use client'

import { useEffect, useState } from 'react'
import { authenticatedFetch } from '@/lib/api-client'

interface Invitation {
  id: string
  email: string
  status: string
  created_at: string
  expires_at: string
  hospital?: { name: string }
  sender?: { email: string }
}

export default function HospitalAdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authenticatedFetch('/api/hospital-admin/invitations')
      if (res.ok) {
        const data = await res.json()
        setInvitations(data.data || [])
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setError(err.error || 'Failed to load invitations')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const onSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSending(true)
    setError('')
    try {
      const res = await authenticatedFetch('/api/hospital-admin/invitations', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        setShowForm(false)
        setEmail('')
        fetchInvitations()
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setError(err.error || 'Failed to send invitation')
      }
    } catch {
      setError('Network error')
    } finally {
      setSending(false)
    }
  }

  const resend = async (id: string) => {
    try {
      const res = await authenticatedFetch(`/api/hospital-admin/invitations/${id}/resend`, { method: 'POST' })
      if (res.ok) fetchInvitations()
    } catch {}
  }

  const revoke = async (id: string) => {
    try {
      const res = await authenticatedFetch(`/api/hospital-admin/invitations/${id}`, { method: 'DELETE' })
      if (res.ok) fetchInvitations()
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-gray-600">Invite doctors to your hospital</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Send Invitation</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={onSendInvitation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="doctor@example.com" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={sending} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">{sending ? 'Sending...' : 'Send'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : invitations.length === 0 ? (
          <div className="p-6 text-gray-500">No invitations</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{inv.email}</div>
                    <div className="text-xs text-gray-500">{inv.sender?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : inv.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : inv.status === 'REVOKED' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>{inv.status.toLowerCase()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(inv.expires_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      {inv.status === 'PENDING' && (
                        <>
                          <button onClick={() => resend(inv.id)} className="text-blue-600 hover:text-blue-900">Resend</button>
                          <button onClick={() => revoke(inv.id)} className="text-red-600 hover:text-red-900">Revoke</button>
                        </>
                      )}
                    </div>
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
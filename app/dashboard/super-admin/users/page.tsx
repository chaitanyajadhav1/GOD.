'use client'

import { useEffect, useState } from 'react'
import { authenticatedFetch } from '@/lib/api-client'

interface Profile {
  id: string
  profile_type: string
  first_name?: string
  last_name?: string
}

interface UserItem {
  id: string
  email?: string
  mobile_number: string
  user_type: string
  status: string
  created_at: string
  last_login?: string
  profiles: Profile[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const url = search ? `/api/super-admin/users?q=${encodeURIComponent(search)}` : '/api/super-admin/users'
      const res = await authenticatedFetch(url)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data || [])
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to fetch users' }))
        setError(err.error || 'Failed to fetch users')
      }
    } catch (e: any) {
      setError(e.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage all users</p>
        </div>
        <form onSubmit={onSearchSubmit} className="mt-4 sm:mt-0 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or mobile"
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{u.email || '—'}</div>
                  <div className="text-sm text-gray-500">{u.mobile_number}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {u.user_type.toLowerCase().replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : u.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}> 
                    {u.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {u.profiles.length > 0 ? u.profiles.map(p => p.profile_type).join(', ') : '—'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {u.profiles.map(p => `${p.first_name || ''} ${p.last_name || ''}`.trim()).filter(Boolean).join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.last_login ? new Date(u.last_login).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-10 text-gray-500">No users found</div>
        )}
      </div>
    </div>
  )
}
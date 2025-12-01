'use client'

import { useEffect, useState } from 'react'
import { authenticatedFetch } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search } from 'lucide-react'

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

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'PENDING':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage all users</p>
        </div>
        <form onSubmit={onSearchSubmit} className="flex gap-2">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or mobile"
            className="w-64"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users in the system including their profiles and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Profiles</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">{u.email || '—'}</div>
                        <div className="text-sm text-gray-500">{u.mobile_number}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {u.user_type.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusVariant(u.status)}
                          className="capitalize"
                        >
                          {u.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {u.profiles.length > 0 ? u.profiles.map(p => p.profile_type).join(', ') : '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {u.profiles.map(p => `${p.first_name || ''} ${p.last_name || ''}`.trim()).filter(Boolean).join(', ')}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {u.last_login ? new Date(u.last_login).toLocaleString() : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function SuperAdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/super-admin', icon: '🏠' },
    { name: 'Hospitals', href: '/dashboard/super-admin/hospitals', icon: '🏥' },
    { name: 'Invitations', href: '/dashboard/super-admin/invitations', icon: '📧' },
    { name: 'Users', href: '/dashboard/super-admin/users', icon: '👥' },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}
      <div className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-40' : 'hidden'} md:block md:static md:z-auto md:w-72 w-64 bg-white shadow-lg`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Super Admin</h1>
          </div>

          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      pathname === item.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">SA</div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.email || 'Super Admin'}</p>
                <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-700">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="text-lg">☰</span>
            </button>

            <div className="flex-1 md:flex-none">
              <h1 className="text-xl font-semibold text-gray-800">
                {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <span className="text-lg">🔔</span>
              </button>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">SA</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
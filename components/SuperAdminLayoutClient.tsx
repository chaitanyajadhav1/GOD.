'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Menu, Home, Building2, Mail, Users } from 'lucide-react'

export default function SuperAdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
    { name: 'Hospitals', href: '/dashboard/super-admin/hospitals', icon: Building2 },
    { name: 'Invitations', href: '/dashboard/super-admin/invitations', icon: Mail },
    { name: 'Users', href: '/dashboard/super-admin/users', icon: Users },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full pt-4">
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator />
      
      <div className="p-4 flex-shrink-0">
        <Button 
          onClick={logout} 
          variant="outline"
          size="sm"
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 bg-white border-r flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center h-14 px-4 border-b md:hidden bg-white">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}
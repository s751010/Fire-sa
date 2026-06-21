'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Flame,
  LayoutDashboard,
  MapPin,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/areas', label: 'المناطق', icon: MapPin },
  { href: '/extinguishers', label: 'الطفايات', icon: Flame },
  { href: '/reports', label: 'التقارير', icon: ClipboardList },
]

const adminLinks = [
  { href: '/admin/inspectors', label: 'إدارة المفتشين', icon: Users },
]

export function NavBar({ userEmail, userRole }: { userEmail: string; userRole?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = userRole === 'admin'

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('تم تسجيل الخروج')
    router.push('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-gray-200 min-h-screen fixed top-0 right-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 p-6 border-b border-gray-100">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Fire-SA</p>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">{userEmail}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-red-50 text-red-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-gray-100">
              <p className="px-3 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">إدارة</p>
              {adminLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === href || pathname.startsWith(href + '/')
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
          >
            <LogOut className="w-4.5 h-4.5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14 shadow-sm">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-1">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">Fire-SA</span>
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="w-8" />
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-14 right-0 bottom-0 w-72 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                    pathname === href || pathname.startsWith(href + '/')
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              {isAdmin && (
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <p className="px-3 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">إدارة</p>
                  {adminLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                        pathname === href || pathname.startsWith(href + '/')
                          ? 'bg-red-50 text-red-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 w-full"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex items-center">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2 flex-1 text-xs font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'text-red-600'
                : 'text-gray-500'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}

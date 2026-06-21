export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Flame,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Stats queries
  const [
    { count: totalCount },
    { count: needsServiceCount },
    { count: passedCount },
  ] = await Promise.all([
    supabase.from('fire_extinguishers').select('*', { count: 'exact', head: true })
      .neq('status', 'retired'),
    supabase.from('fire_extinguishers').select('*', { count: 'exact', head: true })
      .eq('status', 'needs_service'),
    supabase.from('inspections').select('*', { count: 'exact', head: true })
      .eq('overall_status', 'passed')
      .gte('inspection_date', new Date(new Date().setDate(1)).toISOString()),
  ])

  // Overdue: next_service_date passed
  const { count: overdueCount } = await supabase
    .from('fire_extinguishers')
    .select('*', { count: 'exact', head: true })
    .lt('next_service_date', new Date().toISOString().split('T')[0])
    .neq('status', 'retired')

  // Recent inspections
  const { data: recentInspections } = await supabase
    .from('inspections')
    .select(`
      id, inspection_date, overall_status, notes,
      extinguisher:fire_extinguishers(serial_number, area:areas(name)),
      inspector:profiles(full_name)
    `)
    .order('inspection_date', { ascending: false })
    .limit(5)

  const stats = [
    {
      label: 'إجمالي الطفايات',
      value: totalCount ?? 0,
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'فحوصات ناجحة هذا الشهر',
      value: passedCount ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'تحتاج صيانة',
      value: needsServiceCount ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'متأخرة الصيانة',
      value: overdueCount ?? 0,
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  const statusLabel: Record<string, string> = {
    passed: 'سليمة',
    failed: 'فاشلة',
    needs_attention: 'تحتاج اهتمام',
  }

  const statusColor: Record<string, string> = {
    passed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    needs_attention: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          أهلاً، {profile?.full_name ?? 'مستخدم'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/extinguishers"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">بدء فحص</p>
                <p className="text-xs text-gray-500">اختر طفاية وابدأ الفحص</p>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
          </Link>

          {isAdmin && (
            <Link
              href="/areas"
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">إدارة المناطق</p>
                  <p className="text-xs text-gray-500">إضافة وتعديل المناطق</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
            </Link>
          )}
        </div>
      </div>

      {/* Recent inspections */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">آخر الفحوصات</h2>
        {recentInspections && recentInspections.length > 0 ? (
          <div className="space-y-2">
            {recentInspections.map((ins: any) => (
              <div
                key={ins.id}
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    طفاية #{ins.extinguisher?.serial_number}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ins.extinguisher?.area?.name} •{' '}
                    {new Date(ins.inspection_date).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ms-2 shrink-0 ${statusColor[ins.overall_status] ?? ''}`}
                >
                  {statusLabel[ins.overall_status] ?? ins.overall_status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
            <Flame className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">لا توجد فحوصات بعد</p>
            <Link
              href="/extinguishers"
              className="text-sm text-red-600 font-medium mt-2 inline-block"
            >
              ابدأ أول فحص
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

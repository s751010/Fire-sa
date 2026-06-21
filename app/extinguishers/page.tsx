export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, ChevronLeft, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { AddExtinguisherButton } from '@/components/add-extinguisher-button'

export default async function ExtinguishersPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>
}) {
  const { area: areaId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  let query = supabase
    .from('fire_extinguishers')
    .select(`
      id, serial_number, type, capacity, location_description,
      next_service_date, status,
      area:areas(id, name, location)
    `)
    .neq('status', 'retired')
    .order('serial_number')

  if (areaId) {
    query = query.eq('area_id', areaId)
  }

  const { data: extinguishers } = await query

  const { data: areas } = await supabase
    .from('areas').select('id, name').order('name')

  const { data: currentArea } = areaId
    ? await supabase.from('areas').select('name').eq('id', areaId).single()
    : { data: null }

  const isAdmin = profile?.role === 'admin'

  const statusIcon: Record<string, React.ReactNode> = {
    active: <CheckCircle className="w-4 h-4 text-green-500" />,
    needs_service: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    retired: <Clock className="w-4 h-4 text-gray-400" />,
  }

  const statusLabel: Record<string, string> = {
    active: 'سليمة',
    needs_service: 'تحتاج صيانة',
    retired: 'متقاعدة',
  }

  const statusBadge: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    needs_service: 'bg-yellow-100 text-yellow-800',
    retired: 'bg-gray-100 text-gray-600',
  }

  const typeLabel: Record<string, string> = {
    ABC: 'ABC مسحوق',
    CO2: 'ثاني أكسيد الكربون',
    foam: 'رغوة',
    water: 'ماء',
    hose: 'خرطوم الحريق',
    other: 'أخرى',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentArea ? currentArea.name : 'جميع الطفايات'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {extinguishers?.length ?? 0} طفاية
          </p>
        </div>
        {isAdmin && <AddExtinguisherButton areas={areas ?? []} defaultAreaId={areaId} />}
      </div>

      {/* Area filter */}
      {!areaId && areas && areas.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {areas.map((area: any) => (
            <Link
              key={area.id}
              href={`/extinguishers?area=${area.id}`}
              className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-700 transition-colors bg-white"
            >
              {area.name}
            </Link>
          ))}
        </div>
      )}

      {areaId && (
        <Link
          href="/extinguishers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          جميع المناطق
        </Link>
      )}

      {extinguishers && extinguishers.length > 0 ? (
        <div className="space-y-3">
          {extinguishers.map((ext: any) => (
            <div
              key={ext.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-start gap-3 p-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Flame className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">#{ext.serial_number}</p>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {ext.location_description}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusBadge[ext.status] ?? ''}`}
                    >
                      {statusLabel[ext.status] ?? ext.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{typeLabel[ext.type] ?? ext.type} • {ext.capacity}</span>
                    {ext.next_service_date && (
                      <span className={new Date(ext.next_service_date) < new Date() ? 'text-red-500 font-medium' : ''}>
                        صيانة: {new Date(ext.next_service_date).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Inspect button */}
              <Link
                href={`/inspect/${ext.id}`}
                className="flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                بدء الفحص
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <Flame className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">لا توجد طفايات</p>
          {isAdmin && (
            <p className="text-sm text-gray-400 mt-1">اضغط "إضافة طفاية" للبدء</p>
          )}
        </div>
      )}
    </div>
  )
}

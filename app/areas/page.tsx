export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Flame, Users, ChevronLeft, Plus } from 'lucide-react'
import { AddAreaButton } from '@/components/add-area-button'

export default async function AreasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const { data: areas } = await supabase
    .from('areas')
    .select(`
      id, name, location, created_at,
      inspector:profiles(full_name),
      extinguisher_count:fire_extinguishers(count)
    `)
    .order('name')

  const { data: inspectors } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'inspector')
    .order('full_name')

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المناطق</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {areas?.length ?? 0} منطقة مسجلة
          </p>
        </div>
        {isAdmin && <AddAreaButton inspectors={inspectors ?? []} />}
      </div>

      {areas && areas.length > 0 ? (
        <div className="space-y-3">
          {areas.map((area: any) => (
            <Link key={area.id} href={`/extinguishers?area=${area.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-base">{area.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{area.location}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Flame className="w-3.5 h-3.5" />
                            {area.extinguisher_count?.[0]?.count ?? 0} طفاية
                          </span>
                          {area.inspector && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Users className="w-3.5 h-3.5" />
                              {(area.inspector as any)?.full_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">لا توجد مناطق بعد</p>
          {isAdmin && (
            <p className="text-sm text-gray-400 mt-1">اضغط "إضافة منطقة" لبدء الإعداد</p>
          )}
        </div>
      )}
    </div>
  )
}

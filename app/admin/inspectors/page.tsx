export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, MapPin, ChevronLeft } from 'lucide-react'

export default async function InspectorsPage() {
  const supabase = await createClient()

  const { data: inspectors } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .order('full_name')

  // Get area counts per inspector
  const { data: areas } = await supabase
    .from('areas')
    .select('assigned_inspector_id')

  const areaCountMap: Record<string, number> = {}
  areas?.forEach((a) => {
    if (a.assigned_inspector_id) {
      areaCountMap[a.assigned_inspector_id] = (areaCountMap[a.assigned_inspector_id] ?? 0) + 1
    }
  })

  const roleLabel: Record<string, string> = {
    admin: 'مدير',
    inspector: 'مفتش',
  }
  const roleBadge: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    inspector: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المفتشين</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {inspectors?.length ?? 0} مستخدم — اضغط على مفتش لتعيين مناطقه
        </p>
      </div>

      <div className="space-y-3">
        {inspectors?.map((user) => {
          const count = areaCountMap[user.id] ?? 0
          return (
            <Link
              key={user.id}
              href={`/admin/inspectors/${user.id}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 text-lg">
                  {user.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.full_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role]}`}>
                      {roleLabel[user.role]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {count > 0 ? `${count} منطقة` : 'بدون مناطق'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

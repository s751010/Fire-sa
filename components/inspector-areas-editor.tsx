'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Area {
  id: string
  name: string
  location: string
  assigned_inspector_id: string | null
}

export function InspectorAreasEditor({
  inspectorId,
  inspectorName,
  allAreas,
  initialAssigned,
}: {
  inspectorId: string
  inspectorName: string
  allAreas: Area[]
  initialAssigned: string[]
}) {
  const supabase = createClient()
  const [assigned, setAssigned] = useState<Set<string>>(new Set(initialAssigned))
  const [loading, setLoading] = useState<Set<string>>(new Set())

  async function toggle(areaId: string) {
    setLoading((prev) => new Set(prev).add(areaId))
    const isAssigned = assigned.has(areaId)

    const { error } = await supabase
      .from('areas')
      .update({ assigned_inspector_id: isAssigned ? null : inspectorId })
      .eq('id', areaId)

    if (error) {
      toast.error('حدث خطأ أثناء التحديث')
    } else {
      setAssigned((prev) => {
        const next = new Set(prev)
        if (isAssigned) next.delete(areaId)
        else next.add(areaId)
        return next
      })
      toast.success(isAssigned ? 'تمت إزالة المنطقة' : `تم تعيين المنطقة لـ ${inspectorName}`)
    }
    setLoading((prev) => {
      const next = new Set(prev)
      next.delete(areaId)
      return next
    })
  }

  // Group areas by location (plant)
  const grouped: Record<string, Area[]> = {}
  allAreas.forEach((area) => {
    const loc = area.location || 'أخرى'
    if (!grouped[loc]) grouped[loc] = []
    grouped[loc].push(area)
  })

  const assignedCount = assigned.size
  const total = allAreas.length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
        <div>
          <p className="font-semibold text-gray-900">المناطق المخصصة</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {assignedCount} من {total} منطقة
          </p>
        </div>
        <div className="text-3xl font-bold text-red-600">
          {assignedCount}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-red-500 h-2 rounded-full transition-all"
          style={{ width: `${total > 0 ? (assignedCount / total) * 100 : 0}%` }}
        />
      </div>

      {/* Areas grouped by plant */}
      {Object.entries(grouped).map(([plant, areas]) => {
        const plantAssigned = areas.filter((a) => assigned.has(a.id)).length
        return (
          <div key={plant} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-medium text-gray-800 text-sm">{plant}</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {plantAssigned}/{areas.length}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {areas.map((area) => {
                const isAssigned = assigned.has(area.id)
                const isLoading = loading.has(area.id)
                const occupiedBy = area.assigned_inspector_id && area.assigned_inspector_id !== inspectorId

                return (
                  <button
                    key={area.id}
                    onClick={() => toggle(area.id)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between px-4 py-3.5 text-right transition-colors ${
                      isAssigned
                        ? 'bg-red-50 hover:bg-red-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isAssigned ? 'text-red-700' : 'text-gray-700'}`}>
                        {area.name}
                      </p>
                      {occupiedBy && !isAssigned && (
                        <p className="text-xs text-orange-500 mt-0.5">محجوزة لمفتش آخر</p>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ms-3 transition-all ${
                      isAssigned
                        ? 'bg-red-600 border-red-600'
                        : 'border-gray-300'
                    }`}>
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : isAssigned ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

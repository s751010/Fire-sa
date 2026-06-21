export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { InspectorAreasEditor } from '@/components/inspector-areas-editor'
import Link from 'next/link'
import { ChevronLeft, Shield } from 'lucide-react'

export default async function InspectorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: inspector } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', id)
    .single()

  if (!inspector) notFound()

  const { data: allAreas } = await supabase
    .from('areas')
    .select('id, name, location, assigned_inspector_id')
    .order('location')
    .order('name')

  const assignedAreaIds = new Set(
    (allAreas ?? [])
      .filter((a) => a.assigned_inspector_id === id)
      .map((a) => a.id)
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/inspectors"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center font-bold text-red-600 text-xl">
            {inspector.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{inspector.full_name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {inspector.role === 'admin' ? 'مدير — صلاحيات كاملة' : 'مفتش — يرى مناطقه فقط'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <InspectorAreasEditor
        inspectorId={id}
        inspectorName={inspector.full_name}
        allAreas={(allAreas ?? []) as any}
        initialAssigned={Array.from(assignedAreaIds)}
      />
    </div>
  )
}

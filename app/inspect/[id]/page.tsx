export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { InspectionForm } from '@/components/inspection-form'

export default async function InspectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: extinguisher } = await supabase
    .from('fire_extinguishers')
    .select(`
      id, serial_number, type, capacity, location_description, status,
      area:areas(name, location)
    `)
    .eq('id', id)
    .single()

  if (!extinguisher) notFound()

  const { data: lastInspection } = await supabase
    .from('inspections')
    .select('inspection_date, overall_status, inspector:profiles(full_name)')
    .eq('extinguisher_id', id)
    .order('inspection_date', { ascending: false })
    .limit(1)
    .single()

  return (
    <InspectionForm
      extinguisher={extinguisher as any}
      lastInspection={lastInspection as any}
      inspectorId={user.id}
    />
  )
}

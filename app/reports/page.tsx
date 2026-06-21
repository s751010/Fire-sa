export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsClient } from '@/components/reports-client'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const { data: inspections } = await supabase
    .from('inspections')
    .select(`
      id, inspection_date, overall_status, notes,
      pressure_ok, seal_intact, label_readable, pin_intact, no_damage,
      extinguisher:fire_extinguishers(
        serial_number, type, capacity, location_description,
        area:areas(name, location)
      ),
      inspector:profiles(full_name)
    `)
    .order('inspection_date', { ascending: false })
    .limit(200)

  const { data: extinguishers } = await supabase
    .from('fire_extinguishers')
    .select(`
      id, serial_number, type, capacity, location_description,
      installation_date, next_service_date, status, notes,
      area:areas(name, location)
    `)
    .neq('status', 'retired')
    .order('serial_number')

  return (
    <ReportsClient
      inspections={(inspections ?? []) as any}
      extinguishers={(extinguishers ?? []) as any}
      isAdmin={profile?.role === 'admin'}
    />
  )
}

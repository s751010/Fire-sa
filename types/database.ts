export type Role = 'admin' | 'inspector'
export type ExtinguisherStatus = 'active' | 'needs_service' | 'retired'
export type InspectionStatus = 'passed' | 'failed' | 'needs_attention'
export type ExtinguisherType = 'ABC' | 'CO2' | 'foam' | 'water' | 'other'

export interface Profile {
  id: string
  full_name: string
  role: Role
  created_at: string
  updated_at: string
}

export interface Area {
  id: string
  name: string
  location: string
  assigned_inspector_id: string | null
  created_at: string
  updated_at: string
  inspector?: Profile
  extinguisher_count?: number
}

export interface FireExtinguisher {
  id: string
  area_id: string
  serial_number: string
  type: ExtinguisherType
  capacity: string
  location_description: string
  installation_date: string | null
  next_service_date: string | null
  status: ExtinguisherStatus
  notes: string | null
  created_at: string
  updated_at: string
  area?: Area
  last_inspection?: Inspection
}

export interface Inspection {
  id: string
  extinguisher_id: string
  inspector_id: string
  inspection_date: string
  pressure_ok: boolean
  seal_intact: boolean
  label_readable: boolean
  pin_intact: boolean
  no_damage: boolean
  overall_status: InspectionStatus
  notes: string | null
  created_at: string
  extinguisher?: FireExtinguisher
  inspector?: Profile
}

export interface DashboardStats {
  total_extinguishers: number
  passed_this_month: number
  needs_attention: number
  overdue_service: number
}

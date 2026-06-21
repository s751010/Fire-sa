import * as XLSX from 'xlsx'
import type { Inspection, FireExtinguisher } from '@/types/database'

const STATUS_LABELS: Record<string, string> = {
  passed: 'سليمة',
  failed: 'فاشلة',
  needs_attention: 'تحتاج اهتمام',
  active: 'نشطة',
  needs_service: 'تحتاج صيانة',
  retired: 'متقاعدة',
}

const TYPE_LABELS: Record<string, string> = {
  ABC: 'ABC - مسحوق',
  CO2: 'ثاني أكسيد الكربون',
  foam: 'رغوة',
  water: 'ماء',
  other: 'أخرى',
}

export function exportInspectionsToExcel(inspections: Inspection[]) {
  const data = inspections.map((ins) => ({
    'رقم الطفاية': ins.extinguisher?.serial_number ?? '',
    'المنطقة': ins.extinguisher?.area?.name ?? '',
    'الموقع': ins.extinguisher?.area?.location ?? '',
    'تاريخ الفحص': new Date(ins.inspection_date).toLocaleDateString('ar-SA'),
    'المفتش': ins.inspector?.full_name ?? '',
    'الضغط سليم': ins.pressure_ok ? 'نعم' : 'لا',
    'الختم سليم': ins.seal_intact ? 'نعم' : 'لا',
    'البطاقة مقروءة': ins.label_readable ? 'نعم' : 'لا',
    'الدبوس سليم': ins.pin_intact ? 'نعم' : 'لا',
    'لا يوجد تلف': ins.no_damage ? 'نعم' : 'لا',
    'الحالة': STATUS_LABELS[ins.overall_status] ?? ins.overall_status,
    'ملاحظات': ins.notes ?? '',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'فحوصات الطفايات')
  XLSX.writeFile(wb, `فحوصات-طفايات-${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.xlsx`)
}

export function exportExtinguishersToExcel(extinguishers: FireExtinguisher[]) {
  const data = extinguishers.map((ext) => ({
    'الرقم التسلسلي': ext.serial_number,
    'النوع': TYPE_LABELS[ext.type] ?? ext.type,
    'السعة': ext.capacity,
    'المنطقة': ext.area?.name ?? '',
    'الموقع': ext.area?.location ?? '',
    'وصف الموقع': ext.location_description,
    'تاريخ التركيب': ext.installation_date ? new Date(ext.installation_date).toLocaleDateString('ar-SA') : '',
    'تاريخ الصيانة القادمة': ext.next_service_date ? new Date(ext.next_service_date).toLocaleDateString('ar-SA') : '',
    'الحالة': STATUS_LABELS[ext.status] ?? ext.status,
    'ملاحظات': ext.notes ?? '',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'قائمة الطفايات')
  XLSX.writeFile(wb, `قائمة-طفايات-${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.xlsx`)
}

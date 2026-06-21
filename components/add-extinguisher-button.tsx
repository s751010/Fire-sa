'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Area { id: string; name: string }

const TYPES = [
  { value: 'ABC', label: 'ABC - مسحوق جاف' },
  { value: 'CO2', label: 'ثاني أكسيد الكربون' },
  { value: 'foam', label: 'رغوة' },
  { value: 'water', label: 'ماء' },
  { value: 'other', label: 'أخرى' },
]

export function AddExtinguisherButton({
  areas,
  defaultAreaId,
}: {
  areas: Area[]
  defaultAreaId?: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    serial_number: '',
    area_id: defaultAreaId ?? '',
    type: 'ABC',
    capacity: '6kg',
    location_description: '',
    installation_date: '',
    next_service_date: '',
  })

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('fire_extinguishers').insert({
      ...form,
      installation_date: form.installation_date || null,
      next_service_date: form.next_service_date || null,
      status: 'active',
    })

    if (error) {
      toast.error('حدث خطأ أثناء الإضافة: ' + error.message)
      setLoading(false)
      return
    }

    toast.success('تمت إضافة الطفاية')
    setOpen(false)
    setForm({ serial_number: '', area_id: defaultAreaId ?? '', type: 'ABC', capacity: '6kg', location_description: '', installation_date: '', next_service_date: '' })
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-red-600 hover:bg-red-700 gap-2" size="sm">
        <Plus className="w-4 h-4" />
        إضافة طفاية
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900 text-lg">إضافة طفاية جديدة</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label>الرقم التسلسلي</Label>
                <Input
                  placeholder="مثال: FE-001"
                  value={form.serial_number}
                  onChange={(e) => update('serial_number', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label>المنطقة</Label>
                <Select value={form.area_id} onValueChange={(v) => update('area_id', v ?? '')} required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="اختر منطقة" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>النوع</Label>
                  <Select value={form.type} onValueChange={(v) => update('type', v ?? '')}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>السعة</Label>
                  <Input
                    placeholder="6kg"
                    value={form.capacity}
                    onChange={(e) => update('capacity', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>وصف الموقع</Label>
                <Textarea
                  placeholder="مثال: بجانب باب الخروج الرئيسي"
                  value={form.location_description}
                  onChange={(e) => update('location_description', e.target.value)}
                  required
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>تاريخ التركيب</Label>
                  <Input
                    type="date"
                    value={form.installation_date}
                    onChange={(e) => update('installation_date', e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>موعد الصيانة القادمة</Label>
                  <Input
                    type="date"
                    value={form.next_service_date}
                    onChange={(e) => update('next_service_date', e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

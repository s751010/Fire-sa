'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Inspector {
  id: string
  full_name: string
}

export function AddAreaButton({ inspectors }: { inspectors: Inspector[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [inspectorId, setInspectorId] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('areas').insert({
      name,
      location,
      assigned_inspector_id: inspectorId || null,
    })

    if (error) {
      toast.error('حدث خطأ أثناء الإضافة')
      setLoading(false)
      return
    }

    toast.success('تمت إضافة المنطقة')
    setOpen(false)
    setName('')
    setLocation('')
    setInspectorId('')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-red-600 hover:bg-red-700 gap-2"
        size="sm"
      >
        <Plus className="w-4 h-4" />
        إضافة منطقة
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">إضافة منطقة جديدة</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="area-name">اسم المنطقة</Label>
                <Input
                  id="area-name"
                  placeholder="مثال: مبنى A - الطابق الأول"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="area-location">الموقع</Label>
                <Input
                  id="area-location"
                  placeholder="مثال: المكتب الرئيسي"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {inspectors.length > 0 && (
                <div className="space-y-1.5">
                  <Label>المفتش المسؤول</Label>
                  <Select value={inspectorId} onValueChange={(v) => setInspectorId(v ?? '')}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="اختر مفتشاً (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      {inspectors.map((ins) => (
                        <SelectItem key={ins.id} value={ins.id}>
                          {ins.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
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

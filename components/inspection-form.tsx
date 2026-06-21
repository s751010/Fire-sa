'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  CheckCircle,
  XCircle,
  Flame,
  MapPin,
  Calendar,
  Loader2,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

interface CheckItem {
  key: string
  label: string
  description: string
}

const CHECK_ITEMS: CheckItem[] = [
  { key: 'pressure_ok', label: 'الضغط سليم', description: 'مؤشر الضغط في المنطقة الخضراء' },
  { key: 'seal_intact', label: 'الختم سليم', description: 'الختم موجود وغير مكسور' },
  { key: 'label_readable', label: 'البطاقة مقروءة', description: 'التسمية واضحة وغير ممزقة' },
  { key: 'pin_intact', label: 'الدبوس سليم', description: 'دبوس الأمان موجود في مكانه' },
  { key: 'no_damage', label: 'لا يوجد تلف', description: 'لا خدوش أو صدأ أو تلف ظاهري' },
]

interface FireExtinguisher {
  id: string
  serial_number: string
  type: string
  capacity: string
  location_description: string
  status: string
  area?: { name: string; location: string }
}

export function InspectionForm({
  extinguisher,
  lastInspection,
  inspectorId,
}: {
  extinguisher: FireExtinguisher
  lastInspection: { inspection_date: string; overall_status: string; inspector?: { full_name: string } } | null
  inspectorId: string
}) {
  const router = useRouter()
  const supabase = createClient()

  const [checks, setChecks] = useState<Record<string, boolean | null>>({
    pressure_ok: null,
    seal_intact: null,
    label_readable: null,
    pin_intact: null,
    no_damage: null,
  })
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const allAnswered = Object.values(checks).every((v) => v !== null)
  const allPassed = Object.values(checks).every((v) => v === true)
  const anyFailed = Object.values(checks).some((v) => v === false)

  const overallStatus = allPassed
    ? 'passed'
    : anyFailed
    ? 'failed'
    : 'needs_attention'

  function toggleCheck(key: string, value: boolean) {
    setChecks((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }))
  }

  async function handleSubmit() {
    if (!allAnswered) {
      toast.error('يرجى الإجابة على جميع البنود')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('inspections').insert({
      extinguisher_id: extinguisher.id,
      inspector_id: inspectorId,
      inspection_date: new Date().toISOString(),
      ...checks,
      overall_status: overallStatus,
      notes: notes || null,
    })

    if (error) {
      toast.error('حدث خطأ أثناء الحفظ')
      setLoading(false)
      return
    }

    // Update extinguisher status if needed
    if (overallStatus !== 'passed') {
      await supabase
        .from('fire_extinguishers')
        .update({ status: 'needs_service' })
        .eq('id', extinguisher.id)
    } else {
      await supabase
        .from('fire_extinguishers')
        .update({ status: 'active' })
        .eq('id', extinguisher.id)
    }

    toast.success('تم حفظ نتيجة الفحص بنجاح ✓')
    router.push('/extinguishers')
    router.refresh()
  }

  const typeLabel: Record<string, string> = {
    ABC: 'ABC مسحوق',
    CO2: 'CO₂',
    foam: 'رغوة',
    water: 'ماء',
    other: 'أخرى',
  }

  const resultConfig = {
    passed: { label: 'سليمة', color: 'bg-green-500', icon: CheckCircle },
    failed: { label: 'فاشلة', color: 'bg-red-500', icon: XCircle },
    needs_attention: { label: 'تحتاج اهتمام', color: 'bg-yellow-500', icon: AlertTriangle },
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">فحص طفاية #{extinguisher.serial_number}</h1>
          <p className="text-sm text-gray-500">
            {typeLabel[extinguisher.type] ?? extinguisher.type} • {extinguisher.capacity}
          </p>
        </div>
      </div>

      {/* Extinguisher info card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">#{extinguisher.serial_number}</p>
            <p className="text-sm text-gray-500">{extinguisher.location_description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{extinguisher.area?.name} - {extinguisher.area?.location}</span>
        </div>

        {lastInspection && (
          <div className="flex items-center gap-2 text-sm text-gray-500 pt-1 border-t border-gray-100">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              آخر فحص:{' '}
              {new Date(lastInspection.inspection_date).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Check items */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">بنود الفحص</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {CHECK_ITEMS.map((item) => (
            <div key={item.key} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleCheck(item.key, true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      checks[item.key] === true
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    نعم
                  </button>
                  <button
                    onClick={() => toggleCheck(item.key, false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      checks[item.key] === false
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    لا
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result preview */}
      {allAnswered && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl text-white ${resultConfig[overallStatus].color}`}
        >
          {(() => {
            const Icon = resultConfig[overallStatus].icon
            return <Icon className="w-6 h-6 shrink-0" />
          })()}
          <div>
            <p className="font-semibold">النتيجة: {resultConfig[overallStatus].label}</p>
            <p className="text-sm opacity-90">
              {overallStatus === 'passed'
                ? 'جميع البنود سليمة'
                : overallStatus === 'failed'
                ? 'توجد مشاكل تحتاج إصلاح فوري'
                : 'توجد ملاحظات تحتاج متابعة'}
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <Label className="font-semibold text-gray-900">ملاحظات إضافية</Label>
        <Textarea
          placeholder="أي ملاحظات إضافية عن الطفاية..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={loading || !allAnswered}
        className="w-full h-14 text-base bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-2xl"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-5 h-5 ms-2" />
            حفظ نتيجة الفحص
          </>
        )}
      </Button>
    </div>
  )
}

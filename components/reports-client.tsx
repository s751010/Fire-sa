'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { exportInspectionsToExcel, exportExtinguishersToExcel } from '@/lib/excel-export'
import { Download, FileSpreadsheet, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import type { Inspection, FireExtinguisher } from '@/types/database'

const STATUS_LABEL: Record<string, string> = {
  passed: 'سليمة',
  failed: 'فاشلة',
  needs_attention: 'تحتاج اهتمام',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  passed: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  needs_attention: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
}

const STATUS_COLOR: Record<string, string> = {
  passed: 'bg-green-50 text-green-800 border border-green-100',
  failed: 'bg-red-50 text-red-800 border border-red-100',
  needs_attention: 'bg-yellow-50 text-yellow-800 border border-yellow-100',
}

export function ReportsClient({
  inspections,
  extinguishers,
  isAdmin,
}: {
  inspections: Inspection[]
  extinguishers: FireExtinguisher[]
  isAdmin: boolean
}) {
  const [activeTab, setActiveTab] = useState('inspections')

  const passedCount = inspections.filter((i) => i.overall_status === 'passed').length
  const failedCount = inspections.filter((i) => i.overall_status === 'failed').length
  const attentionCount = inspections.filter((i) => i.overall_status === 'needs_attention').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
          <p className="text-sm text-gray-500 mt-0.5">سجل الفحوصات والبيانات</p>
        </div>
        <Button
          onClick={() =>
            activeTab === 'inspections'
              ? exportInspectionsToExcel(inspections)
              : exportExtinguishersToExcel(extinguishers)
          }
          variant="outline"
          size="sm"
          className="gap-2 border-green-600 text-green-700 hover:bg-green-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Excel
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
          <p className="text-2xl font-bold text-green-700">{passedCount}</p>
          <p className="text-xs text-green-600 mt-0.5">سليمة</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
          <p className="text-2xl font-bold text-yellow-700">{attentionCount}</p>
          <p className="text-xs text-yellow-600 mt-0.5">تحتاج اهتمام</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
          <p className="text-2xl font-bold text-red-700">{failedCount}</p>
          <p className="text-xs text-red-600 mt-0.5">فاشلة</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="inspections" className="flex-1">
            الفحوصات ({inspections.length})
          </TabsTrigger>
          <TabsTrigger value="extinguishers" className="flex-1">
            الطفايات ({extinguishers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-3 mt-4">
          {inspections.length > 0 ? (
            inspections.map((ins: any) => (
              <div
                key={ins.id}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      طفاية #{ins.extinguisher?.serial_number}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ins.extinguisher?.area?.name}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLOR[ins.overall_status] ?? ''}`}
                  >
                    {STATUS_ICON[ins.overall_status]}
                    {STATUS_LABEL[ins.overall_status] ?? ins.overall_status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    ['الضغط', ins.pressure_ok],
                    ['الختم', ins.seal_intact],
                    ['البطاقة', ins.label_readable],
                    ['الدبوس', ins.pin_intact],
                    ['لا تلف', ins.no_damage],
                  ].map(([label, ok]) => (
                    <span
                      key={label as string}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {ok ? '✓' : '✗'} {label}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{ins.inspector?.full_name}</span>
                  <span>
                    {new Date(ins.inspection_date).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {ins.notes && (
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">{ins.notes}</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>لا توجد فحوصات مسجلة</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="extinguishers" className="space-y-3 mt-4">
          {extinguishers.length > 0 ? (
            extinguishers.map((ext: any) => (
              <div
                key={ext.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">#{ext.serial_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{ext.location_description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ext.area?.name}</p>
                  </div>
                  <div className="text-left shrink-0">
                    {ext.next_service_date && (
                      <p
                        className={`text-xs font-medium ${
                          new Date(ext.next_service_date) < new Date()
                            ? 'text-red-500'
                            : 'text-gray-500'
                        }`}
                      >
                        صيانة:{' '}
                        {new Date(ext.next_service_date).toLocaleDateString('ar-SA', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>لا توجد طفايات</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

import React, { useState } from 'react';
import {
  Calculator,
  Printer,
  X,
  CheckCircle,
  AlertTriangle,
  Receipt,
  DollarSign,
  Users,
  FlaskConical,
  Activity,
  Layers,
  FileText,
  Calendar,
  Clock,
  Building,
} from 'lucide-react';
import { Visit, Expense, ShiftSettlementRecord, LabSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  visits: Visit[];
  expenses: Expense[];
  settings: LabSettings;
  selectedDate: string;
  onSaveSettlement: (record: ShiftSettlementRecord) => void;
}

export const ShiftSettlementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  visits,
  expenses,
  settings,
  selectedDate,
  onSaveSettlement,
}) => {
  const [shiftType, setShiftType] = useState<'morning' | 'evening' | 'full_day'>('full_day');
  const [cashierName, setCashierName] = useState('أحمد سعيد - موظف الاستقبال');
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'settlement' | 'receipt_print'>('settlement');

  if (!isOpen) return null;

  // Filter visits and expenses for the selected date
  const dayVisits = visits.filter((v) => v.date === selectedDate);
  const dayExpenses = expenses.filter((e) => e.date === selectedDate);

  // Totals calculations
  const totalPatients = dayVisits.length;
  
  let totalLabTests = 0;
  let totalRadiologyScans = 0;
  const labTypeMap: Record<string, number> = {};
  const radTypeMap: Record<string, number> = {};

  dayVisits.forEach((v) => {
    v.tests.forEach((t) => {
      if (t.type === 'radiology' || t.testCode.startsWith('RAD-')) {
        totalRadiologyScans += 1;
        const radName = t.testNameAr.split('(')[0].trim();
        radTypeMap[radName] = (radTypeMap[radName] || 0) + 1;
      } else {
        totalLabTests += 1;
        const labName = t.testNameAr.split('(')[0].trim();
        labTypeMap[labName] = (labTypeMap[labName] || 0) + 1;
      }
    });
  });

  const grossSales = dayVisits.reduce((acc, v) => acc + (v.totalPrice || 0), 0);
  const totalDiscounts = dayVisits.reduce((acc, v) => acc + (v.discountAmount || 0), 0);
  const netSales = dayVisits.reduce((acc, v) => acc + (v.finalPrice || 0), 0);

  // Collections by method
  const cashCollected = dayVisits
    .filter((v) => v.paymentMethod === 'cash')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  const cardCollected = dayVisits
    .filter((v) => v.paymentMethod === 'card')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  const vodafoneCollected = dayVisits
    .filter((v) => v.paymentMethod === 'vodafone_cash' || v.paymentMethod === 'transfer')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  const totalCollected = cashCollected + cardCollected + vodafoneCollected;
  const totalRemaining = dayVisits.reduce((acc, v) => acc + (v.remainingAmount || 0), 0);
  const totalDayExpenses = dayExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Expected Cash in Drawer = Cash Collected - Cash Expenses
  const expectedCashInDrawer = Math.max(0, cashCollected - totalDayExpenses);

  const actualCash = actualCashInput === '' ? expectedCashInDrawer : parseFloat(actualCashInput) || 0;
  const diff = actualCash - expectedCashInDrawer;
  const settlementStatus: 'balanced' | 'surplus' | 'shortage' =
    diff === 0 ? 'balanced' : diff > 0 ? 'surplus' : 'shortage';

  const handleSaveAndPrint = () => {
    const record: ShiftSettlementRecord = {
      id: `set-${Date.now()}`,
      date: selectedDate,
      shiftName: shiftType,
      shiftNameAr: shiftType === 'morning' ? 'وردية صباحية' : shiftType === 'evening' ? 'وردية مسائية' : 'تقفيل اليوم كاملاً',
      closedBy: cashierName,
      closedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      totalPatientsCount: totalPatients,
      totalLabTestsCount: totalLabTests,
      totalRadiologyCount: totalRadiologyScans,
      radiologyBreakdown: radTypeMap,
      labBreakdown: labTypeMap,
      totalSales: grossSales,
      totalDiscounts,
      netRevenue: netSales,
      cashCollected,
      cardCollected,
      vodafoneCollected,
      remainingReceivable: totalRemaining,
      totalExpenses: totalDayExpenses,
      actualCashInDrawer: actualCash,
      differenceAmount: diff,
      status: settlementStatus,
      notes,
    };

    onSaveSettlement(record);
    setIsSaved(true);
    setActiveTab('receipt_print');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden text-right flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>تقفيل اليومية والوردية (Shift & Daily Settlement)</span>
                <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-800">
                  {selectedDate}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                حساب عدد العملاء، التحاليل والأشعة، صافي الدرج، والمصروفات، وطباعة إيصال التقفيل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('settlement')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors ${
                  activeTab === 'settlement' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                بيانات التقفيل
              </button>
              <button
                onClick={() => setActiveTab('receipt_print')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1 ${
                  activeTab === 'receipt_print' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>إيصال الاستلام</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs print:p-2 print:overflow-visible">
          {activeTab === 'settlement' ? (
            <div className="space-y-6">
              {/* Shift Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نوع الوردية:</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-xs"
                  >
                    <option value="full_day">إغلاق اليوم كاملاً (Full Day)</option>
                    <option value="morning">وردية صباحية (Morning Shift)</option>
                    <option value="evening">وردية مسائية (Evening Shift)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المسؤول عن تقفيل الوردية:</label>
                  <input
                    type="text"
                    value={cashierName}
                    onChange={(e) => setCashierName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">تاريخ اليومية المحسوبة:</label>
                  <div className="px-3 py-2 bg-slate-200 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800">
                    {selectedDate}
                  </div>
                </div>
              </div>

              {/* Counts & Activity Grid: كام أشعة وكام تحليل */}
              <div>
                <h4 className="font-black text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>إحصائيات الفحوصات المنفذة اليوم ({selectedDate}):</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Patients Count */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Users className="w-3.5 h-3.5 text-slate-600" />
                      <span>إجمالي عدد المرضى:</span>
                    </span>
                    <div className="text-xl font-black font-mono text-slate-900">
                      {totalPatients} <span className="text-xs font-sans font-normal text-slate-500">مريض</span>
                    </div>
                  </div>

                  {/* Lab Tests Count */}
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-1">
                    <span className="text-emerald-800 font-bold flex items-center gap-1.5 text-[11px]">
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                      <span>عدد التحاليل المخبرية:</span>
                    </span>
                    <div className="text-xl font-black font-mono text-emerald-900">
                      {totalLabTests} <span className="text-xs font-sans font-normal text-emerald-700">تحليل</span>
                    </div>
                  </div>

                  {/* Radiology Scans Count */}
                  <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-1">
                    <span className="text-blue-800 font-bold flex items-center gap-1.5 text-[11px]">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>عدد فحوصات الأشعة:</span>
                    </span>
                    <div className="text-xl font-black font-mono text-blue-900">
                      {totalRadiologyScans} <span className="text-xs font-sans font-normal text-blue-700">فحص أشعة</span>
                    </div>
                  </div>

                  {/* Total Procedures */}
                  <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 space-y-1">
                    <span className="text-purple-800 font-bold flex items-center gap-1.5 text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>إجمالي الفحوصات:</span>
                    </span>
                    <div className="text-xl font-black font-mono text-purple-900">
                      {totalLabTests + totalRadiologyScans} <span className="text-xs font-sans font-normal text-purple-700">إجمالي</span>
                    </div>
                  </div>
                </div>

                {/* Sub-breakdown for Radiology and Labs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 block text-xs border-b border-slate-100 pb-1">
                      تفصيل أنواع الأشعة والسونار اليوم:
                    </span>
                    {Object.keys(radTypeMap).length === 0 ? (
                      <span className="text-slate-400 text-[11px]">لم تسجل أي أشعة اليوم</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(radTypeMap).map(([name, count]) => (
                          <span key={name} className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-semibold">
                            {name}: <strong className="font-mono">{count}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 block text-xs border-b border-slate-100 pb-1">
                      أبرز التحاليل المخبرية اليوم:
                    </span>
                    {Object.keys(labTypeMap).length === 0 ? (
                      <span className="text-slate-400 text-[11px]">لم تسجل أي تحاليل اليوم</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(labTypeMap).slice(0, 6).map(([name, count]) => (
                          <span key={name} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-semibold">
                            {name}: <strong className="font-mono">{count}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Breakdown: مبالغ اليوم والمصروفات والدرج */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="font-black text-sm text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>تحليل المبالغ المحصلة والمصروفات والدرج (Cash Drawer Settlement):</span>
                  </span>
                  <span className="font-mono text-xs text-slate-500">عملة: {settings.currency}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 block">إجمالي المبيعات:</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{grossSales.toFixed(2)} ج</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 block">إجمالي الخصومات:</span>
                    <span className="font-mono font-bold text-rose-600 text-sm">-{totalDiscounts.toFixed(2)} ج</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 block">المتبقي (آجل / ديون):</span>
                    <span className="font-mono font-bold text-amber-700 text-sm">{totalRemaining.toFixed(2)} ج</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 block">مصروفات اليوم:</span>
                    <span className="font-mono font-bold text-rose-700 text-sm">-{totalDayExpenses.toFixed(2)} ج</span>
                  </div>
                </div>

                {/* Collections Breakdown by Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl space-y-1">
                    <span className="text-emerald-950 font-bold block text-xs">نقدية محصلة (Cash):</span>
                    <div className="font-mono font-black text-emerald-900 text-lg">{cashCollected.toFixed(2)} ج</div>
                    <span className="text-[10px] text-emerald-700">الكاش المسلم باليد للاستقبال</span>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                    <span className="text-blue-950 font-bold block text-xs">بطاقات بنكية (Visa/Card):</span>
                    <div className="font-mono font-black text-blue-900 text-lg">{cardCollected.toFixed(2)} ج</div>
                    <span className="text-[10px] text-blue-700">مباشرة في الحساب البنكي POS</span>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                    <span className="text-purple-950 font-bold block text-xs">محافظ إلكترونية (Vodafone Cash):</span>
                    <div className="font-mono font-black text-purple-900 text-lg">{vodafoneCollected.toFixed(2)} ج</div>
                    <span className="text-[10px] text-purple-700">تحويلات إلكترونية مباشرة</span>
                  </div>
                </div>

                {/* Cash in Drawer vs Actual Input */}
                <div className="p-4 bg-white border-2 border-emerald-600 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">
                        الصافي المفترض تواجده نقدياً في الدرج (الكاش المحصل - المصروفات):
                      </span>
                      <div className="text-2xl font-black font-mono text-emerald-800 mt-0.5">
                        {expectedCashInDrawer.toFixed(2)} {settings.currency}
                      </div>
                    </div>

                    <div className="space-y-1 sm:text-left">
                      <label className="text-xs font-black text-slate-900 block">
                        المبلغ الفعلي الموجود بالدرج حالياً:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={actualCashInput}
                          onChange={(e) => setActualCashInput(e.target.value)}
                          placeholder={expectedCashInDrawer.toString()}
                          className="w-36 px-3 py-1.5 bg-slate-50 border-2 border-emerald-500 rounded-lg font-mono font-black text-base text-slate-900 text-center"
                          dir="ltr"
                        />
                        <span className="font-bold text-xs text-slate-600">ج.م</span>
                      </div>
                    </div>
                  </div>

                  {/* Difference Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settlementStatus === 'balanced' ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-xs flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>الدرج متزن 100% (بدون عجز أو زيادة)</span>
                        </span>
                      ) : settlementStatus === 'surplus' ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full font-bold text-xs flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                          <span>يوجد زيادة في الدرج بمقدار: +{diff.toFixed(2)} ج.م</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-rose-100 text-rose-900 rounded-full font-bold text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>تنبيه: يوجد عجز في الدرج بمقدار: {diff.toFixed(2)} ج.م</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      إجمالي نقدية + فيزا + فودافون = {totalCollected.toFixed(2)} ج
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ملاحظات تسليم الوردية وإغلاق اليومية:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات خاصة باستلام الوردية أو تسليم الفلوس للإدارة..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-400">
                  سيتم حفظ التقفيل في الأرشيف المالي وطباعة إيصال استلام رسمي
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveAndPrint}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>تأكيد إغلاق الوردية واليومية وطباعة الإيصال</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Printable Shift Handover Receipt View */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 print:hidden">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>تم حفظ تقفيل الوردية واليومية بنجاح! جاهز للطباعة:</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة إيصال التقفيل الآن</span>
                </button>
              </div>

              {/* Printable Receipt Area (Designed for standard 80mm thermal or A4) */}
              <div className="bg-white p-6 max-w-md mx-auto border-2 border-slate-300 rounded-xl font-mono text-xs space-y-4 shadow-sm print:border-none print:shadow-none print:max-w-none print:p-2">
                <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                  <h2 className="text-base font-black font-sans">{settings.labNameAr}</h2>
                  <p className="text-[10px] text-slate-500 font-sans">{settings.branchName}</p>
                  <div className="text-xs font-bold font-sans bg-slate-900 text-white py-1 px-2 rounded inline-block mt-1">
                    محضر تقفيل وردية ويومية المعمل والأشعة
                  </div>
                  <div className="text-[10px] text-slate-600 pt-1">
                    التاريخ: {selectedDate} · الوقت: {new Date().toLocaleTimeString('ar-EG')}
                  </div>
                </div>

                <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">نوع الوردية:</span>
                    <strong className="font-sans">{shiftType === 'morning' ? 'صباحية' : shiftType === 'evening' ? 'مسائية' : 'يوم كامل'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">موظف التقفيل:</span>
                    <strong className="font-sans">{cashierName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">إجمالي المرضى:</span>
                    <strong>{totalPatients} عميل</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">عدد التحاليل المخبرية:</span>
                    <strong>{totalLabTests} تحليل</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">عدد فحوصات الأشعة:</span>
                    <strong>{totalRadiologyScans} فحص</strong>
                  </div>
                </div>

                {/* Money breakdown */}
                <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">إجمالي المبيعات:</span>
                    <span>{grossSales.toFixed(2)} ج</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">الخصومات:</span>
                    <span>-{totalDiscounts.toFixed(2)} ج</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="font-sans text-slate-800">صافي المبيعات:</span>
                    <span>{netSales.toFixed(2)} ج</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">المحصل كاش (نقدية):</span>
                    <span className="font-bold">{cashCollected.toFixed(2)} ج</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">المحصل فيزا وبطاقات:</span>
                    <span>{cardCollected.toFixed(2)} ج</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">محافظ إلكترونية:</span>
                    <span>{vodafoneCollected.toFixed(2)} ج</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span className="font-sans">مصروفات المعمل من الدرج:</span>
                    <span>-{totalDayExpenses.toFixed(2)} ج</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span className="font-sans">المتبقي طرف المرضى (آجل):</span>
                    <span>{totalRemaining.toFixed(2)} ج</span>
                  </div>
                </div>

                {/* Final Cash in Drawer */}
                <div className="p-3 bg-slate-100 rounded-lg space-y-1 border border-slate-300 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="font-sans text-slate-800">الصافي المفترض بالدرج:</span>
                    <span className="text-emerald-800 font-bold">{expectedCashInDrawer.toFixed(2)} ج</span>
                  </div>
                  <div className="flex justify-between font-black text-sm">
                    <span className="font-sans text-slate-900">الكاش الفعلي المسلم:</span>
                    <span className="text-emerald-900">{actualCash.toFixed(2)} ج</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200">
                    <span className="font-sans">حالة العجز / الزيادة:</span>
                    <strong className={diff === 0 ? 'text-emerald-700 font-sans' : diff > 0 ? 'text-blue-700' : 'text-rose-700'}>
                      {diff === 0 ? 'متزن تماماً (0.00)' : diff > 0 ? `+${diff.toFixed(2)} ج (زيادة)` : `${diff.toFixed(2)} ج (عجز)`}
                    </strong>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-4 grid grid-cols-2 gap-4 text-center font-sans text-[10px] text-slate-700">
                  <div className="border-t border-slate-400 pt-1">
                    <div>توقيع مُسلم الوردية</div>
                    <div className="font-bold mt-3">({cashierName.split('-')[0]})</div>
                  </div>
                  <div className="border-t border-slate-400 pt-1">
                    <div>توقيع مُستلم الخزينة / الإدارة</div>
                    <div className="font-bold mt-3">(........................)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

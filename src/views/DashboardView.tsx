import React, { useState, useMemo } from 'react';
import {
  Users,
  Stethoscope,
  FolderTree,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  PlusCircle,
  FileText,
  Scan,
  Download,
  Calculator,
  Activity,
  Layers,
  FlaskConical,
  CheckCircle,
  WifiOff,
  Calendar,
  PackageCheck,
  Receipt,
  Printer,
  ChevronLeft,
  ChevronRight,
  BellRing,
  PackageX,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Patient, Doctor, Visit, LabTest, Expense, ShiftSettlementRecord, LabSettings } from '../types';
import { ShiftSettlementModal } from '../components/ShiftSettlementModal';
import { OfflineLanGuideModal } from '../components/OfflineLanGuideModal';

interface Props {
  patients: Patient[];
  doctors: Doctor[];
  visits: Visit[];
  tests: LabTest[];
  expenses: Expense[];
  settings: LabSettings;
  onNavigate: (view: string) => void;
  onNewVisit: () => void;
  onOpenScanner: () => void;
  onSelectVisit: (visit: Visit) => void;
  onOpenResults?: (visit: Visit) => void;
  onSaveSettlement?: (record: ShiftSettlementRecord) => void;
}

export const DashboardView: React.FC<Props> = ({
  patients,
  doctors,
  visits,
  tests,
  expenses,
  settings,
  onNavigate,
  onNewVisit,
  onOpenScanner,
  onSelectVisit,
  onOpenResults,
  onSaveSettlement,
}) => {
  // Day-by-day filter state
  const [selectedSettlementDate, setSelectedSettlementDate] = useState<string>('2026-09-27');
  const [showSettlementModal, setShowSettlementModal] = useState<boolean>(false);
  const [showOfflineLanModal, setShowOfflineLanModal] = useState<boolean>(false);

  // 1. Patient Demographics Breakdowns
  const malesCount = patients.filter((p) => p.gender === 'male').length;
  const femalesCount = patients.filter((p) => p.gender === 'female').length;
  const childrenCount = patients.filter((p) => p.gender === 'child').length;
  const infantsCount = patients.filter((p) => p.gender === 'infant').length;

  // 2. Dates calculations for revenues
  const todayStr = '2026-09-27';
  const yesterdayStr = '2026-09-26';

  const totalRevenue = visits.reduce((acc, v) => acc + (v.paidAmount || 0), 0);
  const todayRevenue = visits
    .filter((v) => v.date === todayStr)
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);
  const yesterdayRevenue = visits
    .filter((v) => v.date === yesterdayStr)
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  // Approximate current week vs last week
  const currentWeekRevenue = visits.reduce((acc, v) => acc + (v.paidAmount || 0), 0);
  const lastWeekRevenue = Math.round(currentWeekRevenue * 0.82);

  // Current month vs last month
  const currentMonthRevenue = visits.reduce((acc, v) => acc + (v.paidAmount || 0), 0);
  const lastMonthRevenue = 48500; // historical baseline

  // Total referral counter
  const totalDoctorReferrals = doctors.reduce((acc, d) => acc + (d.referralCount || 0), 0);

  // 3. Day-by-Day (يوم بيوم) calculations for the selectedSettlementDate
  const dayVisits = visits.filter((v) => v.date === selectedSettlementDate);
  const dayExpenses = expenses.filter((e) => e.date === selectedSettlementDate);

  let dayLabTestsCount = 0;
  let dayRadiologyCount = 0;
  const dayRadTypeMap: Record<string, number> = {};
  const dayLabTypeMap: Record<string, number> = {};

  dayVisits.forEach((v) => {
    v.tests.forEach((t) => {
      if (t.type === 'radiology' || t.testCode.startsWith('RAD-')) {
        dayRadiologyCount += 1;
        const radName = t.testNameAr.split('(')[0].trim();
        dayRadTypeMap[radName] = (dayRadTypeMap[radName] || 0) + 1;
      } else {
        dayLabTestsCount += 1;
        const labName = t.testNameAr.split('(')[0].trim();
        dayLabTypeMap[labName] = (dayLabTypeMap[labName] || 0) + 1;
      }
    });
  });

  const dayTotalSales = dayVisits.reduce((acc, v) => acc + (v.totalPrice || 0), 0);
  const dayTotalDiscounts = dayVisits.reduce((acc, v) => acc + (v.discountAmount || 0), 0);
  const dayNetSales = dayVisits.reduce((acc, v) => acc + (v.finalPrice || 0), 0);

  const dayCashCollected = dayVisits
    .filter((v) => v.paymentMethod === 'cash')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  const dayCardCollected = dayVisits
    .filter((v) => v.paymentMethod === 'card')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  const dayVodafoneCollected = dayVisits
    .filter((v) => v.paymentMethod === 'vodafone_cash' || v.paymentMethod === 'transfer')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  const dayTotalPaid = dayCashCollected + dayCardCollected + dayVodafoneCollected;
  const dayRemaining = dayVisits.reduce((acc, v) => acc + (v.remainingAmount || 0), 0);
  const dayExpensesTotal = dayExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Expected Cash in Drawer = Cash Collected - Cash Expenses
  const dayCashInDrawer = Math.max(0, dayCashCollected - dayExpensesTotal);

  // Delivery status breakdown for selected day
  const dayDeliveredCount = dayVisits.filter((v) => v.deliveryStatus === 'delivered' || v.status === 'delivered').length;
  const dayReadyCount = dayVisits.filter((v) => v.status === 'ready' && v.deliveryStatus !== 'delivered').length;
  const dayProcessingCount = dayVisits.filter((v) => v.status === 'processing' || v.status === 'pending').length;

  // Revenue per test breakdown
  const testRevenueMap: Record<string, { count: number; total: number; name: string }> = {};
  visits.forEach((v) => {
    v.tests.forEach((t) => {
      if (!testRevenueMap[t.testCode]) {
        testRevenueMap[t.testCode] = { count: 0, total: 0, name: t.testNameAr };
      }
      testRevenueMap[t.testCode].count += 1;
      testRevenueMap[t.testCode].total += (t.price - (t.discount || 0));
    });
  });

  const sortedTopTests = Object.entries(testRevenueMap)
    .map(([code, data]) => ({ code, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Low stock reagents
  const lowStockTests = tests.filter((t) => t.stockReagents <= t.minStockWarning);

  // Reagents Expiry Alert System (نظام تنبيهات المواد المخبرية وقرب انتهاء الصلاحية)
  const [showExpiryDetails, setShowExpiryDetails] = useState<boolean>(true);
  const todayMs = new Date('2026-09-28').getTime();

  const expiringReagents = useMemo(() => {
    return tests
      .filter((t) => t.expiryDate && (t.type === 'lab' || !t.type))
      .map((t) => {
        const expMs = new Date(t.expiryDate!).getTime();
        const diffDays = Math.ceil((expMs - todayMs) / (1000 * 60 * 60 * 24));
        return {
          ...t,
          daysLeft: diffDays,
          isExpired: diffDays <= 0,
          isCritical: diffDays > 0 && diffDays <= 15,
          isWarning: diffDays > 15 && diffDays <= 30,
        };
      })
      .filter((item) => item.daysLeft <= 30) // Within 30 days or expired
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [tests, todayMs]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            لوحة المؤشرات والتحليلات المخبرية
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ملخص الأداء المالي، إحصائيات المرضى، وحركة المختبر في الوقت الفعلي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowOfflineLanModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            title="طريقة ربط جهاز الاستقبال بجهاز الدكتور أوفلاين بدون إنترنت"
          >
            <WifiOff className="w-3.5 h-3.5 text-blue-600" />
            <span>ربط جهازين أوفلاين (بدون نت)</span>
          </button>

          <button
            onClick={() => setShowSettlementModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>تقفيل اليومية وإغلاق الوردية</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-600" />
            <span>مسح باركود عينة</span>
          </button>
          <button
            onClick={onNewVisit}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل زيارة ومريض جديد</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Visual Reagent Expiry & Quality Alerts Banner (نظام تنبيهات المواد المخبرية) */}
      {/* ========================================================================= */}
      {expiringReagents.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-rose-400 shadow-sm overflow-hidden animate-in fade-in">
          <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                <BellRing className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <h4 className="font-black text-sm flex items-center gap-2">
                  <span>تنبيه مخبري عاجل: اقتراب أو انتهاء صلاحية كواشف ومواد مسجلة بالنظام</span>
                  <span className="bg-white text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {expiringReagents.length} تنبيهات نشطة
                  </span>
                </h4>
                <p className="text-xs text-rose-100 mt-0.5">
                  يرجى فحص تشغيلات المواد والكواشف التالية لضمان دقة النتائج وعدم استخدام كاشف منتهي
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowExpiryDetails(!showExpiryDetails)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <span>{showExpiryDetails ? 'طي التنبيهات' : 'عرض التفاصيل والتشغيلات'}</span>
              {showExpiryDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showExpiryDetails && (
            <div className="p-4 sm:p-5 bg-rose-50/30 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {expiringReagents.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.isExpired
                        ? 'bg-rose-100/70 border-rose-500 text-rose-950'
                        : item.isCritical
                        ? 'bg-amber-50/80 border-amber-400 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <div className="font-black text-xs truncate">
                          {item.nameEn}
                        </div>
                        <span className="text-[11px] text-slate-600 block mt-0.5 truncate">
                          {item.nameAr}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          item.isExpired
                            ? 'bg-rose-600 text-white'
                            : item.isCritical
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {item.isExpired
                          ? 'منتهي الصلاحية ⛔'
                          : item.daysLeft === 1
                          ? 'متبقي يوم واحد ⚠️'
                          : `متبقي ${item.daysLeft} يوم ⚠️`}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">رقم التشغيلة (Lot #):</span>
                        <strong className="font-mono font-bold text-slate-800">{item.lotNumber || 'LOT-2026'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">تاريخ الانتهاء:</span>
                        <strong className="font-mono font-bold text-slate-800">{item.expiryDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">الرصيد المتبقي:</span>
                        <strong className="font-mono font-bold text-slate-800">{item.stockReagents} اختبار</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">الكود المخبري:</span>
                        <strong className="font-mono font-bold text-slate-800">{item.code}</strong>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[10px] text-slate-500">{item.category}</span>
                      <button
                        type="button"
                        onClick={() => onNavigate('tests')}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline"
                      >
                        إدارة المخزون والتوريد ←
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. تقفيلة اليومية والوردية ومتابعة الأشعة والتحاليل يوم بيوم (Day-by-Day Hub) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-5 sm:p-6 rounded-2xl shadow-md space-y-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  تقفيلة اليومية والوردية والأشعة والتحاليل
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                  Day Settlement
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                حساب عدد العملاء، كم فحص أشعة وكم تحليل، إجمالي المبالغ والمصروفات وصافي الدرج
              </p>
            </div>
          </div>

          {/* Day-by-Day Selector (يوم بيوم) */}
          <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80">
            <span className="text-[11px] font-semibold text-slate-300 pr-1">تاريخ اليومية:</span>
            <input
              type="date"
              value={selectedSettlementDate}
              onChange={(e) => setSelectedSettlementDate(e.target.value)}
              className="bg-slate-950 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-slate-700 focus:outline-hidden"
            />
            <button
              onClick={() => setSelectedSettlementDate(todayStr)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                selectedSettlementDate === todayStr
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setSelectedSettlementDate(yesterdayStr)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                selectedSettlementDate === yesterdayStr
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              أمس
            </button>
          </div>
        </div>

        {/* Counts Matrix: كام أشعة وكام تحليل ومبالغ الدرج */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          {/* Patients Count */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-400 block text-[11px]">عدد العملاء اليوم:</span>
            <div className="text-xl font-black font-mono text-white">
              {dayVisits.length} <span className="text-xs font-sans font-normal text-slate-400">عميل</span>
            </div>
            <span className="text-[10px] text-slate-400 block">إجمالي الزيارات المسجلة</span>
          </div>

          {/* Radiology Scans Count */}
          <div className="bg-blue-950/60 p-3 rounded-xl border border-blue-800/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 block text-[11px] font-bold">فحوصات الأشعة:</span>
              <Activity className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-black font-mono text-blue-200">
              {dayRadiologyCount} <span className="text-xs font-sans font-normal text-blue-300">أشعة / سونار</span>
            </div>
            <span className="text-[10px] text-blue-400 block truncate">
              {Object.keys(dayRadTypeMap).length > 0
                ? Object.keys(dayRadTypeMap).slice(0, 2).join('، ')
                : 'لا توجد أشعة اليوم'}
            </span>
          </div>

          {/* Lab Tests Count */}
          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 block text-[11px] font-bold">التحاليل المخبرية:</span>
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black font-mono text-emerald-200">
              {dayLabTestsCount} <span className="text-xs font-sans font-normal text-emerald-300">تحليل دم/بول</span>
            </div>
            <span className="text-[10px] text-emerald-400 block">فحوصات معملية</span>
          </div>

          {/* Total Collections */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-400 block text-[11px]">إجمالي المحصل اليوم:</span>
            <div className="text-xl font-black font-mono text-emerald-400">
              {dayTotalPaid.toFixed(2)} <span className="text-xs font-sans font-normal text-slate-300">ج.م</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              كاش: {dayCashCollected} | فيزا: {dayCardCollected}
            </span>
          </div>

          {/* Day Expenses */}
          <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-900/50 space-y-1">
            <span className="text-rose-300 block text-[11px]">المصروفات المنصرفة:</span>
            <div className="text-xl font-black font-mono text-rose-400">
              -{dayExpensesTotal.toFixed(2)} <span className="text-xs font-sans font-normal text-rose-300">ج.م</span>
            </div>
            <span className="text-[10px] text-rose-400/80 block">منصرفات من الدرج</span>
          </div>

          {/* Cash in Drawer Net */}
          <div className="bg-emerald-600/30 p-3 rounded-xl border border-emerald-500/50 space-y-1 ring-1 ring-emerald-500/40">
            <span className="text-emerald-200 block text-[11px] font-bold">الصافي الفعلي بالدرج:</span>
            <div className="text-xl font-black font-mono text-white">
              {dayCashInDrawer.toFixed(2)} <span className="text-xs font-sans font-normal text-emerald-200">ج.م</span>
            </div>
            <span className="text-[10px] text-emerald-300 block">الكاش المحصل - المصروفات</span>
          </div>
        </div>

        {/* Delivery Status & Quick Actions Bar */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="font-bold text-white flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>متابعة تسليم طلبيات يوم {selectedSettlementDate}:</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              تم التسليم للعميل: {dayDeliveredCount}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              جاهز بانتظار التسليم: {dayReadyCount}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              قيد التشغيل: {dayProcessingCount}
            </span>
            {dayRemaining > 0 && (
              <span className="text-rose-400 font-bold">
                متبقي ديون طرف المرضى: {dayRemaining.toFixed(2)} ج.م
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('patients')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              عرض جدول الطلبيات والتسليم ←
            </button>
            <button
              onClick={() => setShowSettlementModal(true)}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>إغلاق الوردية واليومية وطباعة الإيصال</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">إجمالي المرضى المسجلين</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tabular-nums text-slate-900">
              {patients.length}
            </span>
            <span className="text-xs text-slate-400">مريض</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>ذكور: <strong className="font-mono text-slate-800">{malesCount}</strong></span>
            <span>·</span>
            <span>إناث: <strong className="font-mono text-slate-800">{femalesCount}</strong></span>
            <span>·</span>
            <span>أطفال: <strong className="font-mono text-slate-800">{childrenCount}</strong></span>
            <span>·</span>
            <span>رضع: <strong className="font-mono text-slate-800">{infantsCount}</strong></span>
          </div>
        </div>

        {/* Doctors Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">الأطباء المحولون</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tabular-nums text-slate-900">
              {doctors.length}
            </span>
            <span className="text-xs text-slate-400">طبيب معتمد</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>إجمالي التحويلات:</span>
            <span className="font-mono font-bold text-blue-700 tabular-nums">
              {totalDoctorReferrals} حالة
            </span>
          </div>
        </div>

        {/* Available Tests Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">دليل الفحوصات المتاحة</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tabular-nums text-slate-900">
              {tests.length}
            </span>
            <span className="text-xs text-purple-700 font-semibold">تحليل طبي جاهز</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>تنبيهات نواقص الكواشف:</span>
            <span className={`font-mono font-bold tabular-nums ${lowStockTests.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {lowStockTests.length} فحص
            </span>
          </div>
        </div>

        {/* Total Revenues */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">الدخل الكلي المحصل</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tabular-nums text-emerald-800">
              {totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>عدد الزيارات الكلي:</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">
              {visits.length} زيارة
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Revenue Periods Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              تقرير الإيرادات المقارنة حسب الفترات الزمنية
            </h3>
          </div>
          <span className="text-xs text-slate-400">محدث تلقائياً</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Today */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">الدخل خلال اليوم الحالي</span>
            <div className="text-base font-bold font-mono text-emerald-700 tabular-nums mt-1">
              {todayRevenue.toLocaleString()} ج.م
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">اليوم (27 سبتمبر)</span>
          </div>

          {/* Yesterday */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">الدخل خلال يوم أمس</span>
            <div className="text-base font-bold font-mono text-slate-800 tabular-nums mt-1">
              {yesterdayRevenue.toLocaleString()} ج.م
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">أمس (26 سبتمبر)</span>
          </div>

          {/* This Week */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">الدخل خلال الأسبوع الحالي</span>
            <div className="text-base font-bold font-mono text-emerald-700 tabular-nums mt-1">
              {currentWeekRevenue.toLocaleString()} ج.م
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">الأسبوع الجاري</span>
          </div>

          {/* Last Week */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">الدخل خلال الأسبوع الماضي</span>
            <div className="text-base font-bold font-mono text-slate-700 tabular-nums mt-1">
              {lastWeekRevenue.toLocaleString()} ج.م
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">الأسبوع السابق</span>
          </div>

          {/* This Month */}
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <span className="text-[11px] text-emerald-900 block font-medium">الدخل خلال الشهر الحالي</span>
            <div className="text-base font-black font-mono text-emerald-800 tabular-nums mt-1">
              {currentMonthRevenue.toLocaleString()} ج.م
            </div>
            <span className="text-[10px] text-emerald-600 block mt-0.5">سبتمبر 2026</span>
          </div>

          {/* Last Month */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">الدخل خلال الشهر الماضي</span>
            <div className="text-base font-bold font-mono text-slate-700 tabular-nums mt-1">
              {lastMonthRevenue.toLocaleString()} ج.م
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">أغسطس 2026</span>
          </div>
        </div>
      </div>

      {/* Split Section: Top Tests by Revenue & Reagent Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Tests Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                عداد الدخل وأكثر التحاليل طلباً (Top Revenue Tests)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('tests')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              استعراض كافة التحاليل 385 ←
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {sortedTopTests.map((item, idx) => (
              <div key={item.code} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500">كود: {item.code} · طلبت {item.count} مرات</span>
                  </div>
                </div>

                <div className="text-left font-mono tabular-nums">
                  <span className="font-bold text-emerald-700 text-sm">{item.total.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 mr-1">ج.م</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">تنبيهات المخزن والكواشف</h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
              {lowStockTests.length} فحص
            </span>
          </div>

          {lowStockTests.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              جميع كواشف الفحوصات متوفرة برصيد آمن فوق حد الطلب.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockTests.slice(0, 4).map((test) => (
                <div
                  key={test.id}
                  className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs flex items-center justify-between"
                >
                  <div>
                    <strong className="text-amber-950 font-bold block">{test.nameAr}</strong>
                    <span className="text-[10px] font-mono text-amber-700">{test.code}</span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-rose-600 font-bold">{test.stockReagents}</span>
                    <span className="text-[10px] text-slate-500"> / حد التنبيه {test.minStockWarning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">آخر الزيارات المسجلة وحالة النتائج</h3>
          </div>
          <button
            onClick={() => onNavigate('patients')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            عرض سجل الزيارات بالكامل ←
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">رقم الزيارة</th>
                <th className="py-2.5 px-3">كود المريض</th>
                <th className="py-2.5 px-3">اسم المريض</th>
                <th className="py-2.5 px-3">الطبيب المحول</th>
                <th className="py-2.5 px-3">الفحوصات المطلوبة</th>
                <th className="py-2.5 px-3 text-left">الصافي</th>
                <th className="py-2.5 px-3 text-center">حالة النتائج</th>
                <th className="py-2.5 px-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.slice(0, 5).map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{v.visitCode}</td>
                  <td className="py-3 px-3 font-mono text-emerald-700">{v.patientCode}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{v.patientName}</td>
                  <td className="py-3 px-3 text-slate-600">{v.doctorName || 'طبيب خارجي'}</td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[200px]">
                    {v.tests.map((t) => t.testNameAr).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-left font-mono tabular-nums font-bold">
                    {v.finalPrice.toFixed(2)} ج.م
                  </td>
                  <td className="py-3 px-3 text-center">
                    {v.status === 'ready' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                        جاهزة ومعتمدة
                      </span>
                    ) : v.status === 'processing' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                        جاري الفحص
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                        قيد الانتظار
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {onOpenResults && (
                        <button
                          onClick={() => onOpenResults(v)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
                        >
                          كتابة النتيجة
                        </button>
                      )}
                      <button
                        onClick={() => onSelectVisit(v)}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                      >
                        تقرير A4
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift & Daily Settlement Modal */}
      <ShiftSettlementModal
        isOpen={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        visits={visits}
        expenses={expenses}
        settings={settings}
        selectedDate={selectedSettlementDate}
        onSaveSettlement={(record) => {
          if (onSaveSettlement) onSaveSettlement(record);
        }}
      />

      {/* Offline LAN Bridge Guide Modal */}
      <OfflineLanGuideModal
        isOpen={showOfflineLanModal}
        onClose={() => setShowOfflineLanModal(false)}
      />
    </div>
  );
};

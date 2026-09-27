import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Download,
  Filter,
  Receipt,
  FileSpreadsheet,
  Activity,
  FlaskConical,
  Users,
  Clock,
  PieChart,
  CheckCircle,
} from 'lucide-react';
import { Visit, Expense, Employee, AttendanceRecord } from '../types';
import { exportFinancialsToExcel } from '../utils/excel';

interface Props {
  visits: Visit[];
  expenses: Expense[];
  employees?: Employee[];
  attendance?: AttendanceRecord[];
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const FinancialsView: React.FC<Props> = ({
  visits,
  expenses,
  employees = [],
  attendance = [],
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'today' | 'this_month' | 'this_year' | 'all'>('this_month');
  const [financialTab, setFinancialTab] = useState<'overview' | 'sales_analysis' | 'payroll' | 'expenses_list'>('overview');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // New Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('supplies_reagents');
  const [expenseAmount, setExpenseAmount] = useState<number>(100);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('سارة علي (الخزينة)');

  const todayStr = '2026-09-27';
  const currentMonthPrefix = '2026-09';
  const currentYearPrefix = '2026';

  // Filtered visits and expenses based on period
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      if (periodFilter === 'today') return v.date === todayStr;
      if (periodFilter === 'this_month') return v.date.startsWith(currentMonthPrefix);
      if (periodFilter === 'this_year') return v.date.startsWith(currentYearPrefix);
      return true;
    });
  }, [visits, periodFilter]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (periodFilter === 'today') return e.date === todayStr;
      if (periodFilter === 'this_month') return e.date.startsWith(currentMonthPrefix);
      if (periodFilter === 'this_year') return e.date.startsWith(currentYearPrefix);
      return true;
    });
  }, [expenses, periodFilter]);

  // Sales Analytics: Lab Sales vs Radiology Sales
  let labSales = 0;
  let radiologySales = 0;
  let labTestsCount = 0;
  let radiologyScansCount = 0;

  filteredVisits.forEach((v) => {
    v.tests.forEach((t) => {
      const netTestPrice = t.price - (t.discount || 0);
      if (t.type === 'radiology' || t.testCode.startsWith('RAD-')) {
        radiologySales += netTestPrice;
        radiologyScansCount += 1;
      } else {
        labSales += netTestPrice;
        labTestsCount += 1;
      }
    });
  });

  const totalSalesRevenue = labSales + radiologySales;
  const labSalesPercent = totalSalesRevenue > 0 ? Math.round((labSales / totalSalesRevenue) * 100) : 50;
  const radSalesPercent = totalSalesRevenue > 0 ? Math.round((radiologySales / totalSalesRevenue) * 100) : 50;

  // Payment methods breakdown
  const cashRevenues = filteredVisits
    .filter((v) => v.paymentMethod === 'cash')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  const cardRevenues = filteredVisits
    .filter((v) => v.paymentMethod === 'card')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  const vodafoneRevenues = filteredVisits
    .filter((v) => v.paymentMethod === 'vodafone_cash' || v.paymentMethod === 'transfer')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  // Aggregate totals
  const totalRevenues = filteredVisits.reduce((acc, v) => acc + (v.paidAmount || 0), 0);
  const totalPendingBalance = filteredVisits.reduce((acc, v) => acc + (v.remainingAmount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Staff Monthly Salaries calculation
  const payrollData = useMemo(() => {
    return employees.map((emp) => {
      const empAttendance = attendance.filter((a) => {
        if (a.employeeId !== emp.id) return false;
        if (periodFilter === 'today') return a.date === todayStr;
        if (periodFilter === 'this_month') return a.date.startsWith(currentMonthPrefix);
        return true;
      });

      const totalHours = empAttendance.reduce((acc, a) => acc + (a.totalHours || 0), 0);
      const hourlyEarnings = totalHours * emp.hourlyRate;
      const totalEarnedSalary = emp.baseSalary + hourlyEarnings;

      return {
        ...emp,
        attendanceDays: empAttendance.length,
        totalHours: Math.round(totalHours * 10) / 10,
        hourlyEarnings,
        netSalary: totalEarnedSalary,
      };
    });
  }, [employees, attendance, periodFilter]);

  const totalPayroll = payrollData.reduce((acc, emp) => acc + emp.netSalary, 0);
  const netProfit = totalRevenues - totalExpenses;
  const netProfitAfterSalaries = totalRevenues - totalExpenses - totalPayroll;

  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || expenseAmount <= 0) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: new Date().toISOString().split('T')[0],
      paidBy: expensePaidBy.trim(),
      notes: expenseNotes.trim(),
    };

    onSaveExpense(newExpense);
    setIsExpenseModalOpen(false);
    setExpenseTitle('');
    setExpenseAmount(100);
    setExpenseNotes('');
  };

  const handleExport = () => {
    exportFinancialsToExcel(filteredVisits, filteredExpenses);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            المالية، الخزينة، وتقارير الأرباح
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            حساب إجمالي الإيرادات والمصروفات وصافي الربح المحقق يومياً وشهرياً وسنوياً
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Section View Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setFinancialTab('overview')}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors ${
                financialTab === 'overview' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              نظرة عامة والدرج
            </button>
            <button
              onClick={() => setFinancialTab('sales_analysis')}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1 ${
                financialTab === 'sales_analysis' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-blue-600" />
              <span>تحليل كامل للمبيعات (أشعة وتحاليل)</span>
            </button>
            <button
              onClick={() => setFinancialTab('payroll')}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1 ${
                financialTab === 'payroll' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>المرتبات وساعات العمل</span>
            </button>
            <button
              onClick={() => setFinancialTab('expenses_list')}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors ${
                financialTab === 'expenses_list' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              المصروفات
            </button>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setPeriodFilter('today')}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors ${
                periodFilter === 'today' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setPeriodFilter('this_month')}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors ${
                periodFilter === 'this_month' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              هذا الشهر
            </button>
            <button
              onClick={() => setPeriodFilter('this_year')}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors ${
                periodFilter === 'this_year' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              العام
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>تسجيل مصروف</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Revenue vs Expenses vs Net Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenues */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">إجمالي الإيرادات المحصلة</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tabular-nums text-emerald-800">
              {totalRevenues.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            من عدد <strong className="font-mono text-slate-800">{filteredVisits.length}</strong> زيارة مسجلة
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">إجمالي المصروفات والنفقات</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tabular-nums text-rose-700">
              {totalExpenses.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            من إيجار وكواشف وصيانة ورواتب
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">صافي الربح الفعلي</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono tabular-nums ${netProfit >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
              {netProfit.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            الإيرادات ناقص المصروفات
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">متبقيات مستحقة طرف المرضى</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tabular-nums text-amber-700">
              {totalPendingBalance.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            تحصل عند تسليم النتيجة
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {financialTab === 'overview' && (
        <div className="space-y-6">
          {/* Split Tables: Visits Inflow vs Expenses Outflow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visits Inflow */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">سجل الإيرادات والتحصيل</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  +{totalRevenues.toLocaleString()} ج.م
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2 px-2.5">الزيارة</th>
                      <th className="py-2 px-2.5">المريض</th>
                      <th className="py-2 px-2.5">التاريخ</th>
                      <th className="py-2 px-2.5 text-left">المدفوع</th>
                      <th className="py-2 px-2.5 text-center">الطريقة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVisits.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2.5 font-mono font-bold">{v.visitCode}</td>
                        <td className="py-2.5 px-2.5 font-semibold text-slate-900">{v.patientName}</td>
                        <td className="py-2.5 px-2.5 font-mono text-slate-500">{v.date}</td>
                        <td className="py-2.5 px-2.5 text-left font-mono font-bold text-emerald-700">
                          {v.paidAmount.toFixed(2)} ج
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                            {v.paymentMethod === 'cash' ? 'كاش' : v.paymentMethod === 'card' ? 'فيزا' : 'محفظة'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses Outflow */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-sm text-slate-900">سجل المصروفات والنفقات</h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700">
                  -{totalExpenses.toLocaleString()} ج.م
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2 px-2.5">البند</th>
                      <th className="py-2 px-2.5">التصنيف</th>
                      <th className="py-2 px-2.5">التاريخ</th>
                      <th className="py-2 px-2.5 text-left">المبلغ</th>
                      <th className="py-2 px-2.5 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">
                          <div>{exp.title}</div>
                          {exp.notes && <div className="text-[10px] text-slate-400 font-normal">{exp.notes}</div>}
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-600">
                          {exp.category === 'rent' ? 'إيجار مقر' :
                           exp.category === 'supplies_reagents' ? 'كواشف ومستلزمات' :
                           exp.category === 'maintenance' ? 'صيانة ومعايرة' :
                           exp.category === 'utilities' ? 'فواتير ومرافق' : 'أخرى'}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono text-slate-500">{exp.date}</td>
                        <td className="py-2.5 px-2.5 text-left font-mono font-bold text-rose-700">
                          {exp.amount.toFixed(2)} ج
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL SALES ANALYTICS (تحليل كامل للمبيعات: أشعة vs تحاليل) */}
      {financialTab === 'sales_analysis' && (
        <div className="space-y-6">
          {/* Visual Comparison Banner */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  <span>تحليل كامل للمبيعات: مقارنة مبيعات التحاليل المخبرية بفحوصات الأشعة</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  إجمالي المبيعات المحققة للفترة: <strong className="font-mono text-slate-900">{totalSalesRevenue.toFixed(2)} ج.م</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span>تحاليل طبية ({labSalesPercent}%)</span>
                </span>
                <span className="flex items-center gap-1.5 font-bold text-blue-800 mr-3">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span>أشعة وسونار ({radSalesPercent}%)</span>
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${labSalesPercent}%` }}
                  className="bg-emerald-600 transition-all duration-500"
                  title={`تحاليل: ${labSales.toFixed(2)} ج`}
                />
                <div
                  style={{ width: `${radSalesPercent}%` }}
                  className="bg-blue-600 transition-all duration-500"
                  title={`أشعة: ${radiologySales.toFixed(2)} ج`}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>تحاليل: {labSales.toFixed(2)} ج.م ({labTestsCount} تحليل)</span>
                <span>أشعة وسونار: {radiologySales.toFixed(2)} ج.م ({radiologyScansCount} فحص)</span>
              </div>
            </div>

            {/* Key Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-emerald-700" />
                    <span>مبيعات قسم التحاليل الطبية:</span>
                  </span>
                  <span className="font-bold text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    {labSalesPercent}%
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-900 mt-1">
                  {labSales.toFixed(2)} ج.م
                </div>
                <span className="text-[11px] text-emerald-700 block">
                  من إجمالي {labTestsCount} تحليل منفذ
                </span>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-700" />
                    <span>مبيعات قسم الأشعة والسونار:</span>
                  </span>
                  <span className="font-bold text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                    {radSalesPercent}%
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-blue-900 mt-1">
                  {radiologySales.toFixed(2)} ج.م
                </div>
                <span className="text-[11px] text-blue-700 block">
                  من إجمالي {radiologyScansCount} فحص أشعة وسونار
                </span>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-purple-700" />
                  <span>طرق التحصيل والدفع:</span>
                </span>
                <div className="space-y-1 pt-1 font-mono text-[11px] text-purple-950">
                  <div className="flex justify-between">
                    <span>كاش ونقدية:</span>
                    <strong>{cashRevenues.toFixed(2)} ج</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>بطاقات بنكية:</span>
                    <strong>{cardRevenues.toFixed(2)} ج</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>محافظ إلكترونية:</span>
                    <strong>{vodafoneRevenues.toFixed(2)} ج</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF ATTENDANCE & MONTHLY PAYROLL (الموظفين والمرتبات الشهرية) */}
      {financialTab === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>كشف مرتبات الموظفين وساعات العمل (Monthly Staff Payroll)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  حساب المرتب تلقائياً بناءً على الراتب الأساسي + ساعات العمل المسجلة الفعلية
                </p>
              </div>

              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-left font-mono">
                <span className="text-xs text-purple-800 font-bold block">إجمالي كتلة الرواتب:</span>
                <strong className="text-lg font-black text-purple-900">{totalPayroll.toLocaleString()} ج.م</strong>
              </div>
            </div>

            {/* Payroll Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">كود الموظف</th>
                    <th className="py-2.5 px-3">اسم الموظف</th>
                    <th className="py-2.5 px-3">الوظيفة / الدور</th>
                    <th className="py-2.5 px-3 text-center">أيام الحضور</th>
                    <th className="py-2.5 px-3 text-center">ساعات العمل</th>
                    <th className="py-2.5 px-3 text-left">أجر الساعة</th>
                    <th className="py-2.5 px-3 text-left">الأساسي</th>
                    <th className="py-2.5 px-3 text-left">أجر الساعات</th>
                    <th className="py-2.5 px-3 text-left font-black text-emerald-800">إجمالي الراتب الصافي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollData.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{emp.code}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{emp.name}</td>
                      <td className="py-3 px-3 text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {emp.roleTitleAr}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{emp.attendanceDays} يوم</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">{emp.totalHours} ساعة</td>
                      <td className="py-3 px-3 text-left font-mono">{emp.hourlyRate} ج/ساعة</td>
                      <td className="py-3 px-3 text-left font-mono">{emp.baseSalary.toLocaleString()} ج</td>
                      <td className="py-3 px-3 text-left font-mono text-purple-700 font-bold">
                        +{emp.hourlyEarnings.toFixed(2)} ج
                      </td>
                      <td className="py-3 px-3 text-left font-mono font-black text-emerald-700 text-sm">
                        {emp.netSalary.toFixed(2)} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comprehensive Net Profit Calculation */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-emerald-950 block text-sm">
                معادلة صافي الربح الحقيقي الشامل بعد استقطاع الرواتب والمصروفات:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 font-mono text-slate-800">
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">إجمالي الإيرادات:</span>
                  <strong className="text-emerald-800 text-sm">+{totalRevenues.toLocaleString()} ج</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">المصروفات التشغيلية:</span>
                  <strong className="text-rose-700 text-sm">-{totalExpenses.toLocaleString()} ج</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">كتلة رواتب الموظفين:</span>
                  <strong className="text-purple-700 text-sm">-{totalPayroll.toLocaleString()} ج</strong>
                </div>
                <div className="bg-emerald-600 text-white p-2.5 rounded-lg shadow-2xs">
                  <span className="text-[10px] text-emerald-100 block">صافي الربح الفعلي النهائي:</span>
                  <strong className="text-white text-base">
                    {netProfitAfterSalaries.toLocaleString()} ج.م
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSES LIST */}
      {financialTab === 'expenses_list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">سجل المصروفات والنفقات المفصلة</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-700">
                إجمالي المصروفات: -{totalExpenses.toLocaleString()} ج.م
              </span>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                + إضافة مصروف
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">البند</th>
                  <th className="py-2.5 px-3">التصنيف</th>
                  <th className="py-2.5 px-3">التاريخ</th>
                  <th className="py-2.5 px-3 text-left">المبلغ</th>
                  <th className="py-2.5 px-3">جهة السداد</th>
                  <th className="py-2.5 px-3 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <div>{exp.title}</div>
                      {exp.notes && <div className="text-[10px] text-slate-400 font-normal">{exp.notes}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold">
                        {exp.category === 'rent' ? 'إيجار مقر' :
                         exp.category === 'supplies_reagents' ? 'كواشف ومستلزمات' :
                         exp.category === 'maintenance' ? 'صيانة ومعايرة' :
                         exp.category === 'utilities' ? 'فواتير ومرافق' :
                         exp.category === 'salaries' ? 'رواتب وحوافز' : 'أخرى'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{exp.date}</td>
                    <td className="py-2.5 px-3 text-left font-mono font-bold text-rose-700">
                      {exp.amount.toFixed(2)} ج
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{exp.paidBy}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-right">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">تسجيل بند مصروف للمختبر</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">عنوان المصروف:</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="مثال: شراء كواشف CBC، فاتورة كهرباء..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نوع البند:</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="supplies_reagents">كواشف ومستلزمات</option>
                    <option value="rent">إيجار المقر</option>
                    <option value="maintenance">صيانة ومعايرة</option>
                    <option value="utilities">مرافق وفواتير</option>
                    <option value="salaries">رواتب وحوافز</option>
                    <option value="other">مصروفات أخرى</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">المبلغ (ج.م):</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">جهة أو شخص السداد:</label>
                <input
                  type="text"
                  value={expensePaidBy}
                  onChange={(e) => setExpensePaidBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">ملاحظات الفاتورة:</label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="رقم الفاتورة أو اسم المورد..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                >
                  تسجيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

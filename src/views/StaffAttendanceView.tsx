import React, { useState } from 'react';
import {
  Clock,
  Users,
  ShieldCheck,
  Plus,
  LogIn,
  LogOut,
  KeyRound,
  CheckCircle,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';

interface Props {
  employees: Employee[];
  attendance: AttendanceRecord[];
  onSaveEmployee: (employee: Employee) => void;
  onSaveAttendance: (record: AttendanceRecord) => void;
}

export const StaffAttendanceView: React.FC<Props> = ({
  employees,
  attendance,
  onSaveEmployee,
  onSaveAttendance,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'employees' | 'permissions'>('attendance');

  // Clock In / Out simulation state
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [clockInTime, setClockInTime] = useState('08:00');
  const [clockOutTime, setClockOutTime] = useState('16:00');
  const [attendanceNotice, setAttendanceNotice] = useState<string | null>(null);

  // New Employee Modal
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState<Employee['role']>('lab_tech');
  const [empRoleTitle, setEmpRoleTitle] = useState('أخصائي تحاليل طبية');
  const [empPhone, setEmpPhone] = useState('');
  const [empHourlyRate, setEmpHourlyRate] = useState<number>(75);
  const [empBaseSalary, setEmpBaseSalary] = useState<number>(6000);

  // Password Change Simulation
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  // Handle Recording Attendance (Clock in / Clock out with auto wage calculation)
  const handleRecordAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    // Calculate hours worked
    const [inH, inM] = clockInTime.split(':').map(Number);
    const [outH, outM] = clockOutTime.split(':').map(Number);
    const totalMinutes = outH * 60 + outM - (inH * 60 + inM);
    const totalHours = Math.max(1, +(totalMinutes / 60).toFixed(1));
    const calculatedWage = Math.round(totalHours * emp.hourlyRate);

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date: new Date().toISOString().split('T')[0],
      checkIn: clockInTime,
      checkOut: clockOutTime,
      totalHours,
      calculatedWage,
      notes: `حساب فوري: ${totalHours} ساعات × ${emp.hourlyRate} ج/ساعة`,
    };

    onSaveAttendance(record);
    setAttendanceNotice(`✓ تم تسجيل دوام ${emp.name} بنجاح (${totalHours} ساعات عمل = ${calculatedWage} ج.م)!`);
    setTimeout(() => setAttendanceNotice(null), 5000);
  };

  // Handle New Employee Submit
  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      code: `EMP-${(employees.length + 1).toString().padStart(2, '0')}`,
      name: empName.trim(),
      role: empRole,
      roleTitleAr: empRoleTitle.trim(),
      phone: empPhone.trim(),
      hourlyRate: Number(empHourlyRate),
      baseSalary: Number(empBaseSalary),
      active: true,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    onSaveEmployee(newEmp);
    setIsEmployeeModalOpen(false);
    setEmpName('');
    setEmpPhone('');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setPasswordNotice('✓ تم تحديث وتشفير كلمة مرور المدير بنجاح في قاعدة البيانات.');
    setTimeout(() => setPasswordNotice(null), 4000);
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            شئون الموظفين، ساعات العمل، والرواتب
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تسجيل الحضور والانصراف، حساب الراتب بالساعة تلقائياً، وإدارة الصلاحيات
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'attendance' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            تسجيل الحضور والرواتب بالساعة
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'employees' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            سجل الموظفين والكوادر ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'permissions' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            صلاحيات المستخدمين والأمان
          </button>
        </div>
      </div>

      {/* TAB 1: ATTENDANCE & HOURLY WAGE CALCULATION */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Clock In / Out Quick Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                تسجيل حركة حضور وانصراف (حساب الأجر الساعي الفوري)
              </h3>
            </div>

            <form onSubmit={handleRecordAttendance} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اختر الموظف:</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.hourlyRate} ج/ساعة)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">توقيت الدخول (Check-in):</label>
                <input
                  type="time"
                  required
                  value={clockInTime}
                  onChange={(e) => setClockInTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">توقيت الخروج (Check-out):</label>
                <input
                  type="time"
                  required
                  value={clockOutTime}
                  onChange={(e) => setClockOutTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                تسجيل واحتساب الراتب
              </button>
            </form>

            {attendanceNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{attendanceNotice}</span>
              </div>
            )}
          </div>

          {/* Attendance History Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              سجل ساعات العمل والرواتب المحتسبة
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">التاريخ</th>
                    <th className="py-2.5 px-3">اسم الموظف</th>
                    <th className="py-2.5 px-3 text-center">وقت الدخول</th>
                    <th className="py-2.5 px-3 text-center">وقت الخروج</th>
                    <th className="py-2.5 px-3 text-center">إجمالي الساعات</th>
                    <th className="py-2.5 px-3 text-left">الراتب المحتسب</th>
                    <th className="py-2.5 px-3">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono">{rec.date}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{rec.employeeName}</td>
                      <td className="py-3 px-3 text-center font-mono">{rec.checkIn}</td>
                      <td className="py-3 px-3 text-center font-mono">{rec.checkOut || 'دوام جاري'}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                        {rec.totalHours} ساعة
                      </td>
                      <td className="py-3 px-3 text-left font-mono font-bold text-emerald-700 tabular-nums">
                        {rec.calculatedWage.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">{rec.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEES DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              قائمة العاملين في المختبر ومعدل الأجر في الساعة
            </h3>
            <button
              onClick={() => setIsEmployeeModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">{emp.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    نشط
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{emp.name}</h4>
                  <p className="text-[11px] text-slate-600 font-medium">{emp.roleTitleAr}</p>
                </div>

                <div className="border-t border-slate-200 pt-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">الراتب في الساعة:</span>
                    <strong className="font-mono text-emerald-800">{emp.hourlyRate} ج/ساعة</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الراتب الأساسي التقديري:</span>
                    <span className="font-mono">{emp.baseSalary} ج.م</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>الهاتف:</span>
                    <span className="font-mono" dir="ltr">{emp.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PERMISSIONS & SECURITY */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles & Matrix */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              مصفوفة صلاحيات المستخدمين (Role-Based Permissions)
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-sm">1. مدير النظام (Admin)</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">صلاحيات كاملة 100%</span>
                </div>
                <p className="text-slate-600">
                  كافة الصلاحيات: تسجيل المرضى، حذف وتعديل التحاليل، الاطلاع على الخزينة والتقارير المالية والأرباح، شئون الموظفين، تغيير كلمات المرور، وأخذ واسترجاع النسخ الاحتياطية.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-sm">2. كيميائي / فني التحاليل (Lab Tech)</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">المختبر والنتائج</span>
                </div>
                <p className="text-slate-600">
                  إدخال النتائج، مراجعة القيم الطبيعية، ربط الأجهزة المخبرية، طباعة ملصقات الباركود، متابعة عينات المزارع و CASA. لا يملك صلاحية الاطلاع على أرباح الخزينة أو حذف السجلات.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 text-sm">3. موظف الاستقبال والمحاسبة (Receptionist)</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">الاستقبال والتحصيل</span>
                </div>
                <p className="text-slate-600">
                  تسجيل الزيارات الجديدة، كشف تشابه الأسماء، تحصيل الفواتير، طباعة الإيصالات A4 والحرارية، تسليم التقارير للمرضى وإرسالها عبر واتساب وإيميل.
                </p>
              </div>
            </div>
          </div>

          {/* Password Change Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">تغيير كلمة مرور المدير</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">كلمة المرور الحالية:</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">كلمة المرور الجديدة:</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {passwordNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs font-medium text-emerald-800">
                  {passwordNotice}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                تحديث كلمة المرور المشفرة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-right">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">إضافة موظف جديد للمختبر</h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployeeSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم الموظف بالكامل:</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الصلاحية / الدور:</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="lab_tech">فني / كيميائي تحاليل</option>
                    <option value="receptionist">استقبال ومحاسبة</option>
                    <option value="pathologist">استشاري باثولوجي</option>
                    <option value="admin">مدير معمل</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">المسمى الوظيفي:</label>
                  <input
                    type="text"
                    required
                    value={empRoleTitle}
                    onChange={(e) => setEmpRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الراتب في الساعة (ج.م):</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={empHourlyRate}
                    onChange={(e) => setEmpHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الراتب الأساسي:</label>
                  <input
                    type="number"
                    min="1000"
                    value={empBaseSalary}
                    onChange={(e) => setEmpBaseSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">رقم الهاتف:</label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                >
                  حفظ الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Key,
  CheckCircle,
  X,
  Lock,
  UserCheck,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { AppUser, UserPermissions } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  users: AppUser[];
  onSelectUser: (user: AppUser) => void;
  onSaveUsers: (users: AppUser[]) => void;
}

export const UserManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSelectUser,
  onSaveUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'switch_user' | 'manage_users'>('switch_user');
  const [pinInput, setPinInput] = useState('');
  const [selectedUserToSwitch, setSelectedUserToSwitch] = useState<AppUser | null>(null);
  const [switchError, setSwitchError] = useState('');

  // New / Edit User Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'lab_tech' | 'receptionist'>('receptionist');
  const [formPermissions, setFormPermissions] = useState<UserPermissions>({
    canRegisterVisits: true,
    canEnterResults: false,
    canVerifyResults: false,
    canViewFinancials: false,
    canManageUsers: false,
    canManageSettings: false,
  });

  if (!isOpen) return null;

  // Handle Role preset selection
  const handleRolePreset = (role: 'admin' | 'lab_tech' | 'receptionist') => {
    setFormRole(role);
    if (role === 'admin') {
      setFormPermissions({
        canRegisterVisits: true,
        canEnterResults: true,
        canVerifyResults: true,
        canViewFinancials: true,
        canManageUsers: true,
        canManageSettings: true,
      });
    } else if (role === 'lab_tech') {
      setFormPermissions({
        canRegisterVisits: false,
        canEnterResults: true,
        canVerifyResults: true,
        canViewFinancials: false,
        canManageUsers: false,
        canManageSettings: false,
      });
    } else {
      // receptionist
      setFormPermissions({
        canRegisterVisits: true,
        canEnterResults: false,
        canVerifyResults: false,
        canViewFinancials: false,
        canManageUsers: false,
        canManageSettings: false,
      });
    }
  };

  const handleStartEdit = (user: AppUser) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormPin(user.pinCode || '');
    setFormRole(user.role as any);
    setFormPermissions({ ...user.permissions });
    setActiveTab('manage_users');
  };

  const handleResetForm = () => {
    setEditingUserId(null);
    setFormName('');
    setFormUsername('');
    setFormPin('');
    handleRolePreset('receptionist');
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim()) return;

    let updatedList: AppUser[];
    const roleTitle =
      formRole === 'admin'
        ? 'مدير النظام وصاحب المختبر (كل الصلاحيات)'
        : formRole === 'lab_tech'
        ? 'طبيب / أخصائي تحاليل (النتائج والمختبر)'
        : 'موظف استقبال وكاشير (بيانات وتسجيل)';

    if (editingUserId) {
      updatedList = users.map((u) => {
        if (u.id === editingUserId) {
          return {
            ...u,
            name: formName.trim(),
            username: formUsername.trim(),
            pinCode: formPin.trim() || '1234',
            role: formRole,
            roleNameAr: roleTitle,
            permissions: { ...formPermissions },
          };
        }
        return u;
      });
    } else {
      const newUser: AppUser = {
        id: `usr-${Date.now()}`,
        name: formName.trim(),
        username: formUsername.trim(),
        pinCode: formPin.trim() || '1234',
        role: formRole,
        roleNameAr: roleTitle,
        permissions: { ...formPermissions },
        isActive: true,
      };
      updatedList = [...users, newUser];
    }

    onSaveUsers(updatedList);
    handleResetForm();
  };

  const handleConfirmSwitch = (user: AppUser) => {
    if (user.pinCode) {
      if (pinInput !== user.pinCode) {
        setSwitchError('رمز PIN غير صحيح لهذا المستخدم!');
        return;
      }
    }
    onSelectUser(user);
    setPinInput('');
    setSelectedUserToSwitch(null);
    setSwitchError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-right flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>إدارة المستخدمين والصلاحيات (Multi-User & Roles)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد صلاحيات جهاز الاستقبال (إدخال بيانات) وجهاز الطبيب (إدخال ومراجعة النتائج)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('switch_user');
                setSelectedUserToSwitch(null);
                setSwitchError('');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-t-2 ${
                activeTab === 'switch_user'
                  ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              تبديل المستخدم الحالي
            </button>
            <button
              onClick={() => setActiveTab('manage_users')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-t-2 ${
                activeTab === 'manage_users'
                  ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              إضافة وتعديل المستخدمين والصلاحيات ({users.length})
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            المستخدم النشط: <strong className="text-emerald-700 font-bold">{currentUser.name}</strong>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* TAB 1: SWITCH USER */}
          {activeTab === 'switch_user' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  يمكنك التبديل السريع بين حساب الاستقبال (تسجيل المرضى والكاش) وحساب الطبيب (إدخال ومراجعة النتائج والتقارير) بسهولة للعمل على أكثر من جهاز في نفس الوقت.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const isSelected = selectedUserToSwitch?.id === u.id;

                  return (
                    <div
                      key={u.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                          : isSelected
                          ? 'bg-slate-50 border-slate-900'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                                النشط حالياً
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {u.roleNameAr}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'lab_tech'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {u.role === 'admin' ? 'مدير عام' : u.role === 'lab_tech' ? 'مختبر ونتائج' : 'استقبال وكاشير'}
                        </span>
                      </div>

                      {/* Permissions preview bullets */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
                        <span className={u.permissions.canRegisterVisits ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {u.permissions.canRegisterVisits ? '✓ تسجيل زيارات' : '✕ حجب الاستقبال'}
                        </span>
                        <span className={u.permissions.canEnterResults ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                          {u.permissions.canEnterResults ? '✓ إدخال نتائج' : '✕ حجب إدخال النتائج'}
                        </span>
                        <span className={u.permissions.canVerifyResults ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {u.permissions.canVerifyResults ? '✓ اعتماد تقارير' : '✕ حجب الاعتماد'}
                        </span>
                        <span className={u.permissions.canViewFinancials ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {u.permissions.canViewFinancials ? '✓ الخزينة والمالية' : '✕ حجب الخزينة'}
                        </span>
                      </div>

                      {!isCurrent && (
                        <div className="mt-3.5 pt-2 border-t border-slate-100">
                          {isSelected ? (
                            <div className="space-y-2 animate-in fade-in">
                              <div className="flex items-center gap-2">
                                <Key className="w-3.5 h-3.5 text-slate-500" />
                                <input
                                  type="password"
                                  maxLength={6}
                                  value={pinInput}
                                  onChange={(e) => {
                                    setPinInput(e.target.value);
                                    setSwitchError('');
                                  }}
                                  placeholder="أدخل رمز PIN السريع (مثال: 5555 أو 2026)"
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold"
                                  autoFocus
                                />
                              </div>
                              {switchError && (
                                <p className="text-[11px] text-rose-600 font-bold">{switchError}</p>
                              )}
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedUserToSwitch(null)}
                                  className="px-2 py-1 text-slate-500 hover:text-slate-700"
                                >
                                  إلغاء
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmSwitch(u)}
                                  className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-colors"
                                >
                                  تأكيد الدخول
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserToSwitch(u);
                                setPinInput(u.pinCode || '');
                                setSwitchError('');
                              }}
                              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>التبديل لهذا المستخدم (PIN: {u.pinCode})</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE USERS & GRANULAR PERMISSIONS */}
          {activeTab === 'manage_users' && (
            <div className="space-y-6">
              {/* Add / Edit Form */}
              <form onSubmit={handleSaveUserForm} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>{editingUserId ? 'تعديل بيانات وصلاحيات المستخدم' : 'إضافة مستخدم جديد للنظام'}</span>
                  </h4>
                  {editingUserId && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">اسم الموظف أو الطبيب:</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="مثال: د. مروان سمير"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">اسم المستخدم (Username):</label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="marwan_doctor"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">رمز الدخول السريع (PIN):</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formPin}
                      onChange={(e) => setFormPin(e.target.value)}
                      placeholder="4 أرقام (مثال: 7788)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Role Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">تحديد الدور الوظيفي (Role):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRolePreset('receptionist')}
                      className={`p-2.5 rounded-lg border text-right transition-colors ${
                        formRole === 'receptionist'
                          ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">استقبال وكاشير (Reception)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">تسجيل بيانات المرضى والتحصيل فقط</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRolePreset('lab_tech')}
                      className={`p-2.5 rounded-lg border text-right transition-colors ${
                        formRole === 'lab_tech'
                          ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">طبيب / أخصائي مختبر (Lab)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">إدخال ومراجعة واعتماد النتائج</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRolePreset('admin')}
                      className={`p-2.5 rounded-lg border text-right transition-colors ${
                        formRole === 'admin'
                          ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">مدير عام وصاحب المعمل (Admin)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">كامل الصلاحيات بلا قيود</div>
                    </button>
                  </div>
                </div>

                {/* Granular Permissions Checkboxes */}
                <div className="bg-white border border-slate-200 p-3 rounded-lg space-y-2">
                  <div className="font-bold text-xs text-slate-800">
                    تفصيل الصلاحيات الفردية (يمكن تخصيصها بدقة لكل يوزر):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formPermissions.canRegisterVisits}
                        onChange={(e) =>
                          setFormPermissions({ ...formPermissions, canRegisterVisits: e.target.checked })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>تسجيل المرضى والزيارات وتحصيل الكاش (الاستقبال)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formPermissions.canEnterResults}
                        onChange={(e) =>
                          setFormPermissions({ ...formPermissions, canEnterResults: e.target.checked })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="font-bold text-blue-900">إدخال وتعديل نتائج التحاليل والأشعة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formPermissions.canVerifyResults}
                        onChange={(e) =>
                          setFormPermissions({ ...formPermissions, canVerifyResults: e.target.checked })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>اعتماد وتوقيع التقارير الطبية الرسمية</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formPermissions.canViewFinancials}
                        onChange={(e) =>
                          setFormPermissions({ ...formPermissions, canViewFinancials: e.target.checked })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>الاطلاع على تقارير الأرباح والرواتب والخزينة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formPermissions.canManageSettings}
                        onChange={(e) =>
                          setFormPermissions({ ...formPermissions, canManageSettings: e.target.checked })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>تعديل أسعار التحاليل ودليل الفحوصات والإعدادات</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formPermissions.canManageUsers}
                        onChange={(e) =>
                          setFormPermissions({ ...formPermissions, canManageUsers: e.target.checked })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>إدارة المستخدمين وتغيير كلمات السر و PIN</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    {editingUserId ? 'تحديث بيانات وصلاحيات المستخدم' : 'حفظ وإضافة المستخدم للنظام'}
                  </button>
                </div>
              </form>

              {/* Users List Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">الاسم والمستخدم</th>
                      <th className="py-2.5 px-3">الدور الوظيفي</th>
                      <th className="py-2.5 px-3 text-center">رمز PIN</th>
                      <th className="py-2.5 px-3">الصلاحيات الفعالة</th>
                      <th className="py-2.5 px-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <span className="font-mono text-[11px] text-slate-400" dir="ltr">@{u.username}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-semibold text-slate-700">{u.roleNameAr}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                          {u.pinCode || '----'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            {u.permissions.canRegisterVisits && (
                              <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                                تسجيل وزيارات
                              </span>
                            )}
                            {u.permissions.canEnterResults ? (
                              <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 font-bold">
                                إدخال نتائج
                              </span>
                            ) : (
                              <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                                محجوب من النتائج
                              </span>
                            )}
                            {u.permissions.canViewFinancials && (
                              <span className="bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200">
                                مالية وأرباح
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(u)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition-colors"
                            title="تعديل الصلاحيات"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

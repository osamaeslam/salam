import React from 'react';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  FileText,
  Barcode,
  FolderTree,
  Stethoscope,
  Cpu,
  Wallet,
  Clock,
  Sparkles,
  Settings,
  Wifi,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<Props> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'المؤشرات العامة', icon: LayoutDashboard, category: 'عام' },
    { id: 'patients', label: 'المرضى والزيارات', icon: Users, category: 'الاستقبال والعملاء' },
    { id: 'results', label: 'إدخال ومراجعة النتائج', icon: FlaskConical, category: 'المختبر والفحوصات' },
    { id: 'reports', label: 'التقارير والمراسلة', icon: FileText, category: 'المختبر والفحوصات' },
    { id: 'barcode', label: 'محطة الباركود', icon: Barcode, category: 'المختبر والفحوصات' },
    { id: 'tests', label: 'دليل 385 تحليل والمخزن', icon: FolderTree, category: 'المختبر والفحوصات' },
    { id: 'doctors', label: 'الأطباء والتعاقدات', icon: Stethoscope, category: 'الاستقبال والعملاء' },
    { id: 'devices', label: 'ربط الأجهزة المخبرية', icon: Cpu, category: 'المختبر والفحوصات' },
    { id: 'financials', label: 'المالية والخزينة والأرباح', icon: Wallet, category: 'الإدارة والمالية' },
    { id: 'staff', label: 'الموظفون وساعات العمل', icon: Clock, category: 'الإدارة والمالية' },
    { id: 'ai', label: 'المساعد الطبي الذكي AI', icon: Sparkles, category: 'تقنيات متقدمة' },
    { id: 'settings', label: 'الإعدادات والنسخ الاحتياطي', icon: Settings, category: 'النظام والأمان' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-l border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Sub-header in sidebar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
            GL
          </div>
          <div>
            <div className="font-bold text-sm text-white">Green Lab Soft</div>
            <div className="text-[10px] text-emerald-400 font-medium">نظام المختبرات المتكامل</div>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
          <Wifi className="w-3 h-3" />
          محلي 100%
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-right ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.id === 'tests' && (
                <span className="mr-auto text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-emerald-300 rounded">
                  385
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Network & Security badge */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            تشفير قاعدة البيانات
          </span>
          <span className="font-mono text-emerald-400">نشط</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          يعمل على الشبكات والإنترنت بأمان تام
        </p>
      </div>
    </aside>
  );
};

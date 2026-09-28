import React from 'react';
import {
  PlusCircle,
  Scan,
  User,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  WifiOff,
  Maximize2,
  ZoomIn,
} from 'lucide-react';
import { AppUser } from '../utils/storage';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: AppUser;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  uiScale: 'compact' | 'standard' | 'large';
  onChangeUiScale: (scale: 'compact' | 'standard' | 'large') => void;
  onOpenScanner: () => void;
  onQuickNewVisit: () => void;
  onSwitchUser: () => void;
  onOpenOfflineLanModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeView,
  setActiveView,
  currentUser,
  sidebarCollapsed,
  onToggleSidebar,
  uiScale,
  onChangeUiScale,
  onOpenScanner,
  onQuickNewVisit,
  onSwitchUser,
  onOpenOfflineLanModal,
}) => {
  const nextScaleMap: Record<'compact' | 'standard' | 'large', 'compact' | 'standard' | 'large'> = {
    compact: 'standard',
    standard: 'large',
    large: 'compact',
  };

  const scaleLabels: Record<'compact' | 'standard' | 'large', string> = {
    compact: 'حجم: 88% (شاشات صغيرة)',
    standard: 'حجم: 100% (قياسي)',
    large: 'حجم: 112% (شاشات كبيرة)',
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-30 select-none">
      {/* Zone 1: Sidebar Toggle & Brand Wordmark & Offline Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title={sidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة لتوسيع مساحة الشاشة'}
        >
          {sidebarCollapsed ? <PanelLeft className="w-5 h-5 text-emerald-600" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('dashboard');
          }}
          className="text-base sm:text-lg font-black tracking-tight text-emerald-950 font-sans truncate"
        >
          Green Lab Soft
        </a>

        {/* Desktop Offline & Multi-Device LAN Button */}
        <button
          onClick={onOpenOfflineLanModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition-all shadow-2xs"
          title="ديسك توب أوفلاين 100% - اضغط لربط ومزامنة أجهزة المعمل بدون إنترنت"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>أوفلاين 100% | متعدد الأجهزة LAN</span>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`hover:text-emerald-900 transition-colors whitespace-nowrap ${
            activeView === 'dashboard' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 py-1' : ''
          }`}
        >
          المؤشرات العامة
        </button>
        <button
          onClick={() => setActiveView('patients')}
          className={`hover:text-emerald-900 transition-colors whitespace-nowrap ${
            activeView === 'patients' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 py-1' : ''
          }`}
        >
          المرضى والزيارات
        </button>
        <button
          onClick={() => setActiveView('results')}
          className={`hover:text-emerald-900 transition-colors whitespace-nowrap ${
            activeView === 'results' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 py-1' : ''
          }`}
        >
          إدخال النتائج
        </button>
        <button
          onClick={() => setActiveView('tests')}
          className={`hover:text-emerald-900 transition-colors whitespace-nowrap ${
            activeView === 'tests' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 py-1' : ''
          }`}
        >
          دليل 385 تحليل
        </button>
        <button
          onClick={() => setActiveView('financials')}
          className={`hover:text-emerald-900 transition-colors whitespace-nowrap ${
            activeView === 'financials' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 py-1' : ''
          }`}
        >
          المالية والأرباح
        </button>
        <button
          onClick={() => setActiveView('reports')}
          className={`hover:text-emerald-900 transition-colors whitespace-nowrap ${
            activeView === 'reports' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 py-1' : ''
          }`}
        >
          التقارير الطبية
        </button>
      </nav>

      {/* Zone 3: Actions & UI Scale & User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Dynamic UI Scaling Switcher for Flexible Screen Proportions */}
        <button
          onClick={() => onChangeUiScale(nextScaleMap[uiScale])}
          className="flex items-center gap-1 px-2 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
          title={`تغيير حجم العرض ليتناسب مع شاشتك (الحالي: ${uiScale})`}
        >
          <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden md:inline">{scaleLabels[uiScale]}</span>
          <span className="md:hidden font-mono text-[11px]">{uiScale === 'compact' ? '88%' : uiScale === 'large' ? '112%' : '100%'}</span>
        </button>

        <button
          onClick={onOpenScanner}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          title="مسح باركود الزيارة أو المريض"
        >
          <Scan className="w-3.5 h-3.5 text-emerald-600" />
          <span>قارئ الباركود</span>
        </button>

        <button
          onClick={onQuickNewVisit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تسجيل زيارة</span>
        </button>

        <button
          onClick={onSwitchUser}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          title="تبديل المستخدم أو الصلاحية (استقبال / مختبر / مدير)"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="flex flex-col text-right leading-tight">
            <span className="font-bold text-xs truncate max-w-[120px] sm:max-w-[140px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-emerald-800 font-bold truncate">
              {currentUser.role === 'admin' ? 'مدير عام' : currentUser.role === 'lab_tech' ? 'طبيب مختبر' : 'استقبال'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};

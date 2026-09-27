import React from 'react';
import { PlusCircle, Scan, User, ShieldCheck } from 'lucide-react';
import { AppUser } from '../utils/storage';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: AppUser;
  onOpenScanner: () => void;
  onQuickNewVisit: () => void;
  onSwitchUser: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeView,
  setActiveView,
  currentUser,
  onOpenScanner,
  onQuickNewVisit,
  onSwitchUser,
}) => {
  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2">
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('dashboard');
          }}
          className="text-lg font-black tracking-tight text-emerald-950 font-sans"
        >
          Green Lab Soft
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
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

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
          title="تبديل المستخدم أو الصلاحية"
        >
          <User className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline truncate max-w-[120px]">{currentUser.name.split(' ')[0]}</span>
        </button>
      </div>
    </header>
  );
};

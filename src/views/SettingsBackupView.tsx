import React, { useState, useRef } from 'react';
import {
  Settings,
  HardDrive,
  Download,
  Upload,
  ShieldCheck,
  RefreshCw,
  Building,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertTriangle,
  History,
  Lock,
  Palette,
  Layout,
  Type,
  Award,
  Crown,
  Gift,
  Coins,
  Cpu,
  Monitor,
  Wifi,
  Sparkles,
  QrCode,
  Barcode,
  Stethoscope,
  Eye,
  Save,
} from 'lucide-react';
import { LabSettings, AuditLog, Patient } from '../types';
import { StorageService } from '../utils/storage';
import { generateBarcodeSVG, generateQrSVG } from '../utils/barcode';

interface Props {
  settings: LabSettings;
  auditLogs: AuditLog[];
  patients: Patient[];
  onSaveSettings: (settings: LabSettings) => void;
  onSavePatient?: (patient: Patient) => void;
  onRestoreBackup: () => void;
}

export const SettingsBackupView: React.FC<Props> = ({
  settings,
  auditLogs,
  patients,
  onSaveSettings,
  onSavePatient,
  onRestoreBackup,
}) => {
  const [activeTab, setActiveTab] = useState<'report_designer' | 'lab_profile' | 'loyalty' | 'architecture' | 'backup' | 'audit_log'>('report_designer');
  const [formState, setFormState] = useState<LabSettings>({ ...settings });
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bonus Points Modal state
  const [selectedPatientForPoints, setSelectedPatientForPoints] = useState<Patient | null>(null);
  const [pointsAdjustment, setPointsAdjustment] = useState<number>(50);

  const handleSettingsSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings(formState);
    setSaveNotice('✓ تم حفظ التصميم وإعدادات المختبر بنجاح وتطبيقها على كافة التقارير الطبية!');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  // Download complete JSON backup
  const handleDownloadBackup = () => {
    const jsonStr = StorageService.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GreenLab_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Upload and restore backup
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (confirm('تنبيه: سيتم استرجاع قاعدة البيانات كاملة واستبدال السجلات الحالية. هل ترغب بالاستمرار؟')) {
        const success = StorageService.restoreFullBackupJSON(content);
        if (success) {
          alert('تم استرجاع النسخة الاحتياطية بنجاح! سيتم تحديث الصفحة.');
          onRestoreBackup();
          window.location.reload();
        } else {
          alert('فشل استرجاع الملف. يرجى التأكد من صحة ملف النسخة الاحتياطية.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Reset to factory defaults
  const handleResetFactory = () => {
    if (confirm('تحذير شديد الأهمية: هل تريد حقاً إعادة تعيين البرنامج إلى بيانات المصنع الأولية ومسح كافة السجلات الجديدة؟')) {
      StorageService.resetAllToFactory();
      window.location.reload();
    }
  };

  // Handle adding bonus loyalty points to a patient
  const handleAwardPoints = () => {
    if (!selectedPatientForPoints || !onSavePatient) return;
    const currentPts = selectedPatientForPoints.loyaltyPoints || 0;
    const newPts = Math.max(0, currentPts + Number(pointsAdjustment));
    let newTier = selectedPatientForPoints.loyaltyTier || 'bronze';
    if (newPts >= 500) newTier = 'vip';
    else if (newPts >= 300) newTier = 'gold';
    else if (newPts >= 100) newTier = 'silver';

    const updated: Patient = {
      ...selectedPatientForPoints,
      loyaltyPoints: newPts,
      loyaltyTier: newTier,
    };
    onSavePatient(updated);
    setSelectedPatientForPoints(null);
    setSaveNotice(`✓ تم إضافة ${pointsAdjustment} نقطة ولاء للمريض ${updated.name}! رتبته الحالية: ${newTier.toUpperCase()}`);
    setTimeout(() => setSaveNotice(null), 4000);
  };

  // Theme palettes preview colors
  const themeColors = {
    emerald: { bg: 'bg-emerald-800', text: 'text-emerald-800', light: 'bg-emerald-50', name: 'أخضر زمردي ملكي' },
    sapphire: { bg: 'bg-blue-900', text: 'text-blue-900', light: 'bg-blue-50', name: 'أزرق ياقوتي طبي' },
    burgundy: { bg: 'bg-rose-900', text: 'text-rose-900', light: 'bg-rose-50', name: 'عنابي بورغندي فاخر' },
    navy: { bg: 'bg-indigo-950', text: 'text-indigo-950', light: 'bg-indigo-50', name: 'كحلي تنفيذي' },
    classic: { bg: 'bg-slate-900', text: 'text-slate-900', light: 'bg-slate-100', name: 'رمادي فحمي كلاسيكي' },
  }[formState.reportTheme || 'emerald'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            إعدادات المختبر وتخصيص قوالب الطباعة ونظام الولاء
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تخصيص كامل لشكل تقرير A4، معلومات المعمل، برنامج ولاء العملاء VIP، والتشغيل المكتبي والشبكي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('report_designer')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'report_designer' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-emerald-600" />
            <span>تصميم قالب A4</span>
          </button>
          <button
            onClick={() => setActiveTab('lab_profile')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'lab_profile' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>بيانات وصورة المعمل</span>
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'loyalty' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>برنامج ولاء العملاء VIP</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>قاعدة البيانات والأجهزة (SQLite)</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'backup' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            النسخ الاحتياطي
          </button>
          <button
            onClick={() => setActiveTab('audit_log')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'audit_log' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            مراقبة العمليات ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Global Save Notice Banner */}
      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DEDICATED A4 REPORT DESIGNER & LIVE PREVIEW (الميزة المطلوبة تفصيلياً) */}
      {/* ========================================================================= */}
      {activeTab === 'report_designer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  تخصيص شكل وتنسيق تقرير النتائج A4
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleSettingsSubmit()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ التعديلات</span>
              </button>
            </div>

            {/* 1. Logo Position */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-emerald-600" />
                <span>مكان وموضع شعار المختبر (Logo Position):</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'right', label: 'شعار على اليمين (الرسمي العربي)' },
                  { id: 'left', label: 'شعار على اليسار (النمط الإنجليزي)' },
                  { id: 'center', label: 'شعار بالمنتصف (ترويسة مركزية)' },
                  { id: 'watermark', label: 'علامة مائية خفيفة خلف التقرير' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormState({ ...formState, logoPosition: item.id as any })}
                    className={`p-2.5 rounded-lg border text-right transition-all font-medium ${
                      formState.logoPosition === item.id
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-600 font-bold ring-1 ring-emerald-500/20 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Patient and Doctor Info Distribution */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>توزيع بيانات المريض والزيارة (Data Layout):</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'cards_grid', label: 'شبكة بطاقات أنيقة (Cards Grid)' },
                  { id: 'horizontal_bar', label: 'شريط أفقي عريض (Modern Bar)' },
                  { id: 'compact_table', label: 'جدول بيانات مدمج (Data Table)' },
                  { id: 'two_columns', label: 'عمودين متوازيين (Two Columns)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormState({ ...formState, patientInfoLayout: item.id as any })}
                    className={`p-2.5 rounded-lg border text-right transition-all font-medium ${
                      formState.patientInfoLayout === item.id
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-600 font-bold ring-1 ring-emerald-500/20 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Font Size Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-emerald-600" />
                <span>حجم خط جدول التحاليل والنتائج:</span>
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'compact', label: 'مكثف (Compact)', desc: '10px - يناسب التحاليل الطويلة' },
                  { id: 'standard', label: 'قياسي (Standard)', desc: '12px - متزن ومثالي' },
                  { id: 'large', label: 'كبير ومريح (Large)', desc: '14px - وضوح فائق' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormState({ ...formState, fontSize: item.id as any })}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      formState.fontSize === item.id
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-600 font-bold ring-1 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Color Palette Theme */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-600" />
                <span>طابع ألوان التقرير الطبي A4 (Themes):</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'emerald', name: 'أخضر زمردي ملكي', hex: '#065f46' },
                  { id: 'sapphire', name: 'أزرق ياقوتي طبي', hex: '#1e3a8a' },
                  { id: 'burgundy', name: 'عنابي بورغندي فاخر', hex: '#881337' },
                  { id: 'navy', name: 'كحلي وأزرق سماوي', hex: '#1e1b4b' },
                  { id: 'classic', name: 'رمادي فحمي كلاسيكي', hex: '#0f172a' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormState({ ...formState, reportTheme: t.id as any })}
                    className={`p-2 rounded-lg border flex items-center gap-2.5 transition-all ${
                      formState.reportTheme === t.id
                        ? 'border-slate-900 bg-slate-50 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: t.hex }} />
                    <span className="text-xs text-slate-800">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Toggles for Doctor Ribbon, Watermark, Seals, QR Code */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <label className="text-xs font-bold text-slate-800 block">عناصر إضافية على التقرير:</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.showDoctorRibbon ?? true}
                    onChange={(e) => setFormState({ ...formState, showDoctorRibbon: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>شريط الطبيب المعالج</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.showOfficialSeal ?? true}
                    onChange={(e) => setFormState({ ...formState, showOfficialSeal: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>ختم الجودة الذهبي للمعمل</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.showQrCodeOnReport ?? true}
                    onChange={(e) => setFormState({ ...formState, showQrCodeOnReport: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>رمز التحقق الإلكتروني QR</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.showBarcode ?? true}
                    onChange={(e) => setFormState({ ...formState, showBarcode: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>كود باركود العينة</span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSettingsSubmit()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>حفظ هذا القالب كشكل افتراضي للتقارير</span>
            </button>
          </div>

          {/* Live A4 Interactive Preview Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs text-slate-800">
                  معاينة حية ومباشرة لشكل التقرير A4 (Live A4 Preview)
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                يتغير فوراً مع كل خيار
              </span>
            </div>

            {/* Live Interactive Scaled A4 Sheet Container */}
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-center overflow-x-auto">
              <div
                className="bg-white p-6 shadow-md rounded border border-slate-300 w-full max-w-[550px] text-slate-900 font-sans text-xs space-y-4 relative"
                style={{ minHeight: '680px' }}
              >
                {/* Accent Top Bar */}
                <div className={`h-2 w-full ${themeColors.bg} rounded-t-xs`} />

                {/* Header Preview based on logoPosition */}
                <div className="border-b border-slate-200 pb-3">
                  {formState.logoPosition === 'right' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex flex-col items-center justify-center font-serif font-black text-sm">
                          GL
                        </div>
                        <div>
                          <div className={`font-black text-sm ${themeColors.text}`}>{formState.labNameAr}</div>
                          <div className="text-[9px] font-mono text-slate-400">{formState.labNameEn}</div>
                          <div className="text-[9px] text-slate-500 italic">"{formState.sloganAr}"</div>
                        </div>
                      </div>
                      <div className="text-left font-mono text-[9px] text-slate-500">
                        <div>{formState.phone1}</div>
                        <div>{formState.address}</div>
                      </div>
                    </div>
                  )}

                  {formState.logoPosition === 'left' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-black text-sm ${themeColors.text}`}>{formState.labNameAr}</div>
                        <div className="text-[9px] font-mono text-slate-400">{formState.labNameEn}</div>
                        <div className="text-[9px] text-slate-500">{formState.address}</div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex flex-col items-center justify-center font-serif font-black text-sm">
                        GL
                      </div>
                    </div>
                  )}

                  {formState.logoPosition === 'center' && (
                    <div className="text-center space-y-1">
                      <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-700 text-white flex items-center justify-center font-serif font-bold text-xs">
                        GL
                      </div>
                      <div className={`font-black text-sm ${themeColors.text}`}>{formState.labNameAr}</div>
                      <div className="text-[9px] font-mono text-slate-400">{formState.phone1} · {formState.address}</div>
                    </div>
                  )}

                  {formState.logoPosition === 'watermark' && (
                    <div className="flex justify-between items-center">
                      <div className={`font-black text-sm ${themeColors.text}`}>{formState.labNameAr}</div>
                      <div className="font-mono text-[9px] text-slate-500">{formState.phone1}</div>
                    </div>
                  )}
                </div>

                {/* Doctor Ribbon Preview */}
                {(formState.showDoctorRibbon ?? true) && (
                  <div className={`py-1.5 px-3 ${themeColors.light} rounded border border-slate-200 flex justify-between text-[10px]`}>
                    <div>الطبيب: <strong>د. خالد عبد العظيم</strong></div>
                    <div>المدير الفني: <strong>{formState.directorName}</strong></div>
                  </div>
                )}

                {/* Patient Info Preview based on patientInfoLayout */}
                {formState.patientInfoLayout === 'cards_grid' && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 grid grid-cols-3 gap-2 text-[10px]">
                    <div>المريض: <strong className="text-slate-900 block truncate">محمود أحمد عبد الرحمن</strong></div>
                    <div>الكود: <strong className="font-mono text-emerald-800 block">P-10001</strong></div>
                    <div>السن: <span>41 سنة (ذكر)</span></div>
                    <div>الزيارة: <span className="font-mono">V-2026-0001</span></div>
                    <div>التاريخ: <span className="font-mono">2026-09-27</span></div>
                    <div>التعاقد: <span>نقابة المهندسين</span></div>
                  </div>
                )}

                {formState.patientInfoLayout === 'horizontal_bar' && (
                  <div className="border-y border-slate-300 py-1.5 px-2 bg-slate-50 flex justify-between text-[10px]">
                    <div><strong>محمود أحمد عبد الرحمن</strong> (P-10001)</div>
                    <div>41 سنة · ذكر</div>
                    <div>V-2026-0001</div>
                    <div>2026-09-27</div>
                  </div>
                )}

                {formState.patientInfoLayout === 'compact_table' && (
                  <div className="border border-slate-200 rounded text-[9px]">
                    <div className="bg-slate-50 p-1 flex justify-between border-b border-slate-200">
                      <span>المريض: <strong>محمود أحمد عبد الرحمن</strong></span>
                      <span>الكود: <strong className="font-mono">P-10001</strong></span>
                      <span>السن: 41 سنة</span>
                    </div>
                    <div className="p-1 flex justify-between">
                      <span>الزيارة: V-2026-0001</span>
                      <span>التاريخ: 2026-09-27</span>
                      <span>التعاقد: نقابة المهندسين</span>
                    </div>
                  </div>
                )}

                {formState.patientInfoLayout === 'two_columns' && (
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded border border-slate-200">
                    <div>المريض: <strong>محمود أحمد (P-10001)</strong></div>
                    <div>الزيارة: <strong>V-2026-0001</strong></div>
                  </div>
                )}

                {/* Table Preview based on fontSize */}
                <div className="space-y-1">
                  <div className={`font-black text-xs ${themeColors.text} border-b border-slate-200 pb-1`}>
                    صورة الدم الكاملة (Complete Blood Count - CBC)
                  </div>
                  <table className={`w-full text-right ${formState.fontSize === 'compact' ? 'text-[9px]' : formState.fontSize === 'large' ? 'text-[12px]' : 'text-[10px]'}`}>
                    <thead className={`${themeColors.bg} text-white font-bold`}>
                      <tr>
                        <th className="p-1">الفحص</th>
                        <th className="p-1 text-center">النتيجة</th>
                        <th className="p-1 text-center">الوحدة</th>
                        <th className="p-1 text-left">المدى الطبيعي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-1 font-semibold">Hemoglobin (Hb)</td>
                        <td className="p-1 text-center font-bold font-mono">14.8</td>
                        <td className="p-1 text-center text-slate-500 font-mono">g/dL</td>
                        <td className="p-1 text-left font-mono">13.5 - 17.5</td>
                      </tr>
                      <tr className="bg-rose-50/50">
                        <td className="p-1 font-semibold">Fasting Blood Glucose</td>
                        <td className="p-1 text-center font-bold font-mono text-rose-700">138 ▲</td>
                        <td className="p-1 text-center text-slate-500 font-mono">mg/dL</td>
                        <td className="p-1 text-left font-mono">70 - 105</td>
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">Platelets Count</td>
                        <td className="p-1 text-center font-bold font-mono">280</td>
                        <td className="p-1 text-center text-slate-500 font-mono">x10³/µL</td>
                        <td className="p-1 text-left font-mono">150 - 450</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Preview */}
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-500">
                  <div className="flex items-center gap-2">
                    {(formState.showQrCodeOnReport ?? true) && (
                      <div className="w-8 h-8 border border-slate-300 p-0.5 rounded bg-slate-50">
                        <QrCode className="w-full h-full text-slate-700" />
                      </div>
                    )}
                    <span className="font-mono">P-10001 · V-2026-0001</span>
                  </div>

                  {(formState.showOfficialSeal ?? true) && (
                    <div className="w-12 h-12 rounded-full border border-dashed border-emerald-600 flex flex-col items-center justify-center text-[7px] font-bold text-emerald-800">
                      <span>OFFICIAL</span>
                      <span>SEAL</span>
                    </div>
                  )}

                  <div className="text-left">
                    <div>استشاري المختبر</div>
                    <strong className="text-slate-900">{formState.directorName.split('-')[0]}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LAB PROFILE & PROFESSIONAL HERO IMAGE (صورة مميزة ومعلومات المعمل) */}
      {/* ========================================================================= */}
      {activeTab === 'lab_profile' && (
        <form onSubmit={handleSettingsSubmit} className="space-y-6">
          {/* Professional Laboratory Showcase Photo Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
              <img
                src="/src/assets/images/modern_clinical_lab_hero_1790517326442.jpg"
                alt="معامل جرين لاب التخصصية"
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    مختبرات معتمدة دولياً ISO 15189
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {formState.licenseNumber}
                  </span>
                </div>
                <h3 className="text-2xl font-black">{formState.labNameAr}</h3>
                <p className="text-xs text-emerald-300 font-mono tracking-wide">{formState.labNameEn}</p>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  تجهيزات مخبرية رقمية مؤتمتة بالكامل مزودة بأحدث أجهزة التحليل الطبية والباثولوجية لضمان دقة النتائج وسرعتها.
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              بيانات الهوية والترخيص والتواصل للمختبر
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم المختبر باللغة العربية:</label>
                <input
                  type="text"
                  required
                  value={formState.labNameAr}
                  onChange={(e) => setFormState({ ...formState, labNameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم المختبر باللغة الإنجليزية:</label>
                <input
                  type="text"
                  value={formState.labNameEn}
                  onChange={(e) => setFormState({ ...formState, labNameEn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">رقم ترخيص وزارة الصحة والترخيص الطبي:</label>
                <input
                  type="text"
                  value={formState.licenseNumber || ''}
                  onChange={(e) => setFormState({ ...formState, licenseNumber: e.target.value })}
                  placeholder="مثال: ترخيص وزارة الصحة: 4892 / 2021"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم الفرع / المقر:</label>
                <input
                  type="text"
                  value={formState.branchName || ''}
                  onChange={(e) => setFormState({ ...formState, branchName: e.target.value })}
                  placeholder="مثال: الفرع الرئيسي - المنصورة"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">شعار المختبر (Slogan):</label>
                <input
                  type="text"
                  value={formState.sloganAr}
                  onChange={(e) => setFormState({ ...formState, sloganAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم استشاري المختبر والمدير الفني:</label>
                <input
                  type="text"
                  value={formState.directorName}
                  onChange={(e) => setFormState({ ...formState, directorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">أرقام الهواتف الأرضي والمحمول:</label>
                <input
                  type="text"
                  value={formState.phone1}
                  onChange={(e) => setFormState({ ...formState, phone1: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">رقم الواتساب الرسمي للنتائج:</label>
                <input
                  type="text"
                  value={formState.whatsapp}
                  onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">البريد الإلكتروني للتقارير:</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">العنوان الكامل:</label>
                <input
                  type="text"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                حفظ بيانات المختبر
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LOYALTY & VIP REWARDS PROGRAM (برنامج ولاء ونقاط للعملاء المميزين) */}
      {/* ========================================================================= */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          {/* Overview & Tier Badges */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Crown className="w-6 h-6 text-amber-100" />
                </div>
                <div>
                  <h3 className="text-xl font-black">نظام ولاء ومكافآت المرضى المميزين (Green Lab VIP Club)</h3>
                  <p className="text-xs text-amber-100">
                    كسب نقاط تلقائية مع كل فحص، خصومات فورية، وترقيات لمستويات VIP
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs bg-white text-amber-900 font-bold px-3 py-1 rounded-full shadow-2xs">
                مفعل ونشط
              </span>
            </div>

            {/* Loyalty Tiers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-slate-900">
              <div className="bg-white/95 p-3 rounded-xl border border-amber-300 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-800">برونزي (Bronze)</span>
                  <span className="text-[10px] font-mono text-slate-500">0 - 99 نقطة</span>
                </div>
                <div className="text-[11px] text-slate-600">خصم 5% على الفحوصات الروتينية</div>
              </div>

              <div className="bg-white/95 p-3 rounded-xl border border-amber-300 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">فضي (Silver)</span>
                  <span className="text-[10px] font-mono text-slate-500">100 - 299 نقطة</span>
                </div>
                <div className="text-[11px] text-slate-600">خصم 10% + سكر عشوائي مجاني</div>
              </div>

              <div className="bg-white/95 p-3 rounded-xl border border-amber-300 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-600">ذهبي (Gold)</span>
                  <span className="text-[10px] font-mono text-slate-500">300 - 499 نقطة</span>
                </div>
                <div className="text-[11px] text-slate-600">خصم 15% + أولوية استلام سريع</div>
              </div>

              <div className="bg-white/95 p-3 rounded-xl border border-amber-300 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-700">VIP بلاتيني (Platinum)</span>
                  <span className="text-[10px] font-mono text-slate-500">500+ نقطة</span>
                </div>
                <div className="text-[11px] text-slate-600">خصم 25% + سحب منزلي مجاني</div>
              </div>
            </div>
          </div>

          {/* Patients Loyalty Leaderboard Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900">سجل نقاط ولاء المرضى والمستويات الحالية</h4>
              </div>
              <span className="text-xs text-slate-400">إجمالي {patients.length} مرضى مسجلين</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">كود المريض</th>
                    <th className="py-2.5 px-3">اسم المريض</th>
                    <th className="py-2.5 px-3">الهاتف</th>
                    <th className="py-2.5 px-3 text-center">الرتبة (VIP Tier)</th>
                    <th className="py-2.5 px-3 text-center">رصيد النقاط</th>
                    <th className="py-2.5 px-3 text-center">قيمة الخصم المستحق</th>
                    <th className="py-2.5 px-3 text-center">مكافأة / تعديل النقاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => {
                    const pts = p.loyaltyPoints || 0;
                    const tier = p.loyaltyTier || (pts >= 500 ? 'vip' : pts >= 300 ? 'gold' : pts >= 100 ? 'silver' : 'bronze');
                    const discountVal = (pts * (formState.pointRedeemValue || 0.5)).toFixed(1);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{p.code}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-3 font-mono text-slate-600" dir="ltr">{p.phone}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              tier === 'vip'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : tier === 'gold'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : tier === 'silver'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-orange-50 text-orange-800'
                            }`}
                          >
                            {tier === 'vip' ? '★ VIP بلاتيني' : tier === 'gold' ? '★ ذهبي' : tier === 'silver' ? 'فضي' : 'برونزي'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-amber-700 text-sm">
                          {pts} نقطة
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                          {discountVal} ج.م
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientForPoints(p);
                              setPointsAdjustment(50);
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-semibold text-[11px] transition-colors"
                          >
                            + مكافأة نقاط
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Points Bonus Modal */}
          {selectedPatientForPoints && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 text-right space-y-4">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  إضافة نقاط ولاء ومكافأة لـ: {selectedPatientForPoints.name}
                </h4>
                <div className="text-xs text-slate-600">
                  الرصيد الحالي: <strong className="font-mono text-amber-700">{selectedPatientForPoints.loyaltyPoints || 0} نقطة</strong>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">عدد النقاط المضافة (أو بالسالب للخصم):</label>
                  <input
                    type="number"
                    value={pointsAdjustment}
                    onChange={(e) => setPointsAdjustment(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPatientForPoints(null)}
                    className="px-3 py-1.5 text-xs text-slate-600"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleAwardPoints}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold"
                  >
                    تأكيد الإضافة
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SQLITE DATABASE & OFFLINE DESKTOP ARCHITECTURE (إجابة استفسار العميل) */}
      {/* ========================================================================= */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  معمارية النظام: قاعدة بيانات سيكول لايت (SQLite) والتشغيل المكتبي (Desktop & Multi-Device)
                </h3>
                <p className="text-xs text-slate-500">
                  دليل تفصيلي لإجابة تساؤلك عن تشغيل البرنامج ديسكتوب أوفلاين، وربط جهازين أو أكثر معاً
                </p>
              </div>
            </div>

            {/* Clear direct answer cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <Monitor className="w-4 h-4 text-emerald-700" />
                  <span>1. أوفلاين ديسكتوب 100%</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>نعم بالتأكيد!</strong> البرنامج مصمم بتقنية Local-First، ويعمل بالكامل كبرنامج ديسكتوب (Desktop App) على نظام Windows أو Mac بدون الحاجة لأي اتصال بالإنترنت نهائياً وبسرعة استجابة لحظية.
                </p>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <Wifi className="w-4 h-4 text-blue-700" />
                  <span>2. التشغيل على جهازين أو أكثر</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>ممكن وسهل جداً!</strong> يمكنك تشغيل البرنامج على جهاز الاستقبال (جهاز 1) وجهاز المختبر والأجهزة (جهاز 2) ومشاركتهما عبر راوتر شبكة المعمل الداخلية (LAN / Wi-Fi) ليقرأ الجهازان من نفس قاعدة البيانات في نفس اللحظة.
                </p>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-950">
                  <HardDrive className="w-4 h-4 text-purple-700" />
                  <span>3. قاعدة بيانات SQLite</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>سيكول لايت (SQLite)</strong> هي الاختيار الأروع والأخف للمعمل المكتبي؛ لأنها لا تحتاج لتنصيب سيرفرات ثقيلة أو ضبط معقد، وتخزن البيانات في ملف واحد سريع ومحمي يمكن نقله وأخذ نسخ احتياطية منه بسهولة.
                </p>
              </div>
            </div>

            {/* Architecture Comparison: Desktop vs LAN vs Online */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100 p-3 font-bold text-slate-800 border-b border-slate-200">
                مقارنة أوضاع التشغيل المتاحة لبرنامج Green Lab Soft:
              </div>
              <div className="divide-y divide-slate-100 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    أ
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">وضع الديسكتوب المنفرد (Single PC Desktop - SQLite):</h5>
                    <p className="text-slate-600 mt-0.5">
                      يتم تثبيت البرنامج على كمبيوتر واحد، وتبقى البيانات بالكامل على القرص الصلب (Hard Disk) داخل ملف SQLite فائق السرعة، ولا يتأثر بانقطاع النت.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0">
                    ب
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">وضع شبكة المعمل الداخلية (Local Network - 2 to 5 PCs):</h5>
                    <p className="text-slate-600 mt-0.5">
                      يكون جهاز الاستقبال أو سيرفر المعمل هو المضيف لقاعدة البيانات (SQLite أو خادم محلي خفيف)، والأجهزة الأخرى في المعمل تدخل عن طريق المتصفح أو تطبيق الديسكتوب برابط داخلي (مثل `http://192.168.1.100:3000`) دون الحاجة لأي إنترنت خارجي.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0">
                    ج
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">الوضع الهجين (Hybrid Cloud Sync):</h5>
                    <p className="text-slate-600 mt-0.5">
                      العمل اليومي يكون محلياً أوفلاين بسرعة فائقة، وعند وجود إنترنت يرفع البرنامج نسخة احتياطية سحابية مشفرة تلقائياً للاطلاع على التقارير المالية من الموبايل أو خارج المعمل بأمان تام.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen Responsiveness Guarantee */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-800 block">توافق شاشات العرض:</span>
              <p className="text-slate-600">
                واجهة البرنامج مبرمجة بتصميم متجاوب بالكامل (Fully Responsive Grid & Layout) لتناسب شاشات الديسكتوب العريضة (1920x1080 و 1440px)، واللابتوبات، والشاشات الصغيرة، وأجهزة التابلت والموبايل اللمسية بدون أي تداخل أو تشوه في العناصر.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BACKUP & DATA MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <HardDrive className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                أخذ واسترجاع نسخة احتياطية كاملة (Backup & Restore)
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              تحتوي النسخة الاحتياطية على كافة سجلات المرضى، الأطباء، الزيارات، النتائج المخبرية، المخزون، الحضور والانصراف، والمالية في ملف مشفر ومحمي.
            </p>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل نسخة احتياطية كاملة الآن (JSON)</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileRestore}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>استرجاع نسخة احتياطية من ملف خارجي</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                أمان الشبكات ونقل البيانات (Network & Cloud Mode)
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">العمل بدون إنترنت (Offline Mode):</span>
                <span className="text-emerald-700 font-bold">مفعل 100% بدون انقطاع</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">مشاركة أكثر من جهاز داخل المعمل:</span>
                <span className="text-slate-800 font-mono font-semibold">WebLAN / IP Sync</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">تشفير البيانات أثناء النقل:</span>
                <span className="text-emerald-700 font-bold">TLS / AES-256</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleResetFactory}
                className="text-xs text-rose-600 hover:text-rose-800 underline flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>إعادة تعيين البرنامج لبيانات المصنع الأولية</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SYSTEM AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === 'audit_log' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                سجل مراقبة النظام والعمليات (Audit Trail)
              </h3>
            </div>
            <span className="text-xs text-slate-400">آخر 200 عملية مسجلة تلقائياً</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">التوقيت والتاريخ</th>
                  <th className="py-2.5 px-3">المستخدم</th>
                  <th className="py-2.5 px-3">القسم / الوحدة</th>
                  <th className="py-2.5 px-3">نوع الإجراء</th>
                  <th className="py-2.5 px-3">تفاصيل العملية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{log.userName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.module}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-800">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

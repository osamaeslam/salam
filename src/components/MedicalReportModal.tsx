import React, { useState } from 'react';
import {
  Printer,
  X,
  Mail,
  Share2,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  Send,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Building,
  User,
  Clock,
  QrCode,
  Award,
} from 'lucide-react';
import { Visit, Patient, TestResultRecord, LabSettings } from '../types';
import { generateBarcodeSVG, generateQrSVG } from '../utils/barcode';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  patient?: Patient;
  results: TestResultRecord[];
  settings: LabSettings;
}

const PARAM_NAMES_MAP: Record<string, { en: string; ar: string }> = {
  'c-hb': { en: 'Hemoglobin (Hb)', ar: 'الهيموجلوبين' },
  'c-rbc': { en: 'RBCs Count', ar: 'كرات الدم الحمراء' },
  'c-hct': { en: 'Hematocrit (PCV)', ar: 'الهيماتوكريت' },
  'c-mcv': { en: 'MCV', ar: 'متوسط حجم الكرية' },
  'c-mch': { en: 'MCH', ar: 'متوسط هيموجلوبين الكرية' },
  'c-mchc': { en: 'MCHC', ar: 'تركيز هيموجلوبين الكرية' },
  'c-wbc': { en: 'Total Leucocyte Count (TLC / WBC)', ar: 'كرات الدم البيضاء الكلية' },
  'c-neut': { en: 'Neutrophils', ar: 'الخلايا المتعادلة' },
  'c-lymph': { en: 'Lymphocytes', ar: 'الخلايا الليمفاوية' },
  'c-plt': { en: 'Platelets Count', ar: 'الصفائح الدموية' },
  'c-fbs-val': { en: 'Fasting Blood Glucose (FBS)', ar: 'سكر الدم صائم' },
  'c-hba1c-val': { en: 'Glycated Hemoglobin (HbA1c)', ar: 'السكر التراكمي' },
  'c-sgot': { en: 'AST (SGOT)', ar: 'إنزيم الكبد AST' },
  'c-sgpt': { en: 'ALT (SGPT)', ar: 'إنزيم الكبد ALT' },
  'c-tbili': { en: 'Total Bilirubin', ar: 'الصفراء الكلية' },
  'c-dbili': { en: 'Direct Bilirubin', ar: 'الصفراء المباشرة' },
  'c-alb': { en: 'Serum Albumin', ar: 'الألبومين' },
  'c-creat': { en: 'Serum Creatinine', ar: 'الكرياتينين' },
  'c-urea': { en: 'Blood Urea', ar: 'البولينا' },
  'c-uric': { en: 'Serum Uric Acid', ar: 'حمض البوليك' },
  'c-chol': { en: 'Total Cholesterol', ar: 'الكوليسترول الكلي' },
  'c-trig': { en: 'Triglycerides', ar: 'الدهون الثلاثية' },
  'c-hdl': { en: 'HDL Cholesterol', ar: 'الكوليسترول النافع' },
  'c-ldl': { en: 'LDL Cholesterol', ar: 'الكوليسترول الضار' },
  'c-tsh-val': { en: 'TSH Level', ar: 'هرمون الغدة الدرقية' },
};

export const MedicalReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  visit,
  patient,
  results,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'email' | 'whatsapp'>('preview');
  const [emailTo, setEmailTo] = useState(patient?.notes?.includes('@') ? patient.notes : 'patient@example.com');
  const [emailSent, setEmailSent] = useState(false);

  // Layout and theme overrides initialized from saved settings
  const [templateTheme, setTemplateTheme] = useState<LabSettings['reportTheme']>(settings.reportTheme || 'emerald');
  const [logoPosition, setLogoPosition] = useState<LabSettings['logoPosition']>(settings.logoPosition || 'right');
  const [patientInfoLayout, setPatientInfoLayout] = useState<LabSettings['patientInfoLayout']>(settings.patientInfoLayout || 'cards_grid');
  const [fontSize, setFontSize] = useState<LabSettings['fontSize']>(settings.fontSize || 'standard');
  const [showWatermark, setShowWatermark] = useState<boolean>(settings.showWatermark ?? true);
  const [showArabicInReport, setShowArabicInReport] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
    setTimeout(() => {
      setEmailSent(false);
    }, 4000);
  };

  const handleSendWhatsApp = () => {
    const msg = encodeURIComponent(
      `مرحباً ${visit.patientName}،\nيسر إدارة ${settings.labNameAr} إخطاركم بصدور واعتماد تقرير نتائج الفحوصات الطبية رسمياً:\n- كود المريض: ${visit.patientCode}\n- رقم الزيارة: ${visit.visitCode}\n- الطبيب المعالج: ${visit.doctorName || 'طبيب خاص'}\n- التاريخ: ${visit.date}\nنتمنى لكم موفور الصحة والعافية.`
    );
    window.open(`https://wa.me/2${patient?.phone || '01012345678'}?text=${msg}`, '_blank');
  };

  // Color schemes for ultra-chic A4 report styling
  const themes = {
    emerald: {
      primary: 'text-emerald-900',
      accentBg: 'bg-emerald-800',
      accentText: 'text-emerald-800',
      borderLine: 'border-emerald-700',
      subtleBg: 'bg-emerald-50/70',
      sealBorder: 'border-emerald-600 text-emerald-800',
      tableHeader: 'bg-emerald-900 text-white',
      badgeHigh: 'bg-rose-100 text-rose-800 border-rose-200',
      badgeLow: 'bg-amber-100 text-amber-800 border-amber-200',
      badgeNormal: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    sapphire: {
      primary: 'text-blue-950',
      accentBg: 'bg-blue-900',
      accentText: 'text-blue-900',
      borderLine: 'border-blue-700',
      subtleBg: 'bg-blue-50/70',
      sealBorder: 'border-blue-600 text-blue-800',
      tableHeader: 'bg-blue-950 text-white',
      badgeHigh: 'bg-rose-100 text-rose-800 border-rose-200',
      badgeLow: 'bg-amber-100 text-amber-800 border-amber-200',
      badgeNormal: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    burgundy: {
      primary: 'text-rose-950',
      accentBg: 'bg-rose-900',
      accentText: 'text-rose-900',
      borderLine: 'border-rose-700',
      subtleBg: 'bg-rose-50/70',
      sealBorder: 'border-rose-600 text-rose-800',
      tableHeader: 'bg-rose-950 text-white',
      badgeHigh: 'bg-rose-100 text-rose-800 border-rose-200',
      badgeLow: 'bg-amber-100 text-amber-800 border-amber-200',
      badgeNormal: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    navy: {
      primary: 'text-indigo-950',
      accentBg: 'bg-indigo-900',
      accentText: 'text-indigo-900',
      borderLine: 'border-indigo-700',
      subtleBg: 'bg-indigo-50/70',
      sealBorder: 'border-indigo-600 text-indigo-800',
      tableHeader: 'bg-indigo-950 text-white',
      badgeHigh: 'bg-rose-100 text-rose-800 border-rose-200',
      badgeLow: 'bg-amber-100 text-amber-800 border-amber-200',
      badgeNormal: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    classic: {
      primary: 'text-slate-900',
      accentBg: 'bg-slate-900',
      accentText: 'text-slate-900',
      borderLine: 'border-slate-800',
      subtleBg: 'bg-slate-50',
      sealBorder: 'border-slate-700 text-slate-800',
      tableHeader: 'bg-slate-900 text-white',
      badgeHigh: 'bg-rose-100 text-rose-800 border-rose-200',
      badgeLow: 'bg-amber-100 text-amber-800 border-amber-200',
      badgeNormal: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  }[templateTheme];

  const fontClasses = {
    compact: {
      body: 'text-[11px]',
      table: 'text-[10px]',
      heading: 'text-sm font-black',
      val: 'text-xs font-bold font-mono',
    },
    standard: {
      body: 'text-xs',
      table: 'text-xs',
      heading: 'text-base font-black',
      val: 'text-sm font-black font-mono',
    },
    large: {
      body: 'text-sm',
      table: 'text-sm',
      heading: 'text-lg font-black',
      val: 'text-base font-black font-mono',
    },
  }[fontSize];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden text-right flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>تقرير التحاليل الطبية الرسمي الفاخر (A4)</span>
                <span className="text-xs font-mono font-normal bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  {visit.visitCode}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                منسق بالكامل باسم المعمل، اسم الأطباء، وتوزيع البيانات المختار في الإعدادات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'preview' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                معاينة الطباعة A4
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'email' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>إرسال إيميل</span>
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'whatsapp' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>واتساب</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              title="طباعة التقرير فوراً"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة A4</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center print:bg-white print:p-0 print:overflow-visible">
          {activeTab === 'preview' && (
            <div className="w-full max-w-[850px] space-y-4 print:space-y-0 print:max-w-none print:w-full">
              
              {/* Quick Live Preview Controls (Hidden on Print) */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs print:hidden">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">تغيير سريع للطابع:</span>
                  <div className="flex items-center gap-1">
                    {(['emerald', 'sapphire', 'burgundy', 'navy', 'classic'] as const).map((th) => (
                      <button
                        key={th}
                        onClick={() => setTemplateTheme(th)}
                        className={`px-2.5 py-1 rounded-md font-bold text-xs border transition-colors ${
                          templateTheme === th
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {th === 'emerald' ? 'زمردي' : th === 'sapphire' ? 'ياقوتي' : th === 'burgundy' ? 'عنابي' : th === 'navy' ? 'كحلي' : 'كلاسيك'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">حجم الخط:</span>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value as any)}
                      className="px-2 py-0.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="compact">مكثف (Compact)</option>
                      <option value="standard">قياسي (Standard)</option>
                      <option value="large">كبير (Large)</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>الختم المائي</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowArabicInReport(!showArabicInReport)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs border transition-colors flex items-center gap-1.5 ${
                      showArabicInReport
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    }`}
                    title="التبديل بين التقرير الطبي الإنجليزي بالكامل أو إظهار ترجمة عربية للفحوصات"
                  >
                    <span>{showArabicInReport ? '✓ إظهار الترجمة العربية للفحوصات' : 'إنجليزي بالكامل (English Only)'}</span>
                  </button>
                </div>
              </div>

              {/* ----------------- THE LUXURY A4 REPORT SHEET ----------------- */}
              <div
                className={`printable-report-card bg-white p-8 sm:p-10 shadow-xl rounded-md border border-slate-300 text-slate-900 font-sans relative flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0 print:w-full min-h-[1100px] ${fontClasses.body}`}
                style={{ minHeight: '297mm' }}
              >
                {/* Decorative Top Accent Bar */}
                <div className={`h-2.5 w-full ${themes.accentBg} rounded-t-sm mb-4 print:mb-2`} />

                <div>
                  {/* 1. DYNAMIC OFFICIAL LAB HEADER (Based on logoPosition) */}
                  <div className="border-b-2 border-slate-200 pb-5">
                    {/* CASE A: LOGO ON RIGHT (Default Arabic) */}
                    {logoPosition === 'right' && (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex flex-col items-center justify-center shadow-sm shrink-0 border border-emerald-500/30">
                            <span className="font-serif font-black text-xl tracking-tighter leading-none">GL</span>
                            <span className="text-[9px] uppercase tracking-widest font-mono font-bold">LAB</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h1 className={`text-2xl font-black tracking-tight ${themes.primary}`}>
                                {settings.labNameAr}
                              </h1>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                                <Award className="w-3 h-3 text-emerald-600" />
                                معتمد
                              </span>
                            </div>
                            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                              {settings.labNameEn}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5 font-medium italic">
                              "{settings.sloganAr}"
                            </p>
                            {settings.licenseNumber && (
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {settings.licenseNumber} · {settings.branchName}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-left font-mono text-xs text-slate-600 space-y-1">
                          <div className="font-bold text-slate-800">{settings.phone1} / {settings.phone2}</div>
                          <div className="text-emerald-700">WhatsApp: {settings.whatsapp}</div>
                          <div className="text-slate-500">{settings.email}</div>
                          <div className="text-[11px] text-slate-400 font-sans">{settings.address}</div>
                        </div>
                      </div>
                    )}

                    {/* CASE B: LOGO ON LEFT */}
                    {logoPosition === 'left' && (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h1 className={`text-2xl font-black tracking-tight ${themes.primary}`}>
                              {settings.labNameAr}
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                              <Award className="w-3 h-3 text-emerald-600" />
                              معتمد
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                            {settings.labNameEn}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5 font-medium italic">
                            "{settings.sloganAr}"
                          </p>
                          <div className="text-xs font-mono text-slate-600 mt-1 space-x-3 space-x-reverse">
                            <span>هاتف: {settings.phone1}</span>
                            <span>واتساب: {settings.whatsapp}</span>
                            <span>{settings.address}</span>
                          </div>
                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex flex-col items-center justify-center shadow-md shrink-0 border border-emerald-500/30">
                          <span className="font-serif font-black text-2xl tracking-tighter leading-none">GL</span>
                          <span className="text-[9px] uppercase tracking-widest font-mono font-bold">LAB</span>
                        </div>
                      </div>
                    )}

                    {/* CASE C: CENTERED EMBLEM LOGO */}
                    {logoPosition === 'center' && (
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex flex-col items-center justify-center shadow-md border border-emerald-500/30">
                          <span className="font-serif font-black text-xl tracking-tighter leading-none">GL</span>
                          <span className="text-[8px] uppercase tracking-widest font-mono font-bold">LAB</span>
                        </div>
                        <h1 className={`text-2xl font-black tracking-tight ${themes.primary}`}>
                          {settings.labNameAr}
                        </h1>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest font-semibold">
                          {settings.labNameEn}
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-600 pt-1">
                          <span>هاتف: {settings.phone1}</span>
                          <span>·</span>
                          <span>واتساب: {settings.whatsapp}</span>
                          <span>·</span>
                          <span>{settings.address}</span>
                        </div>
                      </div>
                    )}

                    {/* CASE D: WATERMARK LOGO */}
                    {logoPosition === 'watermark' && (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h1 className={`text-2xl font-black tracking-tight ${themes.primary}`}>
                            {settings.labNameAr}
                          </h1>
                          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest font-semibold">
                            {settings.labNameEn} · {settings.sloganAr}
                          </p>
                        </div>
                        <div className="text-left font-mono text-xs text-slate-600">
                          <div>هاتف: {settings.phone1}</div>
                          <div>{settings.address}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. DOCTORS & DIRECTORS PROMINENT RIBBON */}
                  {(settings.showDoctorRibbon ?? true) && (
                    <div className={`mt-3 py-2 px-4 ${themes.subtleBg} rounded-lg border border-slate-200 flex flex-wrap items-center justify-between text-xs`}>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-emerald-700" />
                        <span className="text-slate-500">الطبيب المعالج (Referred By):</span>
                        <strong className="text-slate-900 font-bold text-sm">
                          {visit.doctorName || 'كشف ومتابعة خاصة (Direct Patient)'}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-700" />
                        <span className="text-slate-500">المدير الفني للمختبر:</span>
                        <strong className="text-slate-900 font-bold">
                          {settings.directorName}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* 3. DYNAMIC PATIENT & VISIT METADATA (Based on patientInfoLayout) */}
                  {/* LAYOUT 1: CARDS GRID */}
                  {patientInfoLayout === 'cards_grid' && (
                    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">اسم المريض (Patient Name)</span>
                        <strong className="text-slate-900 font-black text-sm block truncate">
                          {visit.patientName}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">كود المريض (Patient ID)</span>
                        <span className="font-mono font-black text-emerald-800 text-sm">{visit.patientCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">العمر والنوع (Age / Gender)</span>
                        <span className="font-semibold text-slate-800">
                          {visit.patientAge} · {visit.patientGender === 'male' ? 'ذكر' : visit.patientGender === 'female' ? 'أنثى' : 'طفل'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">رقم الزيارة (Visit ID)</span>
                        <span className="font-mono font-bold text-slate-900">{visit.visitCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">تاريخ وساعة السحب</span>
                        <span className="font-mono text-slate-700">{visit.date} {visit.time}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">تاريخ الاعتماد</span>
                        <span className="font-mono font-bold text-emerald-800">{new Date().toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">التعاقد</span>
                        <span className="text-slate-800 font-medium">{visit.contractName || 'خاص (Private)'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">حالة التقرير</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          معتمد ونهائي
                        </span>
                      </div>
                    </div>
                  )}

                  {/* LAYOUT 2: HORIZONTAL MODERN RIBBON */}
                  {patientInfoLayout === 'horizontal_bar' && (
                    <div className="mt-3 border-y-2 border-slate-300 py-3 px-4 bg-slate-50/50 flex flex-wrap items-center justify-between gap-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px]">المريض: </span>
                        <strong className="text-slate-900 font-black text-sm">{visit.patientName}</strong>
                        <span className="font-mono text-emerald-800 font-bold mr-2">({visit.patientCode})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">السن/النوع: </span>
                        <span className="font-semibold">{visit.patientAge} · {visit.patientGender === 'male' ? 'ذكر' : 'أنثى'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">الزيارة: </span>
                        <span className="font-mono font-bold">{visit.visitCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">التاريخ: </span>
                        <span className="font-mono">{visit.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">التعاقد: </span>
                        <span>{visit.contractName || 'خاص'}</span>
                      </div>
                    </div>
                  )}

                  {/* LAYOUT 3: COMPACT DATA TABLE */}
                  {patientInfoLayout === 'compact_table' && (
                    <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden text-xs">
                      <table className="w-full text-right">
                        <tbody>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <td className="py-1.5 px-3 font-semibold text-slate-500 w-1/4">اسم المريض:</td>
                            <td className="py-1.5 px-3 font-black text-slate-900 w-1/4">{visit.patientName}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-500 w-1/4">كود المريض:</td>
                            <td className="py-1.5 px-3 font-mono font-bold text-emerald-800 w-1/4">{visit.patientCode}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-1.5 px-3 font-semibold text-slate-500">السن والنوع:</td>
                            <td className="py-1.5 px-3">{visit.patientAge} · {visit.patientGender === 'male' ? 'ذكر' : 'أنثى'}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-500">رقم الزيارة:</td>
                            <td className="py-1.5 px-3 font-mono font-bold">{visit.visitCode}</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="py-1.5 px-3 font-semibold text-slate-500">تاريخ السحب:</td>
                            <td className="py-1.5 px-3 font-mono">{visit.date} {visit.time}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-500">التعاقد:</td>
                            <td className="py-1.5 px-3">{visit.contractName || 'خاص'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* LAYOUT 4: TWO COLUMNS */}
                  {patientInfoLayout === 'two_columns' && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase">بيانات المريض</div>
                        <div>الاسم: <strong className="text-slate-900 text-sm">{visit.patientName}</strong></div>
                        <div>كود المريض: <strong className="font-mono text-emerald-800">{visit.patientCode}</strong></div>
                        <div>السن والنوع: <span>{visit.patientAge} · {visit.patientGender === 'male' ? 'ذكر' : 'أنثى'}</span></div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase">بيانات الزيارة والاعتماد</div>
                        <div>رقم الزيارة: <strong className="font-mono">{visit.visitCode}</strong></div>
                        <div>تاريخ السحب: <span className="font-mono">{visit.date} {visit.time}</span></div>
                        <div>التعاقد: <span>{visit.contractName || 'خاص'}</span></div>
                      </div>
                    </div>
                  )}

                  {/* 4. RESULTS TABLES SECTION */}
                  <div className="mt-6 space-y-7">
                    {results.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl">
                        لم يتم تسجيل نتائج لهذه الزيارة بعد. يمكنك إدخال القيم ومراجعتها من تبويب "إدخال النتائج والمختبر".
                      </div>
                    ) : (
                      results.map((res) => (
                        <div key={res.id} className="space-y-2.5">
                          {/* Test Title Header */}
                          <div className="flex items-center justify-between border-b-2 border-slate-300 pb-1.5" dir="ltr">
                            <div className="flex items-center gap-2">
                              <h3 className={fontClasses.heading}>
                                <span className={themes.primary}>{res.testNameEn || res.testNameAr}</span>
                              </h3>
                              {showArabicInReport && (
                                <span className="text-xs text-slate-500 font-medium" dir="rtl">
                                  ({res.testNameAr})
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-mono font-semibold">
                              {res.category}
                            </span>
                          </div>

                          {/* Components Table */}
                          {Object.keys(res.values).length > 0 && (
                            <table className={`w-full ${fontClasses.table} border border-slate-200 rounded-lg overflow-hidden`}>
                              <thead className={`${themes.tableHeader} font-bold text-[11px]`}>
                                <tr dir="ltr">
                                  <th className="py-2.5 px-3 text-left">Parameter</th>
                                  <th className="py-2.5 px-3 text-center">Result</th>
                                  <th className="py-2.5 px-3 text-center">Unit</th>
                                  <th className="py-2.5 px-3 text-left">Reference Range</th>
                                  <th className="py-2.5 px-3 text-center">Flag</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {Object.entries(res.values).map(([cId, item], rowIdx) => {
                                  const isHigh = item.flag === 'high';
                                  const isLow = item.flag === 'low';
                                  const isCritical = item.flag === 'critical';
                                  const meta = PARAM_NAMES_MAP[cId] || {
                                    en: cId.replace('c-', '').replace('-', ' ').toUpperCase(),
                                    ar: '',
                                  };

                                  return (
                                    <tr
                                      key={cId}
                                      dir="ltr"
                                      className={`transition-colors ${
                                        rowIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                                      } ${isHigh || isLow || isCritical ? 'bg-rose-50/40' : ''}`}
                                    >
                                      <td className="py-2.5 px-3 text-left">
                                        <span className="font-bold text-slate-900 block font-sans text-xs">
                                          {meta.en}
                                        </span>
                                        {showArabicInReport && meta.ar && (
                                          <span className="text-[10px] text-slate-500 font-medium block" dir="rtl">
                                            {meta.ar}
                                          </span>
                                        )}
                                      </td>
                                      <td
                                        className={`py-2.5 px-3 text-center tabular-nums ${fontClasses.val} ${
                                          isHigh
                                            ? 'text-rose-700'
                                            : isLow
                                            ? 'text-amber-700'
                                            : 'text-slate-900'
                                        }`}
                                      >
                                        {item.value}
                                        {isHigh && <span className="ml-1 text-xs text-rose-600">▲</span>}
                                        {isLow && <span className="ml-1 text-xs text-amber-600">▼</span>}
                                      </td>
                                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 font-bold" dir="ltr">
                                        {item.normalRangeText.split(' ')[1] || '-'}
                                      </td>
                                      <td className="py-2.5 px-3 text-left font-mono text-slate-700 text-xs font-semibold" dir="ltr">
                                        {item.normalRangeText}
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        {isHigh ? (
                                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${themes.badgeHigh}`}>
                                            High
                                          </span>
                                        ) : isLow ? (
                                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${themes.badgeLow}`}>
                                            Low
                                          </span>
                                        ) : (
                                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${themes.badgeNormal}`}>
                                            Normal
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}

                          {/* Culture & Antibiogram Section */}
                          {res.cultureData && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>تقرير المزرعة البكتيرية وحساسية المضادات الحيوية (Antibiogram):</span>
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>الميكروب: <strong className="text-slate-900">{res.cultureData.organism}</strong></div>
                                <div>العد البكتيري: <strong className="font-mono">{res.cultureData.colonyCount}</strong></div>
                                <div>نوع العينة: <span>{res.cultureData.specimen}</span></div>
                                <div>النمو: <span>{res.cultureData.growth}</span></div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                                {res.cultureData.antibiotics.map((ab, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between items-center text-[11px] p-2 bg-white border border-slate-200 rounded-lg"
                                  >
                                    <span className="font-semibold text-slate-800 truncate">{ab.antibiotic}</span>
                                    <strong
                                      className={`font-mono text-xs px-2 py-0.5 rounded ${
                                        ab.sensitivity.includes('(S)')
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : ab.sensitivity.includes('(R)')
                                          ? 'bg-rose-100 text-rose-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {ab.sensitivity.split(' ')[0]}
                                    </strong>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Semen CASA Section */}
                          {res.semenData && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                              <h4 className="font-bold text-xs text-slate-800">
                                نتائج فحص السائل المنوي المحوسب (Computer Assisted Semen Analysis - CASA):
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>العدد الكلي: <strong className="font-mono text-emerald-800 text-sm">{res.semenData.totalCount} Mil/ml</strong></div>
                                <div>الحركة التقدمية (PR): <strong className="font-mono text-blue-700">{res.semenData.progressiveMotility}%</strong></div>
                                <div>الأشكال الطبيعية: <strong className="font-mono">{res.semenData.normalMorphology}%</strong></div>
                                <div>الحجم: <strong className="font-mono">{res.semenData.volume} ml</strong></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 5. LUXURY FOOTER & OFFICIAL SEAL */}
                <div className="mt-8 pt-5 border-t-2 border-slate-300">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Left: Verification Barcode & QR Code */}
                    <div className="flex items-center gap-4">
                      {(settings.showQrCodeOnReport ?? true) && (
                        <div
                          className="w-16 h-16 border-2 border-slate-300 p-1 rounded-lg bg-white shrink-0 shadow-2xs"
                          dangerouslySetInnerHTML={{
                            __html: generateQrSVG(`https://greenlabsoft.com/verify?visit=${visit.visitCode}&patient=${visit.patientCode}`, 60),
                          }}
                        />
                      )}
                      <div className="space-y-1">
                        {(settings.showBarcode ?? true) && (
                          <div
                            className="w-48"
                            dangerouslySetInnerHTML={{
                              __html: generateBarcodeSVG(`${visit.patientCode}-${visit.visitCode}`, 30, 1.4),
                            }}
                          />
                        )}
                        <div className="font-mono text-[11px] font-black text-slate-800">
                          {visit.patientCode} · {visit.visitCode}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          امسح كود QR أو الباركود للتأكد من أصل النتيجة إلكترونياً
                        </p>
                      </div>
                    </div>

                    {/* Center: Official Lab Quality Seal */}
                    {showWatermark && (settings.showOfficialSeal ?? true) && (
                      <div className={`hidden md:flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 border-dashed ${themes.sealBorder} p-2 text-center`}>
                        <Award className="w-6 h-6 mb-0.5 opacity-80" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">OFFICIAL LAB</span>
                        <span className="text-[8px] font-black font-mono">SEAL & VERIFIED</span>
                        <span className="text-[8px] text-slate-500 font-mono">2026/09</span>
                      </div>
                    )}

                    {/* Right: Pathologist Signature Box */}
                    <div className="text-left space-y-1 min-w-[200px]">
                      <div className="text-xs text-slate-500 font-semibold">استشاري الباثولوجيا والتحاليل الطبية</div>
                      <div className="font-black text-base text-slate-900">{settings.directorName}</div>
                      <div className="font-mono text-[11px] text-emerald-800 font-bold flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>معتمد وموثق رقمياً</span>
                      </div>
                      <div className="h-8 border-b border-dashed border-slate-300 w-40 ml-auto" />
                    </div>
                  </div>

                  {/* Bottom Disclaimer */}
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                    <span>* نتائج هذه التحاليل للاستخدام الطبي السريري ويجب مطابقتها مع الفحص الإكلينيكي بواسطة الطبيب المعالج.</span>
                    <span className="font-mono">Green Lab Soft Medical System</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="w-full max-w-lg bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">إرسال تقرير التحاليل A4 عبر البريد الإلكتروني</h4>
                  <p className="text-xs text-slate-500">سيتم إرسال نسخة PDF الرسمية المعتمدة فوراً إلى بريد العميل</p>
                </div>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">بريد العميل:</label>
                  <input
                    type="email"
                    required
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">عنوان الرسالة:</label>
                  <input
                    type="text"
                    readOnly
                    value={`تقرير النتائج الطبية المعتمد - ${settings.labNameAr} - كود (${visit.patientCode})`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {emailSent && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>تم إرسال التقرير بنجاح إلى ({emailTo})!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  إرسال التقرير الآن
                </button>
              </form>
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="w-full max-w-lg bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">إرسال إشعار النتيجة والتقرير عبر واتساب</h4>
                  <p className="text-xs text-slate-500">إشعار فوري على رقم هاتف المريض المسجل</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">رقم الهاتف:</label>
                  <div className="font-mono text-sm font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-left" dir="ltr">
                    +2{patient?.phone || '01012345678'}
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-xs text-slate-700 space-y-1">
                  <strong>نص الرسالة المرسلة:</strong>
                  <p>
                    مرحباً {visit.patientName}، يسر معمل {settings.labNameAr} إخطاركم بصدور واعتماد تقرير نتائج الفحوصات الطبية رسمياً لكود المريض ({visit.patientCode}).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  فتح واتساب وإرسال الإشعار
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Print Button Action */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            تنسيق A4 ليزري عالي الدقة (يمكن الطباعة مباشرة عبر الطابعة أو الحفظ كـ PDF)
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              إغلاق
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير الطبي A4 الآن</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

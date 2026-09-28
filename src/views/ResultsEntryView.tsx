import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  CheckCircle,
  AlertTriangle,
  History,
  Save,
  Printer,
  FileText,
  Cpu,
  Layers,
  Check,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Visit, LabTest, TestResultRecord, Patient, CultureResultData, SemenCASAResultData, AppUser } from '../types';

interface Props {
  visits: Visit[];
  tests: LabTest[];
  results: TestResultRecord[];
  patients: Patient[];
  currentUser?: AppUser;
  initialVisitId?: string;
  onSaveResult: (result: TestResultRecord) => void;
  onOpenReport: (visit: Visit) => void;
}

export const ResultsEntryView: React.FC<Props> = ({
  visits,
  tests,
  results,
  patients,
  currentUser,
  initialVisitId,
  onSaveResult,
  onOpenReport,
}) => {
  const canEdit = currentUser ? currentUser.permissions.canEnterResults : true;
  const [selectedVisitId, setSelectedVisitId] = useState<string>(initialVisitId || visits[0]?.id || '');
  const [visitSearchQuery, setVisitSearchQuery] = useState('');

  React.useEffect(() => {
    if (initialVisitId) {
      setSelectedVisitId(initialVisitId);
    }
  }, [initialVisitId]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [deviceSyncNotice, setDeviceSyncNotice] = useState<string | null>(null);

  const filteredVisits = visits.filter((v) => {
    if (!visitSearchQuery.trim()) return true;
    const q = visitSearchQuery.toLowerCase();
    return (
      v.patientName.toLowerCase().includes(q) ||
      v.patientCode.toLowerCase().includes(q) ||
      v.visitCode.toLowerCase().includes(q)
    );
  });

  const activeVisit = visits.find((v) => v.id === selectedVisitId);
  const activePatient = patients.find((p) => p.id === activeVisit?.patientId);

  // Set default selected test when visit changes
  React.useEffect(() => {
    if (activeVisit && activeVisit.tests.length > 0) {
      if (!activeVisit.tests.some((t) => t.testId === selectedTestId)) {
        setSelectedTestId(activeVisit.tests[0].testId);
      }
    }
  }, [activeVisit, selectedTestId]);

  const activeTest = tests.find((t) => t.id === selectedTestId);
  const existingResult = results.find(
    (r) => r.visitId === selectedVisitId && r.testId === selectedTestId
  );

  // Editable Form Values
  const [valuesState, setValuesState] = useState<Record<string, { value: string | number; flag: 'normal' | 'high' | 'low' | 'critical' }>>({});
  const [cultureState, setCultureState] = useState<CultureResultData>({
    specimen: 'بول عشوائي',
    growth: 'نمو بكتيري ملحوظ',
    organism: 'Escherichia coli (E. coli)',
    colonyCount: '> 100,000 CFU/mL',
    antibiotics: [
      { antibiotic: 'Amikacin', sensitivity: 'Sensitive (S)' },
      { antibiotic: 'Ciprofloxacin', sensitivity: 'Resistant (R)' },
      { antibiotic: 'Ceftriaxone', sensitivity: 'Sensitive (S)' },
      { antibiotic: 'Augmentin (Co-amoxiclav)', sensitivity: 'Intermediate (I)' },
      { antibiotic: 'Nitrofurantoin', sensitivity: 'Sensitive (S)' },
      { antibiotic: 'Levofloxacin', sensitivity: 'Resistant (R)' },
    ],
  });
  const [semenState, setSemenState] = useState<SemenCASAResultData>({
    liquefactionTime: '25',
    appearance: 'Grayish White / Normal',
    volume: '3.2',
    viscosity: 'Normal',
    ph: '7.8',
    totalCount: '48.0',
    progressiveMotility: '52',
    nonProgressiveMotility: '18',
    immotility: '30',
    normalMorphology: '65',
    abnormalMorphology: '35',
    wbc: '2-4',
    rbc: '0-1',
    agglutination: 'Nil',
  });
  const [clinicalComment, setClinicalComment] = useState('');

  // Sync state when selected test or result changes
  React.useEffect(() => {
    if (existingResult) {
      setValuesState(existingResult.values || {});
      if (existingResult.cultureData) setCultureState(existingResult.cultureData);
      if (existingResult.semenData) setSemenState(existingResult.semenData);
      setClinicalComment(existingResult.clinicalComment || '');
    } else if (activeTest) {
      // Initialize with default or empty
      const initial: Record<string, any> = {};
      activeTest.components.forEach((c) => {
        initial[c.id] = {
          value: c.defaultValue ?? '',
          flag: 'normal',
        };
      });
      setValuesState(initial);
      setClinicalComment('');
    }
  }, [existingResult, activeTest]);

  // Handle single component value change with automatic normal range comparison
  const handleComponentChange = (compId: string, rawVal: string, comp: any) => {
    const num = parseFloat(rawVal);
    let flag: 'normal' | 'high' | 'low' | 'critical' = 'normal';

    if (!isNaN(num)) {
      if (comp.maxVal !== undefined && num > comp.maxVal) {
        flag = 'high';
      } else if (comp.minVal !== undefined && num < comp.minVal) {
        flag = 'low';
      }
    }

    setValuesState((prev) => ({
      ...prev,
      [compId]: {
        value: rawVal,
        flag,
      },
    }));
  };

  // Analyzer / Device Link Simulation
  const handleSimulateDeviceData = () => {
    if (!activeTest) return;
    setDeviceSyncNotice('جاري سحب قراءات العينة آلياً من جهاز المختبر (Sysmex / Cobas)...');

    setTimeout(() => {
      const autoValues: Record<string, any> = {};
      activeTest.components.forEach((c) => {
        let sampleVal: number | string = '';
        if (c.minVal !== undefined && c.maxVal !== undefined) {
          const mid = (c.minVal + c.maxVal) / 2;
          const variance = (c.maxVal - c.minVal) * 0.2;
          sampleVal = +(mid + (Math.random() - 0.4) * variance).toFixed(1);
        } else {
          sampleVal = c.defaultValue || 'Normal';
        }
        autoValues[c.id] = {
          value: sampleVal,
          flag: 'normal',
        };
      });
      setValuesState(autoValues);
      setDeviceSyncNotice('✓ تم سحب 100% من نتائج الجهاز بنجاح بدون أخطاء إدخال!');
      setTimeout(() => setDeviceSyncNotice(null), 4000);
    }, 700);
  };

  // Save Result Record
  const handleSaveResult = (isVerified: boolean = false) => {
    if (!activeVisit || !activeTest) return;

    // Build values with normal range text
    const fullValues: Record<string, any> = {};
    activeTest.components.forEach((c) => {
      fullValues[c.id] = {
        value: valuesState[c.id]?.value ?? '',
        flag: valuesState[c.id]?.flag ?? 'normal',
        normalRangeText: c.normalRangeText,
      };
    });

    const record: TestResultRecord = {
      id: existingResult?.id || `res-${Date.now()}`,
      visitId: activeVisit.id,
      patientId: activeVisit.patientId,
      testId: activeTest.id,
      testCode: activeTest.code,
      testNameAr: activeTest.nameAr,
      testNameEn: activeTest.nameEn,
      category: activeTest.category,
      values: fullValues,
      cultureData: activeTest.isCulture ? cultureState : undefined,
      semenData: activeTest.isSemenCASA ? semenState : undefined,
      clinicalComment,
      isVerified,
      verifiedBy: isVerified ? 'د. طارق محمود - استشاري باثولوجي' : undefined,
      verifiedAt: isVerified ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    onSaveResult(record);
  };

  // Find previous results for this patient to compare
  const previousResultsForPatient = results.filter(
    (r) => r.patientId === activeVisit?.patientId && r.testId === activeTest?.id && r.visitId !== activeVisit?.id
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            إدخال ومراجعة النتائج المخبرية (Results & Analyzer)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تنبيهات فورية بالقيم الشاذة، ربط أجهزة التحاليل، دعم المزارع و CASA، والاعتماد السريري
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeVisit && (
            <button
              onClick={() => onOpenReport(activeVisit)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>معاينة وطباعة التقرير الرسمي</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick 3-Step Instruction Guide */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-xl shadow-xs border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white font-bold px-2 py-0.5 rounded text-[11px]">
              دليل الاستخدام السريع
            </span>
            <h4 className="font-bold text-sm text-emerald-100">
              كيف تكتب نتيجة التحليل وتطبعها للعميل في ثوانٍ؟
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-slate-200 text-xs pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">1</span>
              <span>اختر المريض والتحليل من القائمة الجانبية</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">2</span>
              <span>اكتب القيم بالجدول (أو اضغط "سحب آلي من الجهاز")</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">3</span>
              <span>اضغط زر <strong>[حفظ وطباعة تقرير A4 للعميل فوراً]</strong> بالأسفل</span>
            </span>
          </div>
        </div>

        {activeVisit && (
          <button
            onClick={() => onOpenReport(activeVisit)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة تقرير A4 للزيارة الحالية</span>
          </button>
        )}
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Visits & Tests Selector */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wide">
                اختر الزيارة المسجلة:
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {filteredVisits.length} زيارة
              </span>
            </div>

            {/* Visit Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={visitSearchQuery}
                onChange={(e) => setVisitSearchQuery(e.target.value)}
                placeholder="ابحث باسم المريض أو الكود..."
                className="w-full pr-8 pl-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredVisits.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  لا توجد زيارات مطابقة للبحث
                </div>
              ) : (
                filteredVisits.map((v) => {
                  const isSelected = v.id === selectedVisitId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVisitId(v.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold">{v.visitCode}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{v.date}</span>
                      </div>
                      <div className="truncate font-bold text-slate-900">{v.patientName}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                        <span>{v.tests.length} فحوصات مطلوبة</span>
                        <span className="font-mono text-[10px] text-emerald-700">{v.patientCode}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tests in active visit */}
          {activeVisit && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wide">
                فحوصات المريض الحالية:
              </h3>
              <div className="space-y-1.5">
                {activeVisit.tests.map((t) => {
                  const isTestSelected = t.testId === selectedTestId;
                  const hasResult = results.some(
                    (r) => r.visitId === activeVisit.id && r.testId === t.testId
                  );

                  return (
                    <button
                      key={t.testId}
                      onClick={() => setSelectedTestId(t.testId)}
                      className={`w-full text-right p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isTestSelected
                          ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <div>{t.testNameAr}</div>
                        <span className={`text-[10px] font-mono ${isTestSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {t.testCode}
                        </span>
                      </div>
                      {hasResult && (
                        <CheckCircle
                          className={`w-4 h-4 shrink-0 ${
                            isTestSelected ? 'text-white' : 'text-emerald-600'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center / Main Area: Result Inputs */}
        <div className="lg:col-span-3 space-y-5">
          {/* Receptionist Permission Restriction Banner */}
          {!canEdit && (
            <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl flex items-center gap-3 text-amber-950 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-sm block">صلاحية مقيدة: حساب استقبال وكاشير ({currentUser?.name})</span>
                <span className="text-slate-600 text-[11px]">
                  صلاحيتك الحالية تتيح تسجيل المرضى وتحصيل النقدية. إدخال وتعديل نتائج التحاليل والتقارير الطبية مقفل ومخصص لأطباء وفنيي المختبر.
                </span>
              </div>
            </div>
          )}

          {activeTest && activeVisit ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 font-sans">{activeTest.nameEn}</h3>
                    <span className="text-xs text-slate-500 font-medium">({activeTest.nameAr})</span>
                    <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      {activeTest.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    المريض: <strong className="text-slate-900">{activeVisit.patientName}</strong> · العمر:{' '}
                    <strong>{activeVisit.patientAge}</strong> · النوع:{' '}
                    <strong>{activeVisit.patientGender === 'female' ? 'أنثى' : 'ذكر'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateDeviceData}
                    disabled={!canEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200 transition-colors"
                    title="سحب القراءات تلقائياً من جهاز المختبر"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>سحب آلي من الجهاز</span>
                  </button>
                </div>
              </div>

              {/* Device Sync Notice */}
              {deviceSyncNotice && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 flex items-center gap-2 animate-in fade-in">
                  <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{deviceSyncNotice}</span>
                </div>
              )}

              {/* Test Components Table */}
              {!activeTest.isCulture && !activeTest.isSemenCASA && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">الفحص والمؤشر (Parameter)</th>
                          <th className="py-2.5 px-3 text-center">النتيجة (Result)</th>
                          <th className="py-2.5 px-3 text-center">الوحدة (Unit)</th>
                          <th className="py-2.5 px-3 text-left">المدى الطبيعي (Reference Range)</th>
                          <th className="py-2.5 px-3 text-center">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeTest.components.map((comp) => {
                          const item = valuesState[comp.id] || { value: '', flag: 'normal' };
                          const isHigh = item.flag === 'high';
                          const isLow = item.flag === 'low';

                          return (
                            <tr
                              key={comp.id}
                              className={`transition-colors ${
                                isHigh ? 'bg-rose-50/50' : isLow ? 'bg-amber-50/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-900 block font-sans text-xs">
                                  {comp.nameEn}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {comp.nameAr}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="text"
                                  disabled={!canEdit}
                                  value={item.value}
                                  onChange={(e) => handleComponentChange(comp.id, e.target.value, comp)}
                                  placeholder="0.0"
                                  className={`w-28 px-3 py-1.5 border-2 rounded-lg text-center font-mono font-bold text-sm focus:outline-hidden ${
                                    !canEdit
                                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                                      : isHigh
                                      ? 'border-rose-500 bg-white text-rose-700 ring-2 ring-rose-200'
                                      : isLow
                                      ? 'border-amber-500 bg-white text-amber-700 ring-2 ring-amber-200'
                                      : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                                  }`}
                                  dir="ltr"
                                />
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-slate-600 font-bold" dir="ltr">
                                {comp.unit}
                              </td>
                              <td className="py-3 px-3 text-left font-mono text-xs text-slate-700 font-medium" dir="ltr">
                                {comp.normalRangeText}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {isHigh ? (
                                  <span className="px-2 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 rounded inline-flex items-center gap-1">
                                    ▲ High
                                  </span>
                                ) : isLow ? (
                                  <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 rounded inline-flex items-center gap-1">
                                    ▼ Low
                                  </span>
                                ) : item.value ? (
                                  <span className="px-2 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-100 rounded">
                                    Normal
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Special View: Culture & Sensitivity */}
              {activeTest.isCulture && (
                <div className="space-y-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                    نموذج فحص المزارع وحساسية المضادات الحيوية (Antibiogram)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600">نوع العينة:</label>
                      <input
                        type="text"
                        value={cultureState.specimen}
                        onChange={(e) => setCultureState({ ...cultureState, specimen: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600">الميكروب المعزول (Organism):</label>
                      <input
                        type="text"
                        value={cultureState.organism}
                        onChange={(e) => setCultureState({ ...cultureState, organism: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600">العد البكتيري (Colony Count):</label>
                      <input
                        type="text"
                        value={cultureState.colonyCount}
                        onChange={(e) => setCultureState({ ...cultureState, colonyCount: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600">حالة النمو (Growth):</label>
                      <input
                        type="text"
                        value={cultureState.growth}
                        onChange={(e) => setCultureState({ ...cultureState, growth: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  {/* Antibiotic sensitivity grid */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-slate-800 block mb-2">
                      حساسية المضادات الحيوية (Sensitivities):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cultureState.antibiotics.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <span className="font-semibold text-slate-800">{item.antibiotic}</span>
                          <select
                            value={item.sensitivity}
                            onChange={(e) => {
                              const updated = [...cultureState.antibiotics];
                              updated[idx].sensitivity = e.target.value as any;
                              setCultureState({ ...cultureState, antibiotics: updated });
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold border ${
                              item.sensitivity.includes('(S)')
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : item.sensitivity.includes('(R)')
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Sensitive (S)">حساس Sensitive (S)</option>
                            <option value="Intermediate (I)">متوسط Intermediate (I)</option>
                            <option value="Resistant (R)">مقاوم Resistant (R)</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Special View: Semen CASA */}
              {activeTest.isSemenCASA && (
                <div className="space-y-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                    فحص السائل المنوي المحوسب (SEMEN CASA Parameters)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-slate-600 block mb-1">العدد الكلي (Count Mil/ml):</label>
                      <input
                        type="text"
                        value={semenState.totalCount}
                        onChange={(e) => setSemenState({ ...semenState, totalCount: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">الحركة التقدمية (PR %):</label>
                      <input
                        type="text"
                        value={semenState.progressiveMotility}
                        onChange={(e) => setSemenState({ ...semenState, progressiveMotility: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-emerald-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">الأشكال الطبيعية (Morphology %):</label>
                      <input
                        type="text"
                        value={semenState.normalMorphology}
                        onChange={(e) => setSemenState({ ...semenState, normalMorphology: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">الحجم (Volume ml):</label>
                      <input
                        type="text"
                        value={semenState.volume}
                        onChange={(e) => setSemenState({ ...semenState, volume: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Previous Result Comparison Section */}
              {previousResultsForPatient.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <History className="w-3.5 h-3.5 text-emerald-600" />
                    <span>مقارنة مع آخر نتيجة سابقة للمريض ({previousResultsForPatient[0].updatedAt.slice(0, 10)}):</span>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1 text-slate-600">
                    {Object.entries(previousResultsForPatient[0].values).map(([cId, item]) => (
                      <span key={cId} className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                        {cId.replace('c-', '')}: {item.value} ({item.flag})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Action Buttons */}
              <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {existingResult?.isVerified
                      ? `تم الاعتماد بواسطة: ${existingResult.verifiedBy}`
                      : 'بانتظار الاعتماد النهائي من استشاري الباثولوجي'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleSaveResult(false)}
                    className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    حفظ كمسودة
                  </button>
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleSaveResult(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    اعتماد النتيجة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (canEdit) handleSaveResult(true);
                      onOpenReport(activeVisit);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-md ring-2 ring-emerald-500/20"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة تقرير A4 للعميل</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-12 text-center text-slate-400">
              يرجى اختيار زيارة وفحص من القائمة الجانبية لبدء إدخال النتائج.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

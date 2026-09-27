import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Edit,
  Printer,
  Barcode,
  Receipt,
  CheckCircle,
  Calendar,
  Phone,
  MapPin,
  Stethoscope,
  Building,
  UserCheck,
  AlertTriangle,
  FileText,
  DollarSign,
  ChevronDown,
  FolderTree,
  FlaskConical,
} from 'lucide-react';
import { Patient, Visit, Doctor, Contract, LabTest, Gender } from '../types';
import { DuplicateWarningModal } from '../components/DuplicateWarningModal';

interface Props {
  patients: Patient[];
  visits: Visit[];
  doctors: Doctor[];
  contracts: Contract[];
  tests: LabTest[];
  onSavePatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onSaveVisit: (visit: Visit) => void;
  onPrintInvoice: (visit: Visit) => void;
  onPrintBarcode: (visit: Visit) => void;
  onOpenReport: (visit: Visit) => void;
  onOpenResults?: (visit: Visit) => void;
}

export const PatientsVisitsView: React.FC<Props> = ({
  patients,
  visits,
  doctors,
  contracts,
  tests,
  onSavePatient,
  onDeletePatient,
  onSaveVisit,
  onPrintInvoice,
  onPrintBarcode,
  onOpenReport,
  onOpenResults,
}) => {
  const [activeTab, setActiveTab] = useState<'visits_list' | 'new_registration' | 'patients_directory'>('visits_list');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivered' | 'ready' | 'processing'>('all');
  const [testCategoryFilter, setTestCategoryFilter] = useState<'all' | 'lab' | 'radiology'>('all');
  const [testSearchInput, setTestSearchInput] = useState('');

  // New Visit Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientGender, setPatientGender] = useState<Gender>('male');
  const [patientDob, setPatientDob] = useState('');
  const [patientAgeYears, setPatientAgeYears] = useState<number>(30);
  const [patientAgeMonths, setPatientAgeMonths] = useState<number>(0);
  const [patientAgeDays, setPatientAgeDays] = useState<number>(0);
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientNotes, setPatientNotes] = useState('');

  // Detect existing registered patient by 3-part name or phone
  const detectedExistingPatient = useMemo(() => {
    if (selectedPatientId) return null;
    const trimmedName = patientNameInput.trim().toLowerCase();
    const trimmedPhone = patientPhone.trim();
    if (!trimmedName && !trimmedPhone) return null;
    return patients.find((p) => {
      if (trimmedPhone && p.phone && p.phone === trimmedPhone) return true;
      if (trimmedName.length >= 3 && p.name.toLowerCase().includes(trimmedName)) return true;
      return false;
    });
  }, [patients, selectedPatientId, patientNameInput, patientPhone]);

  // Mark visit delivery status to delivered
  const handleMarkDelivered = (visit: Visit) => {
    const timeNow = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const updated: Visit = {
      ...visit,
      deliveryStatus: 'delivered',
      status: 'delivered',
      deliveredAt: `${visit.date} ${timeNow}`,
      deliveredBy: 'أحمد سعيد - موظف الاستقبال',
    };
    onSaveVisit(updated);
  };

  // Visit details
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedTestsList, setSelectedTestsList] = useState<Array<{ test: LabTest; discount: number }>>([]);
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(0);
  const [paidAmountInput, setPaidAmountInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'vodafone_cash' | 'transfer'>('cash');
  const [visitNotes, setVisitNotes] = useState('');

  // Duplicate Warning Modal state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<Patient[]>([]);

  // Editing existing patient
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Auto calculate age from DOB
  const handleDobChange = (dobString: string) => {
    setPatientDob(dobString);
    if (!dobString) return;
    const birth = new Date(dobString);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += 30;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    setPatientAgeYears(Math.max(0, years));
    setPatientAgeMonths(Math.max(0, months));
    setPatientAgeDays(Math.max(0, days));

    if (years === 0 && months < 12) {
      setPatientGender('infant');
    } else if (years < 12) {
      setPatientGender('child');
    }
  };

  // Autocomplete & Duplicate check on Name blur or typing
  const handleNameChange = (val: string) => {
    setPatientNameInput(val);
    if (selectedPatientId) {
      // If we had selected a patient and started modifying name, clear selection to treat as new or duplicate
      setSelectedPatientId('');
    }
  };

  const checkDuplicates = () => {
    const trimmed = patientNameInput.trim();
    if (!trimmed || selectedPatientId) return;

    // Search for similar names (full match or partial 2 words)
    const words = trimmed.split(' ').filter(Boolean);
    const matches = patients.filter((p) => {
      if (p.name.includes(trimmed)) return true;
      if (words.length >= 2 && p.name.includes(words[0]) && p.name.includes(words[1])) return true;
      return false;
    });

    if (matches.length > 0) {
      setDuplicateMatches(matches);
      setShowDuplicateModal(true);
    }
  };

  // Handle selecting an existing patient from autocomplete
  const handleSelectExistingPatient = (p: Patient) => {
    setSelectedPatientId(p.id);
    setPatientNameInput(p.name);
    setPatientGender(p.gender);
    setPatientDob(p.dob || '');
    setPatientAgeYears(p.ageYears);
    setPatientAgeMonths(p.ageMonths);
    setPatientAgeDays(p.ageDays);
    setPatientPhone(p.phone);
    setPatientAddress(p.address);
    setPatientNotes(p.notes || '');
    setShowDuplicateModal(false);
  };

  // Add / Remove Tests to Visit
  const handleAddTest = (test: LabTest) => {
    if (selectedTestsList.some((item) => item.test.id === test.id)) return;
    const contract = contracts.find((c) => c.id === selectedContractId);
    const disc = contract ? (test.price * contract.discountPercent) / 100 : 0;
    setSelectedTestsList([...selectedTestsList, { test, discount: disc }]);
  };

  const handleRemoveTest = (testId: string) => {
    setSelectedTestsList(selectedTestsList.filter((item) => item.test.id !== testId));
  };

  // Handle contract selection and recalculate test discounts
  const handleContractChange = (conId: string) => {
    setSelectedContractId(conId);
    const contract = contracts.find((c) => c.id === conId);
    const percent = contract ? contract.discountPercent : 0;
    setCustomDiscountPercent(percent);

    setSelectedTestsList((prev) =>
      prev.map((item) => ({
        ...item,
        discount: (item.test.price * percent) / 100,
      }))
    );
  };

  // Financial calculations for new visit
  const totalCost = selectedTestsList.reduce((acc, item) => acc + item.test.price, 0);
  const totalDiscount = selectedTestsList.reduce((acc, item) => acc + item.discount, 0);
  const netPayable = Math.max(0, totalCost - totalDiscount);
  const remaining = Math.max(0, netPayable - paidAmountInput);

  // Submit New Registration / Visit
  const handleSaveVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientNameInput.trim()) {
      alert('يرجى إدخال اسم المريض');
      return;
    }
    if (selectedTestsList.length === 0) {
      alert('يرجى اختيار فحص طبي واحد على الأقل للمريض');
      return;
    }

    // 1. Resolve or Create Patient
    let patientObj: Patient;
    if (selectedPatientId) {
      patientObj = patients.find((p) => p.id === selectedPatientId)!;
    } else {
      const newCode = `P-${(10000 + patients.length + 1).toString()}`;
      patientObj = {
        id: `p-${Date.now()}`,
        code: newCode,
        name: patientNameInput.trim(),
        dob: patientDob || undefined,
        ageYears: Number(patientAgeYears),
        ageMonths: Number(patientAgeMonths),
        ageDays: Number(patientAgeDays),
        gender: patientGender,
        phone: patientPhone.trim(),
        address: patientAddress.trim(),
        notes: patientNotes.trim(),
        createdAt: new Date().toISOString(),
      };
      onSavePatient(patientObj);
    }

    // 2. Resolve Doctor and Contract
    const doctorObj = doctors.find((d) => d.id === selectedDoctorId);
    const contractObj = contracts.find((c) => c.id === selectedContractId);

    // 3. Create Visit
    const newVisitCode = `V-2026-${(visits.length + 1).toString().padStart(4, '0')}`;
    const newVisit: Visit = {
      id: `v-${Date.now()}`,
      visitCode: newVisitCode,
      patientId: patientObj.id,
      patientName: patientObj.name,
      patientCode: patientObj.code,
      patientGender: patientObj.gender,
      patientAge: `${patientObj.ageYears} سنة`,
      doctorId: doctorObj?.id,
      doctorName: doctorObj?.name,
      contractId: contractObj?.id,
      contractName: contractObj?.name,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      tests: selectedTestsList.map((item) => {
        const isRad = item.test.type === 'radiology' || item.test.code.startsWith('RAD-');
        return {
          testId: item.test.id,
          testCode: item.test.code,
          testNameAr: item.test.nameAr,
          price: item.test.price,
          discount: item.discount,
          status: 'pending' as const,
          type: (isRad ? 'radiology' : 'lab') as 'lab' | 'radiology',
        };
      }),
      radiologyCount: selectedTestsList.filter(
        (i) => i.test.type === 'radiology' || i.test.code.startsWith('RAD-')
      ).length,
      labTestsCount: selectedTestsList.filter(
        (i) => !(i.test.type === 'radiology' || i.test.code.startsWith('RAD-'))
      ).length,
      totalPrice: totalCost,
      discountAmount: totalDiscount,
      finalPrice: netPayable,
      paidAmount: Number(paidAmountInput),
      remainingAmount: remaining,
      paymentMethod,
      status: 'pending',
      sampleStatus: 'collected',
      expectedDeliveryDate: 'اليوم 6:00 م',
      deliveryStatus: 'not_delivered',
      notes: visitNotes,
      createdAt: new Date().toISOString(),
    };

    onSaveVisit(newVisit);

    // Reset Form
    setSelectedPatientId('');
    setPatientNameInput('');
    setPatientPhone('');
    setPatientAddress('');
    setPatientNotes('');
    setSelectedTestsList([]);
    setPaidAmountInput(0);
    setVisitNotes('');
    setActiveTab('visits_list');
    onPrintInvoice(newVisit);
  };

  // Filtered Visits with Delivery Status Filtering
  const filteredVisits = useMemo(() => {
    let result = visits;
    if (deliveryFilter === 'delivered') {
      result = result.filter((v) => v.deliveryStatus === 'delivered' || v.status === 'delivered');
    } else if (deliveryFilter === 'ready') {
      result = result.filter((v) => v.status === 'ready' && v.deliveryStatus !== 'delivered');
    } else if (deliveryFilter === 'processing') {
      result = result.filter((v) => v.status === 'processing' || v.status === 'pending');
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return result;

    const patientPhoneMap = new Map(patients.map((p) => [p.id, p.phone || '']));

    return result.filter(
      (v) =>
        v.patientName.toLowerCase().includes(q) ||
        v.visitCode.toLowerCase().includes(q) ||
        v.patientCode.toLowerCase().includes(q) ||
        (v.doctorName && v.doctorName.toLowerCase().includes(q)) ||
        (patientPhoneMap.get(v.patientId) && patientPhoneMap.get(v.patientId)!.includes(q)) ||
        v.tests.some((t) => t.testNameAr.toLowerCase().includes(q) || t.testCode.toLowerCase().includes(q))
    );
  }, [visits, searchQuery, deliveryFilter, patients]);

  // Filtered Patients Directory
  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.address.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            إدارة المرضى، تسجيل الزيارات، والفواتير
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تسجيل زيارة جديدة، استعلام بكود المريض، فحص تشابه الأسماء، والتحصيل
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('visits_list')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'visits_list' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            سجل الزيارات والفواتير ({visits.length})
          </button>
          <button
            onClick={() => setActiveTab('new_registration')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'new_registration' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + تسجيل زيارة جديدة
          </button>
          <button
            onClick={() => setActiveTab('patients_directory')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'patients_directory' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            دليل ملفات المرضى ({patients.length})
          </button>
        </div>
      </div>

      {/* TAB 1: VISITS LIST */}
      {activeTab === 'visits_list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          {/* Search & Delivery Status Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم ثلاثي، رقم الموبايل، كود المريض، رقم الزيارة، أو الطبيب..."
                className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Delivery Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setDeliveryFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  deliveryFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                جميع الطلبيات ({visits.length})
              </button>
              <button
                onClick={() => setDeliveryFilter('delivered')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  deliveryFilter === 'delivered' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                تم التسليم للعميل ({visits.filter((v) => v.deliveryStatus === 'delivered' || v.status === 'delivered').length})
              </button>
              <button
                onClick={() => setDeliveryFilter('ready')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  deliveryFilter === 'ready' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                جاهز بانتظار التسليم ({visits.filter((v) => v.status === 'ready' && v.deliveryStatus !== 'delivered').length})
              </button>
              <button
                onClick={() => setDeliveryFilter('processing')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  deliveryFilter === 'processing' ? 'bg-blue-600 text-white shadow-2xs' : 'text-blue-700 hover:text-blue-900'
                }`}
              >
                قيد التشغيل ({visits.filter((v) => v.status === 'processing' || v.status === 'pending').length})
              </button>
            </div>

            <button
              onClick={() => setActiveTab('new_registration')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل زيارة جديدة</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">رقم الزيارة</th>
                  <th className="py-2.5 px-3">كود المريض</th>
                  <th className="py-2.5 px-3">اسم المريض</th>
                  <th className="py-2.5 px-3">الفحوصات المطلوبة</th>
                  <th className="py-2.5 px-3 text-left">الصافي</th>
                  <th className="py-2.5 px-3 text-left">المدفوع / المتبقي</th>
                  <th className="py-2.5 px-3 text-center">حالة الطلبية والتسليم</th>
                  <th className="py-2.5 px-3 text-center">الطباعة والمستندات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.map((v) => {
                  const isDelivered = v.deliveryStatus === 'delivered' || v.status === 'delivered';
                  const isReady = v.status === 'ready' && !isDelivered;

                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{v.visitCode}</td>
                      <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">{v.patientCode}</td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 block font-bold">{v.patientName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{v.date} · {v.doctorName || 'نقدي مباشر'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {v.tests.map((t, idx) => {
                            const isRad = t.type === 'radiology' || t.testCode.startsWith('RAD-');
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  isRad
                                    ? 'bg-blue-50 text-blue-900 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                }`}
                              >
                                {isRad ? 'أشعة: ' : ''}{t.testNameAr.split('(')[0].trim()}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-left font-mono tabular-nums font-bold">
                        {v.finalPrice.toFixed(2)} ج
                      </td>
                      <td className="py-3 px-3 text-left font-mono tabular-nums">
                        <div className="text-emerald-700 font-bold">{v.paidAmount.toFixed(2)} ج</div>
                        {v.remainingAmount > 0 ? (
                          <div className="text-rose-600 text-[10px] font-bold">باقي: {v.remainingAmount.toFixed(2)} ج</div>
                        ) : (
                          <div className="text-slate-400 text-[10px]">خالص</div>
                        )}
                      </td>

                      {/* Delivery Status Column with instant Action */}
                      <td className="py-3 px-3 text-center">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>تم التسليم ليد العميل</span>
                          </span>
                        ) : isReady ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              جاهز للتسليم ⏳
                            </span>
                            <button
                              onClick={() => handleMarkDelivered(v)}
                              className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black transition-colors shadow-2xs"
                              title="تسجيل استلام العميل للتقرير رسمياً"
                            >
                              تسليم للعميل الآن ✓
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                            قيد التشغيل 🔬
                          </span>
                        )}
                      </td>

                      {/* Document & Print Actions */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onPrintInvoice(v)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                            title="طباعة الفاتورة"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onPrintBarcode(v)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                            title="طباعة ملصق الباركود"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                          </button>
                          {onOpenResults && (
                            <button
                              onClick={() => onOpenResults(v)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                              title="كتابة وتسجيل نتائج هذا التحليل أو الأشعة"
                            >
                              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                              <span>كتابة النتيجة</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenReport(v)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="استعراض التقرير الطبي A4"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>التقرير A4</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: NEW VISIT REGISTRATION FORM */}
      {activeTab === 'new_registration' && (
        <form onSubmit={handleSaveVisitSubmit} className="space-y-6">
          {/* Section 1: Patient Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  1. بيانات المريض (تسجيل أو اختيار مريض مسجل)
                </h3>
              </div>
              <span className="text-xs text-slate-400">كود المريض يتم توليده آلياً ولا يتكرر</span>
            </div>

            {/* Detected Existing Patient Banner */}
            {detectedExistingPatient && (() => {
              const prevVisits = visits.filter((v) => v.patientId === detectedExistingPatient.id);
              const prevTotalPaid = prevVisits.reduce((acc, v) => acc + (v.paidAmount || 0), 0);
              return (
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-emerald-950 font-black text-sm">
                          تم التعرف على عميل سابق مسجل بالنظام: {detectedExistingPatient.name}
                        </strong>
                        <span className="font-mono bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          كود: {detectedExistingPatient.code}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        الهاتف: <span className="font-mono font-bold text-slate-800" dir="ltr">{detectedExistingPatient.phone}</span> · السن: {detectedExistingPatient.ageYears} سنة · الزيارات السابقة: <strong className="font-mono text-emerald-700">{prevVisits.length} زيارة</strong> ({prevTotalPaid.toFixed(2)} ج) · نقاط الولاء: <strong className="font-mono text-amber-700">{detectedExistingPatient.loyaltyPoints || 0} نقطة</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectExistingPatient(detectedExistingPatient)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>استخدام بيانات هذا العميل فوراً</span>
                  </button>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Patient Name with Autocomplete */}
              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-slate-700">
                  اسم المريض غير محدد الطول (مع التدقيق والتحذير):
                </label>
                <input
                  type="text"
                  required
                  value={patientNameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={checkDuplicates}
                  placeholder="اكتب اسم المريض كاملاً..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />

                {/* Autocomplete Dropdown suggestions */}
                {patientNameInput.length >= 2 && !selectedPatientId && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {patients
                      .filter((p) => p.name.includes(patientNameInput.trim()))
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectExistingPatient(p)}
                          className="p-2 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <strong className="text-slate-900">{p.name}</strong>
                            <span className="text-[10px] text-slate-400 block font-mono">{p.phone} · {p.ageYears} سنة</span>
                          </div>
                          <span className="font-mono text-emerald-700 font-bold text-[10px]">{p.code}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">النوع / الفئة:</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="male">ذكر (Male)</option>
                  <option value="female">أنثى (Female)</option>
                  <option value="child">طفل (Child)</option>
                  <option value="infant">رضيع (Infant)</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">تاريخ الميلاد (لحساب العمر تلقائياً):</label>
                <input
                  type="date"
                  value={patientDob}
                  onChange={(e) => handleDobChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Age in Years, Months, Days */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">العمر (سنوات / شهور / أيام):</label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="سنة"
                    value={patientAgeYears}
                    onChange={(e) => setPatientAgeYears(Number(e.target.value))}
                    className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-center font-mono"
                  />
                  <input
                    type="number"
                    min="0"
                    max="11"
                    placeholder="شهر"
                    value={patientAgeMonths}
                    onChange={(e) => setPatientAgeMonths(Number(e.target.value))}
                    className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-center font-mono"
                  />
                  <input
                    type="number"
                    min="0"
                    max="30"
                    placeholder="يوم"
                    value={patientAgeDays}
                    onChange={(e) => setPatientAgeDays(Number(e.target.value))}
                    className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-center font-mono"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">رقم الهاتف للتواصل وإرسال النتائج:</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  dir="ltr"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">العنوان الكامل أو المنطقة:</label>
                <input
                  type="text"
                  value={patientAddress}
                  onChange={(e) => setPatientAddress(e.target.value)}
                  placeholder="المدينة - الشارع - رقم العقار..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Referring Doctor & Contract */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                2. الطبيب المعالج والتعاقدات والخصم
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">الطبيب المعالج / المحول:</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">بدون تحويل / نقدي مباشر</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Contract */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">جهة التعاقد أو التأمين (نسبة الخصم):</label>
                <select
                  value={selectedContractId}
                  onChange={(e) => handleContractChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">خاص (بدون خصم تعاقدي)</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (خصم {c.discountPercent}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Tests Selection */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  3. اختيار الفحوصات والتحاليل المطلوبة ({selectedTestsList.length} فحص محدد)
                </h3>
              </div>
              <span className="text-xs text-slate-400">انقر على التحليل لإضافته للزيارة</span>
            </div>

            {/* Quick Test Search & Category Picker */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search input for tests */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={testSearchInput}
                    onChange={(e) => setTestSearchInput(e.target.value)}
                    placeholder="ابحث باسم التحليل أو فحص الأشعة (مثال: CBC، سونار، X-Ray)..."
                    className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Filter buttons for Lab vs Radiology */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setTestCategoryFilter('all')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      testCategoryFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestCategoryFilter('lab')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                      testCategoryFilter === 'lab' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-emerald-700'
                    }`}
                  >
                    <FlaskConical className="w-3 h-3" />
                    <span>تحاليل مخبرية</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestCategoryFilter('radiology')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                      testCategoryFilter === 'radiology' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-blue-700'
                    }`}
                  >
                    <span>أشعة وسونار</span>
                  </button>
                </div>
              </div>

              {/* Tests and Radiology Chips Grid */}
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {tests
                  .filter((t) => {
                    const isRad = t.type === 'radiology' || t.code.startsWith('RAD-');
                    if (testCategoryFilter === 'radiology' && !isRad) return false;
                    if (testCategoryFilter === 'lab' && isRad) return false;
                    if (!testSearchInput.trim()) return true;
                    const q = testSearchInput.toLowerCase();
                    return t.nameAr.toLowerCase().includes(q) || t.nameEn.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
                  })
                  .slice(0, 50)
                  .map((t) => {
                    const isSelected = selectedTestsList.some((item) => item.test.id === t.id);
                    const isRad = t.type === 'radiology' || t.code.startsWith('RAD-');

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleAddTest(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold cursor-default'
                            : isRad
                            ? 'bg-blue-50/80 border border-blue-300 text-blue-900 hover:bg-blue-100'
                            : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {isRad && !isSelected && <span className="text-[10px] bg-blue-200 text-blue-900 px-1 rounded font-bold">أشعة</span>}
                        <span>{t.nameAr}</span>
                        <span className="font-mono text-[10px] opacity-80 font-bold">({t.price} ج)</span>
                      </button>
                    );
                  })}
              </div>

              {/* Selected Tests Table */}
              {selectedTestsList.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2">اسم الفحص</th>
                        <th className="p-2 text-center">نوع العينة</th>
                        <th className="p-2 text-left">السعر الرسمي</th>
                        <th className="p-2 text-left">الخصم الممنوح</th>
                        <th className="p-2 text-left">الصافي</th>
                        <th className="p-2 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTestsList.map((item) => (
                        <tr key={item.test.id}>
                          <td className="p-2 font-bold text-slate-900">{item.test.nameAr}</td>
                          <td className="p-2 text-center text-slate-500 text-[11px]">{item.test.sampleType}</td>
                          <td className="p-2 text-left font-mono tabular-nums">{item.test.price.toFixed(2)} ج</td>
                          <td className="p-2 text-left font-mono tabular-nums text-emerald-600">
                            {item.discount.toFixed(2)} ج
                          </td>
                          <td className="p-2 text-left font-mono tabular-nums font-bold">
                            {(item.test.price - item.discount).toFixed(2)} ج
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveTest(item.test.id)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Billing, Discounts & Split Payments */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                4. الحساب المالي، الخصومات، والدفع بالتقسيط
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">إجمالي تكلفة التحاليل:</span>
                <span className="text-lg font-black font-mono text-slate-900 tabular-nums">
                  {totalCost.toFixed(2)} ج.م
                </span>
              </div>
              <div>
                <span className="text-emerald-700 block font-semibold">إجمالي الخصم المعتمد:</span>
                <span className="text-lg font-black font-mono text-emerald-700 tabular-nums">
                  {totalDiscount.toFixed(2)} ج.م
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">صافي الفاتورة المستحق:</span>
                <span className="text-lg font-black font-mono text-emerald-900 tabular-nums">
                  {netPayable.toFixed(2)} ج.م
                </span>
              </div>
              <div>
                <span className="text-rose-700 block font-semibold">المتبقي على المريض:</span>
                <span className="text-lg font-black font-mono text-rose-700 tabular-nums">
                  {remaining.toFixed(2)} ج.م
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">المبلغ المدفوع الآن (كاش / دفعات):</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={paidAmountInput}
                  onChange={(e) => setPaidAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">طريقة التحصيل:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cash">نقدي (كاش في الخزينة)</option>
                  <option value="card">بطاقة ائتمانية / فيزا</option>
                  <option value="vodafone_cash">فودافون كاش / إنستاباي</option>
                  <option value="transfer">تحويل بنكي</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">ملاحظات الزيارة أو العينة:</label>
                <input
                  type="text"
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="ملاحظات سريرية أو موعد خاص للتسليم..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('visits_list')}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <Receipt className="w-4 h-4" />
                حفظ الزيارة وطباعة الفاتورة والباركود
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: PATIENTS DIRECTORY */}
      {activeTab === 'patients_directory' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بكود المريض، الاسم الكامل أو جزء منه، الهاتف، العنوان..."
                className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">كود المريض</th>
                  <th className="py-2.5 px-3">اسم المريض</th>
                  <th className="py-2.5 px-3">العمر والنوع</th>
                  <th className="py-2.5 px-3">رقم الهاتف</th>
                  <th className="py-2.5 px-3">العنوان</th>
                  <th className="py-2.5 px-3">ملاحظات</th>
                  <th className="py-2.5 px-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">{p.code}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {p.ageYears} سنة · {p.gender === 'male' ? 'ذكر' : p.gender === 'female' ? 'أنثى' : p.gender === 'child' ? 'طفل' : 'رضيع'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600" dir="ltr">{p.phone}</td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-[200px]">{p.address}</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] truncate max-w-[150px]">{p.notes || '-'}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            handleSelectExistingPatient(p);
                            setActiveTab('new_registration');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]"
                          title="تسجيل زيارة لهذا المريض"
                        >
                          + زيارة
                        </button>
                        <button
                          onClick={() => onDeletePatient(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="حذف ملف المريض"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        matches={duplicateMatches}
        type="patient"
        inputName={patientNameInput}
        onSelectExisting={handleSelectExistingPatient}
        onContinueAnyway={() => setShowDuplicateModal(false)}
      />
    </div>
  );
};

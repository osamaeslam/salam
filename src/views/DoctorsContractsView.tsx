import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Search,
  Plus,
  Edit,
  Trash2,
  Building,
  UserCheck,
  TrendingUp,
  Percent,
  Phone,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { Doctor, Contract, Visit } from '../types';
import { DuplicateWarningModal } from '../components/DuplicateWarningModal';

interface Props {
  doctors: Doctor[];
  contracts: Contract[];
  visits: Visit[];
  onSaveDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctorId: string) => void;
  onSaveContract: (contract: Contract) => void;
  onDeleteContract: (contractId: string) => void;
}

export const DoctorsContractsView: React.FC<Props> = ({
  doctors,
  contracts,
  visits,
  onSaveDoctor,
  onDeleteDoctor,
  onSaveContract,
  onDeleteContract,
}) => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'contracts'>('doctors');
  const [searchQuery, setSearchQuery] = useState('');

  // Doctor Form Modal
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorNameInput, setDoctorNameInput] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorAddress, setDoctorAddress] = useState('');
  const [doctorClinic, setDoctorClinic] = useState('');
  const [doctorCommission, setDoctorCommission] = useState(10);

  // Duplicate Check Modal for Doctor
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<Doctor[]>([]);

  // Contract Form Modal
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [contractName, setContractName] = useState('');
  const [contractType, setContractType] = useState<'syndicate' | 'company' | 'insurance'>('syndicate');
  const [contractDiscount, setContractDiscount] = useState(20);
  const [contractPhone, setContractPhone] = useState('');
  const [contractNotes, setContractNotes] = useState('');

  // Check duplicate doctors
  const checkDoctorDuplicates = () => {
    const trimmed = doctorNameInput.trim();
    if (!trimmed || editingDoctor) return;
    const matches = doctors.filter((d) => d.name.includes(trimmed));
    if (matches.length > 0) {
      setDuplicateMatches(matches);
      setShowDuplicateModal(true);
    }
  };

  const handleOpenNewDoctor = () => {
    setEditingDoctor(null);
    setDoctorNameInput('');
    setDoctorSpecialty('باطنة وسكري');
    setDoctorPhone('');
    setDoctorAddress('');
    setDoctorClinic('');
    setDoctorCommission(10);
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (d: Doctor) => {
    setEditingDoctor(d);
    setDoctorNameInput(d.name);
    setDoctorSpecialty(d.specialty);
    setDoctorPhone(d.phone);
    setDoctorAddress(d.address);
    setDoctorClinic(d.clinic || '');
    setDoctorCommission(d.commissionRate);
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorNameInput.trim()) return;

    const docObj: Doctor = {
      id: editingDoctor ? editingDoctor.id : `d-${Date.now()}`,
      code: editingDoctor ? editingDoctor.code : `DOC-${100 + doctors.length + 1}`,
      name: doctorNameInput.trim(),
      specialty: doctorSpecialty.trim(),
      phone: doctorPhone.trim(),
      address: doctorAddress.trim(),
      clinic: doctorClinic.trim(),
      commissionRate: Number(doctorCommission),
      referralCount: editingDoctor ? editingDoctor.referralCount : 0,
      createdAt: editingDoctor ? editingDoctor.createdAt : new Date().toISOString(),
    };

    onSaveDoctor(docObj);
    setIsDoctorModalOpen(false);
  };

  // Contracts handlers
  const handleOpenNewContract = () => {
    setEditingContract(null);
    setContractName('');
    setContractType('syndicate');
    setContractDiscount(20);
    setContractPhone('');
    setContractNotes('');
    setIsContractModalOpen(true);
  };

  const handleSaveContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractName.trim()) return;

    const conObj: Contract = {
      id: editingContract ? editingContract.id : `con-${Date.now()}`,
      name: contractName.trim(),
      type: contractType,
      discountPercent: Number(contractDiscount),
      phone: contractPhone.trim(),
      notes: contractNotes.trim(),
      active: true,
    };

    onSaveContract(conObj);
    setIsContractModalOpen(false);
  };

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.address.toLowerCase().includes(q)
    );
  }, [doctors, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            سجل الأطباء المحولين وجهات التعاقد
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة إحصائيات التحويلات، عمولات الأطباء، ونسب خصومات النقابات والشركات
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'doctors' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            سجل الأطباء ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'contracts' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جهات التعاقد والخصومات ({contracts.length})
          </button>
        </div>
      </div>

      {/* TAB 1: DOCTORS DIRECTORY */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بكود الطبيب، الاسم، التخصص، الهاتف، أو العنوان..."
                className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleOpenNewDoctor}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طبيب جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">كود الطبيب</th>
                  <th className="py-2.5 px-3">اسم الطبيب</th>
                  <th className="py-2.5 px-3">التخصص الطبي</th>
                  <th className="py-2.5 px-3">الهاتف والعيادة</th>
                  <th className="py-2.5 px-3">العنوان</th>
                  <th className="py-2.5 px-3 text-center">نسبة العمولة</th>
                  <th className="py-2.5 px-3 text-center">عداد التحويلات</th>
                  <th className="py-2.5 px-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => {
                  const actualVisitsCount = visits.filter((v) => v.doctorId === doc.id).length;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{doc.code}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{doc.name}</td>
                      <td className="py-3 px-3">
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {doc.specialty}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-700" dir="ltr">{doc.phone}</div>
                        <div className="text-[10px] text-slate-400">{doc.clinic}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[180px]">{doc.address}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                        {doc.commissionRate}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-slate-900 text-sm">
                        {doc.referralCount + actualVisitsCount} حالة
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditDoctor(doc)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="تعديل بيانات الطبيب"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الطبيب (${doc.name})؟`)) {
                                onDeleteDoctor(doc.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                            title="حذف الطبيب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* TAB 2: CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              قائمة جهات التعاقد، النقابات، والشركات
            </h3>
            <button
              onClick={handleOpenNewContract}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جهة تعاقد جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contracts.map((con) => (
              <div
                key={con.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Building className="w-4 h-4" />
                  </span>
                  <span className="font-mono text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    خصم {con.discountPercent}%
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{con.name}</h4>
                  <span className="text-[11px] text-slate-500">
                    {con.type === 'syndicate' ? 'نقابة مهنية' : con.type === 'insurance' ? 'شركة تأمين صحي' : 'شركة خاصة'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 border-t border-slate-200/60 pt-2 space-y-1">
                  <div>هاتف: <span className="font-mono">{con.phone || 'غير مسجل'}</span></div>
                  <div>ملاحظات: <span className="text-slate-500">{con.notes || 'ساري المفعول'}</span></div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onDeleteContract(con.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 p-1"
                  >
                    حذف التعاقد
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Modal */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-right">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingDoctor ? 'تعديل بيانات الطبيب' : 'إضافة طبيب محول جديد'}
              </h3>
              <button
                onClick={() => setIsDoctorModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoctorSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم الطبيب غير محدد الطول:</label>
                <input
                  type="text"
                  required
                  value={doctorNameInput}
                  onChange={(e) => setDoctorNameInput(e.target.value)}
                  onBlur={checkDoctorDuplicates}
                  placeholder="د. الاسم بالكامل..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">التخصص الطبي:</label>
                  <input
                    type="text"
                    required
                    value={doctorSpecialty}
                    onChange={(e) => setDoctorSpecialty(e.target.value)}
                    placeholder="مثال: أطفال، باطنة، نساء..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نسبة العمولة أو التحويل (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={doctorCommission}
                    onChange={(e) => setDoctorCommission(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    placeholder="010..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">اسم العيادة أو المركز:</label>
                  <input
                    type="text"
                    value={doctorClinic}
                    onChange={(e) => setDoctorClinic(e.target.value)}
                    placeholder="عيادة الشفاء التخصصية..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">العنوان الكامل أو المنطقة:</label>
                <input
                  type="text"
                  value={doctorAddress}
                  onChange={(e) => setDoctorAddress(e.target.value)}
                  placeholder="الشارع، المدينة، رقم المبنى..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                >
                  حفظ الطبيب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-right">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">إضافة جهة تعاقد وخصم</h3>
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContractSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم الجهة (نقابة / شركة / تأمين):</label>
                <input
                  type="text"
                  required
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="مثال: نقابة المعلمين، شركة بترول..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نوع الجهة:</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="syndicate">نقابة مهنية</option>
                    <option value="insurance">شركة تأمين صحي</option>
                    <option value="company">شركة قطاع خاص</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نسبة الخصم المعتمدة (%):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={contractDiscount}
                    onChange={(e) => setContractDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">رقم الهاتف أو الخط الساخن:</label>
                <input
                  type="text"
                  value={contractPhone}
                  onChange={(e) => setContractPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">شروط الخصم والخطاب:</label>
                <input
                  type="text"
                  value={contractNotes}
                  onChange={(e) => setContractNotes(e.target.value)}
                  placeholder="مثال: خطاب تحويل أو كارنيه النقابة ساري..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                >
                  حفظ التعاقد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Warning Modal for Doctors */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        matches={duplicateMatches}
        type="doctor"
        inputName={doctorNameInput}
        onSelectExisting={(d) => {
          handleOpenEditDoctor(d);
          setShowDuplicateModal(false);
        }}
        onContinueAnyway={() => setShowDuplicateModal(false)}
      />
    </div>
  );
};

import React, { useState, useMemo, useRef } from 'react';
import {
  FolderTree,
  Search,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  Clock,
  DollarSign,
  Tag,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { LabTest, TestComponent } from '../types';
import { exportTestsToExcel, parseTestsFromExcel } from '../utils/excel';

interface Props {
  tests: LabTest[];
  onSaveTest: (test: LabTest) => void;
  onImportTests: (newTests: LabTest[]) => void;
  onDeleteTest: (testId: string) => void;
}

export const TestsCatalogView: React.FC<Props> = ({
  tests,
  onSaveTest,
  onImportTests,
  onDeleteTest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    tests.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [tests]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.nameAr.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.sampleType.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [tests, selectedCategory, searchQuery]);

  // Excel Export Handler
  const handleExportExcel = () => {
    exportTestsToExcel(tests);
  };

  // Excel Import Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseTestsFromExcel(file);
      if (parsed.length > 0) {
        onImportTests(parsed as LabTest[]);
        setImportNotification(`✓ تم استيراد وتحديث ${parsed.length} فحص طبي من ملف Excel بنجاح!`);
        setTimeout(() => setImportNotification(null), 5000);
      }
    } catch (err) {
      alert('حدث خطأ أثناء قراءة ملف Excel، يرجى التأكد من تنسيق الأعمدة.');
    }
  };

  // Form Submit for New / Edited Test
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;
    onSaveTest(editingTest);
    setEditingTest(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">
              دليل الفحوصات الطبية والمخزون (385 فحص)
            </h2>
            <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              {tests.length} فحص متوفر
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            تعديل الأسعار وشروط العينات ووقت التسليم، ومراقبة المخزن وإستيراد/تصدير Excel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            title="إستيراد التصميم والفحوصات من ملف Excel"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>إستيراد من Excel</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
            title="تصدير كامل قائمة الفحوصات والأسعار لملف Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => {
              const newTest: LabTest = {
                id: `t-custom-${Date.now()}`,
                code: `TEST-${tests.length + 1}`,
                nameAr: '',
                nameEn: '',
                category: 'كيمياء الدم (Biochemistry)',
                sampleType: 'سيرم (Serum)',
                sampleRequirements: 'لا يشترط الصيام',
                price: 150,
                cost: 40,
                turnaroundHours: 2,
                stockReagents: 50,
                minStockWarning: 15,
                components: [
                  {
                    id: `c-new-1`,
                    nameAr: 'النتيجة',
                    nameEn: 'Result',
                    unit: 'mg/dL',
                    normalRangeText: '10 - 50',
                    minVal: 10,
                    maxVal: 50,
                  },
                ],
              };
              setEditingTest(newTest);
              setIsCreatingNew(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تحليل جديد</span>
          </button>
        </div>
      </div>

      {/* Import Notification Banner */}
      {importNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importNotification}</span>
        </div>
      )}

      {/* Category Filter Pills & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم التحليل، الكود، نوع العينة..."
              className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            عرض <strong className="text-slate-900">{filteredTests.length}</strong> من أصل {tests.length} فحص
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الأقسام ({tests.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">الكود</th>
                <th className="py-2.5 px-3">اسم التحليل (عربي / إنجليزي)</th>
                <th className="py-2.5 px-3">التصنيف</th>
                <th className="py-2.5 px-3">نوع وشروط العينة</th>
                <th className="py-2.5 px-3 text-center">فترة التسليم</th>
                <th className="py-2.5 px-3 text-left">سعر البيع</th>
                <th className="py-2.5 px-3 text-center">رصيد المخزن</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTests.map((t) => {
                const isLowStock = t.stockReagents <= t.minStockWarning;

                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{t.code}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{t.nameAr}</div>
                      <div className="text-[10px] font-mono text-slate-400">{t.nameEn}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{t.category}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{t.sampleType}</div>
                      <div className="text-[10px] text-slate-500">{t.sampleRequirements}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {t.turnaroundHours} س
                      </span>
                    </td>
                    <td className="py-3 px-3 text-left font-mono tabular-nums font-bold text-emerald-800 text-sm">
                      {t.price.toFixed(2)} ج
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                          isLowStock
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {t.stockReagents}
                        {isLowStock && <span className="mr-1 text-[10px]">⚠️</span>}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingTest({ ...t });
                            setIsCreatingNew(false);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="تعديل السعر والمواصفات"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف الفحص (${t.nameAr})؟`)) {
                              onDeleteTest(t.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="حذف الفحص"
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

      {/* Edit / New Test Modal */}
      {editingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-right">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {isCreatingNew ? 'إضافة فحص طبي جديد' : `تعديل فحص (${editingTest.nameAr})`}
              </h3>
              <button
                onClick={() => setEditingTest(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">كود التحليل الفريد:</label>
                  <input
                    type="text"
                    required
                    value={editingTest.code}
                    onChange={(e) => setEditingTest({ ...editingTest, code: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">التصنيف الطبي:</label>
                  <input
                    type="text"
                    required
                    value={editingTest.category}
                    onChange={(e) => setEditingTest({ ...editingTest, category: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الاسم باللغة العربية:</label>
                  <input
                    type="text"
                    required
                    value={editingTest.nameAr}
                    onChange={(e) => setEditingTest({ ...editingTest, nameAr: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الاسم باللغة الإنجليزية:</label>
                  <input
                    type="text"
                    value={editingTest.nameEn}
                    onChange={(e) => setEditingTest({ ...editingTest, nameEn: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">سعر البيع (ج.م):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={editingTest.price}
                    onChange={(e) => setEditingTest({ ...editingTest, price: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">تكلفة التحليل (ج.م):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingTest.cost}
                    onChange={(e) => setEditingTest({ ...editingTest, cost: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">فترة الاستلام (ساعات):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingTest.turnaroundHours}
                    onChange={(e) => setEditingTest({ ...editingTest, turnaroundHours: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">رصيد المخزن الحالي:</label>
                  <input
                    type="number"
                    min="0"
                    value={editingTest.stockReagents}
                    onChange={(e) => setEditingTest({ ...editingTest, stockReagents: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">حد التنبيه بالنقصان:</label>
                  <input
                    type="number"
                    min="0"
                    value={editingTest.minStockWarning}
                    onChange={(e) => setEditingTest({ ...editingTest, minStockWarning: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">نوع وشروط العينة:</label>
                <input
                  type="text"
                  value={editingTest.sampleRequirements}
                  onChange={(e) => setEditingTest({ ...editingTest, sampleRequirements: e.target.value })}
                  placeholder="مثال: صيام 8 - 12 ساعة، أنبوب EDTA موف..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTest(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

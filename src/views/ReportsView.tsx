import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Printer,
  Mail,
  Share2,
  MessageCircle,
  CheckCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { Visit, Patient, TestResultRecord } from '../types';

interface Props {
  visits: Visit[];
  patients: Patient[];
  results: TestResultRecord[];
  onOpenReportModal: (visit: Visit) => void;
}

export const ReportsView: React.FC<Props> = ({
  visits,
  patients,
  results,
  onOpenReportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'pending'>('all');

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        v.patientName.toLowerCase().includes(q) ||
        v.patientCode.toLowerCase().includes(q) ||
        v.visitCode.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [visits, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            أرشيف التقارير الطبية والمراسلات (Medical Reports & Dispatch)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            معاينة وطباعة تقارير A4 الليزرية، إرسال النتائج عبر البريد الإلكتروني وواتساب
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بكود المريض، رقم الزيارة، أو الاسم..."
            className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            كافة التقارير ({visits.length})
          </button>
          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              statusFilter === 'ready' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            التقارير المعتمدة الجاهزة ({visits.filter((v) => v.status === 'ready').length})
          </button>
        </div>
      </div>

      {/* Reports Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisits.map((v) => {
          const visitResults = results.filter((r) => r.visitId === v.id);
          const isReady = v.status === 'ready' || visitResults.length > 0;

          return (
            <div
              key={v.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-mono text-xs font-bold text-slate-800">{v.visitCode}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isReady ? 'جاهز للاستلام والطباعة' : 'قيد الفحص والمراجعة'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{v.patientName}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                    <span className="text-emerald-700 font-bold">{v.patientCode}</span>
                    <span>·</span>
                    <span>{v.date}</span>
                    <span>·</span>
                    <span>{v.patientAge}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1">
                  <span className="text-slate-400 block text-[10px]">الفحوصات المشمولة بالتقرير:</span>
                  <p className="font-medium text-slate-800 leading-snug">
                    {v.tests.map((t) => t.testNameAr).join(' · ')}
                  </p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenReportModal(v)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>استعراض وطباعة A4</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

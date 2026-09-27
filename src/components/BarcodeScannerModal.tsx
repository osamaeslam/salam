import React, { useState, useEffect, useRef } from 'react';
import { Scan, X, Search, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { Visit, Patient } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  visits: Visit[];
  patients: Patient[];
  onSelectVisit: (visit: Visit) => void;
  onSelectPatient: (patient: Patient) => void;
}

export const BarcodeScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  visits,
  patients,
  onSelectVisit,
  onSelectPatient,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<{ status: 'idle' | 'success' | 'not_found'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [cameraActive, setCameraActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setBarcodeInput('');
      setSearchFeedback({ status: 'idle', message: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLookup = (code: string) => {
    const query = code.trim().toUpperCase();
    if (!query) return;

    // Search by visit code e.g. V-2026-0001 or V-2026-0001-1
    const cleanVisitCode = query.includes('-') && query.split('-').length > 3
      ? query.substring(0, query.lastIndexOf('-'))
      : query;

    const matchedVisit = visits.find(
      (v) => v.visitCode.toUpperCase() === cleanVisitCode || v.visitCode.toUpperCase() === query
    );

    if (matchedVisit) {
      setSearchFeedback({
        status: 'success',
        message: `تم العثور على الزيارة ${matchedVisit.visitCode} للمريض ${matchedVisit.patientName}`,
      });
      setTimeout(() => {
        onSelectVisit(matchedVisit);
        onClose();
      }, 700);
      return;
    }

    // Search by patient code e.g. P-10001
    const matchedPatient = patients.find((p) => p.code.toUpperCase() === query);
    if (matchedPatient) {
      setSearchFeedback({
        status: 'success',
        message: `تم العثور على المريض ${matchedPatient.name} (${matchedPatient.code})`,
      });
      setTimeout(() => {
        onSelectPatient(matchedPatient);
        onClose();
      }, 700);
      return;
    }

    setSearchFeedback({
      status: 'not_found',
      message: `لم يتم العثور على أي مريض أو زيارة مطابقة للكود: "${query}"`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup(barcodeInput);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">قارئ الباركود الذكي (Barcode Scanner)</h3>
              <p className="text-xs text-slate-300">
                مرر الباركود بجهاز المسح الضوئي Handheld Scanner أو الكاميرا
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center animate-pulse">
              <Scan className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">جاهز لاستقبال إشارة قارئ الباركود</h4>
              <p className="text-xs text-slate-500 mt-1">
                وجه قارئ الباركود نحو الملصق أو الصق الكود هنا، سيتم الانتقال للزيارة تلقائياً
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">كود الباركود المقروء:</label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="مثال: V-2026-0001 أو P-10001"
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-emerald-500 rounded-lg text-left font-mono font-bold tracking-wider text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => handleLookup(barcodeInput)}
                className="absolute left-2 top-2 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
                title="بحث"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feedback */}
          {searchFeedback.status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{searchFeedback.message}</span>
            </div>
          )}

          {searchFeedback.status === 'not_found' && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{searchFeedback.message}</span>
            </div>
          )}

          {/* Quick test buttons */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-[11px] text-slate-400 mb-2">أكواد سريعة للتجربة والمحاكاة:</p>
            <div className="flex flex-wrap gap-2">
              {visits.slice(0, 3).map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setBarcodeInput(v.visitCode);
                    handleLookup(v.visitCode);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-mono"
                >
                  {v.visitCode}
                </button>
              ))}
              {patients.slice(0, 2).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setBarcodeInput(p.code);
                    handleLookup(p.code);
                  }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-xs font-mono"
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400">يدعم أي قارئ باركود USB أو لاسلكي Plug & Play</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

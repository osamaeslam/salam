import React from 'react';
import { AlertTriangle, UserCheck, ArrowRight, X } from 'lucide-react';
import { Patient, Doctor } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  matches: (Patient | Doctor)[];
  type: 'patient' | 'doctor';
  inputName: string;
  onSelectExisting: (item: any) => void;
  onContinueAnyway: () => void;
}

export const DuplicateWarningModal: React.FC<Props> = ({
  isOpen,
  onClose,
  matches,
  type,
  inputName,
  onSelectExisting,
  onContinueAnyway,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-amber-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-base">
                تنبيه: تم العثور على أسماء مشابهة مسجلة مسبقاً!
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                لتجنب تكرار فتح ملف {type === 'patient' ? 'مريض' : 'طبيب'} بنفس الاسم
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm text-slate-600">
            الاسم المدخل: <span className="font-bold text-slate-900">"{inputName}"</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              السجلات المشابهة المسجلة في النظام:
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-100 border border-slate-200 rounded-lg p-2 bg-slate-50">
              {matches.map((item) => (
                <div
                  key={item.id}
                  className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 hover:bg-white rounded-md transition-colors"
                >
                  <div className="text-right">
                    <p className="font-semibold text-sm text-slate-900">{item.name}</p>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono tabular-nums text-emerald-700 font-bold">{item.code}</span>
                      <span>·</span>
                      <span>{item.phone || 'بدون هاتف'}</span>
                      {'ageYears' in item && (
                        <>
                          <span>·</span>
                          <span>{item.ageYears} سنة</span>
                        </>
                      )}
                      {'specialty' in item && (
                        <>
                          <span>·</span>
                          <span>{item.specialty}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectExisting(item)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    اختيار هذا السجل
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
            هل هذا شخص مختلف تماماً يحمل نفس الاسم؟ يمكنك المتابعة وحفظ السجل الجديد برقم كود فريد غير مكرر.
          </div>
        </div>

        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onContinueAnyway}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            متابعة وحفظ كشخص جديد
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            تعديل الاسم المدخل
          </button>
        </div>
      </div>
    </div>
  );
};

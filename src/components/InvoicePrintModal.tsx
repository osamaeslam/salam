import React, { useState } from 'react';
import { Printer, X, Receipt, Check, FileText } from 'lucide-react';
import { Visit, LabSettings } from '../types';
import { generateBarcodeSVG, generateQrSVG } from '../utils/barcode';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  settings: LabSettings;
}

export const InvoicePrintModal: React.FC<Props> = ({ isOpen, onClose, visit, settings }) => {
  const [format, setFormat] = useState<'a4' | 'thermal_80mm'>('a4');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-right flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">فاتورة وإيصال تحصيل ({visit.visitCode})</h3>
              <p className="text-xs text-slate-300">طباعة فاتورة رسمية للمريض والتعاقد</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setFormat('a4')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  format === 'a4' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                فاتورة A4
              </button>
              <button
                onClick={() => setFormat('thermal_80mm')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  format === 'thermal_80mm' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                إيصال حراري 80mm
              </button>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Viewport */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {format === 'a4' ? (
            /* A4 Sheet */
            <div className="bg-white w-full max-w-[650px] p-8 shadow-md rounded-md border border-slate-200 text-slate-900 font-sans space-y-6 print:shadow-none print:border-none print:w-full">
              {/* Lab Header */}
              <div className="border-b-2 border-emerald-600 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-emerald-800">{settings.labNameAr}</h1>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">{settings.labNameEn}</p>
                  <p className="text-xs text-slate-600 mt-1">{settings.sloganAr}</p>
                </div>
                <div className="text-left font-mono text-xs text-slate-500 space-y-1">
                  <div>هاتف: {settings.phone1}</div>
                  <div>واتساب: {settings.whatsapp}</div>
                  <div>العنوان: {settings.address}</div>
                </div>
              </div>

              {/* Invoice Title & Meta */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">رقم الفاتورة:</span>{' '}
                  <strong className="font-mono text-sm text-slate-900">{visit.visitCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500">التاريخ:</span>{' '}
                  <strong className="font-mono">{visit.date} - {visit.time}</strong>
                </div>
                <div>
                  <span className="text-slate-500">طريقة السداد:</span>{' '}
                  <span className="font-semibold text-emerald-700">
                    {visit.paymentMethod === 'cash' ? 'نقدي (كاش)' :
                     visit.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                     visit.paymentMethod === 'card' ? 'بطاقة بنكية' : 'تحويل'}
                  </span>
                </div>
              </div>

              {/* Patient & Doctor Box */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500">اسم المريض:</span>{' '}
                    <strong className="text-slate-900 text-sm">{visit.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">كود المريض:</span>{' '}
                    <strong className="font-mono text-emerald-700 font-bold">{visit.patientCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">العمر / الجنس:</span>{' '}
                    <span>{visit.patientAge} · {visit.patientGender === 'male' ? 'ذكر' : visit.patientGender === 'female' ? 'أنثى' : 'طفل'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500">الطبيب المعالج:</span>{' '}
                    <span className="font-semibold">{visit.doctorName || 'طبيب خارجي / غير مسجل'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">جهة التعاقد:</span>{' '}
                    <span className="font-semibold text-slate-800">{visit.contractName || 'نقدي (خاص)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">الموعد المتوقع للاستلام:</span>{' '}
                    <span className="font-bold text-amber-700 font-mono">{visit.expectedDeliveryDate || 'اليوم 6:00 م'}</span>
                  </div>
                </div>
              </div>

              {/* Tests Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">م</th>
                      <th className="p-2.5">اسم الفحص / التحليل</th>
                      <th className="p-2.5 text-center">الكود</th>
                      <th className="p-2.5 text-left">السعر الرسمي</th>
                      <th className="p-2.5 text-left">الخصم</th>
                      <th className="p-2.5 text-left">الصافي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visit.tests.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{t.testNameAr}</td>
                        <td className="p-2.5 text-center font-mono text-slate-500">{t.testCode}</td>
                        <td className="p-2.5 text-left font-mono tabular-nums">{t.price.toFixed(2)}</td>
                        <td className="p-2.5 text-left font-mono tabular-nums text-emerald-600">
                          {t.discount ? t.discount.toFixed(2) : '0.00'}
                        </td>
                        <td className="p-2.5 text-left font-mono tabular-nums font-bold">
                          {(t.price - (t.discount || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex justify-between items-start pt-2">
                <div className="w-48 text-center space-y-1">
                  <div
                    className="flex justify-center"
                    dangerouslySetInnerHTML={{
                      __html: generateBarcodeSVG(visit.visitCode, 40, 1.8),
                    }}
                  />
                  <span className="font-mono text-xs text-slate-600 font-bold">{visit.visitCode}</span>
                </div>

                <div className="w-64 space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>إجمالي الفحوصات:</span>
                    <span className="font-mono tabular-nums">{visit.totalPrice.toFixed(2)} {settings.currency}</span>
                  </div>
                  {visit.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>إجمالي الخصم الممنوح:</span>
                      <span className="font-mono tabular-nums">- {visit.discountAmount.toFixed(2)} {settings.currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-300 pt-1.5 font-bold text-sm text-slate-900">
                    <span>صافي الفاتورة:</span>
                    <span className="font-mono tabular-nums text-emerald-800">{visit.finalPrice.toFixed(2)} {settings.currency}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-1">
                    <span>المدفوع:</span>
                    <span className="font-mono tabular-nums font-semibold">{visit.paidAmount.toFixed(2)} {settings.currency}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-bold border-t border-dashed border-slate-200 pt-1">
                    <span>المتبقي:</span>
                    <span className="font-mono tabular-nums">
                      {visit.remainingAmount.toFixed(2)} {settings.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Policy */}
              <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 text-center space-y-1">
                <p>يرجى إبراز هذا الإيصال أو كود المريض عند استلام النتائج. نتمنى لكم دوام الصحة والعافية.</p>
                <p className="font-mono text-[10px]">نظام Green Lab Soft لإدارة المختبرات الطبية</p>
              </div>
            </div>
          ) : (
            /* 80mm Thermal Receipt */
            <div className="bg-white w-[300px] p-4 shadow-md rounded-sm border border-slate-300 text-slate-900 font-mono text-[11px] space-y-3 print:shadow-none print:border-none print:w-[80mm]">
              <div className="text-center border-b border-dashed border-slate-400 pb-2 space-y-1">
                <div className="font-bold text-sm text-slate-900">{settings.labNameAr}</div>
                <div className="text-[10px] text-slate-500">{settings.phone1}</div>
                <div className="font-bold text-xs mt-1">إيصال استلام عينات</div>
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>الرقم:</span>
                  <span className="font-bold">{visit.visitCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>المريض:</span>
                  <span className="font-bold">{visit.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>كود المريض:</span>
                  <span className="font-bold">{visit.patientCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>التاريخ:</span>
                  <span>{visit.date} {visit.time}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1">
                <div className="font-bold mb-1">الفحوصات المطلوبة:</div>
                {visit.tests.map((t, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[170px]">{t.testNameAr}</span>
                    <span>{t.price} ج</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>الإجمالي:</span>
                  <span>{visit.totalPrice} ج</span>
                </div>
                {visit.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>الخصم:</span>
                    <span>-{visit.discountAmount} ج</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs">
                  <span>الصافي:</span>
                  <span>{visit.finalPrice} ج</span>
                </div>
                <div className="flex justify-between">
                  <span>المدفوع:</span>
                  <span>{visit.paidAmount} ج</span>
                </div>
                <div className="flex justify-between font-bold text-rose-700">
                  <span>المتبقي:</span>
                  <span>{visit.remainingAmount} ج</span>
                </div>
              </div>

              <div className="text-center pt-2 space-y-2">
                <div
                  className="flex justify-center"
                  dangerouslySetInnerHTML={{
                    __html: generateBarcodeSVG(visit.visitCode, 32, 1.4),
                  }}
                />
                <p className="text-[10px] text-slate-500">شكراً لثقتكم بمعامل جرين لاب</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            يمكن ربط أي طابعة فواتير ليزرية A4 أو طابعات حرارية Epson / Xprinter
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              إلغاء
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              طباعة الفاتورة الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

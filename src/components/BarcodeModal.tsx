import React, { useRef } from 'react';
import { Printer, X, Tag, Download } from 'lucide-react';
import { generateBarcodeSVG, generateQrSVG, getSampleCapColor } from '../utils/barcode';
import { Visit, Patient } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  visit?: Visit;
  patient?: Patient;
}

export const BarcodeModal: React.FC<Props> = ({ isOpen, onClose, visit, patient }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !visit) return null;

  const handlePrint = () => {
    window.print();
  };

  const patientName = patient?.name || visit.patientName;
  const patientCode = patient?.code || visit.patientCode;
  const patientAge = patient ? `${patient.ageYears} سنة` : visit.patientAge;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">طباعة ملصقات الباركود للعينات (Barcode Tube Labels)</h3>
              <p className="text-xs text-slate-300">
                ملصقات جاهزة للطباعة على طابعات الباركود الحرارية (Zebra, Xprinter, TSC)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              المريض: <strong className="text-slate-900">{patientName}</strong> ({patientCode})
            </div>
            <div>
              رقم الزيارة: <strong className="font-mono text-emerald-700">{visit.visitCode}</strong>
            </div>
            <div>
              التاريخ: <strong className="font-mono">{visit.date}</strong>
            </div>
          </div>

          {/* Printable Labels Grid */}
          <div ref={printAreaRef} className="space-y-4 print:p-0 print:m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visit.tests.map((test, idx) => {
                const sampleColor = getSampleCapColor(test.testNameAr);
                const barcodeData = `${visit.visitCode}-${idx + 1}`;

                return (
                  <div
                    key={idx}
                    className="border-2 border-dashed border-slate-300 bg-white p-3 rounded-lg shadow-xs flex flex-col justify-between relative overflow-hidden"
                    style={{ width: '100%', minHeight: '150px' }}
                  >
                    {/* Top strip indicator */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded-full ${sampleColor.bg}`} />
                        <span className="text-[11px] font-bold text-slate-800 truncate max-w-[150px]">
                          {test.testNameAr}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{sampleColor.label}</span>
                    </div>

                    {/* Barcode & Info */}
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1">
                        <div
                          className="w-full flex justify-center py-1"
                          dangerouslySetInnerHTML={{
                            __html: generateBarcodeSVG(barcodeData, 42, 1.8),
                          }}
                        />
                        <div className="text-center font-mono text-[11px] font-bold tracking-widest text-slate-800">
                          {barcodeData}
                        </div>
                      </div>

                      <div
                        className="w-12 h-12 shrink-0 border border-slate-200 p-0.5 rounded"
                        dangerouslySetInnerHTML={{
                          __html: generateQrSVG(`${visit.visitCode}:${patientCode}:${test.testCode}`, 44),
                        }}
                      />
                    </div>

                    {/* Bottom Metadata */}
                    <div className="border-t border-slate-100 pt-1 flex items-center justify-between text-[10px] text-slate-600">
                      <span className="font-semibold truncate max-w-[120px]">{patientName}</span>
                      <span className="font-mono">{patientCode}</span>
                      <span>{visit.date.slice(5)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            مقاس الملصق المتوافق: 50mm × 25mm أو 40mm × 30mm
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
              طباعة الملصقات الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

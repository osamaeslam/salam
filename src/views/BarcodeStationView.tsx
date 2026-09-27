import React, { useState } from 'react';
import {
  Barcode,
  Scan,
  Printer,
  Search,
  CheckCircle,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Visit, Patient } from '../types';
import { generateBarcodeSVG, generateQrSVG, getSampleCapColor } from '../utils/barcode';

interface Props {
  visits: Visit[];
  patients: Patient[];
  onOpenScanner: () => void;
  onPrintBarcodeModal: (visit: Visit) => void;
}

export const BarcodeStationView: React.FC<Props> = ({
  visits,
  patients,
  onOpenScanner,
  onPrintBarcodeModal,
}) => {
  const [selectedVisitId, setSelectedVisitId] = useState<string>(visits[0]?.id || '');
  const [customText, setCustomText] = useState('P-10001');

  const activeVisit = visits.find((v) => v.id === selectedVisitId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            محطة الباركود الذكية (طباعة وقراءة العينات)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            توليد وطباعة ملصقات الباركود بأكواد فريدة غير مكررة وقراءة الباركود للبحث الفوري
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Scan className="w-4 h-4" />
            <span>فتح قارئ الباركود الضوئي</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Select Visit */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            اختر الزيارة لطباعة ملصقات أنابيب العينات:
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {visits.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVisitId(v.id)}
                className={`p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                  v.id === selectedVisitId
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex justify-between font-mono">
                  <span>{v.visitCode}</span>
                  <span className="text-emerald-700">{v.patientCode}</span>
                </div>
                <div className="text-slate-900 font-bold mt-1">{v.patientName}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {v.tests.length} ملصقات أنابيب مطلوبة
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center / Right Column: Live Printable Tube Stickers */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
          {activeVisit ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    ملصقات عينات الزيارة: {activeVisit.visitCode}
                  </h3>
                  <p className="text-xs text-slate-500">
                    المريض: <strong className="text-slate-900">{activeVisit.patientName}</strong> · كود:{' '}
                    <strong className="font-mono text-emerald-700">{activeVisit.patientCode}</strong>
                  </p>
                </div>

                <button
                  onClick={() => onPrintBarcodeModal(activeVisit)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة كافة الملصقات الآن</span>
                </button>
              </div>

              {/* Grid of Stickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeVisit.tests.map((test, idx) => {
                  const sampleColor = getSampleCapColor(test.testNameAr);
                  const barcodeData = `${activeVisit.visitCode}-${idx + 1}`;

                  return (
                    <div
                      key={idx}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${sampleColor.bg}`} />
                          <span className="font-bold text-slate-900">{test.testNameAr}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{sampleColor.label}</span>
                      </div>

                      <div className="py-2 text-center bg-white p-2 rounded border border-slate-200">
                        <div
                          className="w-full flex justify-center py-1"
                          dangerouslySetInnerHTML={{
                            __html: generateBarcodeSVG(barcodeData, 42, 1.8),
                          }}
                        />
                        <div className="font-mono font-bold text-xs tracking-wider text-slate-900">
                          {barcodeData}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-1">
                        <span className="font-bold truncate max-w-[120px]">{activeVisit.patientName}</span>
                        <span>{activeVisit.patientCode}</span>
                        <span>{activeVisit.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Barcode Generator Utility */}
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <h4 className="font-bold text-xs text-slate-700">توليد باركود مخصص لأي كود أو نص:</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="اكتب أي كود لتوليده فوراً..."
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold w-64"
                    dir="ltr"
                  />
                  <div className="flex-1 bg-white p-2 border border-slate-200 rounded-lg">
                    <div
                      className="w-full flex justify-center"
                      dangerouslySetInnerHTML={{
                        __html: generateBarcodeSVG(customText || 'GREEN-LAB', 36, 1.6),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              اختر زيارة من القائمة لتوليد وطباعة الملصقات.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

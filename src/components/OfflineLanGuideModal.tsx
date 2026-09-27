import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Monitor,
  Printer,
  UserCheck,
  Server,
  HardDrive,
  Copy,
  CheckCircle,
  HelpCircle,
  X,
  ArrowRight,
  ShieldCheck,
  Laptop,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineLanGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const sampleLocalIp = 'http://192.168.1.105:3000';

  if (!isOpen) return null;

  const handleCopyIp = () => {
    navigator.clipboard.writeText(sampleLocalIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden text-right flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <WifiOff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>ربط جهازين بالمعمل بدون إنترنت (Offline Local Network)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  أوفلاين 100%
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                جهاز للاستقبال وتسجيل المرضى + جهاز للدكتور لكتابة النتائج والأشعة والطباعة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Quick Concept Illustration */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-blue-950 mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>كيف يعمل الربط بين الجهازين بدون خط إنترنت خارجي؟</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PC 1: Reception */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Monitor className="w-4 h-4 text-emerald-600" />
                    <span>الجهاز الأول (الاستقبال / Reception):</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    الجهاز الرئيسي
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                  <li>تسجيل بيانات المريض بالاسم ثلاثي ورقم الموبايل.</li>
                  <li>البحث التلقائي: لو عميل سابق تظهر بياناته فوراً.</li>
                  <li>اختيار التحاليل والأشعة المطلوبة والأسعار.</li>
                  <li>تحصيل المبالغ النقدية وطباعة الفاتورة أو الباركود.</li>
                </ul>
              </div>

              {/* PC 2: Doctor / Lab / Radiology */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <span>الجهاز الثاني (المعمل والدكتور):</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                    جهاز الطبيب والنتائج
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                  <li>يفتح نفس شاشة البرنامج في نفس الثانية بدون تأخير.</li>
                  <li>يظهر المريض المسجل في الاستقبال فوراً في قائمة التحاليل.</li>
                  <li>يقوم بكتابة نتائج الفحوصات وتقارير السونار والأشعة.</li>
                  <li>يضغط "حفظ وطباعة تقرير A4 الرسمي" للعميل فوراً.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step by Step Practical Instructions */}
          <div className="space-y-3">
            <h4 className="font-black text-sm text-slate-900">
              خطوات التركيب والتشغيل في معملك بـ 3 خطوات بسيطة:
            </h4>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">
                    توصيل الجهازين بنفس الراوتر (أو كابل شبكة عادي):
                  </h5>
                  <p className="text-slate-600 mt-0.5 text-[11px]">
                    وصل الجهازين براوتر المعمل بواسطة كابل إيثرنت أو عبر شبكة الواي فاي الداخلية (حتى لو الراوتر لا يوجد به خط نت أو الباقة منتهية، الراوتر ينشئ شبكة داخلية LAN مجانية ومحمية).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-slate-900">
                    تشغيل البرنامج على الجهاز الرئيسي (جهاز الاستقبال):
                  </h5>
                  <p className="text-slate-600 mt-0.5 text-[11px]">
                    يتم تشغيل برنامج المعمل على جهاز الاستقبال، وسيكون هو حامل قاعدة البيانات (سيكول لايت SQLite).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <h5 className="font-bold text-slate-900">
                    فتح البرنامج على جهاز الدكتور / المعمل عبر المتصفح بالآي بي المحلي:
                  </h5>
                  <p className="text-slate-600 text-[11px]">
                    على جهاز الدكتور، افتح متصفح Google Chrome أو Edge واكتب عنوان الـ IP الخاص بالجهاز الأول متبوعاً بالمنفذ <code>:3000</code>:
                  </p>

                  <div className="flex items-center gap-2 bg-white p-2 border border-slate-300 rounded-lg">
                    <span className="font-mono text-emerald-800 font-bold text-xs flex-1 text-left" dir="ltr">
                      {sampleLocalIp}
                    </span>
                    <button
                      onClick={handleCopyIp}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                    >
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SQLite Advantage Note */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 font-bold block mb-0.5">
                ميزة أمان وسرعة قاعدة بيانات SQLite للمعمل:
              </strong>
              <p className="text-slate-700 text-[11px]">
                كافة الزيارات والتحاليل والمبالغ المسجلة في الاستقبال تُحفظ في ملف SQLite فوري على الجهاز، وتظهر لحظياً على جهاز الدكتور بدون أي انقطاع وبدون الحاجة لدفع أي اشتراكات إنترنت أو سيرفرات خارجية.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-slate-500 text-[11px]">
            Green Lab Soft · نظام إدارة المختبرات ومراكز الأشعة المكتبي
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};

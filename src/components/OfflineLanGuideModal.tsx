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
  Download,
  Upload,
  RefreshCw,
  QrCode,
  Smartphone,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import { generateQrSVG } from '../utils/barcode';
import { exportSyncBundle, importSyncBundle, downloadWindowsDesktopLauncher } from '../utils/offlineSync';
import { usePWAInstall } from '../utils/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDataRefreshed?: () => void;
}

export const OfflineLanGuideModal: React.FC<Props> = ({ isOpen, onClose, onDataRefreshed }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'sync' | 'desktop'>('network');
  const [copied, setCopied] = useState(false);
  const [localIp, setLocalIp] = useState<string>('http://192.168.1.100:3000');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleCopyIp = () => {
    navigator.clipboard.writeText(localIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);
    setImportError(null);

    try {
      const res = await importSyncBundle(file);
      setImportStatus(`${res.message} (تم تحديث ${res.counts.visits} زيارة و ${res.counts.results} نتيجة)`);
      if (onDataRefreshed) onDataRefreshed();
    } catch (err: any) {
      setImportError(err.message || 'حدث خطأ أثناء استيراد ملف المزامنة');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden text-right flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <WifiOff className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  تشغيل أوفلاين وربط أجهزة المعمل (Offline Multi-Device Hub)
                </h3>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  100% بدون إنترنت
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تطبيق ديسك توب مستقل يعمل على الشبكة المحلية بين جهاز الاستقبال وجهاز الدكتور
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

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('network')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-t-2 ${
              activeTab === 'network'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            ربط الأجهزة بالشبكة المحلية (LAN Network)
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-t-2 ${
              activeTab === 'sync'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            المزامنة الفورية أوفلاين (Instant Sync)
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-t-2 ${
              activeTab === 'desktop'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            تثبيت برنامج الديسك توب (Desktop App)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* TAB 1: LAN NETWORK SETUP */}
          {activeTab === 'network' && (
            <div className="space-y-5">
              {/* Concept Box */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-700" />
                    <span>كيف يتم ربط أجهزة المعمل معاً بدون راوتر خارجي أو إنترنت؟</span>
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    أوفلاين LAN
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  بمجرد توصيل جهاز الاستقبال وجهاز المعمل بنفس الراوتر بواسطة كابل إيثرنت أو واي فاي داخلي (حتى لو الراوتر بدون إنترنت)، يقوم الراوتر بإنشاء شبكة داخلية سريعة جداً. يعمل الجهاز الأول كسيرفر معملي وتفتح باقي الأجهزة النظام فوراً عبر المتصفح.
                </p>
              </div>

              {/* IP Configuration & QR Code */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="font-bold text-xs text-slate-800 block">
                      عنوان الآي بي المحلي للجهاز الرئيسي (Local IP):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={localIp}
                        onChange={(e) => setLocalIp(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-800 flex-1"
                        dir="ltr"
                        placeholder="http://192.168.1.100:3000"
                      />
                      <button
                        onClick={handleCopyIp}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      اكتب هذا الرابط في متصفح جهاز الدكتور أو أجهزة المعمل الأخرى لفتح البرنامج فوراً.
                    </span>
                  </div>

                  {/* QR Code for instant phone/tablet camera scan */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl shadow-2xs shrink-0 text-center">
                    <div
                      className="w-24 h-24 mb-1.5 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: generateQrSVG(localIp, 96) }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-emerald-600" />
                      <span>امسح بكاميرا التابلت / الموبايل</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Roles Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Device 1 */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-emerald-600" />
                      <span>جهاز 1: الاستقبال والكاشير</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      الجهاز الرئيسي (Host)
                    </span>
                  </div>
                  <ul className="text-slate-600 text-[11px] space-y-1 list-disc list-inside">
                    <li>تسجيل بيانات المرضى والزيارات والتحاليل المطلوبة.</li>
                    <li>تحصيل النقدية، طباعة الفاتورة، وطباعة باركود العينة.</li>
                    <li>حفظ جميع البيانات في قاعدة بيانات الجهاز تلقائياً.</li>
                  </ul>
                </div>

                {/* Device 2 */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-blue-600" />
                      <span>جهاز 2: الدكتور والمختبر والأشعة</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      شاشة الطبيب (Terminal)
                    </span>
                  </div>
                  <ul className="text-slate-600 text-[11px] space-y-1 list-disc list-inside">
                    <li>يظهر المريض المسجل في الاستقبال فوراً بدون أي تأخير.</li>
                    <li>إدخال نتائج التحاليل وسحب القراءات من الأجهزة المخبرية.</li>
                    <li>اعتماد التقرير وطباعة تقرير A4 الرسمي للعميل.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTANT OFFLINE SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-5">
              {/* Broadcast Channel Status */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">
                    قناة المزامنة اللحظية بين شاشات المعمل نشطة ومفعلة (Broadcast Channel)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    أي مريض يسجله موظف الاستقبال أو أي نتيجة يكتبها الطبيب تنعكس فوراً في جميع الشاشات المفتوحة في نفس اللحظة بدون الحاجة لإعادة تحميل الصفحة.
                  </p>
                </div>
              </div>

              {/* 1-Click Sync Bundle for Flash Drive / Segregated PCs */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                    <span>مزامنة الأجهزة بفلاشة ميموري أو ملف محلي (1-Click Sync Bundle)</span>
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    لو كان جهاز الدكتور غير متصل بالراوتر، يمكنك تصدير حزمة المزامنة بضغطة زر واستيرادها في ثوانٍ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Export */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                    <span className="font-bold text-xs text-slate-900 block">
                      1. تصدير حزمة اليوم من جهاز الاستقبال:
                    </span>
                    <p className="text-slate-500 text-[11px]">
                      تصدير ملف يحتوي على كافة المرضى والزيارات والنتائج المسجلة اليوم.
                    </p>
                    <button
                      type="button"
                      onClick={() => exportSyncBundle('جهاز الاستقبال')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>تصدير حزمة المزامنة (.gls)</span>
                    </button>
                  </div>

                  {/* Import */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                    <span className="font-bold text-xs text-slate-900 block">
                      2. استيراد ودمج الحزمة في جهاز الطبيب:
                    </span>
                    <p className="text-slate-500 text-[11px]">
                      اختيار ملف المزامنة ودمجه تلقائياً مع الحفاظ على كافة البيانات السابقة.
                    </p>
                    <label className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>{isImporting ? 'جاري الدمج...' : 'اختيار ملف الحزمة (.gls)'}</span>
                      <input
                        type="file"
                        accept=".gls,.json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {importStatus && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-bold text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{importStatus}</span>
                  </div>
                )}

                {importError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 font-bold text-xs flex items-center gap-2">
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DESKTOP APP INSTALLATION */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    <span>تشغيل النظام كبرنامج كمبيوتر مستقل (Desktop Native Window)</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    بدون شريط متصفح
                  </span>
                </div>

                <p className="text-slate-600 text-xs">
                  يمكنك تثبيت البرنامج ليعمل مثل برامج الويندوز العادية (أيقونة على سطح المكتب، يفتح في نافذة كاملة بدون أشرطة المتصفح، وسريع جداً بدون أي إنترنت).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* PWA Install */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-xs text-slate-900 block">
                      طريقة 1: التثبيت الفوري (PWA Desktop App):
                    </span>
                    <p className="text-slate-500 text-[11px]">
                      تثبيت البرنامج كـ App رسمي في شريط المهام وقائمة ابدأ بنقرة زر.
                    </p>
                    <button
                      type="button"
                      onClick={install}
                      disabled={isInstalled}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isInstalled ? '✓ مثبت كبرنامج مستقل' : 'تثبيت البرنامج على الديسك توب'}</span>
                    </button>
                  </div>

                  {/* Windows .bat Shortcut */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-xs text-slate-900 block">
                      طريقة 2: ملف تشغيل ويندوز المباشر (.bat):
                    </span>
                    <p className="text-slate-500 text-[11px]">
                      تحميل ملف تشغيل سريع يتم وضعه على الديسك توب وفتحه بنقرتين.
                    </p>
                    <button
                      type="button"
                      onClick={() => downloadWindowsDesktopLauncher(localIp)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      <span>تحميل اختصار الديسك توب (.bat)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Edge/Chrome App Mode Instructions */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                <strong>نصيحة للمعمل:</strong> في متصفح Microsoft Edge أو Google Chrome، اضغط على النقاط الثلاث بالأعلى <strong>(⋮)</strong> ثم اختر <strong>Apps (التطبيقات)</strong> ← <strong>Install Green Lab Soft (تثبيت البرنامج)</strong> وسيتم وضع أيقونة فورية على سطح المكتب تفتح البرنامج بملء الشاشة أوفلاين.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-slate-500 text-[11px]">
            Green Lab Soft · تشغيل ديسك توب أوفلاين 100% ومتعدد الأجهزة
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

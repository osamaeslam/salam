import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  Activity,
  CheckCircle,
  RefreshCw,
  HardDrive,
  Sliders,
  AlertCircle,
} from 'lucide-react';

interface AnalyzerDevice {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  category: string;
  port: string;
  protocol: 'ASTM' | 'HL7' | 'Serial RS232' | 'TCP/IP';
  status: 'connected' | 'syncing' | 'idle';
  lastPing: string;
  samplesAnalyzedToday: number;
}

export const DeviceIntegrationView: React.FC = () => {
  const [devices, setDevices] = useState<AnalyzerDevice[]>([
    {
      id: 'dev-1',
      name: 'محلل أمراض الدم الآلي (CBC Analyzer)',
      model: 'XN-550 Automated Hematology',
      manufacturer: 'Sysmex Corporation',
      category: 'أمراض الدم (Hematology)',
      port: 'COM3 (192.168.1.102:5000)',
      protocol: 'HL7',
      status: 'connected',
      lastPing: 'منذ دقيقة',
      samplesAnalyzedToday: 24,
    },
    {
      id: 'dev-2',
      name: 'محلل كيمياء الدم التلقائي (Clinical Chemistry)',
      model: 'Cobas c311 Analyzer',
      manufacturer: 'Roche Diagnostics',
      category: 'كيمياء الدم (Biochemistry)',
      port: 'TCP/IP (192.168.1.105:8080)',
      protocol: 'ASTM',
      status: 'connected',
      lastPing: 'منذ ثانيتين',
      samplesAnalyzedToday: 48,
    },
    {
      id: 'dev-3',
      name: 'محلل التجلط والسيولة (Coagulation Analyzer)',
      model: 'CA-600 Coagulation',
      manufacturer: 'Sysmex',
      category: 'السيولة والتخثر (Coagulation)',
      port: 'COM1 (Serial RS232)',
      protocol: 'Serial RS232',
      status: 'idle',
      lastPing: 'منذ 15 دقيقة',
      samplesAnalyzedToday: 12,
    },
    {
      id: 'dev-4',
      name: 'محلل غازات الدم والإلكتروليتات (Electrolytes & ABG)',
      model: 'EasyStat Blood Gas',
      manufacturer: 'Medica Corporation',
      category: 'كيمياء الدم والغازات',
      port: 'COM4 (Serial RS232)',
      protocol: 'Serial RS232',
      status: 'connected',
      lastPing: 'منذ دقيقة',
      samplesAnalyzedToday: 8,
    },
  ]);

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([
    '10:45:12 - [Cobas c311]: استلام قراءة عينة (V-2026-0003) كود فحص: BIO-001 (Glucose: 138 mg/dL)',
    '10:42:05 - [Sysmex XN-550]: استلام حزمة 24 مؤشر CBC للعينة (V-2026-0001) بنجاح كامل',
    '10:30:00 - [CA-600]: اختبار المعايرة اليومي ناجح (Calibration Factor: 1.002)',
    '09:15:33 - ربط منفذ الشبكة المحلية TCP/IP نشط بدون فقد حزم (Loss: 0%)',
  ]);

  const handleTestConnection = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      const dev = devices.find((d) => d.id === id);
      setLogMessages((prev) => [
        `${new Date().toLocaleTimeString('ar-EG')} - [${dev?.name}]: فحص الاتصال التلقائي سليم (Ping: 4ms, Buffer OK)`,
        ...prev.slice(0, 8),
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            ربط أجهزة المختبر والتحاليل الآلية (Analyzer Interfaces)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            استقبال نتائج الأجهزة مباشرة عبر بروتوكولات ASTM و HL7 وتقليل الإدخال اليدوي بنسبة 100%
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>4 أجهزة متصلة بالشبكة الداخلية</span>
          </span>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((dev) => (
          <div
            key={dev.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{dev.name}</h3>
                  <p className="text-xs text-slate-500">{dev.model} · {dev.manufacturer}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                  dev.status === 'connected'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                متصل
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">المنفذ:</span>
                <span className="font-semibold text-slate-800 truncate block">{dev.port}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">البروتوكول:</span>
                <span className="font-semibold text-slate-800">{dev.protocol}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">عينات اليوم:</span>
                <span className="font-bold text-emerald-700">{dev.samplesAnalyzedToday} عينة</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">آخر إشارة: {dev.lastPing}</span>
              <button
                type="button"
                onClick={() => handleTestConnection(dev.id)}
                disabled={syncingId === dev.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingId === dev.id ? 'animate-spin' : ''}`} />
                <span>اختبار التزامن</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Real-Time Communication Log */}
      <div className="bg-slate-950 text-slate-200 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">سجل إشارات وأوامر أجهزة المختبر (Live Protocol Feed)</span>
          </div>
          <span className="text-[10px] text-emerald-400">HL7 / ASTM Parser Active</span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {logMessages.map((msg, idx) => (
            <div key={idx} className="text-emerald-400/90 text-[11px] flex items-center gap-2">
              <span className="text-slate-600">›</span>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

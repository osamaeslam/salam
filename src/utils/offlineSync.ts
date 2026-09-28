// Green Lab Soft - Offline Multi-Device Synchronization & Real-time LAN Bridge
import { StorageService } from './storage';
import { Visit, Patient, TestResultRecord } from '../types';

export interface SyncBundle {
  version: string;
  exportedAt: string;
  sourceDevice: string;
  patients: Patient[];
  visits: Visit[];
  results: TestResultRecord[];
}

// 1. Live Local Broadcast Channel (0ms latency between tabs and windows)
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('gls_offline_lan_sync');
  }
} catch (e) {
  console.log('BroadcastChannel not available, using storage event fallback');
}

export const broadcastLocalSync = (eventType: 'VISIT_ADDED' | 'RESULT_SAVED' | 'DATA_IMPORTED') => {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type: eventType, timestamp: Date.now() });
    } catch (e) {
      console.error('Broadcast error:', e);
    }
  }
};

export const subscribeToLocalSync = (onSyncReceived: (eventType: string) => void) => {
  if (syncChannel) {
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        onSyncReceived(event.data.type);
      }
    };
    syncChannel.addEventListener('message', handler);
    return () => syncChannel?.removeEventListener('message', handler);
  }

  // Fallback storage event
  const storageHandler = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('gls_')) {
      onSyncReceived('STORAGE_UPDATE');
    }
  };
  window.addEventListener('storage', storageHandler);
  return () => window.removeEventListener('storage', storageHandler);
};

// 2. Export / Import 1-Click Sync Bundle for Flash Drive / File sharing between computers
export const exportSyncBundle = (deviceName: string = 'جهاز الاستقبال'): void => {
  const patients = StorageService.getPatients();
  const visits = StorageService.getVisits();
  const results = StorageService.getResults();

  const bundle: SyncBundle = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    sourceDevice: deviceName,
    patients,
    visits,
    results,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `GLS-Sync-${dateStr}-${Date.now().toString().slice(-4)}.gls`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const importSyncBundle = async (file: File): Promise<{ success: boolean; message: string; counts: { patients: number; visits: number; results: number } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const bundle = JSON.parse(text) as SyncBundle;

        if (!bundle || !bundle.visits || !bundle.patients) {
          throw new Error('ملف المزامنة غير صالح أو تالف');
        }

        // Merge patients (upsert by id)
        const currentPatients = StorageService.getPatients();
        const patientMap = new Map<string, Patient>();
        currentPatients.forEach((p) => patientMap.set(p.id, p));
        bundle.patients.forEach((p) => patientMap.set(p.id, p));
        const mergedPatients = Array.from(patientMap.values());
        StorageService.savePatients(mergedPatients);

        // Merge visits
        const currentVisits = StorageService.getVisits();
        const visitMap = new Map<string, Visit>();
        currentVisits.forEach((v) => visitMap.set(v.id, v));
        bundle.visits.forEach((v) => visitMap.set(v.id, v));
        const mergedVisits = Array.from(visitMap.values());
        StorageService.saveVisits(mergedVisits);

        // Merge results
        const currentResults = StorageService.getResults();
        const resultMap = new Map<string, TestResultRecord>();
        currentResults.forEach((r) => resultMap.set(r.id, r));
        (bundle.results || []).forEach((r) => resultMap.set(r.id, r));
        const mergedResults = Array.from(resultMap.values());
        StorageService.saveResults(mergedResults);

        broadcastLocalSync('DATA_IMPORTED');

        resolve({
          success: true,
          message: `تمت مزامنة ودمج بيانات ${bundle.sourceDevice || 'الجهاز الآخر'} بنجاح!`,
          counts: {
            patients: mergedPatients.length,
            visits: mergedVisits.length,
            results: mergedResults.length,
          },
        });
      } catch (err: any) {
        reject(new Error(err.message || 'فشل في قراءة ملف المزامنة'));
      }
    };
    reader.readAsText(file);
  });
};

// 3. Generate Windows .bat desktop shortcut launcher
export const downloadWindowsDesktopLauncher = (lanUrl: string = 'http://localhost:3000') => {
  const batContent = `@echo off
title Green Lab Soft - تشغيل النظام الطبي المكتبي
color 0A
echo ========================================================
echo        Green Lab Soft - Medical Laboratory Desktop
echo        جاري تشغيل نظام إدارة المختبر الطبي بدون إنترنت...
echo ========================================================
echo.
echo فتح نافذة التطبيق المستقلة...
start msedge --app=${lanUrl} || start chrome --app=${lanUrl} || start ${lanUrl}
exit
`;

  const blob = new Blob([batContent], { type: 'application/x-bat' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'GreenLabSoft-Desktop-Launch.bat';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

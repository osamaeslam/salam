import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { PatientsVisitsView } from './views/PatientsVisitsView';
import { ResultsEntryView } from './views/ResultsEntryView';
import { ReportsView } from './views/ReportsView';
import { BarcodeStationView } from './views/BarcodeStationView';
import { TestsCatalogView } from './views/TestsCatalogView';
import { DoctorsContractsView } from './views/DoctorsContractsView';
import { DeviceIntegrationView } from './views/DeviceIntegrationView';
import { FinancialsView } from './views/FinancialsView';
import { StaffAttendanceView } from './views/StaffAttendanceView';
import { AiAssistantView } from './views/AiAssistantView';
import { SettingsBackupView } from './views/SettingsBackupView';

// Modals
import { BarcodeModal } from './components/BarcodeModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { MedicalReportModal } from './components/MedicalReportModal';

// Storage and Types
import { StorageService, AppUser, DEFAULT_USER } from './utils/storage';
import {
  Patient,
  Doctor,
  Contract,
  Visit,
  LabTest,
  TestResultRecord,
  Employee,
  AttendanceRecord,
  Expense,
  AuditLog,
  LabSettings,
} from './types';

export default function App() {
  // Navigation
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Application Data States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [results, setResults] = useState<TestResultRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<LabSettings>(StorageService.getSettings());
  const [currentUser, setCurrentUser] = useState<AppUser>(DEFAULT_USER);

  // Active Modals
  const [barcodeModalVisit, setBarcodeModalVisit] = useState<Visit | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [invoiceModalVisit, setInvoiceModalVisit] = useState<Visit | null>(null);
  const [reportModalVisit, setReportModalVisit] = useState<Visit | null>(null);
  const [userSwitcherOpen, setUserSwitcherOpen] = useState(false);
  const [selectedVisitIdForResults, setSelectedVisitIdForResults] = useState<string>('');

  // Load Initial Data on Mount
  useEffect(() => {
    setPatients(StorageService.getPatients());
    setDoctors(StorageService.getDoctors());
    setContracts(StorageService.getContracts());
    setVisits(StorageService.getVisits());
    setTests(StorageService.getTests());
    setResults(StorageService.getResults());
    setEmployees(StorageService.getEmployees());
    setAttendance(StorageService.getAttendance());
    setExpenses(StorageService.getExpenses());
    setAuditLogs(StorageService.getAuditLogs());
    setSettings(StorageService.getSettings());
    setCurrentUser(StorageService.getCurrentUser());
  }, []);

  // CRUD Handlers with Audit Logging
  const handleSavePatient = (patient: Patient) => {
    const updated = [patient, ...patients.filter((p) => p.id !== patient.id)];
    setPatients(updated);
    StorageService.savePatients(updated);
    StorageService.logAction('تسجيل / تعديل مريض', 'المرضى', `تم حفظ بيانات المريض: ${patient.name} (${patient.code})`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleDeletePatient = (patientId: string) => {
    const target = patients.find((p) => p.id === patientId);
    if (!target) return;
    if (confirm(`هل أنت متأكد من حذف ملف المريض (${target.name}) نهائياً؟`)) {
      const updated = patients.filter((p) => p.id !== patientId);
      setPatients(updated);
      StorageService.savePatients(updated);
      StorageService.logAction('حذف مريض', 'المرضى', `تم حذف ملف المريض: ${target.name} (${target.code})`);
      setAuditLogs(StorageService.getAuditLogs());
    }
  };

  const handleSaveVisit = (visit: Visit) => {
    const updated = [visit, ...visits.filter((v) => v.id !== visit.id)];
    setVisits(updated);
    StorageService.saveVisits(updated);
    StorageService.logAction('تسجيل زيارة جديدة', 'الزيارات والفواتير', `تسجيل زيارة رقم ${visit.visitCode} للمريض ${visit.patientName}`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleSaveResult = (result: TestResultRecord) => {
    const updated = [result, ...results.filter((r) => r.id !== result.id)];
    setResults(updated);
    StorageService.saveResults(updated);

    // Update corresponding visit status
    const visit = visits.find((v) => v.id === result.visitId);
    if (visit) {
      const updatedVisit: Visit = {
        ...visit,
        status: result.isVerified ? 'ready' : 'processing',
        sampleStatus: 'ready',
      };
      const newVisits = visits.map((v) => (v.id === visit.id ? updatedVisit : v));
      setVisits(newVisits);
      StorageService.saveVisits(newVisits);
    }

    StorageService.logAction(
      result.isVerified ? 'اعتماد نتيجة رسمية' : 'حفظ مسودة نتيجة',
      'إدخال النتائج',
      `تم ${result.isVerified ? 'اعتماد' : 'حفظ'} فحص ${result.testNameAr} للزيارة ${result.testCode}`
    );
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleSaveDoctor = (doctor: Doctor) => {
    const updated = [doctor, ...doctors.filter((d) => d.id !== doctor.id)];
    setDoctors(updated);
    StorageService.saveDoctors(updated);
    StorageService.logAction('تسجيل / تعديل طبيب', 'الأطباء', `تم حفظ بيانات الطبيب: ${doctor.name}`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleDeleteDoctor = (doctorId: string) => {
    const updated = doctors.filter((d) => d.id !== doctorId);
    setDoctors(updated);
    StorageService.saveDoctors(updated);
    StorageService.logAction('حذف طبيب', 'الأطباء', `تم حذف طبيب من النظام`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleSaveContract = (contract: Contract) => {
    const updated = [contract, ...contracts.filter((c) => c.id !== contract.id)];
    setContracts(updated);
    StorageService.saveContracts(updated);
    StorageService.logAction('إضافة تعاقد', 'التعاقدات', `حفظ تعاقد: ${contract.name} (${contract.discountPercent}%)`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleDeleteContract = (contractId: string) => {
    const updated = contracts.filter((c) => c.id !== contractId);
    setContracts(updated);
    StorageService.saveContracts(updated);
  };

  const handleSaveTest = (test: LabTest) => {
    const updated = [test, ...tests.filter((t) => t.id !== test.id)];
    setTests(updated);
    StorageService.saveTests(updated);
    StorageService.logAction('تعديل فحص طبي', 'دليل الفحوصات', `تحديث بيانات وسعر فحص ${test.nameAr} (${test.price} ج)`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleImportTests = (newTests: LabTest[]) => {
    const existingMap = new Map(tests.map((t) => [t.code, t]));
    newTests.forEach((t) => {
      existingMap.set(t.code, t as LabTest);
    });
    const combined = Array.from(existingMap.values());
    setTests(combined);
    StorageService.saveTests(combined);
    StorageService.logAction('استيراد فحوصات من Excel', 'دليل الفحوصات', `تم استيراد ${newTests.length} فحص طبي من Excel`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleDeleteTest = (testId: string) => {
    const updated = tests.filter((t) => t.id !== testId);
    setTests(updated);
    StorageService.saveTests(updated);
    StorageService.logAction('حذف فحص طبي', 'دليل الفحوصات', `حذف فحص من الدليل`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleSaveExpense = (expense: Expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    StorageService.saveExpenses(updated);
    StorageService.logAction('تسجيل مصروف', 'الخزينة', `تسجيل مصروف ${expense.title} بقيمة ${expense.amount} ج`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleDeleteExpense = (expenseId: string) => {
    const updated = expenses.filter((e) => e.id !== expenseId);
    setExpenses(updated);
    StorageService.saveExpenses(updated);
  };

  const handleSaveEmployee = (emp: Employee) => {
    const updated = [emp, ...employees.filter((e) => e.id !== emp.id)];
    setEmployees(updated);
    StorageService.saveEmployees(updated);
    StorageService.logAction('تسجيل موظف', 'الموظفون', `حفظ موظف ${emp.name} براتب ساعي ${emp.hourlyRate} ج`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleSaveAttendance = (record: AttendanceRecord) => {
    const updated = [record, ...attendance];
    setAttendance(updated);
    StorageService.saveAttendance(updated);
    StorageService.logAction('تسجيل دوام', 'الحضور والانصراف', `تسجيل دوام ${record.employeeName} (${record.totalHours} ساعات)`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleSaveSettings = (newSettings: LabSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    StorageService.logAction('تحديث إعدادات المختبر', 'الإعدادات', 'تم تحديث بيانات المعمل والترويسة');
    setAuditLogs(StorageService.getAuditLogs());
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar adhering strictly to Top Bar Contract */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onOpenScanner={() => setScannerOpen(true)}
        onQuickNewVisit={() => setActiveView('patients')}
        onSwitchUser={() => setUserSwitcherOpen(true)}
      />

      {/* Main Body Layout (Sidebar + Content Stage) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Right Sidebar (Arabic RTL) */}
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeView === 'dashboard' && (
            <DashboardView
              patients={patients}
              doctors={doctors}
              visits={visits}
              tests={tests}
              expenses={expenses}
              settings={settings}
              onNavigate={setActiveView}
              onNewVisit={() => setActiveView('patients')}
              onOpenScanner={() => setScannerOpen(true)}
              onSelectVisit={(v) => {
                setReportModalVisit(v);
              }}
              onOpenResults={(v) => {
                setSelectedVisitIdForResults(v.id);
                setActiveView('results');
              }}
              onSaveSettlement={(record) => {
                StorageService.saveSettlement(record);
              }}
            />
          )}

          {activeView === 'patients' && (
            <PatientsVisitsView
              patients={patients}
              visits={visits}
              doctors={doctors}
              contracts={contracts}
              tests={tests}
              onSavePatient={handleSavePatient}
              onDeletePatient={handleDeletePatient}
              onSaveVisit={handleSaveVisit}
              onPrintInvoice={(v) => setInvoiceModalVisit(v)}
              onPrintBarcode={(v) => setBarcodeModalVisit(v)}
              onOpenReport={(v) => setReportModalVisit(v)}
              onOpenResults={(v) => {
                setSelectedVisitIdForResults(v.id);
                setActiveView('results');
              }}
            />
          )}

          {activeView === 'results' && (
            <ResultsEntryView
              visits={visits}
              tests={tests}
              results={results}
              patients={patients}
              initialVisitId={selectedVisitIdForResults}
              onSaveResult={handleSaveResult}
              onOpenReport={(v) => setReportModalVisit(v)}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView
              visits={visits}
              patients={patients}
              results={results}
              onOpenReportModal={(v) => setReportModalVisit(v)}
            />
          )}

          {activeView === 'barcode' && (
            <BarcodeStationView
              visits={visits}
              patients={patients}
              onOpenScanner={() => setScannerOpen(true)}
              onPrintBarcodeModal={(v) => setBarcodeModalVisit(v)}
            />
          )}

          {activeView === 'tests' && (
            <TestsCatalogView
              tests={tests}
              onSaveTest={handleSaveTest}
              onImportTests={handleImportTests}
              onDeleteTest={handleDeleteTest}
            />
          )}

          {activeView === 'doctors' && (
            <DoctorsContractsView
              doctors={doctors}
              contracts={contracts}
              visits={visits}
              onSaveDoctor={handleSaveDoctor}
              onDeleteDoctor={handleDeleteDoctor}
              onSaveContract={handleSaveContract}
              onDeleteContract={handleDeleteContract}
            />
          )}

          {activeView === 'devices' && <DeviceIntegrationView />}

          {activeView === 'financials' && (
            <FinancialsView
              visits={visits}
              expenses={expenses}
              employees={employees}
              attendance={attendance}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeView === 'staff' && (
            <StaffAttendanceView
              employees={employees}
              attendance={attendance}
              onSaveEmployee={handleSaveEmployee}
              onSaveAttendance={handleSaveAttendance}
            />
          )}

          {activeView === 'ai' && <AiAssistantView />}

          {activeView === 'settings' && (
            <SettingsBackupView
              settings={settings}
              auditLogs={auditLogs}
              patients={patients}
              onSaveSettings={handleSaveSettings}
              onSavePatient={handleSavePatient}
              onRestoreBackup={() => {
                setPatients(StorageService.getPatients());
                setDoctors(StorageService.getDoctors());
                setContracts(StorageService.getContracts());
                setVisits(StorageService.getVisits());
                setTests(StorageService.getTests());
                setResults(StorageService.getResults());
              }}
            />
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      {/* 1. Barcode Tube Labels Print Modal */}
      {barcodeModalVisit && (
        <BarcodeModal
          isOpen={!!barcodeModalVisit}
          onClose={() => setBarcodeModalVisit(null)}
          visit={barcodeModalVisit}
          patient={patients.find((p) => p.id === barcodeModalVisit.patientId)}
        />
      )}

      {/* 2. Barcode Scanner Reader Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        visits={visits}
        patients={patients}
        onSelectVisit={(v) => {
          setScannerOpen(false);
          setReportModalVisit(v);
        }}
        onSelectPatient={(p) => {
          setScannerOpen(false);
          setActiveView('patients');
        }}
      />

      {/* 3. Invoice & Receipt Print Modal */}
      {invoiceModalVisit && (
        <InvoicePrintModal
          isOpen={!!invoiceModalVisit}
          onClose={() => setInvoiceModalVisit(null)}
          visit={invoiceModalVisit}
          settings={settings}
        />
      )}

      {/* 4. Medical Report Modal (A4 print, email, whatsapp) */}
      {reportModalVisit && (
        <MedicalReportModal
          isOpen={!!reportModalVisit}
          onClose={() => setReportModalVisit(null)}
          visit={reportModalVisit}
          patient={patients.find((p) => p.id === reportModalVisit.patientId)}
          results={results.filter((r) => r.visitId === reportModalVisit.id)}
          settings={settings}
        />
      )}

      {/* 5. User Profile Switcher */}
      {userSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 text-right space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              تبديل حساب المستخدم النشط
            </h3>
            <div className="space-y-2">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => {
                    const usr: AppUser = {
                      id: emp.id,
                      name: emp.name,
                      role: emp.role,
                      roleNameAr: emp.roleTitleAr,
                    };
                    setCurrentUser(usr);
                    StorageService.setCurrentUser(usr);
                    setUserSwitcherOpen(false);
                  }}
                  className={`p-2.5 rounded-lg border cursor-pointer text-xs flex justify-between items-center transition-colors ${
                    currentUser.id === emp.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{emp.name}</div>
                    <div className="text-[10px] text-slate-500">{emp.roleTitleAr}</div>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700">{emp.code}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setUserSwitcherOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

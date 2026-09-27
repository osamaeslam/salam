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
  ShiftSettlementRecord,
} from '../types';
import { generateFull385Tests } from '../data/catalog';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_CONTRACTS,
  INITIAL_VISITS,
  INITIAL_RESULTS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_EXPENSES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
} from '../data/seedData';

const KEYS = {
  PATIENTS: 'gls_patients_v1',
  DOCTORS: 'gls_doctors_v1',
  CONTRACTS: 'gls_contracts_v1',
  VISITS: 'gls_visits_v1',
  TESTS: 'gls_tests_v1',
  RESULTS: 'gls_results_v1',
  EMPLOYEES: 'gls_employees_v1',
  ATTENDANCE: 'gls_attendance_v1',
  EXPENSES: 'gls_expenses_v1',
  AUDIT_LOGS: 'gls_audit_logs_v1',
  SETTINGS: 'gls_settings_v1',
  CURRENT_USER: 'gls_current_user_v1',
  SETTLEMENTS: 'gls_shift_settlements_v1',
};

export interface AppUser {
  id: string;
  name: string;
  role: 'admin' | 'lab_tech' | 'receptionist' | 'pathologist';
  roleNameAr: string;
}

export const DEFAULT_USER: AppUser = {
  id: 'emp-1',
  name: 'د. طارق محمود البدري (المدير العام)',
  role: 'admin',
  roleNameAr: 'مدير النظام والمختبر',
};

// Generic read with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

// Generic write
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  // Current User
  getCurrentUser(): AppUser {
    return loadFromStorage(KEYS.CURRENT_USER, DEFAULT_USER);
  },
  setCurrentUser(user: AppUser): void {
    saveToStorage(KEYS.CURRENT_USER, user);
  },

  // Patients
  getPatients(): Patient[] {
    return loadFromStorage(KEYS.PATIENTS, INITIAL_PATIENTS);
  },
  savePatients(patients: Patient[]): void {
    saveToStorage(KEYS.PATIENTS, patients);
  },

  // Doctors
  getDoctors(): Doctor[] {
    return loadFromStorage(KEYS.DOCTORS, INITIAL_DOCTORS);
  },
  saveDoctors(doctors: Doctor[]): void {
    saveToStorage(KEYS.DOCTORS, doctors);
  },

  // Contracts
  getContracts(): Contract[] {
    return loadFromStorage(KEYS.CONTRACTS, INITIAL_CONTRACTS);
  },
  saveContracts(contracts: Contract[]): void {
    saveToStorage(KEYS.CONTRACTS, contracts);
  },

  // Tests Catalog (385 tests)
  getTests(): LabTest[] {
    const loaded = loadFromStorage<LabTest[]>(KEYS.TESTS, []);
    if (!loaded || loaded.length === 0) {
      const generated = generateFull385Tests();
      saveToStorage(KEYS.TESTS, generated);
      return generated;
    }
    return loaded;
  },
  saveTests(tests: LabTest[]): void {
    saveToStorage(KEYS.TESTS, tests);
  },

  // Visits
  getVisits(): Visit[] {
    return loadFromStorage(KEYS.VISITS, INITIAL_VISITS);
  },
  saveVisits(visits: Visit[]): void {
    saveToStorage(KEYS.VISITS, visits);
  },

  // Results
  getResults(): TestResultRecord[] {
    return loadFromStorage(KEYS.RESULTS, INITIAL_RESULTS);
  },
  saveResults(results: TestResultRecord[]): void {
    saveToStorage(KEYS.RESULTS, results);
  },

  // Employees
  getEmployees(): Employee[] {
    return loadFromStorage(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  },
  saveEmployees(employees: Employee[]): void {
    saveToStorage(KEYS.EMPLOYEES, employees);
  },

  // Attendance
  getAttendance(): AttendanceRecord[] {
    return loadFromStorage(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },
  saveAttendance(attendance: AttendanceRecord[]): void {
    saveToStorage(KEYS.ATTENDANCE, attendance);
  },

  // Expenses
  getExpenses(): Expense[] {
    return loadFromStorage(KEYS.EXPENSES, INITIAL_EXPENSES);
  },
  saveExpenses(expenses: Expense[]): void {
    saveToStorage(KEYS.EXPENSES, expenses);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return loadFromStorage(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  logAction(action: string, module: string, details: string): void {
    const user = this.getCurrentUser();
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('ar-EG'),
      userName: user.name,
      userRole: user.role,
      action,
      module,
      details,
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop(); // keep last 200
    saveToStorage(KEYS.AUDIT_LOGS, logs);
  },

  // Settings
  getSettings(): LabSettings {
    return loadFromStorage(KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings(settings: LabSettings): void {
    saveToStorage(KEYS.SETTINGS, settings);
  },

  // Shift & Daily Settlements
  getSettlements(): ShiftSettlementRecord[] {
    return loadFromStorage<ShiftSettlementRecord[]>(KEYS.SETTLEMENTS, []);
  },
  saveSettlements(settlements: ShiftSettlementRecord[]): void {
    saveToStorage(KEYS.SETTLEMENTS, settlements);
  },
  saveSettlement(record: ShiftSettlementRecord): void {
    const list = this.getSettlements();
    const updated = [record, ...list.filter((r) => r.id !== record.id)];
    this.saveSettlements(updated);
  },

  // Export Complete Backup JSON
  exportFullBackupJSON(): string {
    const backup = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      labName: this.getSettings().labNameAr,
      patients: this.getPatients(),
      doctors: this.getDoctors(),
      contracts: this.getContracts(),
      tests: this.getTests(),
      visits: this.getVisits(),
      results: this.getResults(),
      employees: this.getEmployees(),
      attendance: this.getAttendance(),
      expenses: this.getExpenses(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore Complete Backup JSON
  restoreFullBackupJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.patients) saveToStorage(KEYS.PATIENTS, parsed.patients);
      if (parsed.doctors) saveToStorage(KEYS.DOCTORS, parsed.doctors);
      if (parsed.contracts) saveToStorage(KEYS.CONTRACTS, parsed.contracts);
      if (parsed.tests) saveToStorage(KEYS.TESTS, parsed.tests);
      if (parsed.visits) saveToStorage(KEYS.VISITS, parsed.visits);
      if (parsed.results) saveToStorage(KEYS.RESULTS, parsed.results);
      if (parsed.employees) saveToStorage(KEYS.EMPLOYEES, parsed.employees);
      if (parsed.attendance) saveToStorage(KEYS.ATTENDANCE, parsed.attendance);
      if (parsed.expenses) saveToStorage(KEYS.EXPENSES, parsed.expenses);
      if (parsed.settings) saveToStorage(KEYS.SETTINGS, parsed.settings);
      this.logAction('استرجاع نسخة احتياطية', 'النظام', 'تم استرجاع قاعدة بيانات المختبر بنجاح من ملف خارجي');
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  },

  // Reset to Factory Defaults
  resetAllToFactory(): void {
    localStorage.removeItem(KEYS.PATIENTS);
    localStorage.removeItem(KEYS.DOCTORS);
    localStorage.removeItem(KEYS.CONTRACTS);
    localStorage.removeItem(KEYS.VISITS);
    localStorage.removeItem(KEYS.TESTS);
    localStorage.removeItem(KEYS.RESULTS);
    localStorage.removeItem(KEYS.EMPLOYEES);
    localStorage.removeItem(KEYS.ATTENDANCE);
    localStorage.removeItem(KEYS.EXPENSES);
    localStorage.removeItem(KEYS.AUDIT_LOGS);
    localStorage.removeItem(KEYS.SETTINGS);
  },
};

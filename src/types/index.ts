export type Gender = 'male' | 'female' | 'child' | 'infant';

export interface Patient {
  id: string;
  code: string; // e.g. P-10023
  name: string;
  dob?: string;
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  gender: Gender;
  phone: string;
  address: string;
  nationalId?: string;
  bloodGroup?: string;
  notes?: string;
  loyaltyPoints?: number;
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'vip';
  totalVisitsCount?: number;
  totalSpent?: number;
  createdAt: string;
}

export interface Doctor {
  id: string;
  code: string; // e.g. D-101
  name: string;
  specialty: string;
  phone: string;
  address: string;
  clinic?: string;
  commissionRate: number; // percentage
  referralCount: number;
  createdAt: string;
}

export interface Contract {
  id: string;
  name: string;
  type: 'syndicate' | 'company' | 'insurance' | 'charity';
  discountPercent: number;
  phone?: string;
  notes?: string;
  active: boolean;
}

export interface TestComponent {
  id: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  defaultValue?: string | number;
  minVal?: number;
  maxVal?: number;
  normalRangeText: string;
  normalRangeByGender?: {
    male: string;
    female: string;
    child?: string;
    infant?: string;
    minMale?: number;
    maxMale?: number;
    minFemale?: number;
    maxFemale?: number;
  };
}

export interface LabTest {
  id: string;
  code: string; // e.g. CBC-01, RAD-01
  nameAr: string;
  nameEn: string;
  category: string;
  type?: 'lab' | 'radiology'; // 'lab' = تحليل مخبري, 'radiology' = فحص أشعة وسونار
  radiologyType?: 'sonar' | 'xray' | 'ct' | 'mri' | 'echo' | 'doppler' | 'mammogram' | 'other';
  sampleType: string;
  sampleRequirements: string;
  price: number;
  cost: number;
  turnaroundHours: number; // e.g. 2 hours, 24 hours
  stockReagents: number; // quantity available
  minStockWarning: number;
  expiryDate?: string; // YYYY-MM-DD تاريخ انتهاء صلاحية الكاشف / المادة
  lotNumber?: string; // رقم التشغيلة / Lot #
  components: TestComponent[];
  isCulture?: boolean;
  isSemenCASA?: boolean;
}

export interface UserPermissions {
  canRegisterVisits: boolean; // الاستقبال: تسجيل المرضى والزيارات وتحصيل المبالغ
  canEnterResults: boolean;   // المختبر: إدخال قيم الفحوصات والنتائج
  canVerifyResults: boolean;  // المختبر: اعتماد وتوقيع التقارير الطبية
  canViewFinancials: boolean; // الإدارة: مراجعة الخزينة والرواتب والأرباح
  canManageUsers: boolean;    // الإدارة: إضافة وتعديل المستخدمين والصلاحيات
  canManageSettings: boolean; // الإدارة: تسعير التحاليل وإعدادات النظام
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  pinCode?: string;
  role: 'admin' | 'lab_tech' | 'receptionist' | 'pathologist';
  roleNameAr: string;
  permissions: UserPermissions;
  isActive: boolean;
}

export interface VisitTestItem {
  testId: string;
  testCode: string;
  testNameAr: string;
  type?: 'lab' | 'radiology';
  radiologyType?: string;
  price: number;
  discount: number;
  status: 'pending' | 'sample_taken' | 'processing' | 'completed' | 'delivered';
  isDelivered?: boolean;
  deliveredAt?: string;
}

export interface Visit {
  id: string;
  visitCode: string; // e.g. V-2026-0042
  patientId: string;
  patientName: string;
  patientCode: string;
  patientGender: Gender;
  patientAge: string;
  doctorId?: string;
  doctorName?: string;
  contractId?: string;
  contractName?: string;
  date: string;
  time: string;
  tests: VisitTestItem[];
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: 'cash' | 'card' | 'vodafone_cash' | 'transfer';
  status: 'pending' | 'processing' | 'ready' | 'delivered';
  deliveryStatus?: 'not_delivered' | 'partially_delivered' | 'delivered';
  deliveredAt?: string;
  deliveredBy?: string;
  radiologyCount?: number;
  labTestsCount?: number;
  sampleStatus: 'collected' | 'processing' | 'ready';
  expectedDeliveryDate: string;
  notes?: string;
  createdAt: string;
}

export interface ShiftSettlementRecord {
  id: string;
  date: string;
  shiftName: 'morning' | 'evening' | 'full_day';
  shiftNameAr: string;
  closedBy: string;
  closedAt: string;
  totalPatientsCount: number;
  totalLabTestsCount: number;
  totalRadiologyCount: number;
  radiologyBreakdown: Record<string, number>; // e.g. sonar: 4, xray: 2
  labBreakdown: Record<string, number>;
  totalSales: number;
  totalDiscounts: number;
  netRevenue: number;
  cashCollected: number;
  cardCollected: number;
  vodafoneCollected: number;
  remainingReceivable: number;
  totalExpenses: number;
  actualCashInDrawer: number;
  differenceAmount: number; // زيادة أو عجز
  status: 'balanced' | 'surplus' | 'shortage';
  notes?: string;
}

export interface ComponentResultValue {
  value: string | number;
  flag: 'normal' | 'high' | 'low' | 'critical';
  normalRangeText: string;
  comment?: string;
}

export interface CultureSensitivityItem {
  antibiotic: string;
  sensitivity: 'Sensitive (S)' | 'Intermediate (I)' | 'Resistant (R)';
}

export interface CultureResultData {
  specimen: string;
  growth: string;
  organism: string;
  colonyCount: string;
  antibiotics: CultureSensitivityItem[];
}

export interface SemenCASAResultData {
  liquefactionTime: string;
  appearance: string;
  volume: string;
  viscosity: string;
  ph: string;
  totalCount: string; // Millions/ml
  progressiveMotility: string; // % (PR)
  nonProgressiveMotility: string; // % (NP)
  immotility: string; // % (IM)
  normalMorphology: string; // %
  abnormalMorphology: string; // %
  wbc: string;
  rbc: string;
  agglutination: string;
}

export interface TestResultRecord {
  id: string;
  visitId: string;
  patientId: string;
  testId: string;
  testCode: string;
  testNameAr: string;
  testNameEn: string;
  category: string;
  values: Record<string, ComponentResultValue>; // componentId -> value
  cultureData?: CultureResultData;
  semenData?: SemenCASAResultData;
  clinicalComment?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  role: 'admin' | 'lab_tech' | 'receptionist' | 'pathologist';
  roleTitleAr: string;
  phone: string;
  hourlyRate: number; // الراتب في الساعة
  baseSalary: number;
  active: boolean;
  joinedDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string; // HH:mm
  checkOut?: string; // HH:mm
  totalHours: number;
  calculatedWage: number;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'rent' | 'supplies_reagents' | 'maintenance' | 'utilities' | 'salaries' | 'other';
  amount: number;
  date: string;
  paidBy: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
}

export interface LabSettings {
  labNameAr: string;
  labNameEn: string;
  sloganAr: string;
  licenseNumber: string;
  branchName: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  address: string;
  directorName: string;
  directorTitle?: string; // المسمى الوظيفي للمعتمد (الافتراضي: المدير الفني للمختبر)
  hideClinicalInterpretation?: boolean; // نمط المعمل فقط: إخفاء التفسير الاستشاري والنصائح الطبية
  onlyPureResults?: boolean; // الاقتصار على النتائج المخبرية الصافية فقط
  reportTheme: 'emerald' | 'sapphire' | 'burgundy' | 'navy' | 'classic';
  reportFont: 'cairo' | 'tajawal' | 'system';
  logoPosition: 'right' | 'left' | 'center' | 'watermark';
  patientInfoLayout: 'cards_grid' | 'horizontal_bar' | 'compact_table' | 'two_columns';
  fontSize: 'compact' | 'standard' | 'large';
  pageMargins: 'compact' | 'standard' | 'wide';
  showWatermark: boolean;
  showDoctorRibbon: boolean;
  showOfficialSeal: boolean;
  showBarcode: boolean;
  showQrCodeOnReport: boolean;
  enableDeviceSimulator: boolean;
  printReceiptFormat: 'a4' | 'thermal_80mm';
  currency: string;
  // Loyalty and VIP Program
  loyaltyEnabled: boolean;
  pointsPerPound: number; // e.g. 1 point for each 10 EGP
  pointRedeemValue: number; // e.g. 100 points = 50 EGP
  // Architecture and Database
  databaseMode: 'sqlite_local' | 'lan_multidevice' | 'cloud_sync';
}

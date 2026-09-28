-- =========================================================================
-- Green Lab Soft - Complete SQLite Database Schema (الأوفلاين ديسكتوب)
-- Database File: greenlab.db
-- Engine: SQLite 3.x (with WAL mode enabled for zero corruption)
-- =========================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- 1. Patients Table (سجل المرضى وملفاتهم الدائمة)
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g. P-10001
  name TEXT NOT NULL,
  phone TEXT,
  gender TEXT CHECK(gender IN ('male', 'female', 'child', 'infant')),
  age_years INTEGER DEFAULT 0,
  age_months INTEGER DEFAULT 0,
  age_days INTEGER DEFAULT 0,
  dob TEXT,
  address TEXT,
  notes TEXT,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_code ON patients(code);

-- 2. Referring Doctors (الأطباء المحولون ونسب الإحالة)
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  specialty TEXT,
  clinic_address TEXT,
  commission_percent REAL DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  total_revenue_generated REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Corporate & Insurance Contracts (جهات التعاقد ونسب الخصم)
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('insurance', 'corporate', 'syndicate', 'other')),
  discount_percent REAL DEFAULT 0,
  contact_person TEXT,
  phone TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tests & Radiology Catalog (دليل الفحوصات والتحاليل والأشعة)
CREATE TABLE IF NOT EXISTS tests_catalog (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g. CBC-001, RAD-001
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT DEFAULT 'lab' CHECK(type IN ('lab', 'radiology')),
  radiology_type TEXT, -- e.g. sonar, xray, ct, mri, echo
  sample_type TEXT, -- سيرم، دم كامل، مسحة، إلخ
  sample_requirements TEXT,
  imaging_preparation TEXT,
  price REAL NOT NULL,
  cost REAL DEFAULT 0,
  turnaround_hours INTEGER DEFAULT 2,
  stock_reagents INTEGER DEFAULT 100,
  min_stock_warning INTEGER DEFAULT 15,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tests_code ON tests_catalog(code);
CREATE INDEX IF NOT EXISTS idx_tests_type ON tests_catalog(type);

-- 5. Visits & Billing (الزيارات والفواتير وحالة التسليم)
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  visit_code TEXT UNIQUE NOT NULL, -- e.g. V-2026-0001
  patient_id TEXT NOT NULL REFERENCES patients(id),
  doctor_id TEXT REFERENCES doctors(id),
  contract_id TEXT REFERENCES contracts(id),
  date TEXT NOT NULL, -- YYYY-MM-DD
  time TEXT NOT NULL, -- HH:MM
  total_price REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  final_price REAL NOT NULL,
  paid_amount REAL NOT NULL,
  remaining_amount REAL DEFAULT 0,
  payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'vodafone_cash', 'transfer')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'ready', 'delivered')),
  delivery_status TEXT DEFAULT 'not_delivered' CHECK(delivery_status IN ('not_delivered', 'partially_delivered', 'delivered')),
  delivered_at DATETIME,
  delivered_by TEXT,
  sample_status TEXT DEFAULT 'collected',
  radiology_count INTEGER DEFAULT 0,
  lab_tests_count INTEGER DEFAULT 0,
  tests_json TEXT NOT NULL, -- Full snapshot of items
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(date);
CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_delivery ON visits(delivery_status);

-- 6. Test & Radiology Results (نتائج التحاليل وتقارير الأشعة المعتمدة)
CREATE TABLE IF NOT EXISTS test_results (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL REFERENCES visits(id),
  test_id TEXT NOT NULL REFERENCES tests_catalog(id),
  test_code TEXT NOT NULL,
  test_name_ar TEXT NOT NULL,
  category TEXT NOT NULL,
  parameters_json TEXT NOT NULL, -- Array of parameter values, flags (H/L), units, normal ranges
  clinical_comment TEXT,
  radiology_impression TEXT,
  is_verified INTEGER DEFAULT 0,
  verified_by TEXT,
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_results_visit ON test_results(visit_id);

-- 7. Shift Settlements (إغلاق الورديات واليوميات وحسابات الدرج)
CREATE TABLE IF NOT EXISTS shift_settlements (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  shift_name TEXT CHECK(shift_name IN ('morning', 'evening', 'full_day')),
  shift_name_ar TEXT NOT NULL,
  closed_by TEXT NOT NULL,
  closed_at TEXT NOT NULL,
  total_patients_count INTEGER DEFAULT 0,
  total_lab_tests_count INTEGER DEFAULT 0,
  total_radiology_count INTEGER DEFAULT 0,
  radiology_breakdown_json TEXT,
  lab_breakdown_json TEXT,
  total_sales REAL NOT NULL,
  total_discounts REAL DEFAULT 0,
  net_revenue REAL NOT NULL,
  cash_collected REAL DEFAULT 0,
  card_collected REAL DEFAULT 0,
  vodafone_collected REAL DEFAULT 0,
  remaining_receivable REAL DEFAULT 0,
  total_expenses REAL DEFAULT 0,
  actual_cash_in_drawer REAL NOT NULL,
  difference_amount REAL DEFAULT 0,
  status TEXT CHECK(status IN ('balanced', 'surplus', 'shortage')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settlements_date ON shift_settlements(date);

-- 8. Expenses Table (سجل المصروفات والنثريات اليومية)
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('supplies_reagents', 'rent_utilities', 'maintenance', 'salaries', 'hospitality', 'other')),
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  paid_by TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- 9. Employees & Monthly Payroll (الموظفون والرواتب وساعات العمل)
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  base_salary REAL NOT NULL,
  hourly_rate REAL NOT NULL,
  join_date TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id),
  employee_name TEXT NOT NULL,
  date TEXT NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT,
  total_hours REAL DEFAULT 0,
  status TEXT CHECK(status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Lab System Settings (إعدادات المعمل وترويسة التقارير و A4)
CREATE TABLE IF NOT EXISTS lab_settings (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  lab_name_ar TEXT NOT NULL,
  lab_name_en TEXT,
  slogan_ar TEXT,
  phone_primary TEXT,
  phone_secondary TEXT,
  address_ar TEXT,
  director_name TEXT,
  director_title TEXT,
  report_header_layout TEXT DEFAULT 'standard',
  theme_color TEXT DEFAULT 'emerald',
  font_size TEXT DEFAULT 'normal',
  show_qr_code INTEGER DEFAULT 1,
  point_redeem_value REAL DEFAULT 0.5,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

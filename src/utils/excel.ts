import * as XLSX from 'xlsx';
import { LabTest, Visit, Patient, Expense } from '../types';

export function exportTestsToExcel(tests: LabTest[], fileName: string = 'GreenLab_Tests_Catalog.xlsx') {
  const data = tests.map((t, idx) => ({
    'م': idx + 1,
    'كود التحليل': t.code,
    'اسم التحليل (عربي)': t.nameAr,
    'اسم التحليل (إنجليزي)': t.nameEn,
    'التصنيف': t.category,
    'نوع العينة': t.sampleType,
    'شروط التحليل': t.sampleRequirements,
    'سعر البيع (ج.م)': t.price,
    'التكلفة (ج.م)': t.cost,
    'وقت التسليم (ساعة)': t.turnaroundHours,
    'رصيد المخزن': t.stockReagents,
    'حد التنبيه': t.minStockWarning,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'قائمة التحاليل');
  XLSX.writeFile(workbook, fileName);
}

export function parseTestsFromExcel(file: File): Promise<Partial<LabTest>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        const parsedTests: Partial<LabTest>[] = json.map((row, idx) => ({
          id: `t-imp-${Date.now()}-${idx}`,
          code: row['كود التحليل'] || row['Code'] || `TEST-${idx + 100}`,
          nameAr: row['اسم التحليل (عربي)'] || row['Name Ar'] || row['الاسم بالعربي'] || `تحليل مستورد ${idx + 1}`,
          nameEn: row['اسم التحليل (إنجليزي)'] || row['Name En'] || row['الاسم بالإنجليزي'] || `Imported Test ${idx + 1}`,
          category: row['التصنيف'] || row['Category'] || 'تحاليل عامة',
          sampleType: row['نوع العينة'] || row['Sample'] || 'سيرم (Serum)',
          sampleRequirements: row['شروط التحليل'] || row['Preparation'] || 'وفق المعايير القياسية',
          price: Number(row['سعر البيع (ج.م)'] || row['Price'] || row['السعر'] || 100),
          cost: Number(row['التكلفة (ج.م)'] || row['Cost'] || row['التكلفة'] || 30),
          turnaroundHours: Number(row['وقت التسليم (ساعة)'] || row['Hours'] || 2),
          stockReagents: Number(row['رصيد المخزن'] || row['Stock'] || 50),
          minStockWarning: Number(row['حد التنبيه'] || row['Min Warning'] || 10),
          components: [
            {
              id: `c-imp-${idx}`,
              nameAr: row['اسم التحليل (عربي)'] || `نتيجة ${idx + 1}`,
              nameEn: row['اسم التحليل (إنجليزي)'] || `Result ${idx + 1}`,
              unit: row['الوحدة'] || row['Unit'] || 'Units',
              normalRangeText: row['المدى الطبيعي'] || row['Normal Range'] || 'طبيعي معتمد',
            },
          ],
        }));

        resolve(parsedTests);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function exportFinancialsToExcel(visits: Visit[], expenses: Expense[], fileName: string = 'GreenLab_Financial_Report.xlsx') {
  const workbook = XLSX.utils.book_new();

  // Visits / Revenues sheet
  const visitsData = visits.map((v) => ({
    'رقم الزيارة': v.visitCode,
    'كود المريض': v.patientCode,
    'اسم المريض': v.patientName,
    'التاريخ': v.date,
    'إجمالي الفحوصات': v.totalPrice,
    'الخصم': v.discountAmount,
    'الصافي': v.finalPrice,
    'المدفوع': v.paidAmount,
    'المتبقي': v.remainingAmount,
    'طريقة الدفع': v.paymentMethod,
    'جهة التعاقد': v.contractName || 'نقدي خاص',
    'الطبيب المعالج': v.doctorName || 'غير محدد',
  }));
  const visitsSheet = XLSX.utils.json_to_sheet(visitsData);
  XLSX.utils.book_append_sheet(workbook, visitsSheet, 'الإيرادات والزيارات');

  // Expenses sheet
  const expensesData = expenses.map((exp) => ({
    'بند المصروف': exp.title,
    'التصنيف': exp.category,
    'المبلغ (ج.م)': exp.amount,
    'التاريخ': exp.date,
    'المسدد': exp.paidBy,
    'ملاحظات': exp.notes || '',
  }));
  const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(workbook, expensesSheet, 'المصروفات');

  XLSX.writeFile(workbook, fileName);
}

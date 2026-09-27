import { GoogleGenAI } from '@google/genai';

export interface AIInterpretationResult {
  summary: string;
  abnormalFindings: string[];
  clinicalRecommendations: string[];
  criticalAlert?: string;
}

export async function interpretLabResultsWithAI(
  patientInfo: { name: string; age: string; gender: string; notes?: string },
  testName: string,
  results: Array<{ name: string; value: string | number; unit: string; flag: string; normalRange: string }>
): Promise<AIInterpretationResult> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

  // Identify abnormal findings locally first
  const abnormals = results.filter((r) => r.flag === 'high' || r.flag === 'low' || r.flag === 'critical');

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `أنت استشاري تحاليل طبية وباثولوجيا إكلينيكية في مختبر طبي متطور.
قم بتحليل نتائج المريض التالية وتقديم تقرير تفسيري دقيق وموجز باللغة العربية:
بيانات المريض: ${patientInfo.name}، العمر: ${patientInfo.age}، الجنس: ${patientInfo.gender}
اسم الفحص: ${testName}
النتائج المخبرية:
${results.map((r) => `- ${r.name}: ${r.value} ${r.unit} (المدى الطبيعي: ${r.normalRange}) [الحالة: ${r.flag}]`).join('\n')}

المطلوب بصيغة JSON حصراً بهذا الشكل:
{
  "summary": "ملخص عام للحالة والنتائج السريرية باللغة العربية",
  "abnormalFindings": ["ملاحظة 1 للقيم غير الطبيعية", "ملاحظة 2"],
  "clinicalRecommendations": ["توصية 1 للطبيب المعالج", "توصية 2"],
  "criticalAlert": "تنبيه حرج إذا وجدت قيمة خطيرة تستدعي الاتصال الفوري بالطبيب أو فارغ"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);
      return {
        summary: parsed.summary || 'تم تحليل النتائج سريرياً.',
        abnormalFindings: parsed.abnormalFindings || [],
        clinicalRecommendations: parsed.clinicalRecommendations || [],
        criticalAlert: parsed.criticalAlert || undefined,
      };
    } catch (e) {
      console.warn('Gemini API call failed, using clinical rule-based engine:', e);
    }
  }

  // Clinical Rule-based Fallback Engine (works 100% offline!)
  if (abnormals.length === 0) {
    return {
      summary: `كافة مؤشرات فحص ${testName} للمريض ${patientInfo.name} تقع ضمن الحدود المرجعية الطبيعية المعتمدة لعمره وجنسه.`,
      abnormalFindings: ['لا توجد قيم شاذة، جميع القياسات طبيعية.'],
      clinicalRecommendations: ['استمرار المتابعة الدورية الروتينية حسب إرشادات الطبيب المعالج.'],
    };
  }

  const findings = abnormals.map(
    (a) => `${a.name}: النتيجة (${a.value} ${a.unit}) ${a.flag === 'high' ? 'مرتفعة عن الحد الطبيعي' : 'منخفضة عن الحد الطبيعي'} (${a.normalRange})`
  );

  const isHighGlucose = abnormals.some((a) => a.name.includes('سكر') || a.name.includes('Glucose') || a.name.includes('HbA1c'));
  const isHighLiver = abnormals.some((a) => a.name.includes('ALT') || a.name.includes('AST') || a.name.includes('الصفراء'));
  const isHighKidney = abnormals.some((a) => a.name.includes('Creatinine') || a.name.includes('كرياتينين') || a.name.includes('Urea'));
  const isLowHb = abnormals.some((a) => a.name.includes('الهيموجلوبين') || a.name.includes('Hb'));

  const recommendations: string[] = ['عرض النتائج على الطبيب المعالج لمطابقتها مع الفحص السريري والتاريخ المرضي.'];

  if (isHighGlucose) {
    recommendations.push('تنظيم الحمية الغذائية والنشاط البدني وفحص السكر التراكمي دورياً كل 3 أشهر.');
  }
  if (isHighLiver) {
    recommendations.push('إجراء موجات فوق صوتية على البطن والكبد وفحص دلالات الفيروسات الكبدية B و C.');
  }
  if (isHighKidney) {
    recommendations.push('مراقبة ضغط الدم، شرب كميات كافية من الماء، وتجنب المسكنات ومضادات الالتهاب غير الستيرويدية.');
  }
  if (isLowHb) {
    recommendations.push('استكمال فحص مخزون الحديد (Serum Ferritin) وفيتامين ب12 لتحديد نوع فقر الدم.');
  }

  return {
    summary: `أظهرت نتائج فحص ${testName} وجود ${abnormals.length} مؤشر خارج المعدل الطبيعي يستدعي الانتباه الطبي.`,
    abnormalFindings: findings,
    clinicalRecommendations: recommendations,
    criticalAlert: abnormals.some((a) => a.flag === 'critical') ? 'تنبيه: توجد قيمة حرجة تستدعي إخطار الطبيب فوراً!' : undefined,
  };
}

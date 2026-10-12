import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Building2,
  Landmark,
  Calendar,
  Filter,
  Download,
  Printer,
  Shield,
  Layers,
  FileCheck2,
  PieChart,
  BarChart2,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const OfficialReports: React.FC = () => {
  const {
    governments,
    years,
    documents,
    decisions,
    departments,
    documentTypes,
    isDarkMode
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'gov-years' | 'dept-distribution'>('gov-years');

  // Filters for Report 1: Documents by Governments, Years, and Classification (Secret/Normal/etc.)
  const [selectedGovId, setSelectedGovId] = useState<string>('all');
  const [selectedYearId, setSelectedYearId] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all'); // سري، عادي، طارئ، سري-وطارئ

  // Filters for Report 2: Sent Documents & Decisions by Department, Government, and Year
  const [report2GovId, setReport2GovId] = useState<string>('all');
  const [report2YearId, setReport2YearId] = useState<string>('all');
  const [report2DeptCategory, setReport2DeptCategory] = useState<string>('all');

  // Filter available years based on selected government
  const availableYears = useMemo(() => {
    if (selectedGovId === 'all') return years;
    return years.filter(y => y.governmentId === selectedGovId);
  }, [years, selectedGovId]);

  const report2Years = useMemo(() => {
    if (report2GovId === 'all') return years;
    return years.filter(y => y.governmentId === report2GovId);
  }, [years, report2GovId]);

  // All combined items (documents + decisions)
  const allCabinetItems = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      governmentId: string;
      yearId: string;
      docType: string;
      classification: string; // 'عادي' | 'سري' | 'طارئ' | 'سري-وطارئ'
      recipients: string[];
      isAll: boolean;
      date: string;
      isDecision: boolean;
    }> = [];

    decisions.forEach(d => {
      list.push({
        id: d.id,
        title: d.subject,
        governmentId: d.governmentId,
        yearId: d.yearId,
        docType: 'قرار مجلس الوزراء',
        classification: d.decisionType,
        recipients: d.targetDepartments || d.recipientDepartments || [],
        isAll: !!d.isAllDepartments,
        date: d.letterDate || d.createdAt,
        isDecision: true
      });
    });

    documents.forEach(doc => {
      const dt = documentTypes.find(t => t.id === doc.documentTypeId);
      // Documents can be classified as secret or normal based on keywords/notes
      const isSecret = doc.keywords.some(k => k.includes('سري') || k.includes('محظور'));
      const isUrgent = doc.keywords.some(k => k.includes('طارئ') || k.includes('عاجل'));
      let classification = 'عادي';
      if (isSecret && isUrgent) classification = 'سري-وطارئ';
      else if (isSecret) classification = 'سري';
      else if (isUrgent) classification = 'طارئ';

      list.push({
        id: doc.id,
        title: doc.subject,
        governmentId: doc.governmentId,
        yearId: doc.yearId,
        docType: dt?.name || 'وثيقة رسمية',
        classification,
        recipients: doc.recipientDepartments || [],
        isAll: !!doc.isAllDepartments,
        date: doc.createdAt,
        isDecision: false
      });
    });

    return list;
  }, [decisions, documents, documentTypes]);

  // ==========================================
  // REPORT 1: Documents by Government, Year, & Classification
  // ==========================================
  const report1Data = useMemo(() => {
    return allCabinetItems.filter(item => {
      if (selectedGovId !== 'all' && item.governmentId !== selectedGovId) return false;
      if (selectedYearId !== 'all' && item.yearId !== selectedYearId) return false;
      if (selectedClassification !== 'all') {
        if (selectedClassification === 'سري' && !item.classification.includes('سري')) return false;
        if (selectedClassification === 'عادي' && item.classification !== 'قرار عادي' && item.classification !== 'عادي') return false;
        if (selectedClassification === 'طارئ' && !item.classification.includes('طارئ')) return false;
      }
      return true;
    });
  }, [allCabinetItems, selectedGovId, selectedYearId, selectedClassification]);

  // Aggregate matrix for Report 1 (By Year and Classification)
  const report1Aggregates = useMemo(() => {
    const map = new Map<string, { yearNum: number; normal: number; secret: number; urgent: number; secretUrgent: number; total: number }>();

    report1Data.forEach(item => {
      const yr = years.find(y => y.id === item.yearId)?.yearNumber || 2025;
      const key = `year-${yr}`;
      const curr = map.get(key) || { yearNum: yr, normal: 0, secret: 0, urgent: 0, secretUrgent: 0, total: 0 };

      if (item.classification === 'سري-وطارئ') curr.secretUrgent += 1;
      else if (item.classification.includes('سري')) curr.secret += 1;
      else if (item.classification.includes('طارئ')) curr.urgent += 1;
      else curr.normal += 1;

      curr.total += 1;
      map.set(key, curr);
    });

    return Array.from(map.values()).sort((a, b) => a.yearNum - b.yearNum);
  }, [report1Data, years]);

  // ==========================================
  // REPORT 2: Sent Documents & Decisions by Department, Government, and Year
  // ==========================================
  const report2DepartmentStats = useMemo(() => {
    const stats = departments.map(dept => {
      let sentDecisionsCount = 0;
      let sentDocumentsCount = 0;

      allCabinetItems.forEach(item => {
        if (report2GovId !== 'all' && item.governmentId !== report2GovId) return false;
        if (report2YearId !== 'all' && item.yearId !== report2YearId) return false;

        const isTargeted = item.isAll || item.recipients.some(r =>
          r.trim().toLowerCase() === dept.name.trim().toLowerCase() ||
          (dept.nameEn && r.trim().toLowerCase() === dept.nameEn.trim().toLowerCase())
        );

        if (isTargeted) {
          if (item.isDecision) sentDecisionsCount += 1;
          else sentDocumentsCount += 1;
        }
      });

      const totalSent = sentDecisionsCount + sentDocumentsCount;
      return {
        dept,
        sentDecisionsCount,
        sentDocumentsCount,
        totalSent
      };
    });

    // Filter by department category if selected
    return stats
      .filter(item => {
        if (report2DeptCategory !== 'all' && (item.dept.category || 'وزارات') !== report2DeptCategory) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.totalSent - a.totalSent);
  }, [departments, allCabinetItems, report2GovId, report2YearId, report2DeptCategory]);

  const exportReport1Csv = () => {
    const headers = ['الحكومة', 'السنة', 'نوع الوثيقة', 'الموضوع', 'التصنيف الأمني', 'التاريخ'];
    const rows = report1Data.map(d => {
      const govName = governments.find(g => g.id === d.governmentId)?.name || '';
      const yearNum = years.find(y => y.id === d.yearId)?.yearNumber || '';
      return [
        `"${govName}"`,
        `"${yearNum}"`,
        `"${d.docType}"`,
        `"${d.title.replace(/"/g, '""')}"`,
        `"${d.classification}"`,
        `"${d.date}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_الوثائق_حسب_الحكومات_والتصنيف_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportReport2Csv = () => {
    const headers = ['الجهة / الوزارة', 'الفئة', 'السلطة', 'عدد القرارات المرسلة', 'عدد الوثائق والمحاضر المرسلة', 'إجمالي الوثائق المرسلة'];
    const rows = report2DepartmentStats.map(s => {
      return [
        `"${s.dept.name}"`,
        `"${s.dept.category || 'وزارات'}"`,
        `"${s.dept.authority || 'سلطة تنفيذية'}"`,
        `"${s.sentDecisionsCount}"`,
        `"${s.sentDocumentsCount}"`,
        `"${s.totalSent}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_الوثائق_المرسلة_للجهات_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>نظام التقارير الإحصائية والرقابية للأمانة العامة</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            التقارير التحليلية للوثائق والقرارات والجهات
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            استخراج تقارير تفصيلية لتصنيف الوثائق (سري، عادي، طارئ) حسب الحكومات والسنوات، وحصر عدد الوثائق الموجهة لكل جهة ومؤسسة حكومية.
          </p>
        </div>

        {/* Report Tab Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveReportTab('gov-years')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
              activeReportTab === 'gov-years'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>تقرير الوثائق حسب الحكومات والتصنيف</span>
          </button>

          <button
            onClick={() => setActiveReportTab('dept-distribution')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
              activeReportTab === 'dept-distribution'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>تقرير الوثائق المرسلة حسب الجهات</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: تقرير عدد الوثائق حسب الحكومات والسنوات والتصنيف */}
      {/* ======================================================== */}
      {activeReportTab === 'gov-years' && (
        <div className="space-y-5">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>خيارات تصفية التقرير (الحكومة، السنة، التصنيف الأمني)</span>
              </span>

              <button
                onClick={exportReport1Csv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير إكسل (CSV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">الحكومة:</label>
                <select
                  value={selectedGovId}
                  onChange={(e) => {
                    setSelectedGovId(e.target.value);
                    setSelectedYearId('all');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                >
                  <option value="all">كافة الحكومات</option>
                  {governments.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">السنة:</label>
                <select
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                >
                  <option value="all">كافة السنوات</option>
                  {availableYears.map(y => (
                    <option key={y.id} value={y.id}>سنة {y.yearNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">التصنيف الأمني (النوع):</label>
                <select
                  value={selectedClassification}
                  onChange={(e) => setSelectedClassification(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                >
                  <option value="all">كافة التصنيفات (سري، عادي، طارئ، سري-وطارئ)</option>
                  <option value="سري">سري وسري-وطارئ</option>
                  <option value="عادي">عادي</option>
                  <option value="طارئ">طارئ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Aggregated Visual Summary */}
          {report1Aggregates.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <span>مقارنة أعداد الوثائق المصنفة سنوياً (عادي، سري، طارئ، سري-وطارئ)</span>
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report1Aggregates} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="yearNum" tick={{ fill: axisColor, fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: axisColor, fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        direction: 'rtl',
                        textAlign: 'right'
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      formatter={(val) => {
                        const labels: any = {
                          normal: 'وثائق عادية',
                          secret: 'وثائق سرية',
                          urgent: 'وثائق طارئة',
                          secretUrgent: 'سري-وطارئ'
                        };
                        return <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{labels[val] || val}</span>;
                      }}
                    />
                    <Bar dataKey="normal" fill="#047857" name="normal" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="secret" fill="#7e22ce" name="secret" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="urgent" fill="#d97706" name="urgent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="secretUrgent" fill="#be123c" name="secretUrgent" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Details Data Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                تفاصيل السجلات المطابقة ({report1Data.length} وثيقة وقرار)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">تقرير رسمي معتمد</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">نوع الوثيقة</th>
                    <th className="p-3">موضوع الوثيقة / القرار</th>
                    <th className="p-3">التصنيف الأمني</th>
                    <th className="p-3">الحكومة</th>
                    <th className="p-3">السنة</th>
                    <th className="p-3">تاريخ الصدور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {report1Data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        لا توجد وثائق تطابق الفلاتر المحددة.
                      </td>
                    </tr>
                  ) : (
                    report1Data.map((item, idx) => {
                      const gov = governments.find(g => g.id === item.governmentId);
                      const yr = years.find(y => y.id === item.yearId);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.docType}</td>
                          <td className="p-3 max-w-md truncate text-slate-900 dark:text-white font-medium" title={item.title}>
                            {item.title}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.classification === 'سري-وطارئ'
                                ? 'bg-rose-900 text-white'
                                : item.classification === 'سري'
                                ? 'bg-purple-900 text-white'
                                : item.classification === 'طارئ'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-800 text-white'
                            }`}>
                              {item.classification}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">{gov?.name}</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{yr?.yearNumber}</td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{item.date}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: تقرير حسب الجهة وعدد الوثائق المرسلة إليها */}
      {/* ======================================================== */}
      {activeReportTab === 'dept-distribution' && (
        <div className="space-y-5">
          
          {/* Filters Bar for Report 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>تصفية تقرير الجهات المستلمة (الحكومة، السنة، فئة المؤسسة)</span>
              </span>

              <button
                onClick={exportReport2Csv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير إكسل (CSV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">الحكومة:</label>
                <select
                  value={report2GovId}
                  onChange={(e) => {
                    setReport2GovId(e.target.value);
                    setReport2YearId('all');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                >
                  <option value="all">كافة الحكومات</option>
                  {governments.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">السنة:</label>
                <select
                  value={report2YearId}
                  onChange={(e) => setReport2YearId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                >
                  <option value="all">كافة السنوات</option>
                  {report2Years.map(y => (
                    <option key={y.id} value={y.id}>سنة {y.yearNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">فئة الجهة / المؤسسة:</label>
                <select
                  value={report2DeptCategory}
                  onChange={(e) => setReport2DeptCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                >
                  <option value="all">كافة الفئات (وزارات، هيئات، محافظات، أخرى)</option>
                  <option value="وزارات">وزارات</option>
                  <option value="هيئات">هيئات</option>
                  <option value="محافظات ومجالس محافظات">محافظات ومجالس محافظات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>
          </div>

          {/* Department Statistics Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                إحصائية الوثائق والقرارات الموجهة للدوائر الحكومية ({report2DepartmentStats.length} جهة)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">مرتب حسب إجمالي الوثائق المرسلة</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">اسم الجهة / الوزارة</th>
                    <th className="p-3">الفئة والتصنيف</th>
                    <th className="p-3">السلطة الدستورية</th>
                    <th className="p-3 text-center">القرارات المرسلة</th>
                    <th className="p-3 text-center">الوثائق والمحاضر</th>
                    <th className="p-3 text-center font-black">إجمالي الوثائق المرسلة</th>
                    <th className="p-3">مستوى الإرسال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {report2DepartmentStats.map((stat, idx) => (
                    <tr key={stat.dept.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{stat.dept.name}</div>
                        {stat.dept.nameEn && (
                          <div className="text-[10px] text-slate-400 font-mono">{stat.dept.nameEn}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono">
                          {stat.dept.category || 'وزارات'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                          {stat.dept.authority || 'سلطة تنفيذية'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {stat.sentDecisionsCount}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-blue-700 dark:text-blue-400">
                        {stat.sentDocumentsCount}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-sm text-slate-900 dark:text-white">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-block min-w-[36px]">
                          {stat.totalSent}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.max(10, stat.totalSent * 8))}%`
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

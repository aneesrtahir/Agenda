import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  FileCheck2,
  CalendarDays,
  Landmark,
  ShieldAlert,
  AlertTriangle,
  Lock,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';
import { SessionType, DecisionType, Decision } from '../../types';
import { HomepageMediaGallery } from '../home/HomepageMediaGallery';
import { AnalyticsWidgets } from './AnalyticsWidgets';

export const StatisticsDashboard: React.FC = () => {
  const {
    governments,
    years,
    sessions,
    documents,
    decisions,
    documentTypes,
    activeDocuments,
    activeDecisions,
    deletedDocuments,
    deletedDecisions,
    setCurrentTab,
    setSelectedSessionId
  } = useApp();

  // Filters for analytics breakdown
  const [selectedGovFilter, setSelectedGovFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const selectedYearObj = selectedYearFilter !== 'all' ? years.find(y => y.id === selectedYearFilter) : years[0];

  // Filtered decisions and documents based on period, government, year
  const filteredDecisions = activeDecisions.filter(dec => {
    if (selectedGovFilter !== 'all' && dec.governmentId !== selectedGovFilter) return false;
    if (selectedYearFilter !== 'all' && dec.yearId !== selectedYearFilter) return false;
    const itemDate = dec.letterDate || dec.createdAt;
    if (dateFrom && itemDate < dateFrom) return false;
    if (dateTo && itemDate > dateTo) return false;
    return true;
  });

  const filteredDocs = activeDocuments.filter(doc => {
    if (selectedGovFilter !== 'all' && doc.governmentId !== selectedGovFilter) return false;
    if (selectedYearFilter !== 'all' && doc.yearId !== selectedYearFilter) return false;
    if (dateFrom && doc.createdAt < dateFrom) return false;
    if (dateTo && doc.createdAt > dateTo) return false;
    return true;
  });

  const filteredSessions = sessions.filter(sess => {
    if (selectedGovFilter !== 'all' && sess.governmentId !== selectedGovFilter) return false;
    if (selectedYearFilter !== 'all' && sess.yearId !== selectedYearFilter) return false;
    if (dateFrom && sess.sessionDate < dateFrom) return false;
    if (dateTo && sess.sessionDate > dateTo) return false;
    return true;
  });

  // RULE SPECIFIED BY USER:
  // "القرار يكون له رقم اما التوجيه فيكون رقمه 0 ويعرض في لوحة التحكم عدد التوجيهات اللسرية و الاعتيادية والطارئة والسري- وطارئ"
  const actualDecisions = filteredDecisions.filter(d => !d.isDirective && d.decisionNumber !== '0');
  const actualDirectives = filteredDecisions.filter(d => d.isDirective || d.decisionNumber === '0');

  // Decision counts by nature
  const decisionTypeCounts = {
    'قرار عادي': actualDecisions.filter(d => d.decisionType === 'قرار عادي').length,
    'سري': actualDecisions.filter(d => d.decisionType === 'سري').length,
    'طارئ': actualDecisions.filter(d => d.decisionType === 'طارئ').length,
    'سري-وطارئ': actualDecisions.filter(d => d.decisionType === 'سري-وطارئ').length,
  };

  // Directives (number = 0) counts by nature
  const directiveTypeCounts = {
    'قرار عادي': actualDirectives.filter(d => d.decisionType === 'قرار عادي').length,
    'سري': actualDirectives.filter(d => d.decisionType === 'سري').length,
    'طارئ': actualDirectives.filter(d => d.decisionType === 'طارئ').length,
    'سري-وطارئ': actualDirectives.filter(d => d.decisionType === 'سري-وطارئ').length,
  };

  const totalAllItems = filteredDocs.length + filteredDecisions.length;

  // Breakdown by Document Type
  const docTypeCounts = documentTypes.map(dt => {
    let count = 0;
    if (dt.code === 'DECISION') {
      count = actualDecisions.length;
    } else if (dt.code === 'DIRECTIVE') {
      count = actualDirectives.length;
    } else {
      count = filteredDocs.filter(d => d.documentTypeId === dt.id).length;
    }
    const percentage = totalAllItems > 0 ? Math.round((count / totalAllItems) * 100) : 0;
    return { ...dt, count, percentage };
  });

  // Breakdown by Session Type
  const sessionTypeCounts: Record<SessionType, number> = {
    'عادية': filteredSessions.filter(s => s.sessionType === 'عادية').length,
    'طارئة': filteredSessions.filter(s => s.sessionType === 'طارئة').length,
    'استثنائية': filteredSessions.filter(s => s.sessionType === 'استثنائية').length,
  };

  // Execution status
  const executedDecisions = filteredDecisions.filter(d => d.executionStatus === 'تم التنفيذ').length;
  const inProgressDecisions = filteredDecisions.filter(d => d.executionStatus === 'قيد المتابعة').length;
  const ongoingDecisions = filteredDecisions.filter(d => d.executionStatus === 'مستمر').length;

  const resetFilters = () => {
    setSelectedGovFilter('all');
    setSelectedYearFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Welcome & KPI Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            <Landmark className="w-4 h-4" />
            <span>الأمانة العامة لمجلس الوزراء · مركز البيانات والإحصاء الحكومي</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            لوحة الإحصائيات الشاملة للقرارات والتوجيهات والوثائق
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            مؤشرات تحليلية دقيقة لتصنيف القرارات الرسمية والتوجيهات الوزارية (رقم 0)، ومتابعة وتيرة الإنجاز ونسب السرية والطوارئ عبر الدورات الحكومية.
          </p>
        </div>

        {/* Global summary chips */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold block">إجمالي القرارات والتوجيهات</span>
            <span className="text-xl font-black text-emerald-900 dark:text-emerald-200 font-mono">
              {filteredDecisions.length}
            </span>
          </div>

          <div className="text-center px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
            <span className="text-[11px] text-blue-800 dark:text-blue-300 font-semibold block">إجمالي الجلسات</span>
            <span className="text-xl font-black text-blue-900 dark:text-blue-200 font-mono">
              {filteredSessions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Period and Government Filters Bar (امكانية البحث في فترة محددة) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>تصفية الإحصائيات حسب الفترة الزمنية والدورة الحكومية:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 max-w-4xl">
          <div>
            <select
              value={selectedGovFilter}
              onChange={(e) => setSelectedGovFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="all">كافة الدورات الحكومية</option>
              {governments.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="all">كافة السنوات</option>
              {years.map(y => (
                <option key={y.id} value={y.id}>{y.yearNumber}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2">
            <span className="text-[11px] text-slate-400 font-semibold">من:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-transparent p-1.5 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2">
            <span className="text-[11px] text-slate-400 font-semibold">إلى:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-transparent p-1.5 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-hidden"
            />
          </div>
        </div>

        {(selectedGovFilter !== 'all' || selectedYearFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-medium shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إلغاء التصفية</span>
          </button>
        )}
      </div>

      {/* RECHARTS DATA VISUALIZATION DASHBOARD WIDGETS (لوحة بيانات مرئية) */}
      <AnalyticsWidgets currentYearNumber={selectedYearObj ? selectedYearObj.yearNumber : 2025} />

      {/* CORE HIGHLIGHT: SEPARATE STATS FOR DECISIONS (WITH NUMBER) VS DIRECTIVES (NUMBER = 0) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: القرارات الوزارية (التي لها رقم قرار) */}
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  إحصائيات القرارات الوزارية
                </h2>
                <span className="text-[11px] text-slate-400">
                  القرارات الصادرة التي تحمل رقماً رسمياً معتمداً ({actualDecisions.length} قرار)
                </span>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg font-mono font-bold text-xs">
              العدد: {actualDecisions.length}
            </span>
          </div>

          {/* Cards for Decision Types: عادي، سري، طارئ، سري-وطارئ */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            
            {/* عادي */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-semibold">
                <span>قرارات اعتيادية</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-mono">
                {decisionTypeCounts['قرار عادي']}
              </div>
              <div className="text-[10px] text-slate-400">
                {actualDecisions.length > 0 ? Math.round((decisionTypeCounts['قرار عادي'] / actualDecisions.length) * 100) : 0}% من إجمالي القرارات
              </div>
            </div>

            {/* سري */}
            <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 font-semibold">
                <span>قرارات سرية</span>
                <Lock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-950 dark:text-purple-100 font-mono">
                {decisionTypeCounts['سري']}
              </div>
              <div className="text-[10px] text-slate-400">
                {actualDecisions.length > 0 ? Math.round((decisionTypeCounts['سري'] / actualDecisions.length) * 100) : 0}% شؤون أمنية وسيادية
              </div>
            </div>

            {/* طارئ */}
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-semibold">
                <span>قرارات طارئة</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-950 dark:text-amber-100 font-mono">
                {decisionTypeCounts['طارئ']}
              </div>
              <div className="text-[10px] text-slate-400">
                {actualDecisions.length > 0 ? Math.round((decisionTypeCounts['طارئ'] / actualDecisions.length) * 100) : 0}% إجراءات طارئة واستثنائية
              </div>
            </div>

            {/* سري-وطارئ */}
            <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-semibold">
                <span>قرارات سري-وطارئ</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-950 dark:text-rose-100 font-mono">
                {decisionTypeCounts['سري-وطارئ']}
              </div>
              <div className="text-[10px] text-slate-400">
                {actualDecisions.length > 0 ? Math.round((decisionTypeCounts['سري-وطارئ'] / actualDecisions.length) * 100) : 0}% أقصى درجات الأسبقية
              </div>
            </div>

          </div>

          {/* Decision progress bar */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[11px] text-slate-500 font-semibold flex justify-between">
              <span>التوزيع النسبي لدرجات السرية في القرارات:</span>
              <span>{actualDecisions.length} قرار معتمد</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${actualDecisions.length > 0 ? (decisionTypeCounts['قرار عادي'] / actualDecisions.length) * 100 : 0}%` }}
                className="bg-emerald-600"
                title={`عادي: ${decisionTypeCounts['قرار عادي']}`}
              />
              <div
                style={{ width: `${actualDecisions.length > 0 ? (decisionTypeCounts['سري'] / actualDecisions.length) * 100 : 0}%` }}
                className="bg-purple-600"
                title={`سري: ${decisionTypeCounts['سري']}`}
              />
              <div
                style={{ width: `${actualDecisions.length > 0 ? (decisionTypeCounts['طارئ'] / actualDecisions.length) * 100 : 0}%` }}
                className="bg-amber-500"
                title={`طارئ: ${decisionTypeCounts['طارئ']}`}
              />
              <div
                style={{ width: `${actualDecisions.length > 0 ? (decisionTypeCounts['سري-وطارئ'] / actualDecisions.length) * 100 : 0}%` }}
                className="bg-rose-600"
                title={`سري وطارئ: ${decisionTypeCounts['سري-وطارئ']}`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: التوجيهات الوزارية (رقمها 0 دائماً) */}
        <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/30 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  إحصائيات التوجيهات الوزارية (رقمها 0)
                </h2>
                <span className="text-[11px] text-slate-400">
                  توجيهات دولة رئيس الوزراء ومجلس الوزراء برقم (0) ({actualDirectives.length} توجيه)
                </span>
              </div>
            </div>

            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-lg font-mono font-bold text-xs">
              الرقم: 0 (دائماً)
            </span>
          </div>

          {/* Cards for Directive Types: عادي، سري، طارئ، سري-وطارئ */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            
            {/* عادي */}
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-blue-800 dark:text-blue-300 font-semibold">
                <span>توجيهات اعتيادية (0)</span>
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-950 dark:text-blue-100 font-mono">
                {directiveTypeCounts['قرار عادي']}
              </div>
              <div className="text-[10px] text-slate-400">
                {actualDirectives.length > 0 ? Math.round((directiveTypeCounts['قرار عادي'] / actualDirectives.length) * 100) : 0}% متابعات حكومية
              </div>
            </div>

            {/* سري */}
            <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 font-semibold">
                <span>توجيهات سرية (0)</span>
                <Lock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-950 dark:text-purple-100 font-mono">
                {directiveTypeCounts['سري']}
              </div>
              <div className="text-[10px] text-slate-400">
                {actualDirectives.length > 0 ? Math.round((directiveTypeCounts['سري'] / actualDirectives.length) * 100) : 0}% أمن وحماية المنشآت
              </div>
            </div>

            {/* طارئ */}
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-semibold">
                <span>توجيهات طارئة (0)</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-950 dark:text-amber-100 font-mono">
                {directiveTypeCounts['طارئ']}
              </div>
              <div className="text-[10px] text-slate-400">
                {actualDirectives.length > 0 ? Math.round((directiveTypeCounts['طارئ'] / actualDirectives.length) * 100) : 0}% استنفار وكوارث طبيعية
              </div>
            </div>

            {/* سري-وطارئ */}
            <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-semibold">
                <span>توجيهات سري-وطارئ (0)</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-950 dark:text-rose-100 font-mono">
                {directiveTypeCounts['سري-وطارئ']}
              </div>
              <div className="text-[10px] text-slate-400">
                {actualDirectives.length > 0 ? Math.round((directiveTypeCounts['سري-وطارئ'] / actualDirectives.length) * 100) : 0}% خطوط الإمداد العاجلة
              </div>
            </div>

          </div>

          {/* Directive progress bar */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[11px] text-slate-500 font-semibold flex justify-between">
              <span>التوزيع النسبي لدرجات السرية في التوجيهات (0):</span>
              <span>{actualDirectives.length} توجيه مسجل</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${actualDirectives.length > 0 ? (directiveTypeCounts['قرار عادي'] / actualDirectives.length) * 100 : 0}%` }}
                className="bg-blue-600"
                title={`عادي: ${directiveTypeCounts['قرار عادي']}`}
              />
              <div
                style={{ width: `${actualDirectives.length > 0 ? (directiveTypeCounts['سري'] / actualDirectives.length) * 100 : 0}%` }}
                className="bg-purple-600"
                title={`سري: ${directiveTypeCounts['سري']}`}
              />
              <div
                style={{ width: `${actualDirectives.length > 0 ? (directiveTypeCounts['طارئ'] / actualDirectives.length) * 100 : 0}%` }}
                className="bg-amber-500"
                title={`طارئ: ${directiveTypeCounts['طارئ']}`}
              />
              <div
                style={{ width: `${actualDirectives.length > 0 ? (directiveTypeCounts['سري-وطارئ'] / actualDirectives.length) * 100 : 0}%` }}
                className="bg-rose-600"
                title={`سري وطارئ: ${directiveTypeCounts['سري-وطارئ']}`}
              />
            </div>
          </div>
        </div>

      </div>

      {/* ADDITIONAL METRICS: SESSION TYPES & DOCUMENT TYPES BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sessions by type */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <span>الجلسات الوزارية حسب النوع</span>
            </h3>
            <span className="font-mono text-xs text-slate-400">{filteredSessions.length} جلسة</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">جلسات عادية دورية:</span>
              <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{sessionTypeCounts['عادية']}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30">
              <span className="font-semibold text-amber-800 dark:text-amber-300">جلسات طارئة:</span>
              <span className="font-bold font-mono text-amber-700 dark:text-amber-400">{sessionTypeCounts['طارئة']}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/60 dark:bg-purple-950/30">
              <span className="font-semibold text-purple-800 dark:text-purple-300">جلسات استثنائية:</span>
              <span className="font-bold font-mono text-purple-700 dark:text-purple-400">{sessionTypeCounts['استثنائية']}</span>
            </div>
          </div>
        </div>

        {/* Execution Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>موقف تنفيذ القرارات</span>
            </h3>
            <span className="font-mono text-xs text-slate-400">{filteredDecisions.length} قرار وتوجيه</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">تم التنفيذ بالكامل:</span>
              <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{executedDecisions}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40">
              <span className="font-semibold text-blue-800 dark:text-blue-300">قيد المتابعة مع الوزارات:</span>
              <span className="font-bold font-mono text-blue-700 dark:text-blue-400">{inProgressDecisions}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">تنفيذ مستمر ودوري:</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{ongoingDecisions}</span>
            </div>
          </div>
        </div>

        {/* Soft-deleted items overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>الأرشيف والمحذوفات</span>
            </h3>
            <span className="font-mono text-xs text-slate-400">سلة المحذوفات</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">القرارات النشطة:</span>
              <span className="font-bold font-mono text-emerald-600">{activeDecisions.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">الوثائق والمحاضر النشطة:</span>
              <span className="font-bold font-mono text-blue-600">{activeDocuments.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40">
              <span className="font-semibold text-rose-800 dark:text-rose-300">إجمالي المحذوفات القابلة للاستعادة:</span>
              <span className="font-bold font-mono text-rose-700 dark:text-rose-400">
                {deletedDecisions.length + deletedDocuments.length}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Featured Media & Documents for the Homepage (ملفات ووسائط الصفحة الرئيسية) */}
      <HomepageMediaGallery />

    </div>
  );
};

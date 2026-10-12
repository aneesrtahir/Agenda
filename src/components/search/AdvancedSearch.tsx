import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  Calendar,
  FileText,
  FileCheck2,
  Tag,
  Download,
  Printer,
  ChevronRight,
  Eye,
  RotateCcw,
  Building2,
  AlertTriangle,
  Link2,
  RotateCcw as RestoreIcon
} from 'lucide-react';
import { CabinetDocument, Decision } from '../../types';
import { DocumentPreviewModal } from '../documents/DocumentPreviewModal';

export const AdvancedSearch: React.FC = () => {
  const {
    governments,
    years,
    sessions,
    documents,
    decisions,
    documentTypes,
    departments,
    decisionRelations,
    restoreDocument,
    restoreDecision
  } = useApp();

  // Search parameters
  const [query, setQuery] = useState('');
  const [selectedGov, setSelectedGov] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSessionType, setSelectedSessionType] = useState('all');
  const [selectedDocType, setSelectedDocType] = useState('all');
  const [selectedDecisionNature, setSelectedDecisionNature] = useState('all');
  const [selectedRecipientDept, setSelectedRecipientDept] = useState('all'); // البحث حسب الجهة المستلمة
  const [selectedRelationType, setSelectedRelationType] = useState<string>('all'); // البحث عن القرارات المربوطة
  const [deletionFilter, setDeletionFilter] = useState<'active' | 'all' | 'deleted'>('all'); // تضمين المحذوفات
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [previewItem, setPreviewItem] = useState<CabinetDocument | Decision | null>(null);

  // Combine documents and decisions
  const allItems: (CabinetDocument | Decision)[] = [...documents, ...decisions];

  const searchResults = allItems.filter(item => {
    // Deletion filter
    if (deletionFilter === 'active' && item.isDeleted) return false;
    if (deletionFilter === 'deleted' && !item.isDeleted) return false;

    // Government filter
    if (selectedGov !== 'all' && item.governmentId !== selectedGov) return false;
    // Year filter
    if (selectedYear !== 'all' && item.yearId !== selectedYear) return false;
    // Document Type filter
    if (selectedDocType !== 'all' && item.documentTypeId !== selectedDocType) return false;

    // Session Type filter
    if (selectedSessionType !== 'all') {
      const sess = sessions.find(s => s.id === item.sessionId);
      if (!sess || sess.sessionType !== selectedSessionType) return false;
    }

    // Decision Nature filter (applies if item is Decision)
    if (selectedDecisionNature !== 'all') {
      if (!('decisionType' in item)) return false;
      const dec = item as Decision;
      if (dec.decisionType !== selectedDecisionNature) return false;
    }

    // RECIPIENT DEPARTMENT FILTER (البحث حسب الجهة المستلمة)
    if (selectedRecipientDept !== 'all') {
      const targetDept = departments.find(d => d.id === selectedRecipientDept);
      if (targetDept) {
        const isTargeted = item.isAllDepartments ||
          (item.recipientDepartments && item.recipientDepartments.some(r =>
            r.toLowerCase() === targetDept.name.toLowerCase() ||
            (targetDept.nameEn && r.toLowerCase() === targetDept.nameEn.toLowerCase())
          )) ||
          ('targetDepartments' in item && (item as Decision).targetDepartments && (item as Decision).targetDepartments.some(r =>
            r.toLowerCase() === targetDept.name.toLowerCase() ||
            (targetDept.nameEn && r.toLowerCase() === targetDept.nameEn.toLowerCase())
          ));
        if (!isTargeted) return false;
      }
    }

    // LINKED DECISIONS FILTER (البحث عن القرارات المربوطة)
    if (selectedRelationType !== 'all') {
      if (!('decisionNumber' in item)) return false;
      const decId = item.id;
      if (selectedRelationType === 'any_linked') {
        const hasAnyRel = decisionRelations.some(
          r => r.sourceDecisionId === decId || r.targetDecisionId === decId
        );
        if (!hasAnyRel) return false;
      } else {
        const hasSpecificRel = decisionRelations.some(
          r => (r.sourceDecisionId === decId || r.targetDecisionId === decId) && r.relationType === selectedRelationType
        );
        if (!hasSpecificRel) return false;
      }
    }

    // Date range
    const itemDate = 'letterDate' in item ? (item as Decision).letterDate : item.createdAt;
    if (dateFrom && itemDate < dateFrom) return false;
    if (dateTo && itemDate > dateTo) return false;

    // Free text query
    if (query.trim()) {
      const q = query.toLowerCase();
      const inSubject = item.subject.toLowerCase().includes(q);
      const inNotes = item.notes?.toLowerCase().includes(q);
      const inKeywords = item.keywords?.some(k => k.toLowerCase().includes(q));
      let inDecisionNum = false;
      let inLetterNum = false;

      if ('decisionNumber' in item) {
        const dec = item as Decision;
        inDecisionNum = dec.decisionNumber.toLowerCase().includes(q);
        inLetterNum = dec.letterNumber.toLowerCase().includes(q);
      }

      if (!inSubject && !inNotes && !inKeywords && !inDecisionNum && !inLetterNum) {
        return false;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setQuery('');
    setSelectedGov('all');
    setSelectedYear('all');
    setSelectedSessionType('all');
    setSelectedDocType('all');
    setSelectedDecisionNature('all');
    setSelectedRecipientDept('all');
    setSelectedRelationType('all');
    setDeletionFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const handleRestore = (e: React.MouseEvent, item: CabinetDocument | Decision) => {
    e.stopPropagation();
    if ('decisionNumber' in item) {
      restoreDecision(item.id);
    } else {
      restoreDocument(item.id);
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          البحث المتقدم في الأرشيف ومحاضر وقرارات مجلس الوزراء
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          محرك بحث شامل لكافة الوثائق، القرارات، التوجيهات، والملفات حسب الجهة المستلمة والمحتوى وحالة الأرشفة
        </p>
      </div>

      {/* Search Input Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        
        {/* Keyword Search */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بكلمات الموضوع، نص القرار، رقم الكتاب، الكلمات المفتاحية..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-4 pr-11 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
        </div>

        {/* Filters Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          
          {/* SEARCH BY RECIPIENT DEPARTMENT (فقرة البحث حسب الجهة المستلمة) */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>الجهة والوزارة المستلمة:</span>
            </label>
            <select
              value={selectedRecipientDept}
              onChange={(e) => setSelectedRecipientDept(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">كافة الجهات المستلمة</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* DELETED STATUS FILTER (إظهار المحذوفات) */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>حالة الملفات (الأرشيف والمحذوف):</span>
            </label>
            <select
              value={deletionFilter}
              onChange={(e) => setDeletionFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-semibold"
            >
              <option value="all">الكل (النشطة والمحذوفة معاً)</option>
              <option value="active">الوثائق والقرارات النشطة فقط</option>
              <option value="deleted">الملفات المحذوفة فقط [Soft Deleted]</option>
            </select>
          </div>

          {/* Government */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">الدورة الحكومية:</label>
            <select
              value={selectedGov}
              onChange={(e) => setSelectedGov(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">كافة الحكومات</option>
              {governments.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">السنة:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">كافة السنوات</option>
              {years.map(y => (
                <option key={y.id} value={y.id}>{y.yearNumber}</option>
              ))}
            </select>
          </div>

          {/* Document Type */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">نوع الوثيقة:</label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">كافة أنواع الوثائق</option>
              {documentTypes.map(dt => (
                <option key={dt.id} value={dt.id}>{dt.name}</option>
              ))}
            </select>
          </div>

          {/* Session Type */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">نوع الجلسة:</label>
            <select
              value={selectedSessionType}
              onChange={(e) => setSelectedSessionType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">كافة الجلسات</option>
              <option value="عادية">عادية</option>
              <option value="طارئة">طارئة</option>
              <option value="استثنائية">استثنائية</option>
            </select>
          </div>

          {/* Decision Nature */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">درجة سرية القرار:</label>
            <select
              value={selectedDecisionNature}
              onChange={(e) => setSelectedDecisionNature(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">كافة الدرجات</option>
              <option value="قرار عادي">قرار عادي</option>
              <option value="سري">سري</option>
              <option value="طارئ">طارئ</option>
              <option value="سري-وطارئ">سري-وطارئ</option>
            </select>
          </div>

          {/* LINKED DECISIONS FILTER (البحث عن القرارات المربوطة) */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>ارتباط القرارات والسوابق:</span>
            </label>
            <select
              value={selectedRelationType}
              onChange={(e) => setSelectedRelationType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-semibold"
            >
              <option value="all">كافة القرارات (المربوطة وغير المربوطة)</option>
              <option value="any_linked">القرارات المترابطة فقط (أي نوع ربط)</option>
              <option value="تعديل قرار">تعديل قرار</option>
              <option value="تعديل فقرة من قرار">تعديل فقرة من قرار</option>
              <option value="إلغاء قرار">إلغاء قرار</option>
              <option value="إلغاء فقرة من قرار">إلغاء فقرة من قرار</option>
              <option value="استثناء قرار">استثناء قرار</option>
              <option value="استثناء جهة من قرار">استثناء جهة من قرار</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          </div>
        </div>

        {/* Date range row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">من تاريخ:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-800 dark:text-slate-200 font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">إلى تاريخ:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-800 dark:text-slate-200 font-mono"
            />
          </div>
        </div>

      </div>

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>نتائج البحث والأرشفة: ({searchResults.length} وثيقة مطابقة)</span>
        </div>

        {searchResults.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500 space-y-2">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-bold text-slate-700 dark:text-slate-300">لم يتم العثور على أي نتائج مطابقة</div>
            <p className="text-xs text-slate-400">
              يرجى تجربة كلمات بحثية مختلفة أو تخفيف معايير الفلترة المحددة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((item) => {
              const isDecision = 'decisionNumber' in item;
              const dec = isDecision ? (item as Decision) : null;
              const docType = documentTypes.find(dt => dt.id === item.documentTypeId);
              const session = sessions.find(s => s.id === item.sessionId);
              const isItemDeleted = !!item.isDeleted;

              // Find relations for this decision
              const relatedItems = isDecision
                ? decisionRelations.filter(r => r.sourceDecisionId === item.id || r.targetDecisionId === item.id)
                : [];

              // Target / Recipient departments
              const recipients = item.isAllDepartments
                ? ['كافة الوزارات والجهات الحكومية']
                : (item.recipientDepartments || (dec?.targetDepartments) || []);

              return (
                <div
                  key={item.id}
                  onClick={() => setPreviewItem(item)}
                  className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-2xs cursor-pointer transition-all space-y-2 group ${
                    isItemDeleted
                      ? 'border-dashed border-rose-300 dark:border-rose-900 hover:border-rose-500 bg-rose-50/20 dark:bg-rose-950/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isItemDeleted && (
                        <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>[محذوفة]</span>
                        </span>
                      )}

                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {isDecision ? (dec?.isDirective ? 'توجيه وزاري (0)' : `قرار: ${dec?.decisionNumber}`) : docType?.name}
                      </span>

                      {dec && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            dec.decisionType === 'سري-وطارئ'
                              ? 'bg-rose-900 text-white'
                              : dec.decisionType === 'سري'
                              ? 'bg-purple-900 text-white'
                              : dec.decisionType === 'طارئ'
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-800 text-white'
                          }`}
                        >
                          {dec.decisionType}
                        </span>
                      )}

                      {/* Linked decisions badge */}
                      {relatedItems.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          <span>مربوط ({relatedItems.length} قرارات)</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      {isDecision ? dec?.letterDate : item.createdAt}
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {item.subject}
                  </h3>

                  {isItemDeleted && item.deletionReason && (
                    <div className="p-2 bg-rose-100/60 dark:bg-rose-950/40 rounded text-[11px] text-rose-800 dark:text-rose-300 font-semibold">
                      سبب الحذف: {item.deletionReason}
                    </div>
                  )}

                  {/* Recipient departments tags */}
                  {recipients.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-600 dark:text-slate-400">
                      <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">الجهات المستلمة:</span>
                      {recipients.slice(0, 3).map((r, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-300">
                          {r}
                        </span>
                      ))}
                      {recipients.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-mono">+{recipients.length - 3}</span>
                      )}
                    </div>
                  )}

                  {item.notes && !isItemDeleted && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <span>الجلسة ({session?.sessionNumber || '-'})</span>
                      <span>·</span>
                      <span>{session?.sessionType}</span>
                      {dec?.letterNumber && (
                        <>
                          <span>·</span>
                          <span className="font-mono">كتاب {dec.letterNumber}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isItemDeleted && (
                        <button
                          onClick={(e) => handleRestore(e, item)}
                          className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[10px] flex items-center gap-1"
                          title="استعادة الملف المحذوف"
                        >
                          <RestoreIcon className="w-3 h-3" />
                          <span>استعادة</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                        <span>معاينة</span>
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        document={previewItem}
      />

    </div>
  );
};

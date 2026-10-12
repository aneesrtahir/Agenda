import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ShieldAlert,
  Lock,
  AlertTriangle,
  CheckCircle,
  Building2,
  Zap,
  Link2,
  RotateCcw
} from 'lucide-react';
import { Decision, DecisionType, ExecutionStatus } from '../../types';
import { DecisionFormModal } from '../documents/DecisionFormModal';
import { DocumentPreviewModal } from '../documents/DocumentPreviewModal';
import { Modal } from '../common/Modal';

export const DecisionsRegistry: React.FC = () => {
  const {
    activeDecisions,
    governments,
    years,
    sessions,
    mainCategories,
    subCategories,
    departments,
    decisionRelations,
    deleteDecision,
    toggleDecisionVisibility,
    canManageAgenda,
    canAddDrafts
  } = useApp();

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGov, setSelectedGov] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMainCat, setSelectedMainCat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedClassification, setSelectedClassification] = useState<'all' | 'decisions' | 'directives'>('all'); // قرارات vs توجيهات (0)
  const [selectedRecipientDept, setSelectedRecipientDept] = useState('all'); // الجهة المستلمة
  const [onlyLinked, setOnlyLinked] = useState(false); // القرارات المترابطة فقط

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [decisionToEdit, setDecisionToEdit] = useState<Decision | null>(null);
  const [previewItem, setPreviewItem] = useState<Decision | null>(null);

  // Soft delete prompt modal
  const [itemToDelete, setItemToDelete] = useState<Decision | null>(null);
  const [deletionReasonInput, setDeletionReasonInput] = useState('');

  // Filtered decisions list
  const filteredDecisions = activeDecisions.filter(d => {
    // Classification filter (decisions vs directives)
    if (selectedClassification === 'decisions' && (d.isDirective || d.decisionNumber === '0')) return false;
    if (selectedClassification === 'directives' && (!d.isDirective && d.decisionNumber !== '0')) return false;

    // Government & Year
    if (selectedGov !== 'all' && d.governmentId !== selectedGov) return false;
    if (selectedYear !== 'all' && d.yearId !== selectedYear) return false;

    // Decision Nature (عادي، سري، طارئ، سري-وطارئ)
    if (selectedType !== 'all' && d.decisionType !== selectedType) return false;

    // Category & Status
    if (selectedMainCat !== 'all' && d.mainCategoryId !== selectedMainCat) return false;
    if (selectedStatus !== 'all' && d.executionStatus !== selectedStatus) return false;

    // Recipient Department Filter
    if (selectedRecipientDept !== 'all') {
      const targetDept = departments.find(dept => dept.id === selectedRecipientDept);
      if (targetDept) {
        const isTargeted = d.isAllDepartments ||
          (d.targetDepartments && d.targetDepartments.some(r =>
            r.toLowerCase() === targetDept.name.toLowerCase() ||
            (targetDept.nameEn && r.toLowerCase() === targetDept.nameEn.toLowerCase())
          )) ||
          (d.recipientDepartments && d.recipientDepartments.some(r =>
            r.toLowerCase() === targetDept.name.toLowerCase() ||
            (targetDept.nameEn && r.toLowerCase() === targetDept.nameEn.toLowerCase())
          ));
        if (!isTargeted) return false;
      }
    }

    // Only Linked filter
    if (onlyLinked) {
      const hasRelation = decisionRelations.some(
        r => r.sourceDecisionId === d.id || r.targetDecisionId === d.id
      );
      if (!hasRelation) return false;
    }

    // Free text query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const inSubject = d.subject.toLowerCase().includes(q);
      const inDecNum = d.decisionNumber.toLowerCase().includes(q);
      const inLetterNum = d.letterNumber.toLowerCase().includes(q);
      const inKeywords = d.keywords.some(k => k.toLowerCase().includes(q));
      const inNotes = d.notes.toLowerCase().includes(q);
      if (!inSubject && !inDecNum && !inLetterNum && !inKeywords && !inNotes) return false;
    }

    return true;
  });

  const handleDeleteConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToDelete) return;
    deleteDecision(itemToDelete.id, deletionReasonInput.trim() || 'تم الحذف بواسطة مدير الأجندة');
    setItemToDelete(null);
    setDeletionReasonInput('');
  };

  const exportCsv = () => {
    const headers = ['التصنيف', 'رقم القرار/التوجيه', 'رقم الكتاب', 'تاريخ الكتاب', 'الموضوع', 'نوع القرار', 'التبويب الأساسي', 'موقف التنفيذ'];
    const rows = filteredDecisions.map(d => {
      const mainCat = mainCategories.find(m => m.id === d.mainCategoryId)?.name || '';
      const classification = d.isDirective || d.decisionNumber === '0' ? 'توجيه وزاري' : 'قرار مجلس الوزراء';
      return [
        `"${classification}"`,
        `"${d.decisionNumber}"`,
        `"${d.letterNumber}"`,
        `"${d.letterDate}"`,
        `"${d.subject.replace(/"/g, '""')}"`,
        `"${d.decisionType}"`,
        `"${mainCat}"`,
        `"${d.executionStatus}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cabinet_Decisions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGov('all');
    setSelectedYear('all');
    setSelectedType('all');
    setSelectedMainCat('all');
    setSelectedStatus('all');
    setSelectedClassification('all');
    setSelectedRecipientDept('all');
    setOnlyLinked(false);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            سجل القرارات والتوجيهات الوزارية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            توثيق رسمي لكافة القرارات والتوجيهات (رقم 0)، ربط السوابق التشريعية، وتتبع جهات التوجيه
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV</span>
          </button>

          {canAddDrafts && (
            <button
              onClick={() => {
                setDecisionToEdit(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار قرار / توجيه جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم القرار، رقم الكتاب، نص الموضوع، الكلمات المفتاحية..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-4 pr-10 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        {/* Filters Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Classification (Decisions vs Directives 0) */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              تصنيف الوثيقة (قرار / توجيه):
            </label>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="all">كافة القرارات والتوجيهات</option>
              <option value="decisions">قرارات مجلس الوزراء فقط (لها رقم)</option>
              <option value="directives">التوجيهات الوزارية فقط (رقمها 0)</option>
            </select>
          </div>

          {/* Recipient Department Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              الجهة والوزارة المستلمة:
            </label>
            <select
              value={selectedRecipientDept}
              onChange={(e) => setSelectedRecipientDept(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">كافة الجهات المستلمة</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Decision Nature */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">درجة السرية / الاستعجال:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="all">كافة الدرجات</option>
              <option value="قرار عادي">اعتيادي</option>
              <option value="سري">سري</option>
              <option value="طارئ">طارئ</option>
              <option value="سري-وطارئ">سري-وطارئ</option>
            </select>
          </div>

          {/* Execution Status */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">موقف التنفيذ:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="all">كافة المواقف</option>
              <option value="تم التنفيذ">تم التنفيذ</option>
              <option value="قيد المتابعة">قيد المتابعة</option>
              <option value="مستمر">مستمر</option>
              <option value="معلق">معلق</option>
            </select>
          </div>

        </div>

        {/* Sub-Filters & Checkboxes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-800 dark:text-amber-300">
            <input
              type="checkbox"
              checked={onlyLinked}
              onChange={(e) => setOnlyLinked(e.target.checked)}
              className="rounded text-amber-600"
            />
            <Link2 className="w-3.5 h-3.5 text-amber-600" />
            <span>عرض القرارات المترابطة فقط (إلغاء، تعديل، استثناء)</span>
          </label>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة تعيين الفلاتر</span>
          </button>
        </div>

      </div>

      {/* Decisions Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>نتائج السجل: ({filteredDecisions.length} قرار وتوجيه)</span>
        </div>

        {filteredDecisions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
            <FileCheck2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">لا توجد قرارات أو توجيهات تطابق الفلترة المحددة.</p>
          </div>
        ) : (
          filteredDecisions.map((dec) => {
            const isDir = dec.isDirective || dec.decisionNumber === '0';
            const relationsCount = decisionRelations.filter(
              r => r.sourceDecisionId === dec.id || r.targetDecisionId === dec.id
            ).length;

            return (
              <div
                key={dec.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs hover:border-emerald-500 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {/* Badge: Decision number or Directive (0) */}
                    {isDir ? (
                      <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold border border-blue-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>توجيه وزاري (رقم 0)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 flex items-center gap-1 font-mono">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>القرار رقم: {dec.decisionNumber}</span>
                      </span>
                    )}

                    {/* Degree of secrecy/urgency */}
                    <span
                      className={`px-2 py-0.5 rounded-sm font-semibold text-[10px] ${
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

                    {/* Execution status */}
                    <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                      {dec.executionStatus}
                    </span>

                    {/* Linked decisions badge */}
                    {relationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-amber-600" />
                        <span>{relationsCount} قرار مرتبط</span>
                      </span>
                    )}

                    <span className="font-mono text-slate-400 text-[11px]">
                      الكتاب: {dec.letterNumber} · التاريخ: {dec.letterDate}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setPreviewItem(dec)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-semibold text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>معاينة وتأكيد الاستلام</span>
                    </button>

                    {canManageAgenda && (
                      <>
                        <button
                          onClick={() => {
                            setDecisionToEdit(dec);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 hover:text-emerald-700 text-slate-400"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setItemToDelete(dec)}
                          className="p-1.5 hover:text-rose-600 text-slate-400"
                          title="حذف ونقل لسلة المحذوفات"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                  {dec.subject}
                </h3>

                {/* Notes */}
                {dec.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {dec.notes}
                  </p>
                )}

                {/* Recipient departments */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    <span>الجهات المستلمة:</span>
                  </span>
                  {dec.isAllDepartments ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">كافة الوزارات</span>
                  ) : (
                    (dec.targetDepartments || []).map((dept, i) => (
                      <span key={i} className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                        {dept}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal with Reason */}
      {itemToDelete && (
        <Modal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          title="تأكيد حذف ونقل الوثيقة لسلة المحذوفات"
          subtitle="سيتم توثيق حركة الحذف في سجل الـ Log مع إمكانية استعادتها لاحقاً"
          maxWidth="md"
        >
          <form onSubmit={handleDeleteConfirm} className="space-y-4 text-xs text-right">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 leading-relaxed">
              هل أنت متأكد من حذف {itemToDelete.isDirective ? 'التوجيه الوزاري رقم 0' : `القرار رقم: ${itemToDelete.decisionNumber}`}؟
              <p className="font-bold mt-1 text-slate-800 dark:text-slate-100">{itemToDelete.subject}</p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                سبب الحذف والأرشفة: *
              </label>
              <input
                type="text"
                required
                value={deletionReasonInput}
                onChange={(e) => setDeletionReasonInput(e.target.value)}
                placeholder="مثال: إلغاء القرار بموجب مصادقة هيكل إداري جديد"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs"
              >
                تأكيد الحذف والأرشفة
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <DecisionFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setDecisionToEdit(null);
          }}
          decisionToEdit={decisionToEdit}
        />
      )}

      {/* Preview Modal */}
      {previewItem && (
        <DocumentPreviewModal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          document={previewItem}
        />
      )}

    </div>
  );
};

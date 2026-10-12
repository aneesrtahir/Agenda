import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trash2,
  RotateCcw,
  Search,
  Filter,
  FileText,
  FileCheck2,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  User,
  Clock,
  Eye,
  CheckCircle2,
  ShieldX
} from 'lucide-react';
import { CabinetDocument, Decision } from '../../types';
import { DocumentPreviewModal } from '../documents/DocumentPreviewModal';

export const DeletedItemsArchive: React.FC = () => {
  const {
    deletedDocuments,
    deletedDecisions,
    restoreDocument,
    restoreDecision,
    permanentDeleteDocument,
    permanentDeleteDecision,
    currentUser,
    canManageSystem
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'decisions' | 'documents'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewItem, setPreviewItem] = useState<CabinetDocument | Decision | null>(null);

  // Combine deleted lists
  const allDeletedItems: (CabinetDocument | Decision)[] = [
    ...(filterType === 'all' || filterType === 'documents' ? deletedDocuments : []),
    ...(filterType === 'all' || filterType === 'decisions' ? deletedDecisions : [])
  ];

  const filteredItems = allDeletedItems.filter(item => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const inSubject = item.subject.toLowerCase().includes(q);
      const inReason = item.deletionReason?.toLowerCase().includes(q);
      const inDeletedBy = item.deletedByUserName?.toLowerCase().includes(q);
      let inDecNum = false;
      if ('decisionNumber' in item) {
        inDecNum = (item as Decision).decisionNumber.toLowerCase().includes(q);
      }
      if (!inSubject && !inReason && !inDeletedBy && !inDecNum) return false;
    }
    return true;
  });

  const handleRestore = (item: CabinetDocument | Decision) => {
    if ('decisionNumber' in item) {
      restoreDecision(item.id);
    } else {
      restoreDocument(item.id);
    }
  };

  const handlePermanentDelete = (item: CabinetDocument | Decision) => {
    const isConfirmed = window.confirm(
      `تحذير أمني: هل أنت متأكد من الحذف النهائي الدائم للمستند: "${item.subject}"؟ لا يمكن التراجع عن هذا الإجراء!`
    );
    if (!isConfirmed) return;

    if ('decisionNumber' in item) {
      permanentDeleteDecision(item.id);
    } else {
      permanentDeleteDocument(item.id);
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
            <Trash2 className="w-4 h-4" />
            <span>الأرشيف المسترجع وسلة المحذوفات الإدارية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            الملفات والوثائق المحذوفة (Soft Deleted Archive)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            مساحة آمنة لحفظ الوثائق والقرارات المحذوفة، مع توثيق اسم المستخدم الذي قام بالحذف وسبب الحذف وتاريخه، مع إمكانية استعادة أي وثيقة فوراً للأرشيف النشط أو حذفها نهائياً.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 font-bold text-xs font-mono">
            {allDeletedItems.length} ملف محذوف
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">عرض نوع المحذوفات:</span>
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              الكل ({deletedDocuments.length + deletedDecisions.length})
            </button>
            <button
              onClick={() => setFilterType('decisions')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'decisions'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              القرارات والتوجيهات ({deletedDecisions.length})
            </button>
            <button
              onClick={() => setFilterType('documents')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'documents'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              الوثائق والمحاضر ({deletedDocuments.length})
            </button>
          </div>
        </div>

        <div className="relative min-w-[280px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في المحذوفات، السبب، أو المستخدم..."
            className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Deleted Items Cards / Table */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <p className="font-semibold text-sm">سلة المحذوفات فارغة حالياً.</p>
            <p className="text-xs text-slate-400">لا توجد وثائق أو قرارات محذوفة تطابق معايير البحث.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isDec = 'decisionNumber' in item;
            const dec = isDec ? (item as Decision) : null;

            return (
              <div
                key={item.id}
                className="p-5 bg-white dark:bg-slate-900 border-2 border-dashed border-rose-200 dark:border-rose-950/80 rounded-xl shadow-2xs hover:border-rose-400 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="px-2 py-0.5 rounded-sm bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-[11px] border border-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>[محذوفة]</span>
                    </span>

                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isDec ? `قرار وزاري: ${dec?.decisionNumber}` : 'وثيقة رسمية'}
                    </span>

                    {item.deletedAt && (
                      <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>تاريخ الحذف: {item.deletedAt}</span>
                      </span>
                    )}

                    {item.deletedByUserName && (
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>بواسطة: {item.deletedByUserName}</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة</span>
                    </button>

                    <button
                      onClick={() => handleRestore(item)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      title="استعادة الوثيقة للأرشيف النشط"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استعادة الوثيقة فوراً</span>
                    </button>

                    {canManageSystem && (
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                        title="حذف نهائي لا رجعة فيه"
                      >
                        <ShieldX className="w-3.5 h-3.5" />
                        <span>حذف نهائي</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subject & Deletion Reason */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {item.subject}
                  </h3>

                  {item.deletionReason && (
                    <div className="p-2.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs text-rose-800 dark:text-rose-300">
                      <strong className="font-semibold">سبب الحذف والأرشفة:</strong> {item.deletionReason}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      محتوى الوثيقة: {item.notes}
                    </p>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

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

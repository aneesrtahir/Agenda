import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CabinetDocument, Decision, DecisionRelationType } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  Download,
  Calendar,
  FileCheck2,
  Lock,
  AlertTriangle,
  Building2,
  Tag,
  Hash,
  ShieldAlert,
  FileText,
  Eye,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Link2,
  Plus,
  Trash2,
  ShieldCheck,
  Stamp,
  Users,
  FileDown
} from 'lucide-react';
import { exportOfficialDocumentPdf, exportOfficialDocumentWord } from '../../utils/documentExporter';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CabinetDocument | Decision | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const {
    governments,
    sessions,
    mainCategories,
    subCategories,
    documentTypes,
    departments,
    decisions,
    currentUser,
    currentDepartment,
    canUserAccessDocument,
    recordDocumentView,
    confirmDocumentReceipt,
    getDocumentReceiptLogs,
    decisionRelations,
    addDecisionRelation,
    deleteDecisionRelation,
    canManageAgenda
  } = useApp();

  const [activeViewTab, setActiveViewTab] = useState<'data' | 'file' | 'receipts' | 'relations'>('data');
  const [showWatermarkOverride, setShowWatermarkOverride] = useState<boolean>(false);

  // Receipt confirmation form state
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [receiptNumberInput, setReceiptNumberInput] = useState('');
  const [receiptNotesInput, setReceiptNotesInput] = useState('');

  // Decision linking form state (inside modal)
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const [targetDecisionId, setTargetDecisionId] = useState('');
  const [linkRelationType, setLinkRelationType] = useState<DecisionRelationType>('تعديل قرار');
  const [linkParagraph, setLinkParagraph] = useState('');
  const [linkExemptDept, setLinkExemptDept] = useState('');
  const [linkNotes, setLinkNotes] = useState('');

  // Selected linked decision to view inside modal
  const [viewingLinkedDecision, setViewingLinkedDecision] = useState<Decision | null>(null);

  // Automatically record view when opened and user has access
  useEffect(() => {
    if (isOpen && document && canUserAccessDocument(document)) {
      recordDocumentView(document.id, document.subject);
    }
  }, [isOpen, document?.id]);

  if (!document) return null;

  const currentDocToDisplay = viewingLinkedDecision || document;
  const isDecision = 'decisionNumber' in currentDocToDisplay;
  const decision = isDecision ? (currentDocToDisplay as Decision) : null;

  const government = governments.find(g => g.id === currentDocToDisplay.governmentId);
  const session = sessions.find(s => s.id === currentDocToDisplay.sessionId);
  const docType = documentTypes.find(dt => dt.id === currentDocToDisplay.documentTypeId);
  const mainCategory = decision ? mainCategories.find(mc => mc.id === decision.mainCategoryId) : null;
  const subCategory = decision ? subCategories.find(sc => sc.id === decision.subCategoryId) : null;

  // Check access permission:
  // "لا يمكن عرض الوثيقة التي اذا لم تكن الجهة ضمن الجهات المرسل اليها الوثيقة"
  const hasAccess = canUserAccessDocument(currentDocToDisplay);

  const handlePrint = () => {
    window.print();
  };

  const recipientList = isDecision
    ? (decision?.targetDepartments || decision?.recipientDepartments || [])
    : (currentDocToDisplay.recipientDepartments || []);

  const isAll = currentDocToDisplay.isAllDepartments;

  // Determine whether watermark should be shown:
  // "وعرض الصورة المائية على الوثائق تتضمن اسم الوزارة باللغة الانكليزية اذا كان المستخدم ليس بمستوى admin أو مدير الاجندة"
  const isSuperUser = currentUser.role === 'Admin' || currentUser.role === 'مدير الأجندة';
  const shouldShowWatermark = !isSuperUser || showWatermarkOverride;
  const watermarkEnglishText = currentDepartment?.nameEn || 'OFFICIAL RECIPIENT MINISTRY';
  const watermarkArabicText = currentDepartment?.name || 'الجهة الحكومية المستلمة';

  // Receipt logs for this document
  const receiptLogs = getDocumentReceiptLogs(currentDocToDisplay.id);
  const userReceiptLog = receiptLogs.find(r => r.userId === currentUser.id);
  const hasConfirmedReceipt = userReceiptLog?.status === 'تم تأكيد الاستلام رسمياً';

  // Relations for this decision
  const currentDecisionRelations = isDecision
    ? decisionRelations.filter(
        r => r.sourceDecisionId === currentDocToDisplay.id || r.targetDecisionId === currentDocToDisplay.id
      )
    : [];

  // Submit Receipt Confirmation
  const handleConfirmReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmDocumentReceipt(
      currentDocToDisplay.id,
      currentDocToDisplay.subject,
      receiptNumberInput,
      receiptNotesInput
    );
    setIsConfirmingReceipt(false);
    setReceiptNumberInput('');
    setReceiptNotesInput('');
  };

  // Submit New Decision Relation
  const handleCreateRelation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDecisionId) return;
    addDecisionRelation({
      sourceDecisionId: currentDocToDisplay.id,
      targetDecisionId,
      relationType: linkRelationType,
      paragraphNumber: linkParagraph.trim() || undefined,
      exemptedDepartmentName: linkExemptDept.trim() || undefined,
      notes: linkNotes.trim() || undefined
    });
    setIsLinkingOpen(false);
    setTargetDecisionId('');
    setLinkParagraph('');
    setLinkExemptDept('');
    setLinkNotes('');
  };

  // Watermark repeated background pattern component
  const WatermarkOverlay = () => {
    if (!shouldShowWatermark) return null;
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex flex-col justify-around select-none opacity-[0.08] dark:opacity-[0.14]">
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-around items-center whitespace-nowrap transform -rotate-12 text-center"
          >
            {Array.from({ length: 3 }).map((_, colIndex) => (
              <div key={colIndex} className="px-8 py-4 font-mono font-black tracking-widest text-slate-900 dark:text-amber-100">
                <div className="text-xl sm:text-2xl uppercase">{watermarkEnglishText}</div>
                <div className="text-xs">{watermarkArabicText} · CONFIDENTIAL / رسمي وسري</div>
                <div className="text-[10px] opacity-75">{currentUser.fullName} · {currentUser.username} · {new Date().toISOString().split('T')[0]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setViewingLinkedDecision(null);
        onClose();
      }}
      title={
        !hasAccess
          ? 'تنبيه وصول: مستند مقيد الصلاحية'
          : isDecision
          ? `القرار الوزاري: ${decision?.decisionNumber}`
          : `معاينة وثيقة: ${docType?.name || 'وثيقة رسمية'}`
      }
      subtitle={
        currentDocToDisplay.isDeleted
          ? '⚠️ وثيقة ملغاة ومحذوفة في الأرشيف'
          : 'المعاينة الرسمية والتوثيق المعتمد للأمانة العامة لمجلس الوزراء'
      }
      maxWidth="4xl"
    >
      <div className="space-y-4 text-right relative">
        
        {/* ACCESS DENIED VIEW */}
        {!hasAccess ? (
          <div className="p-8 text-center bg-rose-50/60 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900 rounded-xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                عذراً، غير مصرح لدائرتكم بالاطلاع على هذه الوثيقة!
              </h3>
              <p className="text-xs text-rose-800/80 dark:text-rose-300/80 max-w-lg mx-auto leading-relaxed">
                بموجب القواعد المنظمة لأجندة مجلس الوزراء، لا يمكن عرض أو تنزيل هذا المستند لأن دائرتكم الحالية{' '}
                <strong className="font-bold underline">({currentDepartment?.name || 'غير محددة'})</strong> ليست ضمن الجهات والوزارات المرسل إليها هذا المستند.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-lg max-w-md mx-auto text-xs text-slate-600 dark:text-slate-400 text-right space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>شروط الوصول للمستند:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                - الاطلاع مقتصر على ممثلي الدوائر والوزارات الموجه إليها القرار أو الوثيقة حصراً.
                <br />
                - مدراء النظام (Admin) ومدير الأجندة مخولون بالإشراف الشامل على كافة الأرشيف.
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
            >
              إغلاق النافذة
            </button>
          </div>
        ) : (
          /* AUTHORIZED VIEW */
          <>
            {/* Deleted Warning Banner if item is deleted */}
            {currentDocToDisplay.isDeleted && (
              <div className="p-3 bg-rose-500/10 border-2 border-dashed border-rose-500 rounded-lg flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span className="font-bold">
                    تنبيه: هذه الوثيقة محذوفة ناعماً من الأرشيف بتاريخ ({currentDocToDisplay.deletedAt || 'سابقاً'})
                  </span>
                  {currentDocToDisplay.deletionReason && (
                    <span className="text-[11px] text-rose-600/80">· سبب الحذف: {currentDocToDisplay.deletionReason}</span>
                  )}
                </div>
                <span className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded-sm text-[10px]">
                  محذوفة (Soft Deleted)
                </span>
              </div>
            )}

            {/* Back button if viewing a linked decision */}
            {viewingLinkedDecision && (
              <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-300 dark:border-amber-800 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  أنت تتصفح قراراً مرتبطاً: ({viewingLinkedDecision.decisionNumber})
                </span>
                <button
                  onClick={() => setViewingLinkedDecision(null)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold text-[11px]"
                >
                  الرجوع للوثيقة الأصلية
                </button>
              </div>
            )}

            {/* Watermark Security Notice Banner */}
            {shouldShowWatermark ? (
              <div className="bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs no-print">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Stamp className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">علامة مائية أمنية مشفرة:</span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-sm border border-emerald-300 dark:border-emerald-800">
                    {watermarkEnglishText}
                  </span>
                  <span className="text-[11px] text-slate-500">({watermarkArabicText})</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  نسخة محمية لمنع التسريب وتتبع الاطلاع
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 no-print">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">
                    معاينة أصلية بصلاحيات {currentUser.role} (بدون علامة مائية للوزارات)
                  </span>
                </div>
                <button
                  onClick={() => setShowWatermarkOverride(!showWatermarkOverride)}
                  className="text-[11px] px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-300 rounded-md font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50"
                >
                  {showWatermarkOverride ? 'إلغاء محاكاة العلامة المائية' : 'محاكاة العلامة المائية للوزارات'}
                </button>
              </div>
            )}

            {/* Top Bar with Tab switcher & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 no-print">
              
              {/* Tabs Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs overflow-x-auto">
                <button
                  onClick={() => setActiveViewTab('data')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap ${
                    activeViewTab === 'data'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>بيانات الوثيقة</span>
                </button>

                <button
                  onClick={() => setActiveViewTab('file')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap ${
                    activeViewTab === 'file'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>معاينة الملف المرفوع</span>
                  {currentDocToDisplay.fileDataUrl && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  )}
                </button>

                <button
                  onClick={() => setActiveViewTab('receipts')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap ${
                    activeViewTab === 'receipts'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>سجل المطلعين والاستلام</span>
                  <span className="px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-sm font-mono text-[10px]">
                    {receiptLogs.length}
                  </span>
                </button>

                {isDecision && (
                  <button
                    onClick={() => setActiveViewTab('relations')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap ${
                      activeViewTab === 'relations'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>القرارات المترابطة</span>
                    {currentDecisionRelations.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-sm font-mono text-[10px]">
                        {currentDecisionRelations.length}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Actions & Receipt Confirmation Button */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* Official Receipt Confirmation CTA */}
                {hasConfirmedReceipt ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم تأكيد الاستلام رسمياً</span>
                    {userReceiptLog?.receiptNumber && (
                      <span className="font-mono text-[11px] opacity-80">({userReceiptLog.receiptNumber})</span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingReceipt(!isConfirmingReceipt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors animate-pulse"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>تأكيد الاستلام الرسمي للوثيقة</span>
                  </button>
                )}

                {/* Export as Formatted PDF (with State Seal and General Secretariat Header) */}
                <button
                  type="button"
                  onClick={() => {
                    exportOfficialDocumentPdf({
                      item: currentDocToDisplay,
                      government,
                      session,
                      currentUserName: currentUser.fullName,
                      departmentName: currentDepartment?.name || 'الأمانة العامة لمجلس الوزراء'
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
                  title="تصدير كملف PDF رسمي منسق مع شعار الدولة وترويسة الأمانة العامة"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-300" />
                  <span>تصدير PDF رسمي</span>
                </button>

                {/* Export as Word Document (.doc) */}
                <button
                  type="button"
                  onClick={() => {
                    exportOfficialDocumentWord({
                      item: currentDocToDisplay,
                      government,
                      session,
                      currentUserName: currentUser.fullName,
                      departmentName: currentDepartment?.name || 'الأمانة العامة لمجلس الوزراء'
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
                  title="تصدير كملف Word رسمي (.doc)"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-200" />
                  <span>تصدير Word</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>
                
                <button
                  onClick={() => {
                    if (currentDocToDisplay.fileDataUrl) {
                      const link = window.document.createElement('a');
                      link.href = currentDocToDisplay.fileDataUrl;
                      link.download = currentDocToDisplay.fileName || 'Cabinet_Official_Document.pdf';
                      link.click();
                    } else {
                      alert(`جارٍ تنزيل الملف المرفق: ${currentDocToDisplay.fileName || 'Cabinet_Document.pdf'}`);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>الملف المرفق</span>
                </button>
              </div>

            </div>

            {/* Receipt Confirmation Drawer / Form */}
            {isConfirmingReceipt && (
              <form
                onSubmit={handleConfirmReceiptSubmit}
                className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-3 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-amber-950 dark:text-amber-200 border-b border-amber-200 dark:border-amber-900 pb-2">
                  <div className="flex items-center gap-2">
                    <Stamp className="w-4 h-4 text-amber-600" />
                    <span>إقرار تأكيد الاستلام الرسمي لممثلي ({currentDepartment?.name || 'الوزارة'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingReceipt(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      رقم إشعار الاستلام / الصادر الداخلي (اختياري):
                    </label>
                    <input
                      type="text"
                      value={receiptNumberInput}
                      onChange={(e) => setReceiptNumberInput(e.target.value)}
                      placeholder={`مثال: صادر/${currentDepartment?.code || 'وزارة'}/2025/104`}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      ملاحظات الاستلام والتوجيه الداخلي:
                    </label>
                    <input
                      type="text"
                      value={receiptNotesInput}
                      onChange={(e) => setReceiptNotesInput(e.target.value)}
                      placeholder="مثال: تم إحالة القرار للشعبة القانونية للتنفيذ"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingReceipt(false)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                  >
                    تراجع
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs"
                  >
                    تثبيت وتأكيد الاستلام الرسمي الآن
                  </button>
                </div>
              </form>
            )}

            {/* TAB 1: DATA SHEET WITH WATERMARK */}
            {activeViewTab === 'data' && (
              <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-6 relative overflow-hidden">
                <WatermarkOverlay />

                {/* Official Letterhead */}
                <div className="flex items-center justify-between pb-4 border-b-2 border-amber-700/60 text-center relative z-20">
                  <div className="text-right text-xs space-y-0.5">
                    <div className="font-bold text-sm">جمهورية العراق</div>
                    <div>مجلس الوزراء</div>
                    <div>الأمانة العامة</div>
                    <div className="text-[11px] text-slate-500 font-mono">دائرة شؤون مجلس الوزراء واللجان</div>
                  </div>

                  <div className="w-16 h-16 rounded-full overflow-hidden border border-amber-600/40 p-0.5 shadow-2xs">
                    <img
                      src="/src/assets/images/cabinet_seal_emblem_1791711513364.jpg"
                      alt="شعار مجلس الوزراء"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-left text-xs space-y-0.5 font-mono">
                    <div>العدد: <span className="font-bold">{decision ? decision.letterNumber : currentDocToDisplay.referenceNumber || 'وثيقة عامة'}</span></div>
                    <div>التاريخ: <span className="font-bold">{decision ? decision.letterDate : currentDocToDisplay.createdAt}</span></div>
                    <div>المرفق: <span className="font-bold">{currentDocToDisplay.fileName || 'نسخة إلكترونية'}</span></div>
                  </div>
                </div>

                {/* Document Title Banner */}
                <div className="text-center py-2 bg-slate-50 rounded-lg border border-slate-200/80 relative z-20">
                  <div className="text-xs text-slate-500 font-semibold mb-1">
                    {government?.name} · الجلسة رقم ({session?.sessionNumber || '-'}) [{session?.sessionType || 'عادية'}]
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {isDecision ? `قرار مجلس الوزراء رقم (${decision?.decisionNumber})` : docType?.name}
                  </h2>
                </div>

                {/* Subject */}
                <div className="space-y-1.5 relative z-20">
                  <div className="text-xs font-bold text-slate-700">الموضوع:</div>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/60">
                    {currentDocToDisplay.subject}
                  </p>
                </div>

                {/* Specialized Decision Details */}
                {decision && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-amber-50/50 border border-amber-200/60 p-3.5 rounded-lg relative z-20">
                    <div>
                      <span className="text-slate-500 block">التبويب الأساسي:</span>
                      <span className="font-bold text-slate-800">{mainCategory?.name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">التبويب الفرعي:</span>
                      <span className="font-bold text-slate-800">{subCategory?.name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">موقف التنفيذ:</span>
                      <span className="font-bold text-emerald-800">{decision.executionStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">درجة السرية:</span>
                      <span className="font-bold text-slate-900">{decision.decisionType}</span>
                    </div>
                  </div>
                )}

                {/* Recipient Departments Section (الجهات المرسل إليها) */}
                <div className="space-y-2 p-3.5 bg-emerald-50/40 border border-emerald-200/70 rounded-lg text-xs relative z-20">
                  <div className="flex items-center justify-between font-bold text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      <span>الجهات والوزارات المرسل إليها الوثيقة رسميّاً:</span>
                    </span>
                    {isAll && (
                      <span className="px-2 py-0.5 rounded-sm bg-emerald-200 text-emerald-900 font-semibold text-[11px]">
                        معمم لكافة الوزارات والجهات الحكومية
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {isAll ? (
                      <span className="text-emerald-800 font-medium">
                        كافة الوزارات والمؤسسات الرسمية والجهات غير المرتبطة بوزارة.
                      </span>
                    ) : recipientList.length > 0 ? (
                      recipientList.map((dept, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-white border border-emerald-300 text-emerald-900 font-semibold shadow-2xs"
                        >
                          {dept}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">الأمانة العامة لمجلس الوزراء</span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5 relative z-20">
                  <div className="text-xs font-bold text-slate-700">تفاصيل المحتوى والملاحظات:</div>
                  <div className="text-xs text-slate-800 leading-relaxed p-3.5 bg-white border border-slate-200 rounded-lg min-h-[90px]">
                    {currentDocToDisplay.notes ? currentDocToDisplay.notes : 'لا توجد ملاحظات إضافية مسجلة.'}
                  </div>
                </div>

                {/* Keywords */}
                {currentDocToDisplay.keywords && currentDocToDisplay.keywords.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200 text-xs relative z-20">
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>الكلمات المفتاحية:</span>
                    </span>
                    {currentDocToDisplay.keywords.map((kw, i) => (
                      <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Signature */}
                <div className="pt-6 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200 relative z-20">
                  <div>
                    <div className="text-[11px] text-slate-400">تدقيق وتوثيق:</div>
                    <div className="font-bold">{currentDocToDisplay.fileName || 'الأرشيف الإلكتروني المركزي'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">الأمين العام لمجلس الوزراء</div>
                    <div className="text-[11px] text-slate-400">مصادق عليه بموجب الصلاحيات المخولة</div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: ACTUAL DOCUMENT FILE PREVIEW WITH WATERMARK */}
            {activeViewTab === 'file' && (
              <div className="bg-slate-100 dark:bg-slate-900/90 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-4 relative overflow-hidden">
                <WatermarkOverlay />

                <div className="flex items-center justify-between text-xs px-1 relative z-20">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold">{currentDocToDisplay.fileName || 'وثيقة رسمية'}</span>
                    <span className="font-mono text-slate-400">({currentDocToDisplay.fileSize || '1.5 MB'})</span>
                  </div>

                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>وثيقة أصلية مصادق عليها إلكترونياً</span>
                  </div>
                </div>

                {/* File Render Box */}
                {currentDocToDisplay.fileDataUrl ? (
                  <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-800 p-2 overflow-hidden shadow-inner relative z-20">
                    {currentDocToDisplay.fileDataUrl.startsWith('data:image/') ? (
                      <div className="flex justify-center p-4">
                        <img
                          src={currentDocToDisplay.fileDataUrl}
                          alt={currentDocToDisplay.subject}
                          className="max-h-[600px] object-contain rounded-md shadow-md"
                        />
                      </div>
                    ) : (
                      <iframe
                        src={currentDocToDisplay.fileDataUrl}
                        className="w-full h-[650px] rounded-md border-0"
                        title={currentDocToDisplay.subject}
                      />
                    )}
                  </div>
                ) : (
                  /* Digitized Canvas */
                  <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-lg border border-slate-300 shadow-md max-w-3xl mx-auto space-y-8 relative overflow-hidden z-20">
                    <WatermarkOverlay />

                    {/* Official Presidential Letterhead */}
                    <div className="flex items-center justify-between pb-6 border-b-2 border-slate-800 relative z-20">
                      <div className="text-right text-xs space-y-1">
                        <div className="font-extrabold text-base">جمهورية العراق</div>
                        <div className="font-bold text-sm">مجلس الوزراء</div>
                        <div className="text-xs font-semibold">الأمانة العامة</div>
                        <div className="text-[11px] text-slate-600 font-mono">إدارة جدول الأعمال والقرارات</div>
                      </div>

                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-700 p-0.5 shadow-sm bg-amber-50">
                        <img
                          src="/src/assets/images/cabinet_seal_emblem_1791711513364.jpg"
                          alt="ختم مجلس الوزراء"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="text-left text-xs space-y-1 font-mono">
                        <div>العدد: <strong className="text-sm">{decision ? decision.letterNumber : currentDocToDisplay.referenceNumber || 'ق.م.و/2025'}</strong></div>
                        <div>التاريخ: <strong>{decision ? decision.letterDate : currentDocToDisplay.createdAt}</strong></div>
                        <div>السرية: <strong className="text-rose-700">{decision ? decision.decisionType : 'رسمي'}</strong></div>
                      </div>
                    </div>

                    {/* Document Heading */}
                    <div className="text-center space-y-2 relative z-20">
                      <h1 className="text-lg sm:text-xl font-black text-slate-900">
                        {isDecision ? `قرار مجلس الوزراء رقم (${decision?.decisionNumber})` : docType?.name}
                      </h1>
                      <div className="text-xs text-slate-600 font-semibold">
                        المتخذ في الجلسة الوزارية رقم ({session?.sessionNumber || '1'}) [{session?.sessionType || 'عادية'}] المنعقدة بتاريخ {session?.sessionDate || currentDocToDisplay.createdAt}
                      </div>
                    </div>

                    {/* Addressed To (الجهات المرسل إليها) */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1 relative z-20">
                      <div className="font-bold text-slate-800">إلى الجهات المعنية والمرسل إليها:</div>
                      <div className="text-slate-700 font-semibold leading-relaxed">
                        {isAll
                          ? 'كافة الوزارات والجهات غير المرتبطة بوزارة والمحافظات كافة'
                          : recipientList.join(' / ')}
                      </div>
                    </div>

                    {/* Subject & Resolution Text */}
                    <div className="space-y-4 text-xs sm:text-sm leading-relaxed relative z-20">
                      <div className="font-bold text-slate-900">
                        الموضوع: <span className="font-normal">{currentDocToDisplay.subject}</span>
                      </div>

                      <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-md font-serif text-slate-900 text-justify leading-loose">
                        بناءً على ما عرضه السيد رئيس مجلس الوزراء، واستناداً إلى أحكام الدستور والقوانين النافذة، قرر مجلس الوزراء في جلسته المذكورة أعلاه ما يأتي:
                        <p className="mt-2 font-bold">
                          {currentDocToDisplay.notes || 'المصادقة على التوصيات والفقرات الواردة بالمذكرة وإلزام الجهات المعنية بالتنفيذ الفوري كل حسب اختصاصه.'}
                        </p>
                      </div>
                    </div>

                    {/* Official Signatures & Barcode */}
                    <div className="pt-10 flex items-end justify-between border-t border-slate-200 relative z-20">
                      <div className="space-y-1 text-center">
                        <div className="w-28 h-10 border border-slate-300 rounded flex items-center justify-center font-mono text-[10px] text-slate-400 bg-slate-50">
                          ||||| | |||| ||| |||||
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">الرقم المرجعي الموثق</div>
                      </div>

                      <div className="text-center space-y-1">
                        <div className="font-extrabold text-sm text-slate-900">الأمين العام لمجلس الوزراء</div>
                        <div className="text-xs text-slate-500 font-serif">عن مجلس الوزراء</div>
                        <div className="text-[11px] text-emerald-800 font-mono font-bold mt-1">✓ مصادق ومختوم إلكترونياً</div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* TAB 3: RECEIPT & AUDIT REPORT (تقرير المطلعين وتأكيدات الاستلام) */}
            {activeViewTab === 'receipts' && (
              <div className="space-y-4 text-xs">
                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-purple-900 dark:text-purple-200 text-sm">
                      تقرير التتبع والاطلاع وتأكيدات الاستلام الرسمي
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                      سجل مفصل يوثق بالوقت والتاريخ كل جهة اطلعت على هذه الوثيقة أو أكدت استلامها رسمياً
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-purple-300 rounded-lg font-mono font-bold text-purple-700 dark:text-purple-300">
                      {receiptLogs.filter(r => r.status === 'تم تأكيد الاستلام رسمياً').length} مؤكد / {receiptLogs.length} مطلع
                    </span>
                  </div>
                </div>

                {/* Table of viewers & confirmations */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3.5 py-2.5 font-bold">اسم المستخدم والرتبة</th>
                        <th className="px-3.5 py-2.5 font-bold">الجهة والاسم بالإنكليزية</th>
                        <th className="px-3.5 py-2.5 font-bold">تاريخ ووقت الاطلاع</th>
                        <th className="px-3.5 py-2.5 font-bold">حالة الاستلام</th>
                        <th className="px-3.5 py-2.5 font-bold">رقم الإشعار والملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {receiptLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            لم يسجل أي اطلاع بعد على هذه الوثيقة.
                          </td>
                        </tr>
                      ) : (
                        receiptLogs.map((log) => {
                          const isConfirmed = log.status === 'تم تأكيد الاستلام رسمياً';
                          return (
                            <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-slate-100">
                                <div>{log.userName}</div>
                                <span className="text-[10px] text-slate-400 font-mono">[{log.userRole}]</span>
                              </td>
                              <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300">
                                <div className="font-semibold">{log.departmentName}</div>
                                {log.departmentNameEn && (
                                  <div className="text-[10px] text-slate-400 font-mono">{log.departmentNameEn}</div>
                                )}
                              </td>
                              <td className="px-3.5 py-3 font-mono text-slate-600 dark:text-slate-400">
                                {log.viewedAt}
                              </td>
                              <td className="px-3.5 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                    isConfirmed
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                                  }`}
                                >
                                  {isConfirmed ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>تم تأكيد الاستلام رسمياً</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>تم الاطلاع فقط</span>
                                    </>
                                  )}
                                </span>
                                {log.confirmedAt && (
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    بتاريخ: {log.confirmedAt}
                                  </div>
                                )}
                              </td>
                              <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300">
                                {log.receiptNumber && (
                                  <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                    {log.receiptNumber}
                                  </div>
                                )}
                                <div className="text-[11px] text-slate-500">
                                  {log.notes || '—'}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Recipient status overview */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-700 dark:text-slate-300">الجهات المطلوبة:</div>
                  <div className="text-slate-500 text-[11px]">
                    {isAll ? 'معمم لكافة الوزارات والمؤسسات الرسمية' : recipientList.join(' · ')}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LINKED DECISIONS (القرارات المترابطة والسوابق القانونية) */}
            {activeViewTab === 'relations' && isDecision && (
              <div className="space-y-4 text-xs">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-amber-600" />
                      <span>القرارات المترابطة والسوابق التشريعية لهذا القرار</span>
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                      ربط القرارات: إلغاء قرار، إلغاء فقرة من قرار، تعديل قرار، تعديل فقرة، استثناء قرار، أو استثناء جهة
                    </p>
                  </div>
                  {canManageAgenda && (
                    <button
                      onClick={() => setIsLinkingOpen(!isLinkingOpen)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ربط بقرار آخر</span>
                    </button>
                  )}
                </div>

                {/* Form to link with another decision */}
                {isLinkingOpen && (
                  <form
                    onSubmit={handleCreateRelation}
                    className="p-4 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl space-y-3 shadow-xs"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-100 dark:border-slate-800">
                      إنشاء رابط تشريعي جديد مع قرار آخر
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                          القرار المراد ربطه: *
                        </label>
                        <select
                          required
                          value={targetDecisionId}
                          onChange={(e) => setTargetDecisionId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        >
                          <option value="">-- اختر القرار المرتبط --</option>
                          {decisions
                            .filter(d => d.id !== currentDocToDisplay.id)
                            .map(d => (
                              <option key={d.id} value={d.id}>
                                {d.decisionNumber} — {d.subject.substring(0, 50)}...
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                          نوع الربط والعلاقة التشريعية: *
                        </label>
                        <select
                          value={linkRelationType}
                          onChange={(e) => setLinkRelationType(e.target.value as DecisionRelationType)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                        >
                          <option value="تعديل قرار">تعديل قرار</option>
                          <option value="إلغاء قرار">إلغاء قرار</option>
                          <option value="تعديل فقرة من قرار">تعديل فقرة من قرار</option>
                          <option value="إلغاء فقرة من قرار">إلغاء فقرة من قرار</option>
                          <option value="استثناء قرار">استثناء قرار</option>
                          <option value="استثناء جهة من قرار">استثناء جهة من قرار</option>
                        </select>
                      </div>
                    </div>

                    {(linkRelationType === 'إلغاء فقرة من قرار' || linkRelationType === 'تعديل فقرة من قرار') && (
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                          رقم أو مسمى الفقرة المعنية بالتعديل/الإلغاء:
                        </label>
                        <input
                          type="text"
                          value={linkParagraph}
                          onChange={(e) => setLinkParagraph(e.target.value)}
                          placeholder="مثال: الفقرة (3) من البند ثانياً"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    )}

                    {linkRelationType === 'استثناء جهة من قرار' && (
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                          اسم الجهة أو الوزارة المستثناة:
                        </label>
                        <input
                          type="text"
                          value={linkExemptDept}
                          onChange={(e) => setLinkExemptDept(e.target.value)}
                          placeholder="مثال: وزارة الموارد المائية ودائرة كري الأنهر"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        السند والمبررات القانونية للربط:
                      </label>
                      <input
                        type="text"
                        value={linkNotes}
                        onChange={(e) => setLinkNotes(e.target.value)}
                        placeholder="أسباب التعديل أو الاستثناء أو الإلغاء..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsLinkingOpen(false)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs"
                      >
                        حفظ وتثبيت الرابط
                      </button>
                    </div>
                  </form>
                )}

                {/* List of active relationships */}
                <div className="space-y-3">
                  {currentDecisionRelations.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                      لا توجد قرارات مترابطة أو سوابق مسجلة لهذا القرار حتى الآن.
                    </div>
                  ) : (
                    currentDecisionRelations.map((rel) => {
                      const isSource = rel.sourceDecisionId === currentDocToDisplay.id;
                      const otherDecisionId = isSource ? rel.targetDecisionId : rel.sourceDecisionId;
                      const otherDecision = decisions.find(d => d.id === otherDecisionId);

                      return (
                        <div
                          key={rel.id}
                          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-amber-400 transition-colors"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                {rel.relationType}
                              </span>

                              {rel.paragraphNumber && (
                                <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                                  {rel.paragraphNumber}
                                </span>
                              )}

                              {rel.exemptedDepartmentName && (
                                <span className="px-2 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                                  الجهة المستثناة: {rel.exemptedDepartmentName}
                                </span>
                              )}

                              <span className="text-[11px] text-slate-400 font-mono">
                                {isSource ? 'هذا القرار يؤثر على:' : 'متأثر بـ:'}
                              </span>
                            </div>

                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {otherDecision ? (
                                <span>القرار رقم: {otherDecision.decisionNumber} — {otherDecision.subject}</span>
                              ) : (
                                <span className="text-slate-400">قرار مرتبط غير متوفر</span>
                              )}
                            </div>

                            {rel.notes && (
                              <div className="text-xs text-slate-500">
                                السند: {rel.notes}
                              </div>
                            )}

                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>سجل بواسطة: {rel.createdByName}</span>
                              <span>·</span>
                              <span>بتاريخ: {rel.createdAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {otherDecision && (
                              <button
                                onClick={() => setViewingLinkedDecision(otherDecision)}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center gap-1 text-xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                                <span>معاينة القرار</span>
                              </button>
                            )}

                            {canManageAgenda && (
                              <button
                                onClick={() => deleteDecisionRelation(rel.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                title="إلغاء هذا الرابط"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </>
        )}

      </div>
    </Modal>
  );
};

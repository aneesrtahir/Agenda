import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { CabinetDocument } from '../../types';
import { UploadCloud, FileText, Building2, CheckSquare, Square } from 'lucide-react';

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentToEdit?: CabinetDocument | null;
  defaultSessionId?: string;
  defaultDocumentTypeId?: string;
}

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  isOpen,
  onClose,
  documentToEdit,
  defaultSessionId,
  defaultDocumentTypeId
}) => {
  const {
    sessions,
    documentTypes,
    departments,
    currentUser,
    addDocument,
    updateDocument
  } = useApp();

  const [sessionId, setSessionId] = useState<string>(defaultSessionId || sessions[0]?.id || '');
  const [documentTypeId, setDocumentTypeId] = useState<string>(defaultDocumentTypeId || 'dt-agenda');
  const [subject, setSubject] = useState<string>('');
  const [keywordsText, setKeywordsText] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('1.8 MB');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileType, setFileType] = useState<string>('application/pdf');
  const [isHidden, setIsHidden] = useState<boolean>(false);

  // Recipient departments (الجهات المرسل إليها الوثيقة)
  const [recipientDepts, setRecipientDepts] = useState<string[]>([]);
  const [isAllDepts, setIsAllDepts] = useState<boolean>(false);

  useEffect(() => {
    if (documentToEdit) {
      setSessionId(documentToEdit.sessionId);
      setDocumentTypeId(documentToEdit.documentTypeId);
      setSubject(documentToEdit.subject);
      setKeywordsText(documentToEdit.keywords.join('، '));
      setNotes(documentToEdit.notes);
      setReferenceNumber(documentToEdit.referenceNumber || '');
      setFileName(documentToEdit.fileName || '');
      setFileSize(documentToEdit.fileSize || '1.5 MB');
      setFileDataUrl(documentToEdit.fileDataUrl || '');
      setFileType(documentToEdit.fileType || 'application/pdf');
      setIsHidden(documentToEdit.isHidden);
      setRecipientDepts(documentToEdit.recipientDepartments || []);
      setIsAllDepts(!!documentToEdit.isAllDepartments);
    } else {
      setSessionId(defaultSessionId || sessions[0]?.id || '');
      setDocumentTypeId(defaultDocumentTypeId || 'dt-agenda');
      setSubject('');
      setKeywordsText('');
      setNotes('');
      setReferenceNumber('');
      setFileName('');
      setFileSize('1.8 MB');
      setFileDataUrl('');
      setFileType('application/pdf');
      setIsHidden(false);
      // Default to user's department + Cabinet
      setRecipientDepts(['الأمانة العامة لمجلس الوزراء']);
      setIsAllDepts(false);
    }
  }, [documentToEdit, isOpen, defaultSessionId, defaultDocumentTypeId, sessions]);

  // Selected session details to tie to Government & Year
  const currentSession = sessions.find(s => s.id === sessionId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type || 'application/pdf');
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMb} MB`);

      // Read actual file content as Data URL for embedded preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeptToggle = (name: string) => {
    if (recipientDepts.includes(name)) {
      setRecipientDepts(recipientDepts.filter(d => d !== name));
    } else {
      setRecipientDepts([...recipientDepts, name]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;

    const keywords = keywordsText
      .split(/[،,]+/)
      .map(k => k.trim())
      .filter(Boolean);

    const docPayload = {
      governmentId: currentSession.governmentId,
      yearId: currentSession.yearId,
      sessionId,
      documentTypeId,
      subject,
      keywords,
      notes,
      referenceNumber,
      fileName: fileName || `${subject.substring(0, 20)}.pdf`,
      fileSize: fileSize || '1.2 MB',
      fileType: fileType || 'application/pdf',
      fileDataUrl,
      isHidden,
      createdByUserId: currentUser.id,
      recipientDepartments: isAllDepts ? departments.map(d => d.name) : recipientDepts,
      isAllDepartments: isAllDepts
    };

    if (documentToEdit) {
      updateDocument(documentToEdit.id, docPayload);
    } else {
      addDocument(docPayload);
    }
    onClose();
  };

  // Filter out 'DECISION' from generic document modal since decisions have dedicated rich fields
  const standardDocTypes = documentTypes.filter(dt => dt.code !== 'DECISION');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={documentToEdit ? 'تعديل بيانات الوثيقة' : 'إضافة وثيقة أو محضر جديد للجلسة'}
      subtitle="رفع وتوثيق جداول الأعمال، التوجيهات، المحاضر، وتحديد الجهات المرسل إليها"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Session and Document Type selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              الجلسة التابعة لها *
            </label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  الجلسة ({s.sessionNumber}) - {s.sessionType} ({s.sessionDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              نوع الوثيقة *
            </label>
            <select
              value={documentTypeId}
              onChange={(e) => setDocumentTypeId(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-semibold"
            >
              {standardDocTypes.map(dt => (
                <option key={dt.id} value={dt.id}>{dt.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject (اسم الموضوع) */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
            اسم الموضوع (عنوان الوثيقة) *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="مثال: جدول الأعمال الرسمي للجلسة الاعتيادية الأولى لسنة 2025"
            required
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-medium"
          />
        </div>

        {/* Reference number and keywords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              رقم الإشارة / القيد المرجعي
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="مثال: ج.أ/2025/01 أو ت.ر/11"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              الكلمات المفتاحية (مفصولة بفواصل) *
            </label>
            <input
              type="text"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder="مثال: جدول أعمال، موازنة، مشاريع، صحة"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Recipient Departments (الجهات المرسل إليها الوثيقة) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>الجهات والوزارات المرسل إليها الوثيقة (المصرح لها بالاطلاع والتنفيذ) *</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={isAllDepts}
                onChange={(e) => setIsAllDepts(e.target.checked)}
                className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>إرسال لكافة الوزارات والجهات الحكومية</span>
            </label>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            تنبيه نظامي: لا يمكن لأي مستخدم أو ممثل دائرة فتح واستعراض هذه الوثيقة إلا إذا كانت دائرته مشمولة بالإرسال.
          </p>

          {!isAllDepts && (
            <div className="space-y-3 pt-1 max-h-72 overflow-y-auto pr-1">
              {(['وزارات', 'هيئات', 'محافظات ومجالس محافظات', 'أخرى'] as const).map((catName) => {
                const catDepts = departments.filter(d => (d.category || 'وزارات') === catName && d.showInSendingLists !== false);
                if (catDepts.length === 0) return null;

                const allInCatSelected = catDepts.every(d => recipientDepts.includes(d.name));
                const someInCatSelected = catDepts.some(d => recipientDepts.includes(d.name)) && !allInCatSelected;

                const toggleAllInCat = () => {
                  if (allInCatSelected) {
                    const catNames = catDepts.map(d => d.name);
                    setRecipientDepts(recipientDepts.filter(name => !catNames.includes(name)));
                  } else {
                    const toAdd = catDepts.map(d => d.name).filter(name => !recipientDepts.includes(name));
                    setRecipientDepts([...recipientDepts, ...toAdd]);
                  }
                };

                return (
                  <div key={catName} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                        <span>فئة: {catName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({catDepts.length})</span>
                      </span>

                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900">
                        <input
                          type="checkbox"
                          checked={allInCatSelected}
                          ref={el => {
                            if (el) el.indeterminate = someInCatSelected;
                          }}
                          onChange={toggleAllInCat}
                          className="rounded text-emerald-700"
                        />
                        <span>اختيار كل ما في القائمة</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                      {catDepts.map((dept) => {
                        const isSelected = recipientDepts.includes(dept.name);
                        return (
                          <label
                            key={dept.id}
                            className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors border text-[11px] ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-semibold'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleDeptToggle(dept.name)}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="truncate" title={dept.name}>{dept.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes (ملاحظات) */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
            الملاحظات وتفاصيل المحتوى
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أدخل أي ملاحظات تنظيمية، توصيات، أو ملخص لما ورد في الوثيقة..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          />
        </div>

        {/* Real File Upload & Preview */}
        <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UploadCloud className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  رفع ملف الوثيقة الفعلي (PDF / مستند / صورة)
                </span>
                <span className="text-[11px] text-slate-500">
                  {fileName ? `${fileName} (${fileSize}) - جاهز للعرض والمطالعة` : 'اختر ملف الوثيقة لرفعه وحفظه بالأرشيف'}
                </span>
              </div>
            </div>
            <label className="cursor-pointer px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors font-medium text-xs">
              <span>اختيار ملف</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xlsx,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Visibility toggle (إخفاء / إظهار) */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="docIsHidden"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
            className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="docIsHidden" className="text-slate-700 dark:text-slate-300 cursor-pointer">
            إخفاء الوثيقة (حجب مؤقت عن العرض العام)
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium shadow-xs transition-colors"
          >
            {documentToEdit ? 'حفظ التعديلات' : 'إرفاق وتوجيه الوثيقة'}
          </button>
        </div>

      </form>
    </Modal>
  );
};

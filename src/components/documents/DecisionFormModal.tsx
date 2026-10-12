import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Decision, DecisionType, ExecutionStatus, DecisionRelationType } from '../../types';
import { UploadCloud, ShieldAlert, Lock, CheckCircle, AlertTriangle, Link2, Zap, FileCheck2 } from 'lucide-react';

interface DecisionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionToEdit?: Decision | null;
  defaultSessionId?: string;
}

export const DecisionFormModal: React.FC<DecisionFormModalProps> = ({
  isOpen,
  onClose,
  decisionToEdit,
  defaultSessionId
}) => {
  const {
    sessions,
    mainCategories,
    subCategories,
    departments,
    decisions,
    currentUser,
    addDecision,
    updateDecision,
    addDecisionRelation
  } = useApp();

  const [sessionId, setSessionId] = useState<string>(defaultSessionId || sessions[0]?.id || '');
  const [isDirective, setIsDirective] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [decisionNumber, setDecisionNumber] = useState<string>('');
  const [letterNumber, setLetterNumber] = useState<string>('');
  const [letterDate, setLetterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mainCategoryId, setMainCategoryId] = useState<string>(mainCategories[0]?.id || '');
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [decisionType, setDecisionType] = useState<DecisionType>('قرار عادي');
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('قيد المتابعة');
  const [keywordsText, setKeywordsText] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('2.1 MB');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileType, setFileType] = useState<string>('application/pdf');
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isAllDepts, setIsAllDepts] = useState<boolean>(false);

  // Quick Relation linking state
  const [shouldLinkToOther, setShouldLinkToOther] = useState(false);
  const [targetLinkDecisionId, setTargetLinkDecisionId] = useState('');
  const [linkRelationType, setLinkRelationType] = useState<DecisionRelationType>('تعديل قرار');
  const [linkParagraph, setLinkParagraph] = useState('');
  const [linkExemptDept, setLinkExemptDept] = useState('');
  const [linkNotes, setLinkNotes] = useState('');

  // Filter sub-categories by main category
  const filteredSubCategories = subCategories.filter(sc => sc.mainCategoryId === mainCategoryId);

  useEffect(() => {
    if (decisionToEdit) {
      setSessionId(decisionToEdit.sessionId);
      const isDir = decisionToEdit.isDirective || decisionToEdit.decisionNumber === '0';
      setIsDirective(isDir);
      setSubject(decisionToEdit.subject);
      setDecisionNumber(isDir ? '0' : decisionToEdit.decisionNumber);
      setLetterNumber(decisionToEdit.letterNumber);
      setLetterDate(decisionToEdit.letterDate);
      setMainCategoryId(decisionToEdit.mainCategoryId);
      setSubCategoryId(decisionToEdit.subCategoryId);
      setDecisionType(decisionToEdit.decisionType);
      setExecutionStatus(decisionToEdit.executionStatus);
      setKeywordsText(decisionToEdit.keywords.join('، '));
      setNotes(decisionToEdit.notes);
      setSelectedDepts(decisionToEdit.targetDepartments || []);
      setFileName(decisionToEdit.fileName || '');
      setFileSize(decisionToEdit.fileSize || '1.8 MB');
      setFileDataUrl(decisionToEdit.fileDataUrl || '');
      setFileType(decisionToEdit.fileType || 'application/pdf');
      setIsHidden(decisionToEdit.isHidden);
      setIsAllDepts(!!decisionToEdit.isAllDepartments);
      setShouldLinkToOther(false);
    } else {
      setSessionId(defaultSessionId || sessions[0]?.id || '');
      setIsDirective(false);
      setSubject('');
      setDecisionNumber(`${Math.floor(Math.random() * 50) + 1} لسنة ${new Date().getFullYear()}`);
      setLetterNumber(`ق/ر/${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`);
      setLetterDate(new Date().toISOString().split('T')[0]);
      const firstMain = mainCategories[0]?.id || '';
      setMainCategoryId(firstMain);
      const firstSub = subCategories.find(s => s.mainCategoryId === firstMain)?.id || '';
      setSubCategoryId(firstSub);
      setDecisionType('قرار عادي');
      setExecutionStatus('قيد المتابعة');
      setKeywordsText('');
      setNotes('');
      setSelectedDepts(['وزارة المالية', 'الأمانة العامة لمجلس الوزراء']);
      setFileName('');
      setFileSize('2.1 MB');
      setFileDataUrl('');
      setFileType('application/pdf');
      setIsHidden(false);
      setIsAllDepts(false);
      setShouldLinkToOther(false);
      setTargetLinkDecisionId('');
    }
  }, [decisionToEdit, isOpen, defaultSessionId, sessions, mainCategories, subCategories]);

  // Handle switching between Directive (0) and Decision (numbered)
  const handleToggleDirective = (toDirective: boolean) => {
    setIsDirective(toDirective);
    if (toDirective) {
      setDecisionNumber('0'); // التوجيه رقمه 0
    } else {
      if (decisionNumber === '0' || !decisionNumber) {
        setDecisionNumber(`${Math.floor(Math.random() * 50) + 1} لسنة ${new Date().getFullYear()}`);
      }
    }
  };

  const handleMainCategoryChange = (newMainId: string) => {
    setMainCategoryId(newMainId);
    const relatedSubs = subCategories.filter(sc => sc.mainCategoryId === newMainId);
    setSubCategoryId(relatedSubs[0]?.id || '');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type || 'application/pdf');
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMb} MB`);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeptToggle = (deptName: string) => {
    if (selectedDepts.includes(deptName)) {
      setSelectedDepts(selectedDepts.filter(d => d !== deptName));
    } else {
      setSelectedDepts([...selectedDepts, deptName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSession = sessions.find(s => s.id === sessionId);
    if (!currentSession) return;

    const keywords = keywordsText
      .split(/[،,]+/)
      .map(k => k.trim())
      .filter(Boolean);

    const targetList = isAllDepts ? departments.map(d => d.name) : selectedDepts;
    const finalDecisionNumber = isDirective ? '0' : decisionNumber;

    const decisionPayload = {
      governmentId: currentSession.governmentId,
      yearId: currentSession.yearId,
      sessionId,
      documentTypeId: isDirective ? 'dt-directive' : 'dt-decision',
      subject,
      decisionNumber: finalDecisionNumber,
      isDirective,
      letterNumber,
      letterDate,
      mainCategoryId,
      subCategoryId,
      decisionType,
      executionStatus,
      targetDepartments: targetList,
      recipientDepartments: targetList,
      isAllDepartments: isAllDepts,
      keywords,
      notes,
      referenceNumber: finalDecisionNumber,
      fileName: fileName || (isDirective ? `Directive_0_${Date.now()}.pdf` : `Decision_${finalDecisionNumber.replace(/\s+/g, '_')}.pdf`),
      fileSize: fileSize || '2.0 MB',
      fileType: fileType || 'application/pdf',
      fileDataUrl,
      isHidden,
      createdByUserId: currentUser.id
    };

    let finalDecisionId = decisionToEdit?.id;
    if (decisionToEdit) {
      updateDecision(decisionToEdit.id, decisionPayload);
    } else {
      const created = addDecision(decisionPayload);
      finalDecisionId = created?.id;
    }

    // If linking requested during creation/edit
    if (shouldLinkToOther && targetLinkDecisionId && finalDecisionId) {
      addDecisionRelation({
        sourceDecisionId: finalDecisionId,
        targetDecisionId: targetLinkDecisionId,
        relationType: linkRelationType,
        paragraphNumber: linkParagraph.trim() || undefined,
        exemptedDepartmentName: linkExemptDept.trim() || undefined,
        notes: linkNotes.trim() || undefined
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        decisionToEdit
          ? isDirective
            ? 'تعديل التوجيه الوزاري (رقم 0)'
            : `تعديل القرار رقم: ${decisionToEdit.decisionNumber}`
          : isDirective
          ? 'إصدار توجيه وزاري جديد (رقم 0)'
          : 'إصدار وتوثيق قرار مجلس الوزراء'
      }
      subtitle="إدخال بيانات القرار أو التوجيه، الجهات المرسل إليها، التبويبات، وربط القرارات"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-right">
        
        {/* Type Selector: Decision (with number) vs Directive (number = 0) */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            تصنيف الإصدار الوزاري:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleToggleDirective(false)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                !isDirective
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>قرار وزاري (يحمل رقماً)</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleDirective(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                isDirective
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>توجيه وزاري (رقمه 0)</span>
            </button>
          </div>
        </div>

        {/* Session & Decision Nature */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              الجلسة الصادر فيها *
            </label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  الجلسة ({s.sessionNumber}) - {s.sessionType} بتاريخ {s.sessionDate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              درجة السرية والاستعجال *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['قرار عادي', 'سري', 'طارئ', 'سري-وطارئ'] as DecisionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDecisionType(type)}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium transition-colors border ${
                    decisionType === type
                      ? type === 'سري-وطارئ'
                        ? 'bg-rose-900 text-white border-rose-900 shadow-xs'
                        : type === 'سري'
                        ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                        : type === 'طارئ'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decision Number, Book/Letter Number & Letter Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {isDirective ? 'رقم التوجيه (مثبت 0) *' : 'رقم القرار (Decision No) *'}
            </label>
            {isDirective ? (
              <div className="w-full bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 rounded-lg p-2 font-mono font-black text-blue-900 dark:text-blue-200">
                0 (توجيه وزاري رقمه 0 دائماً)
              </div>
            ) : (
              <input
                type="text"
                value={decisionNumber}
                onChange={(e) => setDecisionNumber(e.target.value)}
                placeholder="مثال: 142 لسنة 2025"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono font-bold"
              />
            )}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              رقم الكتاب الرسمي (Letter No) *
            </label>
            <input
              type="text"
              value={letterNumber}
              onChange={(e) => setLetterNumber(e.target.value)}
              placeholder="مثال: و.ر/895 أو ق/2/1/104"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              تاريخ الكتاب الصادر *
            </label>
            <input
              type="date"
              value={letterDate}
              onChange={(e) => setLetterDate(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
            موضوع {isDirective ? 'التوجيه الوزاري' : 'القرار'} *
          </label>
          <textarea
            rows={2}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="مثال: إقرار حزمة التسهيلات الجمركية والضريبية لاستيراد خطوط الإنتاج الصناعية الحديثة"
            required
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden font-semibold"
          />
        </div>

        {/* Categories & Execution Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              التبويب الأساسي *
            </label>
            <select
              value={mainCategoryId}
              onChange={(e) => handleMainCategoryChange(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {mainCategories.map(mc => (
                <option key={mc.id} value={mc.id}>{mc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              التبويب الفرعي *
            </label>
            <select
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {filteredSubCategories.length === 0 ? (
                <option value="">لا توجد تبويبات فرعية</option>
              ) : (
                filteredSubCategories.map(sc => (
                  <option key={sc.id} value={sc.id}>{sc.name}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              موقف التنفيذ *
            </label>
            <select
              value={executionStatus}
              onChange={(e) => setExecutionStatus(e.target.value as ExecutionStatus)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-semibold"
            >
              <option value="تم التنفيذ">تم التنفيذ</option>
              <option value="قيد المتابعة">قيد المتابعة</option>
              <option value="مستمر">مستمر</option>
              <option value="معلق">معلق</option>
            </select>
          </div>
        </div>

        {/* DECISION LINKING SECTION (ربط القرار بقرار آخر) */}
        {!isDirective && (
          <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldLinkToOther}
                  onChange={(e) => setShouldLinkToOther(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>ربط هذا القرار بقرار آخر (إلغاء / تعديل / استثناء)</span>
                </span>
              </label>
            </div>

            {shouldLinkToOther && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200 dark:border-amber-900">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    القرار المرتبط به: *
                  </label>
                  <select
                    value={targetLinkDecisionId}
                    onChange={(e) => setTargetLinkDecisionId(e.target.value)}
                    required={shouldLinkToOther}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="">-- اختر القرار المرتبط --</option>
                    {decisions.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.decisionNumber} — {d.subject.substring(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    نوع علاقة الربط: *
                  </label>
                  <select
                    value={linkRelationType}
                    onChange={(e) => setLinkRelationType(e.target.value as DecisionRelationType)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="تعديل قرار">تعديل قرار</option>
                    <option value="إلغاء قرار">إلغاء قرار</option>
                    <option value="تعديل فقرة من قرار">تعديل فقرة من قرار</option>
                    <option value="إلغاء فقرة من قرار">إلغاء فقرة من قرار</option>
                    <option value="استثناء قرار">استثناء قرار</option>
                    <option value="استثناء جهة من قرار">استثناء جهة من قرار</option>
                  </select>
                </div>

                {(linkRelationType === 'إلغاء فقرة من قرار' || linkRelationType === 'تعديل فقرة من قرار') && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      رقم الفقرة المعنية:
                    </label>
                    <input
                      type="text"
                      value={linkParagraph}
                      onChange={(e) => setLinkParagraph(e.target.value)}
                      placeholder="مثال: الفقرة (2) من البند أولاً"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                )}

                {linkRelationType === 'استثناء جهة من قرار' && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      الجهة المستثناة:
                    </label>
                    <input
                      type="text"
                      value={linkExemptDept}
                      onChange={(e) => setLinkExemptDept(e.target.value)}
                      placeholder="مثال: وزارة الموارد المائية"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recipient Departments */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              الجهات والوزارات المرسل إليها الوثيقة *
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-800 dark:text-emerald-300">
              <input
                type="checkbox"
                checked={isAllDepts}
                onChange={(e) => setIsAllDepts(e.target.checked)}
                className="rounded text-emerald-700"
              />
              <span>تعميم لكافة الوزارات والجهات الحكومية</span>
            </label>
          </div>

          {!isAllDepts && (
            <div className="space-y-3 pt-1 max-h-72 overflow-y-auto pr-1">
              {(['وزارات', 'هيئات', 'محافظات ومجالس محافظات', 'أخرى'] as const).map((catName) => {
                const catDepts = departments.filter(d => (d.category || 'وزارات') === catName && d.showInSendingLists !== false);
                if (catDepts.length === 0) return null;

                const allInCatSelected = catDepts.every(d => selectedDepts.includes(d.name));
                const someInCatSelected = catDepts.some(d => selectedDepts.includes(d.name)) && !allInCatSelected;

                const toggleAllInCat = () => {
                  if (allInCatSelected) {
                    const catNames = catDepts.map(d => d.name);
                    setSelectedDepts(selectedDepts.filter(name => !catNames.includes(name)));
                  } else {
                    const toAdd = catDepts.map(d => d.name).filter(name => !selectedDepts.includes(name));
                    setSelectedDepts([...selectedDepts, ...toAdd]);
                  }
                };

                return (
                  <div key={catName} className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
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
                        const isSelected = selectedDepts.includes(dept.name);
                        return (
                          <label
                            key={dept.id}
                            className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors border text-[11px] ${
                              isSelected
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
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

        {/* Keywords and Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              الكلمات المفتاحية (مفصولة بفواصل)
            </label>
            <input
              type="text"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder="مثال: جمارك، استثمار، ضرائب، صناعة"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              تفاصيل المحتوى والملاحظات
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي حيثيات أو شروط تنفيذية واردة بالقرار..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40">
          <UploadCloud className="w-6 h-6 mx-auto text-emerald-600" />
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            رفع ملف الوثيقة الأصلية الموقعة (PDF أو صورة)
          </div>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileUpload}
            className="text-xs text-slate-500 mx-auto block file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
          />
          {fileName && (
            <div className="text-[11px] text-emerald-700 font-bold">
              ✓ تم إرفاق الملف: {fileName} ({fileSize})
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={isHidden}
              onChange={(e) => setIsHidden(e.target.checked)}
              className="rounded"
            />
            <span>إخفاء من العرض المباشر (أرشفة غير معلنة)</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
            >
              {decisionToEdit ? 'تحديث وتثبيت' : isDirective ? 'إصدار التوجيه (0)' : 'إصدار القرار'}
            </button>
          </div>
        </div>

      </form>
    </Modal>
  );
};

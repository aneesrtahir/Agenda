import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Inbox,
  Search,
  Filter,
  Plus,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  Download,
  Eye,
  User,
  Shield,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import {
  MinisterialDispatch,
  DispatchDirection,
  DispatchPriority,
  DispatchStatus
} from '../../types';
import { Modal } from '../common/Modal';

export const MinisterialDispatches: React.FC = () => {
  const {
    ministerialDispatches,
    departments,
    currentUser,
    currentDepartment,
    canManageAgenda,
    addMinisterialDispatch,
    updateMinisterialDispatchStatus,
    confirmDispatchReceipt
  } = useApp();

  // Direction filter & search
  const [selectedDirection, setSelectedDirection] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New Dispatch Modal
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false);
  const [previewDispatch, setPreviewDispatch] = useState<MinisterialDispatch | null>(null);

  // Form states
  const [direction, setDirection] = useState<DispatchDirection>(
    canManageAgenda ? 'من مجلس الوزراء إلى الوزارة' : 'من الوزارة إلى مجلس الوزراء'
  );
  const [targetDeptId, setTargetDeptId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [priority, setPriority] = useState<DispatchPriority>('عادي');
  const [letterNumber, setLetterNumber] = useState<string>(
    `كتاب/${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`
  );
  const [letterDate, setLetterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('1.8 MB');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      const reader = new FileReader();
      reader.onload = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();

    let fromDeptId = '';
    let fromDeptName = '';
    let fromDeptNameEn = '';
    let toDeptId = '';
    let toDeptName = '';
    let toDeptNameEn = '';

    const cabinetDept = departments.find(d => d.id === 'dept-cabinet') || {
      id: 'dept-cabinet',
      name: 'الأمانة العامة لمجلس الوزراء - مدير الأجندة',
      nameEn: 'General Secretariat for the Council of Ministers'
    };

    if (direction === 'من الوزارة إلى مجلس الوزراء') {
      fromDeptId = currentDepartment?.id || 'dept-misc';
      fromDeptName = currentDepartment?.name || 'الوزارة المرسلة';
      fromDeptNameEn = currentDepartment?.nameEn || 'Sending Ministry';
      toDeptId = cabinetDept.id;
      toDeptName = cabinetDept.name;
      toDeptNameEn = cabinetDept.nameEn;
    } else {
      fromDeptId = cabinetDept.id;
      fromDeptName = cabinetDept.name;
      fromDeptNameEn = cabinetDept.nameEn;
      const targetDept = departments.find(d => d.id === targetDeptId);
      toDeptId = targetDept?.id || '';
      toDeptName = targetDept?.name || '';
      toDeptNameEn = targetDept?.nameEn || '';
    }

    addMinisterialDispatch({
      direction,
      fromDepartmentId: fromDeptId,
      fromDepartmentName: fromDeptName,
      fromDepartmentNameEn: fromDeptNameEn,
      toDepartmentId: toDeptId,
      toDepartmentName: toDeptName,
      toDepartmentNameEn: toDeptNameEn,
      senderUserId: currentUser.id,
      senderUserName: currentUser.fullName,
      senderRole: currentUser.role,
      subject,
      body,
      priority,
      status: 'جديد',
      letterNumber,
      letterDate,
      fileName: fileName || undefined,
      fileSize: fileName ? fileSize : undefined,
      fileDataUrl: fileDataUrl || undefined,
      notes: notes.trim() || undefined
    });

    setIsNewDispatchOpen(false);
    setSubject('');
    setBody('');
    setFileName('');
    setFileDataUrl('');
    setNotes('');
  };

  // Filtered dispatches list
  const filteredDispatches = ministerialDispatches.filter((disp) => {
    if (selectedDirection !== 'all' && disp.direction !== selectedDirection) return false;
    if (selectedPriority !== 'all' && disp.priority !== selectedPriority) return false;
    if (selectedStatus !== 'all' && disp.status !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const inSubj = disp.subject.toLowerCase().includes(q);
      const inBody = disp.body.toLowerCase().includes(q);
      const inLetter = disp.letterNumber.toLowerCase().includes(q);
      const inFrom = disp.fromDepartmentName.toLowerCase().includes(q);
      const inTo = disp.toDepartmentName.toLowerCase().includes(q);
      if (!inSubj && !inBody && !inLetter && !inFrom && !inTo) return false;
    }

    return true;
  });

  const getPriorityBadge = (p: DispatchPriority) => {
    switch (p) {
      case 'سري للغاية':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300';
      case 'فوري':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300';
      case 'عاجل':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300';
    }
  };

  const getStatusBadge = (s: DispatchStatus) => {
    switch (s) {
      case 'تمت المصادقة':
      case 'مكتمل':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300';
      case 'قيد المراجعة':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300';
      case 'جديد':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300';
      case 'مرفوض':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300';
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            <ArrowRightLeft className="w-4 h-4" />
            <span>منظومة التراسل والربط الشبكي الحكومي الموحد</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            المراسلات المتبادلة بين الوزارات ومدير الأجندة
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            إرسال واستقبال المذكرات الرسمية والمقترحات والكتب العاجلة بين الوزارات القطاعية ومجلس الوزراء (مدير الأجندة)، مع تتبع حالة المراجعة والمصادقة وتأكيد الاستلام.
          </p>
        </div>

        <button
          onClick={() => setIsNewDispatchOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>إرسال مراسلة / وثيقة جديدة</span>
        </button>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>البحث والفلترة في المراسلات والوثائق المرسلة:</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredDispatches.length} مراسلة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              اتجاه المراسلة:
            </label>
            <select
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="all">كافة الاتجاهات (صادرة وواردة)</option>
              <option value="من الوزارة إلى مجلس الوزراء">من الوزارة إلى مجلس الوزراء (مدير الأجندة)</option>
              <option value="من مجلس الوزراء إلى الوزارة">من مجلس الوزراء إلى الوزارة</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              درجة الأسبقية / السرية:
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="all">كافة درجات الأسبقية</option>
              <option value="عادي">عادي</option>
              <option value="عاجل">عاجل</option>
              <option value="فوري">فوري</option>
              <option value="سري للغاية">سري للغاية</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              حالة المعالجة:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="all">كافة الحالات</option>
              <option value="جديد">جديد</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="تمت المصادقة">تمت المصادقة</option>
              <option value="مكتمل">مكتمل</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              بحث في الموضوع أو رقم الكتاب:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالنص..."
                className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Dispatches Feed */}
      <div className="space-y-3">
        {filteredDispatches.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">لا توجد مراسلات مطابقة لشروط البحث.</p>
          </div>
        ) : (
          filteredDispatches.map((disp) => {
            return (
              <div
                key={disp.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      العدد: {disp.letterNumber}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-500">التاريخ: {disp.letterDate}</span>
                    <span
                      className={`px-2 py-0.5 rounded-sm font-bold text-[10px] border ${getPriorityBadge(
                        disp.priority
                      )}`}
                    >
                      {disp.priority}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-sm font-bold text-[10px] border ${getStatusBadge(
                        disp.status
                      )}`}
                    >
                      {disp.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    {disp.direction}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {disp.subject}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {disp.body}
                    </p>
                  </div>

                  <button
                    onClick={() => setPreviewDispatch(disp)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>عرض التفاصيل</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-slate-400">من:</span>{' '}
                      <strong className="text-slate-700 dark:text-slate-300">{disp.fromDepartmentName}</strong>{' '}
                      <span className="text-slate-400">({disp.senderUserName})</span>
                    </div>
                    <div>
                      <span className="text-slate-400">إلى:</span>{' '}
                      <strong className="text-emerald-700 dark:text-emerald-400">{disp.toDepartmentName}</strong>
                    </div>
                  </div>

                  {disp.fileName && (
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-mono">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{disp.fileName}</span>
                      <span>({disp.fileSize || '2 MB'})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Dispatch Modal */}
      {isNewDispatchOpen && (
        <Modal
          isOpen={isNewDispatchOpen}
          onClose={() => setIsNewDispatchOpen(false)}
          title="إرسال وثيقة / مراسلة رسمية جديدة"
          subtitle="منظومة الربط والتخاطب بين الوزارات والأمانة العامة لمجلس الوزراء"
          maxWidth="2xl"
        >
          <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs text-right">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  اتجاه المراسلة: *
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as DispatchDirection)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                >
                  <option value="من الوزارة إلى مجلس الوزراء">
                    من الوزارة ({currentDepartment?.name}) إلى مجلس الوزراء (مدير الأجندة)
                  </option>
                  {canManageAgenda && (
                    <option value="من مجلس الوزراء إلى الوزارة">
                      من مجلس الوزراء إلى إحدى الوزارات
                    </option>
                  )}
                </select>
              </div>

              {direction === 'من مجلس الوزراء إلى الوزارة' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    الوزارة / الجهة المستلمة: *
                  </label>
                  <select
                    required
                    value={targetDeptId}
                    onChange={(e) => setTargetDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="">-- اختر الوزارة المستلمة --</option>
                    {departments
                      .filter(d => d.id !== 'dept-cabinet')
                      .map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.nameEn})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  درجة الأسبقية والسرية: *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as DispatchPriority)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                >
                  <option value="عادي">عادي</option>
                  <option value="عاجل">عاجل</option>
                  <option value="فوري">فوري (توجيه فوري)</option>
                  <option value="سري للغاية">سري للغاية</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  رقم الكتاب الرسمي الصادر: *
                </label>
                <input
                  type="text"
                  required
                  value={letterNumber}
                  onChange={(e) => setLetterNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  تاريخ الكتاب: *
                </label>
                <input
                  type="date"
                  required
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                الموضوع / عنوان المراسلة: *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: مذكرة عرض مشروع الاستثمار المشترك على جدول أعمال المجلس"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                نص المذكرة / المراسلة الرسمية: *
              </label>
              <textarea
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="اكتب تفاصيل المذكرة والطلب المرفوع لمجلس الوزراء أو التوجيه الصادر للوزارة..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs leading-relaxed"
              />
            </div>

            {/* File upload */}
            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40">
              <UploadCloud className="w-6 h-6 mx-auto text-emerald-600" />
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                إرفاق الوثيقة أو المذكرة الرسمية (PDF أو صورة)
              </div>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="text-xs text-slate-500 mx-auto block file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
              />
              {fileName && (
                <div className="text-[11px] text-emerald-700 font-bold">
                  ✓ تم تجهيز الملف: {fileName} ({fileSize})
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewDispatchOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال وتوثيق المراسلة الآن</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Dispatch Modal */}
      {previewDispatch && (
        <Modal
          isOpen={!!previewDispatch}
          onClose={() => setPreviewDispatch(null)}
          title={`المراسلة الرسمية: ${previewDispatch.letterNumber}`}
          subtitle={`التاريخ: ${previewDispatch.letterDate} · الأسبقية: [${previewDispatch.priority}]`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs text-right">
            
            {/* Metadata Header */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-500 block">الجهة الصادرة:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{previewDispatch.fromDepartmentName}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{previewDispatch.fromDepartmentNameEn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">الجهة الموجه إليها:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{previewDispatch.toDepartmentName}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{previewDispatch.toDepartmentNameEn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">المرسل والمحرر:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{previewDispatch.senderUserName} ({previewDispatch.senderRole})</span>
              </div>
              <div>
                <span className="text-slate-500 block">الحالة الحالية:</span>
                <span className={`inline-block px-2 py-0.5 rounded-sm font-bold border mt-0.5 ${getStatusBadge(previewDispatch.status)}`}>
                  {previewDispatch.status}
                </span>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <span className="text-slate-500 font-bold block">الموضوع:</span>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-sm text-slate-900 dark:text-white">
                {previewDispatch.subject}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-1">
              <span className="text-slate-500 font-bold block">نص المذكرة / المراسلة:</span>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg leading-relaxed text-slate-800 dark:text-slate-200 font-serif text-sm">
                {previewDispatch.body}
              </div>
            </div>

            {/* File attachment preview if available */}
            {previewDispatch.fileName && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="font-bold text-emerald-950 dark:text-emerald-200">{previewDispatch.fileName}</div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">{previewDispatch.fileSize || '1.8 MB'}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (previewDispatch.fileDataUrl) {
                      const link = window.document.createElement('a');
                      link.href = previewDispatch.fileDataUrl;
                      link.download = previewDispatch.fileName || 'Ministerial_Dispatch.pdf';
                      link.click();
                    } else {
                      alert(`جارٍ تنزيل المرفق: ${previewDispatch.fileName}`);
                    }
                  }}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold text-[11px] flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل المرفق</span>
                </button>
              </div>
            )}

            {/* Workflow actions for Agenda Director / Admin */}
            {canManageAgenda && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  إجراءات مدير الأجندة / الأمانة العامة:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      updateMinisterialDispatchStatus(previewDispatch.id, 'قيد المراجعة');
                      setPreviewDispatch({ ...previewDispatch, status: 'قيد المراجعة' });
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs"
                  >
                    تحديد كـ "قيد المراجعة"
                  </button>
                  <button
                    onClick={() => {
                      updateMinisterialDispatchStatus(previewDispatch.id, 'تمت المصادقة');
                      setPreviewDispatch({ ...previewDispatch, status: 'تمت المصادقة' });
                    }}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-semibold text-xs"
                  >
                    المصادقة وإدراجها بجدول الأعمال
                  </button>
                  <button
                    onClick={() => {
                      confirmDispatchReceipt(previewDispatch.id);
                      setPreviewDispatch({ ...previewDispatch, status: 'مكتمل' });
                    }}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md font-semibold text-xs"
                  >
                    تأكيد الاستلام والإغلاق
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewDispatch(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

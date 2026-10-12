import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Clock,
  Download,
  Printer,
  RotateCcw,
  Activity,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  Eye,
  FileCheck2,
  Trash2,
  Link2
} from 'lucide-react';
import { AuditLog, AuditActionType } from '../../types';
import { Modal } from '../common/Modal';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs, users, documents, decisions, currentUser } = useApp();

  // Search & Filter parameters
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  const [documentSearchTerm, setDocumentSearchTerm] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [generalSearch, setGeneralSearch] = useState<string>('');

  // Selected Log Details Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const actionTypes: AuditActionType[] = [
    'تسجيل دخول',
    'تبديل مستخدم',
    'إضافة وثيقة',
    'تعديل وثيقة',
    'حذف وثيقة',
    'استعادة وثيقة',
    'إضافة قرار',
    'تعديل قرار',
    'حذف قرار',
    'استعادة قرار',
    'اطلاع على وثيقة',
    'تأكيد استلام',
    'ربط قرار',
    'إلغاء ربط قرار',
    'إرسال مراسلة للوزارة',
    'إرسال مراسلة لمجلس الوزراء',
    'تحديث جلسة',
    'إدارة حكومات',
    'إدارة مستخدمين',
    'حذف نهائي'
  ];

  // Filtered Logs
  const filteredLogs = auditLogs.filter((log) => {
    // User filter
    if (selectedUserFilter !== 'all' && log.userId !== selectedUserFilter) {
      return false;
    }

    // Action filter
    if (selectedActionFilter !== 'all' && log.actionType !== selectedActionFilter) {
      return false;
    }

    // Entity filter
    if (selectedEntityFilter !== 'all' && log.entityType !== selectedEntityFilter) {
      return false;
    }

    // Date range
    const logDate = log.timestamp.split(' ')[0];
    if (dateFrom && logDate < dateFrom) return false;
    if (dateTo && logDate > dateTo) return false;

    // Search by document
    if (documentSearchTerm.trim()) {
      const q = documentSearchTerm.toLowerCase();
      const inDocId = log.entityId?.toLowerCase().includes(q);
      const inDocTitle = log.entityTitle?.toLowerCase().includes(q);
      const inDetails = log.details.toLowerCase().includes(q);
      if (!inDocId && !inDocTitle && !inDetails) return false;
    }

    // General text search
    if (generalSearch.trim()) {
      const q = generalSearch.toLowerCase();
      const inUser = log.userName.toLowerCase().includes(q);
      const inDept = log.departmentName.toLowerCase().includes(q);
      const inDetails = log.details.toLowerCase().includes(q);
      const inTitle = log.entityTitle?.toLowerCase().includes(q);
      const inIp = log.ipAddress.toLowerCase().includes(q);
      if (!inUser && !inDept && !inDetails && !inTitle && !inIp) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setSelectedUserFilter('all');
    setSelectedActionFilter('all');
    setSelectedEntityFilter('all');
    setDocumentSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setGeneralSearch('');
  };

  const exportCsv = () => {
    const headers = ['المعرف', 'التاريخ والوقت', 'المستخدم', 'الرتبة', 'الدائرة', 'نوع الحركة', 'نوع الكيان', 'العنوان', 'التفاصيل', 'عنوان IP'];
    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.departmentName}"`,
      `"${l.actionType}"`,
      `"${l.entityType}"`,
      `"${(l.entityTitle || '').replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cabinet_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getActionBadgeColor = (action: AuditActionType) => {
    if (action.includes('حذف') || action === 'حذف نهائي') {
      return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300';
    }
    if (action.includes('استعادة') || action.includes('تأكيد استلام')) {
      return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300';
    }
    if (action.includes('إضافة') || action.includes('ربط')) {
      return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300';
    }
    if (action.includes('تعديل') || action.includes('تحديث')) {
      return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300';
    }
    if (action.includes('اطلاع')) {
      return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300';
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>نظام الرقابة والأمن السيبراني للأمانة العامة</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            سجل حركات وعمليات المستخدمين (Audit Logs)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            توثيق كامل وشامل لكافة أنشطة المستخدمين، بما يشمل الإضافة، التعديل، الحذف والاستعادة، تسجيلات الاطلاع، تأكيدات الاستلام، والربط التشريعي مع إمكانية التصفية بالوثيقة أو بالمستخدم.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير CSV ({filteredLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Analytics Mini-Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold">إجمالي الحركات المسجلة</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {auditLogs.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">عمليات موثقة بالنظام</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-emerald-600 font-semibold">تأكيدات الاستلام الرسمي</div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
            {auditLogs.filter(l => l.actionType === 'تأكيد استلام').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">إقرارات موثقة من الوزارات</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-purple-600 font-semibold">عمليات الاطلاع على الوثائق</div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1 font-mono">
            {auditLogs.filter(l => l.actionType === 'اطلاع على وثيقة').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">قراءات مسجلة وموسومة</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-rose-600 font-semibold">حركات الحذف والأرشفة</div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1 font-mono">
            {auditLogs.filter(l => l.actionType.includes('حذف')).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">محذوفات مؤمنة للاستعادة</div>
        </div>
      </div>

      {/* Advanced Filter Box (البحث عن طريق المستخدم أو عن طريق الوثيقة) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>فلترة وتخصيص سجل الـ Log:</span>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة تعيين الفلاتر</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* SEARCH BY USER (البحث عن طريق المستخدم) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>البحث عن طريق المستخدم:</span>
            </label>
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="all">كافة المستخدمين ({users.length})</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} — [{u.role}]
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH BY DOCUMENT (البحث عن طريق الوثيقة) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>البحث عن طريق الوثيقة أو القرار:</span>
            </label>
            <input
              type="text"
              value={documentSearchTerm}
              onChange={(e) => setDocumentSearchTerm(e.target.value)}
              placeholder="اكتب رقم القرار أو عنوان الوثيقة..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          {/* FILTER BY ACTION TYPE */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>نوع الحركة / العملية:</span>
            </label>
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="all">كافة أنواع الحركات</option>
              {actionTypes.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* FILTER BY ENTITY TYPE */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">تصنيف الكيان:</label>
            <select
              value={selectedEntityFilter}
              onChange={(e) => setSelectedEntityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="all">كافة الكيانات</option>
              <option value="قرار">قرارات وزارية</option>
              <option value="توجيه">توجيهات (رقم 0)</option>
              <option value="وثيقة">وثائق عامة وجداول</option>
              <option value="جلسة">جلسات المجلس</option>
              <option value="مراسلة">مراسلات وزارية</option>
              <option value="مستخدم">حسابات مستخدمين</option>
            </select>
          </div>

          {/* DATE FROM */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">من تاريخ:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          {/* DATE TO */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">إلى تاريخ:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          {/* GENERAL SEARCH TERM */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">بحث نصي حر في السجل:</label>
            <div className="relative">
              <input
                type="text"
                value={generalSearch}
                onChange={(e) => setGeneralSearch(e.target.value)}
                placeholder="ابحث بالاسم، الدائرة، التفاصيل، أو عنوان IP..."
                className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200">
            نتائج السجل المفلترة ({filteredLogs.length} حركة)
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            يتم التحديث والتسجيل الفوري لكل عملية
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-bold">الوقت والتاريخ</th>
                <th className="px-4 py-3 font-bold">المستخدم المنفذ</th>
                <th className="px-4 py-3 font-bold">نوع الحركة</th>
                <th className="px-4 py-3 font-bold">الكيان والعنوان المتأثر</th>
                <th className="px-4 py-3 font-bold">تفاصيل الحركة</th>
                <th className="px-4 py-3 font-bold">عنوان IP</th>
                <th className="px-4 py-3 font-bold text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    لا توجد حركات مسجلة تطابق شروط الفلترة المحددة.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.timestamp.split(' ')[0]}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {log.timestamp.split(' ')[1] || ''}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {log.userName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">[{log.userRole}]</span>
                          <span>·</span>
                          <span>{log.departmentName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${getActionBadgeColor(
                            log.actionType
                          )}`}
                        >
                          {log.actionType}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500">
                            {log.entityType}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {log.entityTitle || log.entityId || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-md">
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                          {log.details}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {log.ipAddress}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                        >
                          تفاصيل
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`تفاصيل حركة السجل: ${selectedLog.actionType}`}
          subtitle={`المعرف المرجعي: ${selectedLog.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-right">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-500 block">التاريخ والوقت:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{selectedLog.timestamp}</span>
              </div>
              <div>
                <span className="text-slate-500 block">عنوان IP:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{selectedLog.ipAddress}</span>
              </div>
              <div>
                <span className="text-slate-500 block">المستخدم:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.userName} ({selectedLog.userRole})</span>
              </div>
              <div>
                <span className="text-slate-500 block">الدائرة:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.departmentName}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block font-bold">الكيان المتأثر:</span>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedLog.entityTitle || 'غير معنون'}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  نوع الكيان: {selectedLog.entityType} · المعرف: {selectedLog.entityId || '—'}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block font-bold">شرح وتفاصيل الحركة:</span>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 leading-relaxed font-serif text-sm">
                {selectedLog.details}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

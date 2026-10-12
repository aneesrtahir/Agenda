import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Mail,
  CheckCheck,
  Building2,
  FileCheck2,
  FileText,
  Clock,
  ShieldAlert,
  Lock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { CabinetDocument, Decision, DepartmentNotification } from '../../types';
import { DocumentPreviewModal } from '../documents/DocumentPreviewModal';

export const IncomingDocuments: React.FC = () => {
  const {
    currentDepartment,
    currentUser,
    documents,
    decisions,
    documentTypes,
    sessions,
    departmentNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    canUserAccessDocument
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'unread' | 'decision' | 'document'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewItem, setPreviewItem] = useState<CabinetDocument | Decision | null>(null);

  // Department name
  const deptName = currentDepartment?.name || 'الدائرة الحكومية';

  // Filtered notifications
  const filteredNotifs = departmentNotifications.filter(notif => {
    if (filterType === 'unread' && notif.isRead) return false;
    if (filterType === 'decision' && notif.type !== 'decision') return false;
    if (filterType === 'document' && notif.type !== 'document') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const inSubject = notif.subject.toLowerCase().includes(q);
      const inDocType = notif.documentTypeName.toLowerCase().includes(q);
      const inDecNum = notif.decisionNumber?.toLowerCase().includes(q);
      const inLetterNum = notif.letterNumber?.toLowerCase().includes(q);
      if (!inSubject && !inDocType && !inDecNum && !inLetterNum) return false;
    }

    return true;
  });

  const handleOpenPreview = (notif: DepartmentNotification) => {
    markNotificationAsRead(notif.documentId);
    if (notif.type === 'decision') {
      const foundDec = decisions.find(d => d.id === notif.documentId);
      if (foundDec) setPreviewItem(foundDec);
    } else {
      const foundDoc = documents.find(d => d.id === notif.documentId);
      if (foundDoc) setPreviewItem(foundDoc);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Department Badge & Notification counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                المخاطبات والوثائق الموجهة لدائرتكم
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{deptName}</span>
                <span>·</span>
                <span>الوثائق والقرارات الصادرة التي تقع دائرتكم ضمن الجهات المرسل إليها</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>تحديد الكل كمقروء</span>
            </button>
          )}
        </div>
      </div>

      {/* Unread Alert Banner */}
      {unreadNotificationsCount > 0 ? (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                يوجد ({unreadNotificationsCount}) وثيقة/قرار وارد جديد بانتظار اطلاع دائرتكم!
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                تم توجيه هذه المخاطبات والقرارات رسمياً من قبل مجلس الوزراء إلى {deptName} للتنفيذ أو الإحاطة.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterType('unread')}
            className="text-xs font-bold text-amber-900 dark:text-amber-200 hover:underline shrink-0"
          >
            عرض غير المقروءة
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم الاطلاع على كافة المخاطبات والقرارات الواردة إلى {deptName}. لا توجد تنبيهات معلقة.</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            كافة الوارد ({departmentNotifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterType === 'unread'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>غير مقروء</span>
            {unreadNotificationsCount > 0 && (
              <span className="font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterType('decision')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
              filterType === 'decision'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            القرارات الواردة
          </button>
          <button
            onClick={() => setFilterType('document')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
              filterType === 'document'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            الكتب والمحاضر
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="بحث في المخاطبات الواردة..."
          className="w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
        />
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
            <Mail className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="font-bold text-slate-700 dark:text-slate-300">
              لا توجد مخاطبات أو قرارات واردة مطابقة للاختيار
            </div>
            <p className="text-xs text-slate-400">
              عند قيام الأمانة العامة لمجلس الوزراء بتوجيه وثيقة أو قرار إلى {deptName}، ستظهر التنبيهات هنا فورياً.
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleOpenPreview(notif)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                !notif.isRead
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!notif.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" title="تنبيه وارد جديد" />
                  )}
                  <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {notif.documentTypeName}
                  </span>

                  {notif.decisionNumber && (
                    <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      رقم {notif.decisionNumber}
                    </span>
                  )}

                  {notif.decisionType && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        notif.decisionType === 'سري-وطارئ'
                          ? 'bg-rose-900 text-white'
                          : notif.decisionType === 'سري'
                          ? 'bg-purple-900 text-white'
                          : notif.decisionType === 'طارئ'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-800 text-white'
                      }`}
                    >
                      {notif.decisionType}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{notif.createdAt}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                {notif.subject}
              </h3>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {notif.letterNumber && (
                    <span className="font-mono">
                      كتاب رسمي: <strong>{notif.letterNumber}</strong>
                    </span>
                  )}
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    مرسل ومصرح لدائرتكم
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:underline">
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة الوثيقة والملف</span>
                </div>
              </div>
            </div>
          ))
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

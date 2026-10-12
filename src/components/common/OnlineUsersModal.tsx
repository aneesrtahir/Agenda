import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  X,
  ShieldCheck,
  Building2,
  Clock,
  Radio,
  Monitor,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { OnlineUserSession } from '../../types';

export const OnlineUsersModal: React.FC = () => {
  const {
    onlineSessions,
    onlineUsersCount,
    isOnlineUsersModalOpen,
    setIsOnlineUsersModalOpen,
    currentUser
  } = useApp();

  if (!isOnlineUsersModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  المستخدمون المتواجدون حالياً في النظام
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{onlineUsersCount} متواجدون الآن</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                متابعة الجلسات النشطة للمسؤولين وممثلي الوزارات المتصلين بالبوابة الحكومية
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOnlineUsersModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Active Users List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                يتم تحديث قائمة المتواجدين تلقائياً عبر بروتوكول تتبع الجلسات المؤمنة للأمانة العامة.
              </span>
            </div>
            <span className="text-[11px] font-mono opacity-80">زمن الاستجابة: 24ms</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
            {onlineSessions.map((session: OnlineUserSession) => {
              const isSelf = session.userId === currentUser.id;
              return (
                <div
                  key={session.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isSelf ? 'bg-emerald-50/40 dark:bg-emerald-950/30' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* User info */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-xs">
                        {session.avatarUrl ? (
                          <img
                            src={session.avatarUrl}
                            alt={session.userName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          session.userName.charAt(0)
                        )}
                      </div>
                      <span className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {session.userName}
                        </span>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white font-mono">
                            حسابك الحالي
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          session.userRole === 'Admin'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : session.userRole === 'مدير الأجندة'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        }`}>
                          {session.userRole}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.departmentName}</span>
                          {session.departmentNameEn && (
                            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                              ({session.departmentNameEn})
                            </span>
                          )}
                        </span>

                        <span>·</span>

                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Monitor className="w-3 h-3 text-slate-400" />
                          <span>{session.device}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Location */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 text-xs border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{session.lastActive}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>متصل: {session.onlineSince}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      IP: {session.ipAddress}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام مراقبة التواجد موصول بمركز البيانات الحكومي المؤمن</span>
          </div>

          <button
            onClick={() => setIsOnlineUsersModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};

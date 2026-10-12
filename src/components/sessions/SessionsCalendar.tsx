import React, { useState, useMemo } from 'react';
import { CabinetSession } from '../../types';
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  CalendarDays
} from 'lucide-react';

interface SessionsCalendarProps {
  sessions: CabinetSession[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}

export const SessionsCalendar: React.FC<SessionsCalendarProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession
}) => {
  // Current viewed month and year
  const [currentDate, setCurrentDate] = useState(() => {
    // Default to the month of the latest session or today
    const validDates = sessions.map(s => s.sessionDate).filter(Boolean).sort();
    const lastDate = validDates[validDates.length - 1];
    return lastDate ? new Date(lastDate) : new Date();
  });

  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(() => {
    const active = sessions.find(s => s.id === selectedSessionId);
    return active ? active.sessionDate : null;
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Month names in Arabic
  const arabicMonths = [
    'كانون الثاني (يناير)',
    'شباط (فبراير)',
    'آذار (مارس)',
    'نيسان (أبريل)',
    'أيار (مايو)',
    'حزيران (يونيو)',
    'تموز (يوليو)',
    'آب (أغسطس)',
    'أيلول (سبتمبر)',
    'تشرين الأول (أكتوبر)',
    'تشرين الثاني (نوفمبر)',
    'كانون الأول (ديسمبر)'
  ];

  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  // Sessions map by YYYY-MM-DD
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, CabinetSession[]>();
    sessions.forEach(sess => {
      if (!sess.sessionDate) return;
      const existing = map.get(sess.sessionDate) || [];
      existing.push(sess);
      map.set(sess.sessionDate, existing);
    });
    return map;
  }, [sessions]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Sessions for the currently selected day
  const sessionsOnSelectedDay = selectedDayStr ? sessionsByDate.get(selectedDayStr) || [] : [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4 text-right">
      
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>تقويم جلسات مجلس الوزراء</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
                {sessions.length} جلسة
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              استعراض الجلسات المنعقدة والقادمة بحسب الأيام مع إمكانية النقر لاستعراض التفاصيل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            اليوم
          </button>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="الشهر السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-2 min-w-[140px] text-center font-mono">
              {arabicMonths[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="الشهر القادم"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-slate-500 dark:text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
        {arabicDays.map((day, idx) => (
          <div key={idx} className={idx === 5 || idx === 6 ? 'text-amber-600 dark:text-amber-400' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {/* Empty slots before first day */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="min-h-[56px] sm:min-h-[64px] bg-slate-50/40 dark:bg-slate-900/40 rounded-lg border border-transparent"
          />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const daySessions = sessionsByDate.get(dayStr) || [];
          const hasSessions = daySessions.length > 0;
          const isSelected = selectedDayStr === dayStr;
          const isToday =
            new Date().toISOString().split('T')[0] === dayStr;

          return (
            <button
              key={dayStr}
              type="button"
              onClick={() => {
                setSelectedDayStr(dayStr);
                if (daySessions.length > 0) {
                  onSelectSession(daySessions[0].id);
                }
              }}
              className={`min-h-[58px] sm:min-h-[68px] p-1.5 rounded-lg border flex flex-col justify-between text-right transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                  : hasSessions
                  ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-amber-500 text-white shadow-xs'
                      : isSelected
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {dayNum}
                </span>

                {hasSessions && (
                  <span className="text-[10px] font-mono px-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                    {daySessions.length}
                  </span>
                )}
              </div>

              {/* Badges for sessions */}
              <div className="w-full space-y-0.5 mt-1 overflow-hidden">
                {daySessions.slice(0, 2).map(s => (
                  <div
                    key={s.id}
                    className={`text-[10px] px-1 py-0.5 rounded truncate font-medium ${
                      s.sessionType === 'طارئة'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        : s.sessionType === 'استثنائية'
                        ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                    }`}
                    title={`الجلسة رقم (${s.sessionNumber}) - ${s.sessionType}`}
                  >
                    جلسة ({s.sessionNumber})
                  </div>
                ))}
                {daySessions.length > 2 && (
                  <div className="text-[9px] text-slate-400 font-mono text-center">
                    +{daySessions.length - 2} المزيد
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Drawer / Summary */}
      {selectedDayStr && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                جلسات يوم ({selectedDayStr})
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {sessionsOnSelectedDay.length} جلسات مسجلة
            </span>
          </div>

          {sessionsOnSelectedDay.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              لا توجد جلسات مسجلة في هذا اليوم. يمكنك اختيار يوم آخر يحتوي على علامة مميزة.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {sessionsOnSelectedDay.map(s => {
                const isCurrentActive = selectedSessionId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isCurrentActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 dark:border-emerald-500 shadow-2xs font-semibold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">
                        الجلسة رقم ({s.sessionNumber})
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        s.sessionType === 'طارئة'
                          ? 'bg-amber-100 text-amber-800'
                          : s.sessionType === 'استثنائية'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {s.sessionType}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>الحالة: {s.status}</span>
                    </div>

                    {s.location && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{s.location}</span>
                      </div>
                    )}

                    <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>عرض تفاصيل الجلسة وأجندتها</span>
                      <span>←</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface AnalyticsWidgetsProps {
  currentYearNumber: number;
}

export const AnalyticsWidgets: React.FC<AnalyticsWidgetsProps> = ({ currentYearNumber }) => {
  const { sessions, decisions, isDarkMode } = useApp();

  // Arabic month labels
  const monthLabels = [
    'يناير (1)',
    'فبراير (2)',
    'مارس (3)',
    'أبريل (4)',
    'مايو (5)',
    'يونيو (6)',
    'يوليو (7)',
    'أغسطس (8)',
    'سبتمبر (9)',
    'أكتوبر (10)',
    'نوفمبر (11)',
    'ديسمبر (12)'
  ];

  // 1. Monthly Sessions and Decisions breakdown for the specified year
  const monthlyData = useMemo(() => {
    // Array of 12 months initialized
    const data = monthLabels.map((name, index) => ({
      monthIndex: index + 1,
      monthName: name,
      sessionsCount: 0,
      decisionsCount: 0
    }));

    sessions.forEach(sess => {
      if (!sess.sessionDate) return;
      const parts = sess.sessionDate.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (y === currentYearNumber && m >= 1 && m <= 12) {
        data[m - 1].sessionsCount += 1;
      }
    });

    decisions.forEach(dec => {
      const dateStr = dec.letterDate || dec.createdAt;
      if (!dateStr) return;
      const parts = dateStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (y === currentYearNumber && m >= 1 && m <= 12) {
        data[m - 1].decisionsCount += 1;
      }
    });

    return data;
  }, [sessions, decisions, currentYearNumber]);

  // 2. Decision Types distribution for the current year
  const decisionTypeData = useMemo(() => {
    const counts: Record<string, number> = {
      'قرار عادي': 0,
      'سري': 0,
      'طارئ': 0,
      'سري-وطارئ': 0
    };

    decisions.forEach(dec => {
      const dateStr = dec.letterDate || dec.createdAt;
      if (dateStr) {
        const y = parseInt(dateStr.split('-')[0], 10);
        if (y !== currentYearNumber) return;
      }
      if (counts[dec.decisionType] !== undefined) {
        counts[dec.decisionType] += 1;
      } else {
        counts[dec.decisionType] = 1;
      }
    });

    return [
      { name: 'قرار عادي', value: counts['قرار عادي'] || 0, color: '#047857' }, // Emerald 700
      { name: 'سري', value: counts['سري'] || 0, color: '#7e22ce' }, // Purple 700
      { name: 'طارئ', value: counts['طارئ'] || 0, color: '#d97706' }, // Amber 600
      { name: 'سري-وطارئ', value: counts['سري-وطارئ'] || 0, color: '#be123c' } // Rose 700
    ].filter(item => item.value > 0);
  }, [decisions, currentYearNumber]);

  // 3. Execution Status distribution
  const executionStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      'تم التنفيذ': 0,
      'قيد المتابعة': 0,
      'مستمر': 0,
      'معلق': 0
    };

    decisions.forEach(dec => {
      const dateStr = dec.letterDate || dec.createdAt;
      if (dateStr) {
        const y = parseInt(dateStr.split('-')[0], 10);
        if (y !== currentYearNumber) return;
      }
      const st = dec.executionStatus;
      if (counts[st] !== undefined) {
        counts[st] += 1;
      }
    });

    return [
      { name: 'تم التنفيذ', value: counts['تم التنفيذ'], color: '#10b981' },
      { name: 'قيد المتابعة', value: counts['قيد المتابعة'], color: '#3b82f6' },
      { name: 'مستمر', value: counts['مستمر'], color: '#f59e0b' },
      { name: 'معلق', value: counts['معلق'], color: '#ef4444' }
    ];
  }, [decisions, currentYearNumber]);

  const totalYearSessions = monthlyData.reduce((acc, m) => acc + m.sessionsCount, 0);
  const totalYearDecisions = monthlyData.reduce((acc, m) => acc + m.decisionsCount, 0);

  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-4 text-right">
      
      {/* Widget Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-linear-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800 border border-emerald-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>لوحة البيانات المرئية التفاعلية (Recharts Dashboard Widgets)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                سنة {currentYearNumber}
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              تحليل بياني شهري لوتيرة انعقاد الجلسات وإصدار القرارات وتوزيع مستويات السرية وحالة التنفيذ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-slate-500">جلسات السنة: </span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{totalYearSessions}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-slate-500">قرارات وتوجيهات: </span>
            <strong className="text-blue-700 dark:text-blue-400 font-bold">{totalYearDecisions}</strong>
          </div>
        </div>
      </div>

      {/* Grid of Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Monthly Sessions & Decisions Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                عدد الجلسات والقرارات شهرياً لسنة {currentYearNumber}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">توزيع زمني</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="monthName"
                  tick={{ fill: axisColor, fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: axisColor, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    direction: 'rtl',
                    textAlign: 'right'
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} ${name === 'sessionsCount' ? 'جلسة' : 'قرار'}`,
                    name === 'sessionsCount' ? 'الجلسات المنعقدة' : 'القرارات والتوجيهات'
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="left"
                  formatter={(value) => (
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {value === 'sessionsCount' ? 'عدد الجلسات' : 'عدد القرارات الصادرة'}
                    </span>
                  )}
                />
                <Bar
                  dataKey="sessionsCount"
                  fill="#047857"
                  name="sessionsCount"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
                <Bar
                  dataKey="decisionsCount"
                  fill="#2563eb"
                  name="decisionsCount"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Decisions Type Distribution Pie Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  توزيع أنواع القرارات الوزارية
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">طبيعة القرار</span>
            </div>

            {decisionTypeData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                لا توجد قرارات مسجلة لهذه السنة بعد.
              </div>
            ) : (
              <div className="h-60 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={decisionTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {decisionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        direction: 'rtl',
                        textAlign: 'right'
                      }}
                      formatter={(val: any) => [`${val} قرار`, 'العدد']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick Legend Chips */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {decisionTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

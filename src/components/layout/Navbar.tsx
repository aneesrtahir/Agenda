import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Moon,
  ShieldAlert,
  UserCheck,
  Palette,
  Menu,
  X,
  Database,
  Bell,
  Users
} from 'lucide-react';
import { ThemeColor, UserRole } from '../../types';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) => {
  const {
    currentUser,
    switchUserRole,
    isDarkMode,
    toggleDarkMode,
    themeColor,
    setThemeColor,
    setCurrentTab,
    unreadNotificationsCount,
    departmentNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedSessionId,
    onlineUsersCount,
    setIsOnlineUsersModalOpen
  } = useApp();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const themeOptions: { id: ThemeColor; label: string; colorClass: string }[] = [
    { id: 'emerald', label: 'أخضر وزاري', colorClass: 'bg-emerald-600' },
    { id: 'navy', label: 'أزرق رئاسي', colorClass: 'bg-blue-800' },
    { id: 'burgundy', label: 'عنابي رسمي', colorClass: 'bg-rose-900' },
    { id: 'slate', label: 'رمادي وذهبي', colorClass: 'bg-slate-800' }
  ];

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'Admin', title: 'مدير النظام (Admin)', desc: 'كامل الصلاحيات وإدارة النظام والمستخدمين وتوليد الكود' },
    { role: 'مسؤول الحسابات', title: 'مسؤول الحسابات (Account Admin)', desc: 'إدارة وتفعيل وقفل الحسابات وتغيير كلمات المرور وتعيين الصلاحيات' },
    { role: 'مدير الأجندة', title: 'مدير الأجندة', desc: 'إدارة الجلسات والوثائق وإصدار القرارات' },
    { role: 'مساعد', title: 'مساعد', desc: 'إدخال المسودات والمذكرات والملحقات' },
    { role: 'مستخدم', title: 'مستخدم عادي', desc: 'استعراض الأجندة والبحث في الأرشيف' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark & Seal */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="القائمة الجانبية"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-600/30 shadow-xs shrink-0 bg-slate-900 flex items-center justify-center">
                <img
                  src="/src/assets/images/cabinet_seal_emblem_1791711513364.jpg"
                  alt="ختم مجلس الوزراء الرسمي"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to stylized SVG seal
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  أجندة مجلس الوزراء
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  الأمانة العامة · مركز توثيق الجلسات والقرارات
                </div>
              </div>
            </div>
          </div>

          {/* Zone 2: Fast Navigation Actions */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <button
              onClick={() => setCurrentTab('csharp-sql')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="توليد كود C# MVC وسكربت SQL Server"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>C# MVC & SQL Server</span>
            </button>
          </div>

          {/* Zone 3: Controls (Online Users, Notifications, Role Switcher, Theme, Dark Mode, Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Live Online Users Indicator Button (اظهار عدد المتواجدين في الموقع) */}
            <button
              onClick={() => setIsOnlineUsersModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer shadow-2xs group"
              title="عرض المستخدمين المتواجدين حالياً في المنظومة"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold font-mono">
                {onlineUsersCount}
              </span>
              <span className="text-[11px] font-medium hidden sm:inline">
                متواجد الآن
              </span>
            </button>

            {/* Real-time Notifications Bell with Interactive Dropdown (نظام إشعارات فورية في شريط الأدوات العلوي) */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifMenuOpen(!isNotifMenuOpen);
                  setIsThemeMenuOpen(false);
                  setIsRoleMenuOpen(false);
                }}
                className={`relative p-2 rounded-lg transition-colors ${
                  isNotifMenuOpen
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={`التنبيهات الفورية (${unreadNotificationsCount} إشعار جديد)`}
                aria-label="التنبيهات الفورية"
              >
                <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs font-mono animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Instant Notification Dropdown Menu */}
              {isNotifMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 text-right overflow-hidden">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        الإشعارات والتنبيهات الفورية
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                        >
                          تعليم الكل كمقروء
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {departmentNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        لا توجد تنبيهات واردة حالياً لدائرتك.
                      </div>
                    ) : (
                      departmentNotifications.slice(0, 8).map((notif) => {
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.documentId);
                              setIsNotifMenuOpen(false);
                              if (notif.type === 'session_agenda' || notif.type === 'session_update') {
                                setSelectedSessionId(notif.documentId);
                                setCurrentTab('sessions');
                              } else if (notif.type === 'decision') {
                                setCurrentTab('decisions');
                              } else {
                                setCurrentTab('incoming');
                              }
                            }}
                            className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                              !notif.isRead
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                notif.type === 'session_agenda'
                                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                  : notif.type === 'decision'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                              }`}>
                                {notif.documentTypeName}
                              </span>

                              <span className="text-[10px] text-slate-400 font-mono">
                                {notif.createdAt}
                              </span>
                            </div>

                            <p className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                              {notif.subject}
                            </p>

                            {notif.decisionNumber && (
                              <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                                قرار رقم: {notif.decisionNumber}
                              </div>
                            )}

                            {notif.sessionNumber && (
                              <div className="text-[11px] font-mono text-purple-700 dark:text-purple-400 mt-1">
                                موعد الجلسة: {notif.sessionDate}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center">
                    <button
                      onClick={() => {
                        setIsNotifMenuOpen(false);
                        setCurrentTab('incoming');
                      }}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      استعراض كافة المخاطبات والقرارات الواردة ←
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Role Switcher Dropdown (for quick testing of roles) */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsRoleMenuOpen(!isRoleMenuOpen);
                  setIsThemeMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                title="تبديل مستوى الصلاحية للتجربة"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline text-slate-500 dark:text-slate-400">الدور:</span>
                <span className="font-semibold">{currentUser.role}</span>
              </button>

              {isRoleMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-right">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    تبديل دور المستخدم الحالي لاختبار الصلاحيات:
                  </div>
                  {roles.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchUserRole(item.role);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-right text-xs flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                        currentUser.role === item.role
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{item.title}</span>
                        {currentUser.role === item.role && (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Colors Palette */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsThemeMenuOpen(!isThemeMenuOpen);
                  setIsRoleMenuOpen(false);
                }}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="تغيير ألوان النظام"
                aria-label="تغيير الثيم"
              >
                <Palette className="w-4 h-4" />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 text-right">
                  <div className="px-2 py-1 text-[11px] font-medium text-slate-400 mb-1">
                    اختر المظهر اللوني:
                  </div>
                  <div className="space-y-1">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setThemeColor(opt.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                          themeColor === opt.id
                            ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${opt.colorClass} ring-1 ring-slate-300 dark:ring-slate-700`} />
                          <span>{opt.label}</span>
                        </span>
                        {themeColor === opt.id && <span className="text-[10px] text-emerald-600">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
              aria-label="الوضع الليلي والنهاري"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Profile Avatar Quick Link */}
            <button
              onClick={() => setCurrentTab('profile')}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="الملف الشخصي ورفع الصورة"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.fullName.charAt(0)
                )}
              </div>
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 hidden lg:inline max-w-[110px] truncate">
                {currentUser.fullName}
              </span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarCheck2,
  FileCheck2,
  Search,
  Landmark,
  Layers,
  FileText,
  Users,
  UserCircle2,
  Database,
  Building2,
  Shield,
  RotateCcw,
  Mail,
  Bell,
  ArrowRightLeft,
  Activity,
  Trash2,
  Lock,
  Settings,
  FileBarChart
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    currentTab,
    setCurrentTab,
    currentUser,
    canManageSystem,
    canManageAgenda,
    sessions,
    decisions,
    documents,
    resetDatabase,
    unreadNotificationsCount,
    departmentNotifications,
    ministerialDispatches,
    deletedDocuments,
    deletedDecisions
  } = useApp();

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    onCloseMobile();
  };

  const isUserAdmin = currentUser.role === 'Admin';

  const mainNavItems = [
    {
      id: 'dashboard',
      label: 'لوحة المعلومات والإحصائيات',
      icon: LayoutDashboard,
      badge: null,
      badgeAlert: false
    },
    {
      id: 'incoming',
      label: 'المخاطبات والقرارات الواردة لدائرتك',
      icon: Mail,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} جديد` : `${departmentNotifications.length}`,
      badgeAlert: unreadNotificationsCount > 0
    },
    {
      id: 'dispatches',
      label: 'المراسلات والوثائق المتبادلة',
      icon: ArrowRightLeft,
      badge: `${ministerialDispatches.length}`,
      badgeAlert: false
    },
    {
      id: 'sessions',
      label: 'إدارة الأجندة والجلسات',
      icon: CalendarCheck2,
      badge: `${sessions.length}`,
      badgeAlert: false
    },
    {
      id: 'decisions',
      label: 'سجل القرارات والتوجيهات',
      icon: FileCheck2,
      badge: `${decisions.filter(d => !d.isDeleted).length}`,
      badgeAlert: false
    },
    {
      id: 'search',
      label: 'البحث المتقدم في الأرشيف',
      icon: Search,
      badge: null,
      badgeAlert: false
    },
    {
      id: 'reports',
      label: 'التقارير والإحصائيات الرسمية',
      icon: FileBarChart,
      badge: 'جديد',
      badgeAlert: false
    }
  ];

  // ADMIN-ONLY NAVIGATION (عزل لوحة تحكم مدير النظام في صفحات لا يمكن الاطلاع عليها الا من خلال مدير النظام فقط)
  const adminNavItems = [
    {
      id: 'admin-governments',
      label: 'الحكومات والسنوات',
      icon: Landmark
    },
    {
      id: 'admin-categories',
      label: 'التبويبات الأساسية والفرعية',
      icon: Layers
    },
    {
      id: 'admin-doc-types',
      label: 'أنواع الوثائق المعتمدة',
      icon: FileText
    },
    {
      id: 'admin-users',
      label: 'المستخدمون والدوائر الحكومية',
      icon: Users
    },
    {
      id: 'admin-audit-logs',
      label: 'سجل حركات النظام (Audit Log)',
      icon: Activity
    },
    {
      id: 'admin-trash',
      label: 'سلة المحذوفات واستعادة الوثائق',
      icon: Trash2,
      badge: deletedDocuments.length + deletedDecisions.length > 0 ? `${deletedDocuments.length + deletedDecisions.length}` : null
    },
    {
      id: 'admin-settings',
      label: 'إعدادات النظام والأمان والحاويات',
      icon: Settings
    }
  ];

  const devNavItems = [
    {
      id: 'csharp-sql',
      label: 'تصدير Visual Studio 2026 & SQL 2022',
      icon: Database,
      badge: 'VS 2026'
    },
    {
      id: 'profile',
      label: 'الملف الشخصي ورفع الصورة',
      icon: UserCircle2,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar: Fixed on the RIGHT in RTL */}
      <aside
        className={`fixed lg:sticky top-16 right-0 z-30 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          
          {/* Main Navigation Section */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              الأعمال والوثائق الرسمية
            </div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-right ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono tabular-nums ${
                          item.badgeAlert
                            ? 'bg-amber-500 text-white font-bold'
                            : isActive
                            ? 'bg-emerald-900 text-emerald-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* SYSTEM ADMINISTRATION SECTION: STRICTLY ISOLATED AND COMPLETELY HIDDEN UNLESS ADMIN */}
          {/* "لوحة تحكم المدير اخفاءها تماما واظهارها فقط في حالة دخول الادمن" */}
          {isUserAdmin && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="px-3 mb-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>لوحة تحكم مدير النظام (Admin)</span>
                <Shield className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-right ${
                        isActive
                          ? 'bg-amber-700 text-white shadow-xs font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-mono text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* ACCOUNT ADMINISTRATOR DEDICATED SECTION */}
          {!isUserAdmin && currentUser.role === 'مسؤول الحسابات' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="px-3 mb-2 text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
                <span>إدارة الحسابات (Account Admin)</span>
                <Users className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNavClick('admin-users')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-right ${
                    currentTab === 'admin-users'
                      ? 'bg-blue-700 text-white shadow-xs font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`w-4 h-4 ${currentTab === 'admin-users' ? 'text-white' : 'text-blue-500'}`} />
                    <span>المستخدمون وتراخيص الوصول</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-mono text-[10px] font-bold">
                    {users.length}
                  </span>
                </button>
              </nav>
            </div>
          )}

          {/* Dev & Tools Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              المطور والملف الشخصي
            </div>
            <nav className="space-y-1">
              {devNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-right ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-xs font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Footer Area with Reset Mock DB button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <button
            onClick={() => {
              if (confirm('هل ترغب في إعادة تعيين كافة البيانات إلى الحالة النموذجية؟')) {
                resetDatabase();
              }
            }}
            className="w-full py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة البيانات النموذجية</span>
          </button>
        </div>

      </aside>
    </>
  );
};

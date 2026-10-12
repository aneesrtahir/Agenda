import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { StatisticsDashboard } from './components/dashboard/StatisticsDashboard';
import { SessionsManager } from './components/sessions/SessionsManager';
import { DecisionsRegistry } from './components/decisions/DecisionsRegistry';
import { AdvancedSearch } from './components/search/AdvancedSearch';
import { GovernmentsManager } from './components/admin/GovernmentsManager';
import { CategoriesManager } from './components/admin/CategoriesManager';
import { DocumentTypesManager } from './components/admin/DocumentTypesManager';
import { UsersAndDepartments } from './components/admin/UsersAndDepartments';
import { UserProfile } from './components/profile/UserProfile';
import { CSharpSqlGenerator } from './components/csharp-sql/CSharpSqlGenerator';
import { IncomingDocuments } from './components/incoming/IncomingDocuments';
import { MinisterialDispatches } from './components/incoming/MinisterialDispatches';
import { AuditLogViewer } from './components/admin/AuditLogViewer';
import { DeletedItemsArchive } from './components/admin/DeletedItemsArchive';
import { SystemSettingsManager } from './components/admin/SystemSettingsManager';
import { NewsTicker } from './components/common/NewsTicker';
import { OnlineUsersModal } from './components/common/OnlineUsersModal';
import { PasswordChangeModal } from './components/common/PasswordChangeModal';
import { FooterFilesSection } from './components/layout/FooterFilesSection';
import { OfficialReports } from './components/reports/OfficialReports';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';

const AdminRestrictedView: React.FC = () => {
  const { currentUser, setCurrentTab } = useApp();

  return (
    <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 shadow-md space-y-5">
      <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 rounded-full text-xs font-bold font-mono">
          عزل لوحة تحكم مدير النظام مفعل (Security Isolation)
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          عذراً، هذه الصفحة مخصصة لمدير النظام (Admin) حصراً!
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
          بناءً على التوجيهات الأمنية وقواعد الفصل بين الصلاحيات، تم عزل صفحات إدارة النظام (إعدادات الحكومات، الهياكل، المستخدمين، سجل الـ Log، والمحذوفات) بحيث لا يمكن الدخول إليها إلا من خلال حساب مدير النظام (Admin).
        </p>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 max-w-md mx-auto space-y-1">
        <div>حسابك الحالي: <strong className="text-slate-800 dark:text-slate-200">{currentUser.fullName}</strong></div>
        <div>الرتبة الممنوحة: <strong className="text-amber-600 dark:text-amber-400">[{currentUser.role}]</strong></div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          العودة إلى لوحة المعلومات الرئيسية
        </button>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { currentTab, currentUser } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Check if current tab is an admin-restricted tab
  const isAdminTab = currentTab.startsWith('admin-');
  const isAuthorized =
    !isAdminTab ||
    currentUser.role === 'Admin' ||
    (currentTab === 'admin-users' && currentUser.role === 'مسؤول الحسابات');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Breaking News & Directives Marquee Ticker (شريط الأخبار المتحرك) */}
      <NewsTicker />

      {/* Body Area with Sidebar on the RIGHT (first in RTL flex) and Main Content on the LEFT */}
      <div className="flex-1 flex w-full">
        
        {/* Main Navigation Sidebar on the RIGHT side in RTL */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          
          {/* Admin isolation guard check */}
          {!isAuthorized ? (
            <AdminRestrictedView />
          ) : (
            <>
              {currentTab === 'dashboard' && <StatisticsDashboard />}
              {currentTab === 'incoming' && <IncomingDocuments />}
              {currentTab === 'dispatches' && <MinisterialDispatches />}
              {currentTab === 'sessions' && <SessionsManager />}
              {currentTab === 'decisions' && <DecisionsRegistry />}
              {currentTab === 'search' && <AdvancedSearch />}
              {currentTab === 'reports' && <OfficialReports />}
              {currentTab === 'admin-governments' && <GovernmentsManager />}
              {currentTab === 'admin-categories' && <CategoriesManager />}
              {currentTab === 'admin-doc-types' && <DocumentTypesManager />}
              {currentTab === 'admin-users' && <UsersAndDepartments />}
              {currentTab === 'admin-audit-logs' && <AuditLogViewer />}
              {currentTab === 'admin-trash' && <DeletedItemsArchive />}
              {currentTab === 'admin-settings' && <SystemSettingsManager />}
              {currentTab === 'profile' && <UserProfile />}
              {currentTab === 'csharp-sql' && <CSharpSqlGenerator />}
            </>
          )}

          {/* Public Footer Documents Library (ملفات فوتر الموقع المتاحة للجميع) */}
          <FooterFilesSection />

          {/* Official Footer */}
          <footer className="mt-8 pt-6 pb-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                منظومة إدارة وأرشفة أجندة مجلس الوزراء
              </span>
              <span>·</span>
              <span>الأمانة العامة لمجلس الوزراء</span>
            </div>
            <p className="text-[11px] text-slate-400">
              نظام حكومي متكامل لإدارة الجلسات، تصنيف الوثائق والمحاضر، المراسلات الواردة للجهات، وإصدار القرارات مع دعم قاعدة بيانات SQL Server وهيكلية C# ASP.NET Core MVC.
            </p>
          </footer>
        </main>

      </div>

      {/* Online Users Modal (المتواجدون في الموقع) */}
      <OnlineUsersModal />

      {/* Password Change Enforcement Modal (إجبار تبديل كلمة المرور) */}
      <PasswordChangeModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Government,
  Year,
  CabinetSession,
  DocumentType,
  MainCategory,
  SubCategory,
  Department,
  User,
  CabinetDocument,
  Decision,
  ThemeColor,
  UserRole,
  DepartmentNotification,
  DecisionRelation,
  DocumentReceiptLog,
  AuditLog,
  AuditActionType,
  MinisterialDispatch,
  SystemSettings,
  NewsTickerItem,
  HomepageFeaturedFile,
  FooterPublicFile,
  OnlineUserSession,
  PasswordExpirationPeriod
} from '../types';
import {
  INITIAL_GOVERNMENTS,
  INITIAL_YEARS,
  INITIAL_DOCUMENT_TYPES,
  INITIAL_MAIN_CATEGORIES,
  INITIAL_SUB_CATEGORIES,
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
  INITIAL_SESSIONS,
  INITIAL_DOCUMENTS,
  INITIAL_DECISIONS,
  INITIAL_DECISION_RELATIONS,
  INITIAL_DOCUMENT_RECEIPTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MINISTERIAL_DISPATCHES,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_NEWS_TICKER,
  INITIAL_HOMEPAGE_FILES,
  INITIAL_FOOTER_FILES,
  INITIAL_ONLINE_SESSIONS
} from '../data/initialData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Navigation & UI
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Active User & Permissions
  currentUser: User;
  currentDepartment: Department | undefined;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: UserRole) => void;
  updateCurrentUserProfile: (data: Partial<User>) => void;
  canManageSystem: boolean;  // Admin only
  canManageAgenda: boolean;  // Admin and Agenda Director
  canManageAccounts: boolean; // Admin and Account Administrator
  canAddDrafts: boolean;     // Assistant, Agenda Director, Admin
  lockUserAccount: (userId: string, reason?: string) => void;
  unlockUserAccount: (userId: string) => void;
  adminResetUserPassword: (userId: string, newPass: string, requireChangeOnFirstLogin?: boolean) => void;
  toggleUserActiveStatus: (userId: string) => void;

  // Document Access Control (التحقق من الجهات المرسل إليها)
  canUserAccessDocument: (item: CabinetDocument | Decision, targetUser?: User) => boolean;

  // Notifications for the User's Department (التنبيهات والمخاطبات الواردة)
  departmentNotifications: DepartmentNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (documentId: string) => void;
  markAllNotificationsAsRead: () => void;

  // Hierarchy Selection Filter
  selectedGovernmentId: string;
  setSelectedGovernmentId: (id: string) => void;
  selectedYearId: string;
  setSelectedYearId: (id: string) => void;
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;

  // Data Collections
  governments: Government[];
  years: Year[];
  sessions: CabinetSession[];
  documentTypes: DocumentType[];
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
  departments: Department[];
  users: User[];
  documents: CabinetDocument[];
  decisions: Decision[];
  activeDocuments: CabinetDocument[];
  deletedDocuments: CabinetDocument[];
  activeDecisions: Decision[];
  deletedDecisions: Decision[];

  // CRUD Operations - Governments
  addGovernment: (data: Omit<Government, 'id'>) => void;
  updateGovernment: (id: string, data: Partial<Government>) => void;
  deleteGovernment: (id: string) => void;
  toggleGovernmentVisibility: (id: string) => void;

  // CRUD Operations - Years
  addYear: (data: Omit<Year, 'id'>) => void;
  updateYear: (id: string, data: Partial<Year>) => void;
  deleteYear: (id: string) => void;
  toggleYearVisibility: (id: string) => void;

  // CRUD Operations - Sessions
  addSession: (data: Omit<CabinetSession, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSession: (id: string, data: Partial<CabinetSession>) => void;
  deleteSession: (id: string) => void;
  toggleSessionVisibility: (id: string) => void;

  // CRUD Operations - Document Types
  addDocumentType: (data: Omit<DocumentType, 'id'>) => void;
  updateDocumentType: (id: string, data: Partial<DocumentType>) => void;
  deleteDocumentType: (id: string) => void;

  // CRUD Operations - Categories
  addMainCategory: (data: Omit<MainCategory, 'id'>) => void;
  updateMainCategory: (id: string, data: Partial<MainCategory>) => void;
  deleteMainCategory: (id: string) => void;
  addSubCategory: (data: Omit<SubCategory, 'id'>) => void;
  updateSubCategory: (id: string, data: Partial<SubCategory>) => void;
  deleteSubCategory: (id: string) => void;

  // CRUD Operations - Departments
  addDepartment: (data: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // CRUD Operations - Users
  addUser: (data: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // CRUD Operations - Documents & Decisions (with Soft Delete & Restore)
  addDocument: (data: Omit<CabinetDocument, 'id' | 'createdAt'>) => void;
  updateDocument: (id: string, data: Partial<CabinetDocument>) => void;
  deleteDocument: (id: string, reason?: string) => void; // Soft delete
  restoreDocument: (id: string) => void;                 // Restore
  permanentDeleteDocument: (id: string) => void;         // Hard delete
  toggleDocumentVisibility: (id: string) => void;

  addDecision: (data: Omit<Decision, 'id' | 'createdAt'>) => Decision;
  updateDecision: (id: string, data: Partial<Decision>) => void;
  deleteDecision: (id: string, reason?: string) => void; // Soft delete
  restoreDecision: (id: string) => void;                 // Restore
  permanentDeleteDecision: (id: string) => void;         // Hard delete
  toggleDecisionVisibility: (id: string) => void;

  // Decision Relations (ربط القرارات)
  decisionRelations: DecisionRelation[];
  addDecisionRelation: (relation: Omit<DecisionRelation, 'id' | 'createdAt' | 'createdByName'>) => void;
  deleteDecisionRelation: (id: string) => void;
  getDecisionRelations: (decisionId: string) => { outgoing: DecisionRelation[]; incoming: DecisionRelation[] };

  // Document Receipts & Views Tracking (تأكيد الاستلام والاطلاع)
  documentReceipts: DocumentReceiptLog[];
  recordDocumentView: (docId: string, docTitle: string) => void;
  confirmDocumentReceipt: (docId: string, docTitle: string, receiptNumber?: string, notes?: string) => void;
  getDocumentReceiptLogs: (docId: string) => DocumentReceiptLog[];

  // Audit Logs (سجل الحركات)
  auditLogs: AuditLog[];
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'>) => void;

  // Ministerial Dispatches (المراسلات بين الوزارات ومدير الأجندة)
  ministerialDispatches: MinisterialDispatch[];
  addMinisterialDispatch: (data: Omit<MinisterialDispatch, 'id' | 'createdAt'>) => void;
  updateMinisterialDispatchStatus: (id: string, status: MinisterialDispatch['status'], notes?: string) => void;
  confirmDispatchReceipt: (id: string) => void;

  // System Settings & Security
  systemSettings: SystemSettings;
  updateSystemSettings: (data: Partial<SystemSettings>) => void;

  // News Ticker (شريط الأخبار المتحرك)
  newsTickerItems: NewsTickerItem[];
  activeNewsTickerItems: NewsTickerItem[];
  addNewsTickerItem: (item: Omit<NewsTickerItem, 'id' | 'createdAt' | 'createdByUserName'>) => void;
  updateNewsTickerItem: (id: string, item: Partial<NewsTickerItem>) => void;
  deleteNewsTickerItem: (id: string) => void;
  toggleNewsTickerVisibility: (id: string) => void;

  // Homepage Media & Documents (ملفات الصفحة الرئيسية)
  homepageFiles: HomepageFeaturedFile[];
  addHomepageFile: (file: Omit<HomepageFeaturedFile, 'id' | 'uploadedAt' | 'uploadedByUserName'>) => void;
  updateHomepageFile: (id: string, file: Partial<HomepageFeaturedFile>) => void;
  deleteHomepageFile: (id: string) => void;
  toggleHomepageFileVisibility: (id: string) => void;

  // Footer Public Documents (ملفات فوتر الموقع المتاحة للجميع)
  footerFiles: FooterPublicFile[];
  addFooterFile: (file: Omit<FooterPublicFile, 'id' | 'addedAt'>) => void;
  deleteFooterFile: (id: string) => void;
  toggleFooterFileVisibility: (id: string) => void;

  // Online Users & Presence (المتواجدون في الموقع)
  onlineSessions: OnlineUserSession[];
  onlineUsersCount: number;
  isOnlineUsersModalOpen: boolean;
  setIsOnlineUsersModalOpen: (open: boolean) => void;

  // Password Policies & Enforcement (سياسات كلمة المرور وإجبار التبديل)
  isPasswordChangeModalOpen: boolean;
  setIsPasswordChangeModalOpen: (open: boolean) => void;
  changeUserPassword: (userId: string, newPass: string) => boolean;
  isPasswordExpired: (user: User) => boolean;
  simulateFailedLogin: (username: string) => { isLocked: boolean; remainingAttempts: number };
  unlockUserAccount: (userId: string) => void;

  // Reset to initial mock data
  resetDatabase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helpers for local storage persistence
function loadState<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`cabinet_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`cabinet_${key}`, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme & UI state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('cabinet_dark_mode') === 'true';
  });
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    return (localStorage.getItem('cabinet_theme_color') as ThemeColor) || 'emerald';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Apply dark mode & theme color to HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('cabinet_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeColor);
    localStorage.setItem('cabinet_theme_color', themeColor);
  }, [themeColor]);

  // Data states
  const [governments, setGovernments] = useState<Government[]>(() => loadState('govs', INITIAL_GOVERNMENTS));
  const [years, setYears] = useState<Year[]>(() => loadState('years', INITIAL_YEARS));
  const [sessions, setSessions] = useState<CabinetSession[]>(() => loadState('sessions', INITIAL_SESSIONS));
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(() => loadState('docTypes', INITIAL_DOCUMENT_TYPES));
  const [mainCategories, setMainCategories] = useState<MainCategory[]>(() => loadState('mainCats', INITIAL_MAIN_CATEGORIES));
  const [subCategories, setSubCategories] = useState<SubCategory[]>(() => loadState('subCats', INITIAL_SUB_CATEGORIES));
  const [departments, setDepartments] = useState<Department[]>(() => loadState('depts', INITIAL_DEPARTMENTS));
  const [users, setUsers] = useState<User[]>(() => loadState('users', INITIAL_USERS));
  const [documents, setDocuments] = useState<CabinetDocument[]>(() => loadState('documents', INITIAL_DOCUMENTS));
  const [decisions, setDecisions] = useState<Decision[]>(() => loadState('decisions', INITIAL_DECISIONS));
  const [decisionRelations, setDecisionRelations] = useState<DecisionRelation[]>(() => loadState('relations', INITIAL_DECISION_RELATIONS));
  const [documentReceipts, setDocumentReceipts] = useState<DocumentReceiptLog[]>(() => loadState('receipts', INITIAL_DOCUMENT_RECEIPTS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadState('audit_logs', INITIAL_AUDIT_LOGS));
  const [ministerialDispatches, setMinisterialDispatches] = useState<MinisterialDispatch[]>(() => loadState('dispatches', INITIAL_MINISTERIAL_DISPATCHES));
  
  // New State variables for system settings, news ticker, media files, footer files, online users
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => loadState('system_settings', INITIAL_SYSTEM_SETTINGS));
  const [newsTickerItems, setNewsTickerItems] = useState<NewsTickerItem[]>(() => loadState('news_ticker', INITIAL_NEWS_TICKER));
  const [homepageFiles, setHomepageFiles] = useState<HomepageFeaturedFile[]>(() => loadState('homepage_files', INITIAL_HOMEPAGE_FILES));
  const [footerFiles, setFooterFiles] = useState<FooterPublicFile[]>(() => loadState('footer_files', INITIAL_FOOTER_FILES));
  const [onlineSessions, setOnlineSessions] = useState<OnlineUserSession[]>(() => loadState('online_sessions', INITIAL_ONLINE_SESSIONS));
  const [isOnlineUsersModalOpen, setIsOnlineUsersModalOpen] = useState<boolean>(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState<boolean>(false);

  // Read notification IDs tracked in localStorage
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => loadState('read_notifs', []));

  // Current User
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedUser = loadState<User | null>('currentUser', null);
    if (savedUser) return savedUser;
    return users[0] || INITIAL_USERS[0];
  });

  // Calculate password expiration based on system policy period
  const getExpirationDays = (period: PasswordExpirationPeriod): number => {
    switch (period) {
      case 'يوم': return 1;
      case 'يومين': return 2;
      case 'ثلاثة ايام': return 3;
      case 'اسبوع': return 7;
      case 'اسبوعين': return 14;
      case 'ثلاثة اسابيع': return 21;
      case 'شهر': return 30;
      case 'شهرين': return 60;
      case 'ثلاثة اشهر': return 90;
      case 'ستة اشهر': return 180;
      default: return 30;
    }
  };

  const isPasswordExpired = (user: User): boolean => {
    if (!systemSettings.isPasswordExpirationEnforced) return false;
    if (!user.lastPasswordChangedAt) return true;
    try {
      const lastChange = new Date(user.lastPasswordChangedAt).getTime();
      const now = new Date().getTime();
      const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
      const limitDays = getExpirationDays(systemSettings.passwordExpirationPeriod);
      return diffDays >= limitDays;
    } catch {
      return false;
    }
  };

  // Toggle dark mode and bind to current user profile
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      const nextMode = next ? 'dark' : 'light';
      setCurrentUserState(curr => {
        const updated = { ...curr, preferredMode: nextMode as 'light' | 'dark' };
        saveState('currentUser', updated);
        setUsers(prevUsers => prevUsers.map(u => u.id === updated.id ? updated : u));
        return updated;
      });
      return next;
    });
  };

  // Set theme color and bind to current user profile
  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    setCurrentUserState(curr => {
      const updated = { ...curr, preferredTheme: color };
      saveState('currentUser', updated);
      setUsers(prevUsers => prevUsers.map(u => u.id === updated.id ? updated : u));
      return updated;
    });
  };

  // Setting current user with automatic restoration of user's saved theme & dark mode
  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    saveState('currentUser', user);

    // Apply user's saved preferred theme and mode if present
    if (user.preferredTheme) {
      setThemeColorState(user.preferredTheme);
    }
    if (user.preferredMode) {
      setIsDarkMode(user.preferredMode === 'dark');
    }

    // Update active online session indicator for this user
    setOnlineSessions(prev => {
      const exists = prev.find(s => s.userId === user.id);
      if (exists) {
        return prev.map(s => s.userId === user.id ? { ...s, lastActive: 'الآن (نشط)', isCurrentSession: true } : { ...s, isCurrentSession: false });
      }
      const dept = departments.find(d => d.id === user.departmentId);
      const newSession: OnlineUserSession = {
        id: `sess-on-${Date.now()}`,
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        departmentName: dept?.name || 'الأمانة العامة',
        departmentNameEn: dept?.nameEn,
        avatarUrl: user.avatarUrl,
        currentLocation: 'لوحة التحكم والمعلومات',
        onlineSince: 'الآن',
        lastActive: 'الآن (نشط)',
        ipAddress: `10.20.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 200) + 10}`,
        device: 'حاسبة مكتبية (الحكومة الإلكترونية)',
        isCurrentSession: true
      };
      return [newSession, ...prev.map(s => ({ ...s, isCurrentSession: false }))];
    });

    // Check account lockout
    if (user.isLockedOut) {
      showToast(`تنبيه أمني: حساب (${user.fullName}) مقفل مؤقتاً لتجاوز محاولات المرور الخاطئة!`, 'error');
    }

    // Check first login or password expiration policies
    if (user.mustChangePasswordOnFirstLogin && systemSettings.forceChangePasswordOnFirstLogin) {
      setTimeout(() => {
        setIsPasswordChangeModalOpen(true);
        showToast('إجراء أمني إلزامي: يجب تبديل كلمة المرور عند أول تسجيل دخول للنظام', 'info');
      }, 400);
    } else if (isPasswordExpired(user)) {
      setTimeout(() => {
        setIsPasswordChangeModalOpen(true);
        showToast(`انتهت صلاحية كلمة المرور المحددة بـ (${systemSettings.passwordExpirationPeriod}). يرجى تبديلها للاستمرار`, 'info');
      }, 400);
    }
  };

  // Add Audit Log Entry helper
  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'>) => {
    const now = new Date();
    const formattedTime = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: AuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formattedTime,
      ipAddress: `10.0.1.${Math.floor(Math.random() * 200) + 10}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchUserRole = (role: UserRole) => {
    const found = users.find(u => u.role === role);
    if (found) {
      const prevRole = currentUser.role;
      setCurrentUser(found);
      addAuditLog({
        userId: found.id,
        userName: found.fullName,
        userRole: found.role,
        departmentName: departments.find(d => d.id === found.departmentId)?.name || 'غير محددة',
        actionType: 'تبديل مستخدم',
        entityType: 'مستخدم',
        entityId: found.id,
        entityTitle: found.fullName,
        details: `تم تبديل جلسة العمل من رتبة (${prevRole}) إلى حساب: ${found.fullName} (${found.role}) مع تحميل تفضيلات المظهر`
      });
      showToast(`تم تبديل المستخدم الحالي إلى: ${found.fullName} (${found.role}) وتفعيل مظهره المفضل`, 'info');
    }
  };

  const updateCurrentUserProfile = (data: Partial<User>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUserState(updated);
    saveState('currentUser', updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    addAuditLog({
      userId: updated.id,
      userName: updated.fullName,
      userRole: updated.role,
      departmentName: departments.find(d => d.id === updated.departmentId)?.name || 'غير محددة',
      actionType: 'إدارة مستخدمين',
      entityType: 'مستخدم',
      entityId: updated.id,
      entityTitle: updated.fullName,
      details: 'تم تحديث بيانات الملف الشخصي والصورة وتفضيلات المظهر الشخصي'
    });
    showToast('تم تحديث بيانات الملف الشخصي والصورة بنجاح', 'success');
  };

  // Change user password handler
  const changeUserPassword = (userId: string, _newPass: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          lastPasswordChangedAt: today,
          mustChangePasswordOnFirstLogin: false,
          failedLoginAttempts: 0,
          isLockedOut: false,
          lockedUntil: undefined
        };
      }
      return u;
    }));
    if (currentUser.id === userId) {
      const updated = {
        ...currentUser,
        lastPasswordChangedAt: today,
        mustChangePasswordOnFirstLogin: false,
        failedLoginAttempts: 0,
        isLockedOut: false,
        lockedUntil: undefined
      };
      setCurrentUserState(updated);
      saveState('currentUser', updated);
    }
    addAuditLog({
      userId,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: departments.find(d => d.id === currentUser.departmentId)?.name || 'الأمانة العامة',
      actionType: 'إدارة مستخدمين',
      entityType: 'مستخدم',
      entityId: userId,
      entityTitle: currentUser.fullName,
      details: 'تم تبديل كلمة المرور بنجاح وتحديث تاريخ الصلاحية'
    });
    showToast('تم تغيير كلمة المرور وتحديث تاريخ الصلاحية بنجاح', 'success');
    return true;
  };

  // Simulate failed login attempts (3 to 10 limit test)
  const simulateFailedLogin = (username: string) => {
    const user = users.find(u => u.username === username);
    if (!user) return { isLocked: false, remainingAttempts: systemSettings.maxFailedLoginAttempts };

    const currentAttempts = (user.failedLoginAttempts || 0) + 1;
    const maxAttempts = systemSettings.maxFailedLoginAttempts;
    const isLocked = currentAttempts >= maxAttempts;

    const updatedUser: User = {
      ...user,
      failedLoginAttempts: currentAttempts,
      isLockedOut: isLocked,
      lockedUntil: isLocked ? new Date(Date.now() + systemSettings.lockoutDurationMinutes * 60000).toISOString() : undefined
    };

    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    if (currentUser.id === user.id) {
      setCurrentUserState(updatedUser);
      saveState('currentUser', updatedUser);
    }

    addAuditLog({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      departmentName: departments.find(d => d.id === user.departmentId)?.name || 'الوزارة',
      actionType: 'تسجيل دخول',
      entityType: 'مستخدم',
      entityId: user.id,
      entityTitle: user.fullName,
      details: isLocked
        ? `محاولة دخول فاشلة (${currentAttempts}). تم قفل الحساب مؤقتاً لتجاوز الحد المسموح به (${maxAttempts} محاولات)!`
        : `محاولة دخول فاشلة (${currentAttempts} من أصل ${maxAttempts})`
    });

    return {
      isLocked,
      remainingAttempts: Math.max(0, maxAttempts - currentAttempts)
    };
  };

  const lockUserAccount = (userId: string, reason: string = 'تم قفل الحساب يدوياً بواسطة إدارة الحسابات') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          isLockedOut: true,
          lockReason: reason,
          lockedUntil: undefined
        };
      }
      return u;
    }));
    if (currentUser.id === userId) {
      const updated = {
        ...currentUser,
        isLockedOut: true,
        lockReason: reason,
        lockedUntil: undefined
      };
      setCurrentUserState(updated);
      saveState('currentUser', updated);
    }
    const target = users.find(u => u.id === userId);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: departments.find(d => d.id === currentUser.departmentId)?.name || 'الأمانة العامة',
      actionType: 'إدارة مستخدمين',
      entityType: 'مستخدم',
      entityId: userId,
      entityTitle: target?.fullName || 'مستخدم',
      details: `تم قفل الحساب للمستخدم (${target?.fullName}) - السبب: ${reason}`
    });
    showToast(`تم قفل حساب المستخدم (${target?.fullName || ''}) بنجاح`, 'error');
  };

  const unlockUserAccount = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          failedLoginAttempts: 0,
          isLockedOut: false,
          lockedUntil: undefined,
          lockReason: undefined,
          isActive: true
        };
      }
      return u;
    }));
    if (currentUser.id === userId) {
      const updated = {
        ...currentUser,
        failedLoginAttempts: 0,
        isLockedOut: false,
        lockedUntil: undefined,
        lockReason: undefined,
        isActive: true
      };
      setCurrentUserState(updated);
      saveState('currentUser', updated);
    }
    const target = users.find(u => u.id === userId);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: departments.find(d => d.id === currentUser.departmentId)?.name || 'الأمانة العامة',
      actionType: 'إدارة مستخدمين',
      entityType: 'مستخدم',
      entityId: userId,
      entityTitle: target?.fullName || 'مستخدم',
      details: `تم إلغاء قفل وتفعيل حساب المستخدم (${target?.fullName}) وتصفير المحاولات`
    });
    showToast(`تم إلغاء قفل وتفعيل حساب (${target?.fullName || ''}) بنجاح`, 'success');
  };

  const adminResetUserPassword = (userId: string, newPass: string, requireChangeOnFirstLogin: boolean = true) => {
    const today = new Date().toISOString().split('T')[0];
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          password: newPass,
          lastPasswordChangedAt: today,
          mustChangePasswordOnFirstLogin: requireChangeOnFirstLogin,
          failedLoginAttempts: 0,
          isLockedOut: false,
          lockedUntil: undefined,
          lockReason: undefined
        };
      }
      return u;
    }));
    if (currentUser.id === userId) {
      const updated = {
        ...currentUser,
        password: newPass,
        lastPasswordChangedAt: today,
        mustChangePasswordOnFirstLogin: requireChangeOnFirstLogin,
        failedLoginAttempts: 0,
        isLockedOut: false,
        lockedUntil: undefined,
        lockReason: undefined
      };
      setCurrentUserState(updated);
      saveState('currentUser', updated);
    }
    const target = users.find(u => u.id === userId);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: departments.find(d => d.id === currentUser.departmentId)?.name || 'الأمانة العامة',
      actionType: 'إدارة مستخدمين',
      entityType: 'مستخدم',
      entityId: userId,
      entityTitle: target?.fullName || 'مستخدم',
      details: `قام المسؤول بتعيين كلمة مرور جديدة للمستخدم (${target?.fullName}) مع خيار إلزام التغيير: ${requireChangeOnFirstLogin ? 'نعم' : 'لا'}`
    });
    showToast(`تم تعيين كلمة المرور الجديدة للمستخدم (${target?.fullName || ''}) بنجاح`, 'success');
  };

  const toggleUserActiveStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextActive = !u.isActive;
        return {
          ...u,
          isActive: nextActive
        };
      }
      return u;
    }));
    const target = users.find(u => u.id === userId);
    const nextStatus = target ? !target.isActive : false;
    if (currentUser.id === userId) {
      setCurrentUserState(curr => ({ ...curr, isActive: nextStatus }));
    }
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: departments.find(d => d.id === currentUser.departmentId)?.name || 'الأمانة العامة',
      actionType: 'إدارة مستخدمين',
      entityType: 'مستخدم',
      entityId: userId,
      entityTitle: target?.fullName || 'مستخدم',
      details: `تم ${nextStatus ? 'تفعيل' : 'تعطيل'} حساب المستخدم (${target?.fullName})`
    });
    showToast(`تم ${nextStatus ? 'تفعيل' : 'تعطيل'} حساب المستخدم بنجاح`, 'info');
  };

  // Update System Settings
  const updateSystemSettings = (data: Partial<SystemSettings>) => {
    const updated = {
      ...systemSettings,
      ...data,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedByUserName: `${currentUser.fullName} (${currentUser.role})`
    };
    setSystemSettings(updated);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: departments.find(d => d.id === currentUser.departmentId)?.name || 'الأمانة العامة',
      actionType: 'تحديث جلسة',
      entityType: 'نظام',
      details: 'تم تحديث إعدادات النظام، مسار حاوية الخادم، وسياسات أمان كلمات المرور'
    });
    showToast('تم حفظ إعدادات النظام وسياسات الأمان والحاويات بنجاح', 'success');
  };

  // News Ticker CRUD (Admin only controlled)
  const activeNewsTickerItems = useMemo(() => newsTickerItems.filter(item => item.isActive), [newsTickerItems]);

  const addNewsTickerItem = (item: Omit<NewsTickerItem, 'id' | 'createdAt' | 'createdByUserName'>) => {
    const newItem: NewsTickerItem = {
      ...item,
      id: `news-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdByUserName: currentUser.fullName
    };
    setNewsTickerItems(prev => [newItem, ...prev]);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: departments.find(d => d.id === currentUser.departmentId)?.name || 'الأمانة العامة',
      actionType: 'إضافة وثيقة',
      entityType: 'نظام',
      entityId: newItem.id,
      entityTitle: newItem.title,
      details: `تم نشر خبر جديد في الشريط المتحرك: "${newItem.title}"`
    });
    showToast('تمت إضافة الخبر ونشره في الشريط الإخباري بنجاح', 'success');
  };

  const updateNewsTickerItem = (id: string, data: Partial<NewsTickerItem>) => {
    setNewsTickerItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
    showToast('تم تحديث بيانات الخبر بنجاح', 'success');
  };

  const deleteNewsTickerItem = (id: string) => {
    setNewsTickerItems(prev => prev.filter(item => item.id !== id));
    showToast('تم حذف الخبر من الشريط الإخباري', 'info');
  };

  const toggleNewsTickerVisibility = (id: string) => {
    setNewsTickerItems(prev => prev.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };

  // Homepage Media & Documents CRUD (صور، وورد، اكسل، بوربوينت، PDF، فديوات)
  const addHomepageFile = (file: Omit<HomepageFeaturedFile, 'id' | 'uploadedAt' | 'uploadedByUserName'>) => {
    const newFile: HomepageFeaturedFile = {
      ...file,
      id: `hf-${Date.now()}`,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      uploadedByUserName: currentUser.fullName
    };
    setHomepageFiles(prev => [...prev, newFile]);
    showToast('تمت إضافة الملف إلى واجهة الصفحة الرئيسية بنجاح', 'success');
  };

  const updateHomepageFile = (id: string, data: Partial<HomepageFeaturedFile>) => {
    setHomepageFiles(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    showToast('تم تحديث بيانات ملف الصفحة الرئيسية بنجاح', 'success');
  };

  const deleteHomepageFile = (id: string) => {
    setHomepageFiles(prev => prev.filter(f => f.id !== id));
    showToast('تم حذف الملف من الصفحة الرئيسية', 'info');
  };

  const toggleHomepageFileVisibility = (id: string) => {
    setHomepageFiles(prev => prev.map(f => f.id === id ? { ...f, isVisible: !f.isVisible } : f));
  };

  // Footer Files CRUD (متاحة للجميع من المستخدمين والزائرين)
  const addFooterFile = (file: Omit<FooterPublicFile, 'id' | 'addedAt'>) => {
    const newFile: FooterPublicFile = {
      ...file,
      id: `ff-${Date.now()}`,
      addedAt: new Date().toISOString().split('T')[0]
    };
    setFooterFiles(prev => [...prev, newFile]);
    showToast('تمت إضافة الملف إلى فوتر الموقع بنجاح', 'success');
  };

  const deleteFooterFile = (id: string) => {
    setFooterFiles(prev => prev.filter(f => f.id !== id));
    showToast('تم حذف الملف من فوتر الموقع', 'info');
  };

  const toggleFooterFileVisibility = (id: string) => {
    setFooterFiles(prev => prev.map(f => f.id === id ? { ...f, isVisible: !f.isVisible } : f));
  };

  // Synchronize state changes to localStorage
  useEffect(() => saveState('govs', governments), [governments]);
  useEffect(() => saveState('years', years), [years]);
  useEffect(() => saveState('sessions', sessions), [sessions]);
  useEffect(() => saveState('docTypes', documentTypes), [documentTypes]);
  useEffect(() => saveState('mainCats', mainCategories), [mainCategories]);
  useEffect(() => saveState('subCats', subCategories), [subCategories]);
  useEffect(() => saveState('depts', departments), [departments]);
  useEffect(() => saveState('users', users), [users]);
  useEffect(() => saveState('documents', documents), [documents]);
  useEffect(() => saveState('decisions', decisions), [decisions]);
  useEffect(() => saveState('relations', decisionRelations), [decisionRelations]);
  useEffect(() => saveState('receipts', documentReceipts), [documentReceipts]);
  useEffect(() => saveState('audit_logs', auditLogs), [auditLogs]);
  useEffect(() => saveState('dispatches', ministerialDispatches), [ministerialDispatches]);
  useEffect(() => saveState('read_notifs', readNotifIds), [readNotifIds]);
  useEffect(() => saveState('system_settings', systemSettings), [systemSettings]);
  useEffect(() => saveState('news_ticker', newsTickerItems), [newsTickerItems]);
  useEffect(() => saveState('homepage_files', homepageFiles), [homepageFiles]);
  useEffect(() => saveState('footer_files', footerFiles), [footerFiles]);
  useEffect(() => saveState('online_sessions', onlineSessions), [onlineSessions]);

  // Active / Deleted Subsets
  const activeDocuments = useMemo(() => documents.filter(d => !d.isDeleted), [documents]);
  const deletedDocuments = useMemo(() => documents.filter(d => !!d.isDeleted), [documents]);
  const activeDecisions = useMemo(() => decisions.filter(d => !d.isDeleted), [decisions]);
  const deletedDecisions = useMemo(() => decisions.filter(d => !!d.isDeleted), [decisions]);

  // Derived Department for Current User
  const currentDepartment = useMemo(() => {
    return departments.find(d => d.id === currentUser.departmentId);
  }, [departments, currentUser]);

  const canManageSystem = currentUser.role === 'Admin';
  const canManageAgenda = currentUser.role === 'Admin' || currentUser.role === 'مدير الأجندة';
  const canManageAccounts = currentUser.role === 'Admin' || currentUser.role === 'مسؤول الحسابات';
  const canAddDrafts = currentUser.role === 'Admin' || currentUser.role === 'مدير الأجندة' || currentUser.role === 'مساعد';

  // DOCUMENT ACCESS CONTROL
  const canUserAccessDocument = (item: CabinetDocument | Decision, targetUser: User = currentUser): boolean => {
    if (targetUser.role === 'Admin' || targetUser.role === 'مدير الأجندة') {
      return true;
    }
    if (item.isAllDepartments) {
      return true;
    }
    const userDept = departments.find(d => d.id === targetUser.departmentId);
    if (!userDept) return false;

    const recipientList: string[] = [];
    if ('targetDepartments' in item && Array.isArray((item as Decision).targetDepartments)) {
      recipientList.push(...(item as Decision).targetDepartments);
    }
    if (Array.isArray(item.recipientDepartments)) {
      recipientList.push(...item.recipientDepartments);
    }

    const matchesName = recipientList.some(r =>
      r.trim().toLowerCase() === userDept.name.trim().toLowerCase() ||
      (userDept.nameEn && r.trim().toLowerCase() === userDept.nameEn.trim().toLowerCase())
    );
    const matchesCode = recipientList.some(r => r.trim().toLowerCase() === userDept.code.trim().toLowerCase());
    return matchesName || matchesCode;
  };

  // NOTIFICATIONS FOR USER'S DEPARTMENT
  const departmentNotifications = useMemo<DepartmentNotification[]>(() => {
    if (!currentDepartment) return [];
    const notifs: DepartmentNotification[] = [];

    // Notifications from decisions
    activeDecisions.forEach(dec => {
      if (canUserAccessDocument(dec)) {
        notifs.push({
          id: `notif-dec-${dec.id}`,
          documentId: dec.id,
          subject: dec.subject,
          type: 'decision',
          documentTypeName: 'قرار مجلس الوزراء',
          departmentName: currentDepartment.name,
          createdAt: dec.letterDate || dec.createdAt,
          isRead: readNotifIds.includes(dec.id),
          decisionNumber: dec.decisionNumber,
          letterNumber: dec.letterNumber,
          decisionType: dec.decisionType
        });
      }
    });

    // Notifications from documents
    activeDocuments.forEach(doc => {
      if (canUserAccessDocument(doc)) {
        const dt = documentTypes.find(t => t.id === doc.documentTypeId);
        notifs.push({
          id: `notif-doc-${doc.id}`,
          documentId: doc.id,
          subject: doc.subject,
          type: 'document',
          documentTypeName: dt?.name || 'وثيقة رسمية',
          departmentName: currentDepartment.name,
          createdAt: doc.createdAt,
          isRead: readNotifIds.includes(doc.id),
          letterNumber: doc.referenceNumber
        });
      }
    });

    // Notifications from ministerial dispatches directed to user's dept
    ministerialDispatches.forEach(disp => {
      if (disp.toDepartmentId === currentDepartment.id || (canManageAgenda && disp.direction === 'من الوزارة إلى مجلس الوزراء')) {
        notifs.push({
          id: `notif-disp-${disp.id}`,
          documentId: disp.id,
          subject: disp.subject,
          type: 'dispatch',
          documentTypeName: `مراسلة رسمية [${disp.priority}]`,
          departmentName: currentDepartment.name,
          createdAt: disp.createdAt,
          isRead: readNotifIds.includes(disp.id),
          letterNumber: disp.letterNumber
        });
      }
    });

    // Real-time alerts for Upcoming & Active Sessions and Agenda modifications:
    // "نظام إشعارات فورية للمستخدمين عند صدور قرار جديد أو تعديل جدول أعمال جلسة قادمة"
    sessions.forEach(sess => {
      if (sess.status === 'قيد الإعداد' || sess.status === 'منعقدة' || sess.sessionDate >= '2026-01-01') {
        notifs.push({
          id: `notif-sess-${sess.id}`,
          documentId: sess.id,
          subject: `تحديث جدول أعمال الجلسة (${sess.sessionNumber}) - ${sess.sessionType}`,
          type: 'session_agenda',
          documentTypeName: `أجندة جلسة قادمة [${sess.status}]`,
          departmentName: currentDepartment.name,
          createdAt: sess.updatedAt || sess.createdAt,
          isRead: readNotifIds.includes(sess.id),
          sessionNumber: sess.sessionNumber,
          sessionDate: sess.sessionDate
        });
      }
    });

    return notifs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [activeDecisions, activeDocuments, ministerialDispatches, sessions, currentDepartment, currentUser, readNotifIds, documentTypes]);

  const unreadNotificationsCount = useMemo(() => {
    return departmentNotifications.filter(n => !n.isRead).length;
  }, [departmentNotifications]);

  const markNotificationAsRead = (documentId: string) => {
    if (!readNotifIds.includes(documentId)) {
      const next = [...readNotifIds, documentId];
      setReadNotifIds(next);
      saveState('read_notifs', next);
    }
  };

  const markAllNotificationsAsRead = () => {
    const allIds = departmentNotifications.map(n => n.documentId);
    setReadNotifIds(allIds);
    saveState('read_notifs', allIds);
    showToast('تم تعليم كافة التنبيهات كمقروءة');
  };

  // Selected hierarchy filters
  const [selectedGovernmentId, setSelectedGovernmentId] = useState<string>(() => {
    return governments[0]?.id || 'gov-1';
  });
  const [selectedYearId, setSelectedYearId] = useState<string>(() => {
    return years[0]?.id || 'yr-2025';
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Governments CRUD
  const addGovernment = (data: Omit<Government, 'id'>) => {
    const newGov: Government = { ...data, id: `gov-${Date.now()}` };
    setGovernments(prev => [...prev, newGov]);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إدارة حكومات',
      entityType: 'حكومة',
      entityId: newGov.id,
      entityTitle: newGov.name,
      details: `تمت إضافة الحكومة: ${newGov.name} برئاسة ${newGov.primeMinister}`
    });
    showToast(`تمت إضافة ${newGov.name} بنجاح`);
  };

  const updateGovernment = (id: string, data: Partial<Government>) => {
    setGovernments(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إدارة حكومات',
      entityType: 'حكومة',
      entityId: id,
      details: 'تم تحديث بيانات وسنوات الدورة الحكومية'
    });
    showToast('تم تحديث بيانات الحكومة بنجاح');
  };

  const deleteGovernment = (id: string) => {
    setGovernments(prev => prev.filter(g => g.id !== id));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إدارة حكومات',
      entityType: 'حكومة',
      entityId: id,
      details: 'تم حذف الحكومة من السجل'
    });
    showToast('تم حذف الحكومة', 'info');
  };

  const toggleGovernmentVisibility = (id: string) => {
    setGovernments(prev => prev.map(g => {
      if (g.id === id) {
        const nextState = !g.isHidden;
        showToast(nextState ? 'تم إخفاء الحكومة' : 'تم إظهار الحكومة', 'info');
        return { ...g, isHidden: nextState };
      }
      return g;
    }));
  };

  // Years CRUD
  const addYear = (data: Omit<Year, 'id'>) => {
    const newYear: Year = { ...data, id: `yr-${Date.now()}` };
    setYears(prev => [...prev, newYear]);
    showToast(`تمت إضافة السنة (${newYear.yearNumber}) بنجاح`);
  };

  const updateYear = (id: string, data: Partial<Year>) => {
    setYears(prev => prev.map(y => y.id === id ? { ...y, ...data } : y));
    showToast('تم تحديث بيانات السنة بنجاح');
  };

  const deleteYear = (id: string) => {
    setYears(prev => prev.filter(y => y.id !== id));
    showToast('تم حذف السنة', 'info');
  };

  const toggleYearVisibility = (id: string) => {
    setYears(prev => prev.map(y => {
      if (y.id === id) {
        const nextState = !y.isHidden;
        showToast(nextState ? 'تم إخفاء السنة' : 'تم إظهار السنة', 'info');
        return { ...y, isHidden: nextState };
      }
      return y;
    }));
  };

  // Sessions CRUD
  const addSession = (data: Omit<CabinetSession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newSession: CabinetSession = {
      ...data,
      id: `sess-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setSessions(prev => [newSession, ...prev]);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'تحديث جلسة',
      entityType: 'جلسة',
      entityId: newSession.id,
      entityTitle: `الجلسة رقم ${newSession.sessionNumber} [${newSession.sessionType}]`,
      details: `تم إنشاء الجلسة رقم ${newSession.sessionNumber} بتاريخ ${newSession.sessionDate}`
    });
    showToast(`تمت إضافة الجلسة رقم (${newSession.sessionNumber}) بنجاح`);
  };

  const updateSession = (id: string, data: Partial<CabinetSession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString().split('T')[0] } : s));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'تحديث جلسة',
      entityType: 'جلسة',
      entityId: id,
      details: 'تم تعديل بيانات الجلسة ومحاضرها'
    });
    showToast('تم تعديل بيانات الجلسة بنجاح');
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'تحديث جلسة',
      entityType: 'جلسة',
      entityId: id,
      details: 'تم حذف الجلسة'
    });
    showToast('تم حذف الجلسة', 'info');
  };

  const toggleSessionVisibility = (id: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.isHidden;
        showToast(nextState ? 'تم إخفاء الجلسة' : 'تم إظهار الجلسة', 'info');
        return { ...s, isHidden: nextState };
      }
      return s;
    }));
  };

  // Document Types CRUD
  const addDocumentType = (data: Omit<DocumentType, 'id'>) => {
    const newDT: DocumentType = { ...data, id: `dt-${Date.now()}` };
    setDocumentTypes(prev => [...prev, newDT]);
    showToast(`تمت إضافة نوع الوثيقة (${newDT.name}) بنجاح`);
  };

  const updateDocumentType = (id: string, data: Partial<DocumentType>) => {
    setDocumentTypes(prev => prev.map(dt => dt.id === id ? { ...dt, ...data } : dt));
    showToast('تم تحديث نوع الوثيقة');
  };

  const deleteDocumentType = (id: string) => {
    setDocumentTypes(prev => prev.filter(dt => dt.id !== id));
    showToast('تم حذف نوع الوثيقة', 'info');
  };

  // Categories CRUD
  const addMainCategory = (data: Omit<MainCategory, 'id'>) => {
    const newCat: MainCategory = { ...data, id: `mc-${Date.now()}` };
    setMainCategories(prev => [...prev, newCat]);
    showToast(`تمت إضافة التبويب الأساسي (${newCat.name})`);
  };

  const updateMainCategory = (id: string, data: Partial<MainCategory>) => {
    setMainCategories(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    showToast('تم تحديث التبويب الأساسي');
  };

  const deleteMainCategory = (id: string) => {
    setMainCategories(prev => prev.filter(m => m.id !== id));
    setSubCategories(prev => prev.filter(s => s.mainCategoryId !== id));
    showToast('تم حذف التبويب الأساسي والتبويبات التابعة له', 'info');
  };

  const addSubCategory = (data: Omit<SubCategory, 'id'>) => {
    const newSub: SubCategory = { ...data, id: `sc-${Date.now()}` };
    setSubCategories(prev => [...prev, newSub]);
    showToast(`تمت إضافة التبويب الفرعي (${newSub.name})`);
  };

  const updateSubCategory = (id: string, data: Partial<SubCategory>) => {
    setSubCategories(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    showToast('تم تحديث التبويب الفرعي');
  };

  const deleteSubCategory = (id: string) => {
    setSubCategories(prev => prev.filter(s => s.id !== id));
    showToast('تم حذف التبويب الفرعي', 'info');
  };

  // Departments CRUD
  const addDepartment = (data: Omit<Department, 'id'>) => {
    const newDept: Department = { ...data, id: `dept-${Date.now()}` };
    setDepartments(prev => [...prev, newDept]);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إدارة مستخدمين',
      entityType: 'نظام',
      entityTitle: newDept.name,
      details: `تمت إضافة دائرة/وزارة جديدة: ${newDept.name} (${newDept.nameEn})`
    });
    showToast(`تمت إضافة (${newDept.name}) بنجاح`);
  };

  const updateDepartment = (id: string, data: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إدارة مستخدمين',
      entityType: 'نظام',
      details: 'تم تحديث بيانات الدائرة والاسم باللغة الإنكليزية'
    });
    showToast('تم تحديث بيانات الدائرة بنجاح');
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    showToast('تم حذف الدائرة', 'info');
  };

  // Users CRUD
  const addUser = (data: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إدارة مستخدمين',
      entityType: 'مستخدم',
      entityId: newUser.id,
      entityTitle: newUser.fullName,
      details: `تمت إضافة مستخدم جديد: ${newUser.fullName} برتبة (${newUser.role})`
    });
    showToast(`تمت إضافة المستخدم (${newUser.fullName}) بنجاح`);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser.id === id) {
      setCurrentUserState(prev => ({ ...prev, ...data }));
    }
    showToast('تم تحديث بيانات المستخدم');
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) {
      showToast('لا يمكن حذف حساب المستخدم النشط حالياً', 'error');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إدارة مستخدمين',
      entityType: 'مستخدم',
      entityId: id,
      details: 'تم حذف حساب المستخدم'
    });
    showToast('تم حذف المستخدم', 'info');
  };

  // DOCUMENTS CRUD (with Soft Delete & Restore)
  const addDocument = (data: Omit<CabinetDocument, 'id' | 'createdAt'>) => {
    const newDoc: CabinetDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      isDeleted: false
    };
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إضافة وثيقة',
      entityType: 'وثيقة',
      entityId: newDoc.id,
      entityTitle: newDoc.subject,
      details: `تمت إضافة وثيقة جديدة: ${newDoc.subject}`
    });
    showToast(`تمت إضافة وثيقة (${newDoc.subject.substring(0, 30)}...) بنجاح`);
  };

  const updateDocument = (id: string, data: Partial<CabinetDocument>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'تعديل وثيقة',
      entityType: 'وثيقة',
      entityId: id,
      details: 'تم تحديث بيانات وملف الوثيقة'
    });
    showToast('تم تحديث الوثيقة بنجاح');
  };

  // SOFT DELETE DOCUMENT
  const deleteDocument = (id: string, reason: string = 'تم الحذف بواسطة المستخدم') => {
    const doc = documents.find(d => d.id === id);
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('ar-EG')}`;
    setDocuments(prev => prev.map(d => d.id === id ? {
      ...d,
      isDeleted: true,
      deletedAt: nowStr,
      deletedByUserId: currentUser.id,
      deletedByUserName: currentUser.fullName,
      deletionReason: reason
    } : d));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'حذف وثيقة',
      entityType: 'وثيقة',
      entityId: id,
      entityTitle: doc?.subject,
      details: `تم حذف الوثيقة ونقلها لسلة المحذوفات. السبب: ${reason}`
    });
    showToast('تم نقل الوثيقة إلى سلة المحذوفات (يمكن استعادتها)', 'info');
  };

  // RESTORE DOCUMENT
  const restoreDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    setDocuments(prev => prev.map(d => d.id === id ? {
      ...d,
      isDeleted: false,
      deletedAt: undefined,
      deletedByUserId: undefined,
      deletedByUserName: undefined,
      deletionReason: undefined
    } : d));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'استعادة وثيقة',
      entityType: 'وثيقة',
      entityId: id,
      entityTitle: doc?.subject,
      details: 'تم استعادة الوثيقة المحذوفة بنجاح إلى الأرشيف النشط'
    });
    showToast('تمت استعادة الوثيقة بنجاح إلى الأرشيف النشط', 'success');
  };

  // PERMANENT DELETE DOCUMENT
  const permanentDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'حذف نهائي',
      entityType: 'وثيقة',
      entityId: id,
      details: 'تم حذف الوثيقة نهائياً من قاعدة البيانات'
    });
    showToast('تم حذف الوثيقة نهائياً', 'error');
  };

  const toggleDocumentVisibility = (id: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        const nextState = !d.isHidden;
        showToast(nextState ? 'تم إخفاء الوثيقة' : 'تم إظهار الوثيقة', 'info');
        return { ...d, isHidden: nextState };
      }
      return d;
    }));
  };

  // DECISIONS CRUD (with Soft Delete & Restore)
  const addDecision = (data: Omit<Decision, 'id' | 'createdAt'>) => {
    const isDir = data.isDirective || data.decisionNumber === '0';
    const newDec: Decision = {
      ...data,
      id: `dec-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      isDeleted: false,
      isDirective: isDir,
      decisionNumber: isDir ? '0' : data.decisionNumber
    };
    setDecisions(prev => [newDec, ...prev]);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إضافة قرار',
      entityType: isDir ? 'توجيه' : 'قرار',
      entityId: newDec.id,
      entityTitle: isDir ? `توجيه رقم 0: ${newDec.subject}` : `قرار رقم ${newDec.decisionNumber}`,
      details: `تم إصدار وتوثيق ${isDir ? 'التوجيه الوزاري' : 'القرار الوزاري رقم ' + newDec.decisionNumber} بنجاح`
    });
    showToast(isDir ? 'تم توثيق التوجيه الوزاري (رقم 0) بنجاح' : `تم إصدار القرار رقم (${newDec.decisionNumber}) بنجاح`);
    return newDec;
  };

  const updateDecision = (id: string, data: Partial<Decision>) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'تعديل قرار',
      entityType: 'قرار',
      entityId: id,
      details: 'تم تحديث بيانات القرار/التوجيه والجهات المعنية'
    });
    showToast('تم تعديل بيانات القرار بنجاح');
  };

  // SOFT DELETE DECISION
  const deleteDecision = (id: string, reason: string = 'تم الحذف بواسطة المستخدم') => {
    const dec = decisions.find(d => d.id === id);
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('ar-EG')}`;
    setDecisions(prev => prev.map(d => d.id === id ? {
      ...d,
      isDeleted: true,
      deletedAt: nowStr,
      deletedByUserId: currentUser.id,
      deletedByUserName: currentUser.fullName,
      deletionReason: reason
    } : d));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'حذف قرار',
      entityType: dec?.isDirective ? 'توجيه' : 'قرار',
      entityId: id,
      entityTitle: dec?.isDirective ? 'توجيه رقم 0' : `قرار رقم ${dec?.decisionNumber}`,
      details: `تم نقل القرار/التوجيه لسلة المحذوفات. السبب: ${reason}`
    });
    showToast('تم نقل القرار إلى سلة المحذوفات (يمكن استعادته)', 'info');
  };

  // RESTORE DECISION
  const restoreDecision = (id: string) => {
    const dec = decisions.find(d => d.id === id);
    setDecisions(prev => prev.map(d => d.id === id ? {
      ...d,
      isDeleted: false,
      deletedAt: undefined,
      deletedByUserId: undefined,
      deletedByUserName: undefined,
      deletionReason: undefined
    } : d));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'استعادة قرار',
      entityType: dec?.isDirective ? 'توجيه' : 'قرار',
      entityId: id,
      entityTitle: dec?.isDirective ? 'توجيه رقم 0' : `قرار رقم ${dec?.decisionNumber}`,
      details: 'تمت استعادة القرار/التوجيه بنجاح إلى سجل القرارات النشطة'
    });
    showToast('تمت استعادة القرار بنجاح', 'success');
  };

  // PERMANENT DELETE DECISION
  const permanentDeleteDecision = (id: string) => {
    setDecisions(prev => prev.filter(d => d.id !== id));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'حذف نهائي',
      entityType: 'قرار',
      entityId: id,
      details: 'تم حذف القرار نهائياً من قاعدة البيانات'
    });
    showToast('تم حذف القرار نهائياً', 'error');
  };

  const toggleDecisionVisibility = (id: string) => {
    setDecisions(prev => prev.map(d => {
      if (d.id === id) {
        const nextState = !d.isHidden;
        showToast(nextState ? 'تم إخفاء القرار' : 'تم إظهار القرار', 'info');
        return { ...d, isHidden: nextState };
      }
      return d;
    }));
  };

  // DECISION RELATIONS
  const addDecisionRelation = (relationData: Omit<DecisionRelation, 'id' | 'createdAt' | 'createdByName'>) => {
    const newRel: DecisionRelation = {
      ...relationData,
      id: `rel-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      createdByName: currentUser.fullName
    };
    setDecisionRelations(prev => [newRel, ...prev]);
    const src = decisions.find(d => d.id === relationData.sourceDecisionId);
    const tgt = decisions.find(d => d.id === relationData.targetDecisionId);
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'ربط قرار',
      entityType: 'قرار',
      entityId: relationData.sourceDecisionId,
      entityTitle: `ربط القرار ${src?.decisionNumber || ''} بالقرار ${tgt?.decisionNumber || ''}`,
      details: `تم إنشاء علاقة ربط (${relationData.relationType}) بين القرار (${src?.decisionNumber || ''}) والقرار (${tgt?.decisionNumber || ''})`
    });
    showToast('تم ربط القرارين بنجاح', 'success');
  };

  const deleteDecisionRelation = (id: string) => {
    setDecisionRelations(prev => prev.filter(r => r.id !== id));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: 'إلغاء ربط قرار',
      entityType: 'قرار',
      details: 'تم فك الربط بين القرارين'
    });
    showToast('تم إلغاء ربط القرار', 'info');
  };

  const getDecisionRelations = (decisionId: string) => {
    const outgoing = decisionRelations.filter(r => r.sourceDecisionId === decisionId);
    const incoming = decisionRelations.filter(r => r.targetDecisionId === decisionId);
    return { outgoing, incoming };
  };

  // DOCUMENT RECEIPTS & VIEWS TRACKING
  const recordDocumentView = (docId: string, docTitle: string) => {
    if (!currentDepartment) return;
    const existing = documentReceipts.find(
      r => r.documentId === docId && r.userId === currentUser.id
    );
    if (!existing) {
      const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('ar-EG')}`;
      const newReceipt: DocumentReceiptLog = {
        id: `rcpt-${Date.now()}`,
        documentId: docId,
        documentTitle: docTitle,
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        departmentId: currentDepartment.id,
        departmentName: currentDepartment.name,
        departmentNameEn: currentDepartment.nameEn,
        viewedAt: nowStr,
        status: 'تم الاطلاع فقط'
      };
      setDocumentReceipts(prev => [newReceipt, ...prev]);
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        departmentName: currentDepartment.name,
        actionType: 'اطلاع على وثيقة',
        entityType: 'وثيقة',
        entityId: docId,
        entityTitle: docTitle,
        details: `قام المستخدم بالاطلاع على الوثيقة بصفته ممثلاً عن (${currentDepartment.name})`
      });
    }
  };

  const confirmDocumentReceipt = (docId: string, docTitle: string, receiptNumber: string = '', notes: string = '') => {
    if (!currentDepartment) return;
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('ar-EG')}`;
    const generatedReceiptNum = receiptNumber.trim() || `إشعار-${currentDepartment.code}/${new Date().getFullYear()}/${Math.floor(Math.random() * 800) + 100}`;

    setDocumentReceipts(prev => {
      const index = prev.findIndex(r => r.documentId === docId && r.userId === currentUser.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          confirmedAt: nowStr,
          status: 'تم تأكيد الاستلام رسمياً',
          receiptNumber: generatedReceiptNum,
          notes: notes.trim() || 'تم تأكيد الاستلام الرسمي والتوقيع الإلكتروني'
        };
        return copy;
      } else {
        const newReceipt: DocumentReceiptLog = {
          id: `rcpt-${Date.now()}`,
          documentId: docId,
          documentTitle: docTitle,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role,
          departmentId: currentDepartment.id,
          departmentName: currentDepartment.name,
          departmentNameEn: currentDepartment.nameEn,
          viewedAt: nowStr,
          confirmedAt: nowStr,
          status: 'تم تأكيد الاستلام رسمياً',
          receiptNumber: generatedReceiptNum,
          notes: notes.trim() || 'تم تأكيد الاستلام الرسمي والتوقيع الإلكتروني'
        };
        return [newReceipt, ...prev];
      }
    });

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment.name,
      actionType: 'تأكيد استلام',
      entityType: 'وثيقة',
      entityId: docId,
      entityTitle: docTitle,
      details: `تم تأكيد الاستلام الرسمي للوثيقة برقم صادر داخلي: (${generatedReceiptNum})`
    });

    showToast(`تم تأكيد استلام الوثيقة رسمياً برقم إشعار: ${generatedReceiptNum}`, 'success');
  };

  const getDocumentReceiptLogs = (docId: string) => {
    return documentReceipts.filter(r => r.documentId === docId);
  };

  // MINISTERIAL DISPATCHES
  const addMinisterialDispatch = (data: Omit<MinisterialDispatch, 'id' | 'createdAt'>) => {
    const newDispatch: MinisterialDispatch = {
      ...data,
      id: `disp-${Date.now()}`,
      createdAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('ar-EG')}`
    };
    setMinisterialDispatches(prev => [newDispatch, ...prev]);
    const isToCabinet = data.direction === 'من الوزارة إلى مجلس الوزراء';
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      departmentName: currentDepartment?.name || 'غير محددة',
      actionType: isToCabinet ? 'إرسال مراسلة لمجلس الوزراء' : 'إرسال مراسلة للوزارة',
      entityType: 'مراسلة',
      entityId: newDispatch.id,
      entityTitle: newDispatch.subject,
      details: `تم إرسال مراسلة رسمية (${newDispatch.priority}) من ${newDispatch.fromDepartmentName} إلى ${newDispatch.toDepartmentName}`
    });
    showToast('تم إرسال المراسلة الرسمية بنجاح إلى الجهة المعنية', 'success');
  };

  const updateMinisterialDispatchStatus = (id: string, status: MinisterialDispatch['status'], notes?: string) => {
    setMinisterialDispatches(prev => prev.map(d => d.id === id ? {
      ...d,
      status,
      notes: notes !== undefined ? notes : d.notes
    } : d));
    showToast(`تم تحديث حالة المراسلة إلى: ${status}`, 'info');
  };

  const confirmDispatchReceipt = (id: string) => {
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('ar-EG')}`;
    setMinisterialDispatches(prev => prev.map(d => d.id === id ? {
      ...d,
      confirmedAt: nowStr,
      status: 'مكتمل'
    } : d));
    showToast('تم تأكيد استلام المراسلة الوزارية', 'success');
  };

  const resetDatabase = () => {
    localStorage.clear();
    setGovernments(INITIAL_GOVERNMENTS);
    setYears(INITIAL_YEARS);
    setSessions(INITIAL_SESSIONS);
    setDocumentTypes(INITIAL_DOCUMENT_TYPES);
    setMainCategories(INITIAL_MAIN_CATEGORIES);
    setSubCategories(INITIAL_SUB_CATEGORIES);
    setDepartments(INITIAL_DEPARTMENTS);
    setUsers(INITIAL_USERS);
    setDocuments(INITIAL_DOCUMENTS);
    setDecisions(INITIAL_DECISIONS);
    setDecisionRelations(INITIAL_DECISION_RELATIONS);
    setDocumentReceipts(INITIAL_DOCUMENT_RECEIPTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setMinisterialDispatches(INITIAL_MINISTERIAL_DISPATCHES);
    setSystemSettings(INITIAL_SYSTEM_SETTINGS);
    setNewsTickerItems(INITIAL_NEWS_TICKER);
    setHomepageFiles(INITIAL_HOMEPAGE_FILES);
    setFooterFiles(INITIAL_FOOTER_FILES);
    setOnlineSessions(INITIAL_ONLINE_SESSIONS);
    setReadNotifIds([]);
    setCurrentUser(INITIAL_USERS[0]);
    showToast('تم استعادة قاعدة البيانات النموذجية بنجاح', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isDarkMode,
        toggleDarkMode,
        themeColor,
        setThemeColor,
        toasts,
        showToast,
        removeToast,
        currentUser,
        currentDepartment,
        setCurrentUser,
        switchUserRole,
        updateCurrentUserProfile,
        canManageSystem,
        canManageAgenda,
        canManageAccounts,
        canAddDrafts,
        lockUserAccount,
        unlockUserAccount,
        adminResetUserPassword,
        toggleUserActiveStatus,
        canUserAccessDocument,
        departmentNotifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        selectedGovernmentId,
        setSelectedGovernmentId,
        selectedYearId,
        setSelectedYearId,
        selectedSessionId,
        setSelectedSessionId,
        governments,
        years,
        sessions,
        documentTypes,
        mainCategories,
        subCategories,
        departments,
        users,
        documents,
        decisions,
        activeDocuments,
        deletedDocuments,
        activeDecisions,
        deletedDecisions,
        addGovernment,
        updateGovernment,
        deleteGovernment,
        toggleGovernmentVisibility,
        addYear,
        updateYear,
        deleteYear,
        toggleYearVisibility,
        addSession,
        updateSession,
        deleteSession,
        toggleSessionVisibility,
        addDocumentType,
        updateDocumentType,
        deleteDocumentType,
        addMainCategory,
        updateMainCategory,
        deleteMainCategory,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addUser,
        updateUser,
        deleteUser,
        addDocument,
        updateDocument,
        deleteDocument,
        restoreDocument,
        permanentDeleteDocument,
        toggleDocumentVisibility,
        addDecision,
        updateDecision,
        deleteDecision,
        restoreDecision,
        permanentDeleteDecision,
        toggleDecisionVisibility,
        decisionRelations,
        addDecisionRelation,
        deleteDecisionRelation,
        getDecisionRelations,
        documentReceipts,
        recordDocumentView,
        confirmDocumentReceipt,
        getDocumentReceiptLogs,
        auditLogs,
        addAuditLog,
        ministerialDispatches,
        addMinisterialDispatch,
        updateMinisterialDispatchStatus,
        confirmDispatchReceipt,
        systemSettings,
        updateSystemSettings,
        newsTickerItems,
        activeNewsTickerItems,
        addNewsTickerItem,
        updateNewsTickerItem,
        deleteNewsTickerItem,
        toggleNewsTickerVisibility,
        homepageFiles,
        addHomepageFile,
        updateHomepageFile,
        deleteHomepageFile,
        toggleHomepageFileVisibility,
        footerFiles,
        addFooterFile,
        deleteFooterFile,
        toggleFooterFileVisibility,
        onlineSessions,
        onlineUsersCount: onlineSessions.length,
        isOnlineUsersModalOpen,
        setIsOnlineUsersModalOpen,
        isPasswordChangeModalOpen,
        setIsPasswordChangeModalOpen,
        changeUserPassword,
        isPasswordExpired,
        simulateFailedLogin,
        unlockUserAccount,
        resetDatabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

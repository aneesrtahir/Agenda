import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  HardDrive,
  Shield,
  Lock,
  KeyRound,
  FileText,
  FileCode,
  Image,
  Video,
  FileSpreadsheet,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  RefreshCw,
  FolderCheck,
  Unlock,
  Users,
  Layers,
  Save,
  Check,
  Download
} from 'lucide-react';
import {
  SystemSettings,
  PasswordExpirationPeriod,
  HomepageFeaturedFile,
  HomepageFileType,
  FooterPublicFile
} from '../../types';

export const SystemSettingsManager: React.FC = () => {
  const {
    systemSettings,
    updateSystemSettings,
    homepageFiles,
    addHomepageFile,
    updateHomepageFile,
    deleteHomepageFile,
    toggleHomepageFileVisibility,
    footerFiles,
    addFooterFile,
    deleteFooterFile,
    toggleFooterFileVisibility,
    users,
    simulateFailedLogin,
    unlockUserAccount,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'storage-security' | 'homepage-files' | 'footer-files'>('storage-security');

  // Local form state for settings
  const [formData, setFormData] = useState<SystemSettings>({ ...systemSettings });

  // Test failed login simulator state
  const [testUsername, setTestUsername] = useState('user_mustafa');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Modal states for Homepage Files
  const [isHomeFileModalOpen, setIsHomeFileModalOpen] = useState(false);
  const [editingHomeFileId, setEditingHomeFileId] = useState<string | null>(null);
  const [homeFileForm, setHomeFileForm] = useState<{
    title: string;
    description: string;
    fileType: HomepageFileType;
    fileName: string;
    fileSize: string;
    fileUrl?: string;
    videoDuration?: string;
    orderIndex: number;
    isVisible: boolean;
  }>({
    title: '',
    description: '',
    fileType: 'pdf',
    fileName: '',
    fileSize: '2.5 MB',
    videoDuration: '',
    orderIndex: homepageFiles.length + 1,
    isVisible: true
  });

  // Modal states for Footer Files
  const [isFooterFileModalOpen, setIsFooterFileModalOpen] = useState(false);
  const [footerFileForm, setFooterFileForm] = useState<{
    title: string;
    description: string;
    fileType: 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image';
    fileName: string;
    fileSize: string;
    category: string;
    isVisible: boolean;
  }>({
    title: '',
    description: '',
    fileType: 'pdf',
    fileName: '',
    fileSize: '1.2 MB',
    category: 'أدلة إرشادية',
    isVisible: true
  });

  const periodOptions: PasswordExpirationPeriod[] = [
    'يوم',
    'يومين',
    'ثلاثة ايام',
    'اسبوع',
    'اسبوعين',
    'ثلاثة اسابيع',
    'شهر',
    'شهرين',
    'ثلاثة اشهر',
    'ستة اشهر'
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(formData);
  };

  const handleRunLoginTest = () => {
    const res = simulateFailedLogin(testUsername);
    if (res.isLocked) {
      setTestResult(`تم قفل حساب (${testUsername}) بنجاح! تم استنفاد الحد الأقصى (${formData.maxFailedLoginAttempts} محاولات).`);
    } else {
      setTestResult(`محاولة فاشلة مسجلة. المحاولات المتبقية قبل القفل: (${res.remainingAttempts}) محاولة.`);
    }
  };

  // Homepage File CRUD Handlers
  const handleOpenAddHomeFile = () => {
    setEditingHomeFileId(null);
    setHomeFileForm({
      title: '',
      description: '',
      fileType: 'pdf',
      fileName: '',
      fileSize: '2.0 MB',
      videoDuration: '',
      orderIndex: homepageFiles.length + 1,
      isVisible: true
    });
    setIsHomeFileModalOpen(true);
  };

  const handleOpenEditHomeFile = (f: HomepageFeaturedFile) => {
    setEditingHomeFileId(f.id);
    setHomeFileForm({
      title: f.title,
      description: f.description,
      fileType: f.fileType,
      fileName: f.fileName,
      fileSize: f.fileSize,
      fileUrl: f.fileUrl,
      videoDuration: f.videoDuration,
      orderIndex: f.orderIndex,
      isVisible: f.isVisible
    });
    setIsHomeFileModalOpen(true);
  };

  const handleSaveHomeFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHomeFileId) {
      updateHomepageFile(editingHomeFileId, homeFileForm);
    } else {
      addHomepageFile(homeFileForm);
    }
    setIsHomeFileModalOpen(false);
  };

  // Footer File CRUD Handlers
  const handleSaveFooterFile = (e: React.FormEvent) => {
    e.preventDefault();
    addFooterFile(footerFileForm);
    setIsFooterFileModalOpen(false);
    setFooterFileForm({
      title: '',
      description: '',
      fileType: 'pdf',
      fileName: '',
      fileSize: '1.2 MB',
      category: 'أدلة إرشادية',
      isVisible: true
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4 text-emerald-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'word':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'powerpoint':
        return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'pdf':
      default:
        return <FileCode className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              إعدادات النظام، الأمان، وإدارة الحاويات
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            التحكم المركزي في حاوية ملفات الخادم، سياسات كلمات المرور، محاولات الدخول، وملفات الصفحة الرئيسية والفوتر
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono text-left">
          <div>آخر تحديث: {systemSettings.updatedAt}</div>
          <div>بواسطة: {systemSettings.updatedByUserName}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('storage-security')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'storage-security'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>حاوية الخادم وسياسات كلمات المرور</span>
        </button>

        <button
          onClick={() => setActiveTab('homepage-files')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'homepage-files'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ملفات ووسائط الصفحة الرئيسية ({homepageFiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('footer-files')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'footer-files'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderCheck className="w-4 h-4" />
          <span>ملفات فوتر الموقع المتاحة للجميع ({footerFiles.length})</span>
        </button>
      </div>

      {/* TAB 1: Storage & Security Settings */}
      {activeTab === 'storage-security' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Section 1: Server Upload Storage Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-xl">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  مكان الحاوية الرئيسية لحفظ الملفات المرفوعة من الخادم (Storage Vault Container)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تحديد مسار المجلد الفيزيائي أو الحاوية السحابية التي يستقبل فيها خادم الويب كافة الملفات والوثائق المرفوعة
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  المسار الفيزيائي للحاوية الرئيسية على الخادم *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.storageContainerPath}
                    onChange={(e) => setFormData(prev => ({ ...prev, storageContainerPath: e.target.value }))}
                    placeholder="/var/cabinet_archive/secure_uploads/vault"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                  />
                  <FolderLock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  المسار الافتراضي الموصى به للخوادم الحكومية: <code className="font-mono">/var/cabinet_archive/secure_uploads/vault</code>
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  نوع وسيط التخزين والحاوية
                </label>
                <select
                  value={formData.storageProvider}
                  onChange={(e) => setFormData(prev => ({ ...prev, storageProvider: e.target.value as any }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="خادم محلي مؤمن (Local Storage Vault)">خادم محلي مؤمن (Local Storage Vault)</option>
                  <option value="حاوية سحابية (Azure/S3 Blob Storage)">حاوية سحابية (Azure/S3 Blob Storage)</option>
                  <option value="شبكة التخزين الحكومية (NFS Vault)">شبكة التخزين الحكومية (NFS Vault)</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  يدعم التشفير التلقائي أثناء السكون (AES-256)
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  سعة الحاوية المخصصة (GB)
                </label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  value={formData.storageQuotaGb}
                  onChange={(e) => setFormData(prev => ({ ...prev, storageQuotaGb: Number(e.target.value) }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  الحد الأقصى لحجم الملف الواحد المرفوع (MB)
                </label>
                <input
                  type="number"
                  value={Math.round(formData.maxUploadSizeBytes / (1024 * 1024))}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxUploadSizeBytes: Number(e.target.value) * 1024 * 1024 }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>حالة الحاوية: متصلة وجاهزة لاستقبال الملفات مع فحص تلقائي لبصمات SHA-256</span>
              </div>
              <button
                type="button"
                onClick={() => showToast('تم فحص الحاوية: المسار متاح والمساحة المتبقية 384 GB', 'success')}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>اختبار الاتصال بالحاوية</span>
              </button>
            </div>
          </div>

          {/* Section 2: Password Policies & Failed Attempts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-amber-100 dark:bg-amber-950/80 text-amber-600 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  سياسات أمان كلمات المرور ومحاولات الدخول الخاطئة
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تحديد عدد المحاولات الخاطئة المسموحة (3-10)، فترات إجبار التبديل، وفرض التغيير عند أول تسجيل دخول
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              
              {/* Failed Attempts Setting (3 to 10) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-slate-900 dark:text-white font-bold">
                  عدد محاولات كلمة المرور الخاطئة قبل قفل الحساب مؤقتاً (من 3 إلى 10) *
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={formData.maxFailedLoginAttempts}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxFailedLoginAttempts: Number(e.target.value) }))}
                    className="w-32 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num} محاولات
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    الحالي: <strong>{formData.maxFailedLoginAttempts} محاولات</strong> ثم يتم القفل تلقائياً
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  عند استنفاد المحاولات، يتم تجميد الجلسة لمدة {formData.lockoutDurationMinutes} دقيقة أو حتى يتدخل مدير النظام لإلغاء القفل.
                </p>
              </div>

              {/* Password Expiration Period Setting */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-slate-900 dark:text-white font-bold">
                  إجبار المستخدمين على تبديل كلمة المرور خلال فترة زمنية *
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={formData.passwordExpirationPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, passwordExpirationPeriod: e.target.value as PasswordExpirationPeriod }))}
                    className="w-44 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden"
                  >
                    {periodOptions.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPasswordExpirationEnforced}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPasswordExpirationEnforced: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">تفعيل الإلزام</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  الفترات المتوفرة: يوم، يومين، ثلاثة ايام، اسبوع، اسبوعين، ثلاثة اسابيع، شهر، شهرين، ثلاثة اشهر، ستة اشهر.
                </p>
              </div>

              {/* Force Password Change on First Login */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    إجبار المستخدم الجديد على تبديل كلمة المرور عند الدخول الأول
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    يلزم أي مستخدم ينشئه المدير بتعيين كلمة مرور شخصية فور تسجيل دخوله الأول للمنظومة لتعزيز السرية.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.forceChangePasswordOnFirstLogin}
                  onChange={(e) => setFormData(prev => ({ ...prev, forceChangePasswordOnFirstLogin: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-5 h-5 shrink-0 mt-1 cursor-pointer"
                />
              </div>

              {/* Force Password Change on Admin Reset */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    إجبار المستخدم على تبديل كلمة المرور عند إعادة تعيينها من قبل الإدارة
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    عند قيام الـ Admin بإعادة تعيين كلمة مرور أي موظف، يطلب النظام منه استبدالها بكلمة جديدة فورية.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.forceChangePasswordOnAdminReset}
                  onChange={(e) => setFormData(prev => ({ ...prev, forceChangePasswordOnAdminReset: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-5 h-5 shrink-0 mt-1 cursor-pointer"
                />
              </div>

            </div>

            {/* Interactive Simulation / Test Tool */}
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                    أداة تجربة واختبار قفل الحساب عند تجاوز المحاولات الخاطئة ({formData.maxFailedLoginAttempts} محاولات)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
                <select
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 w-full sm:w-60 focus:outline-hidden"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.username}>
                      {u.fullName} (@{u.username}) {u.isLockedOut ? '[مقفل حالياً]' : ''}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleRunLoginTest}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors shadow-2xs"
                >
                  محاكاة محاولة كلمة مرور خاطئة
                </button>

                {users.find(u => u.username === testUsername)?.isLockedOut && (
                  <button
                    type="button"
                    onClick={() => {
                      const u = users.find(user => user.username === testUsername);
                      if (u) unlockUserAccount(u.id);
                      setTestResult('تم إلغاء قفل الحساب بنجاح وتصفير المحاولات.');
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>إلغاء قفل الحساب فوراً</span>
                  </button>
                )}
              </div>

              {testResult && (
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 border border-amber-200 dark:border-amber-800">
                  {testResult}
                </div>
              )}
            </div>

          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ واعتماد إعدادات النظام وسياسات الأمان</span>
            </button>
          </div>

        </form>
      )}

      {/* TAB 2: Homepage Media & Documents */}
      {activeTab === 'homepage-files' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  إدارة ملفات ووسائط الصفحة الرئيسية
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  إضافة، تعديل، حذف، وعرض/إخفاء الصور، وثائق Word، جداول Excel، عروض PowerPoint، ملفات PDF، ومقاطع الفيديو
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddHomeFile}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ملف أو وسيط جديد</span>
              </button>
            </div>

            {/* Files Grid / Table */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              {homepageFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    !file.isVisible ? 'opacity-60 bg-slate-50 dark:bg-slate-900/60' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getFileIcon(file.fileType)}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {file.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {file.fileType}
                        </span>
                        {!file.isVisible && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                            مخفي عن الواجهة
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {file.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>اسم الملف: {file.fileName}</span>
                        <span>·</span>
                        <span>الحجم: {file.fileSize}</span>
                        {file.videoDuration && (
                          <>
                            <span>·</span>
                            <span>المدة: {file.videoDuration}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>الترتيب: #{file.orderIndex}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => toggleHomepageFileVisibility(file.id)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title={file.isVisible ? 'إخفاء من الصفحة الرئيسية' : 'إظهار في الصفحة الرئيسية'}
                    >
                      {file.isVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button
                      onClick={() => handleOpenEditHomeFile(file)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 transition-colors"
                      title="تعديل بيانات الملف"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteHomepageFile(file.id)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 transition-colors"
                      title="حذف نهائي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Footer Public Files */}
      {activeTab === 'footer-files' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  إدارة ملفات فوتر الموقع المتاحة للجميع (الزائرين والمستخدمين)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  عرض اللوائح، النماذج، والأدلة الإرشادية العامة في تذييل الموقع والتحكم بإضافتها وحذفها
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFooterFileModalOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ملف للفوتر</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              {footerFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    !file.isVisible ? 'opacity-60 bg-slate-50 dark:bg-slate-900/60' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getFileIcon(file.fileType)}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {file.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {file.category}
                        </span>
                        {!file.isVisible && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            مخفي
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {file.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>{file.fileName}</span>
                        <span>·</span>
                        <span>{file.fileSize}</span>
                        <span>·</span>
                        <span>تاريخ الإضافة: {file.addedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => toggleFooterFileVisibility(file.id)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title={file.isVisible ? 'إخفاء من الفوتر' : 'إظهار في الفوتر'}
                    >
                      {file.isVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button
                      onClick={() => deleteFooterFile(file.id)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 transition-colors"
                      title="حذف نهائي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Homepage File */}
      {isHomeFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingHomeFileId ? 'تعديل ملف الصفحة الرئيسية' : 'إضافة ملف أو وسيط جديد للصفحة الرئيسية'}
              </h3>
              <button onClick={() => setIsHomeFileModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <Trash2 className="w-4 h-4 hidden" /> ✕
              </button>
            </div>

            <form onSubmit={handleSaveHomeFile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  عنوان الملف المعروض *
                </label>
                <input
                  type="text"
                  required
                  value={homeFileForm.title}
                  onChange={(e) => setHomeFileForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: وثيقة Word: دليل صياغة المذكرات"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    نوع الملف *
                  </label>
                  <select
                    value={homeFileForm.fileType}
                    onChange={(e) => setHomeFileForm(prev => ({ ...prev, fileType: e.target.value as HomepageFileType }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="image">صورة (Image)</option>
                    <option value="word">مستند وورد (Word .docx)</option>
                    <option value="excel">جدول اكسل (Excel .xlsx)</option>
                    <option value="powerpoint">عرض بوربوينت (PowerPoint .pptx)</option>
                    <option value="pdf">وثيقة PDF</option>
                    <option value="video">مقطع فيديو (Video MP4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    اسم الملف الفيزيائي *
                  </label>
                  <input
                    type="text"
                    required
                    value={homeFileForm.fileName}
                    onChange={(e) => setHomeFileForm(prev => ({ ...prev, fileName: e.target.value }))}
                    placeholder="Document_sample.pdf"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  الوصف والمحتوى التوضيحي *
                </label>
                <textarea
                  rows={2}
                  required
                  value={homeFileForm.description}
                  onChange={(e) => setHomeFileForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مختصر لمحتوى الملف والهدف منه..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    حجم الملف التقريبي
                  </label>
                  <input
                    type="text"
                    value={homeFileForm.fileSize}
                    onChange={(e) => setHomeFileForm(prev => ({ ...prev, fileSize: e.target.value }))}
                    placeholder="3.2 MB"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    مدة الفيديو (إن كان فيديو)
                  </label>
                  <input
                    type="text"
                    value={homeFileForm.videoDuration || ''}
                    onChange={(e) => setHomeFileForm(prev => ({ ...prev, videoDuration: e.target.value }))}
                    placeholder="03:45 دقيقة"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={homeFileForm.isVisible}
                  onChange={(e) => setHomeFileForm(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  عرض الملف فورياً في معرض الصفحة الرئيسية
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsHomeFileModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  حفظ الملف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Footer File */}
      {isFooterFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                إضافة ملف جديد لفوتر الموقع
              </h3>
              <button onClick={() => setIsFooterFileModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFooterFile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  عنوان الملف / الدليل *
                </label>
                <input
                  type="text"
                  required
                  value={footerFileForm.title}
                  onChange={(e) => setFooterFileForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: الدليل الإرشادي لاستخدام المنظومة"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    التصنيف *
                  </label>
                  <select
                    value={footerFileForm.category}
                    onChange={(e) => setFooterFileForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="أدلة إرشادية">أدلة إرشادية</option>
                    <option value="لوائح تنظيمية">لوائح تنظيمية</option>
                    <option value="نماذج استمارات">نماذج استمارات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    نوع الملف *
                  </label>
                  <select
                    value={footerFileForm.fileType}
                    onChange={(e) => setFooterFileForm(prev => ({ ...prev, fileType: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="pdf">وثيقة PDF</option>
                    <option value="word">مستند Word</option>
                    <option value="excel">جدول Excel</option>
                    <option value="powerpoint">عرض PowerPoint</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  اسم الملف *
                </label>
                <input
                  type="text"
                  required
                  value={footerFileForm.fileName}
                  onChange={(e) => setFooterFileForm(prev => ({ ...prev, fileName: e.target.value }))}
                  placeholder="Guide_2025.pdf"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  شرح مختصر
                </label>
                <textarea
                  rows={2}
                  value={footerFileForm.description}
                  onChange={(e) => setFooterFileForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مختصر للملف..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFooterFileModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  إضافة للفوتر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Shield,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Palette,
  KeyRound,
  Lock
} from 'lucide-react';
import { ThemeColor } from '../../types';

export const UserProfile: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    departments,
    users,
    setCurrentUser,
    switchUserRole,
    isDarkMode,
    toggleDarkMode,
    themeColor,
    setThemeColor,
    systemSettings,
    setIsPasswordChangeModalOpen,
    isPasswordExpired
  } = useApp();

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDept = departments.find(d => d.id === currentUser.departmentId);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      fullName,
      email,
      phone,
      jobTitle,
      avatarUrl: avatarPreview
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          الملف الشخصي ورفع الصورة الرسمية
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          إدارة البيانات الشخصية، رفع وتحديث صورة الحساب ومراجعة الصلاحيات الممنوحة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: Avatar & Quick Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs text-center space-y-4 flex flex-col items-center">
          
          {/* Avatar with Upload button */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-emerald-600/40 shadow-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-700 dark:text-slate-200">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser.fullName.charAt(0)
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 left-0 p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-lg transition-transform hover:scale-105"
              title="تغيير ورفع صورة جديدة"
              aria-label="تغيير ورفع صورة جديدة"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {currentUser.fullName}
            </h2>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              @{currentUser.username}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Shield className="w-3.5 h-3.5" />
            <span>الصلاحية: {currentUser.role}</span>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 text-right">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">الدائرة:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{currentDept?.name || 'الأمانة العامة'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">تاريخ الانضمام:</span>
              <span className="font-mono">{currentUser.createdAt}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>رفع صورة جديدة للملف</span>
          </button>

        </div>

        {/* Right Form: Edit Details */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            تحديث البيانات الشخصية والتواصل
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                الاسم الكامل *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  رقم الهاتف الرسمي *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                المسمى الوظيفي
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                حفظ التعديلات والصورة
              </button>
            </div>
          </form>

          {/* Theme & Display Preferences Section */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-600" />
                <span>تخصيص المظهر وتفضيلات العرض الشخصية</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                يتم حفظ مظهرك المفضل ولون النظام في ملفك الشخصي وتفعيله تلقائياً عند كل تسجيل دخول لك
              </p>
            </div>

            {/* Day / Night Mode Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (isDarkMode) toggleDarkMode();
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  !isDarkMode
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-2xs font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div>الوضع النهاري (فاتح)</div>
                  <div className="text-[10px] text-slate-400 font-normal">خلفيات بيضاء ناصعة</div>
                </div>
                {!isDarkMode && <span className="mr-auto text-emerald-600 text-xs">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDarkMode) toggleDarkMode();
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  isDarkMode
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-2xs font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div>الوضع الليلي (داكن)</div>
                  <div className="text-[10px] text-slate-400 font-normal">خلفيات داكنة مريحة للعين</div>
                </div>
                {isDarkMode && <span className="mr-auto text-emerald-600 text-xs">✓</span>}
              </button>
            </div>

            {/* Theme Color Palettes */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                اللون الوزاري المفضل للنظام:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'emerald' as ThemeColor, label: 'أخضر وزاري', color: 'bg-emerald-600', ring: 'ring-emerald-400' },
                  { id: 'navy' as ThemeColor, label: 'أزرق رئاسي', color: 'bg-blue-800', ring: 'ring-blue-400' },
                  { id: 'burgundy' as ThemeColor, label: 'عنابي رسمي', color: 'bg-rose-900', ring: 'ring-rose-400' },
                  { id: 'slate' as ThemeColor, label: 'رمادي وذهبي', color: 'bg-slate-800', ring: 'ring-slate-400' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setThemeColor(opt.id)}
                    className={`p-2.5 rounded-xl border text-right flex items-center justify-between transition-all ${
                      themeColor === opt.id
                        ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${opt.color} shadow-xs ring-2 ${opt.ring}`} />
                      <span className="text-[11px] text-slate-800 dark:text-slate-200">{opt.label}</span>
                    </div>
                    {themeColor === opt.id && <span className="text-emerald-600 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Account Security & Password Card */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>أمان الحساب وسياسة كلمة المرور</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  تاريخ آخر تغيير: <strong className="font-mono text-slate-700 dark:text-slate-300">{currentUser.lastPasswordChangedAt || '2025-01-10'}</strong> · دورة الصلاحية: <strong>{systemSettings.passwordExpirationPeriod}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordChangeModalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>تبديل كلمة المرور</span>
              </button>
            </div>
          </div>

          {/* Quick User Switcher section */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              تبديل الحساب النشط لاختبار أدوار وصلاحيات أخرى:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setFullName(u.fullName);
                    setEmail(u.email);
                    setPhone(u.phone);
                    setJobTitle(u.jobTitle);
                    setAvatarPreview(u.avatarUrl);
                  }}
                  className={`p-2.5 rounded-lg border text-right transition-colors ${
                    currentUser.id === u.id
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {u.fullName}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {u.jobTitle}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};


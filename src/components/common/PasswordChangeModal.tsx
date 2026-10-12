import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  X,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

export const PasswordChangeModal: React.FC = () => {
  const {
    currentUser,
    isPasswordChangeModalOpen,
    setIsPasswordChangeModalOpen,
    changeUserPassword,
    systemSettings,
    isPasswordExpired
  } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isPasswordChangeModalOpen) return null;

  const isExpired = isPasswordExpired(currentUser);
  const isFirstLogin = !!currentUser.mustChangePasswordOnFirstLogin;
  const isForced = isExpired || isFirstLogin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('كلمة المرور يجب ألا تقل عن 8 خانات');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    const success = changeUserPassword(currentUser.id, newPassword);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordChangeModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-right space-y-4" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isForced ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
            }`}>
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isForced ? 'إجراء أمني إلزامي: تبديل كلمة المرور' : 'تحديث كلمة المرور الرسمية'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                الحساب: {currentUser.fullName}
              </p>
            </div>
          </div>

          {!isForced && (
            <button
              onClick={() => setIsPasswordChangeModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Reason banner if forced */}
        {isFirstLogin && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              وفقاً لسياسة أمان النظام، يجب على المستخدم الجديد تعيين كلمة مرور خاصة عند أول تسجيل دخول لضمان السرية التامة.
            </span>
          </div>
        )}

        {isExpired && !isFirstLogin && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              انتهت دورة صلاحية كلمة المرور الحالية (محددة في إعدادات النظام بـ {systemSettings.passwordExpirationPeriod}). يرجى تبديلها للاستمرار.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              كلمة المرور الحالية / المؤقتة
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              كلمة المرور الجديدة *
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8 خانات على الأقل (حروف وأرقام ورموز)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 pl-9 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              تأكيد كلمة المرور الجديدة *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور للتأكيد"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300">متطلبات الأمان الحكومية:</div>
            <div>• لا تقل عن 8 خانات وتحتوي على مزيج من الأحرف والأرقام.</div>
            <div>• يتم حفظ التحديث وسريانه في سجل الرقابة الحكومي فورياً.</div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            {!isForced && (
              <button
                type="button"
                onClick={() => setIsPasswordChangeModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
              >
                إلغاء
              </button>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد وحفظ كلمة المرور</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

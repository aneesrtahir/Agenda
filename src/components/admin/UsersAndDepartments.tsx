import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Building2,
  Plus,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Briefcase,
  Key,
  Lock,
  Unlock,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { User, Department, UserRole } from '../../types';

export const UsersAndDepartments: React.FC = () => {
  const {
    users,
    departments,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    canManageSystem,
    canManageAccounts,
    lockUserAccount,
    unlockUserAccount,
    adminResetUserPassword,
    toggleUserActiveStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'departments'>('users');

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('مستخدم');
  const [departmentId, setDepartmentId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Password Reset Modal State (تغيير كلمة المرور لأي مستخدم من قبل الأدمن أو مسؤول الحسابات)
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [userForPass, setUserForPass] = useState<User | null>(null);
  const [newPassValue, setNewPassValue] = useState('');
  const [requirePassFirstLogin, setRequirePassFirstLogin] = useState(true);

  // Lock Account Modal State (قفل الحساب)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [userForLock, setUserForLock] = useState<User | null>(null);
  const [lockReasonInput, setLockReasonInput] = useState('تم قفل الحساب إدارياً بواسطة إدارة الحسابات');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = 'Gov#2026!';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassValue(res);
  };

  const openChangePassword = (u: User) => {
    setUserForPass(u);
    setNewPassValue(`Gov#2026!${Math.floor(Math.random() * 899 + 100)}`);
    setRequirePassFirstLogin(true);
    setIsPassModalOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForPass || !newPassValue.trim()) return;
    adminResetUserPassword(userForPass.id, newPassValue.trim(), requirePassFirstLogin);
    setIsPassModalOpen(false);
  };

  const openLockModal = (u: User) => {
    setUserForLock(u);
    setLockReasonInput('تم قفل الحساب إدارياً لمراجعة وتدقيق الصلاحيات');
    setIsLockModalOpen(true);
  };

  const handleLockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForLock) return;
    lockUserAccount(userForLock.id, lockReasonInput.trim());
    setIsLockModalOpen(false);
  };

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptNameEn, setDeptNameEn] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptType, setDeptType] = useState<Department['type']>('وزارة');
  const [directorName, setDirectorName] = useState('');
  const [deptPhone, setDeptPhone] = useState('');
  const [deptEmail, setDeptEmail] = useState('');
  // New Iraqi state structure and classification fields
  const [deptAuthority, setDeptAuthority] = useState<'سلطة تنفيذية' | 'سلطة تشريعية' | 'سلطة قضائية'>('سلطة تنفيذية');
  const [deptCategory, setDeptCategory] = useState<'وزارات' | 'هيئات' | 'محافظات ومجالس محافظات' | 'أخرى'>('وزارات');
  const [parentDeptName, setParentDeptName] = useState('الدولة العراقية - السلطة التنفيذية');
  const [selectedCouncils, setSelectedCouncils] = useState<string[]>([]);
  const [showInSending, setShowInSending] = useState(true);

  const availableCouncils = [
    'المجلس الوزاري للطاقة',
    'المجلس الوزاري للتنمية البشرية',
    'المجلس الوزاري للخدمات الاجتماعية',
    'اللجنة العليا للمياه'
  ];

  const handleCouncilToggle = (c: string) => {
    if (selectedCouncils.includes(c)) {
      setSelectedCouncils(selectedCouncils.filter(x => x !== c));
    } else {
      setSelectedCouncils([...selectedCouncils, c]);
    }
  };

  const openAddUser = () => {
    setUserToEdit(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setRole('مستخدم');
    setDepartmentId(departments[0]?.id || '');
    setJobTitle('');
    setPhone('');
    setIsActive(true);
    setIsUserModalOpen(true);
  };

  const openEditUser = (u: User) => {
    setUserToEdit(u);
    setFullName(u.fullName);
    setUsername(u.username);
    setEmail(u.email);
    setRole(u.role);
    setDepartmentId(u.departmentId);
    setJobTitle(u.jobTitle);
    setPhone(u.phone);
    setIsActive(u.isActive);
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fullName,
      username,
      email,
      role,
      departmentId,
      avatarUrl: userToEdit ? userToEdit.avatarUrl : '',
      phone,
      jobTitle,
      isActive
    };

    if (userToEdit) {
      updateUser(userToEdit.id, payload);
    } else {
      addUser(payload);
    }
    setIsUserModalOpen(false);
  };

  const openAddDept = () => {
    setDeptToEdit(null);
    setDeptName('');
    setDeptNameEn('');
    setDeptCode(`DEP-${Math.floor(Math.random() * 900) + 100}`);
    setDeptType('وزارة');
    setDirectorName('');
    setDeptPhone('');
    setDeptEmail('');
    setDeptAuthority('سلطة تنفيذية');
    setDeptCategory('وزارات');
    setParentDeptName('الدولة العراقية - السلطة التنفيذية');
    setSelectedCouncils([]);
    setShowInSending(true);
    setIsDeptModalOpen(true);
  };

  const openEditDept = (d: Department) => {
    setDeptToEdit(d);
    setDeptName(d.name);
    setDeptNameEn(d.nameEn || '');
    setDeptCode(d.code);
    setDeptType(d.type);
    setDirectorName(d.directorName);
    setDeptPhone(d.phone || '');
    setDeptEmail(d.email || '');
    setDeptAuthority(d.authority || 'سلطة تنفيذية');
    setDeptCategory(d.category || 'وزارات');
    setParentDeptName(d.parentDepartmentName || 'الدولة العراقية - السلطة التنفيذية');
    setSelectedCouncils(d.additionalCouncils || []);
    setShowInSending(d.showInSendingLists !== false);
    setIsDeptModalOpen(true);
  };

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Department> = {
      name: deptName,
      nameEn: deptNameEn.trim() || 'Ministry/Government Agency',
      code: deptCode,
      type: deptType,
      directorName,
      phone: deptPhone,
      email: deptEmail,
      authority: deptAuthority,
      category: deptCategory,
      parentDepartmentName: parentDeptName,
      additionalCouncils: selectedCouncils as any,
      showInSendingLists: showInSending
    };

    if (deptToEdit) {
      updateDepartment(deptToEdit.id, payload);
    } else {
      addDepartment(payload as any);
    }
    setIsDeptModalOpen(false);
  };

  const roleColors: Record<UserRole, string> = {
    'Admin': 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    'مسؤول الحسابات': 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    'مدير الأجندة': 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    'مساعد': 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    'مستخدم': 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            إدارة المستخدمين والأدوار والدوائر الحكومية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            صلاحيات الوصول: Admin (مدير النظام)، مسؤول الحسابات، مدير الأجندة، مساعد، ومستخدم
          </p>
        </div>

        {((activeTab === 'users' && canManageAccounts) || (activeTab === 'departments' && canManageSystem)) && (
          <div className="flex items-center gap-2">
            {activeTab === 'users' ? (
              <button
                onClick={openAddUser}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مستخدم جديد</span>
              </button>
            ) : (
              <button
                onClick={openAddDept}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة دائرة / وزارة</span>
              </button>
          </div>
        )}
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>المستخدمون ومستويات الصلاحيات ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
            activeTab === 'departments'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>الدوائر والوزارات والمؤسسات ({departments.length})</span>
        </button>
      </div>

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Roles Description Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">Admin (مدير النظام)</span>
              <p className="text-[11px] text-slate-500">كامل الصلاحيات، إدارة المنظومة وقاعدة البيانات وتوليد الأكواد البرمجية.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200/80 dark:border-indigo-900/50">
              <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-0.5">مسؤول الحسابات (Account Admin)</span>
              <p className="text-[11px] text-slate-500">إدارة المستخدمين، إضافة وتعديل وتفعيل وقفل الحسابات وتغيير كلمات المرور ومنح الصلاحيات.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">مدير الأجندة</span>
              <p className="text-[11px] text-slate-500">إضافة وتعديل وحذف الجلسات والوثائق وإصدار القرارات والتوجيهات الوزارية.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="font-bold text-blue-700 dark:text-blue-400 block mb-0.5">مساعد</span>
              <p className="text-[11px] text-slate-500">إدخال مسودات الوثائق والملحقات، تجهيز بنود جدول الأعمال للمراجعة.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">مستخدم</span>
              <p className="text-[11px] text-slate-500">مطالعة الجلسات والقرارات المصرح بها والبحث المتقدم في الأرشيف.</p>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((u) => {
              const dept = departments.find(d => d.id === u.departmentId);
              const isCurrent = currentUser.id === u.id;

              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-2xs space-y-3 transition-colors ${
                    u.isLockedOut
                      ? 'border-rose-400 dark:border-rose-800 ring-1 ring-rose-400/30'
                      : isCurrent
                      ? 'border-emerald-600 dark:border-emerald-600 ring-1 ring-emerald-600/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 relative">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          u.fullName.charAt(0)
                        )}
                        {u.isLockedOut && (
                          <div className="absolute inset-0 bg-rose-900/60 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {u.fullName}
                          </h3>
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                              أنت الآن
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          @{u.username}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${roleColors[u.role] || roleColors['مستخدم']}`}>
                        {u.role}
                      </span>
                      {u.isLockedOut && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                          <Lock className="w-2.5 h-2.5" />
                          <span>مقفل</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Account Lock or Inactive Notice */}
                  {u.isLockedOut ? (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                        <span>الحساب مقفل وممنوع من الدخول</span>
                      </span>
                      <span className="text-[11px] opacity-90 truncate max-w-[200px]" title={u.lockReason}>
                        {u.lockReason || 'تم القفل إدارياً'}
                      </span>
                    </div>
                  ) : !u.isActive ? (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>الحساب معطل (Inactive)</span>
                      </span>
                      <span className="text-[11px]">موقوف مؤقتاً عن العمل</span>
                    </div>
                  ) : null}

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{u.jobTitle || 'موظف في الأمانة العامة'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{dept?.name || 'الأمانة العامة لمجلس الوزراء'}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{u.email}</span>
                      <span className="mx-1">·</span>
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{u.phone}</span>
                    </div>
                  </div>

                  {/* Actions Bar for Admin and Account Administrator */}
                  {canManageAccounts && (
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Lock / Unlock Toggle Button */}
                        {u.isLockedOut ? (
                          <button
                            onClick={() => unlockUserAccount(u.id)}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-md font-semibold flex items-center gap-1 text-[11px] transition-colors"
                            title="إلغاء قفل الحساب وتفعيله فوراً"
                          >
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span>إلغاء القفل</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openLockModal(u)}
                            className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-md font-semibold flex items-center gap-1 text-[11px] transition-colors"
                            title="قفل هذا الحساب ومنعه من الدخول"
                          >
                            <Lock className="w-3 h-3 text-rose-600" />
                            <span>قفل الحساب</span>
                          </button>
                        )}

                        {/* Reset Password Button */}
                        <button
                          onClick={() => openChangePassword(u)}
                          className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 rounded-md font-semibold flex items-center gap-1 text-[11px] transition-colors"
                          title="تغيير كلمة المرور لهذا المستخدم"
                        >
                          <Key className="w-3 h-3 text-amber-600" />
                          <span>تغيير كلمة المرور</span>
                        </button>

                        {/* Toggle Active status */}
                        <button
                          onClick={() => toggleUserActiveStatus(u.id)}
                          className={`px-2 py-1 border rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                            u.isActive
                              ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                          title={u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        >
                          {u.isActive ? <UserX className="w-3 h-3 text-slate-400" /> : <UserCheck className="w-3 h-3 text-emerald-600" />}
                          <span>{u.isActive ? 'تعطيل' : 'تفعيل'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditUser(u)}
                          className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف المستخدم (${u.fullName})؟`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="px-2.5 py-1 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Departments Tab Content */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const memberCount = users.filter(u => u.departmentId === dept.id).length;

            return (
              <div
                key={dept.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-500">
                      {dept.code}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {dept.type}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                    {dept.name}
                  </h3>
                  {dept.nameEn && (
                    <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-sm inline-block border border-emerald-200 dark:border-emerald-900 mt-1">
                      {dept.nameEn}
                    </div>
                  )}

                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1.5">
                    <div>المسؤول: <strong>{dept.directorName}</strong></div>
                    {dept.category && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400">الفئة:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono">
                          {dept.category}
                        </span>
                        {dept.authority && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-[10px]">
                            {dept.authority}
                          </span>
                        )}
                      </div>
                    )}
                    {dept.parentDepartmentName && (
                      <div className="text-[11px] text-slate-500 truncate" title={dept.parentDepartmentName}>
                        الجهة الأم: <span className="font-medium text-slate-700 dark:text-slate-300">{dept.parentDepartmentName}</span>
                      </div>
                    )}
                    {dept.additionalCouncils && dept.additionalCouncils.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {dept.additionalCouncils.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dept.showInSendingLists !== false
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                      }`}>
                        {dept.showInSendingLists !== false ? '✓ ظاهرة بقوائم الإرسال' : '✗ مخفية من قوائم الإرسال'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>{memberCount} مستخدم مسجل</span>
                  {canManageSystem && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditDept(dept)}
                        className="p-1 hover:text-blue-600 text-slate-400"
                        title="تعديل الدائرة"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف الدائرة (${dept.name})؟`)) {
                            deleteDepartment(dept.id);
                          }
                        }}
                        className="p-1 hover:text-rose-600 text-slate-400"
                        title="حذف الدائرة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={userToEdit ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد للنظام'}
        maxWidth="lg"
      >
        <form onSubmit={handleUserSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                الاسم الكامل *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                اسم المستخدم (Username) *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                رقم الهاتف
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                مستوى الصلاحية (الدور) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-semibold"
              >
                <option value="Admin">Admin (مدير النظام)</option>
                <option value="مسؤول الحسابات">مسؤول الحسابات (Account Admin)</option>
                <option value="مدير الأجندة">مدير الأجندة</option>
                <option value="مساعد">مساعد</option>
                <option value="مستخدم">مستخدم</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                الدائرة / الوزارة التابع لها *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
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
              placeholder="مثال: مستشار شؤون مجلس الوزراء"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium shadow-xs"
            >
              حفظ
            </button>
          </div>
        </form>
      </Modal>

      {/* Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={deptToEdit ? 'تعديل بيانات الدائرة/الوزارة' : 'إضافة دائرة أو وزارة جديدة'}
        maxWidth="md"
      >
        <form onSubmit={handleDeptSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              اسم الدائرة أو الوزارة *
            </label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="مثال: وزارة التجارة"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              اسم الوزارة / الدائرة باللغة الإنكليزية (English Name) *
            </label>
            <input
              type="text"
              value={deptNameEn}
              onChange={(e) => setDeptNameEn(e.target.value)}
              placeholder="مثال: Ministry of Trade"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
            <span className="text-[11px] text-slate-400 block mt-0.5">
              يُستخدم في وضع العلامة المائية الأمنية على الوثائق والمستندات الرسمية
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                رمز الدائرة (Code) *
              </label>
              <input
                type="text"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                التصنيف التنظيمي *
              </label>
              <select
                value={deptType}
                onChange={(e) => setDeptType(e.target.value as any)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="وزارة">وزارة</option>
                <option value="أمانة عامة">أمانة عامة</option>
                <option value="دائرة شؤون المجلس">دائرة شؤون المجلس</option>
                <option value="هيئة مستقلة">هيئة مستقلة</option>
                <option value="محافظة">محافظة</option>
                <option value="مجلس محافظة">مجلس محافظة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>
          {/* الهيكل الدستوري والتصنيف المؤسسي */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>الهيكل المؤسسي في الدولة العراقية</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded font-mono">
                تصنيف رسمي
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  السلطة الدستورية *
                </label>
                <select
                  value={deptAuthority}
                  onChange={(e) => setDeptAuthority(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-medium"
                >
                  <option value="سلطة تنفيذية">سلطة تنفيذية</option>
                  <option value="سلطة تشريعية">سلطة تشريعية</option>
                  <option value="سلطة قضائية">سلطة قضائية</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  فئة المؤسسة *
                </label>
                <select
                  value={deptCategory}
                  onChange={(e) => setDeptCategory(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-medium"
                >
                  <option value="وزارات">وزارات</option>
                  <option value="هيئات">هيئات</option>
                  <option value="محافظات ومجالس محافظات">محافظات ومجالس محافظات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                الجهة الأم للمؤسسة
              </label>
              <input
                type="text"
                value={parentDeptName}
                onChange={(e) => setParentDeptName(e.target.value)}
                placeholder="مثال: الدولة العراقية - رئاسة مجلس الوزراء"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>
          </div>

          {/* المجالس الوزارية والتصنيفات الإضافية */}
          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl space-y-2">
            <label className="block text-slate-800 dark:text-slate-200 font-bold">
              التصنيف الإضافي / المجالس الوزارية واللجان التخصصية
            </label>
            <p className="text-[11px] text-slate-500">
              اختر المجالس واللجان العليا التي تنتمي لها هذه الجهة:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {availableCouncils.map((council) => {
                const isSelected = selectedCouncils.includes(council);
                return (
                  <label
                    key={council}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-semibold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCouncilToggle(council)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{council}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* خاصية إظهار الجهة في قوائم الإرسال وأخفاءها */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                إظهار الجهة في قوائم الإرسال
              </span>
              <span className="text-[11px] text-slate-500">
                عند التعطيل، لن تظهر هذه الجهة ضمن خيارات إرسال وتوزيع الوثائق والقرارات
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={showInSending}
                onChange={(e) => setShowInSending(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs">{showInSending ? 'مفعّل (ظاهرة)' : 'معطل (مخفية)'}</span>
            </label>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              اسم المسؤول / المدير العام
            </label>
            <input
              type="text"
              value={directorName}
              onChange={(e) => setDirectorName(e.target.value)}
              placeholder="مثال: معالي وزير التجارة"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium shadow-xs"
            >
              حفظ
            </button>
          </div>
        </form>
      {/* Password Reset Modal (تغيير كلمة المرور لأي مستخدم من قبل الأدمن أو مسؤول الحسابات) */}
      <Modal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        title={`تعيين كلمة مرور جديدة للمستخدم: ${userForPass?.fullName || ''}`}
        subtitle={`اسم المستخدم: @${userForPass?.username || ''} · الصلاحية: ${userForPass?.role || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-1 text-amber-900 dark:text-amber-200">
            <div className="font-bold flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600" />
              <span>إجراء أمني معتمد: إعادة تعيين كلمة المرور</span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              بصفتك مسؤول الحسابات أو مدير النظام، يمكنك إنشاء كلمة مرور جديدة مؤقتة أو دائمة للمستخدم وتصفير أي محاولات فاشلة سابقة لتمكينه من الدخول فوراً.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                كلمة المرور الجديدة *
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>توليد كلمة سر آمنة</span>
              </button>
            </div>
            <input
              type="text"
              value={newPassValue}
              onChange={(e) => setNewPassValue(e.target.value)}
              required
              placeholder="e.g. Gov#2026!Sec789"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono text-sm tracking-wider"
              dir="ltr"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
            <label className="flex items-start gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={requirePassFirstLogin}
                onChange={(e) => setRequirePassFirstLogin(e.target.checked)}
                className="mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs leading-relaxed">
                <strong>إلزام المستخدم بتغيير كلمة المرور فور تسجيل دخوله القادم</strong>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  يُنصح به أمنياً لمنح المستخدم الخصوصية في اختيار كلمته السرية الخاصة.
                </span>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPassModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>تأكيد وحفظ كلمة المرور</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Lock Account Modal (قفل الحساب) */}
      <Modal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        title={`قفل الحساب: ${userForLock?.fullName || ''}`}
        subtitle="تعليق صلاحية تسجيل الدخول وإيقاف الجلسة الأمنية"
        maxWidth="md"
      >
        <form onSubmit={handleLockSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl space-y-1 text-rose-900 dark:text-rose-200">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>تحذير: سيتم منع هذا المستخدم من دخول المنظومة</span>
            </div>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
              عند قفل الحساب، لن يتمكن المستخدم من الوصول أو الاطلاع على أي وثائق، ويمكنك إعادة تفعيله وإلغاء القفل في أي وقت بضغطة زر واحدة.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              سبب قفل الحساب *
            </label>
            <textarea
              value={lockReasonInput}
              onChange={(e) => setLockReasonInput(e.target.value)}
              required
              rows={3}
              placeholder="مثال: إجراء احترازي لتدقيق الصلاحيات أو بناءً على توجيه إداري"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsLockModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>تأكيد قفل الحساب الآن</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

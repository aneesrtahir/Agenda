export type SessionType = 'عادية' | 'طارئة' | 'استثنائية';
export type SessionStatus = 'منعقدة' | 'قيد الإعداد' | 'مؤجلة' | 'مكتملة';

export type DecisionType = 'قرار عادي' | 'سري' | 'طارئ' | 'سري-وطارئ';
export type ExecutionStatus = 'تم التنفيذ' | 'قيد المتابعة' | 'مستمر' | 'معلق';

export type UserRole = 'Admin' | 'مدير الأجندة' | 'مسؤول الحسابات' | 'مساعد' | 'مستخدم';

export interface Government {
  id: string;
  name: string;
  primeMinister: string;
  startYear: number;
  endYear?: number;
  isActive: boolean;
  isHidden: boolean;
  description: string;
  orderIndex: number;
}

export interface Year {
  id: string;
  governmentId: string;
  yearNumber: number;
  isHidden: boolean;
  notes?: string;
}

export interface CabinetSession {
  id: string;
  governmentId: string;
  yearId: string;
  sessionNumber: number;
  sessionDate: string; // YYYY-MM-DD
  sessionType: SessionType;
  status: SessionStatus;
  location: string;
  chairman: string;
  notes: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean; // Pre-defined standard types
  colorBadge?: string;
}

export interface MainCategory {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface SubCategory {
  id: string;
  mainCategoryId: string;
  code: string;
  name: string;
  description: string;
}

// تصنيفات السلطات في الدولة العراقية
export type StateAuthority = 'سلطة تنفيذية' | 'سلطة تشريعية' | 'سلطة قضائية';

// فئات المؤسسات والدوائر المعتمدة
export type DepartmentCategory = 'وزارات' | 'هيئات' | 'محافظات ومجالس محافظات' | 'أخرى';

// التصنيفات واللجان الإضافية للدوائر
export type AdditionalCouncil =
  | 'المجلس الوزاري للطاقة'
  | 'المجلس الوزاري للتنمية البشرية'
  | 'المجلس الوزاري للخدمات الاجتماعية'
  | 'اللجنة العليا للمياه';

export interface Department {
  id: string;
  code: string;
  name: string;
  nameEn: string; // اسم الوزارة باللغة الإنكليزية
  type: 'وزارة' | 'دائرة شؤون المجلس' | 'هيئة مستقلة' | 'أمانة عامة' | 'محافظة' | 'مجلس محافظة' | 'أخرى';
  directorName: string;
  phone?: string;
  email?: string;
  // التصنيفات الهيكلية الجديدة:
  authority?: StateAuthority; // السلطة: تنفيذية / تشريعية / قضائية (هيكل الدولة العراقية)
  category?: DepartmentCategory; // فئات: وزارات – هيئات – محافظات ومجالس محافظات – أخرى
  parentDepartmentName?: string; // الجهة الأم (مثال: الدولة العراقية -> السلطة التنفيذية -> رئاسة الوزراء)
  additionalCouncils?: AdditionalCouncil[]; // التصنيفات والمجالس الإضافية (المجلس الوزاري للطاقة، التنمية البشرية، الخدمات الاجتماعية، اللجنة العليا للمياه)
  showInSendingLists?: boolean; // إظهار الجهة في قوائم الإرسال أو إخفاؤها
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  departmentId: string;
  avatarUrl: string;
  phone: string;
  jobTitle: string;
  isActive: boolean;
  createdAt: string;
  // تفضيلات المظهر والأمان للمستخدم
  preferredTheme?: ThemeColor;
  preferredMode?: 'light' | 'dark';
  mustChangePasswordOnFirstLogin?: boolean;
  lastPasswordChangedAt?: string;
  failedLoginAttempts?: number;
  isLockedOut?: boolean;
  lockedUntil?: string;
  lockReason?: string;
  password?: string;
}

export interface CabinetDocument {
  id: string;
  governmentId: string;
  yearId: string;
  sessionId: string;
  documentTypeId: string;
  subject: string;
  keywords: string[];
  notes: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  fileDataUrl?: string; // Base64 data for actual file rendering and preview
  fileType?: string;
  isHidden: boolean;
  createdAt: string;
  createdByUserId: string;
  referenceNumber?: string;
  recipientDepartments: string[]; // الجهات والوزارات المرسل إليها الوثيقة
  isAllDepartments?: boolean;      // مرسل لكافة الوزارات والجهات الحكومية
  // Soft delete support
  isDeleted?: boolean;
  deletedAt?: string;
  deletedByUserId?: string;
  deletedByUserName?: string;
  deletionReason?: string;
  isDirective?: boolean;           // للتوجيهات (رقمها 0)
}

export interface Decision extends CabinetDocument {
  decisionNumber: string; // رقم القرار e.g. 142/2025, أو 0 للتوجيه
  letterNumber: string;   // رقم الكتاب e.g. و.ر/895
  letterDate: string;     // تاريخ الكتاب YYYY-MM-DD
  mainCategoryId: string; // التبويب الأساسي
  subCategoryId: string;  // التبويب الفرعي
  decisionType: DecisionType; // 'قرار عادي' | 'سري' | 'طارئ' | 'سري-وطارئ'
  executionStatus: ExecutionStatus;
  targetDepartments: string[]; // الجهات المعنية / المرسل إليها
}

// أنواع ربط القرارات مع أي قرار آخر
export type DecisionRelationType = 
  | 'إلغاء قرار'
  | 'إلغاء فقرة من قرار'
  | 'تعديل قرار'
  | 'تعديل فقرة من قرار'
  | 'استثناء قرار'
  | 'استثناء جهة من قرار';

export interface DecisionRelation {
  id: string;
  sourceDecisionId: string;        // القرار المصدر
  targetDecisionId: string;        // القرار المرتبط به
  relationType: DecisionRelationType;
  paragraphNumber?: string;        // رقم الفقرة إن وجد
  exemptedDepartmentId?: string;   // معرف الجهة المستثناة
  exemptedDepartmentName?: string; // اسم الجهة المستثناة
  notes?: string;                  // السند والمبررات
  createdAt: string;
  createdByName: string;
}

// سجل تأكيد الاستلام والاطلاع على الوثائق
export interface DocumentReceiptLog {
  id: string;
  documentId: string;
  documentTitle: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  departmentId: string;
  departmentName: string;
  departmentNameEn?: string;
  viewedAt: string;                // تاريخ ووقت الاطلاع
  confirmedAt?: string;            // تاريخ ووقت تأكيد الاستلام
  status: 'تم الاطلاع فقط' | 'تم تأكيد الاستلام رسمياً';
  receiptNumber?: string;          // رقم إشعار الاستلام / الصادر الداخلي
  notes?: string;                  // ملاحظات تأكيد الاستلام
}

// سجل الحركات العام (Audit Log)
export type AuditActionType = 
  | 'تسجيل دخول'
  | 'تبديل مستخدم'
  | 'إضافة وثيقة'
  | 'تعديل وثيقة'
  | 'حذف وثيقة'
  | 'استعادة وثيقة'
  | 'إضافة قرار'
  | 'تعديل قرار'
  | 'حذف قرار'
  | 'استعادة قرار'
  | 'اطلاع على وثيقة'
  | 'تأكيد استلام'
  | 'ربط قرار'
  | 'إلغاء ربط قرار'
  | 'إرسال مراسلة للوزارة'
  | 'إرسال مراسلة لمجلس الوزراء'
  | 'تحديث جلسة'
  | 'إدارة حكومات'
  | 'إدارة مستخدمين'
  | 'حذف نهائي';

export interface AuditLog {
  id: string;
  timestamp: string;               // YYYY-MM-DD HH:mm:ss
  userId: string;
  userName: string;
  userRole: UserRole;
  departmentName: string;
  actionType: AuditActionType;
  entityType: 'وثيقة' | 'قرار' | 'توجيه' | 'جلسة' | 'مراسلة' | 'مستخدم' | 'حكومة' | 'نظام';
  entityId?: string;
  entityTitle?: string;
  details: string;
  ipAddress: string;
}

// المراسلات المتبادلة بين الوزارات ومدير الأجندة (مجلس الوزراء)
export type DispatchDirection = 'من الوزارة إلى مجلس الوزراء' | 'من مجلس الوزراء إلى الوزارة';
export type DispatchPriority = 'عادي' | 'عاجل' | 'سري للغاية' | 'فوري';
export type DispatchStatus = 'جديد' | 'قيد المراجعة' | 'تمت المصادقة' | 'مكتمل' | 'مرفوض';

export interface MinisterialDispatch {
  id: string;
  direction: DispatchDirection;
  fromDepartmentId: string;
  fromDepartmentName: string;
  fromDepartmentNameEn?: string;
  toDepartmentId: string;
  toDepartmentName: string;
  toDepartmentNameEn?: string;
  senderUserId: string;
  senderUserName: string;
  senderRole: UserRole;
  subject: string;
  body: string;
  priority: DispatchPriority;
  status: DispatchStatus;
  letterNumber: string;
  letterDate: string;
  fileName?: string;
  fileSize?: string;
  fileDataUrl?: string;
  createdAt: string;
  viewedAt?: string;
  confirmedAt?: string;
  notes?: string;
}

export interface DepartmentNotification {
  id: string;
  documentId: string;
  subject: string;
  type: 'document' | 'decision' | 'dispatch' | 'session_update' | 'session_agenda';
  documentTypeName: string;
  departmentName: string;
  createdAt: string;
  isRead: boolean;
  decisionNumber?: string;
  letterNumber?: string;
  decisionType?: DecisionType;
  sessionNumber?: number;
  sessionDate?: string;
}

export type ThemeColor = 'emerald' | 'navy' | 'burgundy' | 'slate';

// فترات إجبار تبديل كلمة المرور المعتمدة بالنظام
export type PasswordExpirationPeriod =
  | 'يوم'
  | 'يومين'
  | 'ثلاثة ايام'
  | 'اسبوع'
  | 'اسبوعين'
  | 'ثلاثة اسابيع'
  | 'شهر'
  | 'شهرين'
  | 'ثلاثة اشهر'
  | 'ستة اشهر';

// إعدادات النظام في لوحة تحكم المدير
export interface SystemSettings {
  id: string;
  // مكان الحاوية الرئيسية لحفظ الملفات المرفوعة من الخادم
  storageContainerPath: string; // e.g. /var/cabinet_uploads/secure_vault
  storageProvider: 'خادم محلي مؤمن (Local Storage Vault)' | 'حاوية سحابية (Azure/S3 Blob Storage)' | 'شبكة التخزين الحكومية (NFS Vault)';
  storageQuotaGb: number;
  allowedFileExtensions: string[];
  maxUploadSizeBytes: number;

  // عدد المحاولات الخاطئة لكلمة المرور (3-10)
  maxFailedLoginAttempts: number; // 3 to 10
  lockoutDurationMinutes: number;

  // إجبار تبديل كلمة المرور خلال فترة زمنية
  passwordExpirationPeriod: PasswordExpirationPeriod;
  isPasswordExpirationEnforced: boolean;

  // إجبار المستخدم الجديد على تبديل كلمة المرور عند الدخول الأول أو عند التبديل
  forceChangePasswordOnFirstLogin: boolean;
  forceChangePasswordOnAdminReset: boolean;

  updatedAt: string;
  updatedByUserName: string;
}

// شريط الأخبار المتحرك
export type NewsTickerType = 'عاجل' | 'هام' | 'إعلان رسمي' | 'توجيه وزاري';

export interface NewsTickerItem {
  id: string;
  title: string;
  content: string;
  type: NewsTickerType;
  isActive: boolean;
  priority: 'high' | 'normal';
  createdAt: string;
  createdByUserName: string;
  linkTab?: string;
}

// ملفات ووسائط الصفحة الرئيسية (صور، وورد، اكسل، بوربوينت، PDF، فديوات)
export type HomepageFileType = 'image' | 'word' | 'excel' | 'powerpoint' | 'pdf' | 'video';

export interface HomepageFeaturedFile {
  id: string;
  title: string;
  description: string;
  fileType: HomepageFileType;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  fileDataUrl?: string;
  thumbnailUrl?: string;
  videoDuration?: string;
  orderIndex: number;
  isVisible: boolean; // عرض او اخفاء
  uploadedAt: string;
  uploadedByUserName: string;
}

// ملفات فوتر الموقع المتاحة للجميع
export interface FooterPublicFile {
  id: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image';
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  category: string;
  isVisible: boolean;
  addedAt: string;
}

// جلسات المستخدمين المتواجدين في الموقع
export interface OnlineUserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  departmentName: string;
  departmentNameEn?: string;
  avatarUrl?: string;
  currentLocation: string;
  onlineSince: string;
  lastActive: string;
  ipAddress: string;
  device: string;
  isCurrentSession?: boolean;
}

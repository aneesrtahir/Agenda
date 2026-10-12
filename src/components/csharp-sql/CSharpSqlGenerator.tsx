import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Database,
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  Layers,
  Server,
  FileText,
  Package,
  FolderArchive,
  CheckCircle2,
  Terminal,
  Shield,
  Laptop
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  VS2026_SLN_CONTENT,
  CSPROJ_CONTENT,
  APPSETTINGS_CONTENT,
  PROGRAM_CS_CONTENT,
  SQL_SERVER_2022_SCRIPT,
  README_CONTENT
} from './solutionTemplates';

export const CSharpSqlGenerator: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<
    'sln' | 'sql' | 'csharp_models' | 'csharp_dbcontext' | 'csharp_controllers' | 'program' | 'readme'
  >('sln');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('تم نسخ الكود البرمجي إلى الحافظة بنجاح', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadSingleFile = (content: string, filename: string, mimeType = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`تم تنزيل الملف (${filename}) بنجاح`, 'success');
  };

  // C# Models Code
  const csharpModelsCode = `// =========================================================================
// Cabinet Council Agenda & Documents Management System
// Framework: ASP.NET Core MVC (.NET 9.0 / Visual Studio 2026)
// Models / Entities & Constitutional Classifications
// =========================================================================

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CabinetAgendaSystem.Models
{
    public enum SessionType
    {
        [Display(Name = "عادية")]
        Regular,
        [Display(Name = "طارئة")]
        Urgent,
        [Display(Name = "استثنائية")]
        Extraordinary
    }

    public enum DecisionType
    {
        [Display(Name = "قرار عادي")]
        Normal,
        [Display(Name = "سري")]
        Secret,
        [Display(Name = "طارئ")]
        Urgent,
        [Display(Name = "سري-وطارئ")]
        SecretAndUrgent
    }

    public enum UserRole
    {
        Admin,
        [Display(Name = "مدير الأجندة")]
        AgendaManager,
        [Display(Name = "مساعد")]
        Assistant,
        [Display(Name = "مستخدم")]
        User
    }

    public class Government
    {
        public int GovernmentId { get; set; }
        
        [Required(ErrorMessage = "اسم الحكومة مطلوب")]
        [StringLength(250)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        public string PrimeMinister { get; set; } = string.Empty;

        public int StartYear { get; set; }
        public int? EndYear { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsHidden { get; set; } = false;
        public string? Description { get; set; }
        public int OrderIndex { get; set; } = 1;

        // Navigation
        public ICollection<Year> Years { get; set; } = new List<Year>();
        public ICollection<CabinetSession> Sessions { get; set; } = new List<CabinetSession>();
    }

    public class Year
    {
        public int YearId { get; set; }
        public int GovernmentId { get; set; }
        public int YearNumber { get; set; }
        public bool IsHidden { get; set; } = false;
        public string? Notes { get; set; }

        public Government Government { get; set; } = null!;
    }

    public class Department
    {
        public int DepartmentId { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        public string? NameEn { get; set; } // اسم الوزارة باللغة الإنكليزية للعلامة المائية

        [Required]
        [StringLength(100)]
        public string Type { get; set; } = "وزارة";

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = "وزارات"; // وزارات، هيئات، محافظات ومجالس محافظات، أخرى

        [Required]
        [StringLength(100)]
        public string Authority { get; set; } = "سلطة تنفيذية"; // سلطة تنفيذية، سلطة تشريعية، سلطة قضائية

        [StringLength(250)]
        public string? ParentDepartmentName { get; set; } = "الدولة العراقية";

        public string? AdditionalCouncils { get; set; } // المجلس الوزاري للطاقة، المجلس الوزاري للتنمية البشرية، ...

        public bool ShowInSendingLists { get; set; } = true; // خاصية إظهار الجهة في قوائم الإرسال

        public string? DirectorName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }

        public ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
    }

    public class CabinetSession
    {
        public int SessionId { get; set; }
        public int GovernmentId { get; set; }
        public int YearId { get; set; }

        [Required]
        public int SessionNumber { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime SessionDate { get; set; }

        [Required]
        public SessionType SessionType { get; set; } = SessionType.Regular;

        public string Status { get; set; } = "قيد الإعداد";
        public string? Location { get; set; } = "قاعة اجتماعات مجلس الوزراء - بغداد";
        public string? Chairman { get; set; }
        public string? Notes { get; set; }
        public bool IsHidden { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Government Government { get; set; } = null!;
        public Year Year { get; set; } = null!;
        public ICollection<CabinetDocument> Documents { get; set; } = new List<CabinetDocument>();
        public ICollection<CabinetDecision> Decisions { get; set; } = new List<CabinetDecision>();
    }

    public class CabinetDecision
    {
        public int DecisionId { get; set; }
        public int GovernmentId { get; set; }
        public int YearId { get; set; }
        public int SessionId { get; set; }

        [Required(ErrorMessage = "رقم القرار مطلوب")]
        public string DecisionNumber { get; set; } = string.Empty; // e.g. 142 لسنة 2026 أو 0 للتوجيه

        public bool IsDirective { get; set; } = false;             // 1 للتوجيهات

        [Required(ErrorMessage = "رقم الكتاب الرسمي مطلوب")]
        public string LetterNumber { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Date)]
        public DateTime LetterDate { get; set; }

        [Required(ErrorMessage = "موضوع القرار مطلوب")]
        public string Subject { get; set; } = string.Empty;

        public int MainCategoryId { get; set; }
        public int SubCategoryId { get; set; }

        public DecisionType DecisionType { get; set; } = DecisionType.Normal;
        public string ExecutionStatus { get; set; } = "قيد المتابعة";

        public string? Keywords { get; set; }
        public string? Notes { get; set; }
        public string? TargetDepartments { get; set; } // JSON Array
        public string? RecipientDepartments { get; set; }
        public bool IsAllDepartments { get; set; } = false;

        public string? FileName { get; set; }
        public string? FileSize { get; set; }
        public string? FileUrl { get; set; }
        public bool IsHidden { get; set; } = false;
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public string? DeletionReason { get; set; }

        public int CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public CabinetSession Session { get; set; } = null!;
        public MainCategory MainCategory { get; set; } = null!;
        public SubCategory SubCategory { get; set; } = null!;
        public ApplicationUser CreatedByUser { get; set; } = null!;
    }
}
`;

  // C# DbContext Code
  const csharpDbContextCode = `// =========================================================================
// Entity Framework Core 9 DbContext Configuration for SQL Server 2022
// Data / ApplicationDbContext.cs
// =========================================================================

using Microsoft.EntityFrameworkCore;
using CabinetAgendaSystem.Models;

namespace CabinetAgendaSystem.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Government> Governments => Set<Government>();
        public DbSet<Year> Years => Set<Year>();
        public DbSet<CabinetSession> CabinetSessions => Set<CabinetSession>();
        public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
        public DbSet<MainCategory> MainCategories => Set<MainCategory>();
        public DbSet<SubCategory> SubCategories => Set<SubCategory>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<ApplicationUser> ApplicationUsers => Set<ApplicationUser>();
        public DbSet<CabinetDocument> CabinetDocuments => Set<CabinetDocument>();
        public DbSet<CabinetDecision> CabinetDecisions => Set<CabinetDecision>();
        public DbSet<DecisionRelation> DecisionRelations => Set<DecisionRelation>();
        public DbSet<DocumentReceiptLog> DocumentReceiptLogs => Set<DocumentReceiptLog>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<MinisterialDispatch> MinisterialDispatches => Set<MinisterialDispatch>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Decisions Configuration
            modelBuilder.Entity<CabinetDecision>(entity =>
            {
                entity.HasKey(e => e.DecisionId);
                entity.Property(e => e.DecisionNumber).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LetterNumber).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);

                entity.HasOne(d => d.Session)
                    .WithMany(s => s.Decisions)
                    .HasForeignKey(d => d.SessionId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(d => d.DecisionNumber);
                entity.HasIndex(d => d.LetterNumber);
                entity.HasIndex(d => d.IsDeleted);
            });

            // Departments Configuration
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.DepartmentId);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Authority);
                entity.HasIndex(e => e.ShowInSendingLists);
            });

            // Sessions Configuration
            modelBuilder.Entity<CabinetSession>(entity =>
            {
                entity.HasKey(e => e.SessionId);
                entity.HasOne(s => s.Government)
                    .WithMany(g => g.Sessions)
                    .HasForeignKey(s => s.GovernmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(s => s.SessionDate);
            });
        }
    }
}
`;

  // C# Controller Code
  const csharpControllerCode = `// =========================================================================
// Controllers / DecisionsController.cs & SessionsController.cs
// ASP.NET Core 9.0 MVC
// =========================================================================

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CabinetAgendaSystem.Data;
using CabinetAgendaSystem.Models;
using Microsoft.AspNetCore.Authorization;

namespace CabinetAgendaSystem.Controllers
{
    [Authorize]
    public class DecisionsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public DecisionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Decisions
        public async Task<IActionResult> Index(
            string? searchTerm,
            int? governmentId,
            int? yearId,
            DecisionType? decisionType,
            int? mainCategoryId)
        {
            var query = _context.CabinetDecisions
                .Include(d => d.Session)
                .Include(d => d.MainCategory)
                .Include(d => d.SubCategory)
                .Where(d => !d.IsDeleted)
                .AsQueryable();

            if (!User.IsInRole("Admin") && !User.IsInRole("مدير الأجندة"))
            {
                query = query.Where(d => !d.IsHidden);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(d => 
                    d.Subject.Contains(searchTerm) ||
                    d.DecisionNumber.Contains(searchTerm) ||
                    d.LetterNumber.Contains(searchTerm));
            }

            if (decisionType.HasValue)
            {
                query = query.Where(d => d.DecisionType == decisionType.Value);
            }

            var decisions = await query.OrderByDescending(d => d.LetterDate).ToListAsync();
            return View(decisions);
        }

        // GET: Decisions/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();

            var decision = await _context.CabinetDecisions
                .Include(d => d.Session)
                .Include(d => d.MainCategory)
                .Include(d => d.SubCategory)
                .FirstOrDefaultAsync(m => m.DecisionId == id && !m.IsDeleted);

            if (decision == null) return NotFound();

            return View(decision);
        }
    }

    [Authorize]
    public class SessionsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public SessionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Sessions
        public async Task<IActionResult> Index(int? year)
        {
            var query = _context.CabinetSessions
                .Include(s => s.Government)
                .Include(s => s.Decisions)
                .Include(s => s.Documents)
                .AsQueryable();

            if (year.HasValue)
            {
                query = query.Where(s => s.SessionDate.Year == year.Value);
            }

            var sessions = await query.OrderByDescending(s => s.SessionDate).ToListAsync();
            return View(sessions);
        }

        // GET: Sessions/Calendar (التقويم التفاعلي للجلسات)
        public async Task<IActionResult> Calendar(int? year, int? month)
        {
            var targetYear = year ?? DateTime.Now.Year;
            var targetMonth = month ?? DateTime.Now.Month;

            var sessions = await _context.CabinetSessions
                .Where(s => s.SessionDate.Year == targetYear && s.SessionDate.Month == targetMonth)
                .OrderBy(s => s.SessionDate)
                .ToListAsync();

            ViewBag.CurrentYear = targetYear;
            ViewBag.CurrentMonth = targetMonth;

            return View(sessions);
        }
    }
}
`;

  // Razor Layout View
  const razorLayoutCode = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - منظومة أجندة مجلس الوزراء</title>
    <!-- Tailwind CSS CDN or Compiled Site CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
</head>
<body class="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-300">
                    IQ
                </div>
                <div>
                    <h1 class="text-sm font-bold">منظومة إدارة وأرشفة أجندة مجلس الوزراء</h1>
                    <p class="text-[11px] text-emerald-200">الأمانة العامة لمجلس الوزراء - جمهورية العراق</p>
                </div>
            </div>
            <nav class="flex items-center gap-4 text-xs font-semibold">
                <a asp-controller="Home" asp-action="Index" class="hover:text-amber-300">الرئيسية</a>
                <a asp-controller="Sessions" asp-action="Index" class="hover:text-amber-300">الجلسات</a>
                <a asp-controller="Sessions" asp-action="Calendar" class="hover:text-amber-300">التقويم التفاعلي</a>
                <a asp-controller="Decisions" asp-action="Index" class="hover:text-amber-300">القرارات</a>
                <a asp-controller="Reports" asp-action="Index" class="hover:text-amber-300">التقارير</a>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        @RenderBody()
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>الأمانة العامة لمجلس الوزراء &copy; @DateTime.Now.Year - جميع الحقوق محفوظة</p>
        <p class="text-[11px] text-slate-400 mt-1">حل برمجي كامل متوافق مع Visual Studio 2026 و SQL Server 2022</p>
    </footer>

    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
`;

  // Generate and Download Full Visual Studio 2026 + SQL Server 2022 .ZIP
  const handleDownloadFullZip = async () => {
    try {
      setIsZipping(true);
      showToast('جارٍ تجميع وتجهيز حزمة المشروع الكاملة (.zip)...', 'info');

      const zip = new JSZip();

      // 1. Solution Root File
      zip.file('CabinetAgendaSystem.sln', VS2026_SLN_CONTENT);
      zip.file('README_VisualStudio2026_SQLServer2022.md', README_CONTENT);

      // 2. Database Folder
      const dbFolder = zip.folder('Database');
      if (dbFolder) {
        dbFolder.file('CabinetAgendaDB_SQLServer2022.sql', SQL_SERVER_2022_SCRIPT);
      }

      // 3. Project Folder
      const projectFolder = zip.folder('CabinetAgendaSystem');
      if (projectFolder) {
        projectFolder.file('CabinetAgendaSystem.csproj', CSPROJ_CONTENT);
        projectFolder.file('Program.cs', PROGRAM_CS_CONTENT);
        projectFolder.file('appsettings.json', APPSETTINGS_CONTENT);
        projectFolder.file('appsettings.Development.json', APPSETTINGS_CONTENT);

        // Models
        const modelsFolder = projectFolder.folder('Models');
        if (modelsFolder) {
          modelsFolder.file('Entities.cs', csharpModelsCode);
        }

        // Data
        const dataFolder = projectFolder.folder('Data');
        if (dataFolder) {
          dataFolder.file('ApplicationDbContext.cs', csharpDbContextCode);
        }

        // Controllers
        const controllersFolder = projectFolder.folder('Controllers');
        if (controllersFolder) {
          controllersFolder.file('DecisionsController.cs', csharpControllerCode);
        }

        // Views
        const viewsFolder = projectFolder.folder('Views');
        if (viewsFolder) {
          viewsFolder.file('_ViewImports.cshtml', `@using CabinetAgendaSystem\n@using CabinetAgendaSystem.Models\n@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers`);
          viewsFolder.file('_ViewStart.cshtml', `@{ Layout = "_Layout"; }`);
          
          const sharedFolder = viewsFolder.folder('Shared');
          if (sharedFolder) {
            sharedFolder.file('_Layout.cshtml', razorLayoutCode);
          }
        }

        // wwwroot
        const wwwrootFolder = projectFolder.folder('wwwroot');
        if (wwwrootFolder) {
          const cssFolder = wwwrootFolder.folder('css');
          if (cssFolder) {
            cssFolder.file('site.css', `/* Official Cabinet System Stylesheet */\nbody { font-family: system-ui, -apple-system, sans-serif; }\n`);
          }
          const jsFolder = wwwrootFolder.folder('js');
          if (jsFolder) {
            jsFolder.file('site.js', `// Official Cabinet System Scripts\nconsole.log('Cabinet Agenda System Initialized.');\n`);
          }
        }
      }

      // Generate the zip blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'CabinetAgenda_VisualStudio2026_SqlServer2022.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('تم تصدير وتنزيل حزمة Visual Studio 2026 و SQL Server 2022 بنجاح!', 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تجميع ملف ZIP، يرجى المحاولة ثانية', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="p-6 bg-gradient-to-l from-emerald-900 via-slate-900 to-slate-950 text-white rounded-2xl border border-emerald-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                <span>Visual Studio 2026 Ready (.sln v18.0)</span>
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>SQL Server 2022 (Level 160)</span>
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                .NET 9.0 ASP.NET Core MVC
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              تصدير النظام لـ Visual Studio 2026 وقاعدة بيانات SQL Server 2022
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تصدير حل برمجي متكامل (.sln) جاهز للفتح الفوري والتشغيل المباشر على Visual Studio 2026 مع سكربت إنشاء وتهيئة قاعدة بيانات Microsoft SQL Server 2022 بجميع الجداول والعلاقات والبيانات التأسيسية.
            </p>
          </div>

          {/* Master One-Click ZIP Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadFullZip}
              disabled={isZipping}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <FolderArchive className="w-5 h-5 text-slate-950" />
              <span>
                {isZipping ? 'جارٍ تجميع الحزمة...' : 'تنزيل حزمة المشروع كاملة (.ZIP)'}
              </span>
            </button>

            <button
              onClick={() => downloadSingleFile(SQL_SERVER_2022_SCRIPT, 'CabinetAgendaDB_SQLServer2022.sql')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تنزيل SQL Server Script (.sql)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Architecture Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-500" />
            <span>ملف الحل Visual Studio 2026</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
            ملف <code className="text-amber-600 dark:text-amber-400 font-mono">CabinetAgendaSystem.sln</code> متوافق مع إصدار 18.0 (VS 2026) مع ملف المشروع .csproj وجميع مراجع حزم NuGet الحديثة.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <span>محرك SQL Server 2022</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
            مستوى توافق <strong className="font-mono">160</strong> مع دعم كامل لترميز UTF-8 العربي، دوال JSON الحديثة، وفهارس Clustered/Non-Clustered لتحقيق أعلى سرعة واستقرار.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>الهيكلية والتصنيفات العراقية</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
            جداول الدوائر والوزارات، تصنيف السلطات (تنفيذية، تشريعية، قضائية)، المجالس الوزارية، وخاصية إظهار الجهة في قوائم الإرسال مع سجل الرقابة والتدقيق (Audit Logs).
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Entity Framework Core 9</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
            تكامل سياق البيانات <code className="text-purple-600 dark:text-purple-400 font-mono">ApplicationDbContext</code> مع التهيئة التلقائية للبيانات التأسيسية عبر DbInitializer.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
        
        <button
          onClick={() => setActiveTab('sln')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
            activeTab === 'sln'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-amber-500" />
          <span>ملف الحل Visual Studio 2026 (.sln & .csproj)</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
            activeTab === 'sql'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>سكربت قاعدة بيانات SQL Server 2022 (.sql)</span>
        </button>

        <button
          onClick={() => setActiveTab('csharp_models')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
            activeTab === 'csharp_models'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-blue-500" />
          <span>C# Models & Enums</span>
        </button>

        <button
          onClick={() => setActiveTab('csharp_dbcontext')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
            activeTab === 'csharp_dbcontext'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-500" />
          <span>EF Core ApplicationDbContext</span>
        </button>

        <button
          onClick={() => setActiveTab('csharp_controllers')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
            activeTab === 'csharp_controllers'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-indigo-500" />
          <span>Controllers (الجلسات والقرارات)</span>
        </button>

        <button
          onClick={() => setActiveTab('program')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
            activeTab === 'program'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-500" />
          <span>Program.cs & appsettings.json</span>
        </button>

        <button
          onClick={() => setActiveTab('readme')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
            activeTab === 'readme'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-rose-500" />
          <span>دليل التشغيل README.md</span>
        </button>
      </div>

      {/* Code Display Box */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Code Bar */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[11px] text-slate-400 mr-2 font-mono" dir="ltr">
              {activeTab === 'sln'
                ? 'CabinetAgendaSystem.sln & CabinetAgendaSystem.csproj'
                : activeTab === 'sql'
                ? 'Database/CabinetAgendaDB_SQLServer2022.sql'
                : activeTab === 'csharp_models'
                ? 'CabinetAgendaSystem/Models/Entities.cs'
                : activeTab === 'csharp_dbcontext'
                ? 'CabinetAgendaSystem/Data/ApplicationDbContext.cs'
                : activeTab === 'csharp_controllers'
                ? 'CabinetAgendaSystem/Controllers/DecisionsController.cs'
                : activeTab === 'program'
                ? 'CabinetAgendaSystem/Program.cs & appsettings.json'
                : 'README_VisualStudio2026_SQLServer2022.md'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                let code = '';
                if (activeTab === 'sln') code = `${VS2026_SLN_CONTENT}\n\n<!-- ==================== CabinetAgendaSystem.csproj ==================== -->\n\n${CSPROJ_CONTENT}`;
                else if (activeTab === 'sql') code = SQL_SERVER_2022_SCRIPT;
                else if (activeTab === 'csharp_models') code = csharpModelsCode;
                else if (activeTab === 'csharp_dbcontext') code = csharpDbContextCode;
                else if (activeTab === 'csharp_controllers') code = csharpControllerCode;
                else if (activeTab === 'program') code = `${PROGRAM_CS_CONTENT}\n\n// ==================== appsettings.json ====================\n\n${APPSETTINGS_CONTENT}`;
                else code = README_CONTENT;

                copyToClipboard(code, activeTab);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود</span>
                </>
              )}
            </button>

            {/* Contextual Download Button */}
            {activeTab === 'sln' && (
              <button
                onClick={() => downloadSingleFile(VS2026_SLN_CONTENT, 'CabinetAgendaSystem.sln')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل .sln</span>
              </button>
            )}

            {activeTab === 'sql' && (
              <button
                onClick={() => downloadSingleFile(SQL_SERVER_2022_SCRIPT, 'CabinetAgendaDB_SQLServer2022.sql')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل .sql</span>
              </button>
            )}

            {activeTab === 'readme' && (
              <button
                onClick={() => downloadSingleFile(README_CONTENT, 'README_VisualStudio2026_SQLServer2022.md')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل الدليل</span>
              </button>
            )}
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-4 sm:p-6 overflow-x-auto max-h-[620px] leading-relaxed text-slate-300 font-mono text-left" dir="ltr">
          <code>
            {activeTab === 'sln' && (
              <>
                <span className="text-amber-400 font-bold">// 1. Visual Studio 2026 Solution File (CabinetAgendaSystem.sln)</span>
                {'\n'}
                {VS2026_SLN_CONTENT}
                {'\n\n'}
                <span className="text-blue-400 font-bold">&lt;!-- 2. Project File (.NET 9.0 / CabinetAgendaSystem.csproj) --&gt;</span>
                {'\n'}
                {CSPROJ_CONTENT}
              </>
            )}
            {activeTab === 'sql' && SQL_SERVER_2022_SCRIPT}
            {activeTab === 'csharp_models' && csharpModelsCode}
            {activeTab === 'csharp_dbcontext' && csharpDbContextCode}
            {activeTab === 'csharp_controllers' && csharpControllerCode}
            {activeTab === 'program' && (
              <>
                <span className="text-cyan-400 font-bold">// 1. Program.cs (ASP.NET Core 9.0 Entry Point)</span>
                {'\n'}
                {PROGRAM_CS_CONTENT}
                {'\n\n'}
                <span className="text-emerald-400 font-bold">// 2. appsettings.json (SQL Server 2022 Connection Strings)</span>
                {'\n'}
                {APPSETTINGS_CONTENT}
              </>
            )}
            {activeTab === 'readme' && README_CONTENT}
          </code>
        </pre>
      </div>

      {/* Execution Instructions Checklist */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>خطوات التشغيل السريع في بيئة العمل المحلية (Local Dev Workflow)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>تنفيذ سكربت SQL Server 2022</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              افتح <strong className="font-mono">SSMS 20</strong> ونفّذ ملف <code className="text-emerald-600 dark:text-emerald-400 font-mono">CabinetAgendaDB_SQLServer2022.sql</code> لإنشاء القاعدة والجداول والبيانات فوراً.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>فتح الحل في Visual Studio 2026</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              انقر نقراً مزدوجاً على ملف <code className="text-blue-600 dark:text-blue-400 font-mono">CabinetAgendaSystem.sln</code>؛ سيتعرف Visual Studio 2026 تلقائياً على بنية .NET 9.0 ويستعيد حزم NuGet.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>التشغيل بالضغط على F5</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              اضغط <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-sm font-mono text-[10px]">F5</kbd> لتشغيل التطبيق والاتصال بقاعدة البيانات محلياً مع تسجيل الدخول بحساب المسؤول <code className="font-mono">admin</code>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

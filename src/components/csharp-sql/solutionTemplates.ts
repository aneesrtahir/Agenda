// =========================================================================
// Visual Studio 2026 Solution & SQL Server 2022 Database Export Templates
// Cabinet Agenda & Documents Management System
// =========================================================================

export const VS2026_SLN_CONTENT = `Microsoft Visual Studio Solution File, Format Version 13.00
# Visual Studio Version 18
VisualStudioVersion = 18.0.35412.115
MinimumVisualStudioVersion = 10.0.40219.1
Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "CabinetAgendaSystem", "CabinetAgendaSystem\\CabinetAgendaSystem.csproj", "{A5E81932-B8E5-46D2-9653-F3B08CE54E81}"
EndProject
Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "Solution Items", "Solution Items", "{D71842C9-4C59-4E11-9A3F-2B5C64E8C23A}"
	ProjectSection(SolutionItems) = preProject
		Database\\CabinetAgendaDB_SQLServer2022.sql = Database\\CabinetAgendaDB_SQLServer2022.sql
		README_VisualStudio2026_SQLServer2022.md = README_VisualStudio2026_SQLServer2022.md
	EndProjectSection
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution
		{A5E81932-B8E5-46D2-9653-F3B08CE54E81}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{A5E81932-B8E5-46D2-9653-F3B08CE54E81}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{A5E81932-B8E5-46D2-9653-F3B08CE54E81}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{A5E81932-B8E5-46D2-9653-F3B08CE54E81}.Release|Any CPU.Build.0 = Release|Any CPU
	EndGlobalSection
	GlobalSection(SolutionProperties) = preSolution
		HideSolutionNode = FALSE
	EndGlobalSection
	GlobalSection(ExtensibilityGlobals) = postSolution
		SolutionGuid = {4E184920-569A-40C2-85D9-3914FA601B2E}
	EndGlobalSection
EndGlobal
`;

export const CSPROJ_CONTENT = `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UserSecretsId>cabinet-agenda-visualstudio2026</UserSecretsId>
    <LangVersion>13.0</LangVersion>
    <RootNamespace>CabinetAgendaSystem</RootNamespace>
    <AssemblyName>CabinetAgendaSystem</AssemblyName>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="9.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation" Version="9.0.0" />
  </ItemGroup>

  <ItemGroup>
    <Folder Include="wwwroot\\uploads\\" />
  </ItemGroup>

</Project>
`;

export const APPSETTINGS_CONTENT = `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "CabinetAgendaConnection": "Server=localhost;Database=CabinetAgendaDB_2022;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;",
    "SqlServer2022_Express": "Server=.\\\\SQLEXPRESS;Database=CabinetAgendaDB_2022;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;",
    "LocalDbConnection": "Server=(localdb)\\\\mssqllocaldb;Database=CabinetAgendaDB_2022;Trusted_Connection=True;MultipleActiveResultSets=true;"
  },
  "SystemSettings": {
    "SystemTitle": "منظومة إدارة وأرشفة أجندة مجلس الوزراء",
    "GeneralSecretariat": "الأمانة العامة لمجلس الوزراء - جمهورية العراق",
    "MaxUploadFileSizeMb": 50,
    "AllowedFileExtensions": [ ".pdf", ".docx", ".xlsx", ".pptx", ".jpg", ".png" ]
  }
}
`;

export const PROGRAM_CS_CONTENT = `// =========================================================================
// Visual Studio 2026 / ASP.NET Core 9.0 MVC
// Cabinet Council Agenda & Documents Management System
// Entry Point: Program.cs
// =========================================================================

using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using CabinetAgendaSystem.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services to DI Container
builder.Services.AddControllersWithViews()
    .AddRazorRuntimeCompilation();

// 2. Configure Entity Framework Core with SQL Server 2022
var connectionString = builder.Configuration.GetConnectionString("CabinetAgendaConnection")
    ?? builder.Configuration.GetConnectionString("LocalDbConnection")
    ?? throw new InvalidOperationException("Connection string 'CabinetAgendaConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
        sqlOptions.CommandTimeout(60);
    });
});

// 3. Cookie Authentication & Role-Based Authorization
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Account/AccessDenied";
        options.Cookie.Name = "CabinetAgenda.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("AgendaManagers", policy => policy.RequireRole("Admin", "مدير الأجندة"));
    options.AddPolicy("CanViewDecisions", policy => policy.RequireAuthenticatedUser());
});

// 4. Session Configuration
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// 5. Automatic Database Migration & Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "حدث خطأ أثناء تهيئة قاعدة بيانات SQL Server 2022");
    }
}

// 6. HTTP Pipeline Middleware
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
`;

export const SQL_SERVER_2022_SCRIPT = `-- =========================================================================
-- منظومة إدارة وأرشفة أجندة مجلس الوزراء - جمهورية العراق
-- CABINET COUNCIL AGENDA & DOCUMENTS MANAGEMENT SYSTEM
-- Target Database: Microsoft SQL Server 2022 (RTM / CU / Azure SQL)
-- Compatibility Level: 160 (SQL Server 2022)
-- UTF-8 Support enabled for full Arabic script fidelity
-- =========================================================================

USE master;
GO

-- 1. إنشاء قاعدة البيانات مع دعم ترميز UTF-8 ومستوى التوافق 160
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'CabinetAgendaDB_2022')
BEGIN
    CREATE DATABASE CabinetAgendaDB_2022
    COLLATE Arabic_100_CI_AI_SC_UTF8;
    
    PRINT N'تم إنشاء قاعدة بيانات CabinetAgendaDB_2022 بنجاح.';
END
GO

ALTER DATABASE CabinetAgendaDB_2022 SET COMPATIBILITY_LEVEL = 160;
GO

ALTER DATABASE CabinetAgendaDB_2022 SET RECOVERY SIMPLE;
ALTER DATABASE CabinetAgendaDB_2022 SET ANSI_NULL_DEFAULT ON;
ALTER DATABASE CabinetAgendaDB_2022 SET ANSI_NULLS ON;
ALTER DATABASE CabinetAgendaDB_2022 SET ANSI_PADDING ON;
ALTER DATABASE CabinetAgendaDB_2022 SET ANSI_WARNINGS ON;
ALTER DATABASE CabinetAgendaDB_2022 SET ARITHABORT ON;
ALTER DATABASE CabinetAgendaDB_2022 SET CONCAT_NULL_YIELDS_NULL ON;
ALTER DATABASE CabinetAgendaDB_2022 SET NUMERIC_ROUNDABORT OFF;
ALTER DATABASE CabinetAgendaDB_2022 SET QUOTED_IDENTIFIER ON;
GO

USE CabinetAgendaDB_2022;
GO

-- =========================================================================
-- الجداول الأساسية (CORE TABLES)
-- =========================================================================

-- 1. جدول الحكومات (Governments)
IF OBJECT_ID(N'dbo.Governments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Governments (
        GovernmentId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(250) NOT NULL,
        PrimeMinister NVARCHAR(250) NOT NULL,
        StartYear INT NOT NULL,
        EndYear INT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        IsHidden BIT NOT NULL DEFAULT 0,
        Description NVARCHAR(MAX) NULL,
        OrderIndex INT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Governments_IsActive ON dbo.Governments(IsActive);
END
GO

-- 2. جدول السنوات التابعة للحكومة (Years)
IF OBJECT_ID(N'dbo.Years', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Years (
        YearId INT IDENTITY(1,1) PRIMARY KEY,
        GovernmentId INT NOT NULL,
        YearNumber INT NOT NULL,
        IsHidden BIT NOT NULL DEFAULT 0,
        Notes NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Years_Governments FOREIGN KEY (GovernmentId) 
            REFERENCES dbo.Governments(GovernmentId) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IX_Years_Gov_YearNum ON dbo.Years(GovernmentId, YearNumber);
END
GO

-- 3. جدول الدوائر والوزارات والمؤسسات الدستورية (Departments)
-- يشمل التصنيفات الدستورية: سلطة تنفيذية، سلطة تشريعية، سلطة قضائية
-- فئات: وزارات، هيئات، محافظات ومجالس محافظات، أخرى
-- المجالس الوزارية التخصصية وخاصية إظهار الجهة في قوائم الإرسال
IF OBJECT_ID(N'dbo.Departments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Departments (
        DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(250) NOT NULL,
        NameEn NVARCHAR(250) NULL, -- اسم الوزارة باللغة الإنكليزية للعلامة المائية
        Type NVARCHAR(100) NOT NULL, -- أمانة عامة، وزارة، هيئة مستقلة، مجلس محافظة، ...
        Category NVARCHAR(100) NOT NULL DEFAULT N'وزارات', -- 'وزارات', 'هيئات', 'محافظات ومجالس محافظات', 'أخرى'
        Authority NVARCHAR(100) NOT NULL DEFAULT N'سلطة تنفيذية', -- 'سلطة تنفيذية', 'سلطة تشريعية', 'سلطة قضائية'
        ParentDepartmentName NVARCHAR(250) NULL DEFAULT N'الدولة العراقية',
        AdditionalCouncils NVARCHAR(MAX) NULL, -- المجلس الوزاري للطاقة، المجلس الوزاري للتنمية البشرية، ...
        ShowInSendingLists BIT NOT NULL DEFAULT 1, -- خاصية إظهار الجهة في قوائم الإرسال أو إخفائها
        DirectorName NVARCHAR(200) NULL,
        Phone NVARCHAR(50) NULL,
        Email NVARCHAR(150) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Departments_Category ON dbo.Departments(Category);
    CREATE INDEX IX_Departments_Authority ON dbo.Departments(Authority);
    CREATE INDEX IX_Departments_ShowInSending ON dbo.Departments(ShowInSendingLists);
END
GO

-- 4. جدول المستخدمين ومستويات الوصول (ApplicationUsers)
-- المستويات: Admin، مدير الأجندة، مساعد، مستخدم
IF OBJECT_ID(N'dbo.ApplicationUsers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ApplicationUsers (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(200) NOT NULL,
        Username NVARCHAR(100) NOT NULL UNIQUE,
        Email NVARCHAR(200) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL DEFAULT N'AQAAAAEAACcQAAAAE...', -- PBKDF2 / Argon2 Hash
        Role NVARCHAR(50) NOT NULL, -- 'Admin', 'مدير الأجندة', 'مساعد', 'مستخدم'
        DepartmentId INT NOT NULL,
        AvatarUrl NVARCHAR(MAX) NULL,
        Phone NVARCHAR(50) NULL,
        JobTitle NVARCHAR(200) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        LastLoginAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Users_Departments FOREIGN KEY (DepartmentId) 
            REFERENCES dbo.Departments(DepartmentId),
        CONSTRAINT CK_User_Role CHECK (Role IN (N'Admin', N'مدير الأجندة', N'مساعد', N'مستخدم'))
    );
    CREATE INDEX IX_Users_Role ON dbo.ApplicationUsers(Role);
    CREATE INDEX IX_Users_Department ON dbo.ApplicationUsers(DepartmentId);
END
GO

-- 5. جدول الجلسات الوزارية (CabinetSessions)
IF OBJECT_ID(N'dbo.CabinetSessions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CabinetSessions (
        SessionId INT IDENTITY(1,1) PRIMARY KEY,
        GovernmentId INT NOT NULL,
        YearId INT NOT NULL,
        SessionNumber INT NOT NULL,
        SessionDate DATE NOT NULL,
        SessionType NVARCHAR(50) NOT NULL, -- 'عادية', 'طارئة', 'استثنائية'
        Status NVARCHAR(50) NOT NULL DEFAULT N'قيد الإعداد', -- 'منعقدة', 'قيد الإعداد', 'مؤجلة', 'مكتملة'
        Location NVARCHAR(250) NULL DEFAULT N'قاعة اجتماعات مجلس الوزراء - بغداد',
        Chairman NVARCHAR(250) NULL,
        Notes NVARCHAR(MAX) NULL,
        IsHidden BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Sessions_Governments FOREIGN KEY (GovernmentId) REFERENCES dbo.Governments(GovernmentId),
        CONSTRAINT FK_Sessions_Years FOREIGN KEY (YearId) REFERENCES dbo.Years(YearId),
        CONSTRAINT CK_Session_Type CHECK (SessionType IN (N'عادية', N'طارئة', N'استثنائية'))
    );
    CREATE INDEX IX_Sessions_Date ON dbo.CabinetSessions(SessionDate);
    CREATE INDEX IX_Sessions_Gov_Year ON dbo.CabinetSessions(GovernmentId, YearId);
END
GO

-- 6. جدول أنواع الوثائق (DocumentTypes)
IF OBJECT_ID(N'dbo.DocumentTypes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DocumentTypes (
        DocumentTypeId INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(150) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsSystem BIT NOT NULL DEFAULT 1
    );
END
GO

-- 7. جدول التبويبات الأساسية للقرارات (MainCategories)
IF OBJECT_ID(N'dbo.MainCategories', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MainCategories (
        MainCategoryId INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500) NULL
    );
END
GO

-- 8. جدول التبويبات الفرعية (SubCategories)
IF OBJECT_ID(N'dbo.SubCategories', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SubCategories (
        SubCategoryId INT IDENTITY(1,1) PRIMARY KEY,
        MainCategoryId INT NOT NULL,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500) NULL,
        CONSTRAINT FK_SubCategories_MainCategories FOREIGN KEY (MainCategoryId) 
            REFERENCES dbo.MainCategories(MainCategoryId) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IX_SubCat_Main_Code ON dbo.SubCategories(MainCategoryId, Code);
END
GO

-- 9. جدول الوثائق والمحاضر العامة للجلسة (CabinetDocuments)
IF OBJECT_ID(N'dbo.CabinetDocuments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CabinetDocuments (
        DocumentId INT IDENTITY(1,1) PRIMARY KEY,
        GovernmentId INT NOT NULL,
        YearId INT NOT NULL,
        SessionId INT NOT NULL,
        DocumentTypeId INT NOT NULL,
        Subject NVARCHAR(500) NOT NULL,
        Keywords NVARCHAR(MAX) NULL,
        Notes NVARCHAR(MAX) NULL,
        FileName NVARCHAR(255) NULL,
        FileSize NVARCHAR(50) NULL,
        FileUrl NVARCHAR(MAX) NULL,
        FileDataUrl NVARCHAR(MAX) NULL, -- تخزين Base64 للملف عند الحاجة
        FileType NVARCHAR(100) NULL,
        ReferenceNumber NVARCHAR(100) NULL,
        RecipientDepartments NVARCHAR(MAX) NULL, -- مصفوفة JSON للدوائر المرسل إليها
        IsAllDepartments BIT NOT NULL DEFAULT 0,
        IsHidden BIT NOT NULL DEFAULT 0,
        IsDeleted BIT NOT NULL DEFAULT 0,        -- الحذف الناعم (Soft Delete)
        DeletedAt DATETIME2 NULL,
        DeletedByUserId INT NULL,
        DeletionReason NVARCHAR(500) NULL,
        CreatedByUserId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Docs_Governments FOREIGN KEY (GovernmentId) REFERENCES dbo.Governments(GovernmentId),
        CONSTRAINT FK_Docs_Years FOREIGN KEY (YearId) REFERENCES dbo.Years(YearId),
        CONSTRAINT FK_Docs_Sessions FOREIGN KEY (SessionId) REFERENCES dbo.CabinetSessions(SessionId) ON DELETE CASCADE,
        CONSTRAINT FK_Docs_DocTypes FOREIGN KEY (DocumentTypeId) REFERENCES dbo.DocumentTypes(DocumentTypeId),
        CONSTRAINT FK_Docs_Users FOREIGN KEY (CreatedByUserId) REFERENCES dbo.ApplicationUsers(UserId)
    );
    CREATE INDEX IX_Docs_Session ON dbo.CabinetDocuments(SessionId);
    CREATE INDEX IX_Docs_Deleted ON dbo.CabinetDocuments(IsDeleted);
END
GO

-- 10. جدول القرارات والتوجيهات الوزارية (CabinetDecisions)
IF OBJECT_ID(N'dbo.CabinetDecisions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CabinetDecisions (
        DecisionId INT IDENTITY(1,1) PRIMARY KEY,
        GovernmentId INT NOT NULL,
        YearId INT NOT NULL,
        SessionId INT NOT NULL,
        DecisionNumber NVARCHAR(100) NOT NULL,   -- رقم القرار أو 0 للتوجيه
        IsDirective BIT NOT NULL DEFAULT 0,      -- 1 للتوجيهات (رقمها 0)
        LetterNumber NVARCHAR(100) NOT NULL,     -- رقم الكتاب الرسمي
        LetterDate DATE NOT NULL,               -- تاريخ الكتاب
        Subject NVARCHAR(500) NOT NULL,         -- موضوع القرار
        MainCategoryId INT NOT NULL,            -- التبويب الأساسي
        SubCategoryId INT NOT NULL,             -- التبويب الفرعي
        DecisionType NVARCHAR(50) NOT NULL,     -- 'قرار عادي', 'سري', 'طارئ', 'سري-وطارئ'
        ExecutionStatus NVARCHAR(50) NOT NULL DEFAULT N'قيد المتابعة',
        Keywords NVARCHAR(MAX) NULL,
        Notes NVARCHAR(MAX) NULL,
        TargetDepartments NVARCHAR(MAX) NULL,   -- مصفوفة JSON للدوائر المستلمة
        RecipientDepartments NVARCHAR(MAX) NULL,
        IsAllDepartments BIT NOT NULL DEFAULT 0,
        FileName NVARCHAR(255) NULL,
        FileSize NVARCHAR(50) NULL,
        FileUrl NVARCHAR(MAX) NULL,
        FileDataUrl NVARCHAR(MAX) NULL,
        IsHidden BIT NOT NULL DEFAULT 0,
        IsDeleted BIT NOT NULL DEFAULT 0,        -- الحذف الناعم
        DeletedAt DATETIME2 NULL,
        DeletedByUserId INT NULL,
        DeletionReason NVARCHAR(500) NULL,
        CreatedByUserId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Dec_Governments FOREIGN KEY (GovernmentId) REFERENCES dbo.Governments(GovernmentId),
        CONSTRAINT FK_Dec_Years FOREIGN KEY (YearId) REFERENCES dbo.Years(YearId),
        CONSTRAINT FK_Dec_Sessions FOREIGN KEY (SessionId) REFERENCES dbo.CabinetSessions(SessionId) ON DELETE CASCADE,
        CONSTRAINT FK_Dec_MainCat FOREIGN KEY (MainCategoryId) REFERENCES dbo.MainCategories(MainCategoryId),
        CONSTRAINT FK_Dec_SubCat FOREIGN KEY (SubCategoryId) REFERENCES dbo.SubCategories(SubCategoryId),
        CONSTRAINT FK_Dec_Users FOREIGN KEY (CreatedByUserId) REFERENCES dbo.ApplicationUsers(UserId),
        CONSTRAINT CK_Decision_Type CHECK (DecisionType IN (N'قرار عادي', N'سري', N'طارئ', N'سري-وطارئ'))
    );
    CREATE INDEX IX_Decisions_Number ON dbo.CabinetDecisions(DecisionNumber);
    CREATE INDEX IX_Decisions_Letter ON dbo.CabinetDecisions(LetterNumber, LetterDate);
    CREATE INDEX IX_Decisions_Type ON dbo.CabinetDecisions(DecisionType);
    CREATE INDEX IX_Decisions_Directive ON dbo.CabinetDecisions(IsDirective);
    CREATE INDEX IX_Decisions_Deleted ON dbo.CabinetDecisions(IsDeleted);
END
GO

-- 11. جدول ربط القرارات مع أي قرار آخر (DecisionRelations)
-- أنواع الربط: إلغاء قرار، إلغاء فقرة، تعديل قرار، تعديل فقرة، استثناء قرار، استثناء جهة
IF OBJECT_ID(N'dbo.DecisionRelations', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DecisionRelations (
        RelationId INT IDENTITY(1,1) PRIMARY KEY,
        SourceDecisionId INT NOT NULL,
        TargetDecisionId INT NOT NULL,
        RelationType NVARCHAR(100) NOT NULL, -- 'إلغاء قرار', 'إلغاء فقرة من قرار', 'تعديل قرار', 'تعديل فقرة من قرار', 'استثناء قرار', 'استثناء جهة من قرار'
        ParagraphNumber NVARCHAR(100) NULL,
        ExemptedDepartmentName NVARCHAR(250) NULL,
        Notes NVARCHAR(MAX) NULL,
        CreatedByName NVARCHAR(200) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Rel_Source FOREIGN KEY (SourceDecisionId) REFERENCES dbo.CabinetDecisions(DecisionId),
        CONSTRAINT FK_Rel_Target FOREIGN KEY (TargetDecisionId) REFERENCES dbo.CabinetDecisions(DecisionId)
    );
    CREATE INDEX IX_Rel_Source ON dbo.DecisionRelations(SourceDecisionId);
    CREATE INDEX IX_Rel_Target ON dbo.DecisionRelations(TargetDecisionId);
END
GO

-- 12. جدول سجل تأكيدات الاستلام والاطلاع الرسمي (DocumentReceiptLogs)
IF OBJECT_ID(N'dbo.DocumentReceiptLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DocumentReceiptLogs (
        ReceiptId INT IDENTITY(1,1) PRIMARY KEY,
        DocumentId INT NOT NULL,
        DocumentTitle NVARCHAR(500) NOT NULL,
        UserId INT NOT NULL,
        UserName NVARCHAR(200) NOT NULL,
        UserRole NVARCHAR(50) NOT NULL,
        DepartmentId INT NOT NULL,
        DepartmentName NVARCHAR(250) NOT NULL,
        DepartmentNameEn NVARCHAR(250) NULL,
        ViewedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        ConfirmedAt DATETIME2 NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT N'تم الاطلاع فقط', -- 'تم الاطلاع فقط', 'تم تأكيد الاستلام رسمياً'
        ReceiptNumber NVARCHAR(100) NULL,
        Notes NVARCHAR(MAX) NULL
    );
    CREATE INDEX IX_Rcpt_Doc ON dbo.DocumentReceiptLogs(DocumentId);
    CREATE INDEX IX_Rcpt_User ON dbo.DocumentReceiptLogs(UserId);
    CREATE INDEX IX_Rcpt_Status ON dbo.DocumentReceiptLogs(Status);
END
GO

-- 13. جدول سجل الحركات العام والرقابة (AuditLogs)
IF OBJECT_ID(N'dbo.AuditLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs (
        LogId INT IDENTITY(1,1) PRIMARY KEY,
        Timestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UserId INT NOT NULL,
        UserName NVARCHAR(200) NOT NULL,
        UserRole NVARCHAR(50) NOT NULL,
        DepartmentName NVARCHAR(250) NOT NULL,
        ActionType NVARCHAR(100) NOT NULL,
        EntityType NVARCHAR(50) NOT NULL,
        EntityId NVARCHAR(100) NULL,
        EntityTitle NVARCHAR(500) NULL,
        Details NVARCHAR(MAX) NOT NULL,
        IpAddress NVARCHAR(50) NOT NULL DEFAULT N'127.0.0.1'
    );
    CREATE INDEX IX_Audit_Time ON dbo.AuditLogs(Timestamp DESC);
    CREATE INDEX IX_Audit_User ON dbo.AuditLogs(UserId);
    CREATE INDEX IX_Audit_Action ON dbo.AuditLogs(ActionType);
END
GO

-- 14. جدول المراسلات الواردة والبريد الوزاري (MinisterialDispatches)
IF OBJECT_ID(N'dbo.MinisterialDispatches', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MinisterialDispatches (
        DispatchId INT IDENTITY(1,1) PRIMARY KEY,
        Direction NVARCHAR(100) NOT NULL, -- 'من الوزارة إلى مجلس الوزراء', 'من مجلس الوزراء إلى الوزارة'
        FromDepartmentId INT NOT NULL,
        FromDepartmentName NVARCHAR(250) NOT NULL,
        ToDepartmentId INT NOT NULL,
        ToDepartmentName NVARCHAR(250) NOT NULL,
        SenderUserId INT NOT NULL,
        SenderUserName NVARCHAR(200) NOT NULL,
        SenderRole NVARCHAR(50) NOT NULL,
        Subject NVARCHAR(500) NOT NULL,
        Body NVARCHAR(MAX) NOT NULL,
        Priority NVARCHAR(50) NOT NULL DEFAULT N'عادي',
        Status NVARCHAR(50) NOT NULL DEFAULT N'جديد',
        LetterNumber NVARCHAR(100) NOT NULL,
        LetterDate DATE NOT NULL,
        FileName NVARCHAR(255) NULL,
        FileSize NVARCHAR(50) NULL,
        FileDataUrl NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        ConfirmedAt DATETIME2 NULL,
        Notes NVARCHAR(MAX) NULL
    );
    CREATE INDEX IX_Disp_Direction ON dbo.MinisterialDispatches(Direction);
    CREATE INDEX IX_Disp_Status ON dbo.MinisterialDispatches(Status);
END
GO

-- =========================================================================
-- عروض وتقارير SQL Server 2022 (VIEWS)
-- =========================================================================

-- View: ملخص شامل للجلسات وعدد وثائقها وقراراتها
CREATE OR ALTER VIEW dbo.vw_SessionsOverview
AS
SELECT 
    s.SessionId,
    s.SessionNumber,
    s.SessionDate,
    s.SessionType,
    s.Status,
    s.Location,
    s.Chairman,
    g.Name AS GovernmentName,
    y.YearNumber,
    COUNT(DISTINCT d.DocumentId) AS DocumentsCount,
    COUNT(DISTINCT dec.DecisionId) AS DecisionsCount
FROM dbo.CabinetSessions s
INNER JOIN dbo.Governments g ON s.GovernmentId = g.GovernmentId
INNER JOIN dbo.Years y ON s.YearId = y.YearId
LEFT JOIN dbo.CabinetDocuments d ON s.SessionId = d.SessionId AND d.IsDeleted = 0
LEFT JOIN dbo.CabinetDecisions dec ON s.SessionId = dec.SessionId AND dec.IsDeleted = 0
WHERE s.IsHidden = 0
GROUP BY 
    s.SessionId, s.SessionNumber, s.SessionDate, s.SessionType, 
    s.Status, s.Location, s.Chairman, g.Name, y.YearNumber;
GO

-- View: تقرير القرارات مع تبويباتها وبيانات الجلسة
CREATE OR ALTER VIEW dbo.vw_DecisionsReport
AS
SELECT 
    d.DecisionId,
    d.DecisionNumber,
    d.IsDirective,
    d.LetterNumber,
    d.LetterDate,
    d.Subject,
    d.DecisionType,
    d.ExecutionStatus,
    mc.Name AS MainCategoryName,
    sc.Name AS SubCategoryName,
    s.SessionNumber,
    s.SessionDate,
    g.Name AS GovernmentName,
    y.YearNumber
FROM dbo.CabinetDecisions d
INNER JOIN dbo.CabinetSessions s ON d.SessionId = s.SessionId
INNER JOIN dbo.Governments g ON d.GovernmentId = g.GovernmentId
INNER JOIN dbo.Years y ON d.YearId = y.YearId
INNER JOIN dbo.MainCategories mc ON d.MainCategoryId = mc.MainCategoryId
INNER JOIN dbo.SubCategories sc ON d.SubCategoryId = sc.SubCategoryId
WHERE d.IsDeleted = 0;
GO

-- =========================================================================
-- إجراءات مخزونة SQL Server 2022 (STORED PROCEDURES)
-- =========================================================================

-- تقويم الجلسات للشهر والسنة المحددة
CREATE OR ALTER PROCEDURE dbo.sp_GetSessionsCalendar
    @Year INT,
    @Month INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        SessionId,
        SessionNumber,
        SessionDate,
        SessionType,
        Status,
        Location,
        Chairman,
        Notes
    FROM dbo.CabinetSessions
    WHERE YEAR(SessionDate) = @Year
      AND (@Month IS NULL OR MONTH(SessionDate) = @Month)
      AND IsHidden = 0
    ORDER BY SessionDate ASC;
END;
GO

-- إحصائيات تقرير الوثائق حسب الحكومات والسنوات والتصنيف السري / العادي
CREATE OR ALTER PROCEDURE dbo.sp_GetDocumentsReportByGovAndYear
    @GovernmentId INT = NULL,
    @YearId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        g.Name AS GovernmentName,
        y.YearNumber,
        d.DecisionType AS Classification,
        COUNT(d.DecisionId) AS TotalCount
    FROM dbo.CabinetDecisions d
    INNER JOIN dbo.Governments g ON d.GovernmentId = g.GovernmentId
    INNER JOIN dbo.Years y ON d.YearId = y.YearId
    WHERE d.IsDeleted = 0
      AND (@GovernmentId IS NULL OR d.GovernmentId = @GovernmentId)
      AND (@YearId IS NULL OR d.YearId = @YearId)
    GROUP BY g.Name, y.YearNumber, d.DecisionType
    ORDER BY g.Name, y.YearNumber, d.DecisionType;
END;
GO

-- تسجيل حركة في سجل التدقيق
CREATE OR ALTER PROCEDURE dbo.sp_RecordAuditLog
    @UserId INT,
    @UserName NVARCHAR(200),
    @UserRole NVARCHAR(50),
    @DepartmentName NVARCHAR(250),
    @ActionType NVARCHAR(100),
    @EntityType NVARCHAR(50),
    @EntityId NVARCHAR(100),
    @EntityTitle NVARCHAR(500),
    @Details NVARCHAR(MAX),
    @IpAddress NVARCHAR(50) = N'127.0.0.1'
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.AuditLogs (
        UserId, UserName, UserRole, DepartmentName, 
        ActionType, EntityType, EntityId, EntityTitle, 
        Details, IpAddress
    )
    VALUES (
        @UserId, @UserName, @UserRole, @DepartmentName, 
        @ActionType, @EntityType, @EntityId, @EntityTitle, 
        @Details, @IpAddress
    );
END;
GO

-- =========================================================================
-- إدراج البيانات التأسيسية الأولية (SEED DATA)
-- =========================================================================

-- 1. إضافة الحكومات
IF NOT EXISTS (SELECT 1 FROM dbo.Governments)
BEGIN
    SET IDENTITY_INSERT dbo.Governments ON;
    INSERT INTO dbo.Governments (GovernmentId, Name, PrimeMinister, StartYear, EndYear, IsActive, Description, OrderIndex)
    VALUES 
    (1, N'حكومة السيد محمد شياع السوداني', N'محمد شياع السوداني', 2022, NULL, 1, N'الحكومة الحالية لمجلس الوزراء العراقي', 1),
    (2, N'حكومة السيد مصطفى الكاظمي', N'مصطفى الكاظمي', 2020, 2022, 0, N'حكومة الفترة الانتقالية السابقة', 2),
    (3, N'حكومة السيد عادل عبد المهدي', N'عادل عبد المهدي', 2018, 2020, 0, N'حكومة مجلس الوزراء 2018-2020', 3);
    SET IDENTITY_INSERT dbo.Governments OFF;
END
GO

-- 2. إضافة سنوات الحكومة الحالية
IF NOT EXISTS (SELECT 1 FROM dbo.Years)
BEGIN
    SET IDENTITY_INSERT dbo.Years ON;
    INSERT INTO dbo.Years (YearId, GovernmentId, YearNumber, IsHidden, Notes)
    VALUES 
    (1, 1, 2026, 0, N'السنة التشغيلية الحالية'),
    (2, 1, 2025, 0, N'أرشيف جلسات 2025'),
    (3, 1, 2024, 0, N'أرشيف جلسات 2024'),
    (4, 1, 2023, 0, N'أرشيف جلسات 2023'),
    (5, 1, 2022, 0, N'بداية التشكيل الوزاري');
    SET IDENTITY_INSERT dbo.Years OFF;
END
GO

-- 3. إضافة الدوائر الحكومية والوزارات والهيئات والمحافظات
IF NOT EXISTS (SELECT 1 FROM dbo.Departments)
BEGIN
    SET IDENTITY_INSERT dbo.Departments ON;
    INSERT INTO dbo.Departments (DepartmentId, Code, Name, NameEn, Type, Category, Authority, ParentDepartmentName, AdditionalCouncils, ShowInSendingLists, DirectorName)
    VALUES 
    (1, N'GS-COM', N'الأمانة العامة لمجلس الوزراء', N'General Secretariat for the Council of Ministers', N'أمانة عامة', N'أخرى', N'سلطة تنفيذية', N'الدولة العراقية', N'المجلس الوزراء للخدمات الاجتماعية', 1, N'د. حميد نعيم الغزي'),
    (2, N'MO-OIL', N'وزارة النفط', N'Ministry of Oil', N'وزارة', N'وزارات', N'سلطة تنفيذية', N'الدولة العراقية', N'المجلس الوزاري للطاقة', 1, N'حيان عبد الغني'),
    (3, N'MO-FA', N'وزارة الخارجية', N'Ministry of Foreign Affairs', N'وزارة', N'وزارات', N'سلطة تنفيذية', N'الدولة العراقية', NULL, 1, N'فؤاد حسين'),
    (4, N'MO-FIN', N'وزارة المالية', N'Ministry of Finance', N'وزارة', N'وزارات', N'سلطة تنفيذية', N'الدولة العراقية', NULL, 1, N'طيف سامي'),
    (5, N'MO-DEF', N'وزارة الدفاع', N'Ministry of Defence', N'وزارة', N'وزارات', N'سلطة تنفيذية', N'الدولة العراقية', NULL, 1, N'ثابت العباسي'),
    (6, N'MO-INT', N'وزارة الداخلية', N'Ministry of Interior', N'وزارة', N'وزارات', N'سلطة تنفيذية', N'الدولة العراقية', NULL, 1, N'عبد الأمير الشمري'),
    (7, N'MO-PLAN', N'وزارة التخطيط', N'Ministry of Planning', N'وزارة', N'وزارات', N'سلطة تنفيذية', N'الدولة العراقية', N'المجلس الوزاري للتنمية البشرية', 1, N'محمد علي تميم'),
    (8, N'MO-ELEC', N'وزارة الكهرباء', N'Ministry of Electricity', N'وزارة', N'وزارات', N'سلطة تنفيذية', N'الدولة العراقية', N'المجلس الوزاري للطاقة', 1, N'زياد علي فاضل'),
    (9, N'MO-WR', N'وزارة الموارد المائية', N'Ministry of Water Resources', N'وزارة', N'وزارات', N'سلطة تنفيذية', N'الدولة العراقية', N'اللجنة العليا للمياه', 1, N'عون ذياب عبد الله'),
    (10, N'MO-HLTH', N'وزارة الصحة', N'Ministry of Health', N'وزارة', N'وزارات', N'سلطة تنفيذية', N'الدولة العراقية', N'المجلس الوزاري للتنمية البشرية', 1, N'صالح الحسناوي'),
    (11, N'IC-COM', N'هيئة النزاهة الاتحادية', N'Federal Commission of Integrity', N'هيئة مستقلة', N'هيئات', N'سلطة تنفيذية', N'الدولة العراقية', NULL, 1, N'محمد علي اللامي'),
    (12, N'NIC-IQ', N'الهيئة الوطنية للاستثمار', N'National Investment Commission', N'هيئة مستقلة', N'هيئات', N'سلطة تنفيذية', N'الدولة العراقية', NULL, 1, N'د. حيدر مكية'),
    (13, N'GOV-BGD', N'محافظة ومجلس محافظة بغداد', N'Baghdad Governorate & Provincial Council', N'محافظة', N'محافظات ومجالس محافظات', N'سلطة تنفيذية', N'الدولة العراقية', N'المجلس الوزراء للخدمات الاجتماعية', 1, N'محافظ بغداد'),
    (14, N'GOV-BSR', N'محافظة ومجلس محافظة البصرة', N'Basra Governorate & Provincial Council', N'محافظة', N'محافظات ومجالس محافظات', N'سلطة تنفيذية', N'الدولة العراقية', NULL, 1, N'محافظ البصرة'),
    (15, N'HJC-IQ', N'مجلس القضاء الأعلى', N'Supreme Judicial Council', N'سلطة قضائية', N'أخرى', N'سلطة قضائية', N'الدولة العراقية', NULL, 1, N'فائق زيدان'),
    (16, N'COR-IQ', N'مجلس النواب العراقي', N'Council of Representatives', N'سلطة تشريعية', N'أخرى', N'سلطة تشريعية', N'الدولة العراقية', NULL, 1, N'رئيس مجلس النواب');
    SET IDENTITY_INSERT dbo.Departments OFF;
END
GO

-- 4. إضافة حسابات المسؤولين والمستخدمين
IF NOT EXISTS (SELECT 1 FROM dbo.ApplicationUsers)
BEGIN
    SET IDENTITY_INSERT dbo.ApplicationUsers ON;
    INSERT INTO dbo.ApplicationUsers (UserId, FullName, Username, Email, PasswordHash, Role, DepartmentId, JobTitle)
    VALUES 
    (1, N'م. أنيس طاهر (مدير النظام)', N'admin', N'admin@cabinet.gov.iq', N'Admin#2026!SecureHash', N'Admin', 1, N'مدير إدارة البنية والتحول الرقمي'),
    (2, N'أحمد حسن (مدير الأجندة)', N'agenda_mgr', N'agenda@cabinet.gov.iq', N'Agenda#2026!SecureHash', N'مدير الأجندة', 1, N'مدير عام دائرة شؤون مجلس الوزراء'),
    (3, N'ممثل وزارة النفط', N'user_oil', N'rep.oil@cabinet.gov.iq', N'User#2026!SecureHash', N'مستخدم', 2, N'معاون مدير عام - وزارة النفط'),
    (4, N'ممثل وزارة الخارجية', N'user_fa', N'rep.fa@cabinet.gov.iq', N'User#2026!SecureHash', N'مستخدم', 3, N'مستشار قانوني - وزارة الخارجية');
    SET IDENTITY_INSERT dbo.ApplicationUsers OFF;
END
GO

-- 5. إضافة أنواع الوثائق
IF NOT EXISTS (SELECT 1 FROM dbo.DocumentTypes)
BEGIN
    SET IDENTITY_INSERT dbo.DocumentTypes ON;
    INSERT INTO dbo.DocumentTypes (DocumentTypeId, Code, Name, Description)
    VALUES 
    (1, N'AGENDA', N'جدول أعمال الجلسة', N'الجدول الرسمي لأعمال الجلسة الوزارية'),
    (2, N'DECISIONS', N'قرارات مجلس الوزراء', N'القرارات الصادرة والمصادق عليها رسمياً'),
    (3, N'DIRECTIVES', N'توجيهات دولة رئيس الوزراء', N'التوجيهات المباشرة والأوامر'),
    (4, N'SUMMARY_MINUTES', N'ملخص محضر الجلسة', N'إيجاز التداولات والمناقشات'),
    (5, N'APPENDIX_AGENDA', N'ملحق جدول الأعمال', N'الموضوعات المضافة بصورة طارئة للجلسة'),
    (6, N'FULL_MINUTES', N'محضر الجلسة الكامل', N'المحضر النصي الشامل لاجتماع المجلس');
    SET IDENTITY_INSERT dbo.DocumentTypes OFF;
END
GO

-- 6. إضافة التبويبات الأساسية والفرعية
IF NOT EXISTS (SELECT 1 FROM dbo.MainCategories)
BEGIN
    SET IDENTITY_INSERT dbo.MainCategories ON;
    INSERT INTO dbo.MainCategories (MainCategoryId, Code, Name)
    VALUES 
    (1, N'ECONOMY', N'الشؤون الاقتصادية والمالية والاستثمار'),
    (2, N'ENERGY', N'قطاع الطاقة والنفط والكهرباء'),
    (3, N'SERVICES', N'الإعمار والخدمات والبنى التحتية'),
    (4, N'ADMIN', N'الشؤون الإدارية والقانونية والتشريعات');
    SET IDENTITY_INSERT dbo.MainCategories OFF;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories)
BEGIN
    SET IDENTITY_INSERT dbo.SubCategories ON;
    INSERT INTO dbo.SubCategories (SubCategoryId, MainCategoryId, Code, Name)
    VALUES 
    (1, 1, N'ECON_INVEST', N'مشاريع الاستثمار والتعاقدات الكبرى'),
    (2, 1, N'ECON_BUDGET', N'الموازنة العامة وتخصيصات الطوارئ'),
    (3, 2, N'NRG_SOLAR', N'الطاقة المتجددة ومحطات الطاقة الشمسية'),
    (4, 2, N'NRG_GAS', N'استثمار الغاز المصاحب والغاز الحر'),
    (5, 3, N'SRV_WATER', N'مشاريع المياه والصرف الصحي والمستشفيات'),
    (6, 4, N'ADM_LAW', N'مشاريع القوانين والأنظمة والتعليمات');
    SET IDENTITY_INSERT dbo.SubCategories OFF;
END
GO

PRINT N'=========================================================================';
PRINT N'اكتمل تجهيز قاعدة بيانات SQL Server 2022 وتثبيت كافة الجداول والبيانات بنجاح!';
PRINT N'Database: CabinetAgendaDB_2022 (Compatibility Level: 160)';
PRINT N'=========================================================================';
GO
`;

export const README_CONTENT = `# منظومة إدارة وأرشفة أجندة مجلس الوزراء
## دليل التشغيل على Visual Studio 2026 وقاعدة بيانات SQL Server 2022

---

### 1. المتطلبات الأساسية (Prerequisites)
1. **بيئة التطوير:** Microsoft Visual Studio 2026 (أو الإصدار 17.10+ / 18.0) مع تثبيت حزمة **ASP.NET and web development**.
2. **محرك قاعدة البيانات:** Microsoft SQL Server 2022 (Developer Edition / Enterprise / Express) أو Azure SQL Database.
3. **أداة إدارة قواعد البيانات:** SQL Server Management Studio 20 (SSMS) أو Azure Data Studio.
4. **حزمة .NET:** .NET 9.0 SDK (أو .NET 8.0 LTS).

---

### 2. خطوات تجهيز قاعدة بيانات SQL Server 2022
1. افتح **SQL Server Management Studio (SSMS 20)**.
2. اتصل بسيرفرك المحلي (e.g. \`localhost\` أو \`.\\SQLEXPRESS\` أو \`(localdb)\\mssqllocaldb\`).
3. افتح ملف السكربت المرفق:
   \`Database/CabinetAgendaDB_SQLServer2022.sql\`
4. اضغط **Execute (F5)** لتنفيذ السكربت كاملاً.
5. سيقوم السكربت بـ:
   - إنشاء قاعدة بيانات \`CabinetAgendaDB_2022\` بمستوى توافق **160** وترميز **Arabic_100_CI_AI_SC_UTF8**.
   - إنشاء كافة الجداول الـ 14 المرتبطة.
   - إنشاء المفاتيح الأجنبية والقيود والفهارس المتقدمة.
   - إنشاء الإجراءات المخزونة والعروض الرسمية (Views).
   - إدراج كافة البيانات التأسيسية للدوائر والوزارات والمستخدمين وأنواع الوثائق.

---

### 3. فتح المشروع وتشغيله في Visual Studio 2026
1. افتح ملف الحل:
   \`CabinetAgendaSystem.sln\`
2. تأكد من تطابق سلسلة الاتصال في ملف \`appsettings.json\`:
   \`\`\`json
   "ConnectionStrings": {
     "CabinetAgendaConnection": "Server=localhost;Database=CabinetAgendaDB_2022;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
   }
   \`\`\`
3. في Visual Studio 2026، اضغط **Build Solution (Ctrl + Shift + B)** للتأكد من نجاح التحويل البرمجي.
4. اضغط **Start Debugging (F5)** أو **Start Without Debugging (Ctrl + F5)**.
5. سيفتح الموقع تلقائياً في المتصفح.

---

### 4. بيانات تسجيل الدخول الافتراضية
- **مدير النظام (Admin):**
  - اسم المستخدم: \`admin\`
  - كلمة المرور: \`Admin#2026!SecureHash\` (أو تسجيل الدخول السريع)
- **مدير الأجندة:**
  - اسم المستخدم: \`agenda_mgr\`
- **ممثلو الوزارات:**
  - ممثل وزارة النفط: \`user_oil\`
  - ممثل وزارة الخارجية: \`user_fa\`

---
تم إنشاؤه بواسطة حزمة الأرشفة والتحول الرقمي - الأمانة العامة لمجلس الوزراء 2026.
`;

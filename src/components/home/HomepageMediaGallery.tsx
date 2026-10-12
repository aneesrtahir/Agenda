import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Image,
  Video,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileCode,
  Download,
  Eye,
  SlidersHorizontal,
  Play,
  Maximize2,
  X,
  Calendar,
  UserCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { HomepageFeaturedFile, HomepageFileType } from '../../types';

export const HomepageMediaGallery: React.FC = () => {
  const { homepageFiles, canManageSystem, setCurrentTab, showToast } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | HomepageFileType>('all');
  const [previewFile, setPreviewFile] = useState<HomepageFeaturedFile | null>(null);

  // Visible files (only visible files for regular users, all for admin with a hidden tag)
  const filesToDisplay = homepageFiles.filter(f => {
    if (!canManageSystem && !f.isVisible) return false;
    if (activeFilter === 'all') return true;
    return f.fileType === activeFilter;
  });

  const getFileBadge = (type: HomepageFileType) => {
    switch (type) {
      case 'image':
        return { label: 'صورة رسمية', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', icon: Image };
      case 'video':
        return { label: 'فيديو توثيقي', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', icon: Video };
      case 'word':
        return { label: 'مستند وورد Word', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', icon: FileText };
      case 'excel':
        return { label: 'جدول اكسل Excel', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', icon: FileSpreadsheet };
      case 'powerpoint':
        return { label: 'عرض PowerPoint', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', icon: Presentation };
      case 'pdf':
      default:
        return { label: 'وثيقة PDF', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300', icon: FileCode };
    }
  };

  const handleDownload = (file: HomepageFeaturedFile) => {
    showToast(`جاري تنزيل الملف: ${file.fileName} (${file.fileSize}) من الحاوية الرئيسية للخادم...`, 'success');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5" dir="rtl">
      
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 dark:bg-amber-950/80 text-amber-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              الملفات والوسائط الرسمية للأمانة العامة (الصفحة الرئيسية)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            مستندات Word، جداول Excel، عروض PowerPoint، وثائق PDF، الصور، ومقاطع الفيديو التوثيقية المعتمدة
          </p>
        </div>

        {canManageSystem && (
          <button
            onClick={() => setCurrentTab('admin-settings')}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            title="التحكم بالملفات من لوحة إعدادات النظام"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>إدارة الوسائط والملفات (Admin)</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'كافة الملفات' },
          { id: 'image', label: 'الصور الفوتوغرافية' },
          { id: 'word', label: 'مستندات Word' },
          { id: 'excel', label: 'جداول Excel' },
          { id: 'powerpoint', label: 'عروض PowerPoint' },
          { id: 'pdf', label: 'وثائق PDF' },
          { id: 'video', label: 'مقاطع الفيديو' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeFilter === tab.id
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filesToDisplay.map((file) => {
          const badge = getFileBadge(file.fileType);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={file.id}
              className={`group bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between ${
                !file.isVisible ? 'border-dashed border-rose-300 dark:border-rose-900/60' : ''
              }`}
            >
              {/* Media Card Top Thumbnail or Banner */}
              <div className="relative h-32 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {file.fileType === 'image' && (
                  <img
                    src={file.fileUrl || '/src/assets/images/cabinet_seal_emblem_1791711513364.jpg'}
                    alt={file.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {file.fileType === 'video' && (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white relative">
                    <div className="w-12 h-12 rounded-full bg-purple-600/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </div>
                    {file.videoDuration && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">
                        {file.videoDuration}
                      </span>
                    )}
                  </div>
                )}

                {['word', 'excel', 'powerpoint', 'pdf'].includes(file.fileType) && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    <BadgeIcon className="w-10 h-10 opacity-70 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-[11px] text-slate-500 truncate max-w-full">
                      {file.fileName}
                    </span>
                  </div>
                )}

                {/* Badge Tag */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${badge.color}`}>
                    <BadgeIcon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {!file.isVisible && (
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                      مخفي
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {file.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {file.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{file.fileSize}</span>
                  <span>{file.uploadedAt}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setPreviewFile(file)}
                  className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>معاينة المحتوى</span>
                </button>

                <button
                  onClick={() => handleDownload(file)}
                  className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                  title="تنزيل الملف"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filesToDisplay.length === 0 && (
        <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          لا توجد ملفات متطابقة مع التصنيف المحدد حالياً.
        </div>
      )}

      {/* Preview Modal for All Media Types */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-right" dir="rtl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg">
                  {getFileBadge(previewFile.fileType).icon({ className: 'w-4 h-4' })}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {previewFile.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{previewFile.fileName}</span>
                    <span>·</span>
                    <span>{previewFile.fileSize}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Viewer */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-950/50 min-h-[300px]">
              
              {/* Image Preview */}
              {previewFile.fileType === 'image' && (
                <div className="w-full max-h-[60vh] flex items-center justify-center rounded-xl overflow-hidden shadow-md bg-black">
                  <img
                    src={previewFile.fileUrl || '/src/assets/images/cabinet_seal_emblem_1791711513364.jpg'}
                    alt={previewFile.title}
                    className="max-h-[60vh] max-w-full object-contain"
                  />
                </div>
              )}

              {/* Video Player */}
              {previewFile.fileType === 'video' && (
                <div className="w-full max-w-2xl bg-black rounded-xl overflow-hidden shadow-lg p-8 text-center text-white space-y-4">
                  <div className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center mx-auto shadow-md">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                  <div>
                    <div className="font-bold text-base">مشغل الإيجاز الإعلامي المعتمد</div>
                    <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                      تسجيل مرئي رقمي بدقة 1080p موثق من قبل المكتب الإعلامي لرئاسة الوزراء
                    </p>
                  </div>
                  <div className="inline-block px-3 py-1 bg-white/20 rounded-full font-mono text-xs">
                    مدة التسجيل: {previewFile.videoDuration || '04:35 دقيقة'}
                  </div>
                </div>
              )}

              {/* Word, Excel, PPT, PDF Document Viewer Simulation */}
              {['word', 'excel', 'powerpoint', 'pdf'].includes(previewFile.fileType) && (
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-md text-right space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        مستند رسمي محمي بحاوية الخادم (Server Vault)
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">SHA-256 Verified</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {previewFile.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {previewFile.description}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>اسم الملف:</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-200">{previewFile.fileName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>الحجم:</span>
                      <span className="font-mono">{previewFile.fileSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تاريخ الإيداع:</span>
                      <span className="font-mono">{previewFile.uploadedAt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>المسؤول المعتمد:</span>
                      <span className="text-slate-700 dark:text-slate-300">{previewFile.uploadedByUserName}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                الحاوية: /var/cabinet_archive/secure_uploads/vault
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل نسخة من الملف</span>
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

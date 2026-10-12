import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Download,
  Eye,
  BookOpen,
  FolderDown,
  X,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { FooterPublicFile } from '../../types';

export const FooterFilesSection: React.FC = () => {
  const { footerFiles, canManageSystem, setCurrentTab, showToast } = useApp();
  const [selectedFile, setSelectedFile] = useState<FooterPublicFile | null>(null);

  const visibleFiles = footerFiles.filter(f => f.isVisible);

  if (visibleFiles.length === 0 && !canManageSystem) return null;

  const handleDownload = (file: FooterPublicFile) => {
    showToast(`جاري تنزيل الملف العام: ${file.fileName} (${file.fileSize})...`, 'success');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'word':
        return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <FileCode className="w-4 h-4 text-rose-600 shrink-0" />;
    }
  };

  return (
    <div className="w-full mt-10 pt-6 border-t border-slate-200 dark:border-slate-800" dir="rtl">
      <div className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <FolderDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                مكتبة الوثائق والأدلة الإرشادية العامة (متاحة للجميع والزائرين)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                لوائح تنظيمية، أدلة استخدام المنظومة، واستمارات رفع المذكرات المعتمدة للتحميل المباشر
              </p>
            </div>
          </div>

          {canManageSystem && (
            <button
              onClick={() => setCurrentTab('admin-settings')}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>إدارة ملفات الفوتر من إعدادات النظام</span>
            </button>
          )}
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {visibleFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(file.fileType)}
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {file.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{file.fileSize}</span>
                </div>

                <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                  {file.title}
                </h5>

                {file.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {file.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1 text-[11px]">
                <button
                  onClick={() => setSelectedFile(file)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3 text-emerald-600" />
                  <span>معاينة</span>
                </button>

                <button
                  onClick={() => handleDownload(file)}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-medium flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>تنزيل</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Preview Modal for Footer Document */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {getIcon(selectedFile.fileType)}
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedFile.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">التصنيف:</span>
                  <strong>{selectedFile.category}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">اسم الملف:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedFile.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الحجم:</span>
                  <span className="font-mono">{selectedFile.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تاريخ الإيداع العام:</span>
                  <span className="font-mono">{selectedFile.addedAt}</span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedFile.description}
              </p>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>هذا الملف متاح مجاناً للعموم ولجميع الدوائر الحكومية والزائرين.</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleDownload(selectedFile)}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل الملف الآن</span>
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

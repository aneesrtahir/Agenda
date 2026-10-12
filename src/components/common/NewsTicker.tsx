import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  AlertCircle,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileCheck2,
  Eye,
  EyeOff
} from 'lucide-react';
import { NewsTickerItem, NewsTickerType } from '../../types';

export const NewsTicker: React.FC = () => {
  const {
    newsTickerItems,
    activeNewsTickerItems,
    addNewsTickerItem,
    updateNewsTickerItem,
    deleteNewsTickerItem,
    toggleNewsTickerVisibility,
    canManageSystem,
    setCurrentTab
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedNewsForDetail, setSelectedNewsForDetail] = useState<NewsTickerItem | null>(null);

  // Form states for Admin to add/edit
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: NewsTickerType;
    priority: 'high' | 'normal';
    isActive: boolean;
    linkTab?: string;
  }>({
    title: '',
    content: '',
    type: 'توجيه وزاري',
    priority: 'high',
    isActive: true,
    linkTab: 'decisions'
  });

  // Cycle news items automatically every 6 seconds when not paused
  useEffect(() => {
    if (activeNewsTickerItems.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeNewsTickerItems.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [activeNewsTickerItems.length, isPaused]);

  if (activeNewsTickerItems.length === 0 && !canManageSystem) {
    return null;
  }

  const currentNews = activeNewsTickerItems[currentIndex] || activeNewsTickerItems[0];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeNewsTickerItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeNewsTickerItems.length) % activeNewsTickerItems.length);
  };

  const getTypeStyle = (type: NewsTickerType) => {
    switch (type) {
      case 'عاجل':
        return 'bg-rose-600 text-white animate-pulse';
      case 'توجيه وزاري':
        return 'bg-amber-600 text-white';
      case 'إعلان رسمي':
        return 'bg-emerald-700 text-white';
      case 'هام':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const openAddForm = () => {
    setEditingItemId(null);
    setFormData({
      title: '',
      content: '',
      type: 'توجيه وزاري',
      priority: 'high',
      isActive: true,
      linkTab: 'decisions'
    });
    setIsManageModalOpen(true);
  };

  const openEditForm = (item: NewsTickerItem) => {
    setEditingItemId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      priority: item.priority,
      isActive: item.isActive,
      linkTab: item.linkTab
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingItemId) {
      updateNewsTickerItem(editingItemId, formData);
      setEditingItemId(null);
    } else {
      addNewsTickerItem(formData);
    }

    setFormData({
      title: '',
      content: '',
      type: 'توجيه وزاري',
      priority: 'high',
      isActive: true,
      linkTab: 'decisions'
    });
  };

  return (
    <>
      {/* Visual Ticker Bar */}
      <aside
        className="w-full bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm relative z-30 transition-colors"
        dir="rtl"
        aria-label="شريط الأخبار والتوجيهات العاجلة"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 text-xs">
          
          {/* Ticker Lead Tag */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px] uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">أخبار وتوجيهات الأمانة العامة</span>
              <span className="sm:hidden">أخبار</span>
            </span>

            {currentNews && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getTypeStyle(currentNews.type)}`}>
                {currentNews.type}
              </span>
            )}
          </div>

          {/* Marquee / Headline Area */}
          <div className="flex-1 min-w-0 flex items-center overflow-hidden">
            {currentNews ? (
              <div
                onClick={() => setSelectedNewsForDetail(currentNews)}
                className="cursor-pointer group flex items-center gap-2 truncate hover:text-amber-300 transition-colors"
                title="اضغط لقراءة تفاصيل البيان أو التوجيه"
              >
                <span className="font-bold text-white group-hover:text-amber-300 shrink-0">
                  [{currentNews.title}]
                </span>
                <span className="text-slate-300 truncate">
                  {currentNews.content}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 text-xs italic">
                لا توجد بيانات أو أخبار منشورة حالياً في الشريط.
              </span>
            )}
          </div>

          {/* Controls: Prev/Next, Play/Pause, and Admin Manage button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {activeNewsTickerItems.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-800/80 rounded-md p-0.5 border border-slate-700/60">
                <button
                  onClick={handlePrev}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="الخبر السابق"
                  aria-label="الخبر السابق"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title={isPaused ? 'استئناف الحركة' : 'إيقاف الحركة مؤقتاً'}
                  aria-label={isPaused ? 'استئناف الحركة' : 'إيقاف الحركة مؤقتاً'}
                >
                  {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="الخبر التالي"
                  aria-label="الخبر التالي"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Admin ONLY Control Button */}
            {canManageSystem && (
              <button
                onClick={() => setIsManageModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md font-semibold text-[11px] shadow-xs transition-colors"
                title="إدارة ونشر أخبار الشريط المتحرك (صلاحية Admin حصراً)"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span className="hidden sm:inline">إدارة الشريط</span>
              </button>
            )}
          </div>

        </div>
      </aside>

      {/* Detail Modal when clicking a news item */}
      {selectedNewsForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getTypeStyle(selectedNewsForDetail.type)}`}>
                  {selectedNewsForDetail.type}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedNewsForDetail.createdAt}
                </span>
              </div>
              <button
                onClick={() => setSelectedNewsForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedNewsForDetail.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedNewsForDetail.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>الناشر: {selectedNewsForDetail.createdByUserName}</span>
              {selectedNewsForDetail.linkTab && (
                <button
                  onClick={() => {
                    setCurrentTab(selectedNewsForDetail.linkTab!);
                    setSelectedNewsForDetail(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>الانتقال للقسم المعني</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin News Management Modal */}
      {isManageModalOpen && canManageSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-right" dir="rtl">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    لوحة تحكم شريط الأخبار المتحرك (Admin حصراً)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    نشر، تعديل، إخفاء، وحذف البيانات الإخبارية والتوجيهات العاجلة المعروضة في الشريط
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Form to Add / Edit */}
              <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {editingItemId ? <Edit2 className="w-3.5 h-3.5 text-amber-500" /> : <Plus className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{editingItemId ? 'تعديل بيانات الخبر' : 'نشر خبر / توجيه جديد في الشريط'}</span>
                  </span>
                  {editingItemId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItemId(null);
                        setFormData({
                          title: '',
                          content: '',
                          type: 'توجيه وزاري',
                          priority: 'high',
                          isActive: true,
                          linkTab: 'decisions'
                        });
                      }}
                      className="text-[11px] text-slate-500 hover:text-rose-600"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      عنوان الخبر / التوجيه *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="مثال: توجيه دولة رئيس مجلس الوزراء"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      نوع الخبر / التصنيف *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as NewsTickerType }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    >
                      <option value="توجيه وزاري">توجيه وزاري</option>
                      <option value="عاجل">عاجل</option>
                      <option value="إعلان رسمي">إعلان رسمي</option>
                      <option value="هام">هام</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    نص الخبر / البيان التفصيلي *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="نص الخبر الذي سيمر في الشريط المتحرك..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      الربط بصفحة معينة (اختياري)
                    </label>
                    <select
                      value={formData.linkTab || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkTab: e.target.value || undefined }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    >
                      <option value="">دون ربط</option>
                      <option value="decisions">سجل القرارات والتوجيهات</option>
                      <option value="sessions">إدارة الأجندة والجلسات</option>
                      <option value="incoming">المخاطبات والقرارات الواردة</option>
                      <option value="dispatches">المراسلات والوثائق المتبادلة</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4 sm:pt-0 sm:self-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">مفعل ومعروض بالشريط</span>
                    </label>

                    <button
                      type="submit"
                      className="mr-auto px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingItemId ? 'حفظ التعديل' : 'نشر في الشريط'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Existing Ticker Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    قائمة الأخبار والتوجيهات المنشورة ({newsTickerItems.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    المفعلة: {activeNewsTickerItems.length}
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {newsTickerItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        !item.isActive ? 'opacity-60 bg-slate-50 dark:bg-slate-900/60' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getTypeStyle(item.type)}`}>
                            {item.type}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {item.title}
                          </span>
                          {!item.isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              مخفي
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                          {item.content}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span>نُشر: {item.createdAt}</span>
                          <span>·</span>
                          <span>بواسطة: {item.createdByUserName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => toggleNewsTickerVisibility(item.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title={item.isActive ? 'إخفاء من الشريط' : 'إظهار في الشريط'}
                        >
                          {item.isActive ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 transition-colors"
                          title="تعديل الخبر"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNewsTickerItem(item.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 transition-colors"
                          title="حذف نهائي"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

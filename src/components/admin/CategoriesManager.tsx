import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, Plus, Edit2, Trash2, FolderPlus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { MainCategory, SubCategory } from '../../types';

export const CategoriesManager: React.FC = () => {
  const {
    mainCategories,
    subCategories,
    decisions,
    addMainCategory,
    updateMainCategory,
    deleteMainCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    canManageAgenda
  } = useApp();

  // Main Cat Modal
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [mainToEdit, setMainToEdit] = useState<MainCategory | null>(null);
  const [mainCode, setMainCode] = useState('');
  const [mainName, setMainName] = useState('');
  const [mainDesc, setMainDesc] = useState('');

  // Sub Cat Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subToEdit, setSubToEdit] = useState<SubCategory | null>(null);
  const [subMainId, setSubMainId] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');

  const openAddMain = () => {
    setMainToEdit(null);
    setMainCode(`CAT-${Math.floor(Math.random() * 900) + 100}`);
    setMainName('');
    setMainDesc('');
    setIsMainModalOpen(true);
  };

  const openEditMain = (mc: MainCategory) => {
    setMainToEdit(mc);
    setMainCode(mc.code);
    setMainName(mc.name);
    setMainDesc(mc.description);
    setIsMainModalOpen(true);
  };

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { code: mainCode, name: mainName, description: mainDesc };
    if (mainToEdit) {
      updateMainCategory(mainToEdit.id, payload);
    } else {
      addMainCategory(payload);
    }
    setIsMainModalOpen(false);
  };

  const openAddSub = (defaultMainId?: string) => {
    setSubToEdit(null);
    setSubMainId(defaultMainId || mainCategories[0]?.id || '');
    setSubCode(`SUB-${Math.floor(Math.random() * 900) + 100}`);
    setSubName('');
    setSubDesc('');
    setIsSubModalOpen(true);
  };

  const openEditSub = (sc: SubCategory) => {
    setSubToEdit(sc);
    setSubMainId(sc.mainCategoryId);
    setSubCode(sc.code);
    setSubName(sc.name);
    setSubDesc(sc.description);
    setIsSubModalOpen(true);
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      mainCategoryId: subMainId,
      code: subCode,
      name: subName,
      description: subDesc
    };
    if (subToEdit) {
      updateSubCategory(subToEdit.id, payload);
    } else {
      addSubCategory(payload);
    }
    setIsSubModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            إدارة التبويبات الأساسية والفرعية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            تصنيف القرارات والوثائق حسب القطاعات والمجالات الوزارية المعتمدة
          </p>
        </div>

        {canManageAgenda && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddSub()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تبويب فرعي</span>
            </button>
            <button
              onClick={openAddMain}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تبويب أساسي</span>
            </button>
          </div>
        )}
      </div>

      {/* Categories Hierarchy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mainCategories.map((mainCat) => {
          const subs = subCategories.filter(sc => sc.mainCategoryId === mainCat.id);
          const relatedDecisionsCount = decisions.filter(d => d.mainCategoryId === mainCat.id).length;

          return (
            <div
              key={mainCat.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {mainCat.name}
                    </h3>
                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                      {mainCat.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {relatedDecisionsCount} قرار مصنف ضمن هذا التبويب
                  </div>
                </div>

                {canManageAgenda && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditMain(mainCat)}
                      className="p-1 hover:text-blue-600 text-slate-400"
                      title="تعديل التبويب الأساسي"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف التبويب (${mainCat.name}) مع كافة تبويباته الفرعية؟`)) {
                          deleteMainCategory(mainCat.id);
                        }
                      }}
                      className="p-1 hover:text-rose-600 text-slate-400"
                      title="حذف التبويب الأساسي"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {mainCat.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {mainCat.description}
                </p>
              )}

              {/* Sub Categories list */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>التبويبات الفرعية ({subs.length})</span>
                  {canManageAgenda && (
                    <button
                      onClick={() => openAddSub(mainCat.id)}
                      className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة فرعي</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {sub.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 mr-2">
                          ({sub.code})
                        </span>
                      </div>

                      {canManageAgenda && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditSub(sub)}
                            className="p-1 hover:text-blue-600 text-slate-400"
                            title="تعديل"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف التبويب الفرعي (${sub.name})؟`)) {
                                deleteSubCategory(sub.id);
                              }
                            }}
                            className="p-1 hover:text-rose-600 text-slate-400"
                            title="حذف"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {subs.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      لا توجد تبويبات فرعية مضافة بعد.
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Main Category Modal */}
      <Modal
        isOpen={isMainModalOpen}
        onClose={() => setIsMainModalOpen(false)}
        title={mainToEdit ? 'تعديل التبويب الأساسي' : 'إضافة تبويب أساسي جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleMainSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              اسم التبويب الأساسي *
            </label>
            <input
              type="text"
              value={mainName}
              onChange={(e) => setMainName(e.target.value)}
              placeholder="مثال: الشؤون الاقتصادية والمالية"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              رمز التبويب (كود التصنيف) *
            </label>
            <input
              type="text"
              value={mainCode}
              onChange={(e) => setMainCode(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              وصف التبويب
            </label>
            <textarea
              rows={2}
              value={mainDesc}
              onChange={(e) => setMainDesc(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsMainModalOpen(false)}
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

      {/* Sub Category Modal */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title={subToEdit ? 'تعديل التبويب الفرعي' : 'إضافة تبويب فرعي جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSubSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              التبويب الأساسي التابع له *
            </label>
            <select
              value={subMainId}
              onChange={(e) => setSubMainId(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {mainCategories.map(mc => (
                <option key={mc.id} value={mc.id}>{mc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              اسم التبويب الفرعي *
            </label>
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="مثال: الاستثمار وتسهيلات المشاريع"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              رمز التبويب الفرعي *
            </label>
            <input
              type="text"
              value={subCode}
              onChange={(e) => setSubCode(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              الوصف
            </label>
            <textarea
              rows={2}
              value={subDesc}
              onChange={(e) => setSubDesc(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSubModalOpen(false)}
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

    </div>
  );
};

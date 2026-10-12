import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Plus, Edit2, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';
import { DocumentType } from '../../types';

export const DocumentTypesManager: React.FC = () => {
  const {
    documentTypes,
    documents,
    decisions,
    addDocumentType,
    updateDocumentType,
    deleteDocumentType,
    canManageAgenda
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<DocumentType | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openAdd = () => {
    setTypeToEdit(null);
    setCode(`DOC_TYPE_${Math.floor(Math.random() * 900) + 100}`);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEdit = (dt: DocumentType) => {
    setTypeToEdit(dt);
    setCode(dt.code);
    setName(dt.name);
    setDescription(dt.description);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code,
      name,
      description,
      isSystem: typeToEdit ? typeToEdit.isSystem : false
    };

    if (typeToEdit) {
      updateDocumentType(typeToEdit.id, payload);
    } else {
      addDocumentType(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            إدارة أنواع الوثائق المعتمدة في الأجندة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            تصنيفات الوثائق الرسمية: جداول أعمال، محاضر، قرارات، توجيهات، ملحقات ومذكرات
          </p>
        </div>

        {canManageAgenda && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة نوع وثيقة جديد</span>
          </button>
        )}
      </div>

      {/* Grid of Document Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes.map((dt) => {
          let count = 0;
          if (dt.code === 'DECISION') {
            count = decisions.length;
          } else {
            count = documents.filter(d => d.documentTypeId === dt.id).length;
          }

          return (
            <div
              key={dt.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {dt.name}
                    </h3>
                  </div>

                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                    {dt.code}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed min-h-[36px]">
                  {dt.description || 'لا يوجد وصف مدخل لهذا النوع.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono tabular-nums">
                  {count} وثيقة مسجلة
                </span>

                <div className="flex items-center gap-1">
                  {canManageAgenda && (
                    <>
                      <button
                        onClick={() => openEdit(dt)}
                        className="p-1 hover:text-blue-600 text-slate-400"
                        title="تعديل نوع الوثيقة"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!dt.isSystem && (
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف نوع الوثيقة (${dt.name})؟`)) {
                              deleteDocumentType(dt.id);
                            }
                          }}
                          className="p-1 hover:text-rose-600 text-slate-400"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                  {dt.isSystem && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5" title="نوع قياسي محمي">
                      <Shield className="w-3 h-3 text-slate-400" />
                      <span>أساسي</span>
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={typeToEdit ? 'تعديل نوع الوثيقة' : 'إضافة نوع وثيقة جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              اسم نوع الوثيقة *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: توصيات اللجان الفرعية"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              كود النوع (Code) *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              الوصف والغرض التوثيقي
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح ماهية هذه الوثائق وكيفية تداولها بالأمانة العامة..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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

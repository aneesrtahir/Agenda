import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Landmark, Calendar, Plus, Edit2, Trash2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Government, Year } from '../../types';

export const GovernmentsManager: React.FC = () => {
  const {
    governments,
    years,
    sessions,
    addGovernment,
    updateGovernment,
    deleteGovernment,
    toggleGovernmentVisibility,
    addYear,
    updateYear,
    deleteYear,
    toggleYearVisibility,
    canManageAgenda
  } = useApp();

  // Government Modal
  const [isGovModalOpen, setIsGovModalOpen] = useState(false);
  const [govToEdit, setGovToEdit] = useState<Government | null>(null);
  const [govName, setGovName] = useState('');
  const [govPm, setGovPm] = useState('');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [govDesc, setGovDesc] = useState('');

  // Year Modal
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [yearToEdit, setYearToEdit] = useState<Year | null>(null);
  const [yearGovId, setYearGovId] = useState('');
  const [yearNum, setYearNum] = useState<number>(new Date().getFullYear());
  const [yearNotes, setYearNotes] = useState('');

  const openAddGov = () => {
    setGovToEdit(null);
    setGovName('');
    setGovPm('دولة رئيس مجلس الوزراء');
    setStartYear(new Date().getFullYear());
    setEndYear('');
    setIsActive(true);
    setGovDesc('');
    setIsGovModalOpen(true);
  };

  const openEditGov = (g: Government) => {
    setGovToEdit(g);
    setGovName(g.name);
    setGovPm(g.primeMinister);
    setStartYear(g.startYear);
    setEndYear(g.endYear ? String(g.endYear) : '');
    setIsActive(g.isActive);
    setGovDesc(g.description);
    setIsGovModalOpen(true);
  };

  const handleGovSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: govName,
      primeMinister: govPm,
      startYear,
      endYear: endYear ? parseInt(endYear) : undefined,
      isActive,
      isHidden: false,
      description: govDesc,
      orderIndex: governments.length + 1
    };

    if (govToEdit) {
      updateGovernment(govToEdit.id, payload);
    } else {
      addGovernment(payload);
    }
    setIsGovModalOpen(false);
  };

  const openAddYear = (defaultGovId?: string) => {
    setYearToEdit(null);
    setYearGovId(defaultGovId || governments[0]?.id || '');
    setYearNum(new Date().getFullYear());
    setYearNotes('');
    setIsYearModalOpen(true);
  };

  const openEditYear = (y: Year) => {
    setYearToEdit(y);
    setYearGovId(y.governmentId);
    setYearNum(y.yearNumber);
    setYearNotes(y.notes || '');
    setIsYearModalOpen(true);
  };

  const handleYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      governmentId: yearGovId,
      yearNumber: yearNum,
      isHidden: false,
      notes: yearNotes
    };

    if (yearToEdit) {
      updateYear(yearToEdit.id, payload);
    } else {
      addYear(payload);
    }
    setIsYearModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            إدارة الحكومات والسنوات الدستورية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            إضافة وتعديل وحذف وإخفاء وإظهار الحكومات وسنوات أعمالها
          </p>
        </div>

        {canManageAgenda && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddYear()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سنة</span>
            </button>
            <button
              onClick={openAddGov}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حكومة جديدة</span>
            </button>
          </div>
        )}
      </div>

      {/* Governments & Years Grid */}
      <div className="space-y-6">
        {governments.map((gov) => {
          const govYears = years.filter(y => y.governmentId === gov.id);
          const govSessions = sessions.filter(s => s.governmentId === gov.id);

          return (
            <div
              key={gov.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {gov.name}
                      </h3>
                      {gov.isActive && (
                        <span className="text-[11px] px-2 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                          الحكومة الحالية
                        </span>
                      )}
                      {gov.isHidden && (
                        <span className="text-[11px] px-2 py-0.5 rounded-sm bg-rose-100 dark:bg-rose-950 text-rose-700">
                          مخفية
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span>رئيس الوزراء: {gov.primeMinister}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono">الفترة: {gov.startYear} - {gov.endYear || 'مستمرة'}</span>
                    </div>
                  </div>
                </div>

                {/* Gov Action Buttons */}
                {canManageAgenda && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditGov(gov)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="تعديل الحكومة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleGovernmentVisibility(gov.id)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title={gov.isHidden ? 'إظهار الحكومة' : 'إخفاء الحكومة'}
                    >
                      {gov.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف ${gov.name}؟`)) {
                          deleteGovernment(gov.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors"
                      title="حذف الحكومة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {gov.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {gov.description}
                </p>
              )}

              {/* Years under this Government */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    السنوات التابعة لهذه الحكومة ({govYears.length})
                  </span>
                  {canManageAgenda && (
                    <button
                      onClick={() => openAddYear(gov.id)}
                      className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة سنة</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {govYears.map((yr) => {
                    const yrSessions = sessions.filter(s => s.yearId === yr.id);

                    return (
                      <div
                        key={yr.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                            سنة {yr.yearNumber}
                          </span>
                          {yr.isHidden && (
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1 py-0.2 rounded text-slate-600">
                              مخفية
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500">
                          {yrSessions.length} جلسات مسجلة
                        </div>

                        {yr.notes && (
                          <div className="text-[11px] text-slate-400 truncate">
                            {yr.notes}
                          </div>
                        )}

                        {canManageAgenda && (
                          <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                            <button
                              onClick={() => openEditYear(yr)}
                              className="p-1 hover:text-blue-600 text-slate-400"
                              title="تعديل السنة"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => toggleYearVisibility(yr.id)}
                              className="p-1 hover:text-amber-600 text-slate-400"
                              title={yr.isHidden ? 'إظهار السنة' : 'إخفاء السنة'}
                            >
                              {yr.isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف سنة ${yr.yearNumber}؟`)) {
                                  deleteYear(yr.id);
                                }
                              }}
                              className="p-1 hover:text-rose-600 text-slate-400"
                              title="حذف السنة"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Government Modal */}
      <Modal
        isOpen={isGovModalOpen}
        onClose={() => setIsGovModalOpen(false)}
        title={govToEdit ? 'تعديل بيانات الحكومة' : 'إضافة حكومة دستورية جديدة'}
        maxWidth="xl"
      >
        <form onSubmit={handleGovSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              اسم الحكومة *
            </label>
            <input
              type="text"
              value={govName}
              onChange={(e) => setGovName(e.target.value)}
              placeholder="مثال: حكومة دولة رئيس الوزراء (الدورة الحالية)"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              اسم رئيس مجلس الوزراء *
            </label>
            <input
              type="text"
              value={govPm}
              onChange={(e) => setGovPm(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                سنة بداية الدورة *
              </label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value) || 2024)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                سنة انتهاء الدورة (اختياري)
              </label>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="اتركه فارغاً للحكومة المستمرة"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              وصف ونبذة عن الحكومة
            </label>
            <textarea
              rows={2}
              value={govDesc}
              onChange={(e) => setGovDesc(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="govIsActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="govIsActive" className="text-slate-700 dark:text-slate-300 cursor-pointer">
              تعيين كـ "الحكومة الدستورية الحالية والنشطة"
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsGovModalOpen(false)}
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

      {/* Add / Edit Year Modal */}
      <Modal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        title={yearToEdit ? 'تعديل السنة' : 'إضافة سنة جديدة'}
        maxWidth="md"
      >
        <form onSubmit={handleYearSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              الحكومة التابعة لها *
            </label>
            <select
              value={yearGovId}
              onChange={(e) => setYearGovId(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {governments.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              رقم السنة *
            </label>
            <input
              type="number"
              value={yearNum}
              onChange={(e) => setYearNum(parseInt(e.target.value) || 2025)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              ملاحظات عن السنة
            </label>
            <input
              type="text"
              value={yearNotes}
              onChange={(e) => setYearNotes(e.target.value)}
              placeholder="مثال: سنة الموازنة والمشاريع التنموية"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsYearModalOpen(false)}
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

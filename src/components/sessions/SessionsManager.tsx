import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  FileCheck2,
  Clock,
  MapPin,
  User,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronDown,
  Layers,
  ArrowRight,
  Landmark
} from 'lucide-react';
import { CabinetSession, SessionType, CabinetDocument, Decision, Government, Year } from '../../types';
import { AddEditSessionModal } from './AddEditSessionModal';
import { DocumentFormModal } from '../documents/DocumentFormModal';
import { DecisionFormModal } from '../documents/DecisionFormModal';
import { DocumentPreviewModal } from '../documents/DocumentPreviewModal';
import { SessionsCalendar } from './SessionsCalendar';
import { LayoutList, Calendar } from 'lucide-react';
import { Modal } from '../common/Modal';

export const SessionsManager: React.FC = () => {
  const {
    governments,
    years,
    sessions,
    documents,
    decisions,
    documentTypes,
    selectedGovernmentId,
    setSelectedGovernmentId,
    selectedYearId,
    setSelectedYearId,
    selectedSessionId,
    setSelectedSessionId,
    addGovernment,
    updateGovernment,
    deleteGovernment,
    toggleGovernmentVisibility,
    addYear,
    updateYear,
    deleteYear,
    toggleYearVisibility,
    deleteSession,
    toggleSessionVisibility,
    deleteDocument,
    toggleDocumentVisibility,
    deleteDecision,
    toggleDecisionVisibility,
    canManageAgenda,
    canAddDrafts,
    canUserAccessDocument,
    currentUser,
    currentDepartment
  } = useApp();

  // Filter sessions by selected Government, Year, and Type
  const [filterType, setFilterType] = useState<string>('all');
  const [showHiddenSessions, setShowHiddenSessions] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Modals state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<CabinetSession | null>(null);

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<CabinetDocument | null>(null);
  const [activeDocTypeId, setActiveDocTypeId] = useState<string>('dt-agenda');

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionToEdit, setDecisionToEdit] = useState<Decision | null>(null);

  const [previewItem, setPreviewItem] = useState<CabinetDocument | Decision | null>(null);

  // Government Modal State (إدارة وتعديل الحكومات في صفحة الأجندة)
  const [isGovModalOpen, setIsGovModalOpen] = useState(false);
  const [govToEdit, setGovToEdit] = useState<Government | null>(null);
  const [govName, setGovName] = useState('');
  const [govPm, setGovPm] = useState('');
  const [govStartYear, setGovStartYear] = useState<number>(new Date().getFullYear());
  const [govEndYear, setGovEndYear] = useState<string>('');
  const [govIsActive, setGovIsActive] = useState<boolean>(true);
  const [govDesc, setGovDesc] = useState('');

  // Year Modal State (إدارة وتعديل السنوات في صفحة الأجندة)
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [yearToEdit, setYearToEdit] = useState<Year | null>(null);
  const [yearGovId, setYearGovId] = useState('');
  const [yearNum, setYearNum] = useState<number>(new Date().getFullYear());
  const [yearNotes, setYearNotes] = useState('');

  const currentGov = governments.find(g => g.id === selectedGovernmentId);
  const currentYear = years.find(y => y.id === selectedYearId);

  const openAddGov = () => {
    setGovToEdit(null);
    setGovName('');
    setGovPm('دولة رئيس مجلس الوزراء');
    setGovStartYear(new Date().getFullYear());
    setGovEndYear('');
    setGovIsActive(true);
    setGovDesc('');
    setIsGovModalOpen(true);
  };

  const openEditGov = (g: Government) => {
    setGovToEdit(g);
    setGovName(g.name);
    setGovPm(g.primeMinister);
    setGovStartYear(g.startYear);
    setGovEndYear(g.endYear ? String(g.endYear) : '');
    setGovIsActive(g.isActive);
    setGovDesc(g.description || '');
    setIsGovModalOpen(true);
  };

  const handleGovSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: govName,
      primeMinister: govPm,
      startYear: govStartYear,
      endYear: govEndYear ? parseInt(govEndYear) : undefined,
      isActive: govIsActive,
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

  const openAddYear = (govId?: string) => {
    setYearToEdit(null);
    setYearGovId(govId || selectedGovernmentId || governments[0]?.id || '');
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

  // Active session
  const activeSession = sessions.find(s => s.id === selectedSessionId);

  // Filtered session list
  const filteredSessions = sessions.filter(s => {
    if (s.governmentId !== selectedGovernmentId) return false;
    if (s.yearId !== selectedYearId) return false;
    if (filterType !== 'all' && s.sessionType !== filterType) return false;
    if (!showHiddenSessions && s.isHidden) return false;
    return true;
  });

  const availableYears = years.filter(y => y.governmentId === selectedGovernmentId);

  // Documents & decisions in selected session
  const sessionDocs = documents.filter(d => d.sessionId === selectedSessionId);
  const sessionDecs = decisions.filter(d => d.sessionId === selectedSessionId);

  // Document types tab in active session
  const [activeTabCode, setActiveTabCode] = useState<string>('ALL');

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Hierarchy Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              إدارة أجندة وجلسات مجلس الوزراء
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تنظيم الجلسات وتصنيف وثائق الأجندة والمحاضر والقرارات والتوجيهات
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* View Mode Toggle: List vs Calendar */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>قائمة الجلسات</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>التقويم التفاعلي (Calendar)</span>
              </button>
            </div>

            {canManageAgenda && (
              <button
                onClick={() => {
                  setSessionToEdit(null);
                  setIsSessionModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إدراج جلسة جديدة</span>
              </button>
            )}
          </div>
        </div>

        {/* Hierarchy Selectors (Government & Year) with Add / Edit / Delete / Toggle Visibility Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Government Control Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                <span>الحكومة:</span>
                {currentGov?.isHidden && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    مخفية
                  </span>
                )}
              </label>

              {canManageAgenda && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={openAddGov}
                    title="إضافة حكومة جديدة"
                    className="p-1 rounded-md text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  {currentGov && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditGov(currentGov)}
                        title="تعديل الحكومة المحددة"
                        className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleGovernmentVisibility(currentGov.id)}
                        title={currentGov.isHidden ? 'إظهار الحكومة' : 'إخفاء الحكومة'}
                        className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {currentGov.isHidden ? (
                          <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف (${currentGov.name}) وكافة بياناتها؟`)) {
                            deleteGovernment(currentGov.id);
                          }
                        }}
                        title="حذف الحكومة المحددة"
                        className="p-1 rounded-md text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <select
              value={selectedGovernmentId}
              onChange={(e) => {
                setSelectedGovernmentId(e.target.value);
                const nextYears = years.filter(y => y.governmentId === e.target.value);
                if (nextYears[0]) setSelectedYearId(nextYears[0].id);
                setSelectedSessionId(null);
              }}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-semibold text-xs"
            >
              {governments.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.isActive ? '(الحالية)' : ''} {g.isHidden ? '[مخفية]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Year Control Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>السنة:</span>
                {currentYear?.isHidden && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    مخفية
                  </span>
                )}
              </label>

              {canManageAgenda && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openAddYear(selectedGovernmentId)}
                    title="إضافة سنة للحكومة الحالية"
                    className="p-1 rounded-md text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  {currentYear && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditYear(currentYear)}
                        title="تعديل السنة المحددة"
                        className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleYearVisibility(currentYear.id)}
                        title={currentYear.isHidden ? 'إظهار السنة' : 'إخفاء السنة'}
                        className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {currentYear.isHidden ? (
                          <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف سنة (${currentYear.yearNumber})؟`)) {
                            deleteYear(currentYear.id);
                          }
                        }}
                        title="حذف السنة المحددة"
                        className="p-1 rounded-md text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <select
              value={selectedYearId}
              onChange={(e) => {
                setSelectedYearId(e.target.value);
                setSelectedSessionId(null);
              }}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono font-bold text-xs"
            >
              {availableYears.map(y => (
                <option key={y.id} value={y.id}>
                  سنة {y.yearNumber} {y.isHidden ? '[مخفية]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
              نوع الجلسة:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">كافة الأنواع (عادية، طارئة، استثنائية)</option>
              <option value="عادية">عادية</option>
              <option value="طارئة">طارئة</option>
              <option value="استثنائية">استثنائية</option>
            </select>
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={showHiddenSessions}
                onChange={(e) => setShowHiddenSessions(e.target.checked)}
                className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>إظهار الجلسات المخفية</span>
            </label>
          </div>
        </div>
      </div>

      {/* Interactive Calendar Component when calendar view is selected */}
      {viewMode === 'calendar' && (
        <SessionsCalendar
          sessions={filteredSessions}
          selectedSessionId={selectedSessionId}
          onSelectSession={(sessId) => setSelectedSessionId(sessId)}
        />
      )}

      {/* Main View: Left column for Sessions List, Right area for Session Details & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sessions List (4 columns) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              قائمة الجلسات ({filteredSessions.length})
            </span>
            <span className="text-[11px] text-slate-500">
              انقر للاستعراض والإدارة
            </span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              لا توجد جلسات مسجلة مطابقة للاختيار الحالي.
            </div>
          ) : (
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-0.5">
              {filteredSessions.map((session) => {
                const isSelected = selectedSessionId === session.id;
                const sessDocCount = documents.filter(d => d.sessionId === session.id).length;
                const sessDecCount = decisions.filter(d => d.sessionId === session.id).length;

                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          الجلسة رقم ({session.sessionNumber})
                        </span>
                        {session.isHidden && (
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-sm">
                            مخفية
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          session.sessionType === 'طارئة'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : session.sessionType === 'استثنائية'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {session.sessionType}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{session.sessionDate}</span>
                      <span className="mx-1">·</span>
                      <span>{session.status}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {session.notes || 'لا توجد ملاحظات مسجلة لهذه الجلسة.'}
                    </p>

                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                      <div>
                        <span>{sessDocCount} وثائق</span>
                        <span className="mx-1">·</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{sessDecCount} قرارات</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {canManageAgenda && (
                          <>
                            <button
                              onClick={() => {
                                setSessionToEdit(session);
                                setIsSessionModalOpen(true);
                              }}
                              className="p-1 hover:text-emerald-600 text-slate-400 transition-colors"
                              title="تعديل الجلسة"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleSessionVisibility(session.id)}
                              className="p-1 hover:text-amber-600 text-slate-400 transition-colors"
                              title={session.isHidden ? 'إظهار الجلسة' : 'إخفاء الجلسة'}
                            >
                              {session.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف الجلسة رقم (${session.sessionNumber})؟ سيتم حذف كافة وثائقها!`)) {
                                  deleteSession(session.id);
                                }
                              }}
                              className="p-1 hover:text-rose-600 text-slate-400 transition-colors"
                              title="حذف الجلسة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Session Details & Document Tabs (8 columns) */}
        <div className="lg:col-span-8">
          {activeSession ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-5">
              
              {/* Active Session Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      وقائع ووثائق الجلسة رقم ({activeSession.sessionNumber})
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      {activeSession.sessionType}
                    </span>
                    {activeSession.isHidden && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700">
                        مخفية
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="font-mono tabular-nums">التاريخ: {activeSession.sessionDate}</span>
                    <span>·</span>
                    <span>المكان: {activeSession.location}</span>
                    <span>·</span>
                    <span>الرئاسة: {activeSession.chairman}</span>
                  </div>
                </div>

                {/* Add Document / Decision Buttons */}
                {canAddDrafts && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDocToEdit(null);
                        setActiveDocTypeId('dt-agenda');
                        setIsDocModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة وثيقة/محضر</span>
                    </button>

                    <button
                      onClick={() => {
                        setDecisionToEdit(null);
                        setIsDecisionModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إصدار قرار وزاري</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Document Types Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTabCode('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeTabCode === 'ALL'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  كافة الوثائق ({sessionDocs.length + sessionDecs.length})
                </button>

                <button
                  onClick={() => setActiveTabCode('DECISION')}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeTabCode === 'DECISION'
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>القرارات</span>
                  <span className="font-mono tabular-nums">({sessionDecs.length})</span>
                </button>

                {documentTypes
                  .filter(dt => dt.code !== 'DECISION')
                  .map((dt) => {
                    const count = sessionDocs.filter(d => d.documentTypeId === dt.id).length;
                    return (
                      <button
                        key={dt.id}
                        onClick={() => setActiveTabCode(dt.code)}
                        className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          activeTabCode === dt.code
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {dt.name} ({count})
                      </button>
                    );
                  })}
              </div>

              {/* Documents & Decisions Feed */}
              <div className="space-y-3">
                {/* Decisions Section (shown when ALL or DECISION is active) */}
                {(activeTabCode === 'ALL' || activeTabCode === 'DECISION') && sessionDecs.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>القرارات الوزارية المصادق عليها في هذه الجلسة</span>
                    </div>

                    {sessionDecs.map((decision) => {
                      const isSuperUser = currentUser.role === 'Admin' || currentUser.role === 'مدير الأجندة';
                      const isRecipient = canUserAccessDocument(decision);
                      const canViewDecisionDetails = isSuperUser || isRecipient;

                      if (!canViewDecisionDetails) {
                        return (
                          <div
                            key={decision.id}
                            className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 text-xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500">
                                🔒
                              </span>
                              <div>
                                <div className="font-bold text-slate-700 dark:text-slate-300">
                                  قرار وزاري رقم ({decision.decisionNumber}) - محجوب الصلاحية
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  بيانات هذا القرار محجوبة ومتاحة فقط إذا كانت الجهة المستلمة هي جهة عملك ({currentDepartment?.name || 'غير محددة'})
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 px-2 py-0.5 rounded font-mono">
                              جهة مستلمة خاصة
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={decision.id}
                          onClick={() => setPreviewItem(decision)}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-600/60 dark:hover:border-emerald-500/60 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-mono text-emerald-800 dark:text-emerald-400">
                                قرار رقم {decision.decisionNumber}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                  decision.decisionType === 'سري-وطارئ'
                                    ? 'bg-rose-900 text-white'
                                    : decision.decisionType === 'سري'
                                    ? 'bg-purple-900 text-white'
                                    : decision.decisionType === 'طارئ'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-emerald-800 text-white'
                                }`}
                              >
                                {decision.decisionType}
                              </span>
                              {decision.isHidden && (
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 px-1.5 py-0.5 rounded">
                                  مخفي
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-400 font-mono">
                              كتاب: {decision.letterNumber} ({decision.letterDate})
                            </div>
                          </div>

                          <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {decision.subject}
                          </p>

                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500">
                            <div className="flex items-center gap-3">
                              <span>موقف: <strong className="text-slate-800 dark:text-slate-200">{decision.executionStatus}</strong></span>
                              {decision.targetDepartments && decision.targetDepartments.length > 0 && (
                                <span className="truncate max-w-[200px]">
                                  الجهات: {decision.targetDepartments.join('، ')}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {canManageAgenda && (
                                <>
                                  <button
                                    onClick={() => {
                                      setDecisionToEdit(decision);
                                      setIsDecisionModalOpen(true);
                                    }}
                                    className="p-1 hover:text-emerald-600 text-slate-400"
                                    title="تعديل القرار"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => toggleDecisionVisibility(decision.id)}
                                    className="p-1 hover:text-amber-600 text-slate-400"
                                    title={decision.isHidden ? 'إظهار القرار' : 'إخفاء القرار'}
                                  >
                                    {decision.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`هل أنت متأكد من حذف القرار رقم (${decision.decisionNumber})؟`)) {
                                        deleteDecision(decision.id);
                                      }
                                    }}
                                    className="p-1 hover:text-rose-600 text-slate-400"
                                    title="حذف القرار"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Standard Documents Section */}
                {sessionDocs
                  .filter(doc => {
                    if (activeTabCode === 'ALL') return true;
                    const dt = documentTypes.find(d => d.id === doc.documentTypeId);
                    return dt?.code === activeTabCode;
                  })
                  .map((doc) => {
                    const docType = documentTypes.find(dt => dt.id === doc.documentTypeId);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setPreviewItem(doc)}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {docType?.name || 'وثيقة'}
                            </span>
                            {doc.referenceNumber && (
                              <span className="text-xs font-mono text-slate-500">
                                {doc.referenceNumber}
                              </span>
                            )}
                            {doc.isHidden && (
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 px-1.5 py-0.5 rounded">
                                مخفية
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono">
                            {doc.createdAt}
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {doc.subject}
                        </p>

                        {doc.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {doc.notes}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                          <div className="flex items-center gap-2">
                            {doc.fileName && (
                              <span className="font-mono text-slate-600 dark:text-slate-400">
                                📎 {doc.fileName} ({doc.fileSize})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {canManageAgenda && (
                              <>
                                <button
                                  onClick={() => {
                                    setDocToEdit(doc);
                                    setIsDocModalOpen(true);
                                  }}
                                  className="p-1 hover:text-emerald-600 text-slate-400"
                                  title="تعديل الوثيقة"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => toggleDocumentVisibility(doc.id)}
                                  className="p-1 hover:text-amber-600 text-slate-400"
                                  title={doc.isHidden ? 'إظهار الوثيقة' : 'إخفاء الوثيقة'}
                                >
                                  {doc.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من حذف الوثيقة (${doc.subject})؟`)) {
                                      deleteDocument(doc.id);
                                    }
                                  }}
                                  className="p-1 hover:text-rose-600 text-slate-400"
                                  title="حذف الوثيقة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}

                {/* Empty State when no docs match */}
                {sessionDocs.length === 0 && sessionDecs.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <div>لم يتم إرفاق أي وثائق أو قرارات لهذه الجلسة بعد.</div>
                    {canAddDrafts && (
                      <p className="text-slate-500">
                        استخدم أزرار "إضافة وثيقة/محضر" أو "إصدار قرار وزاري" أعلاه للبدء.
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500 space-y-3">
              <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                اختر جلسة من القائمة لاستعراض وإدارة وثائقها وقراراتها
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                يمكنك معاينة بنود جدول الأعمال، المحاضر الموقعة، التوجيهات الوزارية والقرارات الصادرة.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <AddEditSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        sessionToEdit={sessionToEdit}
      />

      <DocumentFormModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        documentToEdit={docToEdit}
        defaultSessionId={selectedSessionId || undefined}
        defaultDocumentTypeId={activeDocTypeId}
      />

      <DecisionFormModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        decisionToEdit={decisionToEdit}
        defaultSessionId={selectedSessionId || undefined}
      />

      <DocumentPreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        document={previewItem}
      />

    </div>
  );
};

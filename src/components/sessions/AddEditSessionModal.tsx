import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { CabinetSession, SessionType, SessionStatus } from '../../types';

interface AddEditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: CabinetSession | null;
}

export const AddEditSessionModal: React.FC<AddEditSessionModalProps> = ({
  isOpen,
  onClose,
  sessionToEdit
}) => {
  const {
    governments,
    years,
    selectedGovernmentId,
    selectedYearId,
    addSession,
    updateSession
  } = useApp();

  const [governmentId, setGovernmentId] = useState(selectedGovernmentId);
  const [yearId, setYearId] = useState(selectedYearId);
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<SessionType>('عادية');
  const [status, setStatus] = useState<SessionStatus>('قيد الإعداد');
  const [chairman, setChairman] = useState<string>('دولة رئيس مجلس الوزراء');
  const [location, setLocation] = useState<string>('القاعة الكبرى لمجلس الوزراء - القصر الحكومي');
  const [notes, setNotes] = useState<string>('');
  const [isHidden, setIsHidden] = useState<boolean>(false);

  useEffect(() => {
    if (sessionToEdit) {
      setGovernmentId(sessionToEdit.governmentId);
      setYearId(sessionToEdit.yearId);
      setSessionNumber(sessionToEdit.sessionNumber);
      setSessionDate(sessionToEdit.sessionDate);
      setSessionType(sessionToEdit.sessionType);
      setStatus(sessionToEdit.status);
      setChairman(sessionToEdit.chairman);
      setLocation(sessionToEdit.location);
      setNotes(sessionToEdit.notes);
      setIsHidden(sessionToEdit.isHidden);
    } else {
      setGovernmentId(selectedGovernmentId);
      setYearId(selectedYearId);
      setSessionNumber(1);
      setSessionDate(new Date().toISOString().split('T')[0]);
      setSessionType('عادية');
      setStatus('قيد الإعداد');
      setChairman('دولة رئيس مجلس الوزراء');
      setLocation('القاعة الكبرى لمجلس الوزراء - القصر الحكومي');
      setNotes('');
      setIsHidden(false);
    }
  }, [sessionToEdit, isOpen, selectedGovernmentId, selectedYearId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionToEdit) {
      updateSession(sessionToEdit.id, {
        governmentId,
        yearId,
        sessionNumber,
        sessionDate,
        sessionType,
        status,
        chairman,
        location,
        notes,
        isHidden
      });
    } else {
      addSession({
        governmentId,
        yearId,
        sessionNumber,
        sessionDate,
        sessionType,
        status,
        chairman,
        location,
        notes,
        isHidden
      });
    }
    onClose();
  };

  const filteredYears = years.filter(y => y.governmentId === governmentId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sessionToEdit ? `تعديل بيانات الجلسة رقم (${sessionToEdit.sessionNumber})` : 'إدراج جلسة وزارية جديدة'}
      subtitle="تحديد نوع الجلسة (عادية، طارئة، استثنائية)، تاريخها ومكان الانعقاد"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Government & Year selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              الحكومة التابعة لها *
            </label>
            <select
              value={governmentId}
              onChange={(e) => {
                setGovernmentId(e.target.value);
                const nextYears = years.filter(y => y.governmentId === e.target.value);
                if (nextYears[0]) setYearId(nextYears[0].id);
              }}
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
              السنة المالية / الدستورية *
            </label>
            <select
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {filteredYears.map(y => (
                <option key={y.id} value={y.id}>سنة {y.yearNumber}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Session Number & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              رقم الجلسة *
            </label>
            <input
              type="number"
              min="1"
              value={sessionNumber}
              onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              نوع الجلسة *
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-semibold"
            >
              <option value="عادية">عادية (Regular)</option>
              <option value="طارئة">طارئة (Urgent)</option>
              <option value="استثنائية">استثنائية (Extraordinary)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              تاريخ الجلسة *
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        {/* Status, Chairman & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              حالة الجلسة *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SessionStatus)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="قيد الإعداد">قيد الإعداد</option>
              <option value="منعقدة">منعقدة حالياً</option>
              <option value="مكتملة">مكتملة ومصادق عليها</option>
              <option value="مؤجلة">مؤجلة</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              رئيس الجلسة
            </label>
            <input
              type="text"
              value={chairman}
              onChange={(e) => setChairman(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              مكان الانعقاد
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
            ملاحظات ومحاور الجلسة الرئيسية
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أدخل ملخص الموضوعات والمحاور البارزة للجلسة..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          />
        </div>

        {/* Visibility toggle (إخفاء / إظهار) */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="sessionIsHidden"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
            className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="sessionIsHidden" className="text-slate-700 dark:text-slate-300 cursor-pointer">
            إخفاء الجلسة من العرض العام للأعضاء (حجب مؤقت)
          </label>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium shadow-xs transition-colors"
          >
            {sessionToEdit ? 'حفظ التعديلات' : 'إضافة الجلسة'}
          </button>
        </div>

      </form>
    </Modal>
  );
};

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CabinetDocument, Decision, Government, CabinetSession } from '../types';

interface ExportPdfOptions {
  item: CabinetDocument | Decision;
  government?: Government;
  session?: CabinetSession;
  currentUserName: string;
  departmentName: string;
}

/**
 * Generates an official, beautifully styled PDF export of Council of Ministers decisions
 * or session minutes featuring the Republic of Iraq seal and General Secretariat header.
 */
export const exportOfficialDocumentPdf = ({
  item,
  government,
  session,
  currentUserName,
  departmentName
}: ExportPdfOptions) => {
  const isDecision = 'decisionNumber' in item;
  const decision = isDecision ? (item as Decision) : null;

  // Initialize jsPDF A4 document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Official Dark Slate / Emerald accents
  const primaryColor: [number, number, number] = [4, 120, 87]; // Emerald 700
  const headerBgColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const goldColor: [number, number, number] = [180, 130, 40]; // Official Gold

  // Outer Decorative Official Border
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Top Official Header Banner
  doc.setFillColor(...headerBgColor);
  doc.rect(13, 13, pageWidth - 26, 28, 'F');

  // Republic Emblem / Golden Crest Simulation
  doc.setDrawColor(218, 165, 32);
  doc.setFillColor(245, 158, 11);
  doc.circle(pageWidth / 2, 27, 8, 'FD');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('IRAQ', pageWidth / 2, 28, { align: 'center' });

  // Official Titles in Header (Right & Left for official bilateral styling)
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('REPUBLIC OF IRAQ', 20, 22);
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('General Secretariat for the Council of Ministers', 20, 27);
  doc.text('Cabinet Agenda & Decisions Archive', 20, 32);

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('جمهورية العراق', pageWidth - 20, 22, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('الأمانة العامة لمجلس الوزراء', pageWidth - 20, 27, { align: 'right' });
  doc.text('مركز توثيق الجلسات والقرارات الرسمية', pageWidth - 20, 32, { align: 'right' });

  // Document Document Type & Number Headline
  let currentY = 50;

  const docTitleEn = isDecision
    ? (decision?.decisionNumber === '0' || decision?.isDirective ? 'OFFICIAL MINISTERIAL DIRECTIVE' : `COUNCIL OF MINISTERS DECISION NO: ${decision?.decisionNumber}`)
    : 'OFFICIAL CABINET SESSION DOCUMENT & MINUTES';

  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(docTitleEn, pageWidth / 2, currentY, { align: 'center' });

  currentY += 8;

  // Metadata Table Box
  const metaRows: [string, string][] = [
    [
      'Subject / Title:',
      item.subject
    ],
    [
      'Reference / Letter No:',
      isDecision ? `${decision?.letterNumber || '-'} (Date: ${decision?.letterDate || '-'})` : (item.referenceNumber || '-')
    ],
    [
      'Classification / Security Level:',
      isDecision ? (decision?.decisionType || 'Normal') : 'Official Certified'
    ],
    [
      'Cabinet Session:',
      session ? `Session No. (${session.sessionNumber}) - ${session.sessionType} - Date: ${session.sessionDate}` : '-'
    ],
    [
      'Government Administration:',
      government ? `${government.name} (Prime Minister: ${government.primeMinister})` : '-'
    ],
    [
      'Target / Recipient Departments:',
      item.isAllDepartments
        ? 'All Ministries & Government Entities (General Circulation)'
        : (item.recipientDepartments && item.recipientDepartments.length > 0 ? item.recipientDepartments.join(', ') : 'Council of Ministers')
    ],
    [
      'Execution Status:',
      isDecision ? (decision?.executionStatus || 'In Progress') : 'Certified Official Record'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: 16, right: 16 },
    head: [['Official Field', 'Certified Record Information']],
    body: metaRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, fillColor: [248, 250, 252] },
      1: { cellWidth: 'auto' }
    }
  });

  // Notes & Content Section
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...headerBgColor);
  doc.text('Executive Summary & Official Directive Body:', 16, finalY);

  const notesText = item.notes && item.notes.trim()
    ? item.notes
    : 'Certified executive transcript issued by the Council of Ministers General Secretariat according to official agenda minutes and constitutional governance standards.';

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const splitNotes = doc.splitTextToSize(notesText, pageWidth - 32);
  doc.text(splitNotes, 16, finalY + 6);

  // Security Stamp / Watermark Notice
  const stampY = Math.min(pageHeight - 45, finalY + 6 + (splitNotes.length * 4) + 10);

  doc.setDrawColor(...goldColor);
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(16, stampY, pageWidth - 32, 18, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(161, 98, 7);
  doc.text('OFFICIAL VERIFICATION SEAL & SECURITY TRACEABILITY', pageWidth / 2, stampY + 5, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(113, 63, 18);
  doc.text(
    `Exported by: ${currentUserName} | Recipient Unit: ${departmentName} | Timestamp: ${new Date().toISOString()} | Ref: ${item.id}`,
    pageWidth / 2,
    stampY + 11,
    { align: 'center' }
  );

  // Footer bar
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('General Secretariat for the Council of Ministers - Republic of Iraq | Official Document Archiving System', pageWidth / 2, pageHeight - 14, { align: 'center' });

  const fileName = isDecision
    ? `Cabinet_Decision_${(decision?.decisionNumber || '0').replace(/\//g, '_')}_Official.pdf`
    : `Cabinet_Minutes_${item.id}_Official.pdf`;

  doc.save(fileName);
};

/**
 * Exports document to a formatted Word document (.doc) compatible with Microsoft Word.
 */
export const exportOfficialDocumentWord = ({
  item,
  government,
  session,
  currentUserName,
  departmentName
}: ExportPdfOptions) => {
  const isDecision = 'decisionNumber' in item;
  const decision = isDecision ? (item as Decision) : null;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${item.subject}</title>
      <style>
        body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 20px; }
        .title { color: #047857; font-size: 18pt; font-weight: bold; margin: 10px 0; }
        .subtitle { color: #64748b; font-size: 12pt; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table th, .table td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11pt; }
        .table th { background-color: #f1f5f9; text-align: right; font-weight: bold; width: 25%; }
        .body-box { margin-top: 20px; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
        .footer { margin-top: 40px; text-align: center; font-size: 9pt; color: #94a3b8; border-top: 1px solid #cbd5e1; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>جمهورية العراق</h2>
        <h3>الأمانة العامة لمجلس الوزراء</h3>
        <p class="subtitle">مركز توثيق الجلسات والقرارات الرسمية</p>
        <div class="title">
          ${isDecision ? `قرار مجلس الوزراء رقم (${decision?.decisionNumber})` : 'محضر ووثيقة جلسة مجلس الوزراء'}
        </div>
      </div>

      <table class="table">
        <tr>
          <th>موضوع الوثيقة:</th>
          <td>${item.subject}</td>
        </tr>
        <tr>
          <th>رقم الكتاب وتاريخه:</th>
          <td>${isDecision ? `${decision?.letterNumber} بتاريخ ${decision?.letterDate}` : (item.referenceNumber || '-')}</td>
        </tr>
        <tr>
          <th>التصنيف الأمني:</th>
          <td>${isDecision ? decision?.decisionType : 'رسمي معتمد'}</td>
        </tr>
        <tr>
          <th>الجلسة التابعة لها:</th>
          <td>${session ? `الجلسة رقم (${session.sessionNumber}) - ${session.sessionType} - ${session.sessionDate}` : '-'}</td>
        </tr>
        <tr>
          <th>الحكومة:</th>
          <td>${government ? `${government.name} (رئيس الوزراء: ${government.primeMinister})` : '-'}</td>
        </tr>
        <tr>
          <th>الجهات المستلمة:</th>
          <td>${item.isAllDepartments ? 'كافة الوزارات والجهات الحكومية (تعميم عام)' : (item.recipientDepartments?.join('، ') || 'الأمانة العامة لمجلس الوزراء')}</td>
        </tr>
        <tr>
          <th>موقف التنفيذ:</th>
          <td>${isDecision ? decision?.executionStatus : 'سارٍ رسمياً'}</td>
        </tr>
      </table>

      <div class="body-box">
        <h4>نص القرار / تفاصيل المحضر والملاحظات:</h4>
        <p>${item.notes || 'لا توجد ملاحظات إضافية مسجلة.'}</p>
      </div>

      <div class="footer">
        تم تصدير هذه النسخة الرسمية بواسطة: ${currentUserName} | الجهة: ${departmentName} | التاريخ: ${new Date().toLocaleDateString('ar-EG')}
        <br />
        الأمانة العامة لمجلس الوزراء - الأرشيف الرقمي المعتمد
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = isDecision
    ? `قرار_مجلس_الوزراء_${(decision?.decisionNumber || '0').replace(/\//g, '_')}.doc`
    : `محضر_جلسة_${item.id}.doc`;
  a.click();
  URL.revokeObjectURL(url);
};

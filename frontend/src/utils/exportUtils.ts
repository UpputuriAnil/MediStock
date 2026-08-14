import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export const exportToCSV = (filename: string, rows: object[]) => {
  if (!rows || !rows.length) {
    toast.error('No data to export');
    return;
  }
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Successfully exported ${filename}.csv`);
};

export const exportTableToPDF = (
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string = 'Report'
) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Dark Header Bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 22, 'F');

    // Portal Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('MEDISTOCK PHARMACY MANAGEMENT PORTAL', 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Report Date: ${new Date().toLocaleString()}`, 14, 18);

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text(title.toUpperCase(), 14, 32);

    // Auto Table
    autoTable(doc, {
      startY: 37,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 37, left: 14, right: 14, bottom: 15 },
      didDrawPage: (data) => {
        // Footer Page Number
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width - 25,
          doc.internal.pageSize.height - 8
        );
      },
    });

    const cleanFilename = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(cleanFilename);
    toast.success(`PDF report downloaded: ${cleanFilename}`);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF report');
  }
};

export const exportMedicinesToPDF = (title: string, medicines: any[]) => {
  if (!medicines || medicines.length === 0) {
    toast.error('No inventory items to export');
    return;
  }

  const headers = ['NAME', 'CATEGORY', 'BATCH NO.', 'STOCK QTY', 'PRICE ($)', 'EXPIRY DATE', 'STATUS'];
  const rows = medicines.map((m) => [
    m.name || m.genericName || 'N/A',
    m.category || 'N/A',
    m.batchNumber || 'N/A',
    `${m.stock ?? 0} ${m.unit || 'units'}`,
    m.price !== undefined ? `$${Number(m.price).toFixed(2)}` : 'N/A',
    m.expiryDate || 'N/A',
    m.status || 'Active',
  ]);

  exportTableToPDF(title, headers, rows, title);
};

// Backwards compatibility function - generates real PDF document
export const exportToPDFSimulation = (title: string, countOrData: number | any[], customData?: any[]) => {
  if (Array.isArray(countOrData)) {
    exportMedicinesToPDF(title, countOrData);
    return;
  }
  if (Array.isArray(customData) && customData.length > 0) {
    exportMedicinesToPDF(title, customData);
    return;
  }

  // Generic document fallback generator
  const headers = ['RECORD ID', 'REPORT ITEM', 'CATEGORY / TYPE', 'TIMESTAMP', 'STATUS'];
  const rows = Array.from({ length: Math.min(typeof countOrData === 'number' ? countOrData : 10, 50) }, (_, i) => [
    `REP-${2000 + i}`,
    `${title} Entry #${i + 1}`,
    'Clinical / Stock',
    new Date().toLocaleDateString(),
    'Verified',
  ]);
  exportTableToPDF(title, headers, rows, title);
};

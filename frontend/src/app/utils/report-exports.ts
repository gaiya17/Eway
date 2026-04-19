/**
 * Report Export Utilities
 * Shared helpers for generating PDF and Excel reports client-side.
 * Uses jsPDF + jsPDF-AutoTable for PDF, SheetJS (xlsx) for Excel.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const BRAND_COLOR: [number, number, number] = [34, 211, 238]; // cyan-400
const DARK_BG: [number, number, number] = [11, 15, 26];

/**
 * Export data as a styled PDF report with optional chart image.
 */
export function exportToPDF(
  title: string,
  subtitle: string | string[],
  headers: string[],
  rows: (string | number)[][],
  chartImageBase64?: string,
  filename?: string,
  metadataBlock?: { title: string, items: { label: string, value: string }[] }
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  const subtitleOffset = Array.isArray(subtitle) ? subtitle.length * 4.5 : 4.5;
  const extraHeaderHeight = Array.isArray(subtitle) && subtitle.length > 1 ? (subtitle.length - 1) * 4.5 : 0;

  // ── Header Band ──
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, pageWidth, 38 + extraHeaderHeight, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('EWAY LMS', 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(180, 220, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('Learning Management System', 14, 23);

  // Report title on right
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth - 14, 16, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Generated: ${now.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`, pageWidth - 14, 22 + subtitleOffset, { align: 'right' });

  let currentY = 46 + extraHeaderHeight;

  // ── Optional Chart Image ──
  if (chartImageBase64) {
    const imgH = 65;
    doc.addImage(chartImageBase64, 'PNG', 14, currentY, pageWidth - 28, imgH);
    currentY += imgH + 8;
  }

  // ── Metadata Block ──
  if (metadataBlock) {
    doc.setFontSize(14);
    doc.setTextColor(34, 211, 238); // Cyan
    doc.setFont('helvetica', 'bold');
    doc.text(metadataBlock.title, 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    metadataBlock.items.forEach(item => {
      doc.setTextColor(100, 110, 140);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.label}:`, 14, currentY);
      
      const labelWidth = doc.getTextWidth(`${item.label}:`) + 2;
      doc.setTextColor(40, 50, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(item.value, 14 + labelWidth, currentY);
      currentY += 6;
    });

    currentY += 8; // Extra space before table
  }

  // ── Data Table ──
  autoTable(doc, {
    startY: currentY,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 40, 70],
      textColor: [34, 211, 238],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [50, 50, 80],
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    tableLineColor: [200, 210, 230],
    tableLineWidth: 0.2,
  });

  // ── Footer ──
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`EWAY LMS — Confidential Report | Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
  }

  doc.save(filename || `${title.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`);
}

/**
 * Export data as an Excel workbook with multiple optional sheets.
 */
export function exportToExcel(
  filename: string,
  sheets: { name: string; headers: string[]; rows: (string | number)[][] }[]
): void {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, headers, rows }) => {
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Style header row width (approximate)
    ws['!cols'] = headers.map(() => ({ wch: 20 }));

    XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
  });

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export data as a CSV file.
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Capture a Recharts container as a base64 PNG for embedding in PDF.
 * Pass the ref of the ResponsiveContainer wrapper div.
 */
export async function captureChartImage(containerRef: React.RefObject<HTMLDivElement>): Promise<string | undefined> {
  if (!containerRef.current) return undefined;
  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(containerRef.current, { backgroundColor: '#0b0f1a', scale: 2 });
    return canvas.toDataURL('image/png');
  } catch {
    return undefined;
  }
}

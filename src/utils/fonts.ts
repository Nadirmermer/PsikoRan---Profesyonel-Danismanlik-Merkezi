import jsPDF from 'jspdf';

/**
 * jsPDF için font ayarlarını yapar
 * @param doc jsPDF belgesi
 */
export function setupFonts(doc: jsPDF): void {
  // Yerleşik helvetica fontunu kullan
  doc.setFont('helvetica', 'normal');
} 
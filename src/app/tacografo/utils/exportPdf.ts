import { jsPDF } from 'jspdf';
import { Take } from '../types';

export function exportPdf(takes: Take[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let y = 20; // Starting y position

  // Add Cascadia Code font
  doc.addFont('/fonts/CascadiaCode.ttf', 'CascadiaCode', 'normal');
  doc.addFont('/fonts/CascadiaCodeNF.ttf', 'CascadiaCode', 'bold');

  takes.forEach((take, takeIndex) => {
    // Add page break if needed
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    // Take name (centered and uppercase)
    doc.setFont('CascadiaCode', 'bold');
    doc.setFontSize(14);
    const takeName = take.name.toUpperCase();
    const takeNameWidth = doc.getStringUnitWidth(takeName) * doc.getFontSize();
    const centerX = (pageWidth - takeNameWidth) / 2;
    doc.text(takeName, centerX, y);
    y += 8;

    // Take timer
    if (take.timer) {
      doc.setFont('CascadiaCode', 'normal');
      doc.setFontSize(12);
      doc.text(take.timer, 20, y);
      y += 8;
    }

    // Lines
    take.lines.forEach(line => {
      // Skip empty lines
      if (!line.character.trim() && !line.dialogue.trim()) return;

      // Add page break if needed
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      // Character name
      doc.setFont('CascadiaCode', 'bold');
      doc.setFontSize(12);
      doc.text(line.character.toUpperCase(), 20, y);

      // Dialogue
      doc.setFont('CascadiaCode', 'normal');
      doc.text(line.dialogue, 60, y); // Double tab (40 points) from character name

      // Line timer
      if (line.timer) {
        doc.text(line.timer, 180, y);
      }

      y += 8; // Line spacing
    });

    // Add space between takes
    y += 8;
  });

  // Save the PDF
  const date = new Date().toISOString().split('T')[0];
  doc.save(`script-${date}.pdf`);
} 
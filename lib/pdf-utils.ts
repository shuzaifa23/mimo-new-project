import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface ResearchPaperData {
  title: string;
  studentName: string;
  collegeName: string;
  guideName: string;
  abstract: string;
  keywords: string;
}

export async function generateResearchPaperFrontPages(data: ResearchPaperData) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: Title Page
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  page1.drawText(data.title.toUpperCase(), {
    x: 50,
    y: height - 150,
    size: 24,
    font: boldFont,
    maxWidth: width - 100,
    lineHeight: 30,
  });

  page1.drawText(`By: ${data.studentName}`, {
    x: 50,
    y: height - 300,
    size: 16,
    font,
  });

  page1.drawText(`Guided by: ${data.guideName}`, {
    x: 50,
    y: height - 330,
    size: 14,
    font,
  });

  page1.drawText(data.collegeName, {
    x: 50,
    y: 100,
    size: 14,
    font: boldFont,
  });

  // Page 2: Abstract & Keywords
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawText('ABSTRACT', { x: 50, y: height - 50, size: 18, font: boldFont });
  page2.drawText(data.abstract, {
    x: 50,
    y: height - 80,
    size: 12,
    font,
    maxWidth: width - 100,
    lineHeight: 18,
  });

  page2.drawText('KEYWORDS:', { x: 50, y: height - 400, size: 14, font: boldFont });
  page2.drawText(data.keywords, { x: 50, y: height - 420, size: 12, font });

  // Page 3 & 4: Placeholders for Introduction/Table of Contents if needed
  // For now, let's just add them as requested
  pdfDoc.addPage([595.28, 841.89]).drawText('TABLE OF CONTENTS', { x: 50, y: height - 50, size: 18, font: boldFont });
  pdfDoc.addPage([595.28, 841.89]).drawText('LIST OF FIGURES & TABLES', { x: 50, y: height - 50, size: 18, font: boldFont });

  return pdfDoc;
}

export async function mergePdfs(basePdfBytes: Uint8Array, generatedPdf: PDFDocument) {
  const basePdf = await PDFDocument.load(basePdfBytes);
  const mergedPdf = await PDFDocument.create();

  // Copy generated pages
  const generatedPages = await mergedPdf.copyPages(generatedPdf, generatedPdf.getPageIndices());
  generatedPages.forEach((page) => mergedPdf.addPage(page));

  // Copy base pages
  const basePages = await mergedPdf.copyPages(basePdf, basePdf.getPageIndices());
  basePages.forEach((page) => mergedPdf.addPage(page));

  return await mergedPdf.save();
}

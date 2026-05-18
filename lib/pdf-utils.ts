import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface Candidate {
  name: string;
  srn: string;
}

export interface ResearchPaperData {
  title: string;
  schoolName: string;
  degree: string;
  departmentName: string;
  guideName: string;
  coGuideName?: string;
  directorName?: string;
  academicYear: string;
  candidates: Candidate[];
  abstract: string;
  keywords: string;
  acknowledgement?: string;
}

export async function generateResearchPaperFrontPages(data: ResearchPaperData) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const width = 595.28; // A4 width
  const height = 841.89; // A4 height

  // Helper for drawing centered text
  const drawCenteredText = (page: any, text: string, y: number, size: number, currentFont: any, color = rgb(0.05, 0.05, 0.05)) => {
    const textWidth = currentFont.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: y,
      size: size,
      font: currentFont,
      color: color,
    });
  };

  // Helper to wrap text into multiple lines
  const wrapText = (text: string, maxWidth: number, size: number, currentFont: any): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = currentFont.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  // Filter out empty candidates
  const candidates = data.candidates.filter(c => c.name.trim() !== "");

  // ----------------------------------------------------
  // PAGE 1: TITLE / COVER PAGE
  // ----------------------------------------------------
  const page1 = pdfDoc.addPage([width, height]);

  // Draw elegant double border around the cover page (margins 30pt)
  page1.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 1.5,
  });
  page1.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: rgb(0.3, 0.3, 0.3),
    borderWidth: 0.5,
  });

  // Top header - REVA UNIVERSITY Logo / Typographic representation
  // Let's create a beautiful crest/banner representation
  page1.drawRectangle({
    x: (width - 120) / 2,
    y: height - 95,
    width: 120,
    height: 3,
    color: rgb(0.9, 0.45, 0.05), // REVA Orange
  });
  drawCenteredText(page1, "REVA UNIVERSITY", height - 85, 18, boldFont, rgb(0.9, 0.45, 0.05));
  drawCenteredText(page1, "Bengaluru, India", height - 100, 10, italicFont, rgb(0.4, 0.4, 0.4));

  // Department name
  drawCenteredText(page1, data.schoolName.toUpperCase(), height - 135, 14, boldFont);
  
  // Underlines for school name
  page1.drawLine({
    start: { x: 50, y: height - 145 },
    end: { x: width - 50, y: height - 145 },
    color: rgb(0.8, 0.8, 0.8),
    thickness: 1,
  });

  // Report Label
  drawCenteredText(page1, "A PROJECT REPORT", height - 200, 12, boldFont, rgb(0.3, 0.3, 0.3));
  drawCenteredText(page1, "ON", height - 220, 12, boldFont, rgb(0.3, 0.3, 0.3));

  // Project Title (wrapped and beautifully displayed)
  const wrappedTitle = wrapText(data.title.toUpperCase(), width - 120, 16, boldFont);
  let titleY = height - 250;
  wrappedTitle.forEach((line) => {
    drawCenteredText(page1, line, titleY, 16, boldFont, rgb(0.1, 0.1, 0.3));
    titleY -= 22;
  });

  // Requirement text
  let reqY = titleY - 30;
  drawCenteredText(page1, "Submitted in partial fulfilment of the requirements for the award of the degree of", reqY, 10, italicFont);
  reqY -= 15;
  drawCenteredText(page1, data.degree.toUpperCase(), reqY, 13, boldFont);
  reqY -= 16;
  drawCenteredText(page1, "IN", reqY, 11, boldFont);
  reqY -= 18;
  drawCenteredText(page1, data.departmentName.toUpperCase(), reqY, 13, boldFont);

  // Submitted by column
  let subY = reqY - 45;
  drawCenteredText(page1, "Submitted by", subY, 12, boldFont, rgb(0.4, 0.4, 0.4));
  subY -= 20;

  candidates.forEach(cand => {
    const text = `${cand.name.toUpperCase()} (${cand.srn.toUpperCase()})`;
    drawCenteredText(page1, text, subY, 11, boldFont);
    subY -= 16;
  });

  // Under the guidance of
  let guideY = subY - 30;
  drawCenteredText(page1, "Under the guidance of", guideY, 11, italicFont);
  guideY -= 18;
  drawCenteredText(page1, data.guideName, guideY, 12, boldFont);
  if (data.coGuideName) {
    guideY -= 15;
    drawCenteredText(page1, `Co-Guide: ${data.coGuideName}`, guideY, 11, boldFont);
  }

  // Academic Year at bottom
  drawCenteredText(page1, `< YEAR: ${data.academicYear} >`, 120, 11, boldFont, rgb(0.9, 0.45, 0.05));

  // Institution Address
  drawCenteredText(page1, "Rukmini Knowledge Park, Kattigenahalli, Yelahanka, Bengaluru - 560 064", 75, 10, font, rgb(0.3, 0.3, 0.3));
  drawCenteredText(page1, "www.reva.edu.in", 55, 10, boldFont, rgb(0.1, 0.2, 0.6));


  // ----------------------------------------------------
  // PAGE 2: CANDIDATE'S DECLARATION
  // ----------------------------------------------------
  const page2 = pdfDoc.addPage([width, height]);
  drawCenteredText(page2, "CANDIDATE'S DECLARATION", height - 80, 16, boldFont);
  page2.drawLine({ start: { x: 180, y: height - 85 }, end: { x: width - 180, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  const declText = `We, the candidates under-signed, hereby declare that the project report entitled "${data.title}" submitted by us in partial fulfillment of the requirements for the award of the degree of ${data.degree} in ${data.departmentName} to the ${data.schoolName}, REVA University, Bengaluru, is a record of bonafide work carried out by us under the guidance of ${data.guideName}. We further declare that this report has not been submitted previously to this university or any other institution for the award of any degree or diploma.`;
  
  const wrappedDecl = wrapText(declText, width - 100, 11, font);
  let declY = height - 130;
  wrappedDecl.forEach(line => {
    page2.drawText(line, { x: 50, y: declY, size: 11, font, lineHeight: 18 });
    declY -= 20;
  });

  // Signatures of candidates table
  let sigY = declY - 40;
  page2.drawText("Name of Candidates:", { x: 50, y: sigY, size: 11, font: boldFont });
  page2.drawText("Signature:", { x: width - 180, y: sigY, size: 11, font: boldFont });
  sigY -= 30;

  candidates.forEach(cand => {
    page2.drawText(`${cand.name} (${cand.srn})`, { x: 50, y: sigY, size: 10, font });
    page2.drawText("_____________________", { x: width - 180, y: sigY, size: 10, font });
    sigY -= 25;
  });

  // Guide and Director Signatures
  let guideSigY = sigY - 80;
  page2.drawText("_____________________", { x: 50, y: guideSigY, size: 11, font });
  page2.drawText("_____________________", { x: width - 180, y: guideSigY, size: 11, font });
  
  guideSigY -= 15;
  page2.drawText("Signature of the Guide", { x: 50, y: guideSigY, size: 10, font: boldFont });
  page2.drawText("Signature of the Director", { x: width - 180, y: guideSigY, size: 10, font: boldFont });
  
  guideSigY -= 12;
  page2.drawText(data.guideName, { x: 50, y: guideSigY, size: 9, font });
  if (data.directorName) {
    page2.drawText(data.directorName, { x: width - 180, y: guideSigY, size: 9, font });
  }


  // ----------------------------------------------------
  // PAGE 3: CERTIFICATE BY GUIDE
  // ----------------------------------------------------
  const page3 = pdfDoc.addPage([width, height]);
  drawCenteredText(page3, "CERTIFICATE", height - 80, 16, boldFont);
  page3.drawLine({ start: { x: 240, y: height - 85 }, end: { x: width - 240, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  const candListStr = candidates.map(c => `${c.name} (${c.srn})`).join(', ');
  const certText = `This is to certify that the project report entitled "${data.title}" is a bonafide work carried out by ${candListStr} in partial fulfillment of the requirements for the award of the degree of ${data.degree} in ${data.departmentName} of ${data.schoolName}, REVA University, Bengaluru, during the academic year ${data.academicYear}. This work has been carried out under my/our supervision and approval.`;

  const wrappedCert = wrapText(certText, width - 100, 11, font);
  let certY = height - 130;
  wrappedCert.forEach(line => {
    page3.drawText(line, { x: 50, y: certY, size: 11, font, lineHeight: 18 });
    certY -= 20;
  });

  // Guide, Co-guide, Director signatures at the bottom
  let certSigY = certY - 100;
  page3.drawText("_____________________", { x: 50, y: certSigY, size: 11, font });
  page3.drawText("_____________________", { x: width - 180, y: certSigY, size: 11, font });
  
  certSigY -= 15;
  page3.drawText("Signature of the Guide", { x: 50, y: certSigY, size: 10, font: boldFont });
  page3.drawText("Signature of the Director", { x: width - 180, y: certSigY, size: 10, font: boldFont });
  
  certSigY -= 12;
  page3.drawText(data.guideName, { x: 50, y: certSigY, size: 9, font });
  if (data.directorName) {
    page3.drawText(data.directorName, { x: width - 180, y: certSigY, size: 9, font });
  }

  if (data.coGuideName) {
    certSigY -= 40;
    page3.drawText("_____________________", { x: 50, y: certSigY, size: 11, font });
    certSigY -= 15;
    page3.drawText("Signature of the Co-Guide", { x: 50, y: certSigY, size: 10, font: boldFont });
    certSigY -= 12;
    page3.drawText(data.coGuideName, { x: 50, y: certSigY, size: 9, font });
  }


  // ----------------------------------------------------
  // PAGE 4: CERTIFICATE OF REVISION
  // ----------------------------------------------------
  const page4 = pdfDoc.addPage([width, height]);
  drawCenteredText(page4, "CERTIFICATE OF REVISION", height - 80, 16, boldFont);
  page4.drawLine({ start: { x: 180, y: height - 85 }, end: { x: width - 180, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  const revText = `This is to certify that the project report entitled "${data.title}" submitted by ${candListStr} has been revised and resubmitted based on suggestions and corrections pointed out by the examiners during the viva-voce examination.`;

  const wrappedRev = wrapText(revText, width - 100, 11, font);
  let revY = height - 130;
  wrappedRev.forEach(line => {
    page4.drawText(line, { x: 50, y: revY, size: 11, font, lineHeight: 18 });
    revY -= 20;
  });

  // Multiple signature lines for revision certificate
  let revSigY = revY - 80;
  page4.drawText("Signature of Student Candidates:", { x: 50, y: revSigY, size: 11, font: boldFont });
  revSigY -= 30;

  candidates.forEach(cand => {
    page4.drawText(`${cand.name}`, { x: 50, y: revSigY, size: 10, font });
    page4.drawText("_____________________", { x: width - 180, y: revSigY, size: 10, font });
    revSigY -= 25;
  });

  revSigY -= 40;
  page4.drawText("_____________________", { x: 50, y: revSigY, size: 11, font });
  page4.drawText("_____________________", { x: width - 180, y: revSigY, size: 11, font });
  revSigY -= 15;
  page4.drawText("Signature of Guide", { x: 50, y: revSigY, size: 10, font: boldFont });
  page4.drawText("Signature of Director", { x: width - 180, y: revSigY, size: 10, font: boldFont });

  revSigY -= 60;
  page4.drawText("_________________________________________", { x: (width - 240) / 2, y: revSigY, size: 11, font });
  revSigY -= 15;
  drawCenteredText(page4, "Principal Director / Head of Campus", revSigY, 11, boldFont);


  // ----------------------------------------------------
  // PAGE 5: ACKNOWLEDGEMENT
  // ----------------------------------------------------
  const page5 = pdfDoc.addPage([width, height]);
  drawCenteredText(page5, "ACKNOWLEDGEMENT", height - 80, 16, boldFont);
  page5.drawLine({ start: { x: 200, y: height - 85 }, end: { x: width - 200, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  const defaultAck = `First and foremost, we express our profound gratitude to our esteemed guide, ${data.guideName}, whose encouragement, continuous support, and invaluable guidance throughout this project played a pivotal role. We are highly indebted for the time and efforts invested in directing us.\n\nWe express our sincere thanks to ${data.directorName || "the Director"} of ${data.schoolName}, REVA University, for providing us with the necessary campus resources and support structures to implement this project.\n\nLastly, we wish to express our heartfelt gratitude to our parents, family members, and friends for their constant emotional support and blessings, which motivated us during times of difficulty.`;
  const ackContent = data.acknowledgement || defaultAck;

  const ackParagraphs = ackContent.split('\n\n');
  let ackY = height - 130;

  ackParagraphs.forEach(para => {
    const wrappedPara = wrapText(para, width - 100, 11, font);
    wrappedPara.forEach(line => {
      page5.drawText(line, { x: 50, y: ackY, size: 11, font, lineHeight: 18 });
      ackY -= 20;
    });
    ackY -= 15; // gap between paragraphs
  });

  // Signatures of Candidates at the end
  let ackSigY = ackY - 40;
  if (ackSigY < 120) { // Add a page if signature overlaps bottom
    const newPage = pdfDoc.addPage([width, height]);
    ackSigY = height - 100;
  }

  page5.drawText("Student Candidates:", { x: width - 200, y: ackSigY, size: 11, font: boldFont });
  ackSigY -= 25;
  candidates.forEach(cand => {
    page5.drawText(cand.name, { x: width - 200, y: ackSigY, size: 10, font });
    ackSigY -= 18;
  });


  // ----------------------------------------------------
  // PAGE 6: ABSTRACT
  // ----------------------------------------------------
  const page6 = pdfDoc.addPage([width, height]);
  drawCenteredText(page6, "ABSTRACT", height - 80, 16, boldFont);
  page6.drawLine({ start: { x: 240, y: height - 85 }, end: { x: width - 240, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  const wrappedAbstract = wrapText(data.abstract, width - 100, 11, font);
  let absY = height - 130;
  wrappedAbstract.forEach(line => {
    page6.drawText(line, { x: 50, y: absY, size: 11, font, lineHeight: 18 });
    absY -= 20;
  });

  let kwY = absY - 40;
  if (kwY < 100) {
    const newPage = pdfDoc.addPage([width, height]);
    kwY = height - 100;
  }

  page6.drawText("KEYWORDS:", { x: 50, y: kwY, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  page6.drawText(data.keywords, { x: 140, y: kwY, size: 11, font });

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

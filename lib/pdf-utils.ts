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
  guideAffiliation: string;
  coGuideName?: string;
  coGuideAffiliation?: string;
  directorName?: string;
  hodName?: string;
  viceChancellorName?: string;
  academicYear: string;
  plagiarismScore: string;
  projectType: string;
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

  const candidates = data.candidates.filter(c => c.name.trim() !== "");
  const candidateNamesStr = candidates.map(c => c.name).join(", ");
  const candidateNamesUsnsStr = candidates.map(c => `${c.name} (${c.srn})`).join(", ");

  // ----------------------------------------------------
  // PAGE 1: TITLE / COVER PAGE
  // ----------------------------------------------------
  const page1 = pdfDoc.addPage([width, height]);

  // Double border
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
  page1.drawRectangle({
    x: (width - 120) / 2,
    y: height - 95,
    width: 120,
    height: 3,
    color: rgb(0.9, 0.45, 0.05), // REVA Orange
  });
  drawCenteredText(page1, "REVA UNIVERSITY", height - 85, 18, boldFont, rgb(0.9, 0.45, 0.05));
  drawCenteredText(page1, "Bengaluru, India", height - 100, 10, italicFont, rgb(0.4, 0.4, 0.4));

  // Department / School
  drawCenteredText(page1, data.schoolName.toUpperCase(), height - 135, 14, boldFont);
  
  page1.drawLine({
    start: { x: 50, y: height - 145 },
    end: { x: width - 50, y: height - 145 },
    color: rgb(0.8, 0.8, 0.8),
    thickness: 1,
  });

  // Report Label
  drawCenteredText(page1, "A PROJECT REPORT", height - 200, 12, boldFont, rgb(0.3, 0.3, 0.3));
  drawCenteredText(page1, "ON", height - 220, 12, boldFont, rgb(0.3, 0.3, 0.3));

  // Project Title
  const wrappedTitle = wrapText(data.title.toUpperCase(), width - 120, 16, boldFont);
  let titleY = height - 250;
  wrappedTitle.forEach((line) => {
    drawCenteredText(page1, line, titleY, 16, boldFont, rgb(0.1, 0.1, 0.3));
    titleY -= 22;
  });

  // Requirement text
  let reqY = titleY - 30;
  drawCenteredText(page1, "submitted in partial fulfilment of the requirement for the award of the degree of", reqY, 10, italicFont);
  reqY -= 15;
  drawCenteredText(page1, data.degree.toUpperCase(), reqY, 13, boldFont);
  reqY -= 16;
  drawCenteredText(page1, "IN", reqY, 11, boldFont);
  reqY -= 18;
  drawCenteredText(page1, data.departmentName.toUpperCase(), reqY, 13, boldFont);

  // Submitted by
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
  drawCenteredText(page1, `<YEAR: ${data.academicYear}>`, 120, 11, boldFont, rgb(0.9, 0.45, 0.05));

  // Institution Address
  drawCenteredText(page1, "Rukmini Knowledge Park, Kattigenahalli, Yelahanka, Bengaluru - 560 064", 75, 10, font, rgb(0.3, 0.3, 0.3));
  drawCenteredText(page1, "www.reva.edu.in", 55, 10, boldFont, rgb(0.1, 0.2, 0.6));


  // ----------------------------------------------------
  // PAGE 2: DECLARATION
  // ----------------------------------------------------
  const page2 = pdfDoc.addPage([width, height]);
  drawCenteredText(page2, "DECLARATION", height - 80, 16, boldFont);
  page2.drawLine({ start: { x: 240, y: height - 85 }, end: { x: width - 240, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  // Paragraph 1
  const coGuideAffilPart = data.coGuideName ? ` and ${data.coGuideName} (${data.coGuideAffiliation || "Co-Guide"})` : "";
  const declP1 = `We, Mr. / Ms. ${candidateNamesStr} students of ${data.degree}, belong to ${data.schoolName}, REVA University, declare that this Project Report / Dissertation entitled "${data.title}" is the result of the project / dissertation work done by us under the supervision of ${data.guideName} (${data.guideAffiliation})${coGuideAffilPart} at ${data.schoolName}, REVA University.`;
  
  // Paragraph 2
  const declP2 = `We are submitting this Project Report / Dissertation in partial fulfillment of the requirements for the award of the degree of the ${data.degree} in ${data.departmentName} by the REVA University, Bangalore during the academic year ${data.academicYear}.`;

  // Paragraph 3
  const declP3 = `We declare that this project report has been tested for plagiarism and has passed the plagiarism test with the similarity score of ${data.plagiarismScore || "less than 20%"} and it satisfies the academic requirements in respect of Project work prescribed for the said Degree.`;

  // Paragraph 4
  const declP4 = `We further declare that this project / dissertation report or any part of it has not been submitted for award of any other Degree / Diploma of this University or any other University/ Institution.`;

  let declY = height - 130;
  [declP1, declP2, declP3, declP4].forEach(para => {
    const wrappedPara = wrapText(para, width - 100, 10.5, font);
    wrappedPara.forEach(line => {
      page2.drawText(line, { x: 50, y: declY, size: 10.5, font, lineHeight: 17 });
      declY -= 19;
    });
    declY -= 12;
  });

  // Candidate Signature block
  let candSigY = declY - 15;
  page2.drawText("Signature of the candidates with dates", { x: 50, y: candSigY, size: 10.5, font: italicFont });
  candSigY -= 20;
  candidates.forEach((cand, idx) => {
    page2.drawText(`${idx + 1}. _______________________ (${cand.name})`, { x: 50, y: candSigY, size: 10, font });
    candSigY -= 20;
  });

  // Certified Block
  let certBlockY = candSigY - 15;
  const certBlockText = `Certified that this project work submitted by ${candidateNamesStr} has been carried out under my / our guidance and the declaration made by the candidates is true to the best of my knowledge.`;
  const wrappedCertBlockText = wrapText(certBlockText, width - 100, 10, italicFont);
  wrappedCertBlockText.forEach(line => {
    page2.drawText(line, { x: 50, y: certBlockY, size: 10, font: italicFont, lineHeight: 15 });
    certBlockY -= 17;
  });

  // Lower Signatures (Guide, Co-guide, HoD, Director)
  let sigRowY1 = certBlockY - 45;
  page2.drawText("Signature of Guide", { x: 50, y: sigRowY1, size: 10, font: boldFont });
  page2.drawText(data.coGuideName ? "Signature of Co-Guide" : "", { x: width - 210, y: sigRowY1, size: 10, font: boldFont });
  
  sigRowY1 -= 14;
  page2.drawText("Date: ...................", { x: 50, y: sigRowY1, size: 9, font });
  if (data.coGuideName) {
    page2.drawText("Date: ...................", { x: width - 210, y: sigRowY1, size: 9, font });
  }

  let sigRowY2 = sigRowY1 - 40;
  page2.drawText("Signature of HoD", { x: 50, y: sigRowY2, size: 10, font: boldFont });
  page2.drawText("Signature of Director", { x: width - 210, y: sigRowY2, size: 10, font: boldFont });

  sigRowY2 -= 14;
  page2.drawText("Date: ...................", { x: 50, y: sigRowY2, size: 9, font });
  page2.drawText("Date: ...................", { x: width - 210, y: sigRowY2, size: 9, font });
  page2.drawText("Official Seal of the School", { x: width - 210, y: sigRowY2 - 13, size: 9, font: italicFont, color: rgb(0.4, 0.4, 0.4) });


  // ----------------------------------------------------
  // PAGE 3: CERTIFICATE WITH EXAMINERS
  // ----------------------------------------------------
  const page3 = pdfDoc.addPage([width, height]);
  drawCenteredText(page3, "CERTIFICATE", height - 80, 16, boldFont);
  page3.drawLine({ start: { x: 240, y: height - 85 }, end: { x: width - 240, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  // Main Certificate Text
  const certParagraph = `Certified that the project work entitled "${data.title}" carried out under my guidance by ${candidateNamesUsnsStr}, are bonafide students at REVA University during the academic year ${data.academicYear}, are submitting the project report in partial fulfillment for the award of ${data.degree} in ${data.departmentName} during the academic year ${data.academicYear}. The project report has been tested for plagiarism and passed the plagiarism test with a similarity score ${data.plagiarismScore || "less than 20%"}. The project report has been approved as it satisfies the academic requirements in respect of Project work prescribed for the said Degree.`;

  const wrappedCertP = wrapText(certParagraph, width - 100, 10.5, font);
  let certParagraphY = height - 130;
  wrappedCertP.forEach(line => {
    page3.drawText(line, { x: 50, y: certParagraphY, size: 10.5, font, lineHeight: 18 });
    certParagraphY -= 20;
  });

  // Authorities Signatures
  let authSigY = certParagraphY - 45;
  page3.drawText("Signature of Guide", { x: 50, y: authSigY, size: 10, font: boldFont });
  page3.drawText(data.coGuideName ? "Signature of Co-Guide" : "", { x: width - 210, y: authSigY, size: 10, font: boldFont });

  authSigY -= 14;
  page3.drawText("Date: ...................", { x: 50, y: authSigY, size: 9, font });
  if (data.coGuideName) {
    page3.drawText("Date: ...................", { x: width - 210, y: authSigY, size: 9, font });
  }

  let authSigY2 = authSigY - 40;
  page3.drawText("Signature of HoD", { x: 50, y: authSigY2, size: 10, font: boldFont });
  page3.drawText("Signature of Director", { x: width - 210, y: authSigY2, size: 10, font: boldFont });

  authSigY2 -= 14;
  page3.drawText("Date: ...................", { x: 50, y: authSigY2, size: 9, font });
  page3.drawText("Date: ...................", { x: width - 210, y: authSigY2, size: 9, font });
  page3.drawText("Official Seal of the School", { x: width - 210, y: authSigY2 - 13, size: 9, font: italicFont, color: rgb(0.4, 0.4, 0.4) });

  // External Examiners Section
  let examY = authSigY2 - 60;
  drawCenteredText(page3, "External Examiners", examY, 12, boldFont);
  examY -= 25;

  page3.drawText("Name of the Examiner with affiliation", { x: 50, y: examY, size: 10, font: boldFont });
  page3.drawText("Signature with Date", { x: width - 210, y: examY, size: 10, font: boldFont });

  examY -= 30;
  page3.drawText("1. ______________________________________", { x: 50, y: examY, size: 10, font });
  page3.drawText("______________________", { x: width - 210, y: examY, size: 10, font });

  examY -= 30;
  page3.drawText("2. ______________________________________", { x: 50, y: examY, size: 10, font });
  page3.drawText("______________________", { x: width - 210, y: examY, size: 10, font });


  // ----------------------------------------------------
  // PAGE 4: ACKNOWLEDGEMENT
  // ----------------------------------------------------
  const page4 = pdfDoc.addPage([width, height]);
  drawCenteredText(page4, "ACKNOWLEDGEMENT", height - 80, 16, boldFont);
  page4.drawLine({ start: { x: 200, y: height - 85 }, end: { x: width - 200, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  // Exact paragraph text from Image 3
  const ackP1 = `Any given task achieved is never the result of the efforts of a single individual. There are always a bunch of people who play an instrumental role leading a task to its completion. Our joy at having successfully finished our ${data.projectType || "mini project"} work would be incomplete without thanking everyone who helped us out along the way. We would like to express our sense of gratitude to our REVA University for providing us the means of attaining our most cherished goal.`;
  
  const ackP2 = `We would like to thank our Hon'ble Chancellor, Dr. P. Shyama Raju and Hon'ble Vice-Chancellor, ${data.viceChancellorName || "[Vice-Chancellor Name]"} for their immense support towards students to showcase innovative ideas.`;
  
  const ackP3 = `We cannot express enough thanks to our respected Director, ${data.directorName || "[Director Name]"} for providing us with a highly conducive environment and encouraging the growth and creativity of each and every student. We would also like to offer our sincere gratitude to our Project Coordinators for the numerous learning opportunities that have been provided.`;

  const ackP4 = `We would like to take this opportunity to express our gratitude to our Project Guide, ${data.guideName}, for continuously supporting and guiding us in our every endeavor as well as for taking a keen and active interest in the progress of every phase of our Project. Thank you for providing us with the necessary inputs and suggestions for advancing with our Project work. We deeply appreciate the wise guidance that sir/ma'am has provided.`;

  const ackP5 = `Finally, we would like to extend our sincere thanks to all the faculty members and staff from the ${data.schoolName}.`;

  let ackY = height - 130;
  [ackP1, ackP2, ackP3, ackP4, ackP5].forEach(para => {
    const wrappedPara = wrapText(para, width - 100, 10.5, font);
    wrappedPara.forEach(line => {
      page4.drawText(line, { x: 50, y: ackY, size: 10.5, font, lineHeight: 18 });
      ackY -= 20;
    });
    ackY -= 12;
  });

  // List of group members
  let memberY = ackY - 15;
  page4.drawText("Student Candidates / Group Members:", { x: width - 230, y: memberY, size: 10.5, font: boldFont });
  memberY -= 20;
  candidates.forEach(cand => {
    page4.drawText(`${cand.name} (${cand.srn})`, { x: width - 230, y: memberY, size: 10, font });
    memberY -= 16;
  });


  // ----------------------------------------------------
  // PAGE 5: TABLE OF CONTENTS (Part 1)
  // ----------------------------------------------------
  const page5 = pdfDoc.addPage([width, height]);
  drawCenteredText(page5, "CONTENTS", height - 80, 16, boldFont);
  page5.drawLine({ start: { x: 240, y: height - 85 }, end: { x: width - 240, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  // Draw Header Labels
  page5.drawText("Title / Section", { x: 50, y: height - 120, size: 11, font: boldFont });
  page5.drawText("Page No.", { x: width - 100, y: height - 120, size: 11, font: boldFont });
  page5.drawLine({ start: { x: 50, y: height - 125 }, end: { x: width - 50, y: height - 125 }, color: rgb(0.2,0.2,0.2), thickness: 1.5 });

  // Items for page 5
  const tocItems1 = [
    { title: "List of tables with titles and page references", page: "i" },
    { title: "List of illustrations / Screen Shots if any, with titles and page references", page: "ii" },
    { title: "List of Symbols, Abbreviation of Nomenclature", page: "iii" },
    { title: "Abstract", page: "iv" },
    { title: "1. Introduction", page: "1", indent: 0, bold: true },
    { title: "2. Literature Survey", page: "3", indent: 0, bold: true },
    { title: "3. Positioning", page: "6", indent: 0, bold: true },
    { title: "3.1. Problem statement", page: "6", indent: 15 },
    { title: "3.2. Product position statement", page: "7", indent: 15 },
    { title: "4. Project overview", page: "8", indent: 0, bold: true },
    { title: "4.1. Objectives", page: "8", indent: 15 },
    { title: "4.2. Goals", page: "9", indent: 15 },
    { title: "5. Project Scope", page: "10", indent: 0, bold: true },
    { title: "6. Methodology", page: "12", indent: 0, bold: true },
    { title: "7. Modules identified", page: "15", indent: 0, bold: true },
  ];

  let tocY = height - 150;
  tocItems1.forEach(item => {
    const xPos = 50 + (item.indent || 0);
    const itemFont = item.bold ? boldFont : font;
    
    // Draw Title
    const titleWidth = itemFont.widthOfTextAtSize(item.title, 10);
    page5.drawText(item.title, { x: xPos, y: tocY, size: 10, font: itemFont });

    // Draw Dots helper
    let dotStart = xPos + titleWidth + 10;
    const dotEnd = width - 110;
    let dotStr = "";
    const singleDotWidth = font.widthOfTextAtSize(".", 9);
    const spacing = 5;
    const count = Math.floor((dotEnd - dotStart) / (singleDotWidth + spacing));
    
    for (let i = 0; i < count; i++) {
      dotStr += ".";
    }
    
    page5.drawText(dotStr, { x: dotStart, y: tocY, size: 9, font });

    // Draw Page Number
    page5.drawText(item.page, { x: width - 85, y: tocY, size: 10, font: itemFont });
    tocY -= 25;
  });


  // ----------------------------------------------------
  // PAGE 6: TABLE OF CONTENTS (Part 2)
  // ----------------------------------------------------
  const page6 = pdfDoc.addPage([width, height]);
  drawCenteredText(page6, "CONTENTS (Continued)", height - 80, 14, boldFont);
  
  // Header Labels
  page6.drawText("Title / Section", { x: 50, y: height - 120, size: 11, font: boldFont });
  page6.drawText("Page No.", { x: width - 100, y: height - 120, size: 11, font: boldFont });
  page6.drawLine({ start: { x: 50, y: height - 125 }, end: { x: width - 50, y: height - 125 }, color: rgb(0.2,0.2,0.2), thickness: 1.5 });

  const tocItems2 = [
    { title: "8. Project Implementation", page: "18", indent: 0, bold: true },
    { title: "8.1. Architectural Design, Circuit Design (Hardware Project) and Mechanical and Control Unit Design", page: "18", indent: 15 },
    { title: "8.2. Class Diagram", page: "20", indent: 15 },
    { title: "8.3. Entity Relationship Model", page: "22", indent: 15 },
    { title: "8.4. Sequence Diagram", page: "24", indent: 15 },
    { title: "8.5. Description of Technology Used", page: "26", indent: 15 },
    { title: "9. Findings / Results of Analysis", page: "30", indent: 0, bold: true },
    { title: "10. Cost of the Project", page: "34", indent: 0, bold: true },
    { title: "11. Conclusions", page: "36", indent: 0, bold: true },
    { title: "12. Project Limitations and Future Enhancements", page: "38", indent: 0, bold: true },
    { title: "References", page: "40", indent: 0, bold: true },
    { title: "Appendices, if any", page: "42", indent: 0, bold: true },
    { title: "Copies of Articles", page: "44", indent: 0, bold: true },
    { title: "Conference papers published (Certificate with Published Paper)", page: "44", indent: 15 },
    { title: "Patent Forms", page: "46", indent: 15 },
    { title: "Plagiarism Report", page: "48", indent: 0, bold: true },
    { title: "Any Awards achieved (Certificates)", page: "50", indent: 0, bold: true }
  ];

  let tocY2 = height - 150;
  tocItems2.forEach(item => {
    const xPos = 50 + (item.indent || 0);
    const itemFont = item.bold ? boldFont : font;
    
    // Draw Title (wrap briefly if it is too long, like 8.1)
    const titleWidth = itemFont.widthOfTextAtSize(item.title, 9.5);
    const maxTitleWidth = width - 220;
    
    if (titleWidth > maxTitleWidth) {
      // Long line wrapping (specific to 8.1 / Conference papers)
      const lines = wrapText(item.title, maxTitleWidth, 9.5, itemFont);
      lines.forEach((line, lineIdx) => {
        page6.drawText(line, { x: xPos, y: tocY2, size: 9.5, font: itemFont });
        if (lineIdx === lines.length - 1) {
          // Draw dots and page no on the last line
          const lastLineWidth = itemFont.widthOfTextAtSize(line, 9.5);
          let dotStart = xPos + lastLineWidth + 10;
          const dotEnd = width - 110;
          let dotStr = "";
          const count = Math.floor((dotEnd - dotStart) / 8);
          for (let i = 0; i < count; i++) dotStr += ".";
          page6.drawText(dotStr, { x: dotStart, y: tocY2, size: 9, font });
          page6.drawText(item.page, { x: width - 85, y: tocY2, size: 9.5, font: itemFont });
        }
        tocY2 -= 16;
      });
      tocY2 -= 8; // Extra padding
    } else {
      page6.drawText(item.title, { x: xPos, y: tocY2, size: 9.5, font: itemFont });

      // Draw Dots
      let dotStart = xPos + titleWidth + 10;
      const dotEnd = width - 110;
      let dotStr = "";
      const count = Math.floor((dotEnd - dotStart) / 8);
      for (let i = 0; i < count; i++) dotStr += ".";
      page6.drawText(dotStr, { x: dotStart, y: tocY2, size: 9, font });

      // Draw Page No
      page6.drawText(item.page, { x: width - 85, y: tocY2, size: 9.5, font: itemFont });
      tocY2 -= 24;
    }
  });


  // ----------------------------------------------------
  // PAGE 7: ABSTRACT
  // ----------------------------------------------------
  const page7 = pdfDoc.addPage([width, height]);
  drawCenteredText(page7, "ABSTRACT", height - 80, 16, boldFont);
  page7.drawLine({ start: { x: 240, y: height - 85 }, end: { x: width - 240, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  const wrappedAbstract = wrapText(data.abstract, width - 100, 11, font);
  let absY = height - 130;
  wrappedAbstract.forEach(line => {
    page7.drawText(line, { x: 50, y: absY, size: 11, font, lineHeight: 18 });
    absY -= 20;
  });

  let kwY = absY - 40;
  if (kwY < 100) {
    const newPage = pdfDoc.addPage([width, height]);
    kwY = height - 100;
  }

  page7.drawText("KEYWORDS:", { x: 50, y: kwY, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  page7.drawText(data.keywords, { x: 140, y: kwY, size: 11, font });

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

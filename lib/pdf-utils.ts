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


  // ----------------------------------------------------
  // PAGE 8: 1. INTRODUCTION & 2. LITERATURE SURVEY
  // ----------------------------------------------------
  const page8 = pdfDoc.addPage([width, height]);
  drawCenteredText(page8, "1. INTRODUCTION & 2. LITERATURE SURVEY", height - 80, 14, boldFont);
  page8.drawLine({ start: { x: 150, y: height - 85 }, end: { x: width - 150, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  // Section 1: Introduction
  page8.drawText("1. Introduction:", { x: 50, y: height - 120, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  const introDesc = "Include a background, context, scenario or motivation for project work. This section sets the stage, introduces the core problem, and explains why your project is necessary and valuable.";
  const wrappedIntroDesc = wrapText(introDesc, width - 100, 10, font);
  let introY = height - 138;
  wrappedIntroDesc.forEach(line => {
    page8.drawText(line, { x: 50, y: introY, size: 10, font, lineHeight: 15 });
    introY -= 17;
  });

  // Writing block/box for intro
  page8.drawRectangle({
    x: 50,
    y: introY - 140,
    width: width - 100,
    height: 130,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98),
  });
  page8.drawText("[Write Introduction / Background text here...]", { x: 65, y: introY - 30, size: 9, font: italicFont, color: rgb(0.5, 0.5, 0.5) });

  // Section 2: Literature Survey
  let litY = introY - 170;
  page8.drawText("2. Literature Survey:", { x: 50, y: litY, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  const litDesc = "A literature review discusses published information in a subject area, usually within a certain time period. It summarizes the sources, synthesizes key details, and reveals how they build towards your project approach.";
  const wrappedLitDesc = wrapText(litDesc, width - 100, 10, font);
  litY -= 18;
  wrappedLitDesc.forEach(line => {
    page8.drawText(line, { x: 50, y: litY, size: 10, font, lineHeight: 15 });
    litY -= 17;
  });

  // Writing box for literature survey
  page8.drawRectangle({
    x: 50,
    y: litY - 140,
    width: width - 100,
    height: 130,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98),
  });
  page8.drawText("[Write Literature Survey details & Citation references here...]", { x: 65, y: litY - 30, size: 9, font: italicFont, color: rgb(0.5, 0.5, 0.5) });


  // ----------------------------------------------------
  // PAGE 9: 3. POSITIONING & 4. PROJECT OVERVIEW
  // ----------------------------------------------------
  const page9 = pdfDoc.addPage([width, height]);
  drawCenteredText(page9, "3. POSITIONING & 4. PROJECT OVERVIEW", height - 80, 14, boldFont);
  page9.drawLine({ start: { x: 150, y: height - 85 }, end: { x: width - 150, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  // Section 3: Positioning
  page9.drawText("3. Positioning:", { x: 50, y: height - 120, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  
  let posY = height - 145;
  page9.drawText("3.1. Problem statement:", { x: 55, y: posY, size: 10.5, font: boldFont });
  posY -= 16;
  const probText = "A problem statement is usually one or two sentences to explain the problem your project will address. In general, a problem statement will outline the negative points of the current situation and explain why these matters. It serves as a great communication tool, helping to get buy-in and support from others.";
  const wrappedProb = wrapText(probText, width - 110, 9.5, font);
  wrappedProb.forEach(line => {
    page9.drawText(line, { x: 60, y: posY, size: 9.5, font, lineHeight: 14 });
    posY -= 15;
  });

  posY -= 10;
  page9.drawText("3.2. Product position statement:", { x: 55, y: posY, size: 10.5, font: boldFont });
  posY -= 16;
  const prodText = "A product positioning statement is a short description of your target market and the product you provide to them. It's an internal tool that keeps all teams at your company in sync about how they should communicate your product's value to users. Your marketing department will reference your product positioning statement when creating campaigns.";
  const wrappedProd = wrapText(prodText, width - 110, 9.5, font);
  wrappedProd.forEach(line => {
    page9.drawText(line, { x: 60, y: posY, size: 9.5, font, lineHeight: 14 });
    posY -= 15;
  });

  // Section 4: Project Overview
  posY -= 25;
  page9.drawText("4. Project Overview:", { x: 50, y: posY, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  
  posY -= 25;
  page9.drawText("4.1. Objectives:", { x: 55, y: posY, size: 10.5, font: boldFont });
  posY -= 16;
  const objText = "An objective describes the desired results of a project, which often includes a tangible item. An objective is specific and measurable, and must meet time, budget, and quality constraints. A project may have one objective, many parallel objectives, or several objectives that must be achieved sequentially. To produce the most benefit, objectives must be defined early in the project life cycle, in phase one, the planning phase.";
  const wrappedObj = wrapText(objText, width - 110, 9.5, font);
  wrappedObj.forEach(line => {
    page9.drawText(line, { x: 60, y: posY, size: 9.5, font, lineHeight: 14 });
    posY -= 15;
  });

  posY -= 10;
  page9.drawText("4.2. Goals:", { x: 55, y: posY, size: 10.5, font: boldFont });
  posY -= 16;
  const goalText = "The goal of a project overview is to lay out the details of a project in a concise, easy-to-understand manner that can be presented to clients, team members, and key stakeholders.";
  const wrappedGoal = wrapText(goalText, width - 110, 9.5, font);
  wrappedGoal.forEach(line => {
    page9.drawText(line, { x: 60, y: posY, size: 9.5, font, lineHeight: 14 });
    posY -= 15;
  });


  // ----------------------------------------------------
  // PAGE 10: 5. PROJECT SCOPE
  // ----------------------------------------------------
  const page10 = pdfDoc.addPage([width, height]);
  drawCenteredText(page10, "5. PROJECT SCOPE", height - 80, 14, boldFont);
  page10.drawLine({ start: { x: 220, y: height - 85 }, end: { x: width - 220, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  const scopeIntro = "The project scope is a short document prepared primarily for the client. The scope statement clearly describes what the project will deliver and outlines generally at a high level all the work required for completing the project.";
  const wrappedScopeIntro = wrapText(scopeIntro, width - 100, 10, font);
  let scopeY = height - 120;
  wrappedScopeIntro.forEach(line => {
    page10.drawText(line, { x: 50, y: scopeY, size: 10, font, lineHeight: 15 });
    scopeY -= 17;
  });

  // Table grid outline for scope
  const tableTop = scopeY - 20;
  page10.drawRectangle({
    x: 50,
    y: tableTop - 450,
    width: width - 100,
    height: 450,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 1.5,
  });

  // Row divisions and headers
  const rowHeight = 90;
  const rowLabels = [
    { label: "General Project Information", desc: "Define title, client name, sponsor, school branch and core domain description." },
    { label: "Problem/Opportunity Statement", desc: "Mention the problem context, target audience pain-point, and product solution opportunity." },
    { label: "Business Benefits", desc: "Detail operational efficiency improvements, financial viability, academic contributions or learning advantages." },
    { label: "Project Deliverables", desc: "List key deliverables: software build, API components, circuit modules, design documents, source code." },
    { label: "Estimated Project Duration", desc: "Specify milestones: planning phase, model designs, module builds, testing sprints, submission deadline." },
  ];

  rowLabels.forEach((row, idx) => {
    const lineY = tableTop - ((idx + 1) * rowHeight);
    
    // Draw row separator line
    if (idx < 4) {
      page10.drawLine({ start: { x: 50, y: lineY }, end: { x: width - 50, y: lineY }, color: rgb(0.5, 0.5, 0.5), thickness: 0.8 });
    }
    
    // Draw row content
    const labelY = tableTop - (idx * rowHeight) - 25;
    page10.drawText(row.label, { x: 60, y: labelY, size: 10.5, font: boldFont, color: rgb(0.1, 0.2, 0.5) });
    
    const descY = labelY - 16;
    const wrappedRowDesc = wrapText(row.desc, width - 130, 9, italicFont);
    wrappedRowDesc.forEach((line, lIdx) => {
      page10.drawText(line, { x: 65, y: descY - (lIdx * 12), size: 9, font: italicFont, color: rgb(0.4, 0.4, 0.4) });
    });

    // Elegant placeholder text
    page10.drawText("[Fill scope details in this section]", { x: width - 240, y: labelY - 12, size: 9, font, color: rgb(0.7, 0.7, 0.7) });
  });


  // ----------------------------------------------------
  // PAGE 11: 6. METHODOLOGY & 7. MODULES IDENTIFIED
  // ----------------------------------------------------
  const page11 = pdfDoc.addPage([width, height]);
  drawCenteredText(page11, "6. METHODOLOGY & 7. MODULES IDENTIFIED", height - 80, 14, boldFont);
  page11.drawLine({ start: { x: 150, y: height - 85 }, end: { x: width - 150, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  // Section 6: Methodology
  page11.drawText("6. Methodology:", { x: 50, y: height - 120, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  const methDesc = "Methodology is a strictly defined combination of logically related practices, methods and processes that determine best to plan, develop, control and deliver a project throughout the continuous implementation process until successful completion and termination. It can contain block diagrams and approaches to solve the problem / project.";
  const wrappedMeth = wrapText(methDesc, width - 100, 10, font);
  let methY = height - 138;
  wrappedMeth.forEach(line => {
    page11.drawText(line, { x: 50, y: methY, size: 10, font, lineHeight: 15 });
    methY -= 17;
  });

  // Writing box with block diagram placeholder
  page11.drawRectangle({
    x: 50,
    y: methY - 180,
    width: width - 100,
    height: 170,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98),
  });
  page11.drawText("[Insert Methodology Text, Core Sprints, and Block Diagram here...]", { x: 65, y: methY - 40, size: 9, font: italicFont, color: rgb(0.5, 0.5, 0.5) });

  // Section 7: Modules Identified
  let modY = methY - 215;
  page11.drawText("7. Modules Identified:", { x: 50, y: modY, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  const modDesc = "A \"module\" is a high-level description of a functional area, consisting of a group of processes describing the functionality of the module and a group of packages implementing the functionality.";
  const wrappedMod = wrapText(modDesc, width - 100, 10, font);
  modY -= 18;
  wrappedMod.forEach(line => {
    page11.drawText(line, { x: 50, y: modY, size: 10, font, lineHeight: 15 });
    modY -= 17;
  });

  // Writing box for modules
  page11.drawRectangle({
    x: 50,
    y: modY - 140,
    width: width - 100,
    height: 130,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98),
  });
  page11.drawText("[List your identified system modules, inputs, processes, and outputs here...]", { x: 65, y: modY - 30, size: 9, font: italicFont, color: rgb(0.5, 0.5, 0.5) });


  // ----------------------------------------------------
  // PAGE 12: 8. PROJECT IMPLEMENTATION
  // ----------------------------------------------------
  const page12 = pdfDoc.addPage([width, height]);
  drawCenteredText(page12, "8. PROJECT IMPLEMENTATION", height - 80, 14, boldFont);
  page12.drawLine({ start: { x: 180, y: height - 85 }, end: { x: width - 180, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  const impIntro = "Your project group is required to submit a document outlining the project's implementation details. Ensure that your diagrams follow proper modelling conventions. Include appropriate write-up to connect the sections. Overall, your document should have a smooth flow, logical transitions, and should be easy to follow.";
  const wrappedImp = wrapText(impIntro, width - 100, 10, font);
  let impY = height - 120;
  wrappedImp.forEach(line => {
    page12.drawText(line, { x: 50, y: impY, size: 10, font, lineHeight: 15 });
    impY -= 17;
  });

  impY -= 20;

  // Render 5 core diagram / implementation rules beautifully
  const impSteps = [
    { num: "1", title: "Architectural Design", desc: "Component diagrams, high-level descriptions of the components in your system, and their purpose in relation to the project's objectives." },
    { num: "2", title: "Class Diagram", desc: "Outlines the attributes, methods and interactions of the major classes/modules in your system." },
    { num: "3", title: "Entity Relationship Model", desc: "Specifies the entities, datatypes, and relationships that are important for the project domain." },
    { num: "4", title: "Sequence Diagram", desc: "Illustrates object interactions for the major use case scenarios for the project." },
    { num: "5", title: "Description of Technology Used", desc: "Hardware devices, software products, databases, cloud microservices, and programming languages." },
  ];

  impSteps.forEach(step => {
    // Round badge for step number
    page12.drawCircle({
      x: 65,
      y: impY - 18,
      size: 13,
      color: rgb(0.9, 0.45, 0.05),
    });
    page12.drawText(step.num, { x: 62, y: impY - 22, size: 10, font: boldFont, color: rgb(1,1,1) });

    // Step Header Title
    page12.drawText(step.title, { x: 88, y: impY - 22, size: 11, font: boldFont, color: rgb(0.1, 0.1, 0.4) });

    // Step Description
    const wrappedStepDesc = wrapText(step.desc, width - 145, 9.5, font);
    let stepDescY = impY - 36;
    wrappedStepDesc.forEach(line => {
      page12.drawText(line, { x: 88, y: stepDescY, size: 9.5, font, lineHeight: 13 });
      stepDescY -= 14;
    });

    impY = stepDescY - 14;
  });


  // ----------------------------------------------------
  // PAGE 13: 9. RESULTS, 10. COST, 11. CONCLUSIONS & 12. LIMITATIONS
  // ----------------------------------------------------
  const page13 = pdfDoc.addPage([width, height]);
  drawCenteredText(page13, "9. RESULTS, 10. COST, 11. CONCLUSIONS & 12. LIMITATIONS", height - 80, 13, boldFont);
  page13.drawLine({ start: { x: 100, y: height - 85 }, end: { x: width - 100, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  let chapY = height - 120;

  // 9. Findings
  page13.drawText("9. Findings / Results of Analysis:", { x: 50, y: chapY, size: 11.5, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  const chap9Text = "The principal outcomes of a project; what the project suggested, revealed or indicated. This usually refers to the totality of outcomes, rather than the conclusions or recommendations drawn from them.";
  const wrapped9 = wrapText(chap9Text, width - 100, 9.5, font);
  chapY -= 16;
  wrapped9.forEach(line => {
    page13.drawText(line, { x: 50, y: chapY, size: 9.5, font, lineHeight: 14 });
    chapY -= 15;
  });

  // 10. Cost
  chapY -= 15;
  page13.drawText("10. Cost of the Project:", { x: 50, y: chapY, size: 11.5, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  const chap10Text = "The total expenditure was incurred while carrying out the project. A complete breakdown shall be furnished.";
  const wrapped10 = wrapText(chap10Text, width - 100, 9.5, font);
  chapY -= 16;
  wrapped10.forEach(line => {
    page13.drawText(line, { x: 50, y: chapY, size: 9.5, font, lineHeight: 14 });
    chapY -= 15;
  });

  // 11. Conclusions
  chapY -= 15;
  page13.drawText("11. Conclusions:", { x: 50, y: chapY, size: 11.5, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  const chap11Text = "A conclusion is the last part of something, it means \"finally, to sum up,\" and is used to introduce some final comments at the end of writing.";
  const wrapped11 = wrapText(chap11Text, width - 100, 9.5, font);
  chapY -= 16;
  wrapped11.forEach(line => {
    page13.drawText(line, { x: 50, y: chapY, size: 9.5, font, lineHeight: 14 });
    chapY -= 15;
  });

  // 12. Limitations & Enhancements
  chapY -= 15;
  page13.drawText("12. Project Limitations and Future Enhancements:", { x: 50, y: chapY, size: 11.5, font: boldFont, color: rgb(0.1, 0.1, 0.4) });
  const chap12Text = "There are a lot of features and functionalities that can be integrated in a project, but the project scope is limited to diligently resolve the problems as identified in the problem statement. However, features that are not included in the system can be considered as future enhancements. Here the description of the limitations and features that could be used in the project has to be specified.";
  const wrapped12 = wrapText(chap12Text, width - 100, 9.5, font);
  chapY -= 16;
  wrapped12.forEach(line => {
    page13.drawText(line, { x: 50, y: chapY, size: 9.5, font, lineHeight: 14 });
    chapY -= 15;
  });

  // Small guide grid box at bottom
  page13.drawRectangle({
    x: 50,
    y: 50,
    width: width - 100,
    height: 70,
    borderColor: rgb(0.9, 0.45, 0.05),
    borderWidth: 1,
    color: rgb(0.99, 0.97, 0.95),
  });
  page13.drawText("PRO TIP:", { x: 60, y: 100, size: 10, font: boldFont, color: rgb(0.9, 0.45, 0.05) });
  page13.drawText("Draft exact metrics, costs, timelines, and quantitative results inside these chapters to wow your examiners!", { x: 60, y: 84, size: 9, font: italicFont });
  page13.drawText("Always double-check your code diagrams and models match proper UML conventions.", { x: 60, y: 70, size: 9, font: italicFont });


  // ----------------------------------------------------
  // PAGE 14: REFERENCES
  // ----------------------------------------------------
  const page14 = pdfDoc.addPage([width, height]);
  drawCenteredText(page14, "REFERENCES", height - 80, 16, boldFont);
  page14.drawLine({ start: { x: 240, y: height - 85 }, end: { x: width - 240, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  page14.drawText("References must be quoted as per the following format:", { x: 50, y: height - 120, size: 11, font: boldFont });
  
  // Format box
  page14.drawRectangle({
    x: 50,
    y: height - 180,
    width: width - 100,
    height: 48,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 1,
    color: rgb(0.96, 0.96, 0.96),
  });
  const formatText = "Author(s) Initial(s). Surname(s), \"Title of Report,\" Abbrev. Name of Co., City of Co., Abbrev. State, Country (abbrev. US State or Country if city is not 'well known'), Report number/Type (if available), Abbrev. Month. (Day if available), Year of Publication.";
  const wrappedFormat = wrapText(formatText, width - 120, 8.5, font);
  let formatY = height - 146;
  wrappedFormat.forEach(line => {
    page14.drawText(line, { x: 60, y: formatY, size: 8.5, font, lineHeight: 12 });
    formatY -= 13;
  });

  page14.drawText("Kindly follow the same format for writing references as shown in specimen examples below:", { x: 50, y: height - 205, size: 10, font: italicFont, color: rgb(0.3, 0.3, 0.3) });

  // Example citations
  const citations = [
    { num: "[1]", text: "G. Eason, B. Noble, and I. N. Sneddon, \"On certain integrals of Lipschitz-Hankel type involving products of Bessel functions,\" Phil. Trans. Roy. Soc. London, vol. A247, pp. 529-551, April 1955." },
    { num: "[2]", text: "J. Clerk Maxwell, A Treatise on Electricity and Magnetism, 3rd ed., vol. 2. Oxford: Clarendon, 1892, pp. 68-73." },
    { num: "[3]", text: "I. S. Jacobs and C. P. Bean, \"Fine particles, thin films and exchange anisotropy,\" in Magnetism, vol. III, G. T. Rado and H. Suhl, Eds. New York: Academic, 1963, pp. 271-350." },
    { num: "[4]", text: "K. Elissa, \"Title of paper if known,\" unpublished." },
    { num: "[5]", text: "R. Nicole, \"Title of paper with only first word capitalized,\" J. Name Stand. Abbrev., in press." },
    { num: "[6]", text: "M. Young, The Technical Writer's Handbook. Mill Valley, CA: University Science, 1989." }
  ];

  let citY = height - 235;
  citations.forEach(cit => {
    page14.drawText(cit.num, { x: 50, y: citY, size: 9.5, font: boldFont, color: rgb(0.1, 0.1, 0.5) });
    const wrappedCit = wrapText(cit.text, width - 130, 9.5, font);
    wrappedCit.forEach((line, lIdx) => {
      page14.drawText(line, { x: 75, y: citY - (lIdx * 14), size: 9.5, font, lineHeight: 14 });
    });
    citY -= (wrappedCit.length * 14) + 12;
  });


  // ----------------------------------------------------
  // PAGE 15: COPIES OF ARTICLES & CERTIFICATES
  // ----------------------------------------------------
  const page15 = pdfDoc.addPage([width, height]);
  drawCenteredText(page15, "COPIES OF ARTICLES & CERTIFICATES", height - 80, 14, boldFont);
  page15.drawLine({ start: { x: 150, y: height - 85 }, end: { x: width - 150, y: height - 85 }, color: rgb(0,0,0), thickness: 1 });

  page15.drawText("Under this section, candidates are mandated to furnish copies of the following items:", { x: 50, y: height - 120, size: 10.5, font: italicFont, color: rgb(0.3, 0.3, 0.3) });

  let artY = height - 150;

  // Article items
  const artItems = [
    { num: "1", title: "Conference papers published (Certificate with Published Paper)", desc: "Candidate shall furnish the certificate of the conference in which he/she has presented a paper regarding the project, along with a copy of the published paper." },
    { num: "2", title: "Patent Forms", desc: "It also mandates for the candidates to learn filing of patents, here candidates shall furnish the patent forms with acknowledgement of patent filing." },
    { num: "3", title: "Any Awards achieved (Certificates)", desc: "If the candidates have participated in any of the project expo or any competitions internal or external and has received recognition / award, the certificates have to be furnished." },
  ];

  artItems.forEach(item => {
    // Beautiful block box for each article type
    page15.drawRectangle({
      x: 50,
      y: artY - 110,
      width: width - 100,
      height: 100,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 1,
      color: rgb(0.99, 0.99, 0.99),
    });

    page15.drawCircle({ x: 75, y: artY - 30, size: 12, color: rgb(0.1, 0.2, 0.5) });
    page15.drawText(item.num, { x: 72, y: artY - 34, size: 10, font: boldFont, color: rgb(1,1,1) });

    page15.drawText(item.title, { x: 95, y: artY - 35, size: 11, font: boldFont, color: rgb(0.1, 0.2, 0.5) });

    const wrappedDesc = wrapText(item.desc, width - 130, 9.5, font);
    let descLineY = artY - 54;
    wrappedDesc.forEach(line => {
      page15.drawText(line, { x: 75, y: descLineY, size: 9.5, font, lineHeight: 14 });
      descLineY -= 15;
    });

    artY -= 125;
  });

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

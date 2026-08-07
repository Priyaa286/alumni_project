import { jsPDF } from 'jspdf';

export const generateAcknowledgementPDF = (data) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const nominee = data.nominee || {};
  const professional = data.professional || {};
  const nominator = data.nominator || {};
  const declaration = data.declaration || {};
  
  // Set Colors
  const primaryColor = [138, 43, 226]; // #8A2BE2
  const secondaryColor = [166, 77, 255]; // #A64DFF
  const textColor = [51, 65, 85]; // slate-700
  const lightGrey = [241, 245, 249]; // slate-100

  // 1. Header Frame
  doc.rect(5, 5, 200, 287); // Page border
  doc.rect(6, 6, 198, 285); // Inner page border

  // Title Headers
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('NATIONAL ENGINEERING COLLEGE', 105, 18, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('K.R. Nagar, Kovilpatti - 628 503', 105, 23, { align: 'center' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('NOTABLE ALUMNI AWARD NOMINATION PORTAL', 105, 30, { align: 'center' });

  // Draw separator line
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(15, 34, 195, 34);

  // Nomination Receipt ID Card
  doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
  doc.rect(15, 38, 180, 12, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Nomination ID: ${data.nominationId || 'DRAFT-NOM'}`, 20, 45);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Submitted On: ${new Date().toLocaleDateString()}`, 145, 45);

  let y = 57;

  // Section Generator Helper
  const drawSectionHeader = (title) => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, y, 180, 7, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), 20, y + 5);
    y += 12;
  };

  const drawRow = (label1, val1, label2, val2) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(label1, 20, y);
    if (label2) doc.text(label2, 110, y);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    // Crop values to fit columns
    const shortVal1 = String(val1 || 'N/A').substring(0, 42);
    const shortVal2 = String(val2 || 'N/A').substring(0, 42);
    
    doc.text(shortVal1, 55, y);
    if (label2) doc.text(shortVal2, 145, y);
    y += 7;
  };

  // Section 1: Nominee Details
  drawSectionHeader('1. Nominee Details');
  drawRow('Nominee Name:', nominee.name, 'Graduation Batch:', nominee.batch);
  drawRow('Department:', nominee.department, 'Mobile Number:', `+91 ${nominee.mobile}`);
  drawRow('Email Address:', nominee.email, 'Current City:', nominee.city);
  drawRow('State:', nominee.state, 'Country:', nominee.country);
  drawRow('LinkedIn:', nominee.linkedin || 'N/A', 'Alumni Portal Reg:', nominee.isRegisteredAlumni);
  y += 5;

  // Section 2: Professional Profile
  drawSectionHeader('2. Professional Profile');
  drawRow('Designation:', professional.designation, 'Organization:', professional.organization);
  drawRow('Experience:', `${professional.experience} Years`, 'Website:', professional.website || 'N/A');
  y += 5;

  // Section 3: Award Category
  drawSectionHeader('3. Award Domain');
  drawRow('Category:', data.category, '', '');
  y += 5;

  // Section 4: Nominator Details
  drawSectionHeader('4. Nominator Details');
  drawRow('Nominated By:', nominator.name, 'Graduation Batch:', nominator.batch || 'N/A');
  drawRow('Department:', nominator.department || 'N/A', 'Mobile Number:', `+91 ${nominator.mobile}`);
  drawRow('Email Address:', nominator.email, '', '');
  y += 5;

  // Page Break or shifting down for signature details
  if (y > 230) {
    doc.addPage();
    doc.rect(5, 5, 200, 287);
    doc.rect(6, 6, 198, 285);
    y = 20;
  }

  // Declaration Section
  drawSectionHeader('5. Declaration & Signature');
  drawRow('Signee Name:', declaration.nomineeName, 'Place:', declaration.place);
  drawRow('Declaration Date:', declaration.date || new Date().toLocaleDateString(), '', '');
  
  y += 10;
  doc.setFont('Helvetica', 'bold');
  doc.text('Signature Verification:', 20, y);

  // Render Signature Image in PDF if available
  if (declaration.signature) {
    try {
      doc.addImage(declaration.signature, 'PNG', 20, y + 3, 50, 20);
    } catch (e) {
      console.error('Failed to embed signature into PDF:', e);
      doc.text('[Digital Signature Captured]', 20, y + 10);
    }
  } else {
    doc.text('Not Signed', 20, y + 10);
  }

  // Footer Branding Note
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This is an electronically generated acknowledgment copy for Notable Alumni Award Portal.', 105, 282, { align: 'center' });

  doc.save(`Nomination_Acknowledgement_${data.nominationId || 'Draft'}.pdf`);
};

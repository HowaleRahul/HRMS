import PDFDocument from 'pdfkit';

export const generatePayslipPDF = (payrollData, employeeData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text('Payslip', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Employee: ${employeeData.first_name} ${employeeData.last_name}`);
      doc.text(`Employee Code: ${employeeData.employee_code}`);
      doc.text(`Department: ${employeeData.department_name}`);
      doc.text(`Designation: ${employeeData.designation_name}`);
      doc.moveDown();

      doc.text(`Month/Year: ${payrollData.month}/${payrollData.year}`);
      doc.text(`Basic Salary: $${payrollData.basic_salary}`);
      doc.text(`Allowances: $${payrollData.allowances}`);
      doc.text(`Deductions: $${payrollData.deductions}`);
      doc.moveDown();
      
      doc.fontSize(14).text(`Net Salary: $${payrollData.net_salary}`, { underline: true });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateReportPDF = (title, headers, data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown();

      doc.fontSize(10);
      let y = doc.y;
      headers.forEach((header, i) => {
        doc.text(header, 50 + (i * 100), y);
      });
      doc.moveDown();

      data.forEach((row) => {
        y = doc.y;
        row.forEach((cell, i) => {
          doc.text(String(cell), 50 + (i * 100), y);
        });
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

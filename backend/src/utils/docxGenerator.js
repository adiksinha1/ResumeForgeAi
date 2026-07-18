import { generateHTMLContent } from './pdfGenerator.js';

export const generateDOCX = (resume) => {
  const htmlContent = generateHTMLContent(resume);

  // Wrap the HTML with Microsoft Word Schema Headers so MS Word opens it in Print Layout natively
  const docxContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${resume.personalInfo?.name || 'Resume'}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 8.5in 11.0in; /* Letter size */
          margin: 0.75in 0.75in 0.75in 0.75in;
          mso-header-margin: 0.5in;
          mso-footer-margin: 0.5in;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;

  return Buffer.from(docxContent, 'utf-8');
};

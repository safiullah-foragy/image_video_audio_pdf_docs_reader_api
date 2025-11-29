const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Extract text from PDF file
 * @param {string|Buffer} pdfSource - PDF file path or buffer
 * @returns {Promise<string>}
 */
async function extractTextFromPDF(pdfSource) {
  try {
    console.log('Starting PDF text extraction...');
    
    let buffer = pdfSource;
    if (typeof pdfSource === 'string') {
      buffer = await fs.readFile(pdfSource);
    }

    const data = await pdfParse(buffer);
    const text = data.text.trim();
    
    console.log(`Extracted ${text.length} characters from PDF (${data.numpages} pages)`);
    
    return text || 'No text found in PDF';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

module.exports = {
  extractTextFromPDF
};

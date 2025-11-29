const mammoth = require('mammoth');
const fs = require('fs').promises;

/**
 * Extract text from Word document (.doc, .docx)
 * @param {string|Buffer} docSource - Document file path or buffer
 * @returns {Promise<string>}
 */
async function extractTextFromDoc(docSource) {
  try {
    console.log('Starting DOC/DOCX text extraction...');
    
    let buffer = docSource;
    if (typeof docSource === 'string') {
      buffer = await fs.readFile(docSource);
    }

    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    
    if (result.messages.length > 0) {
      console.log('Conversion messages:', result.messages);
    }
    
    console.log(`Extracted ${text.length} characters from document`);
    
    return text || 'No text found in document';
  } catch (error) {
    console.error('Error extracting text from document:', error);
    throw new Error(`Document extraction failed: ${error.message}`);
  }
}

module.exports = {
  extractTextFromDoc
};

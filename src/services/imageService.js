const Tesseract = require('tesseract.js');
const fs = require('fs').promises;

/**
 * Extract text from image using OCR
 * @param {string|Buffer} imageSource - Image file path or buffer
 * @returns {Promise<string>}
 */
async function extractTextFromImage(imageSource) {
  try {
    console.log('Starting OCR text extraction...');
    
    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: info => {
        if (info.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
        }
      }
    });

    const text = result.data.text.trim();
    console.log(`Extracted ${text.length} characters from image`);
    
    return text || 'No text found in image';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`Image OCR failed: ${error.message}`);
  }
}

module.exports = {
  extractTextFromImage
};

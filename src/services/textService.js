const fs = require('fs').promises;

/**
 * Extract text from text file
 * @param {string|Buffer} textSource - Text file path or buffer
 * @returns {Promise<string>}
 */
async function extractTextFromTextFile(textSource) {
  try {
    console.log('Reading text file...');
    
    let text;
    if (typeof textSource === 'string') {
      text = await fs.readFile(textSource, 'utf-8');
    } else {
      text = textSource.toString('utf-8');
    }
    
    text = text.trim();
    console.log(`Read ${text.length} characters from text file`);
    
    return text || 'Empty text file';
  } catch (error) {
    console.error('Error reading text file:', error);
    throw new Error(`Text file reading failed: ${error.message}`);
  }
}

module.exports = {
  extractTextFromTextFile
};

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Download file from URL
 * @param {string} url - File URL
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} - Path to downloaded file
 */
async function downloadFile(url, outputPath) {
  try {
    console.log(`Downloading file from: ${url}`);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      timeout: 60000, // 60 seconds timeout
      maxContentLength: 500 * 1024 * 1024, // 500MB max
      maxBodyLength: 500 * 1024 * 1024
    });

    await fs.writeFile(outputPath, response.data);
    console.log(`File downloaded successfully to: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error downloading file:', error.message);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Get file extension from URL or content-type
 */
function getFileExtension(url, contentType) {
  // Try to get extension from URL
  const urlPath = new URL(url).pathname;
  const extFromUrl = path.extname(urlPath);
  if (extFromUrl) {
    return extFromUrl;
  }
  
  // Fallback to content-type
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt'
  };
  
  return mimeToExt[contentType] || '.bin';
}

/**
 * Detect file type from file path or buffer
 */
function detectFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
  const videoExts = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'];
  const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
  const docExts = ['.doc', '.docx'];
  const pdfExts = ['.pdf'];
  const textExts = ['.txt'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (docExts.includes(ext)) return 'doc';
  if (pdfExts.includes(ext)) return 'pdf';
  if (textExts.includes(ext)) return 'text';
  
  return 'unknown';
}

/**
 * Clean up temporary files
 */
async function cleanupFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
      console.log(`Cleaned up: ${filePath}`);
    } catch (error) {
      console.error(`Failed to cleanup ${filePath}:`, error.message);
    }
  }
}

/**
 * Validate file size
 */
function validateFileSize(size, maxSizeMB = 500) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (size > maxBytes) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
  return true;
}

module.exports = {
  downloadFile,
  getFileExtension,
  detectFileType,
  cleanupFiles,
  validateFileSize
};

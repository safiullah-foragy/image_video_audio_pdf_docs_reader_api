const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET || 'api-content';

// Supabase is optional - only needed for URL processing
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase storage enabled');
} else {
  console.log('⚠️  Supabase not configured - URL processing will skip cloud storage (file upload still works)');
}

/**
 * Upload file to Supabase storage
 * @param {Buffer|string} fileData - File buffer or file path
 * @param {string} fileName - Original file name
 * @returns {Promise<{path: string, url: string}>}
 */
async function uploadToSupabase(fileData, fileName) {
  if (!supabase) {
    throw new Error('Supabase not configured - skipping cloud storage');
  }
  
  try {
    // Generate unique file name
    const ext = path.extname(fileName);
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    
    // Read file if path is provided
    let buffer = fileData;
    if (typeof fileData === 'string') {
      buffer = await fs.readFile(fileData);
    }

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueName, buffer, {
        contentType: getContentType(ext),
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueName);

    return {
      path: data.path,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
}

/**
 * Download file from Supabase storage
 * @param {string} filePath - File path in Supabase storage
 * @returns {Promise<Buffer>}
 */
async function downloadFromSupabase(filePath) {
  if (!supabase) {
    throw new Error('Supabase not configured - cannot download from cloud storage');
  }
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Supabase download error: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
  } catch (error) {
    console.error('Error downloading from Supabase:', error);
    throw error;
  }
}

/**
 * Delete file from Supabase storage
 * @param {string} filePath - File path in Supabase storage
 */
async function deleteFromSupabase(filePath) {
  if (!supabase) {
    console.log('⚠️  Supabase not configured - skipping delete');
    return;
  }
  
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting from Supabase:', error.message);
    }
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(ext) {
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain'
  };
  return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
}

module.exports = {
  uploadToSupabase,
  downloadFromSupabase,
  deleteFromSupabase
};

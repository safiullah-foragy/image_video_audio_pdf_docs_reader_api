const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const { uploadToSupabase, downloadFromSupabase, deleteFromSupabase } = require('../utils/supabase');
const { downloadFile, detectFileType, cleanupFiles, validateFileSize } = require('../utils/fileUtils');
const { extractTextFromImage } = require('../services/imageService');
const { extractTextFromPDF } = require('../services/pdfService');
const { extractTextFromDoc } = require('../services/docService');
const { extractTextFromTextFile } = require('../services/textService');
const { processVideo } = require('../services/videoService');
const { processAudio } = require('../services/audioService');
const { generateExplanation } = require('../services/openaiService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = './uploads';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  }
});

/**
 * Main extraction endpoint
 * Supports both file upload and URL
 */
router.post('/extract', upload.single('file'), async (req, res) => {
  let localFilePath = null;
  let supabaseFilePath = null;
  const tempFiles = [];

  try {
    // Determine if input is file or URL
    let filePath;
    let fileType;
    let originalName;

    if (req.file) {
      // File upload
      filePath = req.file.path;
      fileType = detectFileType(filePath);
      originalName = req.file.originalname;
      tempFiles.push(filePath);
      
      console.log(`Processing uploaded file: ${originalName} (${fileType})`);
    } else if (req.body.url) {
      // URL download
      const url = req.body.url;
      console.log(`Processing URL: ${url}`);
      
      // Generate temp file path
      const tempFileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
      const tempDir = './temp';
      await fs.mkdir(tempDir, { recursive: true });
      
      // Download file
      const downloadedPath = path.join(tempDir, tempFileName);
      await downloadFile(url, downloadedPath);
      tempFiles.push(downloadedPath);
      
      // Detect file type
      fileType = detectFileType(downloadedPath);
      filePath = downloadedPath;
      originalName = path.basename(new URL(url).pathname) || 'downloaded-file';
      
      // Upload to Supabase
      console.log('Uploading to Supabase...');
      const uploadResult = await uploadToSupabase(filePath, originalName);
      supabaseFilePath = uploadResult.path;
      console.log(`Uploaded to Supabase: ${uploadResult.url}`);
      
      // Download from Supabase for processing
      const supabaseBuffer = await downloadFromSupabase(supabaseFilePath);
      const processFilePath = path.join(tempDir, `process-${tempFileName}`);
      await fs.writeFile(processFilePath, supabaseBuffer);
      filePath = processFilePath;
      tempFiles.push(processFilePath);
    } else {
      return res.status(400).json({
        error: 'No file or URL provided',
        usage: 'Send file as multipart/form-data with key "file" or JSON with {"url": "your-file-url"}'
      });
    }

    // Validate file type
    if (fileType === 'unknown') {
      throw new Error(`Unsupported file type: ${path.extname(filePath)}`);
    }

    // Extract text based on file type
    let extractedText;
    let metadata = {
      originalName,
      fileType,
      processedAt: new Date().toISOString()
    };

    switch (fileType) {
      case 'image':
        extractedText = await extractTextFromImage(filePath);
        break;
      
      case 'video':
        const videoResult = await processVideo(filePath);
        extractedText = videoResult.combinedText;
        metadata.audioText = videoResult.audioText;
        metadata.frameCount = videoResult.frameTexts.length;
        break;
      
      case 'audio':
        extractedText = await processAudio(filePath);
        break;
      
      case 'pdf':
        extractedText = await extractTextFromPDF(filePath);
        break;
      
      case 'doc':
        extractedText = await extractTextFromDoc(filePath);
        break;
      
      case 'text':
        extractedText = await extractTextFromTextFile(filePath);
        break;
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Generate AI explanation from extracted text
    console.log('Generating AI explanation...');
    const aiExplanation = await generateExplanation(extractedText, fileType, metadata);

    // Clean up files
    await cleanupFiles(tempFiles);
    
    // Delete from Supabase if uploaded
    if (supabaseFilePath) {
      await deleteFromSupabase(supabaseFilePath);
      console.log('Cleaned up Supabase storage');
    }

    // Return response
    res.json({
      success: true,
      extractedText: extractedText,
      aiExplanation: aiExplanation.explanation,
      summary: aiExplanation.summary,
      keyPoints: aiExplanation.keyPoints,
      metadata: {
        ...metadata,
        aiModel: aiExplanation.aiModel,
        tokensUsed: aiExplanation.tokensUsed
      }
    });

  } catch (error) {
    console.error('Extraction error:', error);
    
    // Clean up on error
    await cleanupFiles(tempFiles);
    if (supabaseFilePath) {
      await deleteFromSupabase(supabaseFilePath);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check for extraction service
 */
router.get('/extract/health', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      ocr: 'tesseract.js',
      video: 'ffmpeg',
      audio: 'ffmpeg',
      pdf: 'pdf-parse',
      doc: 'mammoth',
      storage: 'supabase'
    },
    note: 'Speech-to-text requires external API integration'
  });
});

module.exports = router;

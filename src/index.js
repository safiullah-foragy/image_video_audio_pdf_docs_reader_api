const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const extractionRoutes = require('./routes/extraction');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create temp directories if they don't exist
const ensureDirectories = async () => {
  const dirs = ['./temp', './uploads'];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Content to Text API with AI Explanation',
    version: '2.0.0',
    description: 'Extract text from any file type and get intelligent AI-powered explanations',
    endpoints: {
      '/api/extract': 'POST - Extract text from files or URLs and get AI explanation (supports image, video, audio, pdf, docs, txt)',
      '/health': 'GET - Health check'
    },
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'],
      video: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'],
      audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'],
      document: ['pdf', 'doc', 'docx', 'txt']
    },
    usage: {
      file: 'Send file as multipart/form-data with key "file"',
      url: 'Send JSON with {"url": "your-file-url"}'
    },
    aiFeatures: {
      explanation: 'Comprehensive AI analysis of extracted content',
      summary: 'Concise summary of key information',
      keyPoints: 'Bullet-point highlights of main takeaways'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', extractionRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  await ensureDirectories();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;

# Content to Text API with AI Explanation

A powerful Node.js API that extracts text from various file formats and provides intelligent AI-powered explanations using OpenAI. Supports images, videos, audio, PDFs, Word documents, and text files with both file uploads and URL-based processing.

## 📚 Documentation

- 🚀 **[Quick Start Guide](./QUICKSTART.md)** - Get started in 5 minutes
- 📖 **[Usage Examples](./EXAMPLES.md)** - Code examples in multiple languages
- 🏗️ **[Architecture](./ARCHITECTURE.md)** - System design and data flow
- 📋 **[Summary](./SUMMARY.md)** - Complete project overview

## 🚀 Features

- **Image to Text**: OCR extraction using Tesseract.js
- **Video to Text**: Extract audio transcription + OCR text from video frames
- **Audio to Text**: Audio processing with metadata (transcription requires external API)
- **PDF to Text**: Full text extraction from PDF documents
- **DOC/DOCX to Text**: Extract text from Word documents
- **Text Files**: Read and process .txt files
- **🤖 AI Explanation**: Intelligent content analysis using OpenAI GPT-4
- **📝 Auto Summary**: Concise summaries of extracted content
- **🎯 Key Points**: Bullet-point highlights of main takeaways
- **URL Support**: Download and process files from URLs
- **Supabase Integration**: Automatic temporary storage for URL-based files
- **Auto Cleanup**: Automatic deletion of temporary files after processing

## 📋 Supported Formats

| Type | Formats |
|------|---------|
| **Images** | jpg, jpeg, png, gif, bmp, tiff, webp |
| **Videos** | mp4, avi, mov, mkv, webm, flv |
| **Audio** | mp3, wav, ogg, m4a, flac, aac |
| **Documents** | pdf, doc, docx, txt |

## 🛠️ Installation

### Prerequisites

- Node.js 18 or higher
- FFmpeg installed on your system

#### Install FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd image_video_audio_pdf_docs_reader_api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
PORT=3000
SUPABASE_URL=https://nqydqpllowakssgfpevt.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_BUCKET=api-content
OPENAI_API_KEY=your_openai_api_key_here
```

**Get your OpenAI API Key:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

5. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Usage

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Extract Text from File Upload

**POST** `/api/extract`

Upload a file directly:

```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@/path/to/your/file.jpg"
```

#### 2. Extract Text from URL

**POST** `/api/extract`

Process a file from URL:

```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/file.pdf"}'
```

#### 3. Health Check

**GET** `/health`

```bash
curl http://localhost:3000/health
```

### Response Format

```json
{
  "success": true,
  "extractedText": "Raw extracted text content here...",
  "aiExplanation": "Comprehensive AI-generated explanation of the content, providing detailed analysis and insights about what the content means and its significance...",
  "summary": "A concise 2-3 sentence summary of the main points",
  "keyPoints": [
    "First key takeaway from the content",
    "Second important point",
    "Third main insight"
  ],
  "metadata": {
    "originalName": "document.pdf",
    "fileType": "pdf",
    "processedAt": "2025-11-30T12:00:00.000Z",
    "aiModel": "gpt-4-turbo-preview",
    "tokensUsed": 1250
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🎯 Examples

### Extract Text from Image with AI Explanation

```javascript
// Using JavaScript/Node.js
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('image.jpg'));

const response = await axios.post('http://localhost:3000/api/extract', form, {
  headers: form.getHeaders()
});

console.log('Extracted Text:', response.data.extractedText);
console.log('AI Explanation:', response.data.aiExplanation);
console.log('Summary:', response.data.summary);
console.log('Key Points:', response.data.keyPoints);
```

### Extract Text from Video URL with AI Analysis

```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/api/extract', {
  url: 'https://example.com/video.mp4'
});

console.log('AI Analysis:', response.data.aiExplanation);
console.log('Key Takeaways:', response.data.keyPoints);
```

### Using cURL with Image

```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@screenshot.png"
```

### Using cURL with PDF URL

```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/document.pdf"}'
```

## 🚀 Deployment to Render.com

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [Render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: content-to-text-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or paid tier

5. Add Environment Variables:
   - `SUPABASE_URL`: https://nqydqpllowakssgfpevt.supabase.co
   - `SUPABASE_ANON_KEY`: your_key
   - `SUPABASE_BUCKET`: api-content
   - `OPENAI_API_KEY`: your_openai_api_key

6. Click "Create Web Service"

### Important: Install FFmpeg on Render

Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "build": "apt-get update && apt-get install -y ffmpeg",
    "start": "node src/index.js"
  }
}
```

Or create a `render.yaml`:

```yaml
services:
  - type: web
    name: content-to-text-api
    env: node
    buildCommand: apt-get update && apt-get install -y ffmpeg && npm install
    startCommand: npm start
    envVars:
      - key: SUPABASE_URL
        value: https://nqydqpllowakssgfpevt.supabase.co
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_BUCKET
        value: api-content
      - key: OPENAI_API_KEY
        sync: false
```

## 📝 Notes

### AI-Powered Explanations

This API uses OpenAI GPT-4 to analyze extracted text and provide:
- **Comprehensive Explanations**: Detailed analysis of content meaning and context
- **Concise Summaries**: Quick overview in 2-3 sentences
- **Key Points**: Bullet-point highlights of main takeaways

The AI explanation feature processes all extracted text regardless of source (image, video, audio, PDF, etc.) and provides intelligent insights.

### Speech-to-Text Integration

Audio transcription requires an external API. Recommended services:

- **OpenAI Whisper API**: https://platform.openai.com/docs/guides/speech-to-text
- **Google Cloud Speech-to-Text**: https://cloud.google.com/speech-to-text
- **AssemblyAI**: https://www.assemblyai.com
- **AWS Transcribe**: https://aws.amazon.com/transcribe

To integrate, modify `src/services/audioService.js` and `src/services/videoService.js`.

### Video Processing

- Videos are processed by extracting frames (0.5 fps by default)
- Each frame is analyzed with OCR
- Audio is extracted but requires external API for transcription
- Processing time depends on video length and resolution

### File Size Limits

- Default: 500MB per file
- Adjust in `src/routes/extraction.js` if needed
- Consider Render's instance memory limits

## 🔧 Configuration

### Adjust Frame Extraction Rate

In `src/services/videoService.js`:

```javascript
// Extract 1 frame per second instead of 0.5
const framePaths = await extractFramesFromVideo(videoPath, 1.0);
```

### Change File Upload Limits

In `src/routes/extraction.js`:

```javascript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});
```

## 🐛 Troubleshooting

### FFmpeg not found

Install FFmpeg on your system (see Installation section)

### Supabase connection errors

Verify your credentials in `.env` file and ensure the bucket exists

### Out of memory errors

Reduce video frame extraction rate or file size limits

### OCR not working

Tesseract.js downloads language files on first use - ensure internet connection

## 📄 License

ISC

## 🤝 Contributing

Pull requests are welcome!

## 📧 Support

For issues and questions, please open a GitHub issue.

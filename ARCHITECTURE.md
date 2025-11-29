# API Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT REQUEST                              │
│                                                                      │
│  File Upload (multipart/form-data)  OR  URL (JSON)                 │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER (Port 3000)                      │
│                                                                      │
│  Routes:                                                             │
│  • GET  /           → API Documentation                             │
│  • GET  /health     → Health Check                                  │
│  • POST /api/extract → Main Processing Endpoint                     │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FILE HANDLER                                 │
│                                                                      │
│  IF URL:                        IF FILE UPLOAD:                     │
│  1. Download file               1. Save to /uploads                 │
│  2. Upload to Supabase          2. Process directly                 │
│  3. Download from Supabase                                          │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FILE TYPE DETECTION                             │
│                                                                      │
│  Analyze file extension and determine processing method             │
└────────────┬────────────┬──────────┬─────────┬──────────┬───────────┘
             │            │          │         │          │
             ▼            ▼          ▼         ▼          ▼
        ┌────────┐  ┌─────────┐ ┌──────┐ ┌──────┐  ┌─────────┐
        │ IMAGE  │  │  VIDEO  │ │ AUDIO│ │ PDF  │  │   DOC   │
        │ (.jpg, │  │ (.mp4,  │ │(.mp3,│ │(.pdf)│  │(.docx)  │
        │  .png) │  │  .mov)  │ │ .wav)│ │      │  │         │
        └───┬────┘  └────┬────┘ └───┬──┘ └───┬──┘  └────┬────┘
            │            │          │        │          │
            ▼            ▼          ▼        ▼          ▼
        ┌────────────────────────────────────────────────────┐
        │         TEXT EXTRACTION SERVICES                   │
        │                                                    │
        │  • imageService.js    (Tesseract OCR)            │
        │  • videoService.js    (FFmpeg + OCR frames)      │
        │  • audioService.js    (FFmpeg metadata)          │
        │  • pdfService.js      (pdf-parse)                │
        │  • docService.js      (mammoth)                  │
        │  • textService.js     (fs read)                  │
        └──────────────────────┬─────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   EXTRACTED TEXT     │
                    │  "Lorem ipsum..."    │
                    └──────────┬───────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │         OPENAI SERVICE (openaiService.js)    │
        │                                              │
        │  Send extracted text to OpenAI GPT-4 API    │
        │                                              │
        │  Prompt includes:                            │
        │  • File type context                         │
        │  • Request for explanation                   │
        │  • Request for summary                       │
        │  • Request for key points                    │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   OPENAI GPT-4 API   │
                    │   (External Service) │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │    AI RESPONSE           │
                    │  • Explanation           │
                    │  • Summary               │
                    │  • Key Points            │
                    └──────────┬───────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │              CLEANUP PROCESS                 │
        │                                              │
        │  • Delete temp files from /uploads           │
        │  • Delete files from Supabase (if URL)       │
        │  • Delete extracted frames (if video)        │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │            JSON RESPONSE TO CLIENT           │
        │                                              │
        │  {                                           │
        │    "success": true,                          │
        │    "extractedText": "...",                   │
        │    "aiExplanation": "...",                   │
        │    "summary": "...",                         │
        │    "keyPoints": [...],                       │
        │    "metadata": {...}                         │
        │  }                                           │
        └──────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════

                    EXTERNAL SERVICES

┌──────────────────────┐    ┌─────────────────────┐
│   SUPABASE STORAGE   │    │    OPENAI API       │
│                      │    │                     │
│  • Temporary file    │    │  • GPT-4 Turbo      │
│    storage for URLs  │    │  • Text analysis    │
│  • Auto deletion     │    │  • Explanation      │
│    after processing  │    │    generation       │
└──────────────────────┘    └─────────────────────┘

═══════════════════════════════════════════════════════════════

                    DATA FLOW EXAMPLE

User uploads image.jpg with text "Invoice #12345"
                    │
                    ▼
Server receives file → Saves to /uploads/temp-hash.jpg
                    │
                    ▼
imageService extracts text using Tesseract OCR
    Result: "Invoice #12345\nTotal: $500\nDate: 2025-11-30"
                    │
                    ▼
openaiService sends to GPT-4:
    "Analyze this invoice text and explain..."
                    │
                    ▼
GPT-4 returns:
    Explanation: "This is a financial invoice document..."
    Summary: "Invoice #12345 for $500 dated November 30, 2025"
    Key Points: ["Invoice number: 12345", "Amount: $500", ...]
                    │
                    ▼
Server cleans up /uploads/temp-hash.jpg
                    │
                    ▼
Returns complete JSON response to user

═══════════════════════════════════════════════════════════════

                    VIDEO PROCESSING FLOW

User provides video URL
                    │
                    ▼
Download video → Upload to Supabase → Download for processing
                    │
                    ▼
FFmpeg extracts frames (0.5 fps) → Saves to /temp/frames/
    frame-0001.jpg, frame-0002.jpg, frame-0003.jpg...
                    │
                    ▼
Each frame processed with OCR (Tesseract)
    Frame 1: "Welcome to our product"
    Frame 2: "Step 1: Install"
    Frame 3: "Step 2: Configure"
                    │
                    ▼
FFmpeg extracts audio → Saved as temp.mp3
    (Note: Transcription needs external API)
                    │
                    ▼
Combine all extracted text:
    "Video Content:
     Frame 1: Welcome to our product
     Frame 2: Step 1: Install
     Frame 3: Step 2: Configure
     Audio: [Transcription placeholder]"
                    │
                    ▼
Send combined text to OpenAI GPT-4
                    │
                    ▼
GPT-4 analyzes entire video content
                    │
                    ▼
Clean up: frames/, temp.mp3, Supabase file
                    │
                    ▼
Return comprehensive analysis to user

═══════════════════════════════════════════════════════════════
```

## Key Components

### 1. Entry Points
- **File Upload**: Multipart form data with file
- **URL Processing**: JSON with URL string

### 2. Processing Services
- **Image**: Tesseract.js OCR
- **Video**: FFmpeg (frames + audio) + Tesseract OCR
- **Audio**: FFmpeg metadata extraction
- **PDF**: pdf-parse library
- **Doc/Docx**: mammoth library
- **Text**: Node.js fs module

### 3. AI Enhancement
- **OpenAI Service**: Sends extracted text to GPT-4
- **Response**: Structured explanation, summary, key points

### 4. Storage
- **Temporary**: Local /uploads and /temp folders
- **Cloud**: Supabase for URL-based files
- **Cleanup**: Automatic deletion after processing

### 5. Response Format
```json
{
  "success": boolean,
  "extractedText": string,
  "aiExplanation": string,
  "summary": string,
  "keyPoints": string[],
  "metadata": {
    "originalName": string,
    "fileType": string,
    "processedAt": timestamp,
    "aiModel": string,
    "tokensUsed": number
  }
}
```

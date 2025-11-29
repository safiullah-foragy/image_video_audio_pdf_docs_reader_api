# 🚀 Quick Start Guide

## Setup in 5 Minutes

### 1. Get Your OpenAI API Key

1. Go to https://platform.openai.com
2. Sign up or log in
3. Click on your profile → "API keys"
4. Create new secret key
5. Copy the key (starts with `sk-...`)

### 2. Install Dependencies

```bash
# Make sure you have Node.js 18+ and FFmpeg installed
node --version  # Should be 18 or higher
ffmpeg -version # Should show FFmpeg version

# Install project dependencies
npm install
```

### 3. Configure Environment

Edit the `.env` file and add your OpenAI API key:

```bash
PORT=3000
SUPABASE_URL=https://nqydqpllowakssgfpevt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xeWRxcGxsb3dha3NzZ2ZwZXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTE2NTIsImV4cCI6MjA3MTI4NzY1Mn0.ngqmcjL5JG_bjTPuIPEvU3iExGhvcbYKyOJsBa5P6E0
SUPABASE_BUCKET=api-content
OPENAI_API_KEY=sk-your-key-here  # ← ADD YOUR KEY HERE
```

### 4. Start the Server

```bash
npm start
```

You should see:
```
🚀 Server running on port 3000
📝 API Documentation: http://localhost:3000
```

### 5. Test It!

Open another terminal and test with a simple text file:

```bash
# Create a test file
echo "Hello World! This is a test message." > test.txt

# Test the API
curl -X POST http://localhost:3000/api/extract -F "file=@test.txt"
```

## First Real Test

### Test with an Image URL

```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800"
  }'
```

### Test with Your Own File

```bash
# Upload any file (image, PDF, video, etc.)
curl -X POST http://localhost:3000/api/extract \
  -F "file=@/path/to/your/file.pdf"
```

## Expected Response

```json
{
  "success": true,
  "extractedText": "The raw text extracted from your file...",
  "aiExplanation": "Intelligent explanation of the content...",
  "summary": "Quick summary in 2-3 sentences",
  "keyPoints": [
    "First key point",
    "Second key point",
    "Third key point"
  ],
  "metadata": {
    "originalName": "file.pdf",
    "fileType": "pdf",
    "processedAt": "2025-11-30T12:00:00.000Z",
    "aiModel": "gpt-4-turbo-preview",
    "tokensUsed": 500
  }
}
```

## Common Issues

### Issue: "OpenAI API key not configured"
**Solution**: Make sure you added `OPENAI_API_KEY` to your `.env` file

### Issue: "FFmpeg not found"
**Solution**: Install FFmpeg:
- Ubuntu: `sudo apt install ffmpeg`
- macOS: `brew install ffmpeg`
- Windows: Download from https://ffmpeg.org

### Issue: Port 3000 already in use
**Solution**: Change port in `.env`:
```bash
PORT=8080
```

### Issue: File upload fails
**Solution**: Check file size (max 500MB) and format is supported

## Next Steps

1. ✅ API is running locally
2. 📖 Read [EXAMPLES.md](./EXAMPLES.md) for more usage examples
3. 🚀 Deploy to Render.com (see [README.md](./README.md))
4. 🔧 Customize frame extraction rate, file size limits, etc.

## Development Mode

For auto-restart on file changes:

```bash
npm run dev
```

## Testing

Run the test suite:

```bash
# Basic test
npm test

# Test with a file
node test-api.js /path/to/test-file.jpg

# Test with a file and URL
node test-api.js /path/to/test-file.pdf https://example.com/image.png
```

## API Endpoints

- `GET /` - API documentation
- `GET /health` - Health check
- `POST /api/extract` - Extract text and get AI explanation
  - With file: Send as `multipart/form-data` with key `file`
  - With URL: Send JSON `{"url": "https://..."}`

## Monitoring Usage

Check OpenAI usage in the response:
```json
{
  "metadata": {
    "aiModel": "gpt-4-turbo-preview",
    "tokensUsed": 500  // ← Monitor this for costs
  }
}
```

Approximate costs (as of 2025):
- GPT-4 Turbo: ~$0.01 per 1K tokens input, ~$0.03 per 1K tokens output
- Average request: 500-2000 tokens (~$0.01-$0.05 per request)

## Need Help?

1. Check the [README.md](./README.md) for full documentation
2. See [EXAMPLES.md](./EXAMPLES.md) for code examples
3. Open an issue on GitHub

---

**You're ready! 🎉**

Your API is now extracting text from any file type and generating intelligent AI explanations!

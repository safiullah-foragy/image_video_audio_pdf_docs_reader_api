# API Usage Examples with AI Explanation

## Example 1: Upload an Image and Get AI Analysis

### Using cURL
```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@screenshot.png"
```

### Response:
```json
{
  "success": true,
  "extractedText": "Welcome to our platform! Sign up today and get 20% off your first purchase. Use code: WELCOME20",
  "aiExplanation": "This appears to be a promotional message from a commercial platform or service. The content is designed as a call-to-action marketing material aimed at new users. It combines a welcoming message with an incentive-based offer to encourage immediate sign-up and first-time purchase behavior. The promotional code 'WELCOME20' suggests a 20% discount mechanism, which is a common customer acquisition strategy in e-commerce and digital services. This type of messaging is typically found in website banners, email campaigns, or social media advertisements.",
  "summary": "A marketing welcome message offering new users a 20% discount on their first purchase using the promotional code WELCOME20.",
  "keyPoints": [
    "Welcome/onboarding message for new platform users",
    "20% discount incentive for first purchase",
    "Promotional code: WELCOME20",
    "Call-to-action focused on immediate sign-up"
  ],
  "metadata": {
    "originalName": "screenshot.png",
    "fileType": "image",
    "processedAt": "2025-11-30T15:30:00.000Z",
    "aiModel": "gpt-4-turbo-preview",
    "tokensUsed": 245
  }
}
```

## Example 2: Process PDF from URL

### Using cURL
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/research-paper.pdf"}'
```

### Using JavaScript
```javascript
const axios = require('axios');

async function analyzePDF() {
  const response = await axios.post('http://localhost:3000/api/extract', {
    url: 'https://example.com/research-paper.pdf'
  });
  
  console.log('\n=== AI ANALYSIS ===');
  console.log(response.data.aiExplanation);
  
  console.log('\n=== SUMMARY ===');
  console.log(response.data.summary);
  
  console.log('\n=== KEY POINTS ===');
  response.data.keyPoints.forEach((point, i) => {
    console.log(`${i + 1}. ${point}`);
  });
}

analyzePDF();
```

## Example 3: Process Video and Get Comprehensive Analysis

### Using Python
```python
import requests

url = "http://localhost:3000/api/extract"

# Upload video file
with open('tutorial_video.mp4', 'rb') as f:
    files = {'file': f}
    response = requests.post(url, files=files)
    data = response.json()

if data['success']:
    print("=== AI EXPLANATION ===")
    print(data['aiExplanation'])
    print("\n=== SUMMARY ===")
    print(data['summary'])
    print("\n=== KEY POINTS ===")
    for point in data['keyPoints']:
        print(f"• {point}")
    
    print(f"\nProcessed {data['metadata'].get('frameCount', 0)} video frames")
    print(f"Tokens used: {data['metadata'].get('tokensUsed', 0)}")
```

## Example 4: Process Word Document

### Using Node.js with Fetch
```javascript
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function processDocument() {
  const form = new FormData();
  form.append('file', fs.createReadStream('report.docx'));

  const response = await fetch('http://localhost:3000/api/extract', {
    method: 'POST',
    body: form
  });

  const data = await response.json();

  if (data.success) {
    return {
      text: data.extractedText,
      analysis: data.aiExplanation,
      summary: data.summary,
      keyPoints: data.keyPoints
    };
  }
}

processDocument().then(result => {
  console.log('Document Analysis:', result);
});
```

## Example 5: Batch Processing Multiple Files

### Using Node.js
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function processFile(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await axios.post('http://localhost:3000/api/extract', form, {
    headers: form.getHeaders()
  });

  return {
    fileName: path.basename(filePath),
    ...response.data
  };
}

async function batchProcess(files) {
  console.log(`Processing ${files.length} files...`);
  
  const results = [];
  for (const file of files) {
    try {
      console.log(`Processing: ${file}`);
      const result = await processFile(file);
      results.push(result);
      console.log(`✓ Completed: ${file}`);
    } catch (error) {
      console.error(`✗ Failed: ${file}`, error.message);
    }
  }
  
  return results;
}

// Process multiple files
const filesToProcess = [
  './documents/report.pdf',
  './images/chart.png',
  './videos/demo.mp4'
];

batchProcess(filesToProcess).then(results => {
  results.forEach(result => {
    console.log(`\n=== ${result.fileName} ===`);
    console.log('Summary:', result.summary);
    console.log('Key Points:', result.keyPoints);
  });
});
```

## Example 6: Error Handling

### Robust Implementation
```javascript
const axios = require('axios');

async function extractWithErrorHandling(fileUrl) {
  try {
    const response = await axios.post('http://localhost:3000/api/extract', {
      url: fileUrl
    }, {
      timeout: 120000 // 2 minutes timeout
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Unknown error'
      };
    }
  } catch (error) {
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        error: error.response.data.error || 'Server error',
        status: error.response.status
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        error: 'No response from server'
      };
    } else {
      // Error setting up request
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Usage
extractWithErrorHandling('https://example.com/document.pdf')
  .then(result => {
    if (result.success) {
      console.log('AI Explanation:', result.data.aiExplanation);
    } else {
      console.error('Error:', result.error);
    }
  });
```

## Response Structure

All successful responses follow this structure:

```typescript
{
  success: boolean;
  extractedText: string;           // Raw text extracted from file
  aiExplanation: string;           // Detailed AI analysis
  summary: string;                 // Concise summary (2-3 sentences)
  keyPoints: string[];             // Array of main takeaways
  metadata: {
    originalName: string;          // Original file name
    fileType: string;              // Type: image, video, audio, pdf, doc, text
    processedAt: string;           // ISO timestamp
    aiModel: string;               // OpenAI model used
    tokensUsed: number;            // Total tokens consumed
    frameCount?: number;           // (Video only) Number of frames processed
    audioText?: string;            // (Video only) Audio transcription status
  }
}
```

## Tips for Best Results

1. **Large Files**: For videos or large PDFs, allow sufficient timeout (2-5 minutes)
2. **Image Quality**: Higher resolution images produce better OCR results
3. **Video Processing**: Videos extract frames every 0.5 seconds by default
4. **API Costs**: Monitor OpenAI token usage in responses
5. **Rate Limits**: Be aware of OpenAI API rate limits for your account tier

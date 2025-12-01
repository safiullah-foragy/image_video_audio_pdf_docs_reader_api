// Test script to verify live API with OpenAI model fix
const https = require('https');
const fs = require('fs');

const API_URL = 'https://image-video-audio-pdf-docs-reader-api-1.onrender.com/api/extract';

// Simple text file content for testing
const testText = 'This is a test document. It contains information about AI and machine learning.';

async function testLiveAPI() {
  console.log('🧪 Testing live Render API with text content...\n');
  
  // Create boundary for multipart/form-data
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  
  // Build multipart form data
  let body = '';
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n';
  body += 'Content-Type: text/plain\r\n\r\n';
  body += testText + '\r\n';
  body += `--${boundary}--\r\n`;
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(body)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(API_URL, options, (res) => {
      let data = '';
      
      console.log(`📡 Response Status: ${res.statusCode}\n`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          console.log('✅ API Response:');
          console.log('─────────────────────────────────────────');
          console.log('Success:', response.success);
          console.log('Extracted Text:', response.extractedText?.substring(0, 100) + '...');
          console.log('\n📝 AI Explanation:', response.aiExplanation?.substring(0, 200) + '...');
          console.log('\n📊 Summary:', response.summary);
          console.log('\n🔑 Key Points:', response.keyPoints);
          console.log('\n⚙️  Metadata:', JSON.stringify(response.metadata, null, 2));
          console.log('─────────────────────────────────────────\n');
          
          // Check if it contains "unavailable"
          if (response.aiExplanation && response.aiExplanation.includes('unavailable')) {
            console.log('❌ ERROR: AI explanation still shows "unavailable"!');
            console.log('This means the OpenAI API call is still failing.\n');
          } else if (response.aiExplanation && response.aiExplanation.length > 50) {
            console.log('✅ SUCCESS: AI explanation generated successfully!');
            console.log('The gpt-4o-mini model is working correctly.\n');
          }
          
          resolve(response);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });
    
    req.write(body);
    req.end();
  });
}

// Run test
testLiveAPI()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

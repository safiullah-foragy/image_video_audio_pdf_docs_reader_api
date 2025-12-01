#!/usr/bin/env node

/**
 * Direct test to check if OpenAI API key is working
 */

const https = require('https');

console.log('🔍 Testing OpenAI API Configuration...\n');

// Test with a simple text extraction request
const testData = JSON.stringify({
  text: "Hello, this is a test message to verify AI is working."
});

const options = {
  hostname: 'image-video-audio-pdf-docs-reader-api-1.onrender.com',
  port: 443,
  path: '/api/extract',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  },
  timeout: 60000 // 60 seconds timeout
};

console.log('📤 Sending test request...');
console.log('   URL: https://image-video-audio-pdf-docs-reader-api-1.onrender.com/api/extract');
console.log('   Payload: Simple text for AI analysis\n');

const req = https.request(options, (res) => {
  let data = '';
  
  console.log(`📡 Response Status: ${res.statusCode}\n`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      console.log('📋 Response Analysis:\n');
      
      // Check for OpenAI configuration error
      if (response.error && response.error.includes('OpenAI')) {
        console.log('❌ OpenAI API Key Issue Detected!');
        console.log(`   Error: ${response.error}\n`);
        console.log('🔧 Solution:');
        console.log('   1. Go to: https://dashboard.render.com/');
        console.log('   2. Select: image-video-audio-pdf-docs-reader-api-1');
        console.log('   3. Click: Environment (left sidebar)');
        console.log('   4. Verify: OPENAI_API_KEY exists and has value');
        console.log('   5. If missing, add it and save');
        console.log('   6. Wait 2-3 minutes for redeployment');
        console.log('   7. Check Events tab for "Deploy live" status\n');
      }
      // Check for success with AI analysis
      else if (response.aiAnalysis || response.explanation) {
        console.log('✅ SUCCESS! OpenAI API is properly configured!');
        console.log('   AI Explanation is working correctly.\n');
        if (response.explanation) {
          console.log('📝 Sample AI Response:');
          console.log(`   ${response.explanation.substring(0, 150)}...\n`);
        }
      }
      // Check if text was extracted but no AI
      else if (response.extractedText) {
        console.log('⚠️  Partial Success:');
        console.log('   ✅ Text extraction works');
        console.log('   ❌ AI analysis not present\n');
        console.log('Response:', JSON.stringify(response, null, 2).substring(0, 500));
      }
      // Unexpected response
      else {
        console.log('⚠️  Unexpected Response:');
        console.log(JSON.stringify(response, null, 2).substring(0, 500));
        console.log('\n');
      }
      
    } catch (e) {
      console.log('❌ Error parsing response:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request Error:', error.message);
});

req.on('timeout', () => {
  console.log('⏱️  Request timeout - API might be cold starting or busy');
  req.destroy();
});

req.write(testData);
req.end();

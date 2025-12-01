#!/usr/bin/env node

/**
 * Test script to verify API configuration
 * Run: node test-configuration.js
 */

const https = require('https');

const API_URL = 'https://image-video-audio-pdf-docs-reader-api-1.onrender.com';

console.log('🔍 Testing API Configuration...\n');

// Test 1: Health Check
function testHealth() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Testing health endpoint...');
    https.get(`${API_URL}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status === 'ok') {
            console.log('   ✅ API is running');
            console.log(`   📅 Timestamp: ${parsed.timestamp}\n`);
            resolve(true);
          } else {
            console.log('   ❌ Unexpected response:', parsed, '\n');
            resolve(false);
          }
        } catch (e) {
          console.log('   ❌ Failed to parse response\n');
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('   ❌ Connection error:', err.message, '\n');
      resolve(false);
    });
  });
}

// Test 2: API Root
function testRoot() {
  return new Promise((resolve, reject) => {
    console.log('2️⃣ Testing root endpoint...');
    https.get(API_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.message && parsed.version) {
            console.log(`   ✅ API Version: ${parsed.version}`);
            console.log(`   📝 ${parsed.message}\n`);
            resolve(true);
          } else {
            console.log('   ❌ Unexpected response format\n');
            resolve(false);
          }
        } catch (e) {
          console.log('   ❌ Failed to parse response\n');
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('   ❌ Connection error:', err.message, '\n');
      resolve(false);
    });
  });
}

// Test 3: Check if OpenAI is configured (by testing with a simple text)
function testOpenAI() {
  return new Promise((resolve, reject) => {
    console.log('3️⃣ Testing OpenAI configuration...');
    
    const postData = JSON.stringify({
      url: 'https://via.placeholder.com/150/0000FF/808080?text=Test'
    });

    const options = {
      hostname: 'image-video-audio-pdf-docs-reader-api-1.onrender.com',
      port: 443,
      path: '/api/extract',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          if (parsed.error && parsed.error.includes('OpenAI API')) {
            console.log('   ❌ OpenAI API key is NOT configured');
            console.log('   💡 Solution: Add OPENAI_API_KEY to Render.com environment variables\n');
            resolve(false);
          } else if (parsed.aiAnalysis || parsed.explanation) {
            console.log('   ✅ OpenAI API is properly configured');
            console.log('   🤖 AI explanation feature is working\n');
            resolve(true);
          } else if (parsed.extractedText) {
            console.log('   ⚠️  Text extraction works, but checking AI...');
            if (parsed.error) {
              console.log('   ❌ OpenAI error:', parsed.error);
              console.log('   💡 Add OPENAI_API_KEY to Render.com\n');
              resolve(false);
            } else {
              console.log('   ⚠️  Unclear status\n');
              resolve(false);
            }
          } else {
            console.log('   ❌ Unexpected response:', JSON.stringify(parsed).substring(0, 200));
            console.log('\n');
            resolve(false);
          }
        } catch (e) {
          console.log('   ❌ Failed to parse response:', e.message, '\n');
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('   ❌ Request error:', err.message, '\n');
      resolve(false);
    });

    req.write(postData);
    req.end();

    // Timeout after 30 seconds (Render cold starts can be slow)
    setTimeout(() => {
      console.log('   ⏱️  Request timeout (API might be warming up)\n');
      resolve(false);
    }, 30000);
  });
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════\n');
  
  const healthResult = await testHealth();
  const rootResult = await testRoot();
  const openaiResult = await testOpenAI();
  
  console.log('═══════════════════════════════════════════');
  console.log('📊 Test Results Summary:\n');
  console.log(`   API Health: ${healthResult ? '✅' : '❌'}`);
  console.log(`   API Documentation: ${rootResult ? '✅' : '❌'}`);
  console.log(`   OpenAI Configuration: ${openaiResult ? '✅' : '❌'}`);
  console.log('\n═══════════════════════════════════════════\n');
  
  if (healthResult && rootResult && openaiResult) {
    console.log('🎉 All tests passed! Your API is fully configured.\n');
  } else if (!openaiResult) {
    console.log('⚠️  Action Required:\n');
    console.log('1. Go to Render.com dashboard');
    console.log('2. Select your service: content-to-text-api');
    console.log('3. Click "Environment" in the sidebar');
    console.log('4. Add: OPENAI_API_KEY = sk-...(your key)');
    console.log('5. Save and wait for redeployment\n');
    console.log('Get your OpenAI key from: https://platform.openai.com/api-keys\n');
  } else {
    console.log('❌ API is not responding properly. Check Render.com logs.\n');
  }
}

runTests();

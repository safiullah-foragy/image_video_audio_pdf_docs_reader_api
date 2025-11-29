const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testHealthCheck() {
  console.log(`\n${colors.blue}=== Testing Health Check ===${colors.reset}`);
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log(`${colors.green}✓ Health check passed${colors.reset}`);
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Health check failed: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testFileUpload(filePath) {
  console.log(`\n${colors.blue}=== Testing File Upload ===${colors.reset}`);
  console.log(`File: ${filePath}`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}⚠ File not found, skipping...${colors.reset}`);
      return false;
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(`${API_URL}/api/extract`, form, {
      headers: form.getHeaders(),
      timeout: 120000
    });

    if (response.data.success) {
      console.log(`${colors.green}✓ File processed successfully${colors.reset}`);
      console.log(`\n${colors.yellow}Extracted Text (first 200 chars):${colors.reset}`);
      console.log(response.data.extractedText.substring(0, 200) + '...');
      
      console.log(`\n${colors.yellow}AI Explanation:${colors.reset}`);
      console.log(response.data.aiExplanation);
      
      console.log(`\n${colors.yellow}Summary:${colors.reset}`);
      console.log(response.data.summary);
      
      console.log(`\n${colors.yellow}Key Points:${colors.reset}`);
      response.data.keyPoints.forEach((point, i) => {
        console.log(`${i + 1}. ${point}`);
      });
      
      console.log(`\n${colors.yellow}Metadata:${colors.reset}`);
      console.log(`- File Type: ${response.data.metadata.fileType}`);
      console.log(`- AI Model: ${response.data.metadata.aiModel}`);
      console.log(`- Tokens Used: ${response.data.metadata.tokensUsed}`);
      
      return true;
    } else {
      console.log(`${colors.red}✗ Processing failed${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Upload failed: ${error.message}${colors.reset}`);
    if (error.response) {
      console.log('Error details:', error.response.data);
    }
    return false;
  }
}

async function testURLProcessing(url) {
  console.log(`\n${colors.blue}=== Testing URL Processing ===${colors.reset}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await axios.post(`${API_URL}/api/extract`, {
      url: url
    }, {
      timeout: 120000
    });

    if (response.data.success) {
      console.log(`${colors.green}✓ URL processed successfully${colors.reset}`);
      console.log(`\n${colors.yellow}AI Summary:${colors.reset}`);
      console.log(response.data.summary);
      
      console.log(`\n${colors.yellow}Key Points:${colors.reset}`);
      response.data.keyPoints.forEach((point, i) => {
        console.log(`${i + 1}. ${point}`);
      });
      
      return true;
    } else {
      console.log(`${colors.red}✗ Processing failed${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ URL processing failed: ${error.message}${colors.reset}`);
    if (error.response) {
      console.log('Error details:', error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log(`${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Content to Text API - Test Suite    ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nAPI URL: ${API_URL}`);

  const results = {
    passed: 0,
    failed: 0
  };

  // Test 1: Health Check
  const healthCheck = await testHealthCheck();
  if (healthCheck) results.passed++; else results.failed++;

  // Test 2: File Upload (provide your own test file)
  const testFile = process.argv[2];
  if (testFile) {
    const fileTest = await testFileUpload(testFile);
    if (fileTest) results.passed++; else results.failed++;
  } else {
    console.log(`\n${colors.yellow}⚠ No test file provided. Usage: node test-api.js <file-path>${colors.reset}`);
  }

  // Test 3: URL Processing (example)
  const testUrl = process.argv[3];
  if (testUrl) {
    const urlTest = await testURLProcessing(testUrl);
    if (urlTest) results.passed++; else results.failed++;
  }

  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}           TEST SUMMARY${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (results.failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Some tests failed. Please check the logs above.${colors.reset}\n`);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});

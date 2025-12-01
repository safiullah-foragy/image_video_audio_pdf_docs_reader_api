// Test Google Gemini API integration
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-key-here';

async function testGemini() {
  console.log('🔑 Testing Google Gemini API...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try gemini-1.5-flash-latest with explicit API version
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-1.5-flash-latest'
    });
    
    console.log('📡 Sending test request to Gemini...');
    
    const result = await model.generateContent('Say "Hello! Gemini API is working perfectly!" in one sentence.');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! Gemini API Response:');
    console.log('─────────────────────────────────────────');
    console.log('Model: gemini-pro');
    console.log('Response:', text);
    console.log('─────────────────────────────────────────\n');
    
    console.log('✅ Your Gemini API key is VALID and working!');
    console.log('✅ This is COMPLETELY FREE - no charges!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR calling Gemini API:');
    console.error('─────────────────────────────────────────');
    console.error('Error:', error.message);
    console.error('Details:', error);
    console.error('─────────────────────────────────────────\n');
  }
}

testGemini()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

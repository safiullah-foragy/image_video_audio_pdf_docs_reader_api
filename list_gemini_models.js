// List available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyCncwxHA0R5PaFiRC8wIhyF3pbf47tmi78';

async function listModels() {
  console.log('🔍 Listing available Gemini models...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try different model names
    const modelsToTry = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest', 
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-1.0-pro'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        console.log(`✅ ${modelName} WORKS!`);
        console.log(`   Response: ${response.text().substring(0, 50)}...\n`);
        return modelName;
      } catch (err) {
        console.log(`❌ ${modelName} failed: ${err.message.substring(0, 100)}...\n`);
      }
    }
    
    console.log('❌ No working models found!');
    console.log('\n📝 Your API key might not have the Generative Language API enabled.');
    console.log('Please enable it at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

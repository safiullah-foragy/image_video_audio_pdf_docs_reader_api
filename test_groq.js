// Test Groq API (FREE AI - no credit card needed!)
const Groq = require('groq-sdk');

// You'll replace this with your actual key
const API_KEY = process.env.GROQ_API_KEY || 'your-groq-key-here';

async function testGroq() {
  console.log('🔑 Testing Groq AI API (100% FREE)...\n');
  
  try {
    const groq = new Groq({ apiKey: API_KEY });
    
    console.log('📡 Sending test request to Groq...');
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Say "Hello! Groq AI is working perfectly!" in one sentence.'
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });
    
    console.log('\n✅ SUCCESS! Groq API Response:');
    console.log('─────────────────────────────────────────');
    console.log('Model:', completion.model);
    console.log('Response:', completion.choices[0].message.content);
    console.log('Tokens used:', completion.usage.total_tokens);
    console.log('─────────────────────────────────────────\n');
    
    console.log('✅ Your Groq API key is VALID and working!');
    console.log('✅ This is COMPLETELY FREE - No charges ever!');
    console.log('✅ Free tier: 30 requests/minute, 14,400/day\n');
    
  } catch (error) {
    console.error('\n❌ ERROR calling Groq API:');
    console.error('─────────────────────────────────────────');
    console.error('Error:', error.message);
    if (error.status === 401) {
      console.log('\n❌ Invalid API key. Please:');
      console.log('1. Go to https://console.groq.com/keys');
      console.log('2. Create a new API key');
      console.log('3. Replace YOUR_GROQ_API_KEY_HERE in this file\n');
    }
    console.error('─────────────────────────────────────────\n');
  }
}

testGroq()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

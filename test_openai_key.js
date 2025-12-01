// Direct test of OpenAI API key
const OpenAI = require('openai');

const API_KEY = process.env.OPENAI_API_KEY || 'your-openai-key-here';

async function testOpenAIKey() {
  console.log('🔑 Testing OpenAI API key...\n');
  
  try {
    const openai = new OpenAI({ apiKey: API_KEY });
    
    console.log('📡 Sending test request to OpenAI with gpt-4o-mini...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Say "Hello, the API key works!" in one sentence.'
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });
    
    console.log('\n✅ SUCCESS! OpenAI API Response:');
    console.log('─────────────────────────────────────────');
    console.log('Model:', completion.model);
    console.log('Response:', completion.choices[0].message.content);
    console.log('Tokens used:', completion.usage.total_tokens);
    console.log('─────────────────────────────────────────\n');
    
    console.log('✅ Your API key is VALID and working correctly!');
    console.log('The issue must be with Render environment configuration.\n');
    
  } catch (error) {
    console.error('\n❌ ERROR calling OpenAI API:');
    console.error('─────────────────────────────────────────');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Status Code:', error.status);
    console.error('Error Details:', error);
    console.error('─────────────────────────────────────────\n');
    
    if (error.status === 401) {
      console.log('❌ API key is INVALID or EXPIRED');
      console.log('Please generate a new key at: https://platform.openai.com/api-keys\n');
    } else if (error.status === 429) {
      console.log('⚠️  Rate limit exceeded or quota reached');
      console.log('Check your OpenAI billing: https://platform.openai.com/account/billing\n');
    } else if (error.status === 404) {
      console.log('❌ Model "gpt-4o-mini" not found');
      console.log('This should not happen - the model exists!\n');
    } else {
      console.log('❌ Unexpected error - check your network/firewall\n');
    }
  }
}

testOpenAIKey()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

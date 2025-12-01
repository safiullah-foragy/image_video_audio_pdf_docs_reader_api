const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate intelligent explanation from extracted text using OpenAI
 * @param {string} extractedText - The raw extracted text from any file type
 * @param {string} fileType - Type of file (image, video, audio, pdf, doc, text)
 * @param {Object} metadata - Additional metadata about the file
 * @returns {Promise<{explanation: string, summary: string, keyPoints: string[]}>}
 */
async function generateExplanation(extractedText, fileType, metadata = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating AI explanation for extracted content...');

    // Create a context-aware prompt based on file type
    const prompt = buildPrompt(extractedText, fileType, metadata);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Updated to current model (cheaper and faster)
      messages: [
        {
          role: 'system',
          content: 'You are an expert content analyzer. Your job is to read extracted text from various sources (images, videos, PDFs, documents, etc.) and provide comprehensive, intelligent explanations. Focus on clarity, key insights, and actionable information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const aiResponse = completion.choices[0].message.content;

    // Parse the response to extract structured information
    const parsed = parseAIResponse(aiResponse);

    console.log('AI explanation generated successfully');

    return {
      explanation: parsed.explanation || aiResponse,
      summary: parsed.summary || '',
      keyPoints: parsed.keyPoints || [],
      rawText: extractedText,
      aiModel: completion.model,
      tokensUsed: completion.usage.total_tokens
    };

  } catch (error) {
    console.error('Error generating AI explanation:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      type: error.type
    });
    
    // Return graceful fallback with detailed error info
    return {
      explanation: `AI explanation unavailable (Error: ${error.message})`,
      summary: 'Unable to generate AI summary',
      keyPoints: [],
      rawText: extractedText,
      error: error.message,
      errorDetails: {
        name: error.name,
        status: error.status,
        type: error.type
      }
    };
  }
}

/**
 * Build a context-aware prompt based on file type
 */
function buildPrompt(text, fileType, metadata) {
  const basePrompt = `I've extracted text from a ${fileType} file. Please analyze this content and provide:

1. **Comprehensive Explanation**: A detailed explanation of what this content is about
2. **Key Summary**: A concise summary (2-3 sentences)
3. **Key Points**: Main takeaways or important information (bullet points)

${metadata.originalName ? `Original File: ${metadata.originalName}\n` : ''}
${metadata.frameCount ? `Note: This video contained ${metadata.frameCount} analyzed frames\n` : ''}
${metadata.pageCount ? `Note: This document has ${metadata.pageCount} pages\n` : ''}

Extracted Content:
---
${text.substring(0, 15000)} ${text.length > 15000 ? '...(truncated)' : ''}
---

Please provide your analysis in this format:

**EXPLANATION:**
[Your detailed explanation here]

**SUMMARY:**
[Your concise summary here]

**KEY POINTS:**
- [Point 1]
- [Point 2]
- [Point 3]
...`;

  return basePrompt;
}

/**
 * Parse AI response to extract structured information
 */
function parseAIResponse(response) {
  const result = {
    explanation: '',
    summary: '',
    keyPoints: []
  };

  try {
    // Extract explanation
    const explanationMatch = response.match(/\*\*EXPLANATION:\*\*([\s\S]*?)(?=\*\*SUMMARY:|$)/i);
    if (explanationMatch) {
      result.explanation = explanationMatch[1].trim();
    }

    // Extract summary
    const summaryMatch = response.match(/\*\*SUMMARY:\*\*([\s\S]*?)(?=\*\*KEY POINTS:|$)/i);
    if (summaryMatch) {
      result.summary = summaryMatch[1].trim();
    }

    // Extract key points
    const keyPointsMatch = response.match(/\*\*KEY POINTS:\*\*([\s\S]*?)$/i);
    if (keyPointsMatch) {
      const pointsText = keyPointsMatch[1].trim();
      result.keyPoints = pointsText
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-\d.)\s]+/, '').trim())
        .filter(point => point.length > 0);
    }

    // If parsing failed, use the whole response as explanation
    if (!result.explanation) {
      result.explanation = response;
    }

  } catch (error) {
    console.error('Error parsing AI response:', error);
    result.explanation = response;
  }

  return result;
}

/**
 * Generate explanation with streaming support
 * @param {string} extractedText - The raw extracted text
 * @param {string} fileType - Type of file
 * @param {Object} metadata - Additional metadata
 * @returns {AsyncGenerator<string>} - Stream of response chunks
 */
async function* streamExplanation(extractedText, fileType, metadata = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = buildPrompt(extractedText, fileType, metadata);

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content analyzer. Provide comprehensive, intelligent explanations of extracted text content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }

  } catch (error) {
    console.error('Error streaming AI explanation:', error);
    yield `Error: ${error.message}`;
  }
}

/**
 * Chat with context about previously analyzed content
 * @param {string} message - User's question
 * @param {string} context - Previously extracted content
 * @returns {Promise<string>} - AI response
 */
async function chatWithContext(message, context = '') {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables on Render.com dashboard.');
    }

    console.log('Processing chat message with context...');

    const systemPrompt = context 
      ? `You are a helpful AI assistant. You have access to previously analyzed content. Use this context to answer the user's questions accurately and comprehensively.\n\nContext:\n${context.substring(0, 10000)}`
      : 'You are a helpful AI assistant. Answer questions clearly and accurately.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;
    console.log('Chat response generated successfully');

    return response;

  } catch (error) {
    console.error('Error in chat:', error);
    
    if (error.message.includes('API key')) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to Render.com environment variables.');
    }
    
    throw error;
  }
}

module.exports = {
  generateExplanation,
  streamExplanation,
  chatWithContext
};

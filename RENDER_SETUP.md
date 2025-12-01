# Render.com Deployment Setup Guide

## Issue: OpenAI API Not Configured

Your API is deployed at `https://image-video-audio-pdf-docs-reader-api-1.onrender.com` but the OpenAI API key is not configured.

## Solution: Add Environment Variables on Render.com

### Step 1: Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section: https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Copy the key (it starts with `sk-...`)
6. **Important**: Save this key securely - you won't be able to see it again!

### Step 2: Configure Environment Variables on Render.com

1. Go to your Render.com dashboard: https://dashboard.render.com/
2. Select your service: **content-to-text-api** (or **image-video-audio-pdf-docs-reader-api-1**)
3. Click on **Environment** in the left sidebar
4. Add the following environment variables:

#### Required Variables:

| Key | Value | Notes |
|-----|-------|-------|
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key from Step 1 |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xeWRxcGxsb3dha3NzZ2ZwZXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTE2NTIsImV4cCI6MjA3MTI4NzY1Mn0.ngqmcjL5JG_bjTPuIPEvU3iExGhvcbYKyOJsBa5P6E0` | Your Supabase anonymous key |

5. Click **Save Changes**
6. Render will automatically redeploy your service with the new environment variables

### Step 3: Verify the Deployment

After the deployment completes (usually 2-3 minutes):

1. Visit your API: https://image-video-audio-pdf-docs-reader-api-1.onrender.com
2. You should see the API documentation page
3. Test the AI explanation feature in your Flutter app

## Troubleshooting

### If you see "OpenAI API not configured" error:

1. **Check if the environment variable is set**:
   - Go to Render.com dashboard → Your service → Environment
   - Verify `OPENAI_API_KEY` is present and has a value

2. **Check if the key is valid**:
   - Make sure the key starts with `sk-`
   - Test it on OpenAI's playground: https://platform.openai.com/playground

3. **Redeploy manually**:
   - Go to Render.com dashboard → Your service
   - Click **Manual Deploy** → **Deploy latest commit**

### If you see npm errors:

The errors in your screenshot show:
```
npm error path /app
npm error command sh -c node src/index.js
```

This is likely because the service is trying to start before environment variables are configured. After adding `OPENAI_API_KEY`, trigger a new deployment.

### Check Logs:

1. Go to Render.com dashboard → Your service → Logs
2. Look for:
   - ✅ `Server running on port 10000`
   - ✅ `API Documentation: http://...`
   - ❌ Any error messages about missing API keys

## Cost Information

### OpenAI API Pricing:

The API uses **GPT-4 Turbo** model:
- Input: ~$0.01 per 1,000 tokens (~750 words)
- Output: ~$0.03 per 1,000 tokens (~750 words)

**Estimate**: Each AI explanation request costs approximately $0.02-0.05

### Tips to Reduce Costs:

1. **Switch to GPT-3.5 Turbo** (cheaper but less accurate):
   - Edit `src/services/openaiService.js`
   - Change `model: 'gpt-4-turbo-preview'` to `model: 'gpt-3.5-turbo'`
   - Cost: ~10x cheaper (~$0.002 per request)

2. **Set usage limits** on OpenAI dashboard:
   - Go to https://platform.openai.com/account/limits
   - Set monthly spending limits

3. **Monitor usage**:
   - Check usage at https://platform.openai.com/usage

## Alternative: Use Free Tier

If you want to test without OpenAI costs:

1. **Use Gemini API (Google)** - Free tier available:
   - Get API key: https://makersuite.google.com/app/apikey
   - Modify `openaiService.js` to use Google's Gemini API

2. **Use Hugging Face** - Free inference API:
   - Get API key: https://huggingface.co/settings/tokens
   - Use smaller open-source models

## Quick Fix Commands

If you want to redeploy with new environment variables:

```bash
cd image_video_audio_pdf_docs_reader_api
git add .
git commit -m "Update environment configuration"
git push origin main
```

Then trigger manual deploy on Render.com dashboard.

## Testing After Setup

### Test via Browser:

Visit: https://image-video-audio-pdf-docs-reader-api-1.onrender.com/health

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T..."
}
```

### Test in Flutter App:

1. Open your Flutter app
2. Go to **AI Explanation** page
3. Pick an image or upload a file
4. Click **Extract & Analyze**
5. You should see:
   - ✅ Extracted text
   - ✅ AI Explanation
   - ✅ Summary
   - ✅ Key Points

## Support

If you continue to have issues:

1. Check Render.com logs for specific error messages
2. Verify OpenAI API key is valid and has credits
3. Test API endpoint directly with curl:

```bash
curl -X POST https://image-video-audio-pdf-docs-reader-api-1.onrender.com/api/extract \
  -F "file=@test-image.jpg"
```

## Summary

**To fix the "OpenAI API not configured" error:**

1. ✅ Get OpenAI API key from https://platform.openai.com/api-keys
2. ✅ Add `OPENAI_API_KEY` to Render.com environment variables
3. ✅ Add `SUPABASE_ANON_KEY` if not already present
4. ✅ Wait for automatic redeployment
5. ✅ Test in your Flutter app

That's it! Your AI explanation feature should work after these steps.

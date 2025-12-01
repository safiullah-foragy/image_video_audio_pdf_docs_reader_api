# Groq AI Setup (FREE - No Credit Card)

## ✅ What You Get
- **100% FREE forever** - No credit card required
- **30 requests/minute** - More than enough
- **14,400 requests/day** - Unlimited for your use case
- **Fast AI model** - llama-3.3-70b-versatile (similar quality to GPT-4)

## 🚀 Setup Steps

### 1. Get Groq API Key
1. Go to: **https://console.groq.com/keys**
2. Sign up (free, email only)
3. Click **"Create API Key"**
4. Copy the key (starts with `gsk_`)

### 2. Add to Render.com
1. Go to your Render dashboard
2. Select your API service: **image-video-audio-pdf-docs-reader-api-1**
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - Key: `GROQ_API_KEY`
   - Value: `gsk_...` (your key)
6. Click **"Save Changes"**
7. Render will automatically redeploy (2-3 minutes)

### 3. Test Locally (Optional)
```bash
cd image_video_audio_pdf_docs_reader_api
# Edit test_groq.js and add your key
node test_groq.js
```

### 4. Test in Flutter App
1. Wait 2-3 minutes for Render to redeploy
2. Open your Flutter app
3. Upload a PDF or image
4. Click **"Analyze with AI"**
5. You should see AI explanation! 🎉

## 📊 Why Groq?
- ✅ **No billing/credit card needed**
- ✅ **Very generous free tier**
- ✅ **Same API as OpenAI** (easy to switch)
- ✅ **Fast responses** (often faster than GPT-4)
- ✅ **High quality AI** (Llama 3.3 70B model)

## 🔧 What Changed
- Switched from OpenAI (paid) to Groq (free)
- Model: `llama-3.3-70b-versatile`
- API compatible with OpenAI format
- Same quality responses

---

**Need help? Let me know!**

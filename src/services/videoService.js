const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { extractTextFromImage } = require('./imageService');

/**
 * Extract audio from video and transcribe it (placeholder for actual speech-to-text)
 * @param {string} videoPath - Path to video file
 * @returns {Promise<string>}
 */
async function extractAudioFromVideo(videoPath) {
  return new Promise((resolve, reject) => {
    const outputPath = videoPath.replace(path.extname(videoPath), '.mp3');
    
    console.log('Extracting audio from video...');
    
    ffmpeg(videoPath)
      .output(outputPath)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .noVideo()
      .on('end', () => {
        console.log('Audio extraction completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Error extracting audio:', err);
        reject(new Error(`Audio extraction failed: ${err.message}`));
      })
      .run();
  });
}

/**
 * Extract frames from video at specified intervals
 * @param {string} videoPath - Path to video file
 * @param {number} framesPerSecond - Number of frames to extract per second (default: 0.5)
 * @returns {Promise<string[]>}
 */
async function extractFramesFromVideo(videoPath, framesPerSecond = 0.5) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(path.dirname(videoPath), 'frames');
    const outputPattern = path.join(outputDir, 'frame-%04d.jpg');
    
    console.log(`Extracting frames from video (${framesPerSecond} fps)...`);
    
    // Create frames directory
    fs.mkdir(outputDir, { recursive: true })
      .then(() => {
        ffmpeg(videoPath)
          .outputOptions([
            `-vf fps=${framesPerSecond}`,
            '-q:v 2'
          ])
          .output(outputPattern)
          .on('end', async () => {
            console.log('Frame extraction completed');
            try {
              const files = await fs.readdir(outputDir);
              const framePaths = files
                .filter(f => f.startsWith('frame-') && f.endsWith('.jpg'))
                .map(f => path.join(outputDir, f))
                .sort();
              resolve(framePaths);
            } catch (err) {
              reject(err);
            }
          })
          .on('error', (err) => {
            console.error('Error extracting frames:', err);
            reject(new Error(`Frame extraction failed: ${err.message}`));
          })
          .run();
      })
      .catch(reject);
  });
}

/**
 * Process video: extract audio text and OCR text from frames
 * @param {string} videoPath - Path to video file
 * @returns {Promise<{audioText: string, frameTexts: string[], combinedText: string}>}
 */
async function processVideo(videoPath) {
  try {
    console.log('Processing video file...');
    
    // Extract audio
    let audioText = 'No audio transcription available (speech-to-text not implemented)';
    try {
      const audioPath = await extractAudioFromVideo(videoPath);
      // Note: Actual speech-to-text would require additional service
      // For now, we'll just note that audio was extracted
      audioText = `Audio extracted to: ${audioPath}\nNote: Speech-to-text transcription requires external API (e.g., Google Speech-to-Text, OpenAI Whisper API)`;
      
      // Clean up audio file
      await fs.unlink(audioPath).catch(() => {});
    } catch (error) {
      console.error('Audio extraction failed:', error.message);
      audioText = `Audio extraction failed: ${error.message}`;
    }
    
    // Extract and process frames
    let frameTexts = [];
    try {
      const framePaths = await extractFramesFromVideo(videoPath, 0.5);
      console.log(`Processing ${framePaths.length} frames with OCR...`);
      
      // Process frames in batches to avoid memory issues
      const batchSize = 5;
      for (let i = 0; i < framePaths.length; i += batchSize) {
        const batch = framePaths.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (framePath, idx) => {
            try {
              const text = await extractTextFromImage(framePath);
              return `[Frame ${i + idx + 1}]: ${text}`;
            } catch (error) {
              return `[Frame ${i + idx + 1}]: OCR failed - ${error.message}`;
            }
          })
        );
        frameTexts.push(...batchResults);
      }
      
      // Clean up frame files
      const frameDir = path.dirname(framePaths[0]);
      await fs.rm(frameDir, { recursive: true, force: true }).catch(() => {});
    } catch (error) {
      console.error('Frame extraction failed:', error.message);
      frameTexts = [`Frame extraction failed: ${error.message}`];
    }
    
    const combinedText = `
=== VIDEO CONTENT EXTRACTION ===

--- Audio Transcription ---
${audioText}

--- Frame Text Extraction (OCR) ---
${frameTexts.join('\n')}

=== END OF VIDEO CONTENT ===
    `.trim();
    
    return {
      audioText,
      frameTexts,
      combinedText
    };
  } catch (error) {
    console.error('Error processing video:', error);
    throw new Error(`Video processing failed: ${error.message}`);
  }
}

module.exports = {
  extractAudioFromVideo,
  extractFramesFromVideo,
  processVideo
};

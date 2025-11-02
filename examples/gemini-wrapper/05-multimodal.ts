/**
 * Multimodal Understanding Examples
 * Demonstrates analysis of images, videos, and audio
 */

import { GeminiWrapper } from '@/lib/gemini-wrapper';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const gemini = new GeminiWrapper({
    apiKey: process.env.GEMINI_API_KEY!
  });

  console.log('=== Image Analysis ===\n');

  // Create an image part from URL
  const imageUrl = "https://example.com/image.jpg";
  const imagePart = gemini.image.createImagePart(imageUrl);

  const imageAnalysis = await gemini.multimodal.analyzeImages(
    "Describe what you see in this image in detail",
    [imagePart]
  );
  console.log('Image description:', imageAnalysis.text);
  console.log();

  console.log('=== Multiple Images Comparison ===\n');

  // Analyze multiple images
  const image1 = gemini.image.createImagePart("https://example.com/image1.jpg");
  const image2 = gemini.image.createImagePart("https://example.com/image2.jpg");

  const comparison = await gemini.multimodal.analyzeImages(
    "Compare these two images and describe the differences",
    [image1, image2]
  );
  console.log('Comparison:', comparison.text);
  console.log();

  console.log('=== Video Analysis (from file) ===\n');

  // For large files, upload first
  // const videoFile = await gemini.files.uploadAndWait({
  //   file: "/path/to/video.mp4",
  //   mimeType: "video/mp4",
  //   displayName: "Demo Video"
  // });
  // 
  // const videoPart = gemini.files.createPartFromFile(videoFile);
  // const videoAnalysis = await gemini.multimodal.analyzeVideo(
  //   "Summarize the main events in this video",
  //   videoPart
  // );
  // console.log('Video summary:', videoAnalysis.text);

  console.log('Video analysis requires file upload (commented out in example)');
  console.log();

  console.log('=== Audio Analysis ===\n');

  // Analyze audio
  // const audioFile = await gemini.files.uploadAndWait({
  //   file: "/path/to/audio.mp3",
  //   mimeType: "audio/mp3"
  // });
  // 
  // const audioPart = gemini.files.createPartFromFile(audioFile);
  // const audioAnalysis = await gemini.multimodal.analyzeAudio(
  //   "Transcribe this audio and provide a summary",
  //   audioPart
  // );
  // console.log('Audio transcription:', audioAnalysis.text);

  console.log('Audio analysis requires file upload (commented out in example)');
  console.log();

  console.log('=== Combined Multimodal ===\n');

  // Combine multiple modalities
  const textImageAnalysis = await gemini.multimodal.analyze({
    prompt: "Based on this image, write a short creative story",
    media: [imagePart]
  });
  console.log('Story based on image:', textImageAnalysis.text);
  console.log();

  console.log('=== Image with Base64 Data ===\n');

  // If you have base64 encoded image data
  const base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."; // truncated
  const base64Part = gemini.image.createImagePart(base64Image);

  // Note: In real usage, you'd have actual base64 data
  console.log('Base64 image part created (use with actual base64 data)');
  console.log();

  console.log('=== Helper Methods ===\n');

  // Various helper methods for creating parts
  const videoPart = gemini.multimodal.createVideoPart("gs://bucket/video.mp4", "video/mp4");
  const audioPart = gemini.multimodal.createAudioPart("gs://bucket/audio.mp3", "audio/mp3");
  const filePart = gemini.multimodal.createFilePart("gs://bucket/document.pdf");

  console.log('Created video part:', !!videoPart);
  console.log('Created audio part:', !!audioPart);
  console.log('Created file part:', !!filePart);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;

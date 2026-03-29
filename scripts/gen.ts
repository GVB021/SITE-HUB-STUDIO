import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompts = [
  { id: 'career', prompt: 'A professional presentation slide background for a voice acting career course, showing a modern recording studio and business elements, clean, high quality, 16:9 aspect ratio, dark theme, no text.' },
  { id: 'fono1', prompt: 'A professional presentation slide background for a speech therapy course, showing abstract representation of breathing and lungs, clean, high quality, 16:9 aspect ratio, dark theme, no text.' },
  { id: 'fono2', prompt: 'A professional presentation slide background for diction and articulation, showing a close up of a professional studio microphone and sound waves, clean, high quality, 16:9 aspect ratio, dark theme, no text.' },
  { id: 'dub1', prompt: 'A professional presentation slide background for lip sync techniques, showing a studio monitor with video editing software and audio tracks, clean, high quality, 16:9 aspect ratio, dark theme, no text.' },
  { id: 'dub2', prompt: 'A professional presentation slide background for voice acting interpretation, showing expressive theatrical masks near a microphone, clean, high quality, 16:9 aspect ratio, dark theme, no text.' },
  { id: 'games', prompt: 'A professional presentation slide background for video game voice acting, showing audio waveforms on a futuristic screen with gaming elements, clean, high quality, 16:9 aspect ratio, dark theme, no text.' },
  { id: 'homestudio', prompt: 'A professional presentation slide background for home studio setup, showing acoustic foam, a condenser microphone and an audio interface, clean, high quality, 16:9 aspect ratio, dark theme, no text.' },
];

async function generate() {
  const outDir = path.join(process.cwd(), 'public', 'slides');
  fs.mkdirSync(outDir, { recursive: true });

  for (const p of prompts) {
    try {
      console.log(`Generating ${p.id} with gemini-3-pro-image-preview...`);
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: p.prompt,
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
          }
        }
      });
      
      let base64 = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64 = part.inlineData.data;
          break;
        }
      }
      
      if (base64) {
        fs.writeFileSync(path.join(outDir, `${p.id}.png`), Buffer.from(base64, 'base64'));
        console.log(`Saved ${p.id}.png`);
      }
    } catch (e) {
      console.log(`Fallback to gemini-2.5-flash-image for ${p.id} due to error:`, e instanceof Error ? e.message : e);
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: p.prompt,
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        });
        let base64 = '';
        for (const part of fallbackResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64 = part.inlineData.data;
            break;
          }
        }
        if (base64) {
          fs.writeFileSync(path.join(outDir, `${p.id}.png`), Buffer.from(base64, 'base64'));
          console.log(`Saved ${p.id}.png (Fallback)`);
        }
      } catch (fallbackError) {
        console.error(`Fallback failed for ${p.id}:`, fallbackError);
      }
    }
  }
}

generate();

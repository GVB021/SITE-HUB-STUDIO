import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'A microphone in a recording studio',
    });
    console.log('Success!', response.candidates?.[0]?.content?.parts?.[0]?.inlineData ? 'Got image' : 'No image');
  } catch (e) {
    console.error('Error:', e);
  }
}
main();

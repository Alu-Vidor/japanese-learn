import { GoogleGenAI, Type, Modality } from "@google/genai";
import { JLPTLevel, Lesson, PronunciationFeedback } from "../types";
import { Language } from "../contexts/LanguageContext";

// Helper to encode audio blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:audio/wav;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper to write strings to DataView for WAV header
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Helper to add WAV header to raw PCM data
const addWavHeader = (pcmData: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): ArrayBuffer => {
  const headerLength = 44;
  const buffer = new ArrayBuffer(headerLength + pcmData.length);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
  view.setUint16(32, numChannels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.length, true); // Subchunk2Size

  // Write PCM data
  new Uint8Array(buffer, headerLength).set(pcmData);

  return buffer;
};

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLesson = async (level: JLPTLevel, topic: string, lang: Language = 'en'): Promise<Lesson> => {
  const ai = getClient();
  const languageName = lang === 'ru' ? 'Russian' : 'English';
  
  const prompt = `Create a Japanese lesson for JLPT Level ${level} regarding the topic: "${topic}".
  
  It must include:
  1. A short dialogue (4-6 lines) between two people (A and B).
  2. 2 Key grammar points used in the dialogue.
  3. 3 Quiz questions (1 multiple choice, 1 fill-gap, 1 scramble sentence).
  
  IMPORTANT: Provide all explanations, grammar structure explanations, dialogue translations (in the 'english' field), and quiz explanations in ${languageName}.
  Ensure the Japanese is natural but appropriate for the ${level} level.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          dialogue: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                japanese: { type: Type.STRING },
                reading: { type: Type.STRING },
                english: { type: Type.STRING }
              }
            }
          },
          grammarPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                structure: { type: Type.STRING },
                explanation: { type: Type.STRING },
                example: { type: Type.STRING }
              }
            }
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['multiple-choice', 'scramble', 'fill-gap'] },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              }
            }
          }
        },
        required: ["title", "dialogue", "grammarPoints", "quiz"]
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  
  const data = JSON.parse(response.text);
  return {
    id: Date.now().toString(),
    level,
    topic,
    ...data
  };
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = getClient();
  
  // Clean text of non-speakable characters or speaker labels if included accidentally
  const cleanText = text.replace(/^[A-B]:\s*/, '');

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: cleanText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Failed to generate speech");

  // Decode Base64 to Raw PCM
  const binaryString = atob(base64Audio);
  const pcmBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  // Add WAV header to PCM data
  // Gemini TTS defaults: 24kHz, 1 channel, 16-bit
  const wavBuffer = addWavHeader(pcmBytes, 24000, 1);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });

  // Convert to Data URI for the player
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert wav blob to data uri'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzePronunciation = async (audioBlob: Blob, referenceText: string, lang: Language = 'en'): Promise<PronunciationFeedback> => {
  const ai = getClient();
  const base64Audio = await blobToBase64(audioBlob);
  const languageName = lang === 'ru' ? 'Russian' : 'English';

  const prompt = `Analyze this Japanese audio recording specifically for a learner trying to say: "${referenceText}".
  
  Evaluate:
  1. Overall pronunciation score (0-100).
  2. Pitch Accent accuracy (0-100) (High/Low tone correctness).
  3. Transcription of what you heard.
  4. Specific mistakes (long vowels, double consonants, wrong pitch).
  
  Provide constructive feedback in ${languageName}.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: audioBlob.type || 'audio/webm', // Fallback if type empty
            data: base64Audio
          }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          pitchAccuracy: { type: Type.NUMBER },
          transcription: { type: Type.STRING },
          feedback: { type: Type.STRING },
          mistakes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                part: { type: Type.STRING },
                issue: { type: Type.STRING },
                suggestion: { type: Type.STRING }
              }
            }
          }
        },
        required: ["score", "pitchAccuracy", "transcription", "feedback", "mistakes"]
      }
    }
  });

  if (!response.text) throw new Error("No analysis received");
  return JSON.parse(response.text);
};
import { Profile } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

interface FetchAIParams {
  prompt: string;
  isJson?: boolean;
  schema?: any;
}

export async function fetchAI<T>({ prompt, isJson = false, schema = undefined }: FetchAIParams): Promise<T> {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured for this application. Please contact the administrator.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: isJson ? 'application/json' : undefined,
          responseSchema: isJson ? schema : undefined,
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error("Invalid Gemini response format: empty response text.");
      }

      if (isJson) {
        return JSON.parse(text) as T;
      }
      return text as T;
    } catch (error) {
      console.error("API Error:", error);
      if (i === MAX_RETRIES - 1) {
        throw new Error(`API request failed after ${MAX_RETRIES} retries. The AI service may be temporarily unavailable.`);
      }
      await new Promise(res => setTimeout(res, INITIAL_DELAY * Math.pow(2, i)));
    }
  }
  throw new Error("API request failed after multiple retries.");
}


export async function extractProfileFromCV(cvText: string): Promise<Profile> {
  const prompt = `Analyze the following CV text and extract the information into a valid JSON object. The output must be only the JSON object. CV Text: """${cvText}"""`;
  
  const schema = {
        type: Type.OBJECT,
        properties: {
          personalInfo: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              linkedin: { type: Type.STRING },
              github: { type: Type.STRING },
              portfolio: { type: Type.STRING },
            },
            required: ['name', 'email', 'phone']
          },
          summary: { type: Type.STRING },
          workExperience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                jobTitle: { type: Type.STRING },
                company: { type: Type.STRING },
                location: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
               required: ['jobTitle', 'company', 'startDate', 'endDate', 'responsibilities']
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                degree: { type: Type.STRING },
                institution: { type: Type.STRING },
                location: { type: Type.STRING },
                graduationDate: { type: Type.STRING },
              },
               required: ['degree', 'institution', 'graduationDate']
            }
          },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['personalInfo', 'summary', 'workExperience', 'education', 'skills']
      };

  return fetchAI<Profile>({ prompt, isJson: true, schema });
}

export async function regenerateCV({ originalMarkdown, changeRequest, profile, jobDescription }: {
    originalMarkdown: string;
    changeRequest: string;
    profile: Profile;
    jobDescription: string;
}): Promise<string> {
    const prompt = `Revise the original Markdown CV based on the user's change request.
The output MUST be ONLY the revised Markdown code, with no other text or explanations.
Crucially, you MUST maintain the exact same formatting structure as the original CV. Adhere strictly to the use of headings, bolding, italics, and lists as seen in the original.

User's Change Request:
"""
${changeRequest}
"""

Original Markdown CV:
"""
${originalMarkdown}
"""

User Profile that was used for original CV:
"""
${JSON.stringify(profile)}
"""

Job Description that was used for original CV:
"""
${jobDescription}
"""
`;

    return fetchAI<string>({ prompt });
}
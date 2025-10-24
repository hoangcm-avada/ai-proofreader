import { GoogleGenAI, Type } from "@google/genai";
import { ProofreadError } from '../types';

// FIX: Initialize the GoogleGenAI client at the module level using the environment variable.
// This adheres to the coding guidelines and removes the need for manual initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const proofreadSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      original: {
        type: Type.STRING,
        description: "The exact original sentence or phrase containing the error.",
      },
      correction: {
        type: Type.STRING,
        description: "The fully corrected version of the sentence or phrase.",
      },
      explanation: {
        type: Type.STRING,
        description: "A concise, professional explanation of the error and the fix.",
      },
    },
    required: ["original", "correction", "explanation"],
  },
};

export const proofreadText = async (
    markdownContent: string,
    customDictionary: string = '',
    styleGuideRules: string = ''
): Promise<ProofreadError[]> => {

  let dictionaryPrompt = '';
  if (customDictionary.trim()) {
    dictionaryPrompt = `
      Custom Dictionary: The following words, names, or acronyms are correctly spelled and should not be flagged as errors.
      ---
      ${customDictionary}
      ---
    `;
  }

  let styleGuidePrompt = '';
  if (styleGuideRules.trim()) {
    styleGuidePrompt = `
      Custom Style Guide: In addition to standard grammar, you must enforce the following custom style rules.
      ---
      ${styleGuideRules}
      ---
    `;
  }

  const prompt = `
    CRITICAL: You MUST output ONLY a valid JSON array. No other text, no explanations, no markdown formatting.

    Instructions:
    1.  Analyze the following Markdown text meticulously.
    2.  Identify every error in grammar, spelling, punctuation, and phrasing.
    3.  For each error found, create an object within the JSON array.
    4.  Each object must have exactly these three keys:
        - "original": The exact original sentence or phrase containing the error.
        - "correction": The fully corrected version of the sentence or phrase.
        - "explanation": A concise, professional explanation of the error and the fix (e.g., "Subject-verb agreement," "Corrected spelling of 'button'," "Replaced awkward phrasing for clarity").

    ${dictionaryPrompt}
    ${styleGuidePrompt}

    If you find no errors, output an empty array: [].

    Here is the Markdown text to analyze:
    ---
    ${markdownContent}
    ---
  `;
  
  try {
    // FIX: Use the module-level 'ai' instance directly.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert technical writer and proofreader for software documentation. Your task is to analyze the provided Markdown text for any grammatical errors, spelling mistakes, typos, and awkward phrasing, while adhering to any provided custom dictionaries or style guides.",
        responseMimeType: "application/json",
        responseSchema: proofreadSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
    const result = JSON.parse(cleanedJsonText);

    if (Array.isArray(result) && (result.length === 0 || result.every(item => 'original' in item && 'correction' in item && 'explanation' in item))) {
        return result as ProofreadError[];
    } else {
        throw new Error("API response is not in the expected format.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the AI's response. The format was invalid.");
    }
    throw new Error("Failed to get a valid response from the AI. Please check the console for details.");
  }
};


export const generateSampleText = async (): Promise<string> => {
  const prompt = `
    Write a short (around 100-150 words) technical documentation paragraph for a fictional software feature.
    The feature is called 'Intelligent Sync'.
    CRITICAL: Intentionally include 3-5 common grammatical or spelling mistakes (e.g., "its" vs "it's", "you're" vs "your", subject-verb agreement errors, typos).
    This text will be used as a demonstration for a proofreading tool, so the errors are necessary.
    Do not mention that you are including errors. Just write the text naturally as if it were a real document with mistakes.
    Output only the raw text, with no preamble or markdown formatting.
  `;

  try {
    // FIX: Use the module-level 'ai' instance directly.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating sample text:", error);
    throw new Error("Failed to generate sample text from the AI. Please check the console for details.");
  }
};

export const generateSampleTextForSummary = async (): Promise<string> => {
  const prompt = `
    Write a technical documentation passage of around 300-400 words about a fictional cloud service called "QuantumLeapDB".
    Describe what QuantumLeapDB is (a serverless, auto-scaling graph database), its key features (real-time analytics, predictive modeling APIs, zero-ops infrastructure), and a common use case (e.g., building a recommendation engine).
    The tone should be professional and informative, suitable for a developer audience.
    This text will be used as a demonstration for a summarization tool.
    Output only the raw text, with no preamble, headings, or markdown formatting.
  `;

  try {
    // FIX: Use the module-level 'ai' instance directly.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating long sample text:", error);
    throw new Error("Failed to generate sample text from the AI. Please check the console for details.");
  }
};

export const summarizeText = async (documentContent: string): Promise<string> => {
    const prompt = `
      Summarize the following document. Your summary should be concise, clear, and capture the key points and main ideas in plain text paragraphs.
      
      CRITICAL INSTRUCTION: You MUST output ONLY plain text. Do not use any Markdown formatting. This includes, but is not limited to:
      - No bolding (**text**)
      - No italics (*text*)
      - No bullet points (*, -, or +)
      - No headings (#)
      
      The entire summary must be formatted as simple paragraphs.

      Here is the document to summarize:
      ---
      ${documentContent}
      ---
    `;

    try {
        // FIX: Use the module-level 'ai' instance directly.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an expert at summarizing technical documents and articles. Your goal is to provide a summary that is easy to understand for someone who has not read the original text.",
                temperature: 0.5,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for summarization:", error);
        throw new Error("Failed to get a summary from the AI. Please check the console for details.");
    }
};

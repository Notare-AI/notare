import { useState, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// --- Configuration ---
const AI_MODE = import.meta.env.VITE_AI_MODE || 'openai'; // This now effectively means 'gemini' or 'ollama'
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434/api/generate';

// --- Type Definitions ---
type AiMode = 'ollama' | 'gemini';

// --- Hook Definition ---
export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aiMode: AiMode = AI_MODE === 'ollama' ? 'ollama' : 'gemini';

  const _generateContent = useCallback(async (payload: any): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      if (aiMode === 'gemini') {
        const { data, error } = await supabase.functions.invoke('ai-proxy', {
          body: { payload },
        });

        if (error) {
          if (error.context && error.context.status === 429) {
            const errorBody = await error.context.json();
            throw new Error(errorBody.error || 'You have run out of AI credits for this month.');
          }
          if (error.context && error.context.status === 500) {
            const errorBody = await error.context.json();
            throw new Error(errorBody.error || 'AI service is not configured.');
          }
          throw new Error(error.message);
        }

        if (data.error) {
          throw new Error(data.error);
        }
        
        return data.choices[0].message.content.trim();
      } else { // ollama
        const response = await axios.post(
          OLLAMA_URL,
          {
            model: 'mistral',
            prompt: payload.prompt,
            stream: false,
          }
        );
        return response.data.response.trim();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      setError(errorMessage);
      console.error('AI generation error:', err);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [aiMode]);

  const _generateOllamaPrompt = (prompt: string) => ({ prompt });

  const _parseJsonResponse = (responseText: string, objectKey: string) => {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return a valid JSON object.');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      if (objectKey === 'tldr' && typeof parsed.summary === 'string' && Array.isArray(parsed.sources)) {
        return parsed;
      }
      if (objectKey === 'keyPoints' && Array.isArray(parsed.points) && Array.isArray(parsed.sources)) {
        return parsed;
      }
      if (objectKey === 'note' && typeof parsed.note === 'string') {
        return parsed.note;
      }
      throw new Error('Parsed JSON does not match the expected format.');
    } catch (parseError: any) {
      console.error('AI JSON parsing error:', parseError, 'Raw response:', responseText);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  };

  const generateTLDRWithSources = useCallback(async (text: string): Promise<{ summary: string; sources: string[] }> => {
    const prompt = `Analyze the following text and provide a concise summary (TLDR) of 100 words or less. Also, extract the original sentences from the text that directly support your summary.
    Return your response as a single, valid JSON object with two keys:
    1. "summary": A string containing the summary.
    2. "sources": An array of strings, where each string is an exact quote from the original text that was used to create the summary.
    
    IMPORTANT: Provide only the raw JSON object and nothing else. Do not wrap it in markdown backticks.
    
    Text:
    """
    ${text}
    """`;
    
    const payload = {
      messages: [{ role: 'user', content: prompt }],
    };
    const responseText = await _generateContent(aiMode === 'gemini' ? payload : _generateOllamaPrompt(prompt));
    return _parseJsonResponse(responseText, 'tldr');
  }, [_generateContent, aiMode]);

  const extractKeyPoints = useCallback(async (text: string): Promise<{ points: string[]; sources: string[] }> => {
    const prompt = `Extract the 5 most important key points from the following text. Also, extract the original sentences from the text that directly support these key points.
    Return your response as a single, valid JSON object with two keys:
    1. "points": An array of strings, where each string is a key point.
    2. "sources": An array of strings, where each string is an exact quote from the original text that was used to create the key points.
    
    IMPORTANT: Provide only the raw JSON object and nothing else. Do not wrap it in markdown backticks.
    
    Text:
    """
    ${text}
    """`;
    
    const payload = {
      messages: [{ role: 'user', content: prompt }],
    };
    const responseText = await _generateContent(aiMode === 'gemini' ? payload : _generateOllamaPrompt(prompt));
    return _parseJsonResponse(responseText, 'keyPoints');
  }, [_generateContent, aiMode]);

  const generateNoteFromSelection = useCallback(async (text: string): Promise<string> => {
    const prompt = `You are an expert note-taker. Read the following text and create a concise, clear note that captures the key information. The note should be easy to understand at a glance.
    Return your response as a single, valid JSON object with one key:
    1. "note": A string containing the generated note.
    
    IMPORTANT: Provide only the raw JSON object and nothing else. Do not wrap it in markdown backticks.
    
    Text:
    """
    ${text}
    """`;
    
    const payload = {
      messages: [{ role: 'user', content: prompt }],
    };
    const responseText = await _generateContent(aiMode === 'gemini' ? payload : _generateOllamaPrompt(prompt));
    return _parseJsonResponse(responseText, 'note');
  }, [_generateContent, aiMode]);

  const generateChatResponse = useCallback(async (
    prompt: string, 
    history: { role: 'user' | 'assistant', content: string }[]
  ): Promise<string> => {
    if (aiMode === 'gemini') {
      const messages = [...history, { role: 'user', content: prompt }];
      const payload = { messages };
      return _generateContent(payload);
    } else { // ollama
      const fullPrompt = history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n') + `\n\nUser: ${prompt}\n\nAssistant:`;
      return _generateContent(_generateOllamaPrompt(fullPrompt));
    }
  }, [aiMode, _generateContent]);

  const generateUpdatedNodeContent = useCallback(async (
    currentNodeContent: string,
    prompt: string
  ): Promise<string> => {
    const fullPrompt = `You are an AI assistant helping a user build a knowledge map. The user has a note with the following content and has provided a prompt for you to update it.
Your task is to intelligently integrate the user's request into the existing content. You can rewrite, append, or prepend as you see fit to create a coherent and improved note.
Return only the complete, updated text for the note, without any extra explanations or markdown formatting.

---
Original Note Content:
${currentNodeContent || "(This note is currently empty)"}
---
User's Prompt:
"${prompt}"
---

Updated Note Content:`;
    
    const payload = {
      messages: [{ role: 'user', content: fullPrompt }],
    };
    return _generateContent(aiMode === 'gemini' ? payload : _generateOllamaPrompt(fullPrompt));
  }, [_generateContent, aiMode]);

  return {
    generateTLDRWithSources,
    extractKeyPoints,
    generateNoteFromSelection,
    generateChatResponse,
    generateUpdatedNodeContent,
    isGenerating,
    error,
    aiMode,
  };
};
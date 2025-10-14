import { useState, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// --- Configuration ---
const AI_MODE = import.meta.env.VITE_AI_MODE || 'ollama'; // Default to ollama

const OLLAMA_URL = 'http://localhost:11434/api/generate';

// --- Type Definitions ---
type AiMode = 'ollama' | 'openai';

// --- Hook Definition ---
export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aiMode: AiMode = AI_MODE === 'openai' ? 'openai' : 'ollama';

  const _generateContent = useCallback(async (payload: any): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      if (aiMode === 'openai') {
        const { data, error } = await supabase.functions.invoke('openai-proxy', {
          body: { payload },
        });

        if (error) {
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
            prompt: payload.prompt, // Ollama needs a simple prompt string
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

  const generateTLDR = useCallback(async (text: string): Promise<string> => {
    const prompt = `Summarize the following text in 100 words or less. Provide only the summary, with no introductory text.\n\nText:\n"""\n${text}\n"""`;
    const payload = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    };
    return _generateContent(aiMode === 'openai' ? payload : _generateOllamaPrompt(prompt));
  }, [_generateContent, aiMode]);

  const generateTLDRWithSources = useCallback(async (text: string): Promise<{ summary: string; sources: string[] }> => {
    const prompt = `Analyze the following text and provide a concise summary (TLDR) of 100 words or less. Also, extract the original sentences from the text that directly support your summary.
    Return your response as a single, valid JSON object with two keys:
    1. "summary": A string containing the summary.
    2. "sources": An array of strings, where each string is an exact quote from the original text that was used to create the summary.
    
    Provide only the JSON object and nothing else.
    
    Text:
    """
    ${text}
    """`;
    
    const payload = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    };
    const responseText = await _generateContent(aiMode === 'openai' ? payload : _generateOllamaPrompt(prompt));

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return a valid JSON object.');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.summary === 'string' && Array.isArray(parsed.sources) && parsed.sources.every((s: any) => typeof s === 'string')) {
        return parsed;
      }
      throw new Error('Parsed JSON does not match the expected format.');
    } catch (parseError: any) {
      setError(`Failed to parse TLDR from AI response: ${parseError.message}`);
      console.error('TLDR parsing error:', parseError, 'Raw response:', responseText);
      return { summary: responseText, sources: [] };
    }
  }, [_generateContent, aiMode]);

  const extractKeyPoints = useCallback(async (text: string): Promise<{ points: string[]; sources: string[] }> => {
    const prompt = `Extract the 5 most important key points from the following text. Also, extract the original sentences from the text that directly support these key points.
    Return your response as a single, valid JSON object with two keys:
    1. "points": An array of strings, where each string is a key point.
    2. "sources": An array of strings, where each string is an exact quote from the original text that was used to create the key points.
    
    Provide only the JSON object and nothing else.
    
    Text:
    """
    ${text}
    """`;
    
    const payload = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    };
    const responseText = await _generateContent(aiMode === 'openai' ? payload : _generateOllamaPrompt(prompt));

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return a valid JSON object.');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.points) && parsed.points.every((p: any) => typeof p === 'string') && Array.isArray(parsed.sources) && parsed.sources.every((s: any) => typeof s === 'string')) {
        return parsed;
      }
      throw new Error('Parsed JSON does not match the expected format.');
    } catch (parseError: any) {
      setError(`Failed to parse key points from AI response: ${parseError.message}`);
      console.error('Key points parsing error:', parseError, 'Raw response:', responseText);
      return { points: [responseText], sources: [] };
    }
  }, [_generateContent, aiMode]);

  const generateNoteFromSelection = useCallback(async (text: string): Promise<string> => {
    const prompt = `You are an expert note-taker. Read the following text and create a concise, clear note that captures the key information. The note should be easy to understand at a glance.
    Return your response as a single, valid JSON object with one key:
    1. "note": A string containing the generated note.
    
    Provide only the JSON object and nothing else.
    
    Text:
    """
    ${text}
    """`;
    
    const payload = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    };
    const responseText = await _generateContent(aiMode === 'openai' ? payload : _generateOllamaPrompt(prompt));

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return a valid JSON object.');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.note === 'string') {
        return parsed.note;
      }
      throw new Error('Parsed JSON does not match the expected format.');
    } catch (parseError: any) {
      setError(`Failed to parse note from AI response: ${parseError.message}`);
      console.error('Note parsing error:', parseError, 'Raw response:', responseText);
      return responseText;
    }
  }, [_generateContent, aiMode]);

  const generateChatResponse = useCallback(async (
    prompt: string, 
    history: { role: 'user' | 'assistant', content: string }[]
  ): Promise<string> => {
    if (aiMode === 'openai') {
      const messages = [...history, { role: 'user', content: prompt }];
      const payload = {
        model: 'gpt-4o-mini',
        messages,
      };
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
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: fullPrompt }],
    };
    return _generateContent(aiMode === 'openai' ? payload : _generateOllamaPrompt(fullPrompt));
  }, [_generateContent, aiMode]);

  return {
    generateTLDR,
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
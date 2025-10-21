import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Source {
  text: string;
  page: number;
}

export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const _generateContent = useCallback(async (payload: any): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    const isLocal = window.location.hostname === 'localhost';

    try {
      if (isLocal) {
        // --- LOCAL DEVELOPMENT: Use Ollama ---
        console.log("Using local Ollama (Mistral) for AI generation.");
        const ollamaPayload = {
          model: 'mistral',
          messages: payload.messages,
          stream: false,
          format: payload.response_format?.type === 'json_object' ? 'json' : undefined,
        };

        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ollamaPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama request failed: ${errorText}`);
        }

        const data = await response.json();
        const content = data.message?.content;

        if (!content) {
          throw new Error('Received an invalid response from Ollama.');
        }
        
        return content.trim();

      } else {
        // --- PRODUCTION: Use OpenAI via Supabase Proxy ---
        const { data, error: invokeError } = await supabase.functions.invoke('openai-proxy', {
          body: { payload },
        });

        if (invokeError) {
          if (invokeError.context && invokeError.context.status === 429) {
            const errorBody = await invokeError.context.json();
            throw new Error(errorBody.error || 'You have run out of AI credits for this month.');
          }
          throw new Error(invokeError.message || 'An unknown error occurred while contacting the AI service.');
        }

        if (data.error) {
          throw new Error(data.error);
        }
        
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Received an invalid response from the AI service.');
        }
        
        return content.trim();
      }
    } catch (err: any) {
      let errorMessage = err.message || 'An unknown error occurred during AI generation.';
      if (isLocal && err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage = 'Could not connect to Ollama. Please ensure it is running locally on port 11434.';
      }
      setError(errorMessage);
      console.error('AI generation error:', err);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const _parseJsonResponse = (responseText: string, objectKey: string) => {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return a valid JSON object.');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);

      const isValidSource = (s: any): s is Source => typeof s === 'object' && s !== null && typeof s.text === 'string' && typeof s.page === 'number';

      // Standard format check
      if (objectKey === 'tldr' && typeof parsed.summary === 'string' && Array.isArray(parsed.sources) && parsed.sources.every(isValidSource)) {
        return parsed;
      }
      if (objectKey === 'keyPoints' && Array.isArray(parsed.points) && Array.isArray(parsed.sources) && parsed.sources.every(isValidSource)) {
        return parsed;
      }
      if (objectKey === 'note' && typeof parsed.note === 'string') {
        return parsed.note;
      }

      // --- Fallback for local Ollama model ---
      const isLocal = window.location.hostname === 'localhost';
      if (isLocal) {
        if (objectKey === 'tldr' && parsed.data?.abstract) {
          console.warn("AI response format mismatch. Using fallback for local development.");
          return {
            summary: parsed.data.abstract,
            sources: [], // Ollama doesn't provide sources in this format
          };
        }
        if (objectKey === 'keyPoints' && parsed.data?.keywords && Array.isArray(parsed.data.keywords)) {
          console.warn("AI response format mismatch. Using fallback for local development.");
          return {
            points: parsed.data.keywords,
            sources: [], // Ollama doesn't provide sources in this format
          };
        }
      }
      // --- End Fallback ---

      throw new Error('Parsed JSON does not match the expected format.');
    } catch (parseError: any) {
      console.error('AI JSON parsing error:', parseError, 'Raw response:', responseText);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  };

  const generateTLDRWithSources = useCallback(async (text: string): Promise<{ summary: string; sources: Source[] }> => {
    const prompt = `Analyze the following text, which is formatted with page markers (e.g., "--- PAGE 1 ---"). Provide a concise summary (TLDR) of 100 words or less. Also, extract the original sentences from the text that directly support your summary, noting their original page number.
    Return your response as a single, valid JSON object with two keys:
    1. "summary": A string containing the summary.
    2. "sources": An array of objects, where each object has two keys: "text" (the exact quote) and "page" (the integer page number it came from).
    
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
    const responseText = await _generateContent(payload);
    return _parseJsonResponse(responseText, 'tldr');
  }, [_generateContent]);

  const extractKeyPoints = useCallback(async (text: string): Promise<{ points: string[]; sources: Source[] }> => {
    const prompt = `Extract the 5 most important key points from the following text, which is formatted with page markers (e.g., "--- PAGE 1 ---"). Also, extract the original sentences from the text that directly support these key points, noting their original page number.
    Return your response as a single, valid JSON object with two keys:
    1. "points": An array of strings, where each string is a key point.
    2. "sources": An array of objects, where each object has two keys: "text" (the exact quote) and "page" (the integer page number it came from).
    
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
    const responseText = await _generateContent(payload);
    return _parseJsonResponse(responseText, 'keyPoints');
  }, [_generateContent]);

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
    const responseText = await _generateContent(payload);
    return _parseJsonResponse(responseText, 'note');
  }, [_generateContent]);

  const generateChatResponse = useCallback(async (
    prompt: string, 
    history: { role: 'user' | 'assistant', content: string }[]
  ): Promise<string> => {
    const messages = [...history, { role: 'user', content: prompt }];
    const payload = {
      model: 'gpt-4o-mini',
      messages,
    };
    return _generateContent(payload);
  }, [_generateContent]);

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
    return _generateContent(payload);
  }, [_generateContent]);

  return {
    generateTLDRWithSources,
    extractKeyPoints,
    generateNoteFromSelection,
    generateChatResponse,
    generateUpdatedNodeContent,
    isGenerating,
    error,
  };
};
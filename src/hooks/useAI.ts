import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// This hook is now exclusively for the OpenAI proxy.
// All other AI provider logic has been removed to prevent conflicts.

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
          // Use JSON format if the original payload requested it
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
        
        // Ollama's JSON mode returns a stringified JSON, which the parser function expects.
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
      // Provide a helpful error message if Ollama isn't running
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
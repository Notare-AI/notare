import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface Source {
  text: string;
  page: number;
}

export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshAfterAIOperation } = useUserProfile();

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
        
        // Refresh profile to update credits in real-time (production only)
        if (!isLocal) {
          refreshAfterAIOperation();
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
  }, [refreshAfterAIOperation]);

  const _parseJsonResponse = (responseText: string, objectKey: string) => {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return a valid JSON object.');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);

      // Specific check for the unexpected 'articles' format
      if (parsed.articles && Array.isArray(parsed.articles)) {
        throw new Error('AI returned a list of articles instead of the requested summary/key points. Please ensure the input text is not just a bibliography.');
      }

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
        // Fallback 1: "data" object format
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
        // Fallback 2: Chat message format (e.g., {"role": "system", "content": "..."})
        if (parsed.content && typeof parsed.content === 'string') {
          console.warn("AI response in chat message format. Using fallback for local development.");
          if (objectKey === 'tldr') {
            return {
              summary: parsed.content,
              sources: [],
            };
          }
          if (objectKey === 'keyPoints') {
            // Extract points by splitting on common patterns (e.g., "1. ", "- ", "* ")
            const points = parsed.content
              .split(/\n/)
              .filter(line => line.trim().match(/^\s*(\d+\.|\-|\*)\s+/))
              .map(line => line.trim().replace(/^\s*(\d+\.|\-|\*)\s+/, ''));
            return {
              points: points.length > 0 ? points : [parsed.content], // Fallback to whole content if no points found
              sources: [],
            };
          }
          if (objectKey === 'note') {
            return parsed.content;
          }
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
    Your response MUST be a single, valid JSON object with ONLY the specified keys and no other information, such as lists of articles, bibliographies, or external metadata.
    Return your response as a single, valid JSON object with two keys:
    1. "summary": A string containing the summary.
    2. "sources": An array of objects, where each object has two keys: "text" (the exact quote) and "page" (the integer page number it came from).
    
    Provide ONLY the JSON object and nothing else.
    
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
    Your response MUST be a single, valid JSON object with ONLY the specified keys and no other information, such as lists of articles, bibliographies, or external metadata.
    Return your response as a single, valid JSON object with two keys:
    1. "points": An array of strings, where each string is a key point.
    2. "sources": An array of objects, where each object has two keys: "text" (the exact quote) and "page" (the integer page number it came from).
    
    Provide ONLY the JSON object and nothing else.
    
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

  const generateNodeChatResponse = useCallback(async (
    noteContent: string,
    history: { role: 'user' | 'assistant', content: string }[],
    connectedNotesContext?: string,
  ): Promise<string> => {
    let systemContent = `You are an AI assistant inside a note-taking app. The user is asking you questions about the following note. Your answers should be helpful, concise, and directly related to the user's query and the note's content. Note Content: """\n${noteContent}\n"""`;

    if (connectedNotesContext && connectedNotesContext.trim().length > 0) {
      systemContent += `\n\nFor additional context, here is the content of directly connected notes:\n"""\n${connectedNotesContext}\n"""\n\nYou can synthesize information from all available notes to provide a comprehensive answer.`;
    }

    const systemPrompt = {
      role: 'system',
      content: systemContent
    };
    const messages = [systemPrompt, ...history];
    const payload = {
      model: 'gpt-4o-mini',
      messages,
    };
    return _generateContent(payload);
  }, [_generateContent]);

  return {
    generateTLDRWithSources,
    extractKeyPoints,
    generateNoteFromSelection,
    generateChatResponse,
    generateNodeChatResponse,
    isGenerating,
    error,
  };
};
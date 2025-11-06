/**
 * Web Article to Markdown Converter using Jina Reader API
 * Completely free service - no API key required
 */

export interface ArticleConversionResult {
  success: boolean;
  markdown?: string;
  title?: string;
  error?: string;
}

/**
 * Rate limiting to prevent abuse
 */
const rateLimiter = new Map<string, number>();

const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per 5 minutes per user

/**
 * Check if user has exceeded rate limit
 */
const checkRateLimit = (userId: string): boolean => {
  const userKey = `url_convert_${userId}`;
  const lastRequest = rateLimiter.get(userKey);
  const now = Date.now();
  
  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW) {
    return false; // Rate limited
  }
  
  rateLimiter.set(userKey, now);
  return true; // OK to proceed
};

/**
 * Validate if URL is properly formatted
 */
const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Convert web article to markdown using Jina Reader
 */
export const convertUrlToMarkdown = async (
  url: string, 
  userId: string
): Promise<ArticleConversionResult> => {
  try {
    // Validate URL format
    if (!validateUrl(url)) {
      return {
        success: false,
        error: 'Please enter a valid HTTP or HTTPS URL'
      };
    }

    // Check rate limiting
    if (!checkRateLimit(userId)) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait a few minutes before converting another article.'
      };
    }

    // Call Jina Reader API
    console.log('🔄 Converting URL to markdown:', url);
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    
    const response = await fetch(jinaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/markdown',
        'User-Agent': 'Notare-Research-Assistant'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const markdown = await response.text();

    if (!markdown || markdown.trim().length === 0) {
      return {
        success: false,
        error: 'The article could not be converted. The page might be behind a paywall or require authentication.'
      };
    }

    // Extract title from markdown (first heading)
    const titleMatch = markdown.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : 'Web Article';

    console.log('✅ Article converted successfully');
    
    return {
      success: true,
      markdown: markdown.trim(),
      title: title.trim()
    };

  } catch (error) {
    console.error('❌ URL conversion failed:', error);
    
    return {
      success: false,
      error: error instanceof Error 
        ? `Conversion failed: ${error.message}` 
        : 'An unexpected error occurred while converting the article'
    };
  }
};

/**
 * Clean up old rate limit entries to prevent memory leaks
 */
export const cleanupRateLimit = () => {
  const now = Date.now();
  for (const [key, timestamp] of rateLimiter.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW) {
      rateLimiter.delete(key);
    }
  }
};

// Clean up rate limiter every 10 minutes
setInterval(cleanupRateLimit, 10 * 60 * 1000);
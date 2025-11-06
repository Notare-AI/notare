import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Loader2, ExternalLink, FileText } from 'lucide-react';
import { convertUrlToMarkdown, ArticleConversionResult } from '@/lib/url-converter';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface WebArticle {
  url: string;
  title: string;
  content: string;
  loadedAt: Date;
}

interface UrlConverterProps {
  onArticleLoaded: (article: WebArticle) => void;
  userId: string;
  isCollapsed?: boolean;
}

const UrlConverter: React.FC<UrlConverterProps> = ({ 
  onArticleLoaded, 
  userId, 
  isCollapsed = false 
}) => {
  const [url, setUrl] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      showError('Please enter a URL');
      return;
    }

    setIsConverting(true);
    const toastId = showLoading('Loading article...');

    try {
      const result: ArticleConversionResult = await convertUrlToMarkdown(url.trim(), userId);
      
      if (toastId) dismissToast(toastId.toString());

      if (result.success && result.markdown) {
        // Load the article into the reader instead of creating a note
        onArticleLoaded({
          url: url.trim(),
          title: result.title || 'Web Article',
          content: result.markdown,
          loadedAt: new Date()
        });
        
        showSuccess(`Article "${result.title}" loaded successfully!`);
        setUrl(''); // Clear the input
      } else {
        showError(result.error || 'Failed to load article');
      }
    } catch (error) {
      if (toastId) dismissToast(toastId.toString());
      showError('An unexpected error occurred');
      console.error('URL conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (isCollapsed) {
    return (
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Web Article</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="url"
            placeholder="Paste article URL..."
            value={url}
            onChange={handleUrlChange}
            disabled={isConverting}
            className="text-sm"
          />
          <Button 
            type="submit"
            disabled={isConverting || !isValidUrl(url)}
            size="sm"
            className="w-full"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <FileText className="w-3 h-3 mr-2" />
                Load Article
              </>
            )}
          </Button>
        </form>
        {url && isValidUrl(url) && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <span className="truncate">{new URL(url).hostname}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="m-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="w-5 h-5 text-primary" />
          Convert Web Article
        </CardTitle>
        <CardDescription className="text-sm">
          Load any blog post or article to read and take notes from
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={handleUrlChange}
              disabled={isConverting}
            />
            {url && isValidUrl(url) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="w-4 h-4" />
                <span className="truncate">{new URL(url).hostname}</span>
              </div>
            )}
          </div>
          
          <Button 
            type="submit"
            disabled={isConverting || !isValidUrl(url)}
            className="w-full"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading Article...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Load Article
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>• Works with most blogs, news articles, and web pages</p>
          <p>• Rate limited to 10 articles per 5 minutes</p>
          <p>• Select text in the reader to add notes to your canvas</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UrlConverter;
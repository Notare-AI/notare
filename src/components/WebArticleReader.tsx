import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, MessageSquare, ArrowLeft, ExternalLink, Copy, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownToLexicalJson } from '@/lib/markdownToLexical';
import { showSuccess, showError } from '@/utils/toast';

interface WebArticle {
  url: string;
  title: string;
  content: string;
  loadedAt: Date;
}

interface WebArticleReaderProps {
  article: WebArticle;
  onAddNode: (nodeData: { type: string; content: string; sources?: any[] }) => void;
  onBackToConverter: () => void;
}

const WebArticleReader: React.FC<WebArticleReaderProps> = ({
  article,
  onAddNode,
  onBackToConverter
}) => {
  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && selectedText.length > 10 && readerRef.current) {
      const rect = readerRef.current.getBoundingClientRect();
      const range = window.getSelection()?.getRangeAt(0);
      const rangeRect = range?.getBoundingClientRect();
      
      if (rangeRect) {
        setSelection({
          text: selectedText,
          top: rangeRect.bottom - rect.top + 10,
          left: rangeRect.left - rect.left + (rangeRect.width / 2)
        });
      }
    } else {
      setSelection(null);
    }
  }, []);

  const handleCreateNoteFromSelection = async () => {
    if (!selection) return;
    
    setIsCreatingNote(true);
    try {
      // Convert the selected text to Lexical format
      const lexicalContent = markdownToLexicalJson(selection.text);
      
      // Create the note with source information
      onAddNode({
        type: 'EditableNoteNode',
        content: lexicalContent,
        sources: [{
          text: selection.text,
          page: 1, // Web articles are single "page"
          fileName: article.title
        }]
      });
      
      showSuccess('Note added to canvas!');
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      showError('Failed to create note');
      console.error('Error creating note:', error);
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleCreateFullArticleNote = async () => {
    setIsCreatingNote(true);
    try {
      // Convert the full article content to Lexical format
      const lexicalContent = markdownToLexicalJson(article.content);
      
      onAddNode({
        type: 'EditableNoteNode',
        content: lexicalContent,
        sources: [{
          text: article.content.substring(0, 200) + '...', // Preview text
          page: 1,
          fileName: article.title
        }]
      });
      
      showSuccess('Full article added to canvas!');
    } catch (error) {
      showError('Failed to create note');
      console.error('Error creating note:', error);
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(article.url);
    showSuccess('URL copied to clipboard');
  };

  const handleOpenOriginal = () => {
    window.open(article.url, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackToConverter}
            className="flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">{article.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe size={12} />
              <span className="truncate">{new URL(article.url).hostname}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyUrl}
            title="Copy URL"
          >
            <Copy size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenOriginal}
            title="Open original article"
          >
            <ExternalLink size={16} />
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <div 
        ref={readerRef}
        onMouseUp={handleMouseUp}
        className="flex-grow overflow-auto p-6 relative prose prose-sm max-w-none dark:prose-invert"
      >
        {/* Selection tooltip */}
        {selection && !isCreatingNote && (
          <div 
            style={{ 
              position: 'absolute', 
              top: selection.top, 
              left: selection.left, 
              transform: 'translateX(-50%)', 
              zIndex: 10 
            }}
          >
            <Button onClick={handleCreateNoteFromSelection} size="sm" className="shadow-lg">
              <MessageSquare size={16} className="mr-2" />
              Add Selection to Canvas
            </Button>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
          <div className="text-sm text-muted-foreground mb-4">
            Loaded {article.loadedAt.toLocaleTimeString()} • {new URL(article.url).hostname}
            {/* Show if article was restored from session */}
            {Date.now() - article.loadedAt.getTime() > 5000 && (
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                Restored from session
              </span>
            )}
          </div>
        </div>

        <div className="select-text">
          <ReactMarkdown
            components={{
              // Custom rendering for better styling
              h1: ({ children }) => <h2 className="text-xl font-bold mt-8 mb-4 first:mt-0">{children}</h2>,
              h2: ({ children }) => <h3 className="text-lg font-semibold mt-6 mb-3">{children}</h3>,
              h3: ({ children }) => <h4 className="text-base font-medium mt-4 mb-2">{children}</h4>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              a: ({ href, children }) => (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                  {children}
                </pre>
              )
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Select text to create focused notes, or add the full article
          </div>
          <Button 
            onClick={handleCreateFullArticleNote}
            disabled={isCreatingNote}
            size="sm"
          >
            {isCreatingNote ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <MessageSquare size={16} className="mr-2" />
                Add Full Article
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebArticleReader;
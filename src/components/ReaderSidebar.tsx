import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, FileText, Globe } from 'lucide-react';
import PdfViewerSidebar from './PdfViewerSidebar';
import UrlConverter from './UrlConverter';
import WebArticleReader from './WebArticleReader';
import { useHighlight } from '@/contexts/HighlightContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Source {
  text: string;
  page: number;
  fileName?: string;
}

interface WebArticle {
  url: string;
  title: string;
  content: string;
  loadedAt: Date;
}

interface ReaderSidebarProps {
  canvasId: string | null;
  onAddNode: (nodeData: { type: string; content: string; sources?: Source[] }) => void;
  userId?: string;
}

const ReaderSidebar = ({ canvasId, onAddNode, userId }: ReaderSidebarProps) => {
  const { setIsPdfSidebarOpen } = useHighlight();
  const [activeTab, setActiveTab] = useState<'pdf' | 'web'>('pdf');
  const [currentArticle, setCurrentArticle] = useState<WebArticle | null>(null);

  // Clean up session storage when component unmounts
  useEffect(() => {
    return () => {
      // Optional: Clear session storage when the reader sidebar is completely closed
      // Uncomment if you want articles to only persist within the same session
      // sessionStorage.removeItem('notare-loaded-article');
    };
  }, []);

  // Restore article from session storage on mount
  useEffect(() => {
    const savedArticle = sessionStorage.getItem('notare-loaded-article');
    if (savedArticle) {
      try {
        const article = JSON.parse(savedArticle);
        // Validate the article structure
        if (article.url && article.title && article.content && article.loadedAt) {
          setCurrentArticle({
            ...article,
            loadedAt: new Date(article.loadedAt) // Convert back to Date object
          });
          // Auto-switch to web tab if we have a loaded article
          setActiveTab('web');
        }
      } catch (error) {
        console.error('Failed to restore article from session storage:', error);
        sessionStorage.removeItem('notare-loaded-article');
      }
    }
  }, []);

  const handleArticleLoaded = (article: WebArticle) => {
    setCurrentArticle(article);
    // Save to session storage
    try {
      sessionStorage.setItem('notare-loaded-article', JSON.stringify(article));
    } catch (error) {
      console.error('Failed to save article to session storage:', error);
    }
  };

  const handleBackToConverter = () => {
    setCurrentArticle(null);
    // Clear from session storage
    sessionStorage.removeItem('notare-loaded-article');
  };

  return (
    <div className="h-full w-full bg-background text-foreground">
      <div className="flex flex-col h-full">
        {/* Header with tabs and close button */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Reader</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsPdfSidebarOpen(false)}
            className="hover:bg-muted"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Tabs for PDF and Web */}
        <div className="px-4 pt-2 border-b border-border">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pdf' | 'web')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText size={16} />
                PDF Documents
              </TabsTrigger>
              <TabsTrigger value="web" className="flex items-center gap-2">
                <Globe size={16} />
                Web Articles
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="flex-grow overflow-hidden">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="pdf" className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="h-full">
                <PdfViewerSidebar 
                  canvasId={canvasId} 
                  onAddNode={onAddNode}
                  showHeader={false}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="web" className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="flex flex-col h-full">
                {currentArticle ? (
                  // Show article reader when an article is loaded
                  <WebArticleReader
                    article={currentArticle}
                    onAddNode={onAddNode}
                    onBackToConverter={handleBackToConverter}
                  />
                ) : (
                  <>
                    {/* Web Reader Instructions/Header */}
                    <div className="p-4 bg-muted/30">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            Load Web Articles
                          </CardTitle>
                          <CardDescription className="text-sm">
                            Load any blog post, news article, or web page to read and take notes from
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>

                    <Separator />

                    {/* URL Converter */}
                    <div className="flex-grow overflow-auto">
                      {userId && canvasId ? (
                        <div className="p-4">
                          <UrlConverter 
                            onArticleLoaded={handleArticleLoaded}
                            userId={userId}
                            isCollapsed={false}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-center p-8">
                          <div className="space-y-3 text-muted-foreground">
                            <Globe className="w-12 h-12 mx-auto opacity-50" />
                            <div>
                              <h3 className="font-medium text-foreground mb-2">No Canvas Selected</h3>
                              <p className="text-sm">
                                Select a canvas from the sidebar to start loading web articles
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Usage Tips */}
                    <div className="border-t border-border p-4 bg-muted/20">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <h4 className="font-medium text-foreground mb-2">How it works:</h4>
                        <p>• Paste any article URL to load it in the reader</p>
                        <p>• Select text while reading to add notes to your canvas</p>
                        <p>• Use "Add Full Article" to add the entire content as a note</p>
                        <p>• Rate limited to 10 articles per 5 minutes per user</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReaderSidebar;
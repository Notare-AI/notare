import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight, Trash2, ZoomIn, ZoomOut, Loader2, MessageSquare, Zap, ListChecks, Quote, FilePlus2, Book, FileText as JournalIcon, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import PdfUploader from './PdfUploader';
import { useAI } from '@/hooks/useAI';
import { useHighlight } from '@/contexts/HighlightContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ReferenceType = 'Book' | 'Journal Article' | 'Website';

interface Source {
  text: string;
  page: number;
}

const referenceTemplates: Record<ReferenceType, string> = {
  'Book': '[Author Surname], [Initial(s)]. ([Year of publication]). *[Title of book]*. [Edition (if not first)]. [Place of publication]: [Publisher].',
  'Journal Article': '[Author Surname], [Initial(s)]. ([Year of publication]). \'[Title of article]\'. *[Title of Journal]*, [Volume number]([Issue number]), pp. [Page range].',
  'Website': '[Author Surname or Corporate Name]. ([Year last updated or published]). *[Title of page/document]*. Available at: [URL] (Accessed: [Day Month Year]).'
};

const fillReferenceTemplate = (template: string, metadata: any): string => {
  if (!metadata) return template;

  let filledTemplate = template;

  // 1. Handle Author
  if (metadata.Author) {
    const authorStr = metadata.Author.split(/;|\s+and\s+/i)[0]?.trim(); // First author
    if (authorStr) {
      let family = '', initials = '';
      if (authorStr.includes(',')) {
        const parts = authorStr.split(',');
        family = parts[0].trim();
        const givenParts = parts.slice(1).join(',').trim().split(' ').filter(Boolean);
        initials = givenParts.map(p => p.charAt(0).toUpperCase()).join('.');
      } else {
        const parts = authorStr.split(' ').filter(Boolean);
        family = parts.pop() || '';
        initials = parts.map(p => p.charAt(0).toUpperCase()).join('.');
      }
      
      if (family) {
        filledTemplate = filledTemplate.replace('[Author Surname]', family);
        if (initials) {
          filledTemplate = filledTemplate.replace('[Initial(s)]', initials);
        }
      }
      filledTemplate = filledTemplate.replace('[Author Surname or Corporate Name]', `${family}, ${initials}`);
    }
  }

  // 2. Handle Year
  const dateString = metadata.CreationDate || metadata.ModDate;
  if (dateString && typeof dateString === 'string') {
    const match = dateString.match(/(\d{4})/);
    if (match) {
      const year = match[1];
      filledTemplate = filledTemplate.replace('([Year of publication])', `(${year})`);
      filledTemplate = filledTemplate.replace('([Year last updated or published])', `(${year})`);
    }
  }

  // 3. Handle Title
  if (metadata.Title) {
    const title = metadata.Title.trim();
    filledTemplate = filledTemplate.replace('*[Title of book]*', `*${title}*`);
    filledTemplate = filledTemplate.replace('\'[Title of article]\'', `'${title}'`);
    filledTemplate = filledTemplate.replace('*[Title of page/document]*', `*${title}*`);
  }
  
  return filledTemplate;
};

interface PdfFile {
  id: string;
  pdf_url: string;
  file_name: string;
  storage_path: string;
}

interface PdfPageContent {
  pageNumber: number;
  text: string;
}

interface PdfViewerSidebarProps {
  canvasId: string | null;
  onAddNode: (nodeData: { type: string; content: string; sources?: Source[] }) => void;
}

const PdfViewerSidebar = ({ canvasId, onAddNode }: PdfViewerSidebarProps) => {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [activePdf, setActivePdf] = useState<PdfFile | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [scale, setScale] = useState(1.0);
  const [pdfPagesContent, setPdfPagesContent] = useState<PdfPageContent[]>([]);
  const [pdfMetadata, setPdfMetadata] = useState<any>(null);
  const { generateTLDRWithSources, extractKeyPoints, isGenerating } = useAI();
  const { setIsPdfSidebarOpen, highlightedText, targetPage, setTargetPage } = useHighlight();
  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [activeGenerator, setActiveGenerator] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReferencePopoverOpen, setIsReferencePopoverOpen] = useState(false);

  const fetchPdfs = useCallback(async () => {
    if (!canvasId) {
      setPdfs([]);
      setActivePdf(null);
      return;
    }
    const { data, error } = await supabase
      .from('canvas_pdfs')
      .select('*')
      .eq('canvas_id', canvasId)
      .order('created_at', { ascending: true });

    if (error) {
      showError('Failed to fetch PDFs.');
      setPdfs([]);
      setActivePdf(null);
    } else {
      setPdfs(data);
      if (data.length > 0) {
        const currentActive = activePdf ? data.find(p => p.id === activePdf.id) : null;
        setActivePdf(currentActive || data[0]);
      } else {
        setActivePdf(null);
      }
    }
  }, [canvasId, activePdf]);

  useEffect(() => {
    fetchPdfs();
  }, [canvasId]);

  useEffect(() => {
    if (targetPage && targetPage !== pageNumber) {
      setPageNumber(targetPage);
      setTargetPage(null);
    }
  }, [targetPage, pageNumber, setTargetPage]);

  useEffect(() => {
    if (!isGenerating) {
      setActiveGenerator(null);
    }
  }, [isGenerating]);

  useEffect(() => {
    setPageNumber(1);
    setScale(1.0);
    setPdfPagesContent([]);
    setPdfMetadata(null);
    setSelection(null);
  }, [activePdf]);

  useEffect(() => {
    setPageInput(pageNumber.toString());
  }, [pageNumber]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const zoomFactor = 0.1;
        setScale(currentScale => {
          if (event.deltaY < 0) {
            return currentScale + zoomFactor;
          } else {
            return Math.max(0.5, currentScale - zoomFactor);
          }
        });
      }
    };

    viewer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      viewer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const onDocumentLoadSuccess = async (pdf: any) => {
    setNumPages(pdf.numPages);
    setPageNumber(1);
    const toastId = showLoading('Analyzing PDF...');
    try {
      const { info } = await pdf.getMetadata();
      setPdfMetadata(info);

      const pagePromises = Array.from({ length: pdf.numPages }, async (_, i) => {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        return {
          pageNumber: i + 1,
          text: textContent.items.map((item: any) => item.str).join(' '),
        };
      });
      
      const pagesContent = await Promise.all(pagePromises);
      setPdfPagesContent(pagesContent);
      dismissToast(toastId);
      showSuccess('PDF analysis complete.');
    } catch (e) {
      dismissToast(toastId);
      showError('Failed to analyze PDF content.');
    }
  };

  const handleFilesUpload = async (files: File[]) => {
    if (!files.length || !canvasId) return;
    const toastId = showLoading(`Uploading ${files.length} PDF(s)...`);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const { data: pathData, error: pathError } = await supabase.rpc('generate_pdf_path', { file_name: file.name });
        if (pathError) throw pathError;
        const filePath = pathData;

        const { error: uploadError } = await supabase.storage.from('pdfs').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('pdfs').getPublicUrl(filePath);

        return {
          canvas_id: canvasId,
          pdf_url: publicUrl,
          file_name: file.name,
          storage_path: filePath,
        };
      });

      const newPdfData = await Promise.all(uploadPromises);

      const { error: dbError } = await supabase.from('canvas_pdfs').insert(newPdfData);
      if (dbError) throw dbError;

      showSuccess('PDF(s) uploaded successfully!');
      fetchPdfs();
    } catch (error: any) {
      showError(error.message || 'Failed to upload PDF(s).');
    } finally {
      dismissToast(toastId);
    }
  };

  const removePdf = async () => {
    if (!activePdf || !canvasId) return;
    const toastId = showLoading('Removing PDF...');
    try {
      const { error: storageError } = await supabase.storage.from('pdfs').remove([activePdf.storage_path]);
      if (storageError) {
        console.error("Storage error on delete:", storageError.message);
      }

      const { error: dbError } = await supabase.from('canvas_pdfs').delete().eq('id', activePdf.id);
      if (dbError) throw dbError;

      showSuccess('PDF removed.');
      fetchPdfs();
    } catch (error: any) {
      showError(error.message || 'Failed to remove PDF.');
    } finally {
      dismissToast(toastId);
    }
  };

  const getFormattedPdfTextForAI = () => {
    return pdfPagesContent.map(p => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n');
  };

  const handleTldr = async () => {
    if (pdfPagesContent.length === 0) return;
    setActiveGenerator('tldr');
    try {
      const formattedText = getFormattedPdfTextForAI();
      const { summary, sources } = await generateTLDRWithSources(formattedText);
      onAddNode({ type: 'TLDR', content: summary, sources });
    } catch (e: any) {
      showError(e.message || 'Failed to generate TLDR.');
    }
  };

  const handleKeyPoints = async () => {
    if (pdfPagesContent.length === 0) return;
    setActiveGenerator('keyPoints');
    try {
      const formattedText = getFormattedPdfTextForAI();
      const { points, sources } = await extractKeyPoints(formattedText);
      const content = points.map(p => `- ${p}`).join('\n');
      onAddNode({ type: 'Key Points', content, sources });
    } catch (e: any) {
      showError(e.message || 'Failed to extract key points.');
    }
  };

  const handleCreateReferenceTemplate = (type: ReferenceType) => {
    const template = referenceTemplates[type];
    const content = fillReferenceTemplate(template, pdfMetadata);
    onAddNode({ type: 'Reference', content });
    setIsReferencePopoverOpen(false);
  };

  const handleCreateNoteFromSelection = () => {
    if (!selection) return;

    onAddNode({
      type: 'Note',
      content: selection.text,
      sources: [{ text: selection.text, page: pageNumber }],
    });
    showSuccess('Note created from selection!');
    
    setSelection(null);
  };

  const handleMouseUp = () => {
    const currentSelection = window.getSelection();
    if (viewerRef.current && currentSelection && currentSelection.toString().trim().length > 10) {
      const text = currentSelection.toString().trim();
      const range = currentSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const viewerRect = viewerRef.current.getBoundingClientRect();

      const top = rect.top - viewerRect.top + viewerRef.current.scrollTop - 45;
      const left = rect.left - viewerRect.left + rect.width / 2;

      if (top > viewerRef.current.scrollTop && left > 0 && left < viewerRect.width) {
        setSelection({ text, top, left });
      } else {
        setSelection(null);
      }
    } else {
      setTimeout(() => {
        if (window.getSelection()?.toString().trim().length === 0) {
          setSelection(null);
        }
      }, 200);
    }
  };

  const zoomIn = () => setScale(s => s + 0.2);
  const zoomOut = () => setScale(s => Math.max(0.5, s - 0.2));
  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1));

  const goToPage = (input: string) => {
    const newPage = parseInt(input, 10);
    if (!isNaN(newPage) && newPage >= 1 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
    } else {
      setPageInput(pageNumber.toString());
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      goToPage(pageInput);
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setPageInput(pageNumber.toString());
      (e.target as HTMLInputElement).blur();
    }
  };

  const handlePageInputBlur = () => {
    goToPage(pageInput);
  };

  const highlightRegex = useMemo(() => {
    if (!highlightedText) return null;

    const patterns = highlightedText
      .filter(s => s && s.trim().length > 10)
      .map(sentence => {
        const cleanSentence = sentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, ' ').trim();
        const words = cleanSentence.split(' ');
        if (words.length < 3) return null;

        const phraseLength = Math.min(5, Math.floor(words.length / 2));
        const start = Math.floor(words.length / 2) - Math.floor(phraseLength / 2);
        const phrase = words.slice(start, start + phraseLength).join(' ');

        if (!phrase) return null;

        return phrase
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\s+/g, '\\s+');
      })
      .filter((p): p is string => !!p);

    if (patterns.length === 0) return null;

    const combinedPattern = `(${patterns.join('|')})`;
    return new RegExp(combinedPattern, 'gi');
  }, [highlightedText]);

  const textRenderer = useCallback((textItem: any) => {
    if (!highlightRegex) {
      return textItem.str;
    }
    return textItem.str.replace(highlightRegex, (match: string) => `<mark>${match}</mark>`);
  }, [highlightRegex]);

  return (
    <div className="h-full w-full bg-white dark:bg-[#212121] text-black dark:text-white">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {pdfs.length > 0 && activePdf ? (
            <Select onValueChange={(pdfId) => setActivePdf(pdfs.find(p => p.id === pdfId) || null)} value={activePdf.id}>
              <SelectTrigger className="w-[250px] bg-gray-100 dark:bg-[#363636] border-gray-300 dark:border-gray-500 truncate">
                <SelectValue placeholder="Select a PDF" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#363636] text-black dark:text-white border-gray-200 dark:border-gray-500">
                {pdfs.map(pdf => (
                  <SelectItem key={pdf.id} value={pdf.id} className="hover:!bg-gray-100 dark:hover:!bg-[#424242] focus:!bg-gray-100 dark:focus:!bg-[#424242]">
                    {pdf.file_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <h2 className="text-lg font-semibold">PDF Reference</h2>
          )}
          <div className="flex items-center gap-1">
            {canvasId && (
              <Button variant="ghost" size="icon" onClick={() => setIsUploadModalOpen(true)} className="hover:bg-gray-100 dark:hover:bg-gray-700" title="Upload new PDF">
                <FilePlus2 size={20} />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsPdfSidebarOpen(false)} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={20} />
            </Button>
          </div>
        </div>

        <div ref={viewerRef} onMouseUp={handleMouseUp} className="flex-grow p-4 overflow-y-auto relative">
          {pdfs.length === 0 ? (
            <PdfUploader onFilesUploaded={handleFilesUpload} />
          ) : activePdf ? (
            <div className="flex flex-col h-full">
              {selection && !isGenerating && (
                <div style={{ position: 'absolute', top: selection.top, left: selection.left, transform: 'translateX(-50%)', zIndex: 10 }}>
                  <Button onClick={handleCreateNoteFromSelection} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    <MessageSquare size={16} className="mr-2" />
                    Create Note
                  </Button>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mb-4 flex-shrink-0">
                <Button
                  onClick={handleTldr}
                  disabled={isGenerating || pdfPagesContent.length === 0}
                  variant="outline"
                  className="bg-white dark:bg-[#212121] border-purple-500 text-purple-500 dark:text-purple-400 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 disabled:opacity-50 flex-1"
                >
                  {activeGenerator === 'tldr' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  TLDR
                </Button>
                <Button
                  onClick={handleKeyPoints}
                  disabled={isGenerating || pdfPagesContent.length === 0}
                  variant="outline"
                  className="bg-white dark:bg-[#212121] border-blue-500 text-blue-500 dark:text-blue-400 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-50 flex-1"
                >
                  {activeGenerator === 'keyPoints' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ListChecks className="mr-2 h-4 w-4" />
                  )}
                  Key Points
                </Button>
                <Popover open={isReferencePopoverOpen} onOpenChange={setIsReferencePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white dark:bg-[#212121] border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500/10 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 flex-1"
                    >
                      <Quote className="mr-2 h-4 w-4" />
                      Reference
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-1 bg-white dark:bg-[#363636] text-black dark:text-white border-gray-200 dark:border-gray-500">
                    <div className="flex flex-col">
                      <Button variant="ghost" className="justify-start" onClick={() => handleCreateReferenceTemplate('Book')}>
                        <Book className="mr-2 h-4 w-4" /> Book
                      </Button>
                      <Button variant="ghost" className="justify-start" onClick={() => handleCreateReferenceTemplate('Journal Article')}>
                        <JournalIcon className="mr-2 h-4 w-4" /> Journal Article
                      </Button>
                      <Button variant="ghost" className="justify-start" onClick={() => handleCreateReferenceTemplate('Website')}>
                        <Globe className="mr-2 h-4 w-4" /> Website
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-grow overflow-auto flex justify-center">
                <Document
                  file={activePdf.pdf_url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => showError(`Error loading PDF: ${error.message}`)}
                  loading={<Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />}
                >
                  <Page pageNumber={pageNumber} scale={scale} customTextRenderer={textRenderer} />
                </Document>
              </div>
              <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>Page</span>
                    <Input
                      type="text"
                      value={pageInput}
                      onChange={handlePageInputChange}
                      onKeyDown={handlePageInputKeyDown}
                      onBlur={handlePageInputBlur}
                      className="h-7 w-12 rounded-md border bg-gray-100 dark:bg-[#363636] border-gray-300 dark:border-gray-500 text-center focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
                      disabled={!numPages}
                    />
                    <span>of {numPages || '...'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1} className="bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"><ArrowLeft size={16} /></Button>
                    <Button variant="outline" size="icon" onClick={goToNextPage} disabled={pageNumber >= (numPages || 0)} className="bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"><ArrowRight size={16} /></Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={zoomOut} className="hover:bg-gray-100 dark:hover:bg-gray-700" title="Zoom out"><ZoomOut size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={zoomIn} className="hover:bg-gray-100 dark:hover:bg-gray-700" title="Zoom in"><ZoomIn size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={removePdf} className="text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-300" title="Remove PDF"><Trash2 size={16} /></Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>Select a PDF to view or upload a new one.</p>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-white dark:bg-[#363636] text-black dark:text-white border-gray-200 dark:border-gray-500">
          <DialogHeader>
            <DialogTitle>Upload PDFs</DialogTitle>
          </DialogHeader>
          <div className="h-64 my-4">
            <PdfUploader onFilesUploaded={(files) => {
              handleFilesUpload(files);
              setIsUploadModalOpen(false);
            }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PdfViewerSidebar;
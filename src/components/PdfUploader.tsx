import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface PdfUploaderProps {
  onFilesUploaded: (files: File[]) => void;
}

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const PdfUploader = ({ onFilesUploaded }: PdfUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      fileRejections.forEach(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          showError(`File "${rejection.file.name}" is too large. Max size is ${MAX_SIZE_MB}MB.`);
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          showError(`Invalid file type for "${rejection.file.name}". Please upload PDFs.`);
        } else {
          showError(rejection.errors[0].message);
        }
      });
    }

    if (acceptedFiles.length > 0) {
      onFilesUploaded(acceptedFiles);
    }
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer transition-colors',
        isDragActive ? 'bg-blue-500/20 border-blue-400' : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500'
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud size={48} className="text-gray-500 dark:text-gray-400 mb-4" />
      <p className="text-gray-600 dark:text-gray-400 mb-2 text-center font-semibold">
        {isDragActive ? 'Drop PDFs here...' : 'Drag & drop PDF files here'}
      </p>
      <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">or</p>
      <Button variant="outline" className="bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 pointer-events-none">
        Browse Files
      </Button>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">Max file size: {MAX_SIZE_MB}MB per file</p>
    </div>
  );
};

export default PdfUploader;
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Plus, 
  X, 
  Eraser,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';

interface FloatingToolbarProps {
  isVisible: boolean;
  onFormat: (format: string) => void;
  activeFormats: Set<string>;
}

export default function FloatingToolbar({ 
  isVisible, 
  onFormat, 
  activeFormats 
}: FloatingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Auto-collapse when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isExpanded]);

  // Reset expanded state when toolbar becomes invisible
  useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const basicButtons = [
    {
      format: 'bold',
      icon: Bold,
      title: 'Bold (Ctrl+B)',
      shortcut: 'Ctrl+B'
    },
    {
      format: 'italic',
      icon: Italic,
      title: 'Italic (Ctrl+I)',
      shortcut: 'Ctrl+I'
    },
    {
      format: 'underline',
      icon: Underline,
      title: 'Underline (Ctrl+U)',
      shortcut: 'Ctrl+U'
    },
    {
      format: 'strikethrough',
      icon: Strikethrough,
      title: 'Strikethrough',
      shortcut: 'Ctrl+Shift+S'
    },
    {
      format: 'code',
      icon: Code,
      title: 'Code (Ctrl+`)',
      shortcut: 'Ctrl+`'
    }
  ];

  const advancedButtons = [
    {
      format: 'clearFormatting',
      icon: Eraser,
      title: 'Clear all formatting',
    },
    {
      format: 'bulletList',
      icon: List,
      title: 'Bullet list',
    },
    {
      format: 'numberedList',
      icon: ListOrdered,
      title: 'Numbered list',
    },
    {
      format: 'alignLeft',
      icon: AlignLeft,
      title: 'Align left',
    },
    {
      format: 'alignCenter',
      icon: AlignCenter,
      title: 'Align center',
    },
    {
      format: 'alignRight',
      icon: AlignRight,
      title: 'Align right',
    },
    {
      format: 'alignJustify',
      icon: AlignJustify,
      title: 'Justify text',
    },
  ];

  const handleFormatClick = (format: string) => {
    onFormat(format);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      ref={toolbarRef}
      className={`absolute -top-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 flex items-center gap-1 transition-all duration-200 animate-in fade-in-0 zoom-in-95`}
    >
      {/* Basic Format buttons */}
      {basicButtons.map(({ format, icon: Icon, title }) => (
        <button
          key={format}
          onClick={() => handleFormatClick(format)}
          className={`p-2 rounded-md hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors duration-150 ${
            activeFormats.has(format) 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title={title}
        >
          <Icon size={16} />
        </button>
      ))}
      
      {/* Separator */}
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
      
      {/* Expand/Collapse button */}
      <button
        onClick={toggleExpanded}
        className="p-2 rounded-md hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-700/50 dark:hover:text-gray-300 transition-colors duration-150 text-gray-500 dark:text-gray-400"
        title={isExpanded ? 'Hide advanced options' : 'Show advanced options'}
      >
        {isExpanded ? <X size={16} /> : <Plus size={16} />}
      </button>
      
      {/* Advanced Format buttons - with smooth animation */}
      {isExpanded && (
        <>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
          <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
            {advancedButtons.map(({ format, icon: Icon, title }) => (
              <button
                key={format}
                onClick={() => handleFormatClick(format)}
                className={`p-2 rounded-md hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors duration-150 ${
                  activeFormats.has(format) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                title={title}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
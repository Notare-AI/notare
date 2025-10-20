import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TiptapToolbar from './TiptapToolbar';
import TurndownService from 'turndown';
import Showdown from 'showdown';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const turndownService = new TurndownService();
const showdownConverter = new Showdown.Converter();

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  isEditable?: boolean;
  autoFocus?: boolean;
  isMarkdownInput?: boolean;
}

const TiptapEditor = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  isEditable = true,
  autoFocus = false,
  isMarkdownInput = false,
}: TiptapEditorProps) => {
  const editorRef = useRef<any>(null);
  const lastValueRef = useRef<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: '',
    editable: isEditable,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none w-full h-full bg-transparent border-none resize-none outline-none p-0 m-0 block focus:outline-none',
      },
      handleDOMEvents: isEditable ? {
        mousedown: (view, event) => {
          event.stopPropagation();
          return false;
        },
        click: (view, event) => {
          event.stopPropagation();
          return false;
        },
      } : {},
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && value !== lastValueRef.current) {
      lastValueRef.current = value;
      
      let contentToSet = value;
      if (isMarkdownInput) {
        contentToSet = showdownConverter.makeHtml(value);
      }
      
      if (contentToSet !== editor.getHTML()) {
        editor.commands.setContent(contentToSet, false, { preserveWhitespace: 'full' });
      }
    }
  }, [value, editor, isMarkdownInput]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  useEffect(() => {
    if (editor && autoFocus) {
      editor.commands.focus('end');
    }
  }, [editor, autoFocus]);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  return (
    <div className={className}>
      {isEditable && <TiptapToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className={cn(
          'flex-grow overflow-y-auto p-3',
          { 'nodrag': isEditable },
          isEditable && 'cursor-text'
        )}
      />
    </div>
  );
};

export default TiptapEditor;
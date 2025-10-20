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

interface TiptapEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  isEditable?: boolean;
}

const turndownService = new TurndownService();
const showdownConverter = new Showdown.Converter();

const TiptapEditor = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Start writing...',
  className,
  isEditable = true,
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
    content: '', // Initial content is set via useEffect
    editable: isEditable,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none w-full h-full bg-transparent border-none resize-none outline-none p-0 m-0 block focus:outline-none',
      },
      handleDOMEvents: {
        // Prevent React Flow from handling mouse events on the editor
        mousedown: (view, event) => {
          if (isEditable) {
            event.stopPropagation();
          }
          return false;
        },
        click: (view, event) => {
          if (isEditable) {
            event.stopPropagation();
          }
          return false;
        },
        dblclick: (view, event) => {
          if (isEditable) {
            event.stopPropagation();
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
    onBlur: () => {
      if (onBlur) {
        onBlur();
      }
    },
  });

  useEffect(() => {
    if (editor && value !== lastValueRef.current) {
      lastValueRef.current = value;
      try {
        const html = showdownConverter.makeHtml(value);
        // Only update if the content has actually changed to avoid loops
        if (html !== editor.getHTML()) {
          editor.commands.setContent(html, false, { preserveWhitespace: 'full' });
        }
      } catch (error) {
        console.error('Error converting markdown to HTML:', error);
        // Fallback: set content as plain text
        editor.commands.setContent(value, false);
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

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
          { 'nodrag': isEditable }
        )}
      />
    </div>
  );
};

export default TiptapEditor;
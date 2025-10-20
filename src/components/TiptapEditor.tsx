import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TiptapToolbar from './TiptapToolbar';
import TurndownService from 'turndown';
import Showdown from 'showdown';
import { useEffect } from 'react';
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
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: '', // Initial content is set via useEffect
    editable: isEditable,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none w-full h-full bg-transparent border-none resize-none outline-none p-0 m-0 block focus:outline-none',
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
    if (editor) {
      const html = showdownConverter.makeHtml(value);
      // Update content if editor is not focused OR if it's empty (to ensure initial content loads)
      if ((!editor.isFocused || editor.isEmpty) && html !== editor.getHTML()) {
        editor.commands.setContent(html, false);
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  return (
    <div className={className}>
      {isEditable && <TiptapToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className={cn(
          'flex-grow overflow-y-auto p-3',
          { 'nodrag': isEditable }
        )}
        // Removed onPointerDown={(e) => e.stopPropagation()} to allow normal text selection and cursor placement
      />
    </div>
  );
};

export default TiptapEditor;
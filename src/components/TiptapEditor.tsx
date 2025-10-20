import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapToolbar from './TiptapToolbar';
import TurndownService from 'turndown';
import Showdown from 'showdown';
import { useEffect } from 'react';

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
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: '', // Initial content is set via useEffect
    editable: isEditable,
    editorProps: {
      attributes: {
        class:
          'nodrag prose prose-sm dark:prose-invert max-w-none w-full h-full bg-transparent border-none resize-none outline-none p-0 m-0 block focus:outline-none',
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
    if (editor && !editor.isFocused) {
      const html = showdownConverter.makeHtml(value);
      if (html !== editor.getHTML()) {
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
      <EditorContent editor={editor} className="flex-grow overflow-y-auto p-3" />
    </div>
  );
};

export default TiptapEditor;
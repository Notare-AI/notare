import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TiptapToolbarProps {
  editor: Editor | null;
}

const TiptapToolbar = ({ editor }: TiptapToolbarProps) => {
  if (!editor) {
    return null;
  }

  const buttons = [
    {
      name: 'bold',
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      name: 'italic',
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      name: 'strike',
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
    },
    {
      name: 'bulletList',
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      name: 'orderedList',
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    {
      name: 'blockquote',
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
    },
  ];

  const headingOptions = [
    { level: 1, icon: Heading1, label: 'Heading 1' },
    { level: 2, icon: Heading2, label: 'Heading 2' },
    { level: 3, icon: Heading3, label: 'Heading 3' },
  ];

  return (
    <div 
      className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#2A2A2A] rounded-t-md border-b border-gray-200 dark:border-gray-700"
      onMouseDown={(e) => e.preventDefault()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              editor.isActive('heading') ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <Heading className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent onFocusOutside={(e) => e.preventDefault()} onMouseDown={(e) => e.preventDefault()}>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            disabled={!editor.can().setParagraph()}
          >
            Paragraph
          </DropdownMenuItem>
          {headingOptions.map(option => (
            <DropdownMenuItem
              key={option.level}
              onClick={() => editor.chain().focus().toggleHeading({ level: option.level as 1 | 2 | 3 }).run()}
              disabled={!editor.can().toggleHeading({ level: option.level as 1 | 2 | 3 })}
            >
              <option.icon className="mr-2 h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {buttons.map((button) => (
        <Button
          key={button.name}
          variant="ghost"
          size="icon"
          onClick={button.action}
          disabled={!editor.isEditable}
          className={cn(
            'h-8 w-8',
            button.isActive
              ? 'bg-gray-200 dark:bg-gray-600'
              : 'hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
        >
          <button.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
};

export default TiptapToolbar;
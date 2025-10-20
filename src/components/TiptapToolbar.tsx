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
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TiptapToolbarProps {
  editor: Editor | null;
}

const TiptapToolbar = ({ editor }: TiptapToolbarProps) => {
  if (!editor) {
    return null;
  }

  const headingOptions = [
    { level: 1, icon: Heading1, label: 'Heading 1' },
    { level: 2, icon: Heading2, label: 'Heading 2' },
    { level: 3, icon: Heading3, label: 'Heading 3' },
  ];

  const highlightColors = ['#facc15', '#a3e635', '#67e8f9', '#c4b5fd', '#f9a8d4'];

  return (
    <div 
      className="flex items-center flex-wrap gap-1 p-1 bg-gray-100 dark:bg-[#2A2A2A] rounded-t-md border-b border-gray-200 dark:border-gray-700"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent text selection
        e.stopPropagation(); // Prevent node deselection
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-8 w-8"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              editor.isActive('heading') ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
            title="Headings"
          >
            <Heading className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          onPointerDownOutside={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Text Align">
            <AlignLeft className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          onPointerDownOutside={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <AlignLeft className="mr-2 h-4 w-4" /> Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <AlignCenter className="mr-2 h-4 w-4" /> Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <AlignRight className="mr-2 h-4 w-4" /> Right
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
            <AlignJustify className="mr-2 h-4 w-4" /> Justify
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn('h-8 w-8', editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn('h-8 w-8', editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn('h-8 w-8', editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', editor.isActive('highlight') ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
            side="bottom" 
            align="center" 
            className="w-auto p-2 bg-popover border-border"
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="h-7 w-7 rounded-full border-2 border-muted bg-background flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
              title="Remove highlight"
            >
              <Ban size={14} />
            </Button>
            {highlightColors.map((color) => (
              <Button
                variant="ghost"
                size="icon"
                key={color}
                onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                className="w-7 h-7 rounded-full border-2 border-transparent hover:border-foreground transition-all p-0"
                style={{ backgroundColor: color }}
                title={`Highlight ${color}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn('h-8 w-8', editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn('h-8 w-8', editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn('h-8 w-8', editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TiptapToolbar;
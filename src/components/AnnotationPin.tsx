import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Save } from 'lucide-react';

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
}

interface AnnotationPinProps {
  annotation: Annotation;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

const AnnotationPin = ({ annotation, onUpdate, onDelete }: AnnotationPinProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(annotation.text);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onUpdate(annotation.id, text);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(annotation.id);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
          style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
          onClick={(e) => e.stopPropagation()} // Prevent node selection/drag
        >
          !
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="w-64 bg-background border-border p-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()} // Prevent node selection/drag
      >
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="nodrag"
              rows={4}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSave}>
                <Save size={14} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm whitespace-pre-wrap break-words mb-2">{annotation.text || 'Empty annotation'}</p>
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                <Edit size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default AnnotationPin;
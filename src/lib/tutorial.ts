import { supabase } from '@/integrations/supabase/client';
import { markdownToLexicalJson } from '@/lib/markdownToLexical';

// Set to track ongoing tutorial canvas creations to prevent race conditions
const pendingTutorialCreations = new Set<string>();

interface TutorialNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    color?: string;
  };
}

interface TutorialEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export const createTutorialCanvasContent = (): { nodes: TutorialNode[]; edges: TutorialEdge[] } => {
  const nodes: TutorialNode[] = [
    // Sequential left-to-right layout with proper spacing to prevent overlapping
    {
      id: 'welcome',
      type: 'editableNote',
      position: { x: 100, y: 100 },
      data: {
        label: markdownToLexicalJson(`# 👋 Welcome to Notare!

Your AI-powered research assistant for PDFs and note-taking.

## What you'll learn:
✅ How to upload and process PDFs  
✅ Creating and organizing notes  
✅ Using AI to analyze documents  
✅ Building visual knowledge maps  
✅ Exporting your research  

**👉 Follow the numbered arrows to get started!**`),
        color: 'blue'
      }
    },

    {
      id: 'pdf-upload',
      type: 'editableNote',
      position: { x: 800, y: 100 },
      data: {
        label: markdownToLexicalJson(`# 📄 Step 1: Upload PDFs

## How to add documents:
1. **Drag & drop** PDF files onto the sidebar
2. Or click **"Add Document"** button
3. Wait for AI processing (usually 30-60 seconds)

## What happens next:
- AI extracts key information
- Generates automatic summary
- Creates searchable content
- Enables Q&A with your document

**Try it:** Upload a research paper or document now!

*💡 Tip: Start with shorter documents (5-20 pages) for faster processing*`),
        color: 'green'
      }
    },

    {
      id: 'creating-notes',
      type: 'editableNote',
      position: { x: 1500, y: 100 },
      data: {
        label: markdownToLexicalJson(`# ✏️ Step 2: Creating Notes

## How to make notes:
- **Select** the note button from the toolbar or press n on your keyboard
- **Type directly** to add content
- **Drag** notes to move them around
- **Resize** by dragging corners
- **Highlight text** to edit text through the popup toolbar

## Markdown Support:
\`\`\`
# Headers
**Bold text**
*Italic text*
- Bullet points
1. Numbered lists
[Links](https://example.com)
> quotes
\`\`\`

## Organization Tips:
🔵 **Blue** - Main concepts  
🟢 **Green** - Supporting evidence  
🟡 **Yellow** - Questions/todos  
🔴 **Red** - Important warnings  

**Try it:** Double-click this note to create your first note!`),
        color: 'purple'
      }
    },

    {
      id: 'ai-features',
      type: 'editableNote',
      position: { x: 2200, y: 100 },
      data: {
        label: markdownToLexicalJson(`# 🤖 Step 3: AI-Powered Analysis

## Ask Questions About Your PDFs:
- "What are the main findings?"
- "Summarize the methodology"
- "What are the limitations?"
- "How does this relate to [topic]?"

## AI Can Help You:
📝 **Summarize** long sections  
🔍 **Extract** key quotes  
🧠 **Explain** complex concepts  
🔗 **Find** connections between ideas  
💡 **Generate** research questions  

## How to Use AI:
1. Select text from a PDF/reader (if uploaded) to create a note
2. Use the AI chat button, every note has one
3. Ask specific questions about your notes
4. Copy AI responses onto the canvas for later
5. Connect notes together to build knowledge maps and context for your AI assistant

**Try it:** Upload a PDF and ask "What is this document about?"`),
        color: 'orange'
      }
    },

    {
      id: 'canvas-navigation',
      type: 'editableNote',
      position: { x: 2900, y: 100 },
      data: {
        label: markdownToLexicalJson(`# 🗺️ Step 4: Canvas Navigation

## Moving Around:
- **Mouse wheel** to zoom in/out
- **Click & drag** empty space to pan
- **Left Click + drag** to select multiple notes

## View Controls:
🔍 **Zoom to node** - Zooms to selected note 
📍 **Center view** - Return to middle   

## Connecting Ideas:
- **Drag** from note edge to another note
- Creates visual connections
- Shows relationships between concepts
- Helps build knowledge maps

## Canvas Tips:
- Spread notes out for clarity
- Group related concepts nearby
- Use colors to categorize themes
- Connect notes to show relationships

**Try it:** Zoom in/out and drag this canvas around!`),
        color: 'pink'
      }
    },

    {
      id: 'organizing-research',
      type: 'editableNote',
      position: { x: 3600, y: 100 },
      data: {
        label: markdownToLexicalJson(`# 📊 Step 5: Organizing Your Research

## Best Practices:
1. **One canvas per project** or topic
2. **Color-code** by theme or source
3. **Connect** related ideas with lines
4. **Linked References** - Link notes together to show relationships
5. **Group** similar concepts together
6. **Use headers** to structure content

## Canvas Organization Ideas:
📚 **Literature Review** - One note per paper  
🧪 **Methodology** - Steps and procedures  
📈 **Results** - Findings and data  
💭 **Ideas** - Questions and hypotheses  
📝 **Writing** - Outline and drafts  

## Collaboration:
- **Share canvas** with teammates
- **Export** notes as Markdown
- **Copy** important insights
- **Sync** across all your devices

**Pro tip:** Create a "Table of Contents" note with links to different sections!`),
        color: 'cyan'
      }
    },

    {
      id: 'export-sharing',
      type: 'editableNote',
      position: { x: 4300, y: 100 },
      data: {
        label: markdownToLexicalJson(`# 🚀 Step 6: Export & Share Your Work

## Exporting Options:
📄 **Markdown** - For writing and documentation  
🔗 **Copy notes** - Paste into other apps  
🌐 **Share canvas** - Collaborate with others  
💾 **Auto-sync** - Access from any device  

## Sharing Your Canvas:
1. Click **Share** button in top toolbar
2. Toggle **"Make canvas public"**
3. **Copy link** to share with others
4. Others can **view and copy** your canvas

## Integration Workflow:
- Export notes to **Notion, Obsidian, etc.**
- Copy insights to **research papers**
- Share findings with **collaborators**
- Build **knowledge base** over time

## You Own Your Data:
✅ Export anytime in standard formats  
✅ No vendor lock-in   
✅ Privacy-focused design  

**You're ready to start your research journey! 🎓**`),
        color: 'lime'
      }
    },

    {
      id: 'next-steps',
      type: 'editableNote',
      position: { x: 5000, y: 100 },
      data: {
        label: markdownToLexicalJson(`# 🎯 Next Steps - Start Your Research!

## Ready to Begin:
1. ✅ **Create your first canvas** (+ New Canvas)
2. ✅ **Upload a PDF** you want to analyze
3. ✅ **Ask AI questions** about your document
4. ✅ **Take notes** on key insights
5. ✅ **Connect ideas** with visual links

## Need Help?
📧 **Support** - Contact us anytime via email: NotareAI@outlook.com 
📚 **Documentation** - Detailed guides here: https://www.notare.uk/blog
💬 **Community** - Tips and best practices via Discord: https://discord.gg/FKqKpcy3

## Quick Shortcuts:
- **View Controls:** → V
- **Pan Canvas:** → H
- **New Note:** → N 
- **Ctrl+Z** → Undo/Redo
- **Mouse wheel** → Zoom
- **Space+drag** → Pan canvas
- **Delete** → Remove selected items

**Happy researching! 🔬📚✨**`),
        color: 'orange'
      }
    }
  ];

  const edges: TutorialEdge[] = [
    // Simple left-to-right sequential flow
    { id: 'e1', source: 'welcome', target: 'pdf-upload', type: 'smoothstep' },
    { id: 'e2', source: 'pdf-upload', target: 'creating-notes', type: 'smoothstep' },
    { id: 'e3', source: 'creating-notes', target: 'ai-features', type: 'smoothstep' },
    { id: 'e4', source: 'ai-features', target: 'canvas-navigation', type: 'smoothstep' },
    { id: 'e5', source: 'canvas-navigation', target: 'organizing-research', type: 'smoothstep' },
    { id: 'e6', source: 'organizing-research', target: 'export-sharing', type: 'smoothstep' },
    { id: 'e7', source: 'export-sharing', target: 'next-steps', type: 'smoothstep' }
  ];

  return { nodes, edges };
};

export const createTutorialCanvas = async (userId: string): Promise<{ data: any; error: any }> => {
  // Prevent concurrent tutorial canvas creation for the same user
  if (pendingTutorialCreations.has(userId)) {
    return { data: null, error: { message: 'Tutorial canvas creation already in progress' } };
  }

  // Add user to pending set
  pendingTutorialCreations.add(userId);

  try {
    // Double-check that user still needs a tutorial (no canvases exist)
    const needsTutorial = await checkIfUserNeedsTutorial(userId);
    if (!needsTutorial) {
      return { data: null, error: { message: 'User already has canvases, tutorial not needed' } };
    }

    const tutorialContent = createTutorialCanvasContent();
    
    const { data, error } = await supabase
      .from('canvases')
      .insert([{
        title: '🎯 Notare Tutorial - Learn How to Use Your Research Assistant',
        canvas_data: tutorialContent,
        owner_id: userId
        // Note: Removed is_tutorial field as it may not exist in schema
      }])
      .select('id, title, is_public')
      .single();

    return { data, error };
  } finally {
    // Always remove user from pending set, even if there was an error
    pendingTutorialCreations.delete(userId);
  }
};

export const checkIfUserNeedsTutorial = async (userId: string): Promise<boolean> => {
  try {
    const { data: canvases, error } = await supabase
      .from('canvases')
      .select('id, title')
      .eq('owner_id', userId)
      .limit(5); // Check first few canvases to see if any exist

    if (error) {
      console.error('Error checking user canvases:', error);
      return false; // On error, don't create tutorial to be safe
    }

    // If user has no canvases, they need the tutorial
    // Also check if there's already a tutorial canvas to prevent duplicates
    const hasTutorialCanvas = canvases?.some(canvas => 
      canvas.title.includes('Tutorial') || 
      canvas.title.includes('🎯')
    );

    return !canvases || (canvases.length === 0 && !hasTutorialCanvas);
  } catch (error) {
    console.error('Exception in checkIfUserNeedsTutorial:', error);
    return false; // On exception, don't create tutorial to be safe
  }
};
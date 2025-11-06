import { supabase } from '@/integrations/supabase/client';

interface TutorialNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    content: string;
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
    {
      id: 'welcome',
      type: 'editableNote',
      position: { x: 100, y: 100 },
      data: {
        content: `# 🎯 Welcome to Notare!

Your AI-powered research assistant is ready to help you:

**✨ Key Features:**
- Upload PDFs and get instant insights
- Create visual knowledge maps  
- Ask AI questions about your documents
- Connect ideas with visual links
- Export everything as Markdown

**👋 Let's get started!**
Follow this tutorial to learn the basics.`,
        color: 'blue'
      }
    },
    {
      id: 'pdf-processing',
      type: 'editableNote',
      position: { x: 500, y: 100 },
      data: {
        content: `## 📄 PDF Processing Magic

**How to upload documents:**
1. Look for the sidebar on the left
2. Drag & drop PDF files directly
3. Or use the upload button

**What happens next:**
- AI reads your entire document
- Extracts key insights automatically
- Generates summary nodes
- Creates reference nodes for citations

Try uploading a research paper to see the magic! 🪄`,
        color: 'green'
      }
    },
    {
      id: 'canvas-features',
      type: 'editableNote',
      position: { x: 100, y: 350 },
      data: {
        content: `## 🗺️ Canvas Features

**Navigation:**
- **Zoom:** Mouse wheel or trackpad
- **Pan:** Drag with mouse/trackpad
- **Fit View:** Reset zoom to see everything

**Creating Notes:**
- **Double-click** anywhere to create a note
- Edit notes by clicking on them
- Use **Markdown** for formatting

**Organizing:**
- Drag notes to arrange them
- Use different colors for categories
- Group related ideas together`,
        color: 'purple'
      }
    },
    {
      id: 'ai-features',
      type: 'editableNote',
      position: { x: 500, y: 350 },
      data: {
        content: `## 🤖 AI-Powered Features

**Ask Questions:**
- Click the AI button on any note
- Ask about your uploaded documents
- Get instant, contextual answers

**Content Generation:**
- Create summaries (TL;DR nodes)
- Extract key points
- Generate reference lists

**Smart Connections:**
- AI suggests related content
- Auto-links similar concepts
- Helps you discover patterns

The more documents you upload, the smarter your research becomes! 🧠`,
        color: 'orange'
      }
    },
    {
      id: 'getting-started',
      type: 'editableNote',
      position: { x: 300, y: 600 },
      data: {
        content: `## 🚀 Ready to Start?

**Your Next Steps:**
1. **Upload a PDF** - Try a research paper or article
2. **Create your first note** - Double-click anywhere
3. **Connect ideas** - Drag from one note to another
4. **Ask the AI** - Click the sparkle button and ask questions

**Pro Tips:**
- Use descriptive canvas titles for easy finding
- Color-code notes by topic or importance
- Export to Markdown to backup your work

**Need Help?**
- Check the settings for themes and preferences
- Visit our FAQ for common questions
- Join our Discord community for support

Happy researching! 🎓`,
        color: 'pink'
      }
    }
  ];

  const edges: TutorialEdge[] = [
    {
      id: 'e1-2',
      source: 'welcome',
      target: 'pdf-processing',
      type: 'smoothstep'
    },
    {
      id: 'e1-3',
      source: 'welcome',
      target: 'canvas-features',
      type: 'smoothstep'
    },
    {
      id: 'e2-4',
      source: 'pdf-processing',
      target: 'ai-features',
      type: 'smoothstep'
    },
    {
      id: 'e3-5',
      source: 'canvas-features',
      target: 'getting-started',
      type: 'smoothstep'
    },
    {
      id: 'e4-5',
      source: 'ai-features',
      target: 'getting-started',
      type: 'smoothstep'
    }
  ];

  return { nodes, edges };
};

export const createTutorialCanvas = async (userId: string): Promise<{ data: any; error: any }> => {
  const tutorialContent = createTutorialCanvasContent();
  
  const { data, error } = await supabase
    .from('canvases')
    .insert([{
      title: '🎯 Notare Tutorial - Learn the Basics',
      canvas_data: tutorialContent,
      owner_id: userId
      // Note: Removed is_tutorial field as it may not exist in schema
    }])
    .select('id, title, is_public')
    .single();

  return { data, error };
};

export const checkIfUserNeedsTutorial = async (userId: string): Promise<boolean> => {
  const { data: canvases, error } = await supabase
    .from('canvases')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);

  if (error) {
    console.error('Error checking user canvases:', error);
    return false;
  }

  // If user has no canvases, they need the tutorial
  return !canvases || canvases.length === 0;
};
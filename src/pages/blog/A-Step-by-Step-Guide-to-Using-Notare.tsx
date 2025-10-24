import BlogLayout from '@/components/blog/BlogLayout';
import { posts } from '@/lib/blog';
import { format } from 'date-fns';

const post = posts.find(p => p.slug === 'a-step-by-step-guide-to-using-notare');

const AStepByStepGuideToUsingNotare = () => {
  if (!post) return null;

  return (
    <BlogLayout>
      <article className="prose dark:prose-invert max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold !mb-2">{post.title}</h1>
          <p className="text-muted-foreground">
            Published on {format(new Date(post.date), 'MMMM dd, yyyy')} by {post.author}
          </p>
        </header>

        <p>Welcome to Notare! We're thrilled to have you on board. Notare is an AI-powered visual workspace designed to help you turn complex information into clear, interconnected knowledge maps. Whether you're a student tackling dense research papers, a professional analyzing market trends, or a lifelong learner connecting ideas, Notare is built to enhance your understanding and productivity.</p>
        <p>This guide will walk you through everything you need to know to get the most out of your Notare experience.</p>

        <h2>Getting Started with Notare</h2>
        <p>Getting up and running with Notare is simple. As a web-based application, there's no installation required.</p>
        <ol>
          <li><strong>Create an Account:</strong> Head over to our <a href="/login">login page</a> to sign up. You can use your email address or sign in with Google or Microsoft for quick access.</li>
          <li><strong>Your Dashboard:</strong> Once you're in, you'll see your dashboard. On the left is the sidebar where you'll manage your canvases (we'll get to those in a moment). The large area on the right is your main workspace—an infinite canvas where your ideas come to life.</li>
        </ol>

        <h2>Key Features and How to Use Them</h2>
        <p>Notare's power lies in its core features. Here’s how to use them:</p>
        
        <h4>1. The Infinite Canvas</h4>
        <p>This is your playground. You can create notes, known as "nodes," and connect them to visualize relationships between ideas.</p>
        <ul>
          <li><strong>Create a Note:</strong> Simply double-click anywhere on the canvas to create a new note.</li>
          <li><strong>Connect Ideas:</strong> Click and drag from the edge of one node to another to create a connection. This helps you see how different pieces of information relate.</li>
        </ul>

        <h4>2. Seamless PDF Integration</h4>
        <p>Turn static documents into dynamic knowledge bases.</p>
        <ul>
          <li><strong>Upload a PDF:</strong> Open the PDF sidebar using the document icon on the right, and you can drag-and-drop your files to upload them to a canvas.</li>
          <li><strong>Highlight and Create:</strong> Highlight any text within your PDF, and a pop-up will appear. Click "Create Note" to instantly turn that highlight into a new node on your canvas, automatically linked back to its source.</li>
        </ul>

        <h4>3. AI-Powered Insights</h4>
        <p>Let our AI do the heavy lifting so you can focus on understanding.</p>
        <ul>
          <li><strong>TLDR & Key Points:</strong> With an uploaded PDF, use the "TLDR" and "Key Points" buttons in the PDF sidebar to generate concise summaries or bulleted lists of the most important information.</li>
          <li><strong>AI Chat:</strong> Every note has a built-in AI chat assistant. Open it up to ask questions about the note's content, ask for rephrasing, or brainstorm new ideas.</li>
        </ul>

        <h2>Advanced Tips and Tricks</h2>
        <ul>
          <li><strong>Keyboard Shortcuts:</strong> Speed up your workflow with hotkeys. Press 'V' for the select tool, 'H' for the pan tool (to move around the canvas), and 'N' to quickly switch to the note creation tool.</li>
          <li><strong>Color-Code Your Notes:</strong> Use the color palette in the node toolbar to organize your ideas visually. Assign different colors to themes, topics, or categories.</li>
          <li><strong>Download Your Knowledge:</strong> You can download an individual note or an entire branch of connected notes as a clean Markdown file. It's your data; take it with you anytime.</li>
        </ul>

        <h2>Real-World Use Cases</h2>
        <ul>
          <li><strong>For Students:</strong> A history student is writing a thesis on the Roman Empire. They upload dozens of academic papers as PDFs, use the AI to extract key arguments and dates, and then connect these nodes on the canvas to visually map out their entire argument, complete with source links.</li>
          <li><strong>For Professionals:</strong> A UX researcher synthesizes user interview transcripts. They create nodes for each key user insight and connect them to identify overarching themes and pain points, creating a clear, shareable map of their findings for the product team.</li>
        </ul>

        <h2>Frequently Asked Questions (FAQs)</h2>
        <dl>
          <dt>Is my data secure?</dt>
          <dd>Absolutely. Your data is securely stored using Supabase's enterprise-grade security. We value your privacy and will never train our AI models on your notes.</dd>
          <dt>Can I use Notare offline?</dt>
          <dd>Currently, Notare requires an active internet connection to sync your work and leverage its AI features.</dd>
          <dt>How are AI credits used?</dt>
          <dd>Each time you use an AI feature—like generating a TLDR, extracting key points, or getting a chat response—it consumes one AI credit. Your credits reset monthly based on your plan.</dd>
        </dl>

        <h2>Start Your Journey to Clarity</h2>
        <p>Notare is more than just a note-taking app; it's a new way to think. By visualizing information, you can uncover connections and insights you might have otherwise missed.</p>
        <p>Ready to get started? <a href="/dashboard">Sign up for free today</a> and start building your knowledge map!</p>
        <p>We'd love to hear your feedback. Connect with us on <a href="https://x.com/ANomadicDev" target="_blank" rel="noopener noreferrer">Twitter</a> or join our <a href="https://discord.gg/j7VHUmr8" target="_blank" rel="noopener noreferrer">Discord community</a>.</p>
      </article>
    </BlogLayout>
  );
};

export default AStepByStepGuideToUsingNotare;
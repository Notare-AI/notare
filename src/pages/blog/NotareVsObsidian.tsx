import BlogLayout from '@/components/blog/BlogLayout';
import { posts } from '@/lib/blog';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

const post = posts.find(p => p.slug === 'notare-vs-obsidian');

const markdownContent = `
# Notare vs. Obsidian: Which is Better for Visual Note-Taking in 2025?

**Visual note-taking is a game-changer** for students, researchers, and professionals. But with so many tools available, how do you choose the right one?

If you’re torn between **Notare** (the AI-powered visual knowledge platform) and **Obsidian** (the popular Markdown-based note-taking app), this guide will help you decide.

We’ll compare **features, use cases, AI capabilities, and pricing** to determine which tool is best for **your workflow**.

---

## Quick Overview: Notare vs. Obsidian
| Feature               | Notare                          | Obsidian                        |
|-----------------------|---------------------------------|---------------------------------|
| **Primary Use Case**  | Visual knowledge mapping       | Markdown-based note-taking      |
| **AI Capabilities**   | ✅ Summarize PDFs, AI chat      | ❌ (Plugins required)           |
| **Canvas Type**       | Infinite visual canvas          | Graph view (plugins required)  |
| **PDF Integration**   | ✅ Upload and summarize PDFs    | ❌ Manual uploads only          |
| **Data Ownership**    | ✅ Export as Markdown           | ✅ Local files                  |
| **Pricing**           | Free tier + paid plans          | Free (plugins may cost)         |
| **Best For**          | Researchers, visual learners   | Writers, developers, tinkerers |

---

## 1. Visual Note-Taking: Infinite Canvas vs. Graph View

### Notare: Built for Visual Thinkers
Notare’s **infinite canvas** lets you:
- **Drag and drop notes, PDFs, and images** anywhere.
- **Connect ideas with edges** to show relationships.
- **Zoom in/out** to see the big picture or dive into details.

*Example:* A PhD student can **map an entire literature review** on one canvas, linking papers by themes or arguments.

![Notare Canvas Example](https://notare.uk/images/notare-canvas-example.png)

### Obsidian: Graph View (Plugin Required)
Obsidian’s **Graph View** shows links between notes but:
- Requires **manual linking** (e.g., \`[[Note]]\` syntax).
- No **drag-and-drop freedom**—notes are tied to files.
- Graph View is a **plugin**, not a core feature.

*Example:* You can see connections between notes, but it’s **less intuitive for visual mapping**.

![Obsidian Graph View](https://notare.uk/images/obsidian-graph-view.png)

**Winner:** **Notare** for true visual note-taking.

## 2. AI Capabilities: Built-In vs. Plugin-Dependent

### Notare: AI-Powered from Day One
Notare’s AI helps you:
- **Summarize PDFs** in one click.
- **Extract key insights** from research papers.
- **Chat with your notes** to ask questions or clarify ideas.

*Example:* Upload a 50-page paper, and Notare will **generate a 1-page summary** with key points.

### Obsidian: AI via Plugins
Obsidian **doesn’t include AI natively**. You’ll need plugins like:
- **Text Generator** (for AI writing).
- **Readwise** (for importing highlights).

*Example:* To summarize a PDF, you’d need to **manually copy-paste text into a plugin**—no direct integration.

**Winner:** **Notare** for seamless AI integration.

## 3. PDF Integration: Upload and Summarize vs. Manual Work

### Notare: Upload and Summarize
- **Drag and drop PDFs** directly into your canvas.
- **AI summarizes the PDF** and extracts key points.
- **Link quotes or ideas** to your visual map.

*Example:* A researcher can **upload 10 papers**, let Notare summarize them, and then **build a connected map of arguments**.

### Obsidian: Manual Work Required
- **No native PDF support**. You must:
  1. Extract text from PDFs manually (e.g., using a third-party tool).
  2. Paste the text into Obsidian.
  3. Manually link notes.

*Example:* Summarizing a PDF in Obsidian requires **3+ tools and manual effort**.

**Winner:** **Notare** for effortless PDF handling.

## 4. Collaboration: Shared Canvases vs. Local Files

### Notare: Built for Teams
- **Share canvases** with collaborators (e.g., supervisors, classmates).
- **Real-time editing** (coming soon).
- **Export as Markdown** to avoid lock-in.

*Example:* A research team can **collaborate on a shared literature review map**.

### Obsidian: Local-First Philosophy
- **No built-in collaboration**. Options include:
  - **Syncing files** via Dropbox or Git (complex setup).
  - **Plugins like Live Sync** (experimental).

*Example:* Collaborating in Obsidian requires **technical setup** and manual file management.

**Winner:** **Notare** for seamless collaboration.

## 5. Data Ownership: Export vs. Local Files

### Notare: Export Anytime
- **Export canvases as Markdown** to use in other tools (e.g., Obsidian, Logseq).
- **No vendor lock-in**—your data is yours.

### Obsidian: Local Files by Default
- **Your notes are stored locally** (no cloud dependency).
- **Plugins can sync to cloud services** (e.g., Dropbox, GitHub).

**Winner:** **Tie**—both prioritize data ownership.

## 6. Pricing: Free Tier vs. Plugin Costs

### Notare: Transparent Pricing
| Plan          | Price  | AI Credits | Canvases | PDF Uploads |
|---------------|--------|------------|----------|-------------|
| Free          | £0     | 50         | 3        | 5           |
| Personal      | £8/mo  | 200        | Unlimited| 20          |
| Professional  | £20/mo | 1,000      | Unlimited| Unlimited   |

### Obsidian: Free but Plugin-Heavy
- **Core app is free**, but advanced features require **paid plugins**:
  - **Readwise**: $7.99/month for PDF highlights.
  - **Text Generator**: $10/month for AI writing.
  - **Sync**: $8/month for cloud sync.

**Winner:** **Notare** for predictable pricing.

---

## Which Tool is Right for You?

### Choose Notare If You:
- **Need AI-powered summaries** of PDFs or notes.
- **Prefer visual, spatial note-taking** (e.g., mind maps, connected ideas).
- **Collaborate with others** on research or projects.
- **Want a seamless, all-in-one tool** without plugins.

*Example Users:*
- PhD students writing literature reviews.
- Researchers synthesizing complex papers.
- Teams working on shared projects.

### Choose Obsidian If You:
- **Love Markdown and plain-text notes**.
- **Enjoy customizing your workflow** with plugins.
- **Work alone** and prefer local files.
- **Don’t need AI or PDF integration**.

*Example Users:*
- Developers or writers who love tinkering.
- Solo researchers who prefer local control.

---

## Final Verdict: Notare vs. Obsidian
| Category          | Winner   | Why?                                                                 |
|-------------------|-----------|----------------------------------------------------------------------|
| Visual Note-Taking| Notare    | Infinite canvas + drag-and-drop freedom.                           |
| AI Capabilities   | Notare    | Built-in PDF summarization and AI chat.                            |
| PDF Integration   | Notare    | Upload and summarize PDFs natively.                                |
| Collaboration     | Notare    | Shared canvases for teams.                                          |
| Data Ownership    | Tie       | Both allow exports/local files.                                    |
| Pricing           | Notare    | Transparent tiers vs. Obsidian’s plugin costs.                     |

**Overall Winner: Notare** for researchers, students, and teams who need **AI-powered visual note-taking**.

**But Obsidian is better** if you prefer **Markdown, local files, and customization**.

---

## Try Notare for Free

Ready to **supercharge your research with AI and visual maps**? Sign up for Notare’s free plan and get:
✅ **50 AI credits** to summarize PDFs.
✅ **3 canvases** to organize your notes.
✅ **No credit card required**.

[**Start Mapping for Free →**](https://notare.uk/signup)

---

## FAQ: Notare vs. Obsidian

### Can I use Notare and Obsidian together?
Yes! Export your Notare canvases as **Markdown** and import them into Obsidian for local storage.

### Does Obsidian have AI features?
Obsidian **doesn’t include AI natively**, but you can add plugins like **Text Generator** or **Readwise** for AI writing or PDF highlights.

### Is Notare better for academic research?
If you need **AI summaries, PDF integration, and visual mapping**, Notare is the better choice. Obsidian is ideal for **Markdown lovers** who prefer local files.

### Can I collaborate in Obsidian?
Obsidian is **local-first**, so collaboration requires **third-party sync tools** (e.g., Dropbox or Git). Notare includes **built-in shared canvases**.
`;

const NotareVsObsidian = () => {
  if (!post) return null;

  return (
    <BlogLayout>
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "Notare vs. Obsidian: Which is Better for Visual Note-Taking in 2025?",
            "description": "Compare Notare and Obsidian for visual note-taking, AI capabilities, and collaboration. Discover which tool fits your research or academic workflow.",
            "datePublished": "2025-10-27",
            "dateModified": "2025-10-27",
            "author": {
              "@type": "Person",
              "name": "Niall Parkinson"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Notare",
              "logo": {
                "@type": "ImageObject",
                "url": "https://notare.uk/src/images/Notare%20logo.png",
                "width": "600",
                "height": "60"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://notare.uk/blog/notare-vs-obsidian"
            },
            "image": {
              "@type": "ImageObject",
              "url": "https://notare.uk/images/notare-vs-obsidian.png",
              "width": "1200",
              "height": "630"
            },
            "keywords": ["Notare vs. Obsidian", "visual note-taking tools", "AI note-taking", "best tools for researchers", "PDF summarization"]
          }
        `}
      </script>

      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Comparison",
            "name": "Notare vs. Obsidian: Visual Note-Taking Comparison",
            "description": "A detailed comparison of Notare and Obsidian for visual note-taking, AI capabilities, and collaboration.",
            "itemReviewed": [
              {
                "@type": "SoftwareApplication",
                "name": "Notare",
                "description": "AI-powered visual knowledge platform for summarizing PDFs and building mind maps.",
                "operatingSystem": "Web",
                "applicationCategory": "ProductivityApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "GBP",
                  "url": "https://notare.uk/pricing"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "Obsidian",
                "description": "Markdown-based note-taking app with plugins for customization.",
                "operatingSystem": "Windows, Mac, Linux, Mobile",
                "applicationCategory": "ProductivityApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "url": "https://obsidian.md/pricing"
                }
              }
            ],
            "review": {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5",
                "worstRating": "1"
              },
              "author": {
                "@type": "Person",
                "name": "Niall Parkinson"
              },
              "reviewBody": "Notare is the best choice for researchers and students who need AI-powered visual note-taking, while Obsidian is ideal for Markdown enthusiasts who prefer local files and customization."
            }
          }
        `}
      </script>

      <article className="prose dark:prose-invert max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold !mb-2">{post.title}</h1>
          <p className="text-muted-foreground">
            Published on {format(new Date(post.date), 'MMMM dd, yyyy')} by {post.author}
          </p>
        </header>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </ReactMarkdown>
      </article>
    </BlogLayout>
  );
};

export default NotareVsObsidian;
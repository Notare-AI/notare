import { Check, LayoutDashboard, Brain, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: "Build Visual Knowledge Maps – Say Goodbye to Linear Notes",
    description: "Tired of notes that don't connect? Notare's infinite canvas lets you create visual maps of your ideas, making complex topics easy to understand and remember.",
    points: [
      "Drag-and-drop nodes for intuitive organization",
      "Connect related ideas with animated edges",
      "Perfect for mind mapping, brainstorming, and project planning"
    ],
    icon: LayoutDashboard,
    color: "text-blue-500",
  },
  {
    title: "AI Note Taking – Extract Insights Without the Effort",
    description: "Manual note-taking from long documents is time-consuming. Notare's AI generates summaries, key points, and references instantly, saving you hours.",
    points: [
      "One-click TLDR summaries and key point extraction",
      "Automatic references in APA, MLA, or custom formats",
      "500+ AI credits on premium plans for unlimited productivity"
    ],
    icon: Brain,
    color: "text-purple-500",
  },
  {
    title: "Seamless PDF Note Taking – Annotate and Connect Directly",
    description: "PDFs are hard to navigate and extract from. Notare lets you upload, highlight, and link PDFs to your notes on the same canvas.",
    points: [
      "Upload multiple PDFs (up to 50 on Pro)",
      "Highlight text and create linked notes instantly",
      "Sync across devices with 5GB storage on Pro"
    ],
    icon: FileText,
    color: "text-green-500",
  },
  {
    title: "Own Your Data – Download and Export with Ease",
    description: "Take full control of your notes. Notare lets you download individual notes or entire branches as Markdown files, ensuring you always have access to your data offline.",
    points: [
      "One-click download for single nodes as Markdown",
      "Export entire note branches for complete backups",
      "No vendor lock-in—your data is always portable"
    ],
    icon: Download,
    color: "text-orange-500",
  },
];

const Features = () => {
  return (
    <section id="features" className="container py-20 md:py-24 space-y-24">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Why Notare is the Best Note Taking App for Students, Professionals, and Researchers
      </h2>
      
      {features.map((feature, index) => (
        <div 
          key={index} 
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center",
            index % 2 === 1 && "md:flex-row-reverse"
          )}
        >
          <div className="bg-background p-8 rounded-xl shadow-lg border border-border/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center mb-6">
              <feature.icon className={cn("h-12 w-12", feature.color)} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center md:text-left">{feature.title}</h3>
            <p className="text-lg text-muted-foreground mb-6 text-center md:text-left">{feature.description}</p>
            <ul className="space-y-3">
              {feature.points.map((point, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className={cn("h-5 w-5 flex-shrink-0", feature.color)} />
                  <span className="text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden md:block">
            {/* Placeholder for future image or graphic */}
            <div className="h-full w-full rounded-xl bg-muted/50 flex items-center justify-center">
              <p className="text-muted-foreground">Feature Visual</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Features;
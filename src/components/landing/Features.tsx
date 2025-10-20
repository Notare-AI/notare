import { Check } from 'lucide-react';

const Features = () => {
  return (
    <section id="features" className="container py-20 md:py-24 space-y-24">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Why Notare is the Best Note Taking App for Students, Professionals, and Researchers
      </h2>
      
      {/* Feature 1: Visual Knowledge Maps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-2xl font-bold mb-4">Build Visual Knowledge Maps – Say Goodbye to Linear Notes</h3>
          <p className="text-lg text-muted-foreground mb-6">
            Tired of notes that don't connect? Notare's infinite canvas lets you create visual maps of your ideas, making complex topics easy to understand and remember.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2"><Check className="text-green-500" /> Drag-and-drop nodes for intuitive organization</li>
            <li className="flex items-center gap-2"><Check className="text-green-500" /> Connect related ideas with animated edges</li>
            <li className="flex items-center gap-2"><Check className="text-green-500" /> Perfect for mind mapping, brainstorming, and project planning</li>
          </ul>
        </div>
      </div>

      {/* Feature 2: AI-Powered Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="md:order-1">
          <h3 className="text-2xl font-bold mb-4">AI Note Taking – Extract Insights Without the Effort</h3>
          <p className="text-lg text-muted-foreground mb-6">
            Manual note-taking from long documents is time-consuming. Notare's AI generates summaries, key points, and references instantly, saving you hours.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2"><Check className="text-green-500" /> One-click TLDR summaries and key point extraction</li>
            <li className="flex items-center gap-2"><Check className="text-green-500" /> Automatic references in APA, MLA, or custom formats</li>
            <li className="flex items-center gap-2"><Check className="text-green-500" /> 500+ AI credits on premium plans for unlimited productivity</li>
          </ul>
        </div>
      </div>

      {/* Feature 3: PDF Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-2xl font-bold mb-4">Seamless PDF Note Taking – Annotate and Connect Directly</h3>
          <p className="text-lg text-muted-foreground mb-6">
            PDFs are hard to navigate and extract from. Notare lets you upload, highlight, and link PDFs to your notes on the same canvas.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2"><Check className="text-green-500" /> Upload multiple PDFs (up to 50 on Pro)</li>
            <li className="flex items-center gap-2"><Check className="text-green-500" /> Highlight text and create linked notes instantly</li>
            <li className="flex items-center gap-2"><Check className="text-green-500" /> Sync across devices with 5GB storage on Pro</li>
          </ul>
        </div>
      </div>

      {/* Feature 4: Privacy and Sync */}
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">Privacy-Focused Note Taking – Your Data Stays Yours</h3>
        <p className="text-lg text-muted-foreground mb-6">
          Worried about AI training on your notes? Notare guarantees no data training, with secure sync across all your devices.
        </p>
        <ul className="space-y-2 text-left max-w-md mx-auto">
          <li className="flex items-center gap-2"><Check className="text-green-500" /> End-to-end encryption and privacy by design</li>
          <li className="flex items-center gap-2"><Check className="text-green-500" /> Real-time sync on mobile, web, and desktop</li>
          <li className="flex items-center gap-2"><Check className="text-green-500" /> Export notes as Markdown anytime</li>
        </ul>
      </div>
    </section>
  );
};

export default Features;
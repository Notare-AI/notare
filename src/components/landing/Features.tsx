import Feature1Image from '@/images/feature-1.png';
import Feature2Image from '@/images/feature-2.png';
import { BrainCircuit } from 'lucide-react';

const Features = () => {
  return (
    <section className="container py-20 md:py-24 space-y-24">
      {/* Feature 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI-Powered Insights</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Generate summaries, extract key points, and create references from your documents with a single click. Supercharge your research and understanding.
          </p>
        </div>
        <div>
          <img
            src={Feature1Image}
            alt="AI generating a summary from a document."
            className="rounded-lg shadow-xl border border-border/20"
          />
        </div>
      </div>

      {/* Feature 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="md:order-2">
          <h2 className="text-3xl font-bold tracking-tight">Interactive PDF Canvas</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload your documents and interact with them directly on an infinite canvas. Highlight text, create notes, and visually connect ideas without losing context.
          </p>
        </div>
        <div className="md:order-1">
          <img
            src={Feature2Image}
            alt="An interactive canvas with a PDF and connected notes."
            className="rounded-lg shadow-xl border border-border/20"
          />
        </div>
      </div>
      
      {/* Feature 3 */}
      <div className="text-center max-w-2xl mx-auto pt-12">
        <div className="flex justify-center mb-4">
            <div className="p-3 bg-card rounded-full border">
                <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Visual Knowledge Maps</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Create notes, connect ideas, and build visual maps that mirror the way you think and learn. Organize your knowledge in a way that makes sense to you.
        </p>
      </div>
    </section>
  );
};

export default Features;
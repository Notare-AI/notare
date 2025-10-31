import { UploadCloud, Zap, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: UploadCloud,
    title: "1. Upload PDFs",
    description: "Import research papers, articles, or your existing notes directly into your canvas."
  },
  {
    icon: Zap,
    title: "2. Generate AI Insights",
    description: "Notare summarizes arguments, identifies key findings, and highlights research gaps for you."
  },
  {
    icon: LinkIcon,
    title: "3. Link and Export",
    description: "Connect insights visually on the canvas and export your synthesis as clean Markdown notes."
  }
];

const SolutionSection = () => {
  return (
    <section id="solution" className="container py-20 md:py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold">From paper overload to clear synthesis in minutes.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {steps.map((step) => (
          <div key={step.title} className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-6">
              <step.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-16">
        <Button asChild size="lg">
          <Link to="/dashboard">Try it free</Link>
        </Button>
      </div>
    </section>
  );
};

export default SolutionSection;
import visualMaps from '@/images/visual-maps.png';
import aiInsights from '@/images/ai-insights.png';
import pdfNoteTaking from '@/images/pdf-note-taking.png';
import ownData from '@/images/own-data.png';
import { cn } from '@/lib/utils';

const benefits = [
  {
    image: visualMaps,
    title: "Visualize Your Knowledge",
    description: "Ditch linear notes. Notare’s infinite canvas lets you create dynamic, interconnected mind maps—so you can see the big picture and the details, all in one place."
  },
  {
    image: aiInsights,
    title: "AI-Powered Insights",
    description: "One-click summaries, smart highlights, and an AI assistant in every note. Spend less time reading, more time understanding."
  },
  {
    image: pdfNoteTaking,
    title: "Seamless PDF Integration",
    description: "Upload PDFs, highlight text, and turn key points into linked notes—automatically. Your research, simplified."
  },
  {
    image: ownData,
    title: "Own Your Data",
    description: "Export your notes as Markdown anytime. No lock-in, just pure knowledge portability."
  }
];

const KeyBenefits = () => {
  return (
    <section id="benefits" className="container py-20 md:py-24">
      <div className="flex flex-col gap-20 md:gap-32">
        {benefits.map((benefit, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Text content */}
            <div className={cn(
              "text-center md:text-left",
              index % 2 !== 0 && "md:order-last" // For odd items (2nd, 4th), move text to the right
            )}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{benefit.title}</h2>
              <p className="text-lg text-muted-foreground">{benefit.description}</p>
            </div>
            {/* Image */}
            <div>
              <img 
                src={benefit.image} 
                alt={benefit.title} 
                className="rounded-lg shadow-xl aspect-video object-cover border"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeyBenefits;
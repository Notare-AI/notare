import visualMaps from '@/images/visual-maps.png';
import aiInsights from '@/images/ai-insights.png';
import pdfNoteTaking from '@/images/pdf-note-taking.png';
import ownData from '@/images/own-data.png';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {benefits.map((benefit, index) => (
          <div key={index}>
            <img 
              src={benefit.image} 
              alt={benefit.title} 
              className="rounded-lg shadow-lg mb-6 aspect-video object-cover border"
            />
            <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
            <p className="text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeyBenefits;
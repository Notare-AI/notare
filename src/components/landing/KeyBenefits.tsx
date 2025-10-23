import { LayoutDashboard, BrainCircuit, FileText, Download } from 'lucide-react';

const benefits = [
  {
    icon: LayoutDashboard,
    title: "Visualize Your Knowledge",
    description: "Ditch linear notes. Notare’s infinite canvas lets you create dynamic, interconnected mind maps—so you can see the big picture and the details, all in one place."
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    description: "One-click summaries, smart highlights, and an AI assistant in every note. Spend less time reading, more time understanding."
  },
  {
    icon: FileText,
    title: "Seamless PDF Integration",
    description: "Upload PDFs, highlight text, and turn key points into linked notes—automatically. Your research, simplified."
  },
  {
    icon: Download,
    title: "Own Your Data",
    description: "Export your notes as Markdown anytime. No lock-in, just pure knowledge portability."
  }
];

const KeyBenefits = () => {
  return (
    <section id="benefits" className="container py-20 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {benefits.map((benefit, index) => (
          <div key={index} className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-4">
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <benefit.icon className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
            <p className="text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeyBenefits;
import { Check } from 'lucide-react';

const outcomes = [
  "Write your literature review 3× faster.",
  "See connections between papers instantly.",
  "Never lose track of your sources or ideas again."
];

const OutcomeSection = () => {
  return (
    <section id="outcomes" className="container py-20 md:py-24 bg-muted/50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold">Turn reading time into writing progress.</h2>
        </div>
        <div>
          <ul className="space-y-4">
            {outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-4 text-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mt-1">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-muted-foreground">{outcome}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 p-4 border-l-4 border-primary bg-background rounded-r-lg shadow">
            <p className="italic text-muted-foreground">"I finished my dissertation review a week earlier using Notare."</p>
            <p className="mt-2 font-semibold text-sm">— PhD candidate, UCL</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OutcomeSection;
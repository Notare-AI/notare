const steps = [
  {
    number: "1",
    title: "Upload & Highlight",
    description: "Drag and drop PDFs into your canvas. Highlight text to create notes linked back to the source."
  },
  {
    number: "2",
    title: "Ask & Expand",
    description: "Use the AI chat in any note to ask questions, summarize, or reformat ideas—like a research assistant at your fingertips."
  },
  {
    number: "3",
    title: "Connect & Discover",
    description: "Build relationships between ideas with edges and nodes. Zoom out to see patterns, zoom in to dive deep."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="container py-20 md:py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
        <p className="mt-4 text-lg text-muted-foreground">A simple 3-step process to clarity.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full text-xl font-bold mb-6">
              {step.number}
            </div>
            <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
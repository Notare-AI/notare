const faqs = [
  {
    question: "What makes Notare the best note taking app?",
    answer: "Notare combines AI insights, visual mapping, and PDF integration in one privacy-focused tool, solving scattered notes and manual analysis.",
  },
  {
    question: "Does Notare use AI for note taking?",
    answer: "Yes! Our AI generates summaries, key points, and references from PDFs without training on your data.",
  },
  {
    question: "Is Notare secure for sensitive notes?",
    answer: "Absolutely—end-to-end encryption, no data training, and secure sync across devices.",
  },
  {
    question: "Can I use Notare for PDF note taking?",
    answer: "Yes, upload PDFs, highlight text, and create connected notes directly on the canvas.",
  },
  {
    question: "How does Notare compare to other note taking apps?",
    answer: "Notare stands out with visual knowledge maps, AI-powered insights, and strong privacy features, making it ideal for visual thinkers and researchers.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="container py-20 md:py-24">
      <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions About Notare Note Taking App</h2>
      <div className="space-y-8 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h3 className="text-xl font-semibold">{faq.question}</h3>
            <p className="text-muted-foreground mt-2">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
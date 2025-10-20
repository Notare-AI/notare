import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: "How does Notare ensure I own my data?",
    answer: "With Notare, you have full ownership of your notes. You can download individual notes or entire branches as Markdown files at any time, ensuring no vendor lock-in and complete data portability."
  },
  {
    question: "Can I export my notes easily?",
    answer: "Absolutely! Notare allows one-click downloads for single nodes as Markdown, and you can export entire note branches for backups. Your data is always yours to take wherever you go."
  },
  {
    question: "What happens to my data if I cancel my subscription?",
    answer: "You retain full access to export and download all your notes even after cancellation. We believe in true data ownership—your information belongs to you, not us."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes, you control access, and with our export features, you can always move your data offline for added peace of mind."
  },
  {
    question: "How does Notare compare to other note-taking apps in terms of data ownership?",
    answer: "Unlike many apps that lock your data in proprietary formats, Notare uses standard Markdown exports, giving you freedom to use your notes in any tool or platform."
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="container py-20 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Frequently Asked Questions About Data Ownership
      </h2>
      
      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-xl font-semibold">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQ;
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Notare transformed how I study PDFs—AI summaries save me hours!",
    author: "Sarah, Student",
  },
  {
    quote: "The visual maps make project planning a breeze. Best AI note taking tool I've used.",
    author: "Mike, Professional",
  },
  {
    quote: "Privacy-focused and powerful—perfect for research without data worries.",
    author: "Dr. Elena, Researcher",
  },
];

const Testimonials = () => {
  return (
    <section className="container py-20 md:py-24 bg-muted/50">
      <h2 className="text-3xl font-bold text-center mb-12">What Users Say About the Best Note Taking App</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="p-6 rounded-lg bg-background shadow-md">
            <Quote className="h-8 w-8 text-primary mb-4" />
            <p className="italic mb-4">"{testimonial.quote}"</p>
            <p className="text-right text-sm text-muted-foreground">- {testimonial.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
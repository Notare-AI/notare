import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Notare transformed how I study, PDF—AI summaries save me hours!",
    author: "Sarah, Student",
    
  },
  {
    quote: "The visual maps make project planning a breeze. Best AI note taking tool I've used.",
    author: "Mike, Developer",
    
  },
  {
    quote: "Privacy-focused and perfect for research. I love that I can take my data & notes anywhere.",
    author: "Dr. Elena, Researcher",
   
  },
];

const Testimonials = () => {
  return (
    <section className="container py-20 md:py-24 bg-muted/50">
      <h2 className="text-3xl font-bold text-center mb-12">What Users Say About the Best Note Taking App</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="p-6 rounded-lg bg-background shadow-md flex flex-col">
            <div className="flex items-center mb-4">
              <img 
                src={testimonial.avatar} 
                alt={`${testimonial.author} avatar`} 
                className="h-12 w-12 rounded-full object-cover mr-4"
                loading="lazy"
              />
              <div>
                <p className="font-semibold">{testimonial.author}</p>
              </div>
            </div>
            <Quote className="h-8 w-8 text-primary mb-4 self-start" />
            <p className="italic mb-4 flex-grow">"{testimonial.quote}"</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
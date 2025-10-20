import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    author: "Sarah Chen",
    role: "UX Designer",
    content: "Notare has revolutionized how I organize my design ideas. The infinite canvas and AI insights have made my workflow so much more efficient. It's like having a super-powered digital whiteboard!",
    rating: 5,
  },
  {
    author: "Michael Rodriguez",
    role: "PHD student in History",
    content: "As an academic, I deal with complex topics daily. Notare's visual mapping and PDF integration have been game-changers for my research and lecture preparations. Highly recommended!",
    rating: 5,
  },
  {
    author: "Emily Watson",
    role: "Marketing Manager",
    content: "The AI-powered summaries save me hours every week. Combined with the intuitive interface, Notare has become an essential tool in my productivity arsenal.",
    rating: 5,
  },
  {
    author: "Alex Thompson",
    role: "Software Engineer",
    content: "I love how Notare handles technical notes and code snippets. The export features give me peace of mind knowing my data is always mine.",
    rating: 5,
  },
  {
    author: "Lisa Patel",
    role: "Freelance Writer",
    content: "From brainstorming articles to organizing research, Notare's flexible canvas has transformed my writing process. The premium features are worth every penny!",
    rating: 5,
  },
  {
    author: "James Lee",
    role: "Project Manager",
    content: "Managing team projects is easier with Notare's visual mapping. The ability to connect ideas and attach PDFs keeps everything in one place.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="container py-20 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        What Our Users Say About Notare
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className="bg-background p-6 rounded-xl shadow-lg border border-border/20 hover:shadow-xl transition-shadow"
          >
            <Quote className="h-8 w-8 text-primary mb-4 opacity-50" />
            
            <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
            
            <div className="mb-4">
              <h4 className="font-semibold">{testimonial.author}</h4>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </div>
            
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={cn(
                    "text-yellow-400",
                    i >= testimonial.rating && "text-muted-foreground/20"
                  )}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
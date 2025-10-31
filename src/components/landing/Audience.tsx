import { GraduationCap, Briefcase, BookOpen } from 'lucide-react';

const audiences = [
  {
    icon: GraduationCap,
    title: "For Students & Academics",
    description: "Speed up literature reviews, organize research, and ace exams by turning dense papers into visual, memorable maps."
  },
  {
    icon: Briefcase,
    title: "For Professionals",
    description: "Map out market research, technical docs, or project plans. Share insights with your team or keep them private."
  },
  {
    icon: BookOpen,
    title: "For Lifelong Learners",
    description: "Finally, a place to connect ideas from books, articles, and courses—so knowledge sticks."
  }
];

const Audience = () => {
  return (
    <section id="audience" className="container py-20 md:py-24 bg-muted/50 rounded-lg">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Who It’s For</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {audiences.map((audience, index) => (
          <div key={index} className="bg-background border rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-6">
              <audience.icon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">{audience.title}</h3>
            <p className="text-muted-foreground">{audience.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Audience;
import heroPreview from '@/images/hero-preview.png';

const DemoSection = () => {
  return (
    <section id="demo" className="container py-20 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">See Notare in action.</h2>
      </div>
      <div className="relative max-w-4xl mx-auto">
        <a href="#" aria-label="Watch demo video">
          <img src={heroPreview} alt="Notare demo" className="rounded-lg shadow-2xl border hover:ring-4 ring-primary transition-all" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
            <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-10 h-10 text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        </a>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium">
          From 5 papers to a literature map in 3 minutes.
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
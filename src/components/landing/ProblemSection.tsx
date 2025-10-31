const ProblemSection = () => {
  return (
    <section id="problem" className="container py-20 md:py-24 bg-muted/50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Research is slow because reading takes forever.</h2>
          <p className="text-lg text-muted-foreground">
            Every paper adds another layer of complexity. Synthesizing 20 sources into a coherent argument can take days. Notare cuts that process down to hours by extracting key ideas for you and showing how they connect.
          </p>
        </div>
        <div className="p-6 border rounded-lg bg-background shadow-lg">
          <h3 className="font-semibold text-center mb-4">Manual vs. AI-Powered</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-center mb-2 text-destructive">Chaos</h4>
              <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-md bg-destructive/5 h-full">Scattered highlights, messy notes, lost sources...</div>
            </div>
            <div>
              <h4 className="font-medium text-center mb-2 text-primary">Clarity</h4>
              <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-md bg-primary/5 h-full">Organized ideas, linked insights, clear arguments.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
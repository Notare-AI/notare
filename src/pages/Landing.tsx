import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import OutcomeSection from '@/components/landing/OutcomeSection';
import PricingSection from '@/components/landing/PricingSection';
import DemoSection from '@/components/landing/DemoSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <OutcomeSection />
        <PricingSection />
        <DemoSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
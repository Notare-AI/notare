import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import KeyBenefits from '@/components/landing/KeyBenefits';
import HowItWorks from '@/components/landing/HowItWorks';
import Audience from '@/components/landing/Audience';
import PricingPreview from '@/components/landing/PricingPreview';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <KeyBenefits />
        <HowItWorks />
        <Audience />
        <PricingPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
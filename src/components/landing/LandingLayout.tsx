import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
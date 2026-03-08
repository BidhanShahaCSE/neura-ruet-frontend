import LandingNavbar from '@/components/landing/LandingNavbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import RoleFeatures from '@/components/landing/RoleFeatures';
import RoleCTA from '@/components/landing/RoleCTA';
import LandingFooter from '@/components/landing/LandingFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-dark overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <LandingNavbar />
      <main>
        <Hero />
        <Features />
        <RoleFeatures />
        <RoleCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;

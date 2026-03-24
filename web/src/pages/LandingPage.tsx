import { useNavigate } from 'react-router';
import { useDemo } from '@/providers/DemoProvider';
import MeshGradient from '@/components/ui/MeshGradient';
import ParticleField from '@/components/landing/ParticleField';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Hero from '@/components/landing/Hero';
import FeatureCards from '@/components/landing/FeatureCards';
import HowItWorks from '@/components/landing/HowItWorks';
import CTASection from '@/components/landing/CTASection';

export default function LandingPage() {
  const navigate = useNavigate();
  const { enterDemo } = useDemo();

  const handleViewDemo = () => {
    enterDemo();
    navigate('/app/dashboard');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-primary transition-colors duration-300">
      <MeshGradient />
      <ParticleField />
      <ThemeToggle />
      <div className="relative z-10">
        <Hero onViewDemo={handleViewDemo} />
        <FeatureCards />
        <HowItWorks />
        <CTASection onViewDemo={handleViewDemo} />
      </div>
    </div>
  );
}

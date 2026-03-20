import { useNavigate } from 'react-router';
import { useDemo } from '@/providers/DemoProvider';

export default function DemoBar() {
  const { isDemo, exitDemo } = useDemo();
  const navigate = useNavigate();

  if (!isDemo) return null;

  const handleExit = () => {
    exitDemo();
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[rgba(124,92,255,0.1)] border-b border-[rgba(124,92,255,0.2)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-accent font-medium">
          Demo Mode — Explore with sample data
        </span>
        <button
          onClick={handleExit}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          Exit Demo
        </button>
      </div>
    </div>
  );
}

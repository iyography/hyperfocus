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
    <div className="sticky top-0 z-50 bg-[rgba(124,92,255,0.1)] border-b border-[rgba(124,92,255,0.2)] backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-accent font-medium">
            Demo Mode — Exploring with sample data
          </span>
        </div>
        <button
          onClick={handleExit}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-[rgba(28,28,39,0.8)]"
        >
          Exit Demo
        </button>
      </div>
    </div>
  );
}

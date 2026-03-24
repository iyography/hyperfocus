import { cn } from '@/lib/cn';

interface MeshGradientProps {
  className?: string;
}

export default function MeshGradient({ className }: MeshGradientProps) {
  return (
    <>
      {/* Aurora blobs */}
      <div
        className={cn('fixed inset-0 pointer-events-none -z-10 overflow-hidden', className)}
        aria-hidden
      >
        {/* Purple aurora */}
        <div
          className="absolute left-1/4 top-1/4 w-[500px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: 'var(--aurora-purple)',
            animation: 'aurora-1 12s ease-in-out infinite',
          }}
        />
        {/* Cyan aurora */}
        <div
          className="absolute right-1/4 top-1/3 w-[400px] h-[500px] rounded-full blur-[100px]"
          style={{
            background: 'var(--aurora-cyan)',
            animation: 'aurora-2 15s ease-in-out infinite',
          }}
        />
        {/* Pink aurora */}
        <div
          className="absolute left-1/3 bottom-1/4 w-[350px] h-[450px] rounded-full blur-[110px]"
          style={{
            background: 'var(--aurora-pink)',
            animation: 'aurora-3 18s ease-in-out infinite',
          }}
        />
        {/* Amber aurora */}
        <div
          className="absolute right-1/3 top-1/2 w-[300px] h-[400px] rounded-full blur-[130px]"
          style={{
            background: 'var(--aurora-amber)',
            animation: 'aurora-1 20s ease-in-out infinite reverse',
          }}
        />
      </div>
      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden />
    </>
  );
}

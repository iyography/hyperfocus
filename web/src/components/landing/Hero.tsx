import { motion } from 'motion/react';
import Button from '@/components/ui/Button';

interface HeroProps {
  onViewDemo: () => void;
}

export default function Hero({ onViewDemo }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 max-w-3xl mx-auto flex flex-col items-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card glass border border-card-border text-sm text-secondary mb-8 shadow-card"
        >
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Built for ADHD entrepreneurs
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="text-gradient">Hyper</span>
          <span className="text-foreground">focus</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl sm:text-2xl md:text-3xl text-secondary max-w-2xl mx-auto mb-4 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Your daily focus engine. One task. One session. Real progress.
        </motion.p>

        {/* Sub-tagline */}
        <motion.p
          className="text-sm sm:text-base text-muted max-w-lg mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Stop managing tasks. Start finishing them. Hyperfocus helps you choose the most
          important thing, lock in, and get it done.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Button size="lg" onClick={onViewDemo} className="w-full sm:w-auto min-w-[160px]">
            View Demo
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[160px]">
            Sign Up Free
          </Button>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto min-w-[120px]">
            Log In
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-themed-border flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-secondary" />
        </motion.div>
      </motion.div>
    </section>
  );
}

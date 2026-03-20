import { motion } from 'motion/react';
import Button from '@/components/ui/Button';

interface HeroProps {
  onViewDemo: () => void;
}

export default function Hero({ onViewDemo }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Glow orb behind title */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(124,92,255,0.08)] blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(19,19,26,0.7)] border border-[rgba(42,42,58,0.5)] text-sm text-text-secondary mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Built for ADHD entrepreneurs
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="bg-gradient-to-r from-white via-accent to-purple-400 bg-clip-text text-transparent">
            Hyper
          </span>
          <span className="text-text-primary">focus</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Your daily focus engine. One task. One session. Real progress.
        </motion.p>

        <motion.p
          className="text-sm sm:text-base text-[#666680] max-w-lg mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Stop managing tasks. Start finishing them. Hyperfocus helps you choose the most
          important thing, lock in, and get it done.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Button size="lg" onClick={onViewDemo}>
            View Demo
          </Button>
          <Button variant="secondary" size="lg">
            Sign Up
          </Button>
          <Button variant="ghost" size="lg">
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
          className="w-6 h-10 rounded-full border-2 border-border flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-text-secondary" />
        </motion.div>
      </motion.div>
    </section>
  );
}

import { motion } from 'motion/react';
import Button from '@/components/ui/Button';

interface CTASectionProps {
  onViewDemo: () => void;
}

export default function CTASection({ onViewDemo }: CTASectionProps) {
  return (
    <section className="relative py-24 px-6">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass rounded-3xl p-12 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,92,255,0.05)] to-transparent pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
            Ready to{' '}
            <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
              lock in
            </span>
            ?
          </h2>
          <p className="text-text-secondary text-lg mb-8 relative z-10">
            See how Hyperfocus transforms your daily workflow. Try the interactive demo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button size="lg" onClick={onViewDemo}>
              View Demo
            </Button>
            <Button variant="secondary" size="lg">
              Sign Up Free
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center mt-16 text-[rgba(136,136,160,0.5)] text-sm">
        <p>Built with focus, for focus.</p>
      </div>
    </section>
  );
}

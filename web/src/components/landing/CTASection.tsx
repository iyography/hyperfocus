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
        <div className="bg-card glass border border-card-border rounded-3xl p-12 relative overflow-hidden shadow-elevated">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-accent/[0.05] blur-[60px] pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10 text-foreground">
            Ready to{' '}
            <span className="text-gradient">lock in</span>
            ?
          </h2>
          <p className="text-secondary text-lg mb-8 relative z-10">
            See how Hyperfocus transforms your daily workflow. Try the interactive demo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button size="lg" onClick={onViewDemo} className="min-w-[160px]">
              View Demo
            </Button>
            <Button variant="secondary" size="lg" className="min-w-[160px]">
              Sign Up Free
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center mt-16 text-muted text-sm">
        <p>Built with focus, for focus.</p>
      </div>
    </section>
  );
}

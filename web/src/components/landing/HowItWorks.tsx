import { motion } from 'motion/react';

const steps = [
  {
    number: '01',
    title: 'Check In',
    description: '"What would make today a win?" Pick the one task that matters most.',
  },
  {
    number: '02',
    title: 'Break It Down',
    description: 'Too big? Break it into the tiniest first step you can start right now.',
  },
  {
    number: '03',
    title: 'Lock In',
    description: 'Start your focus session. We handle distractions so you can do the work.',
  },
  {
    number: '04',
    title: 'Level Up',
    description: 'Earn XP, build streaks, and share your wins. Repeat tomorrow.',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Simple by <span className="text-accent">design</span>
        </h2>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          Not another task manager. A daily focus ritual in 4 steps.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            className="flex gap-6 mb-12 last:mb-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.2)] flex items-center justify-center text-accent font-bold text-sm">
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="w-px h-12 bg-border mx-auto mt-3" />
              )}
            </div>
            <div className="pt-2">
              <h3 className="text-xl font-semibold text-text-primary mb-1">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

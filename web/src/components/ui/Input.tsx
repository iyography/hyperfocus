import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm text-text-secondary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-bg-elevated border border-border rounded-xl px-4 py-3',
            'text-text-primary placeholder:text-[rgba(136,136,160,0.5)]',
            'focus:outline-none focus:border-accent focus:shadow-[0_0_15px_var(--color-accent-glow)]',
            'transition-all duration-200',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;

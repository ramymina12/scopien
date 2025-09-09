import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {}

export function Spinner({ size }: SpinnerProps) {
  return <Loader className={cn(spinnerVariants({ size }))} />;
}

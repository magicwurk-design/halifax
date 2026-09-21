import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-bright/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:     'btn-primary',
        destructive: 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25',
        outline:     'btn-ghost',
        secondary:   'bg-white/5 text-white/60 border border-white/9 hover:bg-white/8 hover:text-white/85',
        ghost:       'text-white/45 hover:text-white/75 hover:bg-white/5',
        link:        'text-blue-bright underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-8 rounded-lg px-3 text-xs',
        lg:      'h-12 rounded-xl px-6',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant:'default', size:'default' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild=false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>;
  }
);
Button.displayName = 'Button';
export { Button, buttonVariants };
